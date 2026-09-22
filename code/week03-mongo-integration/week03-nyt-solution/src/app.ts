import express from 'express';
import type { Request, Response } from 'express';
import { productRouter } from './product-router.js';

const app = express();

app.use(express.json());
app.use('/products', productRouter);

app.get('/greeting', (req: Request, res: Response): void => {
  res.send('Hello World!');
});

export { app };
