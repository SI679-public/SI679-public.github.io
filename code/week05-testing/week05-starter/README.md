# Week 5 starter — testing

A complete `/products` API. Nothing here is a TODO: the app works, and
`npm test` passes.

```bash
npm install
npm test
```

You should see passing tests and four marked `todo`. If you don't, say so
before we go any further.

End-to-end tests live in `src/__tests__/` and are named `*.e2e.test.ts`. Unit
tests sit beside the file they test, named `*.unit.test.ts`.

`src/mocks-and-spies.unit.test.ts` is the only unit test file you start with,
and it tests nothing about this app. It's a short tour of `vi.fn`,
`mockReturnValue` and `vi.spyOn` that we work through in class — run it and
poke at it.

```bash
npm run test:e2e
npm run test:unit
```

There is no MongoDB to start this week. The tests run against
MongoMemoryServer, which they start and stop themselves.

```
src/
├── db/            connection, and the products repository
├── models/        types
├── services/      application logic
├── controllers/   requests and responses
├── routes/        endpoints to controllers
├── middleware/    error handling
├── __tests__/     end-to-end tests, and the seed data they use
├── mocks-and-spies.unit.test.ts
├── app.ts
└── index.ts
```
