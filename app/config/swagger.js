const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

module.exports = (app) => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation using Swagger',
        version: '0.1.0',
        description:
          'This is a simple CRUD API application made with Express and documented with Swagger',
        license: {
          name: 'ISC',
          url: 'https://www.isc.org/licenses/',
        },
        contact: {
          name: 'Doni Rahma Tiana',
          email: 'donirahmatiana@gmail.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000/books',
        },
      ],
    },
    apis: ['./routes/books.js'],
  };

  const specs = swaggerJsdoc(options);

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true }),
  );
};
