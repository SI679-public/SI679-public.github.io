import express from 'express';
import { productControllers } from '../controllers/product-controllers.js';

export const productRouter = express.Router();

productRouter.get('/', productControllers.getProducts);
// Now You Try #1
productRouter.get('/:id', productControllers.getProduct);
productRouter.post('/', productControllers.addProduct);
// Now You Try #1 stretch
productRouter.delete('/:id', productControllers.deleteProduct);
