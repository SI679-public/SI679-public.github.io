---
title: Week 06 — Auth
---

# Week 06 · Auth

Last week we cleaned up our API layers and then wrote some e2e and unit tests. This week we'll tackle authentication and authorization, collectively known as "auth." Auth is an essential component of any backend.

## This week's goals

- Register and log in users, with passwords hashed by `bcrypt`
- Use *JSON Web Tokens (JWTs)* to grant users access to resources after logging in
- Implement *role-based access control (RBAC)* to allow different users to access different resources
- Implement *ownership checks* to grant users access to only resources they own

## Clone the Starter

We will once again pick up where we left off the previous week. The [Week06 NYT Assignment](https://classroom50.org/SI679-Classroom-F26/si-679-f-26/assignments/week06-nyt/accept?k=mjt5rszh) contains everything from last week, including the NYT solutions, plus a little bit more that we'll need for today. Accept the assignment, clone the repo to your laptop, then:

```bash
npm install
cp .env.example .env
npm test
```

You should see passing tests and ten marked `todo`.

### What's new in the starter

```text
src/
├── config.ts                      load secrets, when we get there
├── models/user.ts                 the User types
├── db/users-repository.ts         finds and saves users
├── errors.ts                      new error classes, ready to use
├── middleware/error-handler.ts    turns them into 401, 403 and 409
├── scripts/seed-staff.ts          creates a staff user (npm run seed)
├── __tests__/auth.e2e.test.ts     Now You Try #1, as todos
└── __tests__/users.e2e.test.ts    Now You Try #2, as todos
```

`bcryptjs` and `jsonwebtoken` are new packages for this week and they're already installed.

## Auth and Auth

As noted in the intro, "auth" is often used as shorthand for talking about two related but different concepts:

- **Authentication** — verifying that someone is who they say they are.
- **Authorization** — deciding what someone may access, given who they are.

The first half of today is authentication; the second half is authorization.

In HW1 and HW2, you worked with a rudimentary form of authorization using *shared-secrets*. If a client can provide a "staff" token, they are allowed to do staff things and if they have a "customer" token they can do customer things. But notably, there were no actual user accounts, and there was no way to figure out what a user could do based on who they were. So, for example, there would be no way for a customer to access their own orders (or to prevent one customer from accessing another's).

## Passwords, briefly

Passwords are one of the oldest and most common ways to authenticate. You know the drill: create an account with a username and password, and to get in later you enter both, which the system checks before letting you in. A well-designed username-and-password system still does the job in a lot of situations, and it's the backbone of many fancier approaches.

The one fundamental rule when working with passwords is: **never store the password itself.** Instead, store something you can check a user's entered password *against*, but that's useless to whoever steals your database.

### Hashing

A hash function turns its input into a fixed-size fingerprint. It is one-way: you can't get the input back from the output. So, if you have a hash you can't figure out what the password is without trying a bunch of guesses and seeing if they match the hash, but if you have the password you can verify whether or not it matches the hash. This allows a user to log in and be authenticated but doesn't allow an attacker to steal the password and pretend to be the user.

To get a feel for it, imagine a very simple hash: word length.

| Input       | Output |
| ----------- | ------ |
| apple       | 5      |
| banana      | 6      |
| mango       | 5      |
| pomegranate | 11     |
| lime        | 4      |

Stealing the outputs (5, 6, 5, 11, 4) gives an attacker very little. And if "apple" is your password, hashing what you type gives 5, which matches what's stored. The problem, of course, is that "mango" *also* gives 5 — a real hash needs so many possible outputs that a wrong input practically never matches.

### bcrypt

`bcrypt` is a hashing algorithm built for passwords. There's fancy math involved, as one would expect from a cryptographic algorithm, but on top of the math, `bcrypt` adds:

- **a random salt**, mixed in before hashing, so the same password hashes differently for every user. A precomputed table of common passwords' hashes (known as a *rainbow table*) becomes useless.
- **a cost**: it is deliberately slow. Cost "11" means 2^11 = 2048 rounds of work. Unnoticeable when you log in once (a fraction of a second); crippling for an attacker trying millions of guesses.

Both the cost and the salt are stored in the output, so a later check needs nothing but the stored string:

```text
$2b$11$k.ywVRU10znZsfQTv5.zhOIrbnclw9eOuacaFbTQoVqKiGMfGhUEu
\__/\/ \____________________/\_____________________________/
alg cost        salt                      hash
```

:::details Use HTTPS to protect passwords in flight
In short, using `bcrypt` allows you to authenticate users by verifying their passwords without needing to actually store passwords in a readable form. Notably, however, the approach we will look at today does **not** protect against "man in the middle" attacks, wherein an attacker intercepts communication and steals a secret that way. Indeed, we'll be sending passwords over HTTP in plaintext, which is a significant vulnerability. To close that loophole we'll need to use HTTPS (the S is for "Secure"), but we won't get to that for a few more weeks. Just keep in mind that you shouldn't use `bcrypt` without HTTPS for a publicly-available server. You really don't want to do much if anything without HTTPS for a publicly-available server though, so it's not so much a bcrypt-specific consideration.
:::

## Registering a user

`POST /auth/register` takes a username and a password, and creates a user.

### What you've been given

The `users` model(s) and repository are in the starter, because they're the same shape as the products ones you know.

In `models/user.ts`:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/models/user.ts{ts}

You've seen the two-shape pattern before with `Product` and `NewProduct`, and here you see that again. `User` is what we store in the DB, and a `NewUser` is just a `User` without an ID, which is what is provided to the repository for creating a new user. But here we add a third shape for a `User`--the `PublicUser`, which is the version of a `User` that is shared outside of the backend. This is what will be shipped to the client, and you'll note that it *does* have an ID but *does not* have a `hashedPassword`. Even though we just said that an attacker can't really do anything with a `hashedPassword`, nothing good comes of throwing passwords around even if they're hashed, so we'll just keep these within the backend and only use them for auth and nothing else.

All three have a `role` field, which we'll need later today but won't talk much about yet.

In `db/users-repository.ts`:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/db/users-repository.ts{ts}

This should look familiar by now. Note the `toUser()` function that keeps `_id` from leaking out of the DB layer.

### The service

Next, we'll create `services/auth-service.ts`, and within it the method `registerUser`, which will take care of 3 things:

```ts
export const registerUser = async (
  username: string,
  password: string
): Promise<PublicUser> => {
  // 1. is the username free?

  // 2. hash the password

  // 3. save the user
};
```

That method will need some imports, and we'll add a few imports that we'll need shortly:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/services/auth-service.ts#setup{ts}

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/services/auth-service.ts#register{ts}

1. **is the username free?**: Check the DB to see if the username is taken. If so, throw an error. We have a new error here, `ConflictError`, which uses the same pattern we saw last week with `ValidationError`--just a thin subclass of a basic JS Error that allows us to handle various things that can go wrong in a uniform way. If you look in `errors.ts` you'll see where `ConflictError` is defined (just below last week's `ValidationError`):

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/errors.ts{3-4 ts}

... and you can look in `middleware/error-handler.ts` to see how it's handled:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/middleware/error-handler.ts{27-30 ts}

A taken username isn't the server's fault and it isn't a malformed request — it's a conflict with something that already exists, which HTTP calls **409**. You might notice a couple of other new error class lurking in these two files: `AuthenticationError` and `AuthorizationError`. I'll bet you can guess what that's for--we'll see it again soon.

2. **hash the password**: `bcrypt.hash()` does the trick. It takes a plaintext password and creates the hashed version.
3. **save the user**: now that we have a unique username with a hashed password we have all we need to ask the `usersRepository` to create the user in the DB.

### Controller and route

In `controllers/auth-controller.ts`:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/controllers/auth-controller.ts#register{ts}

Create `routes/auth-router.ts` with just the one route for now:

```ts
import express from 'express';
import * as authController from '../controllers/auth-controller.js';

export const authRouter = express.Router();

authRouter.post('/register', authController.postRegister);
```

…and mount it in `app.ts`:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/app.ts{3,10 ts}

### Get ready to test

Before trying Postman, make sure mongo and your server are running. For Mongo, here are the recipes for your platform (you probably don't need to do `mkdir` again, but you do need a directory that actually exists to give `--dbpath`):

```shell
# macOS / Linux
mkdir -p ~/data/mdata
mongod --dbpath ~/data/mdata
```

```shell
# Windows
mkdir c:\data\mdata
mongod --dbpath c:\data\mdata
```

This will take over a terminal, so launch another terminal and run the server with:

```shell
npm run dev
```

### Test in Postman

Create a POST request with a raw/JSON body containing the username and password of your choice:

![Postman: POST /auth/register with a raw JSON body of username "mark" and password "blahblahblah" returns 201 Created, with the new user's id, username and role "customer" — and no password](images/postman-register-201.png)

Check in Compass--you should see your user there.

![MongoDB Compass, week6 database, users collection: one document with an _id, username "mark", a hashedPassword beginning $2b$11$, and role "customer"](images/compass-week6-user.png)

Now try again with the same username. You should get a 409 with the appropriate error message:

![Postman: the same POST /auth/register request sent again returns 409 Conflict with the body {"error": "That username is taken"}](images/postman-register-409.png)

## Logging in

`POST /auth/login` checks a username and password. First, the check itself, in `services/auth-service.ts`:

```ts
export const logIn = async (
  username: string,
  password: string
): Promise<string> => {
  const user = await usersRepository.findUserByUsername(username);
  if (!user) {
    throw new AuthenticationError('Wrong username or password');
  }

  const matches = await bcrypt.compare(password, user.hashedPassword);
  if (!matches) {
    throw new AuthenticationError('Wrong username or password');
  }

  // ...and now what?
};
```

The star of this show is `bcrypt.compare()`, which reads the salt and the cost out of the stored hash, uses them to hash the provided password, and returns a boolean (wrapped in a Promise) indicating the result.

Note that both the checks for the username and password return the same error and don't specify whether it was the username or password that didn't match. To provide that information would be helpful to an attacker, so we don't do it.

After we verify the username and password... then what? Keep in mind that the way the client (and therefore the user) will interact with the backend api is through a series of stateless HTTP requests. Since those requests will be stateless, the server won't remember anything about this login operation once it's concluded and therefore won't be able to connect subsequent requests to this one. What we will do instead is to hand back to the client a *token* that proves who this user is to be used in future requests. We'll do this with JSON Web Tokens (JWTs).

## Tokens and JWTs

The idea of tokens -- a small piece of data that says who the user is, made so that nobody but the server could have made it -- is ubiquitous in modern apps. There are different kinds of tokens, and we'll use one of the most common: **JSON Web Tokens** (JWTs), which come with a standard format and libraries for every language.

### What's in a JWT

A JWT has three parts, separated by dots — `header.payload.signature`:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjUwYTFjMmU0YjBmM2E5ZDFjMmIzYTQiLCJ1c2VybmFtZSI6ImFkYSIsImlhdCI6MTc5MTY4OTk5MiwiZXhwIjoxNzkxNjkzNTkyfQ.FkWpv-Lu9SI1HzD4bCSbVrKYshbsOGWi_sxfbWhqQrg
```

None of that looks like JSON, because the header and payload have been **base64-encoded**. Base64 rewrites any text using only 64 "safe" characters — upper- and lowercase letters, digits, and two symbols. Every 3 characters in become 4 characters out:

```text
Hi!   →   SGkh
```

It's a translation, not a lock: there's no key, and anyone can turn `SGkh` back into `Hi!`. JWTs use it because clients send tokens back to the server in HTTP headers (and sometimes in URLs), where the quotes, braces and spaces in JSON would cause trouble. (JWTs use the URL-safe variant, *base64url*, which swaps two symbols for ones URLs don't mind.) Since the header and payload are both JSON objects starting with `{"`, every JWT starts with `eyJ`.

Decoded, the three parts of the token above are:

| Part | As it travels | Decoded |
|---|---|---|
| header | `eyJhbGciOiJIUzI1NiIs…` | `{"alg":"HS256","typ":"JWT"}` |
| payload | `eyJzdWIiOiI2NjUwYTFj…` | `{"sub":"6650a1c2e4b0f3a9d1c2b3a4","username":"ada","iat":1791689992,"exp":1791693592}` |
| signature | `FkWpv-Lu9SI1HzD4bCSb…` | *not JSON* — see below |

- **header** — the kind of token, and how it's signed.
- **payload** — who this is about, and anything else we choose to put in. (Each field is called a *claim*, a word you'll see in documentation.) Some names are standard — `sub` (subject: whose token this is), `iat` (issued at), `exp` (expires) — and we can add our own, like `username`.
- **signature** — computed from the header, the payload and a **secret** only the server knows. Change one character of the header or payload and the signature no longer matches.

### Where the secret lives

Signing needs a secret, and secrets don't go in code — code goes to GitHub which can become public. Instead, secrets go in the **environment**.

The "environment" lives outside your code and consists of a set of variables that your code reads when needed. Generally speaking the environment is maintained by the operating system and/or the "shell" from which you run your code. It's also possible to specify particular environment variables in a file that lives near your code. The conventional approach for this is to write needed variables into a file named `.env` that sits in the project directory. You'll want to make sure that `.env` is excluded from git in your `.gitignore` file, which it almost always will be if you're using any kind of generated or inherited `.gitignore`. If you're creating a repo from scratch, it'll be your job to make sure `.env` is excluded (along with `node_modules` and other things we've discussed earlier that don't belong in git).

In the case of our starter code, there's a file that *is* in git named `.env.example` (this, too, is a standard pattern), and you should make a copy of it named `.env` that we will modify shortly.

In your project directory:

```bash
cp .env.example .env
```

Your `.env` file should now look like this:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/.env.example{sh}

There are several ways to generate a secret, and the comment in the `.env.example` file offers one that will work just fine for our purposes (32 random bytes is 256 bits, which is the recommended size for the kind of signing we're doing):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

which should produce something that looks like this:

```text
a23ae72558e4fafd21dcdfcf563edbf5a54ea69c027617d282af3d3dc4dbab32
```

Replace "replace-me-with-a-long-random-string" with the long random string you just generated. That line in your `.env` should now look something like:

```text
JWT_SECRET="a23ae72558e4fafd21dcdfcf563edbf5a54ea69c027617d282af3d3dc4dbab32"
```

Now is not the time to get creative: the line in your `.env` file should look just like this, albeit with different characters inside the quotes. But the quotes, JWT_SECRET, = with no spaces around it, etc. should all be identical.

Node can read `.env` files, but you need to tell it to. If you look in `package.json` you'll see how that's done:

```json
"dev": "tsx watch --env-file=.env src/index.ts",
"start": "node --env-file=.env dist/index.js",
```

and with that in place, `config.ts` reads the secret, with a clear error if it's missing:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/config.ts{ts}

This is the setup we'll use for loading secrets into the app when we run via `npm run dev`. We'll use a slightly different technique for running e2e and unit tests (and therefore also in our autograders), which is to specify the environment in `vitest.config.ts`:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/vitest.config.ts{7-11 ts}

:::info dotenv
Until somewhat recently, node wasn't able to read `.env` files. A very popular npm package named `dotenv` was created to fill this gap, and that package is still very widely used given that there are lots of code bases that were started when it was the only option. As a result, a lot of the tutorials and examples you will come across (including this week's reading) use `dotenv` rather than `node --env-file=.env`. The syntax is a bit different, but the end result is the same.
:::

### Signing a token at login

We now have a secret, which means we're ready to sign a token.

::: tip Restart `npm run dev`
Running `node` or `tsx` with `--watch` reloads the app when the code changes, but `.env` isn't code. When you make changes to `.env` you need to kill your dev server and restart it (Ctrl-C, then `npm run dev`).
:::

The "`// ...and now what?`" in `logIn()` can now be replaced with the creation and signing of the token, which will be returned from the `logIn()` method:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/services/auth-service.ts#login{15-19 ts}

Note the payload, which is provided as the first argument to `jwt.sign()`, which includes the "subject" (`sub:`) and the username. Note also how we provide the secret and set an expiration time.

The return from `logIn()` is captured by the controller, who passes it back to the client in the response:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/controllers/auth-controller.ts#login{ts}

…and the controller is wired into the route, in `routes/auth-router.ts`:

```ts
authRouter.post('/login', authController.postLogin);
```

### Test login

Now test the `/auth/login` route. You should get a token in response.

![Postman: POST /auth/login with username "mark" and password "blahblahblah" returns 200 OK with a JSON body holding a token — one long string in three parts separated by dots](images/postman-login-token.png)

You can take that token over to https://jwt.io and inspect it.

![The jwt.io debugger with the login token pasted in: the decoded header shows alg HS256 and typ JWT, the decoded payload shows sub, username "mark", iat and exp, and with jwt.io's default secret the signature check says "signature verification failed"](images/jwtio-default-secret-fails.png)

Note that the payload is open to anyone who wants to read it and has a base64 decoder handy. The signature is the part that requires the secret to check: whoever checks it recomputes it from the header, the payload and the secret, and compares. With the default jwt.io secret, you'll see that verification failed.

:::details Verifying the signature
If you put your secret into the "secret" field (don't do this with a secret you're using in production!), you should see a green "Valid secret" \[sic\] check. Feel free to try this on your own time.

![jwt.io again, with the app's own secret pasted into the secret field: "Signature Verified" under the token and "Valid secret" under the secret](images/jwtio-signature-verified.png)
:::

## Checking the token: `requireJwt` middleware

OK, so now we can distinguish between users that are logged in and ones that aren't. Those that are can provide a valid token with their requests, and those that aren't can't. For a request that needs a logged-in user, we need to check the token before anything else happens. That's a job for middleware. Create `middleware/require-jwt.ts`:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/middleware/require-jwt.ts{ts}

Walking through this, we pull the 'Authorization' header out of the HTTP request and make sure it exists and starts with 'Bearer '.

Then we slice the token out...

...and call `jwt.verify()` with our secret to make sure this is a valid token that was issued by our server. `jwt.verify()` also checks the `exp` field to see if the token has expired. If either the signature or the expiration check fail, `verify()` throws an error, which we re-throw as one of our own errors: an `AuthenticationError`. The error handler in `middleware/error-handler.ts` deals with this and sends a `401 UNAUTHORIZED` status code back to the client.

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/middleware/error-handler.ts{19-22 ts}

`jwt.verify()` returns the payload from the token, which we will stash in the response object as a field on `res.locals`, which is the express-recommended way of doing this kind of thing (i.e., having middleware stash information for downstream middleware and controllers to use during request processing).

And finally we call `next()` to pass control to the next handler in the chain.

### `GET /auth/me`

The simplest possible protected route, added here for a sanity check, simply tells the caller who the token says they are.

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/controllers/auth-controller.ts#me{ts}

Add this route into `routes/auth-router.ts`, with the middleware specified as the 2nd argument to `authRouter.get()`:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/routes/auth-router.ts{3,9 ts}

... and test in Postman. First without a token:

![Postman: GET /auth/me sent with no token returns 401 Unauthorized with {"error": "No token"}](images/postman-me-no-token-401.png)

Then add a token:

![Postman: the Authorization tab of GET /auth/me (with token), Auth type set to Bearer Token, with the token pasted into the Token field](images/postman-me-bearer-token.png)

(Postman's Authorization tab adds the `Authorization: Bearer ...` header for you, so you don't have to type it out.)

... and test again:

![Postman: GET /auth/me with the bearer token returns 200 OK with the token's payload — sub, username "mark", iat and exp](images/postman-me-with-token-200.png)

> **WRITE —** End of the lecture part of section 1. We can now tell who's calling: a valid token gets through `requireJwt`, and anything else gets a 401. What we can't do yet is decide what they're *allowed* to do — that's after the break.

## Writing a test together

The Now You Try that's coming up will be about verifying that our token management is on point, so let's write the first test together. First note that a test payload is already defined for you in `__tests__/auth.e2e.test.ts`, near the top:

```ts
const payload = { sub: '650000000000000000000001', username: 'ada' };
```

We will use that payload in our test, which replaces the first `it.todo`.

```ts
  it.todo('200s with the username for a token we sign ourselves');
```

becomes:

<<< ../../../code/week06-auth-rbac/week06-checkpoint-1/src/__tests__/auth.e2e.test.ts#valid-token{2 ts}

Note that for this test, as will be the case for most of the tests you will write next, the test makes its own token. This allows you to test for things like bad tokens, bad secrets, expired tokens, etc. The final test in the NYT asks you to test a "real" login by hitting registration, login, then a protected route.

## Now You Try #1

::: tip Lost? Catch up here
Copy the files listed in the
[checkpoint 1 README](https://github.com/SI679-public/SI679-public.github.io/tree/main/code/week06-auth-rbac/week06-checkpoint-1)
into your project, replacing yours, including `src/__tests__/auth.e2e.test.ts`.
Every one was either given to you or written together in section 1.
:::

Your job: **attack your own tokens.** Finish `describe('GET /auth/me')` in `src/__tests__/auth.e2e.test.ts`. The comment above each `it.todo` says how to make the token for it. They are in order of difficulty.

**1. `401s when there is no token`** — the warm-up: the test we just wrote, minus the token.

**2. `401s for a token that is not a JWT at all`** — send any string you like as the token.

**3. `401s for a token signed with the wrong secret`** — the test we just wrote, with a key that isn't ours.

**4. `401s for a token that has expired`** — `expiresIn` can be negative.

**5. `401s for a token whose payload has been edited`** — the interesting one. Make a good token, take it apart, change the username, put it back together *with the original signature*, and check the server notices. The steps are in the comment above the `it.todo`.

**6. `200s with the username for a token from a real login`** — the others test the lock; this one tests the key that login hands out. Register, log in, and use the token you get back.

### You're done when...

`npm test` shows no failures, and no todos left in `auth.e2e.test.ts`. (The todos in `users.e2e.test.ts` are for later.)

Lecture code with Now You Try solutions can be found [on GitHub](https://github.com/SI679-public/SI679-public.github.io/tree/main/code/week06-auth-rbac/week06-nyt-solution).

## Announcements

- Amazing: Everyone turned in Week 5 NYT!!
- Grading is up to date! If something looks wrong LMK on Slack (preferred) or email
- HW1 Solution is available on Canvas
- No class meeting next 2 weeks (Fall Break, then IPAs)
- IPA signup out later this week
- HW2 due Monday, Oct 19
- HW3 out Tuesday, Oct 20

## Roles and ownership

We've just looked at how to handle user registration and login, and how to hand a token to a client after log in that can be used to authenticate the user for a period of time without requiring another login.

Now we'll build on that foundation to add meaningful protection to "real" routes, starting with `POST /products`.

::: tip Lost? Catch up here
Copy the files listed in the
[checkpoint 1 README](https://github.com/SI679-public/SI679-public.github.io/tree/main/code/week06-auth-rbac/week06-checkpoint-1)
into your project, replacing yours. Don't copy `auth.e2e.test.ts` — that's where your Now You Try #1 answers are.
:::

### Locking down `POST /products`

Clearly, `POST /products` shouldn't be available to the public. For now we'll just be making sure this route requires an authenticated user--but not distinguishing between customers and staff. That distinction requires roles, which come next.

Add `requireJwt` to `productsRouter.post()` in `routes/products-router.ts`:

```ts
productsRouter.post('/', requireJwt, productsController.postProduct);
```

(plus `import { requireJwt } from '../middleware/require-jwt.js';` at the top). This is a stepping stone — by the end of this section the line will look different.

Create a POST request in Postman that tries to create a Product. Here's some JSON you can use:

```json
{
  "modelName": "12-Cup Programmable Coffee Maker",
  "modelNumber": "MK-B-DCMzz1",
  "manufacturer": "REVOTRA",
  "color": "Silver/Black",
  "price": 44.77,
  "quantity": 312
}
```

Try that POST without a token. No dice:

![Postman: POST /products with a JSON body for a REVOTRA coffee maker and no token returns 401 Unauthorized with {"error": "No token"}](images/postman-products-no-token-401.png)

Now add the token, just as we did with `GET /auth/me`, and all should be ducky:

![Postman: POST /products with a Bearer Token set on the Authorization tab returns 201 Created with the new product's id](images/postman-products-with-token-201.png)

### Roles in the token

But of course, not every user should be able to change product details, even if they're logged in. Changing product info is a `staff` job, and not for `customers`.

For today, we'll not worry about where staff come from--we'll seed the database with one staff account and leave it at that. For a real system you may want a third role--say, `admin`, that has permission to create staff users and do other highly sensitive or risky operations. But for now we'll just create staff by hand.

The seeding happens in `scripts/seed-staff.ts` and is invoked via `npm run seed`:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/scripts/seed-staff.ts{21-25 ts}

Run it once now (MongoDB needs to be running, just as for `npm run dev`):

```bash
npm run seed
```

That creates a user named `staff` with the password `staff-password`.

Customers are what gets created via `registerUser()` in `services/auth-service.ts`:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/services/auth-service.ts#register{22 ts}

We need to ensure that the token includes the role, so that later requests can be checked without another trip to the database. In `logIn()` (in the same file), add it to the payload:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/services/auth-service.ts#login{16 ts}

Note that any users you created in the first half today won't have tokens with roles. If you log in again, though, you'll be all set.

Log in as `staff`, with the password `staff-password`:

![Postman: POST /auth/login with username "staff" and password "staff-password" returns 200 OK with a token](images/postman-login-staff.png)

Then grab that token and plug it into your `GET /auth/me` request. You should see `"role": "staff"` in the response

![Postman: GET /auth/me with the staff token returns 200 OK with the payload — sub, username "staff", role "staff", iat and exp](images/postman-me-staff-role.png)

### Only staff: `requireRole`

The way we'll protect staff-only routes is with some new middleware. This will go in a new file `middleware/require-role.ts`, and we'll write `requireRole` as a "factory function" rather than a plain function. In other words, `requireRole` will create the correct middleware function based on the role that's passed in--meaning that it can work for any role, including ones we haven't thought of yet.

<<< ../../../code/week06-auth-rbac/week06-lecture/src/middleware/require-role.ts{ts}

Note that the return type of `requireRole` is `Middleware`, which is in turn defined as a function with the signature

```ts
(req: Request, res: Response, next: NextFunction) => void
```

Further note that the `return` statement for `requireRole` returns a function that has that signature and includes a check that the `role` of the user, as conveyed by the token and added to `res.locals` by `requireJwt` matches the `role` that was passed as an argument to `requireRole`.

If the roles don't match, that's an `AuthorizationError`, which causes the middleware in `error-handler.ts` to send the client a `403 FORBIDDEN` status.

Important: in the app we have in front of us now, `requireRole` *must* run *after* `requireJwt`, because otherwise `res.locals.user.role` would not be set and nothing could get through.

The error handler was already set up for you in the starter.

<<< ../../../code/week06-auth-rbac/week06-lecture/src/middleware/error-handler.ts{23-26 ts}

Now `POST /products` needs both — a valid token, *and* the staff role:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/routes/products-router.ts{4,13 ts}

With the two middleware functions in place and in the right order, we get the following behavior from `POST /products`:

| The request has… | Status | Means | Who says so |
|---|---|---|---|
| no token, or a bad one | **401** Unauthorized | we don't know who you are | `requireJwt` |
| a valid token, wrong role | **403** Forbidden | we know who you are, but no | `requireRole` |
| a valid staff token | **201** Created | go ahead | the controller |

And now some tests. First create a `POST /products` using this JSON:

```json
{
  "modelName": "12-Cup Programmable Coffee Maker",
  "modelNumber": "MK-B-DCMzz1",
  "manufacturer": "REVOTRA",
  "color": "Silver/Black",
  "price": 44.77,
  "quantity": 312
}
```

and no token. That's a 401.

![Postman: POST /products with the REVOTRA coffee maker JSON and no token returns 401 Unauthorized with {"error": "No token"}](images/postman-products-staff-only-no-token-401.png)

Next, copy that request and add a customer token (grab it from a request where a customer logged in, or log in again if needed). That's a 403:

![Postman: the same POST /products with a customer's bearer token returns 403 Forbidden with {"error": "Only staff may do this"}](images/postman-products-customer-403.png)

Finally try with a staff token. That's a 201! It works!

![Postman: POST /products with the staff token returns 201 Created with the new product's id](images/postman-products-staff-201.png)

:::info Where the reading is wrong
The example from the reading sent a 403 for a bad token, but 401 is more standard, so that's what we're doing here. There are a few other discrepancies but most too small to mention.
:::

### Testing with `npm test`

Let's now turn our attention to the tests that were included in the starter. We ran the tests back when we first cloned the starter and got all green. But if you run `npm test` now, you'll get a couple of failures. The failing tests post products without a token, like so (in `__tests__/products.e2e.test.ts`):

```ts
  it('adds a product we can then read back', async () => {
    const created = await request(app).post('/products').send({
      modelName: 'Moka Express',
      modelNumber: '1168',
      manufacturer: 'Bialetti',
      color: 'Aluminium',
      price: 34.95,
      quantity: 60
    });

    expect(created.status).toBe(201);
    expect(created.body.id).toMatch(/^[0-9a-f]{24}$/);

    const all = await request(app).get('/products');
    expect(all.body).toHaveLength(5);
  });
```

The test fails now because the app is doing exactly what we told it to, which is to reject `POST /products` requests that don't have a valid token. They need a token — and since the tests know the test secret, they can make one. Create a token near the top of `__tests__/products.e2e.test.ts` (just before `beforeAll()`):

<<< ../../../code/week06-auth-rbac/week06-lecture/src/__tests__/products.e2e.test.ts#token{4,8 ts}

(plus `import jwt from 'jsonwebtoken';` and `import { getJwtSecret } from '../config.js';` at the top of the file).

And then set the staff token in the tests that should succeed, while also adding new tests explicitly for the no-token and customer cases.

<<< ../../../code/week06-auth-rbac/week06-lecture/src/__tests__/products.e2e.test.ts#post-products{2-17,22,42 ts}

### Ownership: what roles can't say

There are some access control policies that can't be implemented by token and role checks alone. A good example of this would be a route that allows a logged in `customer` to access *their own data* but nobody else's. We might imagine that `staff` can access anyone's data, though one can certainly imagine tighter controls than that, depending on the business case.

Here we will implement the policy around ownership and access in the `service` layer, as that's where policy and business logic is expected to live. We will add a gate to `getUser()` that checks the requested id against the id of the "caller" (i.e., the user who requested it). The call only goes through if those match or if the caller is staff.

In a new `services/users-service.ts`:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/services/users-service.ts{15-18 ts}

If the checks pass, `getUser()` calls `usersRepository.findUser(id)` which is already provided for you in the starter. You shouldn't need to look at it--it does exactly what you think it would.

:::info Why not middleware?
In the case of `GET /users/:id` the check we just wrote could live in middleware, as all of the info needed is in the token and the request itself. However, this is often not the case, as in the case of, say, a request for an `order` by its ID where the Order needs to be retrieved from the database and its `customerId` needs to be checked against the caller's `id` to make sure the requested order belongs to the customer.
:::

Moving up a layer, the controller builds the `Caller` from the token's payload:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/controllers/users-controller.ts{5 ts}

…the router needs only `requireJwt` — the service does the rest:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/routes/users-router.ts{ts}

…and `app.ts` mounts it:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/app.ts{4,12 ts}

### Testing ownership

Let's test the `GET /users/:id` but in vitest rather than Postman. We need at least 3 tests (customer-same ID, customer-different ID, staff-different ID) and 2 logged in users (customer, staff) with unexpired tokens and that's going to be a pain in Postman. The starter's `src/__tests__/users.e2e.test.ts` already makes three users, fresh for every test: `ada` and `grace` (customers) and `staff`. These tests never log in, so they make their tokens with `jwt.sign`, just as in Now You Try #1, but with each user's real id as the `sub`.

Fill in the first `it.todo` in `src/__tests__/users.e2e.test.ts`. Ada asks for Grace's profile:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/__tests__/users.e2e.test.ts#others-profile{2-5 ts}

Run it with `npm test`: green. That proves a customer can't read someone else's profile. It can't prove *how* the service said no, and that turns out to matter.

#### A unit test for the service

The ownership check is contained in one function, `getUser()`, and if that function doesn't do its job the whole scheme unravels. Verifying that this function does what it's supposed to do is exactly what unit testing is for, so let's write unit tests to hold it accountable.

Create `src/services/users-service.unit.test.ts`. It isn't in the starter, because `users-service.ts` didn't exist until today. Start with the imports and one user, as the repository would deliver it:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/services/users-service.unit.test.ts#setup{ts}

Then the test. It checks the answer (`AuthorizationError`) *and* that the repository was never asked:

<<< ../../../code/week06-auth-rbac/week06-lecture/src/services/users-service.unit.test.ts#not-looked-up{2-4,10 ts}

Things to refresh your memory on here:

- why are we *spying on* `usersRepository.findUser`?
- why are we *mocking* `usersRepository.findUser`?
- why *don't* we spy on *or* mock `usersService.getUser()`?

While we're in here, add the rest of the `describe` as todos, to be ready for Now You Try #2:

```ts
  it.todo('lets staff read anyone, and looks up exactly that id');
  it.todo('lets a customer read themselves');
  it.todo('never returns the hashed password');
  it.todo("returns null for a user that doesn't exist");
```

Run `npm test`. All still green. But wait!

#### How the unit test earns its place

Here's a version of `getUser()` that looks just as reasonable: look the user up first, then check.

```ts
  const user = await usersRepository.findUser(id);
  if (!user) {
    return null;
  }
  // Staff may read anyone. Everyone else may read only themselves.
  if (caller.role !== 'staff' && caller.id !== id) {
    throw new AuthorizationError('You can only see your own profile');
  }
```

Plug that in to `getUser()` in `services/users-service.ts` and run `npm test` again. Now the unit test fails but the e2e test stays green!

Why?

Well, the e2e test doesn't care about what happens to the DB, it only cares about getting the expected response to a given request. The unit test cares about how things are done internally, for example ensuring that the DB is only accessed when all auth and validation checks pass.

Moreover there's a subtle security bug here. Can you see it?

:::details
In the rewritten version, the function returns `null` if there's no user matching the requested id before checking if the request was authorized in the first place. This would give an attacker information about which user ids exist and which don't, which makes their job a whole lot easier--not something you'd want!
:::

OK, point made--swap it back before you forget!

### Wrapping up

This lecture has just scratched the surface of a fairly deep topic. The techniques introduced here and that you'll use in your homeworks are solid if used correctly, but they're far from state-of-the-art. We didn't touch on verification techniques via channels that are assumed to prove true identity (e.g., email or text), 2FA, biometric auth, password recovery/reset, etc. We didn't talk about token refresh or revocation, or what happens when a token has been issued with an embedded role and remains active after the user has been demoted or removed. We didn't talk about more fine-grained approaches to access control like role-permission matrices.

For these reasons and others, most production-level apps will use third-party auth libraries and/or providers like Auth0, Logto, or Firebase, to name just a few. These services are constantly updated with the latest techniques and patched against the latest attacks, and most developers do not have the time, interest, or expertise to stay up to date on all of that.

We won't look into any of these providers, but the core concepts we've looked at today are valuable for two reasons:

1. They provide you with a good-enough solution for low-profile apps, such as you might build for an MVP or proof of concept.
2. The core concepts we've covered: authentication vs authorization, role-based access control, ownership checks, and the use of tokens are present in pretty much any auth package you will encounter, and understanding these concepts will be essential to using them effectively.

## Now You Try #2

::: tip Lost? Catch up here
Copy the files listed in the
[lecture code README](https://github.com/SI679-public/SI679-public.github.io/tree/main/code/week06-auth-rbac/week06-lecture)
into your project, replacing yours. Every one was written or changed in section 2, so none of your Now You Try #1 work is touched.
:::

Your job: **prove the ownership rule.** Everyone should at least attempt to finish the first part. The other two are optional, for if you have time.

**The ownership tests.**

- In `src/__tests__/users.e2e.test.ts`, the two `it.todo`s: a customer reading *their own* profile gets 200, and staff reading anyone's gets 200. Check that the response body has the right `username`, too.
- In `src/services/users-service.unit.test.ts`, the four `it.todo`s. Spy on `usersRepository.findUser` as in the live test, and call `usersService.getUser()` directly with a made-up caller.

:::details hints, if you need them

- consider `toHaveBeenCalledWith` for "looks up exactly that id"
- consider `mockResolvedValue(null)` for a user that doesn't exist
- consider `not.toHaveProperty('hashedPassword')` for the password.
:::

**Stretch (optional): lock down `DELETE /products/:id`.** Only staff may delete.

Add `requireJwt, requireRole('staff')` to the route, as we did for `POST`, then write a `describe('DELETE /products/:id')` in `src/__tests__/products.e2e.test.ts` (week 5 never tested `DELETE`), with tests for:

- 401 with no token
- 403 with a customer token
- 204 with the staff token (and the product is gone).

Nothing else should break.

**More stretch (optional): lock down `PATCH /products/:id`, and fix what breaks.**

Same guards as DELETE. When you add the middleware guards, six of week 5's `PATCH` tests go red, because they send no token. Make them green by sending the staff token, the way we fixed the `POST` tests.

### You're done when...

`npm test` shows no failures and no todos. The stretches are extra.

Lecture code with Now You Try solutions can be found [on GitHub](https://github.com/SI679-public/SI679-public.github.io/tree/main/code/week06-auth-rbac/week06-nyt-solution). `SOLUTIONS.md` there explains each answer.
