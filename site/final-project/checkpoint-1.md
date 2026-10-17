---
title: "Final Project — Checkpoint 1"
---

# Final Project — Checkpoint 1

[← Final Project overview](./index.md)

**Due:** Mon 11/16, 11:59 PM

Your project gets real: a repo, a first working endpoint, and enough
planning that we can see how the app will be built.

## What to submit

Everything for this checkpoint is in your [repo](./repo.md).

### 1. Your repo, set up

Accept the Classroom50 group assignment (see
[Your repo](./repo.md#getting-it)) so your group's repo exists.

### 2. At least one working endpoint, with a test

Something small and real — it proves your project runs end to end.
"Working" means:

- We can clone your repo, follow your README, and call the endpoint.
- `npm test` runs at least one passing test for it.

### 3. Your planning docs

In the `docs/` folder:

| | File |
|---|---|
| **Overview** — what the app is, who it's for, the key things people do with it | `docs/overview.md` |
| **Roles and permissions** — each role, and what it can do | `docs/roles.md` |
| **Data model** — collections and how they relate | `docs/data-model.md` |
| **Endpoint table** — method, path, which role(s) can call it | `docs/endpoints.md` |
| **Topic map** — where each [required topic](./index.md#required-topics) will show up in your app | `docs/topic-map.md` |
| **Scope** — must-have, nice-to-have, stretch; for groups, who owns what | `docs/plan.md` |

Your overview starts from the one in your proposal, updated with our
feedback. See [Your repo](./repo.md#what-goes-where) for more on each file.

## How to submit

Two steps, both before the deadline.

**1. Tag the commit you want us to look at** as `checkpoint-1`, and push the
tag:

```bash
git tag checkpoint-1
git push origin checkpoint-1
```

We'll look at your repo as of that tag, so you can keep working on `main`
afterward. Make sure the tagged commit is on `main` — if your group works
in pull requests, merge first, then tag.

**2. Submit on Canvas.** Everyone in the group submits the repo link.

:::details Tagged the wrong commit?

Need to move the tag to a later commit? Run the same two commands with
`-f`, then resubmit on Canvas so we know to look again:

```bash
git tag -f checkpoint-1
git push -f origin checkpoint-1
```

:::

## How it's graded

| Requirement | Points |
| --- | --- |
| Your repo is set up to run, typecheck and test your app using the standard commands we've used in class and in the homework | 10 |
| At least one endpoint works, with a passing test | 10 |
| Your planning docs are all in `docs/`, and each covers what's listed for it under "3. Your planning docs" | 25 |
| The `checkpoint-1` tag is pushed and points to a commit on `main` | 5 |
| **Total** | **50** |
