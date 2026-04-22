require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

const app = express();

// Security middleware
app.use(helmet());
const { randomUUID } = require('crypto');

app.use((req, res, next) => {
    const requestId = randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
});
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/books', require('./routes/books'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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