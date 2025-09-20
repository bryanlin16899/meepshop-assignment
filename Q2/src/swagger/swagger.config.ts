import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Simple Banking System API',
      version: '1.0.0',
    },
  }, 
  apis: [path.join(__dirname, 'swagger.yaml')],
};

export const swaggerSpec = swaggerJSDoc(options);