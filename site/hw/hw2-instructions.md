---
title: "HW2 — SliceDrop: A Real Database, A Real Architecture"
---

# HW2 — SliceDrop: A Real Database, A Real Architecture

**Due:** See Canvas
**Covers:** Weeks 3–5 (MongoDB, testing with MongoMemoryServer, REST architecture and layering, CRUD)

## Overview

Three things happen to SliceDrop in HW2:

1. **Orders move into MongoDB.** Refactor so orders are no longer saved in memory but instead in the mongodb.  Menu from homework one will be seeded into the db for you. Keep in mind the asynchronous nature of dealing with a database.
2. **The code gets an architecture.** One folder per layer — routes → controllers → services → db — with each kind of logic in its place, the way the week 4 notes lay out.
3. **The restaurant grows.** The Phase 2 menu arrives (XL, crusts, premium toppings, desserts), the menu gets full CRUD so staff can manage it, staff can move orders through statuses, and orders get priced. Types will need updating (more below)

## Setup and Process

Same process as HW1: accept the Classroom50 invitation, clone, work on `main`, push for autograder feedback (sparingly — `npm test` first), push before the deadline.

Two things are different this time:

- Run `npm install` after cloning — there are new dependencies (`mongodb`, `mongodb-memory-server`).
- `npm run dev` needs your **local MongoDB running** (you set this up in week 3 prep). `npm test` does **not** — the tests spin up their own throwaway in-memory Mongo. The very first `npm test` downloads a MongoDB binary, so it's slow once and fast forever after.

## Your repo does not compile -- that's intentional

On a fresh clone, `npm run typecheck` fails in **exactly two files**, on purpose:

- `src/seed/menu-data.ts` — the Phase 2 menu needs things `src/models/menu-item.ts` can't describe yet: a dessert category, and crusts that have prices. The menu data is **correct**; make the types describe it. Do not edit the menu data.
- `src/validation/validate-order.ts` —  HW1 validation logic, now broken because `findMenuItem` returns a `Promise`. The rules don't change; the function has to become `async`. One Promise at the bottom of the stack percolates upward.

Fix those two and the compiler goes quiet. Then the tests take over as your to-do list.

## What we provide

| File | What it is |
|---|---|
| `src/db/db.ts` | The connection, owned by one module. `index.ts` connects **before** listening; `app.ts` never connects — that's why the tests can swap in an in-memory Mongo. |
| `src/seed/` | The Phase 2 menu, two faux orders, and idempotent seeding (checks first, inserts only when empty — restart all you like). |
| `src/middleware/validate-id.ts` | The 24-hex ObjectId check from the week 3 "Now You Try". Order routes only — menu ids are strings we chose. |
| `src/middleware/auth.ts` | Your HW1 auth, unchanged: `parseBearerToken`, `requireCustomerToken`, `requireStaffToken`. Two shared secrets, two middlewares, and a 401 when the token is missing or wrong. No users, no roles — real authentication is still a few weeks away. |
| Menu **reads** | the `getMenu` and `getMenuItem` controllers and the `getAllMenuItems` and `findMenuItem` repository functions behind them — your worked example of a request travelling through the layers. |
| `placeOrder` in `src/services/orders-service.ts` | Placing an order = pricing it + storing it. The pricing function it calls is yours. |
| `src/__tests__/` | The autograder suites, updated for Mongo and the new endpoints. |

You'll notice the menu has **no service layer**: its controllers call the data layer directly, because the menu has no business logic and a layer that only forwards calls is ceremony. Not every resource needs every layer — knowing when *not* to add one is part of the architecture lesson.

## What you build

Every `TODO:` in the repo, which adds up to:

```text
src/
├── models/menu-item.ts                the two Phase 2 modeling changes
├── routes/menu-router.ts              wire routes → middleware → controllers
├── routes/orders-router.ts            same, plus validateId on the /:id routes
├── controllers/menu-controller.ts     post / patch / delete
├── controllers/orders-controller.ts   all four
├── services/orders-service.ts         calculateOrderTotal
├── db/menu-repository.ts              insert / update / delete
├── db/orders-repository.ts            addOrder and listOrders keep their HW1
│                                      names with Mongo bodies; getOrder and
│                                      updateOrderStatus are new
└── validation/
    ├── validate-order.ts              the async refactor (+ offersCrust's new shape)
    └── validate-menu-item.ts          validation for menu bodies, full and partial
```

