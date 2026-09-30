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
import { db } from '../db/db.js';
import type { Product } from '../models/product.js';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await db.init(mongo.getUri(), 'test');
});

afterAll(async () => {
  await db.disconnect();
  await mongo.stop();
});

// The same two coffee makers we imported into Compass — except this time
// the test puts them there, so it knows exactly what a correct answer
// looks like.
const twoCoffeeMakers = [
  {
    modelName: '14 Cup Programmable Coffee Maker',
    modelNumber: '2143561',
    manufacturer: 'Mr. Coffee',
    color: 'Silver',
    price: 89.99,
    quantity: 120
  },
  {
    modelName: 'BrewSense 12 Cup Drip Coffee Maker',
    modelNumber: 'KF7150BK',
    manufacturer: 'Braun',
    color: 'Stainless Steel and Black',
    price: 129.95,
    quantity: 78
  }
];

beforeEach(async () => {
  await db._clearCollection(db.PRODUCTS);
  for (const coffeeMaker of twoCoffeeMakers) {
    await db.addToCollection(db.PRODUCTS, coffeeMaker);
  }
});

describe('GET /products', () => {
  it('lists the products that are in the database', async () => {
    const res = await request(app).get('/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    const manufacturers = res.body.map(
      (product: Product) => product.manufacturer
    );
    expect(manufacturers).toEqual(['Mr. Coffee', 'Braun']);
    expect(manufacturers).not.toContain('REVOTRA');
  });

  it('gives every product an id', async () => {
    const res = await request(app).get('/products');

    for (const product of res.body) {
      expect(product.id).toMatch(/^[0-9a-f]{24}$/);
      expect(product._id).toBeUndefined();
    }
  });
});

describe('POST /products', () => {
  it('adds a product we can then read back', async () => {
    const created = await request(app).post('/products').send({
      modelName: '12-Cup Programmable Coffee Maker',
      modelNumber: 'MK-B-DCM01',
      manufacturer: 'REVOTRA',
      color: 'Silver/Black',
      price: 44.77,
      quantity: 312
    });

    expect(created.status).toBe(201);
    expect(created.body.id).toMatch(/^[0-9a-f]{24}$/);

    const all = await request(app).get('/products');
    expect(all.body).toHaveLength(3);

    const manufacturers = all.body.map(
      (product: Product) => product.manufacturer
    );
    expect(manufacturers).toContain('REVOTRA');
  });
});

// Now You Try #2 as published (not the version assigned in class —
// see the note further down).
describe('GET /products/:id', () => {
  it('returns the product with that id', async () => {
    // GET /products is a route we already trust, so it is a fine way to
    // find out what ids the seeded products ended up with.
    const all = await request(app).get('/products');
    const { id, modelName } = all.body[0];

    const res = await request(app).get(`/products/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.modelName).toBe(modelName);
  });

  it('returns 404 for an id that is not in the database', async () => {
    // 24 hex characters: a well-formed Mongo id that is certainly not ours.
    const res = await request(app).get(`/products/${'a'.repeat(24)}`);

    expect(res.status).toBe(404);
  });
});

// Now You Try #2 stretch
describe('DELETE /products/:id (stretch)', () => {
  it('removes the product', async () => {
    const before = await request(app).get('/products');
    const { id } = before.body[0];

    const res = await request(app).delete(`/products/${id}`);
    expect(res.status).toBe(204);

    // The interesting assertion is about a different request than the one
    // under test: the product is gone from the list.
    const after = await request(app).get('/products');
    expect(after.body).toHaveLength(1);
    const remainingIds = after.body.map((product: Product) => product.id);
    expect(remainingIds).not.toContain(id);
  });

  it('returns 404 for an id that is not in the database', async () => {
    const res = await request(app).delete(`/products/${'a'.repeat(24)}`);

    expect(res.status).toBe(404);
  });
});

// -----------------------------------------------------------------------
// Now You Try #2, as actually assigned in class on 2026-09-29.
//
// The published NYT #2 asked for tests of GET /products/:id. Most of the
// room hadn't finished that route, so the assignment changed on the fly
// to this instead: prove that POST /products stores a *partial* product
// correctly — the fields you send kept, everything else filled in with the
// defaults from productFromFields().
//
// Mark wrote this version alongside the class during the exercise; it failed,
// and it was right to. The bug is in the code built together earlier in the
// session. See MEMO-post-class.md in this repo.
// -----------------------------------------------------------------------

describe('POST /products with only some fields', () => {
  it('keeps what was sent and fills in the rest', async () => {
    // Four of the seven fields. No modelNumber, no quantity, no id.
    const partialProduct = {
      modelName: 'My Model',
      manufacturer: 'My Manufacturer',
      color: 'green',
      price: 5.5
    };

    const created = await request(app)
      .post('/products')
      .send(partialProduct);

    expect(created.status).toBe(201);
    const { id } = created.body;

    // Read it back through GET, so we are testing what actually landed in
    // the database rather than what POST happened to hand back.
    const all = await request(app).get('/products');
    const stored = (all.body as Product[]).find((p) => p.id === id);

    expect(stored).toBeDefined();

    // What we sent survived.
    expect(stored!.modelName).toBe('My Model');
    expect(stored!.manufacturer).toBe('My Manufacturer');
    expect(stored!.color).toBe('green');
    expect(stored!.price).toBe(5.5);

    // What we left out came back as the defaults from productFromFields().
    // Before the fix these were `undefined`, because the defaults were
    // applied to the return value instead of to the document.
    expect(stored!.modelNumber).toBe('');
    expect(stored!.quantity).toBe(0);
  });

  it('does not leave a second id in the stored document', async () => {
    const created = await request(app)
      .post('/products')
      .send({ modelName: 'Second Fix' });

    const all = await request(app).get('/products');
    const stored = all.body.find(
      (p: Product) => p.id === created.body.id
    );

    // `id` is a string made from Mongo's `_id`, not the placeholder that
    // productFromFields() invents. If the service stored its whole return
    // value, this would be a timestamp like "1790716131668".
    expect(stored.id).toMatch(/^[0-9a-f]{24}$/);
  });
});
