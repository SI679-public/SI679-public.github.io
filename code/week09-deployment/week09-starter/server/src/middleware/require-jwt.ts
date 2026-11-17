import type { NextFunction, Request, Response } from 'express';
import { AuthenticationError } from '../errors.js';
import { verifyToken } from '../services/auth-service.js';

export const requireJwt = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AuthenticationError('No token');
  }
  const token = header.slice('Bearer '.length);

  // The checking itself moved into the auth service this week, so the
  // socket server can use it too.
  res.locals.user = verifyToken(token);

  next();
};
