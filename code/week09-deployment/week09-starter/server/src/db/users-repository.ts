import { ObjectId } from 'mongodb';
import type { Document } from 'mongodb';
import { getDb } from './db.js';
import type { NewUser, User } from '../models/user.js';

const USERS = 'users';

const toUser = (doc: Document): User => {
  return {
    id: doc._id.toString(),
    username: doc.username,
    hashedPassword: doc.hashedPassword,
    role: doc.role
  };
};

export const findUserByUsername = async (
  username: string
): Promise<User | null> => {
  const doc = await getDb().collection(USERS).findOne({ username });
  return doc ? toUser(doc) : null;
};

export const findUser = async (id: string): Promise<User | null> => {
  const doc = await getDb()
    .collection(USERS)
    .findOne({ _id: new ObjectId(id) });
  return doc ? toUser(doc) : null;
};

export const insertUser = async (user: NewUser): Promise<User> => {
  const result = await getDb().collection(USERS).insertOne({
    username: user.username,
    hashedPassword: user.hashedPassword,
    role: user.role
  });
  return {
    id: result.insertedId.toString(),
    username: user.username,
    hashedPassword: user.hashedPassword,
    role: user.role
  };
};

export const _clearUsers = async (): Promise<void> => {
  await getDb().collection(USERS).deleteMany({});
};
