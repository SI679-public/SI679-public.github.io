// Exploring MongoDB from Node, one operation at a time.
//
// Run with `npm run explore`. It reruns every time you save. Point `main()`
// at whichever function you want to try.

import { MongoClient, ObjectId } from 'mongodb';
import type { Db, Document } from 'mongodb';

const mongoURI: string = 'mongodb://127.0.0.1:27017';
const dbName: string = 'week3db';

let client: MongoClient;
let db: Db;

const connect = async () => {
  client = new MongoClient(mongoURI);
  await client.connect();
  db = client.db(dbName);
};

const disconnect = async () => {
  await client.close();
};

interface Product {
  name: string;
  price: number;
  quantity: number;
}

const testAdd = async () => {
  const product: Product = {
    name: 'Duct Tape',
    price: 5.99,
    quantity: 120
  };
  const productColl = db.collection('products');
  return await productColl.insertOne(product);
};

const testAddMany = async () => {
  const products: Product[] = [
    {
      name: 'Scotch Tape',
      price: 3.99,
      quantity: 100
    },
    {
      name: 'Masking Tape',
      price: 2.01,
      quantity: 77
    }
  ];
  const productColl = db.collection('products');
  return await productColl.insertMany(products);
};

const getAllTest = async () => {
  const results: Document[] = [];
  const cursor = db.collection('products').find();
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (doc) {
      results.push(doc);
    }
  }
  return results;
};

const findOneTest = async () => {
  const oneResult = await db.collection('products').findOne({
    // name: 'Duct Tape',
    _id: new ObjectId('68bf9cae04ffbba55ba70cbf'),
  });
  return oneResult;
};

const findManyTest = async () => {
  const results: Document[] = [];
  const query = { price: { $lt: 5.0 } };
  const cursor = db.collection('products').find(query);
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (doc) {
      results.push(doc);
    }
  }
  return results;
};

const updateOneTest = async () => {
  const query = { name: 'Duct Tape' };
  const update = { $set: { quantity: 150 } };
  const result = await db.collection('products').updateOne(query, update);
  return result;
};

const deleteOneTest = async () => {
  const query = { _id: new ObjectId('68c06e746d1392af8b22b35f') };
  const result = await db.collection('products').deleteOne(query);
  return result;
};

// ---------------------------------------------------------------------------
// Now You Try #1
// ---------------------------------------------------------------------------

// findManyTest() with $gte instead of $lt: $5 or more.
const findPricierTest = async () => {
  const results: Document[] = [];
  const query = { price: { $gte: 5.0 } };
  const cursor = db.collection('products').find(query);
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (doc) {
      results.push(doc);
    }
  }
  return results;
};

// updateOneTest() with a different query and a different field in $set.
const updatePriceTest = async () => {
  const query = { name: 'Scotch Tape' };
  const update = { $set: { price: 4.29 } };
  const result = await db.collection('products').updateOne(query, update);
  return result;
};

// deleteOneTest() with the by-name query from findOneTest(). Any query
// object works with any operation.
const deleteByNameTest = async () => {
  const query = { name: 'Masking Tape' };
  const result = await db.collection('products').deleteOne(query);
  return result;
};

// Stretch: updateMany() instead of updateOne(), with the $lt query from
// findManyTest(). Adds a field none of the documents had before.
const markOnSaleTest = async () => {
  const query = { price: { $lt: 5.0 } };
  const update = { $set: { onSale: true } };
  const result = await db.collection('products').updateMany(query, update);
  return result;
};

const main = async () => {
  await connect();

  // Swap in whichever one you want to run:
  //   testAdd, testAddMany, getAllTest, findOneTest,
  //   findManyTest, updateOneTest, deleteOneTest,
  //   and from Now You Try #1: findPricierTest, updatePriceTest,
  //   deleteByNameTest, markOnSaleTest
  await testAddMany();

  const result = await getAllTest();
  console.log(result);

  await disconnect();
};

main();
