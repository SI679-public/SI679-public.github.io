// #region api-url
// One place that knows how to talk to the server. Every function in
// src/api/ that reaches the server goes through apiFetch.

import { getToken } from './session.ts';

// From client/.env. Vite only hands the browser variables that start with
// VITE_, and only reads .env when `npm run dev` starts.
const API_URL = import.meta.env.VITE_API_URL;
// #endregion api-url

type Options = {
  method?: string;
  body?: unknown;
};

// #region api-fetch
export const apiFetch = async (
  path: string,
  options: Options = {}
): Promise<any> => {
  const headers: Record<string, string> = {};

  // Sending JSON? Say so, so express.json() will read it.
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // Logged in? Grab the token from the session and add it to the header.
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  // Not every response has a JSON body (Express's own 404 page is HTML),
  // so fall back to an empty object rather than crash.
  const data = await res.json().catch(() => ({}));

  // Our server answers every error with { error: "..." }. Turn it into a
  // thrown Error, which is what the components catch and show.
  if (!res.ok) {
    throw new Error(data.error ?? `${res.status} ${res.statusText}`);
  }
  return data;
};
// #endregion api-fetch
