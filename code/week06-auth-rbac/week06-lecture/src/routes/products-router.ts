import express from 'express';
import * as productsController from '../controllers/products-controller.js';
import { requireJwt } from '../middleware/require-jwt.js';
import { requireRole } from '../middleware/require-role.js';

export const productsRouter = express.Router();

productsRouter.get('/', productsController.getProducts);
productsRouter.get('/:id', productsController.getProduct);
productsRouter.post(
  '/',
  requireJwt,
  requireRole('staff'),
  productsController.postProduct
);
productsRouter.patch('/:id', productsController.patchProduct);
productsRouter.delete('/:id', productsController.deleteProduct);
