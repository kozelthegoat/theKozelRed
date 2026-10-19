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
2. Deploy — either:
   - push `main` and let the workflow run `node scripts/deploy.mjs`, or
   - `npm run deploy` locally.
3. The engine prints the `git describe` version; confirm the change is live at kozel.red.

There is no separate dev server here (that's the guide-site repo): `npm run dev` is only an
Astro dev server, not a deployment.
