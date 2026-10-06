import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

const MONGO_URI: string = 'mongodb://127.0.0.1:27017';
const DB_NAME: string = 'week5';

let client: MongoClient | null = null;
let database: Db;

export const connect = async (
  uri: string = MONGO_URI,
  dbName: string = DB_NAME
): Promise<void> => {
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);
};

export const disconnect = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
  }
};

export const getDb = (): Db => database;
