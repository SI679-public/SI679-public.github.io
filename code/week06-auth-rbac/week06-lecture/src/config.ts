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
