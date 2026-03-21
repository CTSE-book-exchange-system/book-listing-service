require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
app.use(express.json());

// Routes
app.use('/api/books', require('./routes/books'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'book-listing-service' });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Book Listing Service running on port ${PORT}`);
});

const db = require('./db');
db.query('SELECT NOW()').then(r => {
    console.log('Database connected:', r.rows[0].now);
}).catch(err => {
    console.error('Database connection failed:', err.message);
});

module.exports = app; // for tests