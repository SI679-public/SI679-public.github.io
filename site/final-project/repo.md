---
title: "Final Project — Your Repo"
---

# Your Repo

[← Final Project overview](./index.md)

Everything for the project lives in one repo: your code, and the planning
documents we ask for at each milestone.

## Getting it

The final project is a **Classroom50 group assignment**. Accepting it
creates your group's repo inside the course organization, with everyone in
your group as a member.

You form your own team: the first member of your group to accept creates
it, and everyone else joins that team. Working alone? You're a team of one.

We'll post the assignment invitation after proposals are in. Accept it once your
group is settled — and **by [Checkpoint 1](./checkpoint-1.md) at the
latest**, which requires the repo.

The starter is **minimal on purpose** — you build the app yourself, following patterns for how
we've built projects in class. There's no app code in it. What it does have:

- **`server/` and `client/`**, two separate packages with every package
  we've used in class already listed, each pinned to an exact version, so
  your whole group runs the same code.
- **Node 22** (22.9 or later), required: `npm install` refuses to run on
  other versions. With [nvm](https://github.com/nvm-sh/nvm), `nvm use`
  picks it for you.
- **The run scripts and config files from class**: `npm run dev`,
  `npm run typecheck`, `npm test` and the rest, with `tsconfig.json`,
  `vitest.config.ts`, `vite.config.ts` and `.env.example` files.
- **A README** with setup steps to get you started. It's yours to rewrite.
- **A `docs/` folder** with the planning files below, ready to fill in.

## What goes where

**`README.md` is for running and using the app.** Someone who has never
seen your project should be able to get it going from the README alone:

- How to install, run and test it
- `.env` format, and any third-party accounts or keys needed
- A pointer to `docs/deployment.md` for the deployed app

**`docs/` is for the plan and the architecture.** Fixed file names, so
anyone can find them in any group's repo:

| File | What's in it |
|---|---|
| `docs/overview.md` | What the app is, who it's for, and the key things people do with it ([structure](./proposal.md#the-overview)) |
| `docs/roles.md` | Each role, and what it can do |
| `docs/data-model.md` | Collections and how they relate, in whatever form works for your data. After Checkpoint 1 it can shrink to a short summary that points to your type and model definitions |
| `docs/endpoints.md` | Method, path, which role(s) can call it, request and response shapes |
| `docs/realtime.md` | Your real-time feature: the events, who sends and receives them, and who may listen |
| `docs/client.md` | Your client at a high level: what kind it is, its main screens, and how it connects to your server |
| `docs/deployment.md` | Where the app runs, its URL, the environment variables it needs, test logins for each role, and how to put a new version live |
| `docs/topic-map.md` | For each [required topic](./index.md#required-topics): where it shows up. At Checkpoint 1, where it *will* be; at the end, the files, endpoints and tests that show it — our "where to look" map |
| `docs/plan.md` | Scope — must-have, nice-to-have, stretch — and, for groups, who owns what |

All of these files come with the starter. They're written at
[Checkpoint 1](./checkpoint-1.md) and kept up to date as you build. They
should describe the app as it is, not as it was planned — changing them is
expected. Two exceptions:

- **`docs/deployment.md`** can stay as it is until
  [Checkpoint 2](./checkpoint-2.md), after deployment is taught. At
  Checkpoint 2, describe your deployment if it's set up, or your plan for it
  if not. By the [final repo](./final-repo.md), it describes the deployed app.
- **`docs/data-model.md`** can become a summary, as above.

**Small changes, just update the docs. Big changes, tell us too.** If you
change the scope or direction significantly — drop a required topic, change
what the app is for, replace your real-time feature — let us know directly
on Slack or by email. Don't count on us noticing it in a diff.

## Milestone snapshots

When a milestone is due, you mark the commit you want us to look at with a
git tag, then submit on Canvas. [Checkpoint 1](./checkpoint-1.md#how-to-submit)
shows how.
