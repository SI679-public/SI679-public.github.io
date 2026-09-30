# Week 4 · Now You Try solutions

This is the finished lecture code plus answers to both Now You Tries. Try them
yourself before you look.

**NYT #1 builds the routes. NYT #2 tests them.** Same code, two sittings.

| Now You Try | Where |
|---|---|
| **#1** — `GET /products/:id`, with a 404 when the id isn't there | one piece per layer: `getInCollection` in `src/db/db.ts`, `get` in `src/services/product-service.ts`, `getProduct` in `src/controllers/product-controllers.ts`, and the route in `src/routes/product-routes.ts` |
| **#1 stretch** — `DELETE /products/:id` | `deleteFromCollection`, `remove`, `deleteProduct`, and the route — the same four files |
| **#2 as published** — supertest tests for `GET /products/:id` | the `describe('GET /products/:id')` block in `src/__tests__/products.test.ts` |
| **#2 as published, stretch** — tests for `DELETE /products/:id` | the `describe('DELETE /products/:id (stretch)')` block in the same file |
| **#2 as actually assigned** — a test that POST stores a *partial* product correctly | the last `describe` block in the same file, under the note explaining the change |

Every addition is marked with a `// Now You Try` comment, so you can read the
diff by searching for that.

Two things worth reading for the *why* rather than the *what*:

- **Where the 404 lives.** `productService.get()` returns `Product | null`,
  because "no such product" is a fine answer at that layer. Only the
  controller turns the `null` into a 404, because a status code is an HTTP
  idea and the service knows nothing about HTTP.
- **What DELETE returns.** This solution answers `204 No Content`, which is
  why the controller calls `res.send()` and not `res.json()`. A `200` with a
  small body would also be defensible.

And one worth reading for how the tests are built:

- **Where a test gets an id.** `GET /products` is a route we already trust, so
  the tests use it to find out what ids the seeded products ended up with,
  rather than hard-coding anything. For the not-found cases, `'a'.repeat(24)`
  is a well-formed Mongo id that is certainly not in the database.

**The in-class Now You Try changed on the fly.** Most of the room hadn't
finished building `GET /products/:id`, so the assignment became: write a test
that a partially-specified product survives `POST /products` with the right
defaults filled in. Mark wrote it alongside the class; it failed, and it was
right to — it found a real bug in `productService.add()` that students had not
seen at the time. Both halves of the fix are in this repo, marked with
comments, and the story is in `MEMO-post-class.md`.

Run the app with `npm run dev`, the tests with `npm test`.

## Still missing on purpose

`PATCH /products/:id` isn't here. It's part of HW2.

Neither is any handling of an id that isn't a valid Mongo id at all
(`/products/banana`). `new ObjectId('banana')` throws, so that request ends up
a 500 rather than a 400. Week 3's Now You Try #2 stretch has the fix
(`validate-id.ts`); wiring it in here is a good exercise.