Note what is *not* on that list: `middleware/auth.ts`. HW1's auth carries
over untouched, so there is nothing to write there — you only have to put
`requireCustomerToken` and `requireStaffToken` in the right places in the
routers.

The TODO comments carry the details; this document carries the contract.

## Endpoints

| Method | Path | Who | Success | Notable errors |
|---|---|---|---|---|
| GET | `/menu` | anyone | 200 | — |
| GET | `/menu/:id` | anyone | 200 | 404 unknown id |
| POST | `/menu` | staff | 201 | 400 invalid body, **409 id taken** |
| PATCH | `/menu/:id` | staff | 200 | 400 invalid body, 404 unknown id |
| DELETE | `/menu/:id` | staff | **204, no body** | 404 unknown id |
| POST | `/orders` | customer | 201 (with `total`) | 400 invalid order |
| GET | `/orders` | staff | 200 (`?status=` filters) | — |
| GET | `/orders/:id` | staff | 200 | 400 malformed id, 404 unknown id |
| PATCH | `/orders/:id/status` | staff | 200 | 400 malformed id or bad status, 404 unknown id |

Notes:

- `PATCH /orders/:id/status` takes `{ "status": "..." }` and rejects anything not in `VALID_STATUSES` with a 400 naming the valid ones.
- On the `/:id` order routes, a **malformed** id (`"badID123"`) is a 400 from `validateId`; a **well-formed id that matches nothing** is a 404 from your controller. Two different situations, two different answers.
- Why can't the customer who placed an order fetch it back? Because with shared secrets every customer *is* the same customer — there is no identity to check an order against, so "your own order" is not a thing the app can express yet. Order reads are staff-only for now. Real authentication fixes this properly in a few weeks.
- Middleware order on protected routes: the token middleware (`requireCustomerToken` or `requireStaffToken`) before `validateId` before the controller. Who-are-you comes before is-your-request-well-formed — the same rule as HW1's auth-before-validation.

## Pricing

`calculateOrderTotal` in the services layer, per item:

- **base**: the chosen size's price when the item has sizes, otherwise the flat `price`
- **+ crust**: that crust's price (deep dish costs more; most cost nothing)
- **+ toppings**: each chosen topping's price — regular and premium already differ in the data
- a **sauce** choice costs nothing
- **× quantity**, sum every item, round the result to cents: `Math.round(sum * 100) / 100`

Validation runs first, so everything you look up is known to exist. The seeded orders in `src/seed/order-data.ts` show the arithmetic worked out by hand — your function must agree with them, and the tests check exact totals.

The total is computed **once, when the order is placed, and stored with it**. An order is a receipt: if menu prices change next week, the order still cost what it cost.

## Validation

Same contract as HW1: plain functions, every problem collected, empty list means valid.

- `validateOrder` — same rules as HW1, now `async`.
- `validateMenuItem(body, { partial })` — full for POST (id, name, category required), partial for PATCH (judge only what's present). Shape only: whether an id is *taken* is the controller's question, and its answer is a 409.

## Status code summary

Everything from HW1, plus the new arrivals:

| Situation | Status |
|---|---|
| Delete succeeded | 204 (no body) |
| Menu item id already exists | 409 |
| Malformed order id | 400 |

All error responses are still JSON with an `error` or `errors` field — never HTML.

## Submission

Same as HW1: push to `main`; the last push before the deadline is graded.

## Grading

Total Points: 120

- Autograder: 120 — 20 for `npm run typecheck`, and 25 for each of the four
  test suites (menu, orders, auth, errors). Partial credit within a suite is
  proportional to the tests you pass.

## Tips

- Suggested order: `models/menu-item.ts` → the `validate-order.ts` async refactor → `db/orders-repository.ts` → the two routers → `postOrder` + `calculateOrderTotal` → menu CRUD. `npm run test:watch` and let the red turn green.
- `npm test orders` runs just the order suites — same trick as HW1.
- Keep Compass open against your dev database while you Postman — watching documents appear as you place orders is the whole point of this week.
- If a controller is getting long, something in it belongs one layer down. That instinct is worth more than any single endpoint.
