// #region imports
import { db } from '../db/db.js';
import {
  productFromDocument,
  productFromFields
} from '../models/product.js';
import type { Product, ProductFields } from '../models/product.js';
// #endregion imports

// #region getAll
const getAll = async (): Promise<Product[]> => {
  const productDocs = await db.getAllInCollection(db.PRODUCTS);
  return productDocs.map((pDoc) => productFromDocument(pDoc));
};
// #endregion getAll

// #region add
const add = async (productInfo: ProductFields): Promise<Product> => {
  const { insertedId } = await db.addToCollection(db.PRODUCTS, productInfo);
  return productFromFields({ ...productInfo, id: insertedId.toString() });
};
// #endregion add

// #region exports
export const productService = {
  getAll,
  add
};
// #endregion exports
