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
import type { Product } from '../models/product.js';
import { testProducts } from './test-products.js';
import { getJwtSecret } from '../config.js';

let mongo: MongoMemoryServer;
let keurig: Product; // 0 in stock

const staffToken = jwt.sign(
  { sub: '650000000000000000000001', username: 'tester', role: 'staff' },
  getJwtSecret()
);
const customerToken = jwt.sign(
  { sub: '650000000000000000000002', username: 'ada', role: 'customer' },
  getJwtSecret()
);

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connect(mongo.getUri(), 'test');
});

afterAll(async () => {
  await disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await productsRepository._clearProducts();
  for (const product of testProducts) {
    const saved = await productsRepository.insertProduct(product);
    if (saved.manufacturer === 'Keurig') {
      keurig = saved;
    }
  }
});

const restockAs = (token: string, id: string, amount: unknown) =>
  request(app)
    .post(`/products/${id}/restock`)
    .set('Authorization', `Bearer ${token}`)
    .send({ amount });

describe('POST /products/:id/restock', () => {
  it('adds to the stock, and adds again', async () => {
    await restockAs(staffToken, keurig.id, 5);
    const res = await restockAs(staffToken, keurig.id, 3);

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(8);
  });

  it('403s for a customer', async () => {
    const res = await restockAs(customerToken, keurig.id, 5);
    expect(res.status).toBe(403);
  });

  it('400s for an amount that is not a whole number above 0', async () => {
    for (const amount of [0, -2, 1.5, 'ten']) {
      const res = await restockAs(staffToken, keurig.id, amount);
      expect(res.status).toBe(400);
    }
  });

  it('404s for a product that does not exist', async () => {
    const res = await restockAs(staffToken, '650000000000000000000099', 5);
    expect(res.status).toBe(404);
  });
});
