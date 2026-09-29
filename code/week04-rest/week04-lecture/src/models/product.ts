// #region product
import type { Document } from 'mongodb';

// What every product looks like once it is inside our app.
export type Product = {
  id: string;
  modelName: string;
  modelNumber: string;
  manufacturer: string;
  color: string;
  price: number;
  quantity: number;
};

// Turn a Mongo document into a Product. The only interesting line is the
// first one: _id (an ObjectId) becomes id (a string), so no layer above
// this one ever has to know what a Document or an ObjectId is.
export const productFromDocument = (productDocument: Document): Product => {
  return {
    id: productDocument._id.toString(),
    modelName: productDocument.modelName,
    modelNumber: productDocument.modelNumber,
    manufacturer: productDocument.manufacturer,
    color: productDocument.color,
    price: productDocument.price,
    quantity: productDocument.quantity
  };
};
// #endregion product

// #region fields
// What a caller may send us. `Partial<>` is a utility type: hand it a type
// and it hands back the same type with every field optional. So one shape
// covers both creating a product and updating a few of its fields.
export type ProductFields = Partial<Product>;

// Fill in whatever the caller left out, using defaults where a field is
// omitted. `??` means "use the thing on the left unless it is missing".
export const productFromFields = (fields: ProductFields): Product => {
  return {
    id: fields.id ?? String(Date.now()),
    modelName: fields.modelName ?? '',
    modelNumber: fields.modelNumber ?? '',
    manufacturer: fields.manufacturer ?? '',
    color: fields.color ?? '',
    price: fields.price ?? 0.0,
    quantity: fields.quantity ?? 0
  };
};
// #endregion fields
