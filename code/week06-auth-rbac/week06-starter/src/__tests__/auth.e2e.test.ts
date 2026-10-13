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
  it.todo('200s with the username for a token we sign ourselves');

  // Leave the Authorization header off altogether.
  it.todo('401s when there is no token');

  // Send the header `Authorization: Bearer not-a-token`.
  it.todo('401s for a token that is not a JWT at all');

  // jwt.sign(payload, 'not-the-secret') -- the right shape, the wrong key.
  it.todo('401s for a token signed with the wrong secret');

  // jwt.sign(payload, getJwtSecret(), { expiresIn: -10 }) expired ten
  // seconds ago.
  it.todo('401s for a token that has expired');

  // Start from a good token, jwt.sign(payload, getJwtSecret()), then:
  //   1. const parts = token.split('.') gives you [header, payload, signature]
  //   2. Buffer.from(parts[1], 'base64url').toString() is the payload as JSON
  //   3. JSON.parse it, change the username, JSON.stringify it again
  //   4. Buffer.from(json).toString('base64url') encodes it back
  //   5. join parts[0], the new payload and the ORIGINAL parts[2] with '.'
  it.todo('401s for a token whose payload has been edited');

  // POST /auth/register, then POST /auth/login, then call GET /auth/me with
  // the token that login gave you. The only test here that needs the
  // database.
  it.todo('200s with the username for a token from a real login');
});
