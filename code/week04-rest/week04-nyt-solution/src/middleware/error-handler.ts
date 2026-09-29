import type { NextFunction, Request, Response } from 'express';

// Four parameters, error first: that is how Express tells an error handler
// from ordinary middleware, so `next` stays in the list even though we
// call it.
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(500).send(`ERROR: ${err.message} encountered.`);
};
