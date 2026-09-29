import type { Request, Response } from 'express';
import { productService } from '../services/product-service.js';

const getProducts = async (req: Request, res: Response): Promise<void> => {
  const allProducts = await productService.getAll();
  res.json(allProducts);
};

// Now You Try #1. This is the only layer that knows what a 404 is.
const getProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.get(String(req.params.id));
  if (!product) {
    res.status(404).json({ error: 'No product with that id' });
    return;
  }
  res.json(product);
};

const addProduct = async (req: Request, res: Response): Promise<void> => {
  const postData = req.body;
  const { id } = await productService.add(postData);
  res.status(201).json({ id });
};

// Now You Try #1 stretch. 204 means "it worked and there is nothing to send
// back", which is why there is no .json() here. 200 with a small body would
// also be a defensible choice.
const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const deleted = await productService.remove(String(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: 'No product with that id' });
    return;
  }
  res.status(204).send();
};

export const productControllers = {
  getProducts,
  getProduct,
  addProduct,
  deleteProduct
};
