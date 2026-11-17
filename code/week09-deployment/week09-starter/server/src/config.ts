// Settings that come from the environment rather than from the code.
//
// `npm run dev` and `npm start` load .env with Node's --env-file flag (see
// package.json). The tests set their own value in vitest.config.ts.

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Copy .env.example to .env.');
  }
  return secret;
};

// #region client-origin
// The one origin whose pages may call this server from a browser.
export const getClientOrigin = (): string =>
  process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
// #endregion client-origin
