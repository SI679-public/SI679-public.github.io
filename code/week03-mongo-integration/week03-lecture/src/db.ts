// #region types
import { MongoClient, ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';

export interface Product {
  name: string;
  price: number;
  quantity: number;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  quantity?: number;
}
// #endregion types

// #region connect
let client: MongoClient;
let productsCollection: Collection;

export const connect = async (uri: string, dbName: string) => {
  client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  productsCollection = db.collection('products');
};

export const disconnect = async () => {
  await client.close();
};
// #endregion connect

// #region read
export const getAllProducts = async () => {
  return await productsCollection.find().toArray();
};

export const getProduct = async (id: string) => {
  return await productsCollection.findOne({ _id: new ObjectId(id) });
};
// #endregion read

// #region write
export const addProduct = async (product: Product) => {
  const result = await productsCollection.insertOne(product);
  return result.insertedId;
};

export const updateProduct = async (id: string, changes: ProductUpdate) => {
  const result = await productsCollection.updateOne({ _id: new ObjectId(id) }, { $set: changes });
  return result.matchedCount;
};

export const deleteProduct = async (id: string) => {
  const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};
// #endregion write

// #region clear
// Only for tests. Never called by the app.
export const _clearProducts = async () => {
  await productsCollection.deleteMany({});
};
// #endregion clear
