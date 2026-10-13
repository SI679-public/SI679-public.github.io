import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { connect, disconnect } from '../db/db.js';
import * as productsRepository from '../db/products-repository.js';
import type { Product } from '../models/product.js';
import { testProducts } from './test-products.js';

let mongo: MongoMemoryServer;

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
    await productsRepository.insertProduct(product);
  }
});

describe('GET /products', () => {
  it('lists the products that are in the database', async () => {
    const res = await request(app).get('/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);

    const manufacturers = res.body.map(
      (product: Product) => product.manufacturer
    );
    expect(manufacturers).toContain('Mr. Coffee');
    expect(manufacturers).not.toContain('Bialetti');
  });

  it('gives every product an id', async () => {
    const res = await request(app).get('/products');

    for (const product of res.body) {
      expect(product.id).toMatch(/^[0-9a-f]{24}$/);
      expect(product._id).toBeUndefined();
    }
  });

  it('returns only the low stock products when asked', async () => {
    const res = await request(app).get('/products?lowStock=true');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    const manufacturers = res.body.map(
      (product: Product) => product.manufacturer
    );
    expect(manufacturers).toEqual(['REVOTRA', 'Keurig']);
  });
});

describe('GET /products/:id', () => {
  it('returns the product with that id', async () => {
    const all = await request(app).get('/products');
    const { id, modelName } = all.body[0];

    const res = await request(app).get(`/products/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.modelName).toBe(modelName);
  });

  it('returns 404 for an id that is not in the database', async () => {
    const res = await request(app).get(`/products/${'a'.repeat(24)}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /products', () => {
  it('adds a product we can then read back', async () => {
    const created = await request(app).post('/products').send({
      modelName: 'Moka Express',
      modelNumber: '1168',
      manufacturer: 'Bialetti',
      color: 'Aluminium',
      price: 34.95,
      quantity: 60
    });

    expect(created.status).toBe(201);
    expect(created.body.id).toMatch(/^[0-9a-f]{24}$/);

    const all = await request(app).get('/products');
    expect(all.body).toHaveLength(5);
  });

  it('fills in defaults for the fields that were left out', async () => {
    const created = await request(app)
      .post('/products')
      .send({ modelName: 'Mystery Machine' });

    const all = await request(app).get('/products');
    const stored = all.body.find(
      (product: Product) => product.id === created.body.id
    );

    expect(stored.modelName).toBe('Mystery Machine');
    expect(stored.modelNumber).toBe('');
    expect(stored.quantity).toBe(0);
  });
});

describe('PATCH /products/:id', () => {
  it('updates the field that was sent', async () => {
    const all = await request(app).get('/products');
    const { id } = all.body[0];

    const res = await request(app)
      .patch(`/products/${id}`)
      .send({ price: 12.5 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(12.5);
  });

  it('rejects a change that would make quantity negative', async () => {
    const all = await request(app).get('/products');
    const { id } = all.body[0];

    const res = await request(app)
      .patch(`/products/${id}`)
      .send({ quantity: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('quantity cannot be negative');
  });

  it('404s when the id is not in the database', async () => {
    const res = await request(app)
      .patch(`/products/${'a'.repeat(24)}`)
      .send({ price: 1.5 });

    expect(res.status).toBe(404);
  });

  // Now You Try
  it('rejects a change that would make the price negative', async () => {
    const all = await request(app).get('/products');
    const { id } = all.body[0];

    const res = await request(app)
      .patch(`/products/${id}`)
      .send({ price: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('price cannot be negative');
  });

  // Now You Try
  it('leaves the other fields alone', async () => {
    const all = await request(app).get('/products');
    const before = all.body[0];

    const res = await request(app)
      .patch(`/products/${before.id}`)
      .send({ price: 12.5 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(12.5);
    expect(res.body.modelName).toBe(before.modelName);
    expect(res.body.quantity).toBe(before.quantity);
  });

  // Now You Try
  it('leaves the product unchanged after a rejected change', async () => {
    const all = await request(app).get('/products');
    const before = all.body[0];

    const rejected = await request(app)
      .patch(`/products/${before.id}`)
      .send({ quantity: -5 });
    expect(rejected.status).toBe(400);

    const after = await request(app).get(`/products/${before.id}`);

    expect(after.status).toBe(200);
    expect(after.body).toEqual(before);
  });
});
