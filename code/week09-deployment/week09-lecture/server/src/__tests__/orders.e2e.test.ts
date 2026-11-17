import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { connect, disconnect } from '../db/db.js';
import * as productsRepository from '../db/products-repository.js';
import * as ordersRepository from '../db/orders-repository.js';
import type { Product } from '../models/product.js';
import { testProducts } from './test-products.js';
import { getJwtSecret } from '../config.js';

let mongo: MongoMemoryServer;

const tokenFor = (sub: string, username: string, role: string): string =>
  jwt.sign({ sub, username, role }, getJwtSecret());

const staffToken = tokenFor('650000000000000000000001', 'tester', 'staff');
const adaToken = tokenFor('650000000000000000000002', 'ada', 'customer');
const boToken = tokenFor('650000000000000000000003', 'bo', 'customer');

// The four test products, by manufacturer: Mr. Coffee (120 in stock),
// Braun (78), REVOTRA (3) and Keurig (0).
let byMaker: Record<string, Product>;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connect(mongo.getUri(), 'test');
});

afterAll(async () => {
  await disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await ordersRepository._clearOrders();
  await productsRepository._clearProducts();
  byMaker = {};
  for (const product of testProducts) {
    const saved = await productsRepository.insertProduct(product);
    byMaker[saved.manufacturer] = saved;
  }
});

const stockOf = async (maker: string): Promise<number> => {
  const product = await productsRepository.findProduct(byMaker[maker].id);
  return product!.quantity;
};

const placeAs = (token: string, items: unknown) =>
  request(app)
    .post('/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ items });

describe('POST /orders', () => {
  it('401s without a token', async () => {
    const res = await request(app).post('/orders').send({ items: [] });
    expect(res.status).toBe(401);
  });

  it('403s for staff', async () => {
    const res = await placeAs(staffToken, [
      { productId: byMaker['Braun'].id, quantity: 1 }
    ]);
    expect(res.status).toBe(403);
  });

  it('places an order, priced by the server, and takes the stock', async () => {
    const res = await placeAs(adaToken, [
      { productId: byMaker['Braun'].id, quantity: 2 },
      { productId: byMaker['REVOTRA'].id, quantity: 1, price: 0.01 }
    ]);

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^[0-9a-f]{24}$/);
    expect(res.body.status).toBe('placed');
    expect(res.body.customerUsername).toBe('ada');
    expect(res.body.items[1]).toEqual({
      productId: byMaker['REVOTRA'].id,
      modelName: '12-Cup Programmable Coffee Maker',
      quantity: 1,
      price: 44.77 // not the 0.01 the request sent
    });
    expect(res.body.total).toBe(304.67); // 2 x 129.95 + 44.77
    expect(await stockOf('Braun')).toBe(76);
    expect(await stockOf('REVOTRA')).toBe(2);
  });

  it('409s when there is not enough stock, and changes nothing', async () => {
    const res = await placeAs(adaToken, [
      { productId: byMaker['Braun'].id, quantity: 2 },
      { productId: byMaker['REVOTRA'].id, quantity: 4 }
    ]);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(
      'Not enough 12-Cup Programmable Coffee Maker in stock'
    );
    expect(await stockOf('Braun')).toBe(78); // put back
    expect(await stockOf('REVOTRA')).toBe(3);
    expect(await ordersRepository.findOrders({})).toHaveLength(0);
  });

  it('400s for an empty order', async () => {
    const res = await placeAs(adaToken, []);
    expect(res.status).toBe(400);
  });

  it('400s for a quantity that is not a whole number above 0', async () => {
    const res = await placeAs(adaToken, [
      { productId: byMaker['Braun'].id, quantity: 0 }
    ]);
    expect(res.status).toBe(400);
  });

  it('400s for a product that does not exist', async () => {
    const res = await placeAs(adaToken, [
      { productId: '650000000000000000000099', quantity: 1 }
    ]);
    expect(res.status).toBe(400);
  });
});

describe('GET /orders', () => {
  beforeEach(async () => {
    await placeAs(adaToken, [{ productId: byMaker['Braun'].id, quantity: 1 }]);
    await placeAs(boToken, [
      { productId: byMaker['Mr. Coffee'].id, quantity: 1 }
    ]);
  });

  it('401s without a token', async () => {
    const res = await request(app).get('/orders');
    expect(res.status).toBe(401);
  });

  it('gives a customer only their own orders', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${adaToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].customerUsername).toBe('ada');
  });

  it('gives staff every order', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('PATCH /orders/:id/status', () => {
  let orderId: string;

  beforeEach(async () => {
    const res = await placeAs(adaToken, [
      { productId: byMaker['Braun'].id, quantity: 1 }
    ]);
    orderId = res.body.id;
  });

  const fulfillAs = (token: string, id: string, status = 'fulfilled') =>
    request(app)
      .patch(`/orders/${id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status });

  it('lets staff fulfill an order', async () => {
    const res = await fulfillAs(staffToken, orderId);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('fulfilled');
  });

  it('403s for a customer, even on their own order', async () => {
    const res = await fulfillAs(adaToken, orderId);
    expect(res.status).toBe(403);
  });

  it('409s for an order that is already fulfilled', async () => {
    await fulfillAs(staffToken, orderId);
    const res = await fulfillAs(staffToken, orderId);
    expect(res.status).toBe(409);
  });

  it('404s for an order that does not exist', async () => {
    const res = await fulfillAs(staffToken, '650000000000000000000099');
    expect(res.status).toBe(404);
  });

  it('400s for any status but "fulfilled"', async () => {
    const res = await fulfillAs(staffToken, orderId, 'shipped');
    expect(res.status).toBe(400);
  });
});
