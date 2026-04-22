const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ReRead — book-listing',
            version: '1.0.0',
            description: 'User registration, authentication, and profile management',
        },
        servers: [
            {
                url: 'https://book-listing-service.onrender.com',
                description: 'Production Server'
            },
            {
                url: 'http://localhost:3002',
                description: 'Local Development'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                internalKeyAuth: { type: 'apiKey', in: 'header', name: 'x-internal-key' }
            },
        },
    },
    apis: ['./src/routes/*.js'],
});