import type { NextFunction, Request, Response } from 'express';
import { AuthorizationError } from '../errors.js';
import type { Role } from '../models/user.js';

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

// Not middleware itself: a function that MAKES middleware for one role.
// Always runs after requireJwt, which has put the token's payload in
// res.locals.user.
export const requireRole = (role: Role): Middleware => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (res.locals.user.role !== role) {
      throw new AuthorizationError(`Only ${role} may do this`);
    }
    next();
  };
};
