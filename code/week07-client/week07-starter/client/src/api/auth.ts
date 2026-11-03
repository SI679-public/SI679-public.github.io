// Logging in, registering and logging out.
//
// Right now these check the sample users in memory. In class we replace each
// function body with a request to the server: POST /auth/login,
// POST /auth/register, GET /auth/me.

import type { User } from '../types.ts';
import { delay, sampleUsers } from './sample-data.ts';
import { clearSession, getUser, saveToken, saveUser } from './session.ts';

export const login = async (
  username: string,
  password: string
): Promise<User> => {
  await delay();
  const found = sampleUsers.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) {
    throw new Error('Wrong username or password');
  }
  const user: User = { username: found.username, role: found.role };
  saveToken('sample-token');
  saveUser(user);
  return user;
};

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
