// #region register
import type { Request, Response } from 'express';
import * as authService from '../services/auth-service.js';

export const postRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await authService.registerUser(
    req.body?.username,
    req.body?.password
  );
  res.status(201).json(user);
};
// #endregion register

// #region login
export const postLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = await authService.logIn(
    req.body?.username,
    req.body?.password
  );
  res.json({ token });
};
// #endregion login

// #region me
export const getMe = (req: Request, res: Response): void => {
  res.json(res.locals.user);
};
// #endregion me
