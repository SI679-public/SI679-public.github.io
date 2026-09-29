import { MongoClient, ObjectId } from 'mongodb';
import type { Db, DeleteResult, Document, InsertOneResult } from 'mongodb';

// Where the database server lives, and which database on it we want.
const MONGO_URI: string = 'mongodb://127.0.0.1:27017';
const DB_NAME: string = 'week4';

// Collection names. The rest of the app asks for db.PRODUCTS rather than
// typing the string 'products' in five different places.
const PRODUCTS: string = 'products';

let mongoClient: MongoClient | null = null;
let theDb: Db;

const init = async (
  uri: string = MONGO_URI,
  dbName: string = DB_NAME
): Promise<void> => {
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  theDb = mongoClient.db(dbName);
};

const getAllInCollection = async (
  collectionName: string
): Promise<Document[]> => {
  if (!mongoClient) {
    await init();
  }
  const allDocs = theDb.collection(collectionName).find();
  return await allDocs.toArray();
};

// Now You Try #1: one document instead of all of them. findOne() returns
// null when nothing matches, so the return type has to say so.
const getInCollection = async (
  collectionName: string,
  id: string
): Promise<Document | null> => {
  if (!mongoClient) {
    await init();
  }
  return await theDb
    .collection(collectionName)
    .findOne({ _id: new ObjectId(id) });
};

const addToCollection = async (
  collectionName: string,
  docData: Document
): Promise<InsertOneResult> => {
  if (!mongoClient) {
    await init();
  }
  return await theDb.collection(collectionName).insertOne(docData);
};

// Now You Try #1 stretch. DeleteResult carries deletedCount, which is how
// the layer above tells "deleted it" from "there was nothing to delete".
const deleteFromCollection = async (
  collectionName: string,
  id: string
): Promise<DeleteResult> => {
  if (!mongoClient) {
    await init();
  }
  return await theDb
    .collection(collectionName)
    .deleteOne({ _id: new ObjectId(id) });
};

// Neither of these is for the app. The app connects once at startup and
// then runs until you stop it, so it never needs to hang up or to empty
// a collection. Tests need both.

const disconnect = async (): Promise<void> => {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
};

const _clearCollection = async (collectionName: string): Promise<void> => {
  await theDb.collection(collectionName).deleteMany({});
};

export const db = {
  init,
  disconnect,
  getAllInCollection,
  getInCollection,
  addToCollection,
  deleteFromCollection,
  _clearCollection,
  PRODUCTS
};
