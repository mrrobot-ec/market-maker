import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Global Mid-Price API',
            version: '1.0.0',
            description: 'API to fetch the global mid-price from different exchanges',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
    },
    apis: ['./src/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
