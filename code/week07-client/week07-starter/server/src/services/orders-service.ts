import * as ordersRepository from '../db/orders-repository.js';
import * as productsRepository from '../db/products-repository.js';
import { ConflictError, ValidationError } from '../errors.js';
import type { Order, OrderItem, OrderRequestItem } from '../models/order.js';
import type { Product } from '../models/product.js';
import type { Role } from '../models/user.js';

// Who is asking, as far as their token says.
type Caller = {
  id: string;
  username: string;
  role: Role;
};

const checkItems = (items: OrderRequestItem[]): void => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('An order needs at least one item');
  }
  for (const item of items) {
    if (typeof item.productId !== 'string') {
      throw new ValidationError('Every item needs a productId');
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new ValidationError('quantity must be a whole number, 1 or more');
    }
  }
};

// #region place
export const placeOrder = async (
  caller: Caller,
  items: OrderRequestItem[]
): Promise<Order> => {
  checkItems(items);

  // Look every product up, and check there's enough of it, before changing
  // anything. That makes an order all or nothing. The names and prices come
  // from here, never from the request.
  const products: Product[] = [];
  for (const item of items) {
    const product = await productsRepository.findProduct(item.productId);
    if (!product) {
      throw new ValidationError(`No product with id ${item.productId}`);
    }
    if (product.quantity < item.quantity) {
      throw new ConflictError(`Not enough ${product.modelName} in stock`);
    }
    products.push(product);
  }

  // Validation and quantity checks passed. Deplete the stock.
  for (let i = 0; i < items.length; i++) {
    await productsRepository.takeStock(products[i].id, items[i].quantity);
  }

  // Flesh out the OrderItems. The OrderRequestItems we got only
  // contain the product ID and quantity. We got the other info
  // from the repository and can add it to the order.
  const orderItems: OrderItem[] = items.map((item, i) => ({
    productId: products[i].id,
    modelName: products[i].modelName,
    quantity: item.quantity,
    price: products[i].price
  }));

  // add up the total
  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return ordersRepository.insertOrder({
    customerId: caller.id,
    customerUsername: caller.username,
    items: orderItems,
    total: Math.round(total * 100) / 100,
    status: 'placed',
    createdAt: new Date().toISOString()
  });
};
// #endregion place

// #region list
// Staff see every order; a customer sees only their own.
export const listOrdersFor = async (caller: Caller): Promise<Order[]> => {
  if (caller.role === 'staff') {
    return ordersRepository.findOrders({});
  }
  return ordersRepository.findOrders({ customerId: caller.id });
};
// #endregion list

// #region fulfill
// placed -> fulfilled. Returns null if there's no such order.
export const fulfillOrder = async (id: string): Promise<Order | null> => {
  const updated = await ordersRepository.changeStatus(id, 'placed', 'fulfilled');
  if (updated) {
    return updated;
  }
  // It didn't change: either it doesn't exist, or it was already fulfilled.
  const existing = await ordersRepository.findOrder(id);
  if (!existing) {
    return null;
  }
  throw new ConflictError('That order is already fulfilled');
};
// #endregion fulfill
