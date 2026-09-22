// products.test.ts partway through the lecture: tests against the live database.
// `npm test` skips this file on purpose. To run it, from the lecture repo:
//
//   npm run test:stages -- 01
//
// STAGES.md says what you should see.

// #region stage
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connect } from '../db.js';

await connect('mongodb://127.0.0.1:27017', 'week3test');

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
// #endregion stage
