import express, { Request, Response } from 'express';
import bankRouter from './bank/bank.router';
import errorHandler from './middleware/errorHandler';
const app = express()
const port = 3000

app.use(express.json());
app.use('/api/bank', bankRouter)
app.use(errorHandler);

app.get('/', (req: Request, res: Response) => res.send({ ok: true }));

app.listen(port, () => {
});
