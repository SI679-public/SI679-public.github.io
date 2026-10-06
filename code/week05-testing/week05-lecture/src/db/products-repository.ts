import { ObjectId } from 'mongodb';
import type { Document } from 'mongodb';
import { getDb } from './db.js';
import type {
  NewProduct,
  Product,
  ProductFields
} from '../models/product.js';

const PRODUCTS = 'products';

// #region toProduct
const toProduct = (doc: Document): Product => {
  return {
    id: doc._id.toString(),
    modelName: doc.modelName,
    modelNumber: doc.modelNumber,
    manufacturer: doc.manufacturer,
    color: doc.color,
    price: doc.price,
    quantity: doc.quantity
  };
};
// #endregion toProduct

// #region findAll
export const findAllProducts = async (): Promise<Product[]> => {
  const docs = await getDb().collection(PRODUCTS).find().toArray();
  return docs.map((doc) => toProduct(doc));
};
// #endregion findAll

// #region findOne
export const findProduct = async (id: string): Promise<Product | null> => {
  const doc = await getDb()
    .collection(PRODUCTS)
    .findOne({ _id: new ObjectId(id) });
  return doc ? toProduct(doc) : null;
};
// #endregion findOne

// #region insert
export const insertProduct = async (
  product: NewProduct
): Promise<Product> => {
  const result = await getDb().collection(PRODUCTS).insertOne({
    modelName: product.modelName,
    modelNumber: product.modelNumber,
    manufacturer: product.manufacturer,
    color: product.color,
    price: product.price,
    quantity: product.quantity
  });
  return {
    id: result.insertedId.toString(),
    modelName: product.modelName,
    modelNumber: product.modelNumber,
    manufacturer: product.manufacturer,
    color: product.color,
    price: product.price,
    quantity: product.quantity
  };
};
// #endregion insert

// #region update
export const updateProduct = async (
  id: string,
  changes: ProductFields
): Promise<Product | null> => {
  const doc = await getDb()
    .collection(PRODUCTS)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: changes },
      { returnDocument: 'after' }
    );
  return doc ? toProduct(doc) : null;
};
// #endregion update

// #region remove
export const deleteProduct = async (id: string): Promise<boolean> => {
  const result = await getDb()
    .collection(PRODUCTS)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
};
// #endregion remove

export const _clearProducts = async (): Promise<void> => {
  await getDb().collection(PRODUCTS).deleteMany({});
};
