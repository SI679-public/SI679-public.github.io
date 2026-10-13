# Week 6 · checkpoint 1 — end of section 1

The starter plus everything section 1 of the lecture builds: register, log
in, `requireJwt` and `GET /auth/me`.
Now You Try #1 starts from here.

**Lost?** Copy these files into your project, replacing yours. Every one of
them was written in section 1, so none of your Now You Try work is touched:

```
src/app.ts
src/middleware/require-jwt.ts
src/services/auth-service.ts
src/controllers/auth-controller.ts
src/routes/auth-router.ts
```

Catching up *before* Now You Try #1? Take `src/__tests__/auth.e2e.test.ts`
too — it has the one test written in class. After the Now You Try, leave it
alone: that's where your answers are.

```bash
npm install
cp .env.example .env
npm test
```
