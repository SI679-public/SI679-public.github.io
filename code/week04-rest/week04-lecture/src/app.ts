import express from 'express';
import { productRouter } from './routes/product-routes.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(express.json());
app.use('/products', productRouter);

// Error handlers go LAST, after every route. Express runs middleware in the
// order it was registered, so one registered before the routes never sees
// what they throw.
app.use(errorHandler);

export { app };
