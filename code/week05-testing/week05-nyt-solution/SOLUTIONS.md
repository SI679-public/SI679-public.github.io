# Week 5 · Now You Try solutions

This is the finished lecture code plus answers to both Now You Tries. Try
them yourself before you look.

**NYT #1 tests the route from the outside. NYT #2 tests one layer from the
inside.** Same app, same guarantees, two angles on them.

| Now You Try | Where |
|---|---|
| **#1** — three more e2e tests for `PATCH /products/:id` | the `describe('PATCH /products/:id')` block in `src/__tests__/products.e2e.test.ts` |
| **#2** — two more unit tests for `updateProduct`, plus one for `createProduct` | `src/services/products-service.unit.test.ts` |

Every addition is marked with a `// Now You Try` comment, so you can read the
diff by searching for that.

Two other things in here were written during the lecture rather than left as
exercises: the e2e test `404s when the id is not in the database`, and all of
`products-service.unit.test.ts` above the Now You Try comments. If you missed
class, those are worth reading first — the exercises are variations on them.

## Worth reading for the why, not the what

- **Why `leaves the product unchanged after a rejected change` sends two
  requests.** The 400 only proves the request was *refused*. It says nothing
  about what is now in the database. The GET afterwards is the part that
  proves nothing was written, which is why this test has a different shape
  from the others: the interesting assertion is about a different request
  than the one being tested.

- **The same guarantee, checked twice.** That e2e test and the unit test
  `writes nothing when quantity would go negative` are both about the
  service's promise that an illegal change writes nothing at all. One drives
  the whole stack and then goes looking for damage; the other watches
  `productsRepository.updateProduct` and proves it was never called. Neither
  is wrong. The unit test tells you exactly which function misbehaved; the
  e2e test tells you the system really works when it is all plugged
  together.

- **Why `insertProduct` is mocked as well as watched** in the `createProduct`
  test. The service returns whatever the repository hands back, so a bare
  `vi.spyOn` would let the call through to the real function and go looking
  for a database. The product we hand back is thrown away — the mock is only
  there to stop the call leaving the building.

- **Why `toEqual(before)` is safe** in the unchanged-after-rejection test.
  Both objects come back from the API as JSON, so both are plain `Product`
  shapes with no `_id` — comparing them whole is stronger than checking a
  few fields by hand, and it will catch a field you didn't think to list.

## Running it

```bash
npm install
npm test            # both suites
npm run test:unit   # fast: no database, no HTTP
npm run test:e2e    # starts MongoMemoryServer
```

`src/mocks-and-spies.unit.test.ts` is the tour of `vi.fn`, `mockReturnValue`
and `vi.spyOn` from the lecture. It tests nothing about this app and is here
to be poked at.

## Still missing on purpose

Nothing tests `DELETE /products/:id`, at either level. If you want more
practice, that's the obvious next thing: an e2e test that a deleted product
is really gone, and a unit test that the service asks the repository to
delete the right id.

Nothing handles an id that isn't a valid Mongo id at all
(`/products/banana`). `new ObjectId('banana')` throws, and that error isn't a
`ValidationError`, so the fall-through handler turns it into a 500 rather
than a 400. Same gap as week 4, and the fix from week 3's Now You Try #2
stretch (`validate-id.ts`) still applies.
