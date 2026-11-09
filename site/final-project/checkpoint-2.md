---
title: "Final Project — Checkpoint 2"
---

# Final Project — Checkpoint 2

[← Final Project overview](./index.md)

**Due:** Mon 11/30, 11:59 PM

A progress check two weeks after [Checkpoint 1](./checkpoint-1.md). By now
your app should have grown well beyond its first endpoint, with every part
of it underway. It doesn't need to be finished or polished, but we should
be able to run it and see each part working.

## What to submit

### 1. Solid progress on each part of your app

We're looking for solid progress, not a finished app, on each of these:

- **Data model.** Your main types and models are in place, and data is
  stored in MongoDB.
- **Routes.** A set of endpoints covering your app's main flows, not just
  one or two.
- **Auth and role-based access.** Users can log in, and what they can do
  depends on their role, enforced on the server.
- **Real-time.** At least one event from `docs/realtime.md` is sent by the
  server and received by the people who should see it.
- **A client.** Your client calls your API and shows the results, including
  logging in and at least one live update.

Keep your tests growing as you go. The final repo needs tests at more than
one level, so don't save them for the end.

### 2. Your docs, kept up to date

Your `docs/` should describe what you've actually built so far, and what
you still plan to do. That includes `docs/client.md`, now that your client
is connected to your server.

`docs/deployment.md` starts now. If your app is deployed, describe the
deployment. If it isn't yet, describe your plan: where it will run, what
configuration it will need, and how you'll put new versions live.

At this point, your README should contain enough information that we can run the current version of your app and see what's going on.

### What about deployment?

Your app doesn't need to be deployed yet; that's part of the
[final repo](./final-repo.md). But don't leave it until the last minute.
You can, and should, set up the process for deploying your app before its
code is finished, and redeploy as you go.

## How to submit

Two steps, both before the deadline.

**1. Tag the commit you want us to look at** as `checkpoint-2`, and push the
tag:

```bash
git tag checkpoint-2
git push origin checkpoint-2
```

We'll look at your repo as of that tag, so you can keep working on `main`
afterward. Make sure the tagged commit is on `main` — if your group works
in pull requests, merge first, then tag.

**2. Submit on Canvas.** Everyone in the group submits the repo link.

:::details Tagged the wrong commit?

Need to move the tag to a later commit? Run the same two commands with
`-f`, then resubmit on Canvas so we know to look again:

```bash
git tag -f checkpoint-2
git push -f origin checkpoint-2
```

:::

## How it's graded

| Requirement | Points |
| --- | --- |
| Solid progress on your data model | 7 |
| Solid progress on a set of routes | 7 |
| Solid progress on auth and role-based access | 7 |
| Solid progress on real-time | 7 |
| Solid progress on a client that uses your API | 7 |
| Your docs are up to date, and `docs/deployment.md` describes your deployment or your plan for it | 10 |
| The `checkpoint-2` tag is pushed and points to a commit on `main` | 5 |
| **Total** | **50** |
