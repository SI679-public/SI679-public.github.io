// #region setup
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as usersService from './users-service.js';
import * as usersRepository from '../db/users-repository.js';
import { AuthorizationError } from '../errors.js';
import type { User } from '../models/user.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

// A user as the repository hands it back -- hashed password and all.
const grace: User = {
  id: 'grace-id',
  username: 'grace',
  hashedPassword: '$2b$11$not-a-real-hash',
  role: 'customer'
};
// #endregion setup

describe('getUser', () => {
  // #region not-looked-up
  it('never looks the user up when a customer asks for someone else', async () => {
    const findUser = vi
      .spyOn(usersRepository, 'findUser')
      .mockResolvedValue(grace);

    await expect(
      usersService.getUser({ id: 'ada-id', role: 'customer' }, 'grace-id')
    ).rejects.toThrow(AuthorizationError);

    expect(findUser).not.toHaveBeenCalled();
  });
  // #endregion not-looked-up

  it.todo('lets staff read anyone, and looks up exactly that id');
  it.todo('lets a customer read themselves');
  it.todo('never returns the hashed password');
  it.todo("returns null for a user that doesn't exist");
});
