// generate-token.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test User',
        university: 'Test University',
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

console.log(token);