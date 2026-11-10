import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as ordersService from './orders-service.js';
import * as ordersRepository from '../db/orders-repository.js';
import * as productsRepository from '../db/products-repository.js';
import * as notifier from '../sockets/notifier.js';
import type { Order } from '../models/order.js';
import type { Product } from '../models/product.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

const caller = {
  id: '650000000000000000000002',
  username: 'ada',
  role: 'customer' as const
};

const kettle: Product = {
  id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
  modelName: 'Kettle',
  modelNumber: 'K-1',
  manufacturer: 'Test',
  color: 'Black',
  price: 20,
  quantity: 3
};

// Stretch Now You Try: the service tells the notifier -- and only when it
// should. No database, no socket server: the repositories are mocked, and
// the notifier is spied on.
describe('placeOrder and the notifier', () => {
  // #region spy-notifier
  it('tells the staff about an order once it is saved', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(kettle);
    vi.spyOn(productsRepository, 'takeStock').mockResolvedValue();
    vi.spyOn(ordersRepository, 'insertOrder').mockImplementation(
      async (order) => ({ id: 'bbbbbbbbbbbbbbbbbbbbbbbb', ...order }) as Order
    );
    const orderCreated = vi.spyOn(notifier, 'orderCreated');

    const order = await ordersService.placeOrder(caller, [
      { productId: kettle.id, quantity: 2 }
    ]);

    expect(orderCreated).toHaveBeenCalledOnce();
    expect(orderCreated).toHaveBeenCalledWith(order);
  });
  // #endregion spy-notifier

  it('tells nobody when there is not enough stock', async () => {
    vi.spyOn(productsRepository, 'findProduct').mockResolvedValue(kettle);
    const takeStock = vi.spyOn(productsRepository, 'takeStock');
    const orderCreated = vi.spyOn(notifier, 'orderCreated');
    const productUpdated = vi.spyOn(notifier, 'productUpdated');

    await expect(
      ordersService.placeOrder(caller, [{ productId: kettle.id, quantity: 5 }])
    ).rejects.toThrow('Not enough Kettle in stock');

    expect(takeStock).not.toHaveBeenCalled();
    expect(orderCreated).not.toHaveBeenCalled();
    expect(productUpdated).not.toHaveBeenCalled();
  });
});
