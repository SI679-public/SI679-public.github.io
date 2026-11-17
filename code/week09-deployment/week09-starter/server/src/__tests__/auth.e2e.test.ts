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
import * as usersRepository from '../db/users-repository.js';
import { getJwtSecret } from '../config.js';

// Most of these tests make their own tokens with jwt.sign, so they never
// touch the database. The last one logs in for real -- that's why this file
// starts MongoMemoryServer.

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
  await usersRepository._clearUsers();
});

// What a token from our login route carries.
const payload = { sub: '650000000000000000000001', username: 'ada' };

describe('GET /auth/me', () => {
  it('200s with the username for a token we sign ourselves', async () => {
    const token = jwt.sign(payload, getJwtSecret());

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('ada');
  });

  // Now You Try
  it('401s when there is no token', async () => {
    const res = await request(app).get('/auth/me');

    expect(res.status).toBe(401);
  });

  // Now You Try
  it('401s for a token that is not a JWT at all', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer not-a-token');

    expect(res.status).toBe(401);
  });

  // Now You Try
  it('401s for a token signed with the wrong secret', async () => {
    const token = jwt.sign(payload, 'not-the-secret');

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  // Now You Try
  it('401s for a token that has expired', async () => {
    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: -10 });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  // Now You Try
  it('401s for a token whose payload has been edited', async () => {
    const token = jwt.sign(payload, getJwtSecret());
    const parts = token.split('.');

    const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    decoded.username = 'mallory';
    const edited = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    const forged = [parts[0], edited, parts[2]].join('.');

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${forged}`);

    expect(res.status).toBe(401);
  });

  // Now You Try
  it('200s with the username for a token from a real login', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'ada', password: 'correct horse' });

    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'ada', password: 'correct horse' });
    expect(login.status).toBe(200);

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('ada');
  });
});
