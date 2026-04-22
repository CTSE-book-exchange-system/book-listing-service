const express = require('express');
const { body } = require('express-validator');
const { authenticate, authenticateInternal } = require('../middleware/auth');
const controller = require('../controllers/books');

const router = express.Router();

const createBookRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('condition')
        .isIn(['good', 'fair', 'poor'])
        .withMessage('Condition must be good, fair, or poor'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
];

const updateBookRules = [
    body('condition')
        .optional()
        .isIn(['good', 'fair', 'poor'])
        .withMessage('Condition must be good, fair, or poor'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
];

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book listing and management
 */

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book listing
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, condition]
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               condition:
 *                 type: string
 *                 enum: [good, fair, poor]
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Book listed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, createBookRules, controller.createBook);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books (with optional filters and pagination)
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (max 50)
 *     responses:
 *       200:
 *         description: Books fetched successfully
 */
router.get('/', controller.getBooks);

/**
 * @swagger
 * /api/books/seller/{sellerId}:
 *   get:
 *     summary: Get all books by a specific seller
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller books fetched successfully
 */
router.get('/seller/:sellerId', controller.getBooksBySeller);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book fetched successfully
 *       404:
 *         description: Book not found
 */
router.get('/:id', controller.getBookById);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book listing
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               condition:
 *                 type: string
 *                 enum: [good, fair, poor]
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       403:
 *         description: Not your listing
 *       404:
 *         description: Book not found
 */
router.put('/:id', authenticate, updateBookRules, controller.updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book listing
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book removed successfully
 *       403:
 *         description: Not your listing
 *       404:
 *         description: Book not found
 */
router.delete('/:id', authenticate, controller.deleteBook);

/**
 * @swagger
 * /api/books/{id}/status:
 *   patch:
 *     summary: Update book status (internal only)
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, reserved, sold]
 *     responses:
 *       200:
 *         description: Book status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Book not found
 */
router.patch('/:id/status', authenticateInternal, controller.updateBookStatus);

module.exports = router;