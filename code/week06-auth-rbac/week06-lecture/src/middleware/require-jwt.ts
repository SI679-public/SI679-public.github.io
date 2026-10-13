import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config.js';
import { AuthenticationError } from '../errors.js';

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

  try {
    res.locals.user = jwt.verify(token, getJwtSecret());
  } catch {
    throw new AuthenticationError('Invalid or expired token');
  }

  next();
};
