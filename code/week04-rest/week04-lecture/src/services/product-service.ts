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
const add = async (productInfo: ProductFields): Promise<string> => {
  // Fill in the defaults BEFORE the insert. Doing it afterwards only tidies
  // up the value we hand back and leaves a half-filled document in the
  // database. See "A bug we found in class" in the week 4 notes.
  const product = productFromFields(productInfo);

  // Store the fields, but not `id`. Mongo makes its own `_id`, and a
  // second id beside it is the confusion /models exists to prevent.
  const { insertedId } = await db.addToCollection(db.PRODUCTS, {
    modelName: product.modelName,
    modelNumber: product.modelNumber,
    manufacturer: product.manufacturer,
    color: product.color,
    price: product.price,
    quantity: product.quantity
  });

  return insertedId.toString();
};
// #endregion add

// #region exports
export const productService = {
  getAll,
  add
};
// #endregion exports
