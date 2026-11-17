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

describe('getUser', () => {
  it('never looks the user up when a customer asks for someone else', async () => {
    const findUser = vi
      .spyOn(usersRepository, 'findUser')
      .mockResolvedValue(grace);

    await expect(
      usersService.getUser({ id: 'ada-id', role: 'customer' }, 'grace-id')
    ).rejects.toThrow(AuthorizationError);

    expect(findUser).not.toHaveBeenCalled();
  });

  // Now You Try
  it('lets staff read anyone, and looks up exactly that id', async () => {
    const findUser = vi
      .spyOn(usersRepository, 'findUser')
      .mockResolvedValue(grace);

    const user = await usersService.getUser(
      { id: 'staff-id', role: 'staff' },
      'grace-id'
    );

    expect(findUser).toHaveBeenCalledWith('grace-id');
    expect(user?.username).toBe('grace');
  });

  // Now You Try
  it('lets a customer read themselves', async () => {
    vi.spyOn(usersRepository, 'findUser').mockResolvedValue(grace);

    const user = await usersService.getUser(
      { id: 'grace-id', role: 'customer' },
      'grace-id'
    );

    expect(user?.username).toBe('grace');
  });

  // Now You Try
  it('never returns the hashed password', async () => {
    vi.spyOn(usersRepository, 'findUser').mockResolvedValue(grace);

    const user = await usersService.getUser(
      { id: 'grace-id', role: 'customer' },
      'grace-id'
    );

    expect(user).toEqual({ id: 'grace-id', username: 'grace', role: 'customer' });
    expect(user).not.toHaveProperty('hashedPassword');
  });

  // Now You Try
  it("returns null for a user that doesn't exist", async () => {
    vi.spyOn(usersRepository, 'findUser').mockResolvedValue(null);

    const user = await usersService.getUser(
      { id: 'staff-id', role: 'staff' },
      'nobody-id'
    );

    expect(user).toBeNull();
  });
});
