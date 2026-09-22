import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { _clearProducts, connect, disconnect } from '../db.js';
import type { Product } from '../db.js';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connect(mongo.getUri(), 'test');
});

beforeEach(async () => {
  await _clearProducts();
});

afterAll(async () => {
  await disconnect();
  await mongo.stop();
});

describe('POST /products', () => {
  it('adds a product we can then read back', async () => {
    const created = await request(app)
      .post('/products')
      .send({ name: 'Duct Tape', price: 5.99, quantity: 120 });
    expect(created.status).toBe(201);
    expect(created.body.id).toMatch(/^[0-9a-f]{24}$/);

    const all = await request(app).get('/products');
    expect(all.body).toHaveLength(1);
  });
});

describe('GET /products', () => {
  it('starts empty', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('lists what was added', async () => {
    await request(app).post('/products').send({ name: 'Duct Tape', price: 5.99, quantity: 120 });
    await request(app).post('/products').send({ name: 'Scotch Tape', price: 3.99, quantity: 100 });

    const res = await request(app).get('/products');
    const names = res.body.map((p: Product) => p.name);
    expect(names).toEqual(['Duct Tape', 'Scotch Tape']);
    expect(names).toContain('Scotch Tape');
    expect(names).not.toContain('Masking Tape');
  });
});
