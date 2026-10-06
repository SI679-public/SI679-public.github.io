import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../errors.js';

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
  res.status(500).json({ error: 'Something went wrong' });
};
