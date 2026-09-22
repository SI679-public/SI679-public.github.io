# Week 03 — Setting up the project

**This repository is the finished result.** Everything below explains how it
was built, so that you can build ones like it in the future yourself. The three
config files it tells you to write — `package.json`, `tsconfig.json`, `vitest.config.ts` — are sitting right here in the repo; read them alongside the explanations.

You need Node 22 or newer and MongoDB installed. Check the first with
`node --version`; for the second, see [Prep: install MongoDB](https://si679-public.github.io/weeks/week03-mongo-integration/prep).

---

## 1. Make the folder

```bash
mkdir week03-starter
cd week03-starter
npm init -y
```

`npm init -y` writes a `package.json` with default answers. We are about to
replace most of it.

## 2. Install the packages

Two commands, because the distinction matters.

```bash
npm install express mongodb
```

These are **dependencies** needed at both dev time and run time — i.e., code that has to be present for the app to run. `express` serves the HTTP routes; `mongodb` is the official driver that talks
to the database.

```bash
npm install -D typescript tsx vitest supertest mongodb-memory-server \
               @types/node@^22 @types/express @types/supertest
```

These are **devDependencies** — the `-D` flag (equivalent to `--save-dev`). Use this for dev-time tools needed for building and testing. Nothing here ships to a server; a deployed copy of the app never runs a test or compiles TypeScript.

Three of them are worth naming:

| Package | What it does |
|---|---|
| `tsx` | runs a `.ts` file directly, without compiling first |
| `mongodb-memory-server` | starts a **throwaway** MongoDB for tests to use |
| `@types/…` | type definitions for packages written in plain JavaScript |

The `@types` packages are the ones people forget. Express, supertest and Node
itself are JavaScript, so TypeScript has no idea what shape they are until you
install their types separately. Leave them out and everything still *runs* —
you just get red underlines everywhere and no autocomplete.

Note `@types/node@^22`. Those have to describe **the Node you are running**,
and plain `npm install @types/node` currently fetches version 26, which
promises APIs your Node 22 does not have.

## 3. Edit `package.json`

Open it and make it look like this. The `dependencies` and `devDependencies`
blocks are already there from step 2 — leave whatever version numbers npm
wrote. Everything above them is what you are changing:

```json
{
  "name": "week03-starter",
  "version": "1.0.0",
  "description": "SI 679 week 3 — MongoDB and Vitest",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "explore": "tsx watch src/db-explore.ts",
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "express": "^5.2.1",
    "mongodb": "^7.6.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^22.20.4",
    "@types/supertest": "^7.2.1",
    "mongodb-memory-server": "^11.2.0",
    "supertest": "^7.2.2",
    "tsx": "^4.23.13",
    "typescript": "^7.0.2",
    "vitest": "^5.0.1"
  },
  "allowScripts": {
    "esbuild": false,
    "fsevents": false,
    "mongodb-memory-server": false
  },
  "config": {
    "mongodbMemoryServer": {
      "disablePostinstall": "1"
    }
  }
}
```

Delete the `"main"` key that `npm init` added, and delete its placeholder
`"test"` script — the one you want is above.

**`"type": "module"`** is the single most consequential line in the file. It
tells Node to treat every `.js` file in this project as an ES module, so
`import` works and `require` does not. Without it, every `import` statement
fails at runtime with a message about modules that will not obviously point
back here.

**`allowScripts` and `config`** exist to make installs quiet and predictable.
Newer versions of npm refuse to run a package's install scripts unless the
project says so, and warn about each one. None of these three needs its
script — the tools work without them — so the project says no explicitly, and
the warning goes away. The `config` line does the same for older npm, which
runs install scripts regardless: it stops `mongodb-memory-server` downloading
a database when you install, so that happens the first time a test actually
needs one.

The scripts:

- **`npm run dev`** — the one you will use constantly. `tsx watch` runs the
  server straight from TypeScript and restarts it on every save.
- **`npm run explore`** — runs `src/db-explore.ts` the same way, rerunning
  on every save. Week 3 uses it to try MongoDB out before there is an app.
- **`npm test`** — runs the tests once and exits. This is what a grader runs.
- **`npm run test:watch`** — reruns tests as you edit. Use this while writing.
- **`npm run typecheck`** — asks TypeScript for errors without producing
  output files. Faster than a build when you only want the red underlines.
- **`npm run build`** then **`npm start`** — compile to `dist/`, then run the
  compiled JavaScript. This is what deployment looks like.

## 4. Add `tsconfig.json`

Create it beside `package.json`:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "esnext",
    "lib": ["esnext"],
    "types": ["node"],
    "rootDir": "./src",
    "outDir": "./dist",
    "sourceMap": true,
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Four of these change how you write code, so they are worth understanding
rather than copying:

**`"types": ["node"]`** makes `process`, `Buffer` and other node entities exist.
Leave it out and `process.env.MONGODB_URI` is an error.

**`"lib": ["esnext"]`** says which built-in APIs exist. Leave it out and
TypeScript quietly assumes you are in a browser: `document` and `window` will
autocomplete, and then crash at runtime, because there is no browser here.

**`"verbatimModuleSyntax": true`** requires you to say when an import is only
a type:

```ts
import express from 'express';
import type { Request, Response } from 'express';
```

`express` is a real value that exists when the program runs. `Request` and
`Response` are types — they vanish at compile time, and this setting makes you
be explicit about that. It is the one that generates the most "but I imported
it" confusion, and the error message tells you exactly what to add.

**`"strict": true`** turns on every safety check, most importantly that a
value which might be `undefined` has to be handled before you use it.

## 5. Add `vitest.config.ts`

Also beside `package.json`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Starting a throwaway MongoDB takes longer than Vitest's default
    // 10-second limit for setup code — especially the first time, when it
    // has to download the database itself.
    hookTimeout: 120_000,
    testTimeout: 20_000,
  },
});
```

By default, vitest gives each test 5 seconds and each piece of setup code 10 seconds
before calling it a failure. Both are generous for ordinary tests and far too
short for starting a database. Without this file your first mongo memory server test run fails with a timeout that has nothing to do with your code.

## 6. Make the folders

```bash
mkdir src
```

You should now have:

```
week03-starter/
├── node_modules/        (npm made this; never edit it, never commit it)
├── src/
├── package.json
├── package-lock.json
├── tsconfig.json
└── vitest.config.ts
```

---

## If something goes wrong

| What you see | What it means |
|---|---|
| `Cannot find module 'express'` or similar | `npm install` has not run in this folder. Check you are in `week03-starter/` |
| `Cannot use import statement outside a module` | `"type": "module"` is missing from `package.json` |
| `Cannot find name 'process'` | `"types": ["node"]` is missing from `tsconfig.json` |
| `'Request' is a type and must be imported using a type-only import` | Add `type`: `import type { Request } from 'express'` |
| `Hook timed out in 10000ms` | `vitest.config.ts` is missing, or is not beside `package.json` |
| `Download failed … Status Code is 403 (MongoDB's 404)` | Almost always a blocked or throttled network, **not** a version problem despite what the message says. Try a different network, then ask on Slack |

Last one first if you are on campus wifi. That message is misleading: it
claims the version does not exist, when what actually happened is that
something between you and MongoDB refused the connection.
