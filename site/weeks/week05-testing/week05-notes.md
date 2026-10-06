---
title: Week 05 — Testing
---

# Week 05 · Testing

Last week we looked at a semi-standard layered architecture for building RESTful APIs. We build a couple of routes, top to bottom, and wrote a few e2e tests to make sure they worked as designed. There was a bit of last-minute chaos in which I came up with a new Now You Try on the fly and then when I tried to solve it I found a bug in my earlier lecture code. What fun!

We're going to pick up where we left off--today's starter code is the completed lecture code with all of the NYT solutions. However, today's starter looks a bit different from last week's code because I decided to clean up a few things I wasn't happy with and also to make sure that the lecture is more in alignment with what you'll see in HW2.

## This week's goals

- Revisit REST architecture with a bit of conceptual cleanup
- Get hands-on practice with mongodb-memory-server (MMS)
- Get started with unit testing using mocks and spies

## Before anything else

Accept the [Week05 NYT Assignment](https://classroom50.org/SI679-Classroom-F26/si-679-f-26/assignments/week05-nyt/accept?k=mjt5rszh), clone the resulting repo, then:

```bash
npm install
npm test
```

If this is the first time you're running a test with MMS, it could take a bit of time. MMS downloads a full install of MongoDB Community Edition and stores it in an obscure location on your computer. This only happens the first time you run it so subsequent runs will be much faster.

You should see passing tests and four marked `todo`.

## The app you've been given

```text
src/
├── db/            db.ts, products-repository.ts
├── models/        product.ts
├── services/      products-service.ts
├── controllers/   products-controller.ts
├── routes/        products-router.ts
├── middleware/    error-handler.ts
├── __tests__/     products.e2e.test.ts, test-products.ts
├── errors.ts
├── mocks-and-spies.unit.test.ts
├── app.ts
└── index.ts
```

This repo contains a completed API for the full set of `/products` endpoints. Most of this is what was written last week, but there are a few new pieces--most notably the PATCH route that we will walk through and then write tests for.

### Some things are named differently

| Week 4 | Now |
|---|---|
| `db/db.ts` held connection *and* collection helpers | `db/db.ts` connects; `db/products-repository.ts` reads and writes |
| `models/product.ts` held types *and* functions | `models/product.ts` holds types only |
| `product-service.ts`, `product-controllers.ts` | `products-service.ts`, `products-controller.ts` |
| `routes/product-routes.ts` | `routes/products-router.ts` |
| `productService.getAll()` | `productsService.getAllProducts()` |

These renames came about for two reasons. First, I realized during the lecture that I was not consistent with how I had named things. The lack of consistency or organizing principles likely contributed to the feeling that many of you had of being lost. Second, it became clear that José and I were a bit out of alignment on not just naming but the logic of the layers. Looking into the differences, I realized that I was off base on a few aspects (and José was right), so I wanted to straighten things out before we get too much farther.

The end result is that today's lecture is going to be your best preparation for HW2 -- for the most part the patterns and conventions you'll see here are what you'll see in the homework.

Here are the key changes from last week:

- significant change how I think about the db and service layers: last week I said that the db layer only speaks Mongo and knows nothing about application concepts like Products, Orders, etc. I learned this is not how it's typically done. Rather, in common frameworks like Ruby on Rails and NestJS, the db layer is structured into "repositories" for each entity, and these repositories are responsible for translating from DB records into "business objects." I said that's what the service layer does, but that's really about *business logic* that operates on those objects. We'll see some examples of what the service layer is for shortly.
- smaller changes to clean up naming and terminology.
  - The db layer will name its functions in mongo terms where possible (e.g., "find" and "collection")
  - The service layer will name its functions using CRUD terminology (e.g., "create," "update"). The one exception is "read" which we will call "get" since "readProduct" sounds weird and nobody does that.
  - The controller layer will name its functions in HTTP terminology ("get", "post", "patch"). This creates some conflict with the service layer (namely "get" and "delete" which appear in both lexicons), but we're just going to live with that.
- and finally, we're going to clean up some messiness around singular and plural nouns that was bugging me. The directories representing each layer will be plural nouns (this is the same): routes, controllers, services, ... except db I guess. Within those directories, files will be named `<resource>-<role>.ts`, e.g., products-service.ts, products-controller.ts.

## Following one request

We will follow the `PATCH /products/:id` route from top to bottom and then back up to the top again. At each layer, we'll ask what job that layer is supposed to do and what guarantees it makes to the layers above and/or below it.

### The router

In `routes/products-router.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/routes/products-router.ts{ts}

This is generally the thinnest layer with a very simple job--make sure the correct HTTP request gets routed to the correct controller and handler method.

**Guarantee:** `PATCH /products/:id` reaches `patchProduct`, and nothing else does.

### The controller

In `controllers/products-controller.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/controllers/products-controller.ts#patch{ts}

The job of the controller layer is to actually *handle* the HTTP request by invoking whatever service methods and/or data access functions are needed and assembling the results into a response to send back to the client. This layer also determines which HTTP status code to send with the response, depending on how things went during the attempt to handle it. Nothing below the controller layer knows anything about HTTP.

**Guarantee:** 404 for an id that isn't there, 200 and the updated product
otherwise.

### The service

In `services/products-service.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.ts#update{ts}

The service layer lives entirely within the universe of the app. It only knows about application objects (e.g., Products)--nothing about HTTP or Mongo. This is the layer where "business logic" lives. For example, it's the service layer that knows what the business knows and what a human would know, but what HTTP, TypeScript, and Mongo do not know, which is that the quantity of a product in inventory can never be negative, nor can its price. Can a price be exactly zero? Only the business would know whether that makes sense, and whatever decision is made would be captured and enforced by the service layer.

Note that the service method here (`updateProduct()`) checks if the requested operation is valid *before* applying the change. This is how the service can make sure that invalid data doesn't make it into the database, where it could do all kinds of damage if other operations end up accessing it.

There's another interesting thing going on here. The two validation checks for negative quantity and price both throw a `ValidationError` when they fail. If you look into what a `ValidationError` is (in VS Code you can right-click on it and select "Go to Source Definition" -- you can also look at the imports at the top), you'll see it's something that'd defined within our app and it's just a relabelling of the base JavaScript `Error`. Here it is, in `errors.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/errors.ts{ts}

You can then see where all it's being used (in VS Code, right-click and choose "Find All References"), you'll find that in addition to being referenced in `error.ts`, where it's defined, and in `products-service.ts` where we discovered it, it's used in the error handling middleware defined in `error-handler.ts`. This is the standard "fall through" error handler that runs when an error is thrown--in past weeks we always sent a 500 response, but here we're using `ValidationError` as a signal that a specific kind of error occurred that should result in a different status code--namely a 400 for "bad request." In `middleware/error-handler.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/middleware/error-handler.ts{ts}

Why do it this way?  Well, this gives you a standard way of dealing with errors that occur below the controller layer that should result in different information being sent back to the client. An alternative would be to use a try/catch block in the controller, but you'd have to do that in every controller and include handling code for every error type that could be generated, worry about consistent handling, etc. This is a cleaner approach.

So anyway, back to what this service method does:

**Guarantee:** quantity never goes negative — and if a change would make it so, nothing is written at all.

### The repository (a.k.a. the db layer)

In `db/products-repository.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/db/products-repository.ts#update{ts}

Here we see the revised db layer pattern in action--introducing the notion of "repositories" for each type of entity. In this case we see the repository for Products. The layer translates between Mongo and the application--turning documents into Products and vice versa.

In this instance, we are using the Mongo collection function `findOneAndUpdate` to look for the product's Document by ID and then applying an update using `$set` with the changed fields. After getting the modified doc back from Mongo, the `updateProduct` repository function turns the doc back into a product by calling `toProduct()`.

Still in `db/products-repository.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/db/products-repository.ts#toProduct{ts}

This translation function was implemented in the `models` layer last week, but with the updated notion of what repositories do in the db layer, it makes more sense to put it here.

**Guarantee:** only the fields that were sent are changed; the rest are left alone. The changed Product is persisted in Mongo.

### The model

In `models/product.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/models/product.ts{ts}

With translation moving to the db layer, the `model` layer is simplified--it's just about declaring the types used in the application.

**Guarantee:** every layer that manages Products is working from the same definition of what a Product is. Among other things, it ensures that every `Product` has an `id: string` and not an `_id: ObjectId()`.

### What each layer guarantees

| Layer | Guarantee |
| --- | --- |
| router | `PATCH /products/:id` reaches `patchProduct` |
| controller | 404 missing · 200 and the updated product otherwise |
| service | quantity never negative — and nothing is written if it would be |
| repository | only the fields that were sent change, change is persisted |
| models | all Products have the same shape; `id`, not `_id` |

### And back again...

We followed the PATCH from the top to the bottom, but of course that's not the whole story. The result of the request needs to be communicated back up through the layers and ultimately back to the client.

To follow the lifecycle of a PATCH request back up, follow the returns. Notice the type of each, as it further reinforces what each layer's job is.

| Layer | Function | Return type |
| --- | --- | --- |
| mongodb driver | findOneAndUpdate(...) | WithId\<**Document**\> \| null |
| db/repository | productsRepository.updateProduct() | Promise\<**Product** \| null\> |
| service | productsService.updateProduct() | Promise\<**Product** \| null\> |
| controller | productsController.patchProduct() | res.sendStatus() \n (actual return is `void`) |
| route | productsRouter.patch() | `200 + JSON`  ·  `404`  ·  `400` |

Note how data that starts as a Document in Mongo makes its way back up the layers and come out at the "top" as an HTTP response.

## E2E Testing tests the route as a whole

In the second half of the class today we'll look at unit testing, which will help us test each layer's guarantees individually. But before we get into that level of detail let's revisit e2e testing, which seeks to ensure that the route as a whole does what it's supposed to do, without worrying so much about identifying the individual pieces.

We'll start by looking at a couple of already-written e2e tests, then we'll write one together, and then you'll write a few on your own.

### How the suite is set up

To start, let's review our basic setup for an e2e test with supertest and mongodb memory server.

In `__tests__/products.e2e.test.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/__tests__/products.e2e.test.ts#setup{ts}

The imports at the top are mostly from the testing frameworks we're using, but include a few imports from our app, mostly for setting up the database as needed for tests.

We also need to reset the db between each test, which we do by including a `beforeEach()` that clears the db and adds the test products back in. This ensures that all tests start in a known state.

<<< ../../../code/week05-testing/week05-lecture/src/__tests__/products.e2e.test.ts#seed{ts}

### Test #1: The happy path

The first test you will often write is the one that makes sure that what you expect to happen when everything goes right actually does. In the case of our PATCH, we expect a well-behaved client to send a PATCH request with a valid ID and some valid fields that are changed to valid values. When that happens, the API should return status 200 with the updated Product in the body.

<<< ../../../code/week05-testing/week05-lecture/src/__tests__/products.e2e.test.ts#patchUpdates{ts}

Also note the shape of this test, as it's the pattern you'll generally use for such things:

- **arrange:** create the conditions you need for the test to work
  - here, this involves getting a valid ID from the GET route, which we are trusting to work here since it's not what we're testing--other tests should be making sure GET works as advertised.
- **act:** do the thing that you are testing
  - here, this is sending the PATCH request and grabbing the response
- **assert:** verify that what should be true is true after the action completes
  - here, assert that the status is 200 and the response body contains a price that matches the one that was provided. If these things aren't true after what we just did, the route must be broken.
  - note that we don't actually care which product got updated because $12.50 is a valid price for any product in our system. It *is* important, however that we know that no existing product *starts* with a price of 12.5. Look at `test-products.ts` and convince yourself that if this test succeeds, the route does actually do what it's supposed to do in this case.

### Test #2: Test the business logic

There are a lot more things that can go wrong than can go right, and most of testing is about figuring out what those things are and making sure that your code does the right thing and doesn't break. Here, we'll test the "business logic" we looked at in `updateProduct()` in `products-service.ts` that rejects certain quantity updates. What was that logic by the way? What updates are rejected and what happens when they're rejected? Feel free to take a peek at `updateProduct()` to refresh your memory.

<<< ../../../code/week05-testing/week05-lecture/src/__tests__/products.e2e.test.ts#patchRejects{ts}

### Test #3: The 404

One of the most straightforward sad paths is the one where the client tries to update a product that doesn't exist. This one is not provided in the starter code, so we'll write it together.

This one needs no arranging, so we just **act** (send a patch with `aaaaaaaaaaaaaaaaaaaaaaaa` as the ID -- you can check `test-products.ts` if you're worried this might actually be a valid ID) and then **assert**. Out of curiosity, how far down into the layers does an invalid ID get? And how does the API figure out that a 404 is the right response?

<<< ../../../code/week05-testing/week05-lecture/src/__tests__/products.e2e.test.ts#patch404{ts}

## Now You Try #1

::: tip Lost? Catch up here
Nothing in this exercise depends on anything you wrote — the app is complete
and the suite passes. If your `npm test` isn't green before you start, fix
that first.
:::

Your job is to finish the `PATCH /products/:id` block in
`src/__tests__/products.e2e.test.ts`. Three tests are stubbed with
`it.todo`, which is Vitest's way of saying "planned, not written" — they show
up in the output as todo rather than as failures.

Replace each `it.todo(...)` with a real `it(..., async () => { ... })` and
make it pass. They are in order of difficulty.

**1. `rejects a change that would make the price negative`**

The savvy coder will notice that you have a test already that is very, very similar to this one. Use that as a template and just change what needs changing.

**2. `leaves the other fields alone`**

PATCH one field of one product, then check that the field you sent changed
*and* that at least two you didn't send did not. This is also pretty similar to a test you already have, but you'll need to also figure out how to verify that fields that were not part of the request stayed unchanged.

**3. `leaves the product unchanged after a rejected change`**

So far we've focused on verifying that bad requests return the correct responses, but we haven't actually checked that they didn't result in bad data making it into the DB. For this test, make a change that gets rejected, then go and ask for the product again and confirm that nothing about it moved.

This test has a different shape from the rest so far: the interesting
assertion is about a *different request* than the one being tested. You PATCH,
and then you GET to find out whether the PATCH kept its word.

### You're done when...

`npm test` shows no todos and no failures.

Lecture code with Now You Try solutions can be found [on GitHub](https://github.com/SI679-public/SI679-public.github.io/tree/main/code/week05-testing/week05-nyt-solution).

## Unit testing tests one layer alone

We've mentioned "unit testing" a few times and now we'll finally get into what that means, why it's needed, and how to do it.

In a nutshell, unit testing is all about testing "units" of functionality--generally speaking the "unit" of interest is a single function. Your entire app is built out of these units of functionality, and they all need to do what they say they will for the whole thing to work.

At a high level, unit tests work the same as e2e tests. You **arrange**, **act**, and **assert** in both. A key difference is that with unit tests you use different tools including *mocks* and *spies* to isolate the unit under test so that there is no leakage in or out. You only test the specific unit (i.e., function) and fake everything around it so that any successes or failures can be attributed only to the unit under test.

::: details Regression testing is forever
One of the things that makes unit testing so valuable is that you write the tests once but then you run them ALL THE TIME. Every time you make a change to anything you run the entire set of test suites. This way you guard against a change to one part of the system impacting the way another part works -- this idea of running previously passed tests every time a change is made to any part of the system is called "regression testing," because it's intended to protect against "regression" in the code base (regression means "moving backwards", more or less, and you don't want to be doing that). "Regression testing" does not specify what you're testing or how--and both unit and e2e testing (along with other types) can and usually are part of a regression testing strategy.
:::

### Mocks and spies

Three essential tools for unit testing are *fakes*, *mocks*, and *spies*.

All of the examples in this section come from `src/mocks-and-spies.unit.test.ts`, which is in the starter. It doesn't test anything in our app--it's there so you can run these examples yourself with `npm run test:unit` and poke at them.

A *fake* is a placeholder function that stands in for a real function. You create a fake in `vitest` using `vi.fn()`. They don't do anything, but can behave like real functions when you need them to. Importantly, they can remember when they were called and what they were called with. We'll see why this is useful in a moment, but for now here's an example:

<<< ../../../code/week05-testing/week05-lecture/src/mocks-and-spies.unit.test.ts#recorder{ts}

A *mock* is a fake function that returns something you have specified. A mock can replace a real function in code that you're testing so that your code thinks it's calling the function and getting a result, but in fact it's just getting a canned return value that you made up. If you have a fake (via `vi.fn()`) you can mock its return using `mockReturnValue()`:

<<< ../../../code/week05-testing/week05-lecture/src/mocks-and-spies.unit.test.ts#answer{ts}

If you're mocking an async function, the idea is the same but the function is worded differently since Promises *resolve* rather than *return*:

<<< ../../../code/week05-testing/week05-lecture/src/mocks-and-spies.unit.test.ts#asyncAnswer{ts}

Creating fake functions and testing them is fun and all, but where it all comes together is when you use `vitest` to *replace real functions with fake ones*. You can do this by first creating a *spy*, which is a wrapper around a real function that keeps track of when it's been called and what it's been called with. To create a spy, you call `vi.spyOn()` with two arguments--the module or object name, and the function name. In the following code, `vi.spyOn()` *does not replace the real function inventory.countOnHand()*, it just keeps track of it.

<<< ../../../code/week05-testing/week05-lecture/src/mocks-and-spies.unit.test.ts#realThing{ts}

With fakes, mocks, and spies in your toolbox, you can now put them all together to *mock a real function and spy on it all at the same time*. This is what you will mainly be doing in your unit tests so that you can make sure that

- the code you are testing does the right thing when the functions it calls behave as expected, and
- the code you are testing does not actually impact anything outside itself by calling real functions that have side effects

In the following, `vi.spyOn().mockReturnValue()` completely replaces `inventory.countOnHand()`, but the code that calls it (inside the first `expect()`) is none the wiser.

<<< ../../../code/week05-testing/week05-lecture/src/mocks-and-spies.unit.test.ts#replace{ts}

### Unit testing in the /products route

Here's the function we'll test first. In `services/products-service.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.ts#lowStock{ts}

Our expectation is that if this function is called with a number (say, 5) and there are, say, two out of three products in the database with `quantity < 5`, the function will return just those two products and no others. So let's test that to be sure.

### Setting up the file

This file isn't in the starter--we're writing it from scratch. Create `src/services/products-service.unit.test.ts`. Copy the next two snippets into that file

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.unit.test.ts#setup{ts}

Note the call to `vi.restoreAllMocks()` in `beforeEach()`--this does what it sounds like it does and makes sure that every test starts clean, with all functions back in their normal, unmocked state.

Note also that we're importing code from our app--namely the functions from `productsService` and `productsRepository`. We're importing them for different reasons though. `productsService` contains the functions we are going to *test* (you can tell this by looking at the test file name--it tells you this test file goes with the code file `products-service.ts`). `productsRepository`, however, contains functions that we will *mock*, since those are where most of the functions called by `productsService` functions come from.

Next copy in a utility function that will make it easy for our tests to create dummy products to be used in tests.

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.unit.test.ts#factory{ts}

### Our first "real" unit test: mocking the repository

:::info An e2e test for low stock
As it happens, we already have an e2e test for low stock. It's been in the suite the whole time, in `__tests__/products.e2e.test.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/__tests__/products.e2e.test.ts#lowStock{ts}

This does indeed test the `getLowStockProducts()` function, but it also tests a lot more. And if, say, the test failed because the status wasn't 200 or because the returned product array didn't contain 'Keurig' you'd be hard pressed to tell at a glance whether the problem lay with the controller, service, or repository (or somewhere else--maybe `test-products.ts`?). A unit test gives you a much more focused place to look for what went wrong.
:::

Here's the unit test that gets right at the heart of the matter. In `services/products-service.unit.test.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.unit.test.ts#lowStock{ts}

We see the same arrange / act / assert shape we talked about earlier, but each
part is doing its thing a bit differently than how it's done in supertest.

- **arrange:** `vi.spyOn(productsRepository, 'findAllProducts')` wraps that one function for the duration of this test, and `.mockResolvedValue([...])` mocks it -- so the service gets exactly the
three products we want it to see and the real repository is never reached.
- **act:** call `productsService.getLowStockProducts(5)` directly, passing the threshold explicitly rather than leaning on the default, so the test says what it means.
- **assert:** two of the three come back, and we check *which* two.

Crucially, note that when the function under test, `getLowStockProducts()`, calls `productsRepository.findAllProducts()` it has no idea it's being duped! Here it is again, back in `services/products-service.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.ts#lowStock{ts}

It is able to make that call and get the result just as it would if it were running in the production environment.

#### Pin the boundary

Here's a question the e2e test can't answer without new seed data: is a product with exactly five units low stock or not?

Also in `services/products-service.unit.test.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.unit.test.ts#boundary{ts}

### Asking the spy what it saw: `updateProduct`

In the last test we mocked a spy but never asked it anything. For this next one, we need to know what the spy knows. In `updateProduct()`, the service is supposed to pass along only the fields it was given and nothing else. Using a spy we can test this assumption.

Here's the code we are testing (in `services/products-service.ts`):

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.ts#update{ts}

... and here's the test, in `services/products-service.unit.test.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.unit.test.ts#spy{ts}

Two repository functions, `findProduct()` and `updateProduct()`, are spied on and both are mocked, but for different reasons.

- `findProduct` is here only for its mocked answer. The service needs an existing product to compare against, so we hand it one--but we don't ask the spy anything because there's nothing interesting to learn.
- `updateProduct` is what this test is interested in. We keep what `vi.spyOn` returns, in a variable called `update`, and check what it was called with to make sure it was *only* the right arguments--the ID and an object containing exactly the one field that was passed to `updateProduct()` (which, you will recall, is the thing we're actually testing).

### A spy with no mock: the test that proves nothing happened

There are two validation checks in `updateProduct()`, and if either of them fail there should be an error thrown and no change to the database. We can use a spy to test this--in this case we want to make sure that NO calls were made to the spied-on function (`productsRepository.updateProduct()`). We don't give the spy a mock return because we aren't expecting it to be called.

Again in `services/products-service.unit.test.ts`:

<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.unit.test.ts#notCalled{ts}

Compare the elegance of `.not.toHaveBeenCalled()` to the hijinks that were needed to complete the third todo in NYT1 earlier (`leaves the product unchanged after a rejected change`). We had to do a whole 'nother GET to check that no damage was done by a failed update--here we can just verify that the function that would do the damage remains untouched.

Note that we still have the same spy+mock for `findProduct()` that we had in the previous test, and for the same reason.

:::details Streamlining test running
**`test:unit` vs `test:e2e`**

Look at the scripts in `package.json`:

```json
"test": "vitest run",
"test:unit": "vitest run unit.test --passWithNoTests",
"test:e2e": "vitest run e2e.test"
```

Run them both and watch the clock:

```bash
npm run test:unit
npm run test:e2e
```

There's nothing clever here: the argument after `vitest run` is a filter on the test file's path, and our naming
convention (`*.unit.test.ts` next to the code it tests, `*.e2e.test.ts` in `__tests__/`) is what makes the filter work.
:::

One final point before turning it over to you: we've now looked at two kinds of tests that you're likely to see a lot of if you work in any kind of software development environment:

- A **unit test** exercises one function with its neighbors faked
- An **end-to-end test** exercises the whole system through its public interface -- for us, HTTP.

But there are others (many others, actually, depending on who you ask). The one we haven't discussed that you're most likely to encounter, however, is an **integration test**, which more or less sits in between **unit** and **e2e**. These tests look at the integration of more than one component, but mock everything outside the subsystem under test. For example, you might have integration tests that exercise the real `service` and `controller` functions, but mock the `repositories`, or ones that mock the mongo layer to test that the `repositories` and `service` layer are behaving as designed. We won't have time to get into integration testing or any of its cousins, but with what we've covered you essentially have the tools for creating and running them--there's just a bit more art to selecting which ones are worth creating and sealing off the boundaries around them than there is with unit or e2e.

## Now You Try #2

Here's the whole file so far, plus three `it.todo()` placeholders for you to fill in. Copy the whole file if you got a little lost, or just copy the `todo`s into the right places.

This should be your `src/services/products-service.unit.test.ts` to start the NYT:

:::details `src/services/products-service.unit.test.ts`
<<< ../../../code/week05-testing/week05-lecture/src/services/products-service.unit.test.ts{ts}
:::

Three more todos, in order of difficulty. Same drill as before: replace each `it.todo(...)` with a real `it(..., async () => { ... })` and make it pass.

Run with `npm run test:unit`.

**1. `writes nothing when the price would go negative`**

The service guards two fields, and we only tested one of them. The test directly above this todo provides a template; work out what has to change.

**2. `returns null when there is no product with that id`**

A different sad path. When the id isn't in the database, `updateProduct` doesn't throw an error--go look at the service and see what it does instead. There are two things worth asserting here, and the second one is the same assertion that made the previous test interesting.

Hint: `mockResolvedValue(null)` is how you fake a lookup that finds nothing.

**3. `fills in defaults before handing it to the repository`**

This one is about `createProduct`, so it sits in its own `describe` block. Call it with a product that specifies
only `modelName`, and prove that what reached the repository had all six fields filled in.

There is already an e2e test for this, in the POST `describe` block: `fills in defaults for the fields that were left out`. That was actually the test that solved the 2nd NYT last week that found the bug I posted about on Canvas. Go read that test, then write the unit test version, and then think about the difference between what you would learn from the two--which one isolates the problem more cleanly?

Note that `insertProduct` needs an answer as well as being watched, because the service returns whatever comes back from it. `makeProduct({})` will do for mocking the resolved value.

### You're done when...

`npm run test:unit` shows no todos and no failures, and `npm test` runs both suites green.

Lecture code with Now You Try solutions can be found [on GitHub](https://github.com/SI679-public/SI679-public.github.io/tree/main/code/week05-testing/week05-nyt-solution).
