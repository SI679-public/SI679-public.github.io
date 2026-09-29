import { db } from '../db/db.js';
import {
  productFromDocument,
  productFromFields
} from '../models/product.js';
import type { Product, ProductFields } from '../models/product.js';

const getAll = async (): Promise<Product[]> => {
  const productDocs = await db.getAllInCollection(db.PRODUCTS);
  return productDocs.map((pDoc) => productFromDocument(pDoc));
};

// Now You Try #1. "No such product" is not an error down here — it is a
// perfectly good answer, so the return type is Product | null. Turning that
// null into a 404 is the controller's job, because 404 is an HTTP idea and
// this layer knows nothing about HTTP.
const get = async (id: string): Promise<Product | null> => {
  const productDoc = await db.getInCollection(db.PRODUCTS, id);
  if (!productDoc) {
    return null;
  }
  return productFromDocument(productDoc);
};

const add = async (productInfo: ProductFields): Promise<Product> => {
  const { insertedId } = await db.addToCollection(db.PRODUCTS, productInfo);
  return productFromFields({ ...productInfo, id: insertedId.toString() });
};

// Now You Try #1 stretch. The service translates Mongo's deletedCount into
// the only thing the caller needs to know: did it delete something?
const remove = async (id: string): Promise<boolean> => {
  const { deletedCount } = await db.deleteFromCollection(db.PRODUCTS, id);
  return deletedCount === 1;
};

export const productService = {
  getAll,
  get,
  add,
  remove
};
