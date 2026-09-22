# Test stages

The lecture rewrites `products.test.ts` several times. Each intermediate
version is a real file here, so it can be run, typechecked, and imported
into the notes instead of being hand-typed.

`*.stage.ts` doesn't match Vitest's default `*.test.ts` pattern, so
**`npm test` never runs these.** They're typechecked with everything else by
`npm run typecheck`.

Run one:

```bash
npm run test:stages -- 01
```

| File | Lecture step | What you should see |
|---|---|---|
| `01-live-db.stage.ts` | 3 · tests against the live database | Needs `mongod` running. First run **passes**. Every run after **fails**: `… to have a length of 1 but got 2`, then 3, 4… Compass shows the Duct Tapes piling up in `week3test`. |
| `02-memory-server.stage.ts` | 4 · swap in MongoMemoryServer, add a second test | The first-ever run downloads mongod (~100 MB, can take minutes). `adds a product…` **passes**; `starts empty` **fails**: `… to have a length of 0 but got 1` — the first test's Duct Tape is still there. Same result every run, and `week3test` stops growing. |
| `products.test.ts` | 5–6 · with all three hooks, then the matcher round-up | All three **pass**. This is the real test file; `npm test` runs it. |

Stage 01 uses its own `week3test` database, so products created in Postman
(in the app's `week3app`) don't make its first run fail. Delete `week3test`
in Compass to start it over.

In the notes: import stages 01–02 by their `#stage` region, which leaves out
the how-to-run comment at the top. Stage 02 is also split into `#post` and
`#startsEmpty`, so the notes can show the failing second test on its own;
running the file runs both. Import the finished file by region too
(`#setup`, `#listsWhatWasAdded`).
