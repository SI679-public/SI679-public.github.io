---
title: Week 04 — Post-Class Memo
---

# The bug in the last exercise

*Posted after the Week 04 class on 9/29.*

I changed the last Now You Try on the fly with about fifteen minutes left, and I
did not write the new version down anywhere. This post documents that assignment and points you at the solution, but it does even more than that! **While you were
working on it, I was too — and my test failed.** This is actually a better demonstration of the value of testing than I could've dreamt up on my own--I wrote a pretty good test and the failure revealed a bug in the code that we had been writing in class!

If you got far enough to run your own version of the test and it failed too, it's worth a second look: your test may well have been right, and may have caught the same bug mine did.

**You do not need to have finished either Now You Try to follow what's
below.** It is about the `/products` code we wrote together, not about
`GET /products/:id` or `DELETE /products/:id`.

## The revised NYT2 assignment

Write a test that verifies that a **partially specified** product handed to
`POST /products` is inserted correctly — the fields you supply are written where
they belong, and the defaults from `productFromFields()` are applied to everything
you left out.

That's it. It is a small test, and while it was not without challenges to figure out, it didn't require anything fundamentally new compared to the other tests we had just written.

## The test I wrote

Approach: Send `POST /products` a product with only *some* of its fields, then read it
back and check that the missing ones came back as the defaults that
`productFromFields()` is supposed to supply:

```ts
const partialProduct = {
  modelName: 'My Model',
  manufacturer: 'My Manufacturer',
  color: 'green',
  price: 5.5
};
// no modelNumber, no quantity

const created = await request(app).post('/products').send(partialProduct);
const all = await request(app).get('/products');
const stored = all.body.find((p) => p.id === created.body.id);

expect(stored.modelName).toBe(partialProduct.modelName); // ← passed
expect(stored.price).toBe(partialProduct.price);         // ← passed
expect(stored.modelNumber).toBe('');   // ← failed: got undefined
expect(stored.quantity).toBe(0);       // ← would fail but never got here
```

## What was wrong

Here is `add()` in `services/product-service.ts` as we wrote it:

```ts
const add = async (productInfo: ProductFields): Promise<Product> => {
  const { insertedId } = await db.addToCollection(db.PRODUCTS, productInfo);
  return productFromFields({ ...productInfo, id: insertedId.toString() });
};
```

Look carefully at those two lines, especially the order.

**Line 1** hands `productInfo` — exactly what the caller sent, missing fields
and all — straight to the database.

**Line 2** *then* calls `productFromFields()`, which fills in the defaults.

So the defaults were applied to the value we handed back to the caller, and
never to the document we stored. The database kept a half-filled product.

## Why it had gone unnoticed all afternoon

There were three reasons, all worth noting.

**The POST response looked perfect.** Our controller sends back only the id:
`res.status(201).json({ id })`. Everything `productFromFields()` fixed up was
thrown away one line later. The one thing the response *did* contain was the
one thing that was right.

**Every product we posted in class had all seven fields.** With nothing
missing, there is nothing to default, and the bug cannot show itself. It only
appears for a *partial* product — which is the case `ProductFields` and
`Partial<>` exist to support, and the case we never tried.

**Postman would not have caught it either.** You would have had to post a
partial product, then go and look at the document in Compass and notice a
field that wasn't there. The test caught it because a test *reads back*.

## The fix, in two parts

### Fill in the defaults before the insert

```ts
const product = productFromFields(productInfo);
const { insertedId } = await db.addToCollection(db.PRODUCTS, product);
```

That fixes the failing test. It also introduces a second, quieter problem.

### Don't store the placeholder id

Look at what `productFromFields()` returns when you don't give it an id:

```ts
id: fields.id ?? String(Date.now()),
```

It invents one. That is fine for an object in memory, but we just handed the
whole object to Mongo — so the stored document now carries an `id` field
holding something like `"1790716131668"`, sitting right next to the `_id` that
Mongo generated. Two ids, one real.

You would never see it through the API, because `productFromDocument()`
overwrites `id` from `_id` on the way out. You *would* see it in Compass, and
it is exactly the confusion the `/models` layer exists to prevent.

So store the fields, and not the id:

```ts
const add = async (productInfo: ProductFields): Promise<string> => {
  const product = productFromFields(productInfo);

  const { insertedId } = await db.addToCollection(db.PRODUCTS, {
    modelName: product.modelName,
    modelNumber: product.modelNumber,
    manufacturer: product.manufacturer,
    color: product.color,
    price: product.price,
    quantity: product.quantity
  });

  return insertedId.toString();
};
```

::: info Fancy syntax
A more compact way to say "everything except the id":

```ts
const add = async (productInfo: ProductFields): Promise<string> => {
  const product = productFromFields(productInfo);
  const { id, ...productWithoutId } = product;
  const { insertedId } = await db.addToCollection(
    db.PRODUCTS,
    productWithoutId
  );
  return insertedId.toString();
};
```

The second line is a **destructuring assignment** with a **rest element**:
pull `id` out into its own variable, and collect everything *not* named on the
left into `productWithoutId`. The `...` is doing the collecting.

Either version is fine. The long one says what it stores; this one says what
it leaves out.
:::

I changed the return type of `add()` from a whole Product to just the id, since that's all that's needed by the controller, so this whole journey allowed me to clean that part up a bit. That change means the controller changes slightly, as we can lose the `{}`:

```ts
const id = await productService.add(postData);   // was: const { id } = ...
```

## The same document, three ways

This is the whole story in one place. Post a product with four of its seven
fields, and look at what ends up in the database:

| | What Mongo stores |
|---|---|
| **As written in class** | `_id`, `modelName`, `manufacturer`, `color`, `price` — the three missing fields simply absent |
| **After the first fix** | all seven fields, plus a junk `id: "1790716131668"` beside `_id` |
| **After both fixes** | all seven fields, and one id |

## What to take from it

The layers were not the problem. Each function did what its name said. The bug
was in the *order of two lines* inside one of them, and it survived because
every product we posted all afternoon was complete. We looked at the database
plenty — in Compass, and through `GET /products` — but there was never a
missing field there to notice.

That is the argument for the kind of test the exercise asked for: one that
goes in through the route, comes back out through the route, and compares the
answer against what you said it should be. Not because it is more rigorous in
the abstract, but because it was the first thing all day to ask about a
product we had not fully specified.

## Where the code is

The fix is in
[`week04-nyt-solution`](https://github.com/SI679-public/SI679-public.github.io/tree/main/code/week04-rest/week04-nyt-solution),
in `src/services/product-service.ts` and `src/controllers/product-controllers.ts`,
with comments marking both halves. The test is the last `describe` block in
`src/__tests__/products.test.ts`, under the note explaining that the assignment
changed on the fly.

`week04-lecture` has been updated with the same fix, so the code the lecture notes show you
now is the corrected version, not what we typed together in class. If you are
comparing your own project against the notes and the `add()` function looks
unfamiliar, that is why.

You do not need to do anything with this. Read it, then apply the fix to your
own copy if you want your wish — it is a matter of reordering a couple lines and changing an object to a string variable.
