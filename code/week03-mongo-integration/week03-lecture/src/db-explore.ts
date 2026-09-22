// Exploring MongoDB from Node, one operation at a time.
//
// Run with `npm run explore`. It reruns every time you save. Point `main()`
// at whichever function you want to try.

// #region imports
import { MongoClient, ObjectId } from 'mongodb';
// #endregion imports
import type { Db, Document } from 'mongodb';

// #region connect
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
// #endregion connect

// #region testAdd
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
// #endregion testAdd

// #region testAddMany
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
// #endregion testAddMany

// #region getAllTest
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
// #endregion getAllTest

// #region findOneTest
const findOneTest = async () => {
  const oneResult = await db.collection('products').findOne({
    // name: 'Duct Tape',
    _id: new ObjectId('68bf9cae04ffbba55ba70cbf'),
  });
  return oneResult;
};
// #endregion findOneTest

// #region findManyTest
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
// #endregion findManyTest

// #region updateOneTest
const updateOneTest = async () => {
  const query = { name: 'Duct Tape' };
  const update = { $set: { quantity: 150 } };
  const result = await db.collection('products').updateOne(query, update);
  return result;
};
// #endregion updateOneTest

// #region deleteOneTest
const deleteOneTest = async () => {
  const query = { _id: new ObjectId('68c06e746d1392af8b22b35f') };
  const result = await db.collection('products').deleteOne(query);
  return result;
};
// #endregion deleteOneTest

const main = async () => {
  await connect();

  // Swap in whichever one you want to run:
  //   testAdd, testAddMany, getAllTest, findOneTest,
  //   findManyTest, updateOneTest, deleteOneTest
  await testAddMany();

  const result = await getAllTest();
  console.log(result);

  await disconnect();
};

main();
