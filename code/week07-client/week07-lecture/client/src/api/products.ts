// Products: the catalog everyone can browse, and restocking for staff.
//
// getProducts talks to the server. restockProduct still uses the sample
// products in memory, until it is replaced with POST /products/:id/restock.

import type { Product } from '../types.ts';
import { apiFetch } from './client.ts';
import { delay, sampleProducts } from './sample-data.ts';
import { getUser } from './session.ts';

// #region get-products
export const getProducts = async (): Promise<Product[]> => {
  return apiFetch('/products');
};
// #endregion get-products

// Staff only. Adds `amount` to what is already in stock.
export const restockProduct = async (
  id: string,
  amount: number
): Promise<Product> => {
  await delay();
  if (getUser()?.role !== 'staff') {
    throw new Error('Only staff may do this');
  }
  if (!Number.isInteger(amount) || amount < 1) {
    throw new Error('amount must be a whole number, 1 or more');
  }
  const product = sampleProducts.find((p) => p.id === id);
  if (!product) {
    throw new Error('Product not found');
  }
  product.quantity += amount;
  return { ...product };
};
