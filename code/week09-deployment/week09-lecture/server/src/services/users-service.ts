import * as usersRepository from '../db/users-repository.js';
import { AuthorizationError } from '../errors.js';
import type { PublicUser, Role } from '../models/user.js';

// Who is asking, as far as their token says.
type Caller = {
  id: string;
  role: Role;
};

export const getUser = async (
  caller: Caller,
  id: string
): Promise<PublicUser | null> => {
  // Staff may read anyone. Everyone else may read only themselves.
  if (caller.role !== 'staff' && caller.id !== id) {
    throw new AuthorizationError('You can only see your own profile');
  }

  const user = await usersRepository.findUser(id);
  if (!user) {
    return null;
  }
  return { id: user.id, username: user.username, role: user.role };
};
