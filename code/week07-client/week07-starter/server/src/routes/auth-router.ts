import express from 'express';
import * as authController from '../controllers/auth-controller.js';
import { requireJwt } from '../middleware/require-jwt.js';

export const authRouter = express.Router();

authRouter.post('/register', authController.postRegister);
authRouter.post('/login', authController.postLogin);
authRouter.get('/me', requireJwt, authController.getMe);
