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

// GET /users/:id: the first test is written together in class; the other
// two are part of Now You Try #2.

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connect(mongo.getUri(), 'test');
});

afterAll(async () => {
  await disconnect();
  await mongo.stop();
});

// Three users, fresh for every test. These tests never log in, so the
// hashed passwords are never checked.
let adaId: string;
let graceId: string;
let staffId: string;

beforeEach(async () => {
  await usersRepository._clearUsers();
  adaId = (
    await usersRepository.insertUser({
      username: 'ada',
      hashedPassword: 'not-a-real-hash',
      role: 'customer'
    })
  ).id;
  graceId = (
    await usersRepository.insertUser({
      username: 'grace',
      hashedPassword: 'not-a-real-hash',
      role: 'customer'
    })
  ).id;
  staffId = (
    await usersRepository.insertUser({
      username: 'staff',
      hashedPassword: 'not-a-real-hash',
      role: 'staff'
    })
  ).id;
});

describe('GET /users/:id', () => {
  it.todo("403s for a customer reading someone else's profile");
  it.todo('200s for a customer reading their own profile');
  it.todo("200s for staff reading anyone's profile");
});
