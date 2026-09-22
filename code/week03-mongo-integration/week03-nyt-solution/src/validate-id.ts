// Now You Try #2, stretch: reject malformed ids before they reach the database.
//
// Without this, GET /products/badID123 answers 500: `new ObjectId('badID123')`
// throws inside db.ts, and Express turns the thrown error into a 500. A
// malformed id is the client's mistake, not the server's, so 400 is the
// honest answer.
import { ObjectId } from 'mongodb';
import type { NextFunction, Request, Response } from 'express';

export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  if (!ObjectId.isValid(String(req.params.id))) {
    res.status(400).json({ error: 'id must be 24 hexadecimal characters' });
    return;
  }
  next();
};
