import express from 'express';
import swaggerUi from 'swagger-ui-express';
import bankRouter from './bank/bank.router';
import errorHandler from './middleware/errorHandler';
import { swaggerSpec } from './swagger/swagger.config';
const app = express()
const port = 3000

app.use(express.json());
app.use(express.static('public'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/bank', bankRouter)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`
 Meepshop Assigment : Simple Bank System \b
|--------------------------------------------------------|
 Shortcut: \b
 Frontend for test : http://localhost:3000 \b
 API : http://localhost:3000/api/bank \b
 Swagger API documentation : http://localhost:3000/swagger \b
 Test coverage report url : http://localhost:8080
|--------------------------------------------------------|
`);
});
