// Who is logged in, and their token.
//
// sessionStorage, not localStorage: sessionStorage belongs to one browser
// tab, so you can be a customer in one tab and staff in another. With
// localStorage every tab would share a single login.

import type { User } from '../types.ts';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const saveToken = (token: string): void => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);

export const saveUser = (user: User): void => {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const saved = sessionStorage.getItem(USER_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const clearSession = (): void => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};
