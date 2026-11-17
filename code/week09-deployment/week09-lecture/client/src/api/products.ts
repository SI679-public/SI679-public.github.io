// Products: the catalog everyone can browse, and restocking for staff.
//
// Both talk to the server: GET /products and POST /products/:id/restock.

import type { Product } from '../types.ts';
import { apiFetch } from './client.ts';

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
  // Now You Try
  return apiFetch(`/products/${id}/restock`, {
    method: 'POST',
    body: { amount }
  });
};
