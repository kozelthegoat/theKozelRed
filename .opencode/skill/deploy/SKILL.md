---
name: deploy
description: Use when the user wants to build and deploy kozel.red to production.
---

# Deploy

kozel.red is a single **production** deployment — there is no dev/stage (the guide-site
repo is the one that works on `dev`). Changes land on `main` and deploy from there.

**Two triggers, one engine.** `scripts/deploy.mjs` builds the site and runs
`wrangler deploy`; both the GitHub Actions workflow (on push to `main`) and
`npm run deploy` call it, so a push and a hand-deploy can never drift.

## Steps

1. Run `npm run test` (vitest).
2. Schema. If the checkout has migrations the remote does not, run `npm run db:migrate`
   first. `scripts/deploy.mjs` refuses to deploy while any migration is pending — that refusal is
   the safety net, not a step to work around.
3. Deploy — either:
   - push `main` and let the workflow run `node scripts/deploy.mjs`, or
   - `npm run deploy` locally.
4. The engine prints the `git describe` version; confirm the change is live at kozel.red.

Write migrations additively (expand now, contract later): the schema lands before the code, so the
running Worker has to tolerate both shapes during the rollout and a rollback must not need a
schema rollback. `npm run db:backup` before a destructive one.

CI runs the same engine, but it needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo
secrets; without them the deploy step fails after the tests pass and the site is only updated by a
local `npm run deploy`.

There is no separate dev server here (that's the guide-site repo): `npm run dev` is only an
Astro dev server, not a deployment.
