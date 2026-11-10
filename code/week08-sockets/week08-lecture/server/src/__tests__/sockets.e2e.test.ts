import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, disconnect } from '../db/db.js';
import * as productsRepository from '../db/products-repository.js';
import * as ordersRepository from '../db/orders-repository.js';
import type { Order } from '../models/order.js';
import type { Product } from '../models/product.js';
import { testProducts } from './test-products.js';
import {
  connectAs,
  heardWithin,
  listenFor,
  startTestServer,
  stopTestServer,
  tokenFor
} from './socket-helpers.js';

// #region setup
// End to end, sockets and all: our server running for real, and test
// clients connecting to it the way browsers do.
let mongo: MongoMemoryServer;
let url: string;
let braun: Product;

const staffToken = tokenFor('650000000000000000000001', 'tester', 'staff');
const adaToken = tokenFor('650000000000000000000002', 'ada', 'customer');
const boToken = tokenFor('650000000000000000000003', 'bo', 'customer');

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connect(mongo.getUri(), 'test');
  url = await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
  await disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await ordersRepository._clearOrders();
  await productsRepository._clearProducts();
  for (const product of testProducts) {
    const saved = await productsRepository.insertProduct(product);
    if (saved.manufacturer === 'Braun') {
      braun = saved;
    }
  }
});

// These act over HTTP, the way the client does, and give back what the
// server sent: the order or product as it is now.

// ada orders one Braun coffee maker.
const adaPlacesOrder = async (): Promise<Order> => {
  const res = await request(url)
    .post('/orders')
    .set('Authorization', `Bearer ${adaToken}`)
    .send({ items: [{ productId: braun.id, quantity: 1 }] });
  return res.body;
};

// Staff fulfill the order with this id.
const staffFulfills = async (orderId: string): Promise<Order> => {
  const res = await request(url)
    .patch(`/orders/${orderId}/status`)
    .set('Authorization', `Bearer ${staffToken}`)
    .send({ status: 'fulfilled' });
  return res.body;
};

// Staff add `amount` to the stock of the product with this id.
const staffRestocks = async (
  productId: string,
  amount: number
): Promise<Product> => {
  const res = await request(url)
    .post(`/products/${productId}/restock`)
    .set('Authorization', `Bearer ${staffToken}`)
    .send({ amount });
  return res.body;
};
// #endregion setup

describe('order:created', () => {
  // #region created-test
  it('reaches staff, and not customers', async () => {
    const staff = await connectAs(staffToken);
    const ada = await connectAs(adaToken);

    // Start listening *before* placing the order, so we can't miss it.
    const orderForStaff = listenFor(staff, 'order:created');
    const adaHeard = heardWithin(ada, 'order:created');

    const placed = await adaPlacesOrder();

    const order = await orderForStaff;
    expect(order.id).toBe(placed.id);
    expect(await adaHeard).toBe(false);
  });
  // #endregion created-test
});

// Now You Try
describe('connecting', () => {
  it.todo('turns away a bad token');
});

describe('order:updated', () => {
  it.todo('reaches the customer who placed the order, and no other customer');
});

describe('product:updated', () => {
  it.todo('reaches a browser where nobody is logged in, when an order takes stock');
  it.todo('reaches a browser where nobody is logged in, when staff restock');
});
