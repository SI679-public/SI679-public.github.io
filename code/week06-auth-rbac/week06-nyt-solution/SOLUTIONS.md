# Week 6 · Now You Try solutions

**Now You Try #2 has one expected part and two optional ones.** Everyone
should do the ownership tests. Locking `DELETE` — and then `PATCH`, and
fixing the tests that breaks — is there if you finish early or want more
practice; the answers are here either way.

This is the lecture code plus answers to the Now You Tries. Try them yourself
before you look.

| Now You Try | Where |
|---|---|
| **#1** — attack your own tokens | `src/__tests__/auth.e2e.test.ts` |
| **#2** — test ownership, end to end and one layer down (**expected**) | `src/__tests__/users.e2e.test.ts` and `src/services/users-service.unit.test.ts` |
| **#2, stretch** — lock `DELETE /products/:id` (optional) | `src/routes/products-router.ts`, and the `DELETE` block at the bottom of `src/__tests__/products.e2e.test.ts` |
| **#2, more stretch** — lock `PATCH /products/:id` too, and fix the tests that break (optional) | `src/routes/products-router.ts`, and the six `// Stretch` lines in the `PATCH` block of `src/__tests__/products.e2e.test.ts` |

Every Now You Try answer is marked with a `// Now You Try` comment, and
every stretch answer with `// Stretch`. The first test, `200s with the username for a token we sign ourselves`,
was written in the lecture.

## Worth reading for the why, not the what

- **Four of these tests make their own tokens; one logs in for real.** The
  four attacks test the lock: they hand `requireJwt` a bad key and check it
  stays shut. The last test tests the key: it proves that what our login
  route hands out actually opens the door. Only that one needs a database.

- **What the four attacks catch.** Swap `jwt.verify(token, ...)` in
  `require-jwt.ts` for `jwt.decode(token)` — which reads a token without
  checking it — and every one of them goes red, while the real-login test
  still passes. That is a real and common mistake, and from the outside the
  app looks like it works.

- **The edited payload is the one to think about.** You could read the
  payload without the secret — it's only encoded — and you could change it.
  What you couldn't do was make a signature to match. That's the whole job
  of the signature, and it's why nothing secret ever goes in a token: anyone
  holding one can read it.

- **The unit test that sees what the e2e tests can't.** `getUser()` checks
  ownership *before* it looks the user up. Swap those two blocks and every
  e2e test in `users.e2e.test.ts` still passes — but now a customer asking
  for an id that exists gets a 403, and one that doesn't gets a 404, which
  tells them which accounts exist. The unit test `never looks the user up
  when a customer asks for someone else` catches it, because a spy can see
  what an HTTP response can't: whether the database was asked at all.

- **The unit tests need no token, no Express and no database.** `getUser()`
  takes a plain `Caller` object, so a test just hands it one. That is the
  payoff of keeping HTTP out of the service.

- **Why locking `PATCH` breaks six tests and locking `DELETE` breaks none.**
  Week 5 wrote six `PATCH` tests and no `DELETE` tests. The six all send a
  request with no token, which is now a 401. The fix is the one from class:
  send the staff token.

## Running it

```bash
npm install
cp .env.example .env
npm test            # everything
npm run test:unit   # fast: no database, no HTTP
npm run test:e2e    # starts MongoMemoryServer
```
