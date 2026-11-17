import type { Request, Response } from 'express';
import * as usersService from '../services/users-service.js';

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const caller = { id: res.locals.user.sub, role: res.locals.user.role };
  const user = await usersService.getUser(caller, String(req.params.id));
  if (!user) {
    res.status(404).json({ error: 'No user with that id' });
    return;
  }
  res.json(user);
};
