// #region setup
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
// #endregion setup

// #region seed
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
// #endregion seed

describe('GET /products', () => {
  // #region listsWhatIsThere
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
  // #endregion listsWhatIsThere

  // #region givesEachProductAnId
  it('gives every product an id', async () => {
    const res = await request(app).get('/products');

    for (const product of res.body) {
      expect(product.id).toMatch(/^[0-9a-f]{24}$/);
      expect(product._id).toBeUndefined();
    }
  });
  // #endregion givesEachProductAnId
});

// #region post
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
// #endregion post
