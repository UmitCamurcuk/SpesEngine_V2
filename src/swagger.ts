import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const setupSwagger = (app: Express) => {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'MDM/CPD ERP API',
        version: '1.0.0',
        description: 'ItemType - Category - Family hierarchy with associations',
      },
      servers: [{ url: '/'}],
      tags: [
        { name: 'ItemType' },
        { name: 'Category' },
        { name: 'Family' },
        { name: 'Association' },
        { name: 'Attribute' },
        { name: 'AttributeGroup' },
      ],
    },
    apis: ['src/routes/*.ts'],
  };

  const specs = swaggerJsdoc(options);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
};
