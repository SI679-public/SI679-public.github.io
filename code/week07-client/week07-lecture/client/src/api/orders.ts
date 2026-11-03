// Orders: customers place them and see their own; staff see all of them and
// fulfill them.
//
// Right now these use the sample orders in memory. In class we replace each
// function body with a request to the server: POST /orders, GET /orders and
// PATCH /orders/:id/status.

import type { NewOrderItem, Order } from '../types.ts';
import { delay, nextId, sampleOrders, sampleProducts } from './sample-data.ts';
import { getUser } from './session.ts';

// Customers only. The whole order succeeds or none of it does.
export const placeOrder = async (items: NewOrderItem[]): Promise<Order> => {
  await delay();
  const user = getUser();
  if (user?.role !== 'customer') {
    throw new Error('Only customer may do this');
  }
  if (items.length === 0) {
    throw new Error('An order needs at least one item');
  }

  // Check everything first...
  const lines = items.map((item) => {
    const product = sampleProducts.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error('Product not found');
    }
    if (product.quantity < item.quantity) {
      throw new Error(`Not enough ${product.modelName} in stock`);
    }
    return { product, quantity: item.quantity };
  });

  // ...then change anything.
  for (const line of lines) {
    line.product.quantity -= line.quantity;
  }

  const order: Order = {
    id: nextId('o'),
    customerUsername: user.username,
    items: lines.map((line) => ({
      productId: line.product.id,
      modelName: line.product.modelName,
      quantity: line.quantity,
      price: line.product.price
    })),
    total:
      Math.round(
        lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0) * 100
      ) / 100,
    status: 'placed',
    createdAt: new Date().toISOString()
  };
  sampleOrders.push(order);
  return structuredClone(order);
};

// #region get-orders
// Staff get every order; a customer gets only their own.
export const getOrders = async (): Promise<Order[]> => {
  await delay();
  const user = getUser();
  if (!user) {
    throw new Error('No token');
  }
  const visible =
    user.role === 'staff'
      ? sampleOrders
      : sampleOrders.filter((o) => o.customerUsername === user.username);
  return structuredClone(visible);
};
// #endregion get-orders

// Staff only. Moves an order from placed to fulfilled.
export const fulfillOrder = async (id: string): Promise<Order> => {
  await delay();
  if (getUser()?.role !== 'staff') {
    throw new Error('Only staff may do this');
  }
  const order = sampleOrders.find((o) => o.id === id);
  if (!order) {
    throw new Error('Order not found');
  }
  if (order.status !== 'placed') {
    throw new Error('That order is already fulfilled');
  }
  order.status = 'fulfilled';
  return structuredClone(order);
};
