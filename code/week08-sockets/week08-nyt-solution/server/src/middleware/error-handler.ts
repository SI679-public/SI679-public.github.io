import type { NextFunction, Request, Response } from 'express';
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  ValidationError
} from '../errors.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof AuthenticationError) {
    res.status(401).json({ error: err.message });
    return;
  }
  if (err instanceof AuthorizationError) {
    res.status(403).json({ error: err.message });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Something went wrong' });
};
