// Logging in, registering and logging out.
//
// login talks to the server: POST /auth/login, then GET /auth/me. register
// still uses the sample users in memory, until it is replaced with
// POST /auth/register.

import type { User } from '../types.ts';
import { apiFetch } from './client.ts';
import { delay, sampleUsers } from './sample-data.ts';
import { clearSession, getUser, saveToken, saveUser } from './session.ts';

// #region login
export const login = async (
  username: string,
  password: string
): Promise<User> => {
  // 1. Trade the username and password for a token, and keep it.
  const { token } = await apiFetch('/auth/login', {
    method: 'POST',
    body: { username, password }
  });
  saveToken(token);

  // 2. Ask the server who that token belongs to. apiFetch sends the token
  //    we just saved.
  const me = await apiFetch('/auth/me');
  const user: User = { username: me.username, role: me.role };
  saveUser(user);
  return user;
};
// #endregion login

// Registering only ever makes customers. Staff accounts come from the
// server's seed script.
export const register = async (
  username: string,
  password: string
): Promise<User> => {
  await delay();
  if (!username || !password) {
    throw new Error('username and password are required');
  }
  if (sampleUsers.some((u) => u.username === username)) {
    throw new Error('That username is taken');
  }
  sampleUsers.push({ username, password, role: 'customer' });
  return login(username, password);
};

export const logout = (): void => {
  clearSession();
};

export const getCurrentUser = (): User | null => getUser();
