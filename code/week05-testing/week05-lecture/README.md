# Week 5 lecture — testing

The in-class version of the Week 5 starter: the same complete `/products`
API, plus everything written live during the lecture — the `404s when the id
is not in the database` e2e test, and all of
`src/services/products-service.unit.test.ts`.

The week's notes import their code snippets from this repo, which is why the
source files here carry `// #region` comments. Students get
`week05-starter`; the Now You Try answers are in `week05-nyt-solution`.

```bash
npm install
npm test
```

Six `it.todo`s are left on purpose: three in the `PATCH /products/:id` block
of the e2e suite (Now You Try #1), and three in the unit test file
(Now You Try #2).
