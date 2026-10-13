# Week 6 starter — auth

The week 5 `/products` API, with all of week 5's Now You Try answers, plus a
few pieces for today. Nothing is broken: the app works and `npm test` passes.

```bash
npm install
cp .env.example .env
npm test
```

You should see passing tests and ten marked `todo`. If you don't, say so
before we go any further.

Lecture notes and instructions:
https://si679-public.github.io/weeks/week06-auth-rbac/week06-notes

## New since week 5

| File | What it is |
|---|---|
| `.env.example` | Copy it to `.env` and put your own secret in it. `.env` is never committed |
| `src/config.ts` | Reads `JWT_SECRET` from the environment |
| `src/models/user.ts` | The `User` types |
| `src/db/users-repository.ts` | Finds and saves users — the same shape as the products repository |
| `src/errors.ts` | New error classes: `ConflictError`, `AuthenticationError` and `AuthorizationError` |
| `src/middleware/error-handler.ts` | Turns those into 409, 401 and 403 |
| `src/scripts/seed-staff.ts` | Creates a staff user in your local database: `npm run seed` |
| `src/__tests__/auth.e2e.test.ts` | Now You Try #1, as `todo`s |
| `src/__tests__/users.e2e.test.ts` | `GET /users/:id` tests, as `todo`s — one written in class, two in Now You Try #2 |

`bcryptjs` and `jsonwebtoken` are already installed.

## Running

```bash
npm run dev         # needs .env, and MongoDB running locally
npm run seed        # once: creates the staff user (needs MongoDB too)
npm test            # needs neither: MongoMemoryServer, and a test secret
```
