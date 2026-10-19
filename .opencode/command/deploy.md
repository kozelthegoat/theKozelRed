---
description: Test, build, and deploy kozel.red to production.
agent: builder
---

Deploy kozel.red to production. Follow the deploy skill:

1. Run `npm run test` (vitest).
2. Run `npm run deploy` — the one engine (`scripts/deploy.mjs`): build + `wrangler deploy`.
3. Confirm the change is live at kozel.red (the deploy prints its version).

Pushing `main` also deploys (the GitHub Actions workflow runs the same script), so either
path ships the exact same thing.

$ARGUMENTS
