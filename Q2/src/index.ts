import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import bankRouter from './bank/bank.router';
import errorHandler from './middleware/errorHandler';
const swaggerDocument = require('../swagger.json');
const app = express()
const port = 3000

app.use(express.json());
app.use('/api/bank', bankRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorHandler);

app.get('/', (req: Request, res: Response) => res.send({ ok: true }));

app.listen(port, () => {
    console.log(`
        Meepshop Assigment : Simple Bank System \n

        Shortcut: \n
        API Server url : http://localhost:3000 \n
        API Documentation url : http://localhost:3000/api-docs \n
        Test coverage report url : http://localhost:8080
        `);

});
