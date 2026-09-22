// Now You Try #2: tests for PATCH and DELETE, plus the stretch.
//
// A new file means setting up MongoMemoryServer and the hooks again — the
// same three hooks as products.test.ts.
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

// A valid-looking id that won't be in the (freshly cleared) database.
const MISSING_ID = '68bf9cae04ffbba55ba70cbf';

// Adds a product through the API and returns its id.
const addDuctTape = async () => {
  const res = await request(app)
    .post('/products')
    .send({ name: 'Duct Tape', price: 5.99, quantity: 120 });
  return res.body.id;
};

describe('PATCH /products/:id', () => {
  it('changes only the fields it is sent', async () => {
    const id = await addDuctTape();

    const patched = await request(app).patch(`/products/${id}`).send({ price: 6.49 });
    expect(patched.status).toBe(200);

    const after = await request(app).get(`/products/${id}`);
    expect(after.body.price).toBe(6.49);
    expect(after.body.name).toBe('Duct Tape');
    expect(after.body.quantity).toBe(120);
  });

  it('returns 404 for an id that is not there', async () => {
    const res = await request(app).patch(`/products/${MISSING_ID}`).send({ price: 1 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /products/:id', () => {
  it('removes the product', async () => {
    const id = await addDuctTape();

    const deleted = await request(app).delete(`/products/${id}`);
    expect(deleted.status).toBe(200);

    const one = await request(app).get(`/products/${id}`);
    expect(one.status).toBe(404);

    const all = await request(app).get('/products');
    const names = all.body.map((p: Product) => p.name);
    expect(names).not.toContain('Duct Tape');
  });

  it('returns 404 for an id that is not there', async () => {
    const res = await request(app).delete(`/products/${MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});

// Side quest: without validateId, each of these answers 500.
describe('malformed ids (stretch)', () => {
  it('GET answers 400', async () => {
    const res = await request(app).get('/products/badID123');
    expect(res.status).toBe(400);
  });

  it('PATCH answers 400', async () => {
    const res = await request(app).patch('/products/badID123').send({ price: 1 });
    expect(res.status).toBe(400);
  });

  it('DELETE answers 400', async () => {
    const res = await request(app).delete('/products/badID123');
    expect(res.status).toBe(400);
  });
});
