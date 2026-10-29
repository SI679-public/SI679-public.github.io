---
title: "HW3 — SliceDrop: Real Users, Real Ownership, and a Loyalty Program"
---

# HW3 — SliceDrop: Real Users, Real Ownership, and a Loyalty Program

**Due:** See Canvas

**Covers:** Through Week 6 (authentication with bcrypt and JWTs, role-based access control, ownership checks)

## Overview

Two things happen to SliceDrop in HW3:

1. **Real authentication and authorization.** The two shared secrets from HW1 and HW2 are gone. Customers register and log in with a username and password (hashed with bcrypt), log in to get a JWT, and send it with every protected request. Routes check *who* is asking (`requireJwt`) and *what role* they have (`requireRole`), and orders now belong to the customer who placed them — so a customer can finally see their own orders, and only theirs.
2. **A loyalty program.** Customers earn points for every order, lose them if they cancel, and can check their balance.

## Setup and Process

Same process as before: accept the Classroom50 invitation, clone, work on `main`, push for autograder feedback (sparingly — `npm test` first), push before the deadline.

Three things are different this time:

- Run `npm install` after cloning — there are new dependencies (`bcryptjs`, `jsonwebtoken`).
- `npm run dev` needs a `.env` file with a JWT secret. It is **not** in the repo, on purpose:

  ```bash
  cp .env.example .env
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

  Paste the output into `.env` as `JWT_SECRET="..."`, **replacing** `replace-me-with-a-long-random-string`. The server will start with the placeholder, but don't leave it: anyone who knows the secret can sign their own tokens — staff ones included — and the placeholder is in every copy of this repo. `.env` is git-ignored — never commit it. If you change `.env`, restart `npm run dev`.
- On startup the server seeds one staff account into your local database: username `staff`, password `staff-password`. Registration only ever creates customers, so that's how you get a staff token in Postman.

`npm test` needs neither MongoDB nor `.env` — the tests use their own in-memory Mongo and a fixed test secret (see `vitest.config.ts`).

## Your repo compiles. The tests are your to-do list.

`npm run typecheck` passes on a fresh clone. `npm test` does not, and that's the assignment: every failing test is something to build. Expect a lot of red at first — most order and loyalty tests can't pass until authentication works, so start there (see Tips).

## What changed since HW2

| | HW2 | HW3 |
|---|---|---|
| Who you are | one of two shared secrets | a user, proven by a signed JWT |
| No token, or a bad one | 401 | 401 |
| A valid token with the wrong role | 401 | **403** — we know who you are, and you may not |
| Who can read orders | staff only | staff read every order; customers read **their own** |
| Seeded orders | two faux orders | none — every order needs an owner |

## What we provide

| File | What it is |
|---|---|
| `.env.example`, `src/config.ts`, `vitest.config.ts` | Where the JWT secret comes from: `.env` for `npm run dev`, a fixed `test-secret` for the tests. `getJwtSecret()` is how your code reads it. |
| `src/errors.ts` | `ValidationError`, `AuthenticationError`, `AuthorizationError`, `ConflictError`. Throw them from anywhere below the controllers; the error handler in `app.ts` turns them into 400, 401, 403, and 409. Request-body validators are the exception: `validateOrder` and `validateMenuItem` still return a list of every problem, and the controller answers `400 { errors }` — one thrown error would carry only one message. |
| `src/models/user.ts` | `User` (what's stored, including `hashedPassword`), `NewUser`, `PublicUser` (what leaves the server — never a password), and `Caller` (`{ id, role }`: who is asking, according to their token). |
| `src/db/users-repository.ts` | `findUserByUsername`, `findUser`, `insertUser`, and `setLoyaltyPoints`. |
| `src/seed/seed.ts` | Idempotent seeding: the menu, and the `staff` account. |
| `src/db/orders-repository.ts` | Orders now store `customerId` and `pointsEarned`; `listOrders({ status, customerId })` filters on either. |
| Cancelling an order | `PATCH /orders/:id/cancel`, end to end: `cancelOrder` in the orders service, its controller, and its route. Read it — it's your worked example of an ownership check. It has one TODO inside (see Loyalty). |
| `src/routes/menu-router.ts` | Menu writes already require a staff token: `requireJwt, requireRole("staff")`. |
| `src/__tests__/` | The autograder suites (more below). |

## What you build

Every `TODO:` in the repo, which adds up to:

```text
src/
├── services/auth-service.ts          registerUser, logIn
├── controllers/auth-controller.ts    postRegister, postLogin, getMe
├── routes/auth-router.ts             the three /auth routes
├── middleware/require-jwt.ts         requireJwt
├── middleware/require-role.ts        requireRole(...allowed)
├── services/orders-service.ts        placeOrder, listOrdersFor, getOrderFor,
│                                     and one TODO inside cancelOrder
├── controllers/orders-controller.ts  postOrder, getOrders, getOrder
├── routes/orders-router.ts           re-wire the four order routes
├── services/loyalty-service.ts       calculatePoints, addPoints, getPointsFor
├── controllers/users-controller.ts   getUserPoints
└── routes/users-router.ts            GET /users/:id/points
```

The TODO comments carry the details; this document carries the contract.

## Endpoints

| Method | Path | Who | Success | Notable errors |
|---|---|---|---|---|
| POST | `/auth/register` | anyone | 201 with the new user (no password) | 400 missing or non-string username/password, 409 username taken |
| POST | `/auth/login` | anyone | 200 `{ token }` | 401 wrong username or password |
| GET | `/auth/me` | any valid token | 200 with the token's payload | 401 |
| GET | `/menu` | anyone | 200 | — |
| GET | `/menu/:id` | anyone | 200 | 404 unknown id |
| POST | `/menu` | staff | 201 | 400 invalid body, 409 id taken |
| PATCH | `/menu/:id` | staff | 200 | 400 invalid body, 404 unknown id |
| DELETE | `/menu/:id` | staff | 204, no body | 404 unknown id |
| POST | `/orders` | customer | 201 (with `total`, `customerId`, `pointsEarned`) | 400 invalid order |
| GET | `/orders` | customer or staff | 200 — staff: every order; customer: their own (`?status=` filters either way) | — |
| GET | `/orders/:id` | customer or staff | 200 | 400 malformed id, 403 not your order, 404 unknown id |
| PATCH | `/orders/:id/status` | staff | 200 | 400 malformed id or bad status, 404 unknown id |
| PATCH | `/orders/:id/cancel` | customer | 200 | 400 malformed id, 403 not your order, 404 unknown id, 409 not pending |
| GET | `/users/:id/points` | customer or staff | 200 `{ userId, loyaltyPoints }` | 400 malformed id, 403 not you, 404 unknown user |

Every route marked customer, staff, or "any valid token" also answers **401** with no token or a bad one, and **403** for a valid token with the wrong role.

Notes:

- **Middleware order** on protected routes: `requireJwt`, then `requireRole`, then `validateId` (on `/:id` routes), then the controller. Who-are-you, then are-you-allowed, then is-your-request-well-formed.
- **The owner of an order always comes from the token** (`res.locals.user.sub`), never from the request body — anyone can type any id into a body. `customerName` still comes from the body: it's the name for pickup.
- **Orders are all or nothing.** There's no saved cart: it lives in the client until the customer places the order, which arrives complete and starts as `pending`. A customer can cancel only while it's still `pending` — once staff move it to `in-progress`, the kitchen has started, and cancel answers 409. Note that 409 CONFLICT in this case indicates a "conflict with the current state of the resource," which is a different kind of conflict than we covered in class but is the conventional choice here as well.
- **Login failures all look the same.** A wrong password and an unknown username get the same 401 and the same message; telling them apart helps an attacker.

## Authentication

`registerUser` and `logIn` follow the week 6 lecture, with one tightening each — the TODOs spell them out, and the tests check them:

- **Register:** username and password must be non-empty **strings** (400 otherwise). Everyone who registers is a customer, whatever the body says.
- **Log in:** a username or password that isn't a string is a 401. Passing non-strings to the database can cause problems, so you will need to make sure that can't happen.
- **The token** carries `sub` (the user's id), `username`, and `role`, and expires in 1 hour.

## Ownership

| | Staff | Customer |
|---|---|---|
| `GET /orders` | every order | only their own |
| `GET /orders/:id` | any order | only their own (403 otherwise) |
| `PATCH /orders/:id/cancel` | — (staff use `/status`) | only their own, and only while `pending` (409 otherwise) |
| `GET /users/:id/points` | anyone's | only their own (403 otherwise) |

Ownership is checked in the **service** layer, not in middleware. For an order, who owns it is written on the order, so the service has to fetch it first and compare. For points, the owner *is* the id being asked about, so check before looking anything up — exactly like the lecture's `getUser`.

## Loyalty

- **Earning:** 100 points per **whole** dollar of the order's total — round the total down, then multiply. A $25.47 order earns 2500 points; a $0.75 dipping sauce earns none.
- **The points are worked out once, when the order is placed, and stored on it** as `pointsEarned` — the same receipt idea as `total`.
- **Crediting:** read the user's `loyaltyPoints`, add, and save the new total with `setLoyaltyPoints`.
- **Cancelling takes the points back** — exactly the order's `pointsEarned`, and only after every check in `cancelOrder` has passed. A refused cancel must not touch anyone's points.
- Points are only ever earned and taken back — there are no redemptions — so a balance never goes below zero.

## Tests

| Suite | What it checks |
|---|---|
| `auth.e2e` | register, login, and `/auth/me` — including the token attacks from the lecture's Now You Try |
| `access.e2e` | who may call what: 401s, 403s, and middleware order |
| `menu.e2e` | menu reads and staff-only writes |
| `orders.e2e` | placing, listing, reading, status changes, ownership, and cancelling |
| `errors.e2e` | 404s, 400s, 500s, and malformed JSON |
| `users.e2e` | earning points, cancelling, and who may see a balance |
| `orders-service.unit` | `cancelOrder` writes nothing — and moves no points — unless every check passes |
| `loyalty-service.unit` | the points math, read-add-save, and that a customer asking about someone else causes no lookup at all |

## Status code summary

Everything from HW2, plus the new arrivals:

| Situation | Status |
|---|---|
| No token, a malformed one, a bad signature, or an expired one | 401 |
| Wrong username or password | 401 |
| A valid token with the wrong role | 403 |
| Someone else's order or points | 403 |
| Username already taken | 409 |
| Cancelling an order that isn't pending | 409 |

All error responses are still JSON with an `error` or `errors` field — never HTML.

## Submission

Same as before: push to `main`; the last push before the deadline is graded.

## Grading

Total Points: 120

- Autograder: 120 — 20 for passing `npm run typecheck`, then 15 points
  each for six suites (`auth`, `access`, `orders`, `users`, `errors`, and
  the `loyalty-service` unit tests) and 5 each for two (`menu` and the
  `orders-service` unit tests). Menu and `cancelOrder` are mostly given
  code, which is why those two carry less. Partial credit within a suite is
  proportional to the tests you pass.

## Tips

- **Suggested order:** `auth-service` → `auth-controller` + `auth-router` → `requireJwt` → `requireRole` → the orders router → `placeOrder` + `postOrder` → `listOrdersFor` / `getOrderFor` and their controllers → the loyalty service → `getUserPoints` and its route → the one TODO in `cancelOrder`. `npm run test:watch` and let the red turn green.
- `npm test auth` runs just the auth suite; `npm test loyalty` just the loyalty unit tests — same trick as before.
- Paste a token from `/auth/login` into https://jwt.io to see what's inside it. Anyone can read a JWT's payload; only the server can sign one.
- In Postman, set the Authorization tab to **Bearer Token** and paste the token there.
- Read `cancelOrder` before writing `getOrderFor` — it's the same move.
- If a controller starts checking who owns something, that check belongs one layer down, in the service.
