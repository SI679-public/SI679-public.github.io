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
we've built projects in class. The starter includes a `docs/` folder with the
planning files below, ready to fill in. We'll say exactly what else is in
the repo when we post the invitation.

## What goes where

**`README.md` is for running and using the app.** Someone who has never
seen your project should be able to get it going from the README alone:

- How to install, run, test and deploy
- `.env` format, and any third-party accounts or keys needed
- The deployed URL, and test logins for each role

**`docs/` is for the plan and the architecture.** Fixed file names, so
anyone can find them in any group's repo:

| File | What's in it |
|---|---|
| `docs/overview.md` | What the app is, who it's for, and the key things people do with it ([structure](./proposal.md#the-overview)) |
| `docs/roles.md` | Each role, and what it can do |
| `docs/data-model.md` | Collections and how they relate (a [Mermaid](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) diagram works well — GitHub renders it) |
| `docs/endpoints.md` | Method, path, which role(s) can call it, request and response shapes |
| `docs/topic-map.md` | For each [required topic](./index.md#required-topics): where it shows up. At Checkpoint 1, where it *will* be; at the end, the files, endpoints and tests that show it — our "where to look" map |
| `docs/plan.md` | Scope — must-have, nice-to-have, stretch — and, for groups, who owns what |

These files are written at [Checkpoint 1](./checkpoint-1.md) and kept up to
date as you build. They should describe the app as it is, not as it was
planned — changing them is expected.

**Small changes, just update the docs. Big changes, tell us too.** If you
change the scope or direction significantly — drop a required topic, change
what the app is for, replace your real-time feature — let us know directly
on Slack or by email. Don't count on us noticing it in a diff.

### `docs/overview.md`

The high-level description of your app. It starts as the overview in your
[proposal](./proposal.md#the-overview), with the same sections, and grows
with the project.

## Milestone snapshots

When a milestone is due, you mark the commit you want us to look at with a
git tag, then submit on Canvas. [Checkpoint 1](./checkpoint-1.md#how-to-submit)
shows how.
