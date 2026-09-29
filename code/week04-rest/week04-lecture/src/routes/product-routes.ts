// #region setup
import express from 'express';
import { productControllers } from '../controllers/product-controllers.js';

export const productRouter = express.Router();
// #endregion setup

// #region get
productRouter.get('/', productControllers.getProducts);
// #endregion get

// #region post
productRouter.post('/', productControllers.addProduct);
// #endregion post
