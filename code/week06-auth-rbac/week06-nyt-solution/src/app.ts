import express from 'express';
import { productsRouter } from './routes/products-router.js';
import { authRouter } from './routes/auth-router.js';
import { usersRouter } from './routes/users-router.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(express.json());
app.use('/products', productsRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use(errorHandler);

export { app };
