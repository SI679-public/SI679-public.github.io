import express from 'express';
import { productsRouter } from './routes/products-router.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(express.json());
app.use('/products', productsRouter);
app.use(errorHandler);

export { app };
