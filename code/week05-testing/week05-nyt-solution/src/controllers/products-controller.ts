import type { Request, Response } from 'express';
import * as productsService from '../services/products-service.js';

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (req.query.lowStock === 'true') {
    res.json(await productsService.getLowStockProducts());
    return;
  }
  res.json(await productsService.getAllProducts());
};

export const getProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const product = await productsService.getProduct(String(req.params.id));
  if (!product) {
    res.status(404).json({ error: 'No product with that id' });
    return;
  }
  res.json(product);
};

export const postProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const product = await productsService.createProduct(req.body);
  res.status(201).json({ id: product.id });
};

export const patchProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const product = await productsService.updateProduct(
    String(req.params.id),
    req.body
  );
  if (!product) {
    res.status(404).json({ error: 'No product with that id' });
    return;
  }
  res.json(product);
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = String(req.params.id);
  const deleted = await productsService.deleteProduct(id);
  if (!deleted) {
    res.status(404).json({ error: 'No product with that id' });
    return;
  }
  res.status(204).send();
};
