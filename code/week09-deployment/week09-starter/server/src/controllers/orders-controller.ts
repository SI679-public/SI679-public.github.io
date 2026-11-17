import type { Request, Response } from 'express';
import * as ordersService from '../services/orders-service.js';
import { ValidationError } from '../errors.js';

// The caller comes from the token that requireJwt checked, never from the
// request body.
const callerFrom = (res: Response) => ({
  id: res.locals.user.sub,
  username: res.locals.user.username,
  role: res.locals.user.role
});

export const postOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const order = await ordersService.placeOrder(
    callerFrom(res),
    req.body?.items
  );
  res.status(201).json(order);
};

export const getOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.json(await ordersService.listOrdersFor(callerFrom(res)));
};

export const patchOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (req.body?.status !== 'fulfilled') {
    throw new ValidationError('status must be "fulfilled"');
  }
  const order = await ordersService.fulfillOrder(String(req.params.id));
  if (!order) {
    res.status(404).json({ error: 'No order with that id' });
    return;
  }
  res.json(order);
};
