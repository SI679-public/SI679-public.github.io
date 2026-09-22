// products.test.ts partway through the lecture: swapping in MongoMemoryServer,
// with a second test that fails until we add hooks.
// `npm test` skips this file on purpose. To run it, from the lecture repo:
//
//   npm run test:stages -- 02
//
// STAGES.md says what you should see.

// #region stage
// #region post
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { connect } from '../db.js';

const mongo = await MongoMemoryServer.create();
await connect(mongo.getUri(), 'test');

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
// #endregion post

// #region startsEmpty
describe('GET /products', () => {
  it('starts empty', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});
// #endregion startsEmpty
// #endregion stage
