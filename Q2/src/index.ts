import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import bankRouter from './bank/bank.router';
import errorHandler from './middleware/errorHandler';
import { swaggerSpec } from './swagger/swagger.config';
const app = express()
const port = 3000

app.use(express.json());
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/bank', bankRouter)
app.use(errorHandler);

app.get('/', (_req: Request, res: Response) => res.send({ ok: true }));

app.listen(port, () => {
    console.log(`
 Meepshop Assigment : Simple Bank System \b
|--------------------------------------------------------|
 Shortcut: \b
 API Server url : http://localhost:3000 \b
 Swagger API Documentation : http://localhost:3000/swagger \b
 Test coverage report url : http://localhost:8080
|--------------------------------------------------------|
`);
});
