const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const isRemoteConnection = connectionString && !connectionString.includes('@localhost:');

const pool = connectionString
    ? new Pool({
        connectionString,
        ssl: isRemoteConnection ? { rejectUnauthorized: false } : false,
    })
    : new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

module.exports = {
    query: (text, params) => pool.query(text, params),
};