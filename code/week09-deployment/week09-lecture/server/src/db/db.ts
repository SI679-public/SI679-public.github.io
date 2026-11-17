import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';
import { getDbName, getMongoUri } from '../config.js';

let client: MongoClient | null = null;
let database: Db;

// #region connect
// The tests pass their own uri and database name.
export const connect = async (
  uri: string = getMongoUri(),
  dbName: string = getDbName()
): Promise<void> => {
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);
};
// #endregion connect

export const disconnect = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
  }
};

export const getDb = (): Db => database;
