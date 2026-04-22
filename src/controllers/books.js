const { validationResult } = require('express-validator');
const bookModel = require('../models/booksModel');

const isOwner = (req, book) => req.user?.userId === book.seller_id;

exports.createBook = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: errors.array()[0].msg,
                statusCode: 400,
            });
        }

        const book = await bookModel.createBook({
            sellerId: req.user.userId,
            sellerName: req.user.name,
            sellerUniversity: req.user.university,
            ...req.body,
        });

        try {
            const { publish } = require('../messaging/publisher');
            await publish('book.listed', {
                bookId: book.id,
                sellerId: book.seller_id,
                sellerName: book.seller_name,
                title: book.title,
                university: book.seller_university,
            });
        } catch (e) {
            console.warn('RabbitMQ not available, skipping event:', e.message);
        }

        return res.status(201).json({
            success: true,
            data: book,
            message: 'Book listed successfully',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            statusCode: 500,
        });
    }
};

exports.getBooks = async (req, res) => {
    try {
        const { page, limit, ...filters } = req.query;
        const p = Math.max(1, parseInt(page) || 1);
        const l = Math.min(50, Math.max(1, parseInt(limit) || 20));
        const { books, total } = await bookModel.findAll(filters, { page: p, limit: l });

        return res.json({
            success: true,
            data: {
                books,
                pagination: {
                    page: p,
                    limit: l,
                    total,
                    pages: Math.ceil(total / l),
                },
            },
            message: 'Books fetched successfully',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            statusCode: 500,
        });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found',
                statusCode: 404,
            });
        }
        return res.json({
            success: true,
            data: book,
            message: 'Book fetched successfully',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            statusCode: 500,
        });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: errors.array()[0].msg,
                statusCode: 400,
            });
        }

        const existing = await bookModel.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Book not found',
                statusCode: 404,
            });
        }
        if (!isOwner(req, existing)) {
            return res.status(403).json({
                success: false,
                error: 'You can only update your own listings',
                statusCode: 403,
            });
        }
        if (['reserved', 'sold'].includes(existing.status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot update a book that is ${existing.status}`,
                statusCode: 400,
            });
        }

        const book = await bookModel.updateBook(req.params.id, req.body);
        return res.json({
            success: true,
            data: book,
            message: 'Book updated successfully',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            statusCode: 500,
        });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const existing = await bookModel.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Book not found',
                statusCode: 404,
            });
        }
        if (!isOwner(req, existing)) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own listings',
                statusCode: 403,
            });
        }

        await bookModel.removeBook(req.params.id);

        try {
            const { publish } = require('../messaging/publisher');
            await publish('book.unlisted', { bookId: req.params.id });
        } catch (e) {
            console.warn('RabbitMQ not available, skipping event:', e.message);
        }

        return res.json({
            success: true,
            message: 'Book removed successfully',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            statusCode: 500,
        });
    }
};

exports.getBooksBySeller = async (req, res) => {
    try {
        const books = await bookModel.findBySellerId(req.params.sellerId);
        return res.json({
            success: true,
            data: books,
            message: 'Seller books fetched successfully',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            statusCode: 500,
        });
    }
};

exports.updateBookStatus = async (req, res) => {
    try {
        const allowed = ['available', 'reserved', 'sold'];
        if (!allowed.includes(req.body.status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value',
                statusCode: 400,
            });
        }

        const book = await bookModel.updateStatus(req.params.id, req.body.status);
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found',
                statusCode: 404,
            });
        }

        return res.json({
            success: true,
            data: book,
            message: 'Book status updated successfully',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            statusCode: 500,
        });
    }
};