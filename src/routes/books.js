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

router.post('/', authenticate, createBookRules, controller.createBook);
router.get('/', controller.getBooks);
router.get('/seller/:sellerId', controller.getBooksBySeller);
router.get('/:id', controller.getBookById);
router.put('/:id', authenticate, updateBookRules, controller.updateBook);
router.delete('/:id', authenticate, controller.deleteBook);
router.patch('/:id/status', authenticateInternal, controller.updateBookStatus);

module.exports = router;