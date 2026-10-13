import express from 'express';
import * as productsController from '../controllers/products-controller.js';

export const productsRouter = express.Router();

productsRouter.get('/', productsController.getProducts);
productsRouter.get('/:id', productsController.getProduct);
productsRouter.post('/', productsController.postProduct);
productsRouter.patch('/:id', productsController.patchProduct);
productsRouter.delete('/:id', productsController.deleteProduct);
