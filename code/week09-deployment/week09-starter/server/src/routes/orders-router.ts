import express from 'express';
import * as ordersController from '../controllers/orders-controller.js';
import { requireJwt } from '../middleware/require-jwt.js';
import { requireRole } from '../middleware/require-role.js';

export const ordersRouter = express.Router();

// Customers place orders.
ordersRouter.post(
  '/',
  requireJwt,
  requireRole('customer'),
  ordersController.postOrder
);

// Anyone logged in: staff get every order, customers get their own.
ordersRouter.get('/', requireJwt, ordersController.getOrders);

// Staff fulfill them.
ordersRouter.patch(
  '/:id/status',
  requireJwt,
  requireRole('staff'),
  ordersController.patchOrderStatus
);
