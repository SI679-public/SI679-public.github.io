// Orders: customers place them and see their own; staff see all of them and
// fulfill them.
//
// All of these talk to the server: POST /orders, GET /orders and
// PATCH /orders/:id/status.

import type { NewOrderItem, Order } from '../types.ts';
import { apiFetch } from './client.ts';

// Customers only. The whole order succeeds or none of it does.
// #region place-order
export const placeOrder = async (items: NewOrderItem[]): Promise<Order> => {
  // Now You Try
  return apiFetch('/orders', { method: 'POST', body: { items } });
};
// #endregion place-order

// #region get-orders
// Staff get every order; a customer gets only their own.
export const getOrders = async (): Promise<Order[]> => {
  // Now You Try
  return apiFetch('/orders');
};
// #endregion get-orders

// Staff only. Moves an order from placed to fulfilled.
export const fulfillOrder = async (id: string): Promise<Order> => {
  // Now You Try
  return apiFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    body: { status: 'fulfilled' }
  });
};
