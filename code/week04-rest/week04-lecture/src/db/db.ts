// #region config
import { MongoClient } from 'mongodb';
import type { Db, Document, InsertOneResult } from 'mongodb';

// Where the database server lives, and which database on it we want.
const MONGO_URI: string = 'mongodb://127.0.0.1:27017';
const DB_NAME: string = 'week4';

// Collection names. The rest of the app asks for db.PRODUCTS rather than
// typing the string 'products' in five different places.
const PRODUCTS: string = 'products';

let mongoClient: MongoClient | null = null;
let theDb: Db;
// #endregion config

// #region init
// The two defaults are what the app uses, so `init()` with no arguments
// does the right thing. Passing arguments is how we will later point the
// same code at a different database without editing this file.
const init = async (
  uri: string = MONGO_URI,
  dbName: string = DB_NAME
): Promise<void> => {
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  theDb = mongoClient.db(dbName);
};
// #endregion init

// #region getAll
const getAllInCollection = async (
  collectionName: string
): Promise<Document[]> => {
  if (!mongoClient) {
    await init();
  }
  const allDocs = theDb.collection(collectionName).find();
  return await allDocs.toArray();
};
// #endregion getAll

// #region add
const addToCollection = async (
  collectionName: string,
  docData: Document
): Promise<InsertOneResult> => {
  if (!mongoClient) {
    await init();
  }
  return await theDb.collection(collectionName).insertOne(docData);
};
// #endregion add

// #region testSeams
// Neither of these is for the app. The app connects once at startup and
// then runs until you stop it, so it never needs to hang up or to empty
// a collection. Tests need both.

const disconnect = async (): Promise<void> => {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
};

// The leading underscore is a convention, not a language feature. It is a
// note to the next reader: this exists for tests, not for the app.
const _clearCollection = async (collectionName: string): Promise<void> => {
  await theDb.collection(collectionName).deleteMany({});
};
// #endregion testSeams

// #region exports
export const db = {
  init,
  disconnect,
  getAllInCollection,
  addToCollection,
  _clearCollection,
  PRODUCTS
};
// #endregion exports
