import express, { Request, Response } from 'express';
import bankRouter from './bank/bank.router';
const app = express()
const port = 3000

app.use(express.json());
app.use('/api', bankRouter)

app.get('/', (req: Request, res: Response) => res.send({ ok: true }));

app.listen(port, () => {
    console.log(`Hello World`)
});