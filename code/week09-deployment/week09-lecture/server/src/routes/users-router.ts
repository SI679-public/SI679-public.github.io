import express from 'express';
import * as usersController from '../controllers/users-controller.js';
import { requireJwt } from '../middleware/require-jwt.js';

export const usersRouter = express.Router();

usersRouter.get('/:id', requireJwt, usersController.getUser);
