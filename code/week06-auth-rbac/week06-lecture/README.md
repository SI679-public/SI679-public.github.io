# Week 6 · lecture code

The finished in-class example: the starter, plus everything both sections of
the lecture build. Section 2's snippets in the notes are imported from here.

Section 2 adds: `role` in the token, `requireRole('staff')` on
`POST /products`, the product tests sending a staff (and a customer) token,
and `GET /users/:id`, where staff may read anyone and a customer only
themselves.

Now You Try #2 starts from here.

**Lost?** Copy these files into your project, replacing yours. Every one of
them was written or changed in section 2, so none of your Now You Try #1
work is touched:

```
src/app.ts
src/services/auth-service.ts
src/middleware/require-role.ts
src/routes/products-router.ts
src/services/users-service.ts
src/controllers/users-controller.ts
src/routes/users-router.ts
src/__tests__/products.e2e.test.ts
src/__tests__/users.e2e.test.ts
src/services/users-service.unit.test.ts
```

```bash
npm install
cp .env.example .env
npm run seed        # once: creates the staff user (needs MongoDB running)
npm test
```
