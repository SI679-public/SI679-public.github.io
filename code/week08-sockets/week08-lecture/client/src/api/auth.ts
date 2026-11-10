// Logging in, registering and logging out.
//
// All of these talk to the server: POST /auth/login and GET /auth/me, and
// POST /auth/register.

import type { User } from '../types.ts';
import { apiFetch } from './client.ts';
import { clearSession, getUser, saveToken, saveUser } from './session.ts';
import { reconnectSocket } from './socket.ts';

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

  // 3. Reconnect the live updates, this time as this user.
  reconnectSocket();
  return user;
};
// #endregion login

// Registering only ever makes customers. Staff accounts come from the
// server's seed script.
// #region register
export const register = async (
  username: string,
  password: string
): Promise<User> => {
  // Now You Try: create the account, then log in as it.
  await apiFetch('/auth/register', {
    method: 'POST',
    body: { username, password }
  });
  return login(username, password);
};
// #endregion register

export const logout = (): void => {
  clearSession();
  reconnectSocket();
};

export const getCurrentUser = (): User | null => getUser();
