// #region imports
import type { Request, Response } from 'express';
import { productService } from '../services/product-service.js';
// #endregion imports

// #region getProducts
const getProducts = async (req: Request, res: Response): Promise<void> => {
  const allProducts = await productService.getAll();
  res.json(allProducts);
};
// #endregion getProducts

// #region addProduct
const addProduct = async (req: Request, res: Response): Promise<void> => {
  const postData = req.body;
  const id = await productService.add(postData);
  res.status(201).json({ id });
};
// #endregion addProduct

// #region exports
export const productControllers = {
  getProducts,
  addProduct
};
// #endregion exports
