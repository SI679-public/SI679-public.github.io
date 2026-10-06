export type Product = {
  id: string;
  modelName: string;
  modelNumber: string;
  manufacturer: string;
  color: string;
  price: number;
  quantity: number;
};

export type NewProduct = {
  modelName: string;
  modelNumber: string;
  manufacturer: string;
  color: string;
  price: number;
  quantity: number;
};

export type ProductFields = Partial<Product>;
