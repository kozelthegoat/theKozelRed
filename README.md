# kozel.red

Personal site and 1:1 booking for **Aliaksei Kozel** — strategy / operations / production work, plus free (volunteer) 1:1 sessions.

**Live:** https://kozel.red

## What's here

- `/` — home: hero, expertise, experience, the featured recommendations, and the pro-bono 1:1 invitation
- `/recommendations/` — the full set of quotes, each with an original / translation toggle
- `/schedule/` — 1:1 booking: pick a session type → a time → leave a note
- `/notes/` — writing, dated by when it was written
- `/privacy/` — what's stored, for how long, and how to have it removed
- `/me` — the requests table, where a request is confirmed, declined, or deleted (behind Cloudflare Access in production)
- `404` — styled not-found page (English only)

Booking is **request-based and free**: pick a slot, send a request, and I answer either way. Every session is **30 minutes** — `RE: Anything`, `RE: Career`, `RE: Business`. What separates the three is what each sets out to do, not how long it takes.

The public endpoint behind the form is guarded three ways: a hidden honeypot field, a minimum fill time, and one request awaiting an answer per email address. The first two are answered with a silent success — the request is dropped and stored nowhere — so a script learns nothing from the response.

## Where this sits — the `kozel.red` umbrella

This repo is the **apex** of one domain, not a stand-alone site. The `kozel.red` zone carries three layers:

| Host | Serves | Codebase |
|---|---|---|
| `kozel.red` · `www.kozel.red` | this personal site | **this repo** (Worker `kozel-red`) |
| `go.kozel.red` | **KozelGo** — websites and apps for energy healers (the product) | `@theKozelGo` (Pages project `kozel-red-go`) |
| `NNN.go.kozel.red` (e.g. `001`) | one client's instance of that product | the product repo, one host per client |

The apex is deliberately the *person*; the product sits under `go.`. **KozelGo's `docs/routing.md` is the source of truth for the hostname map** — read it before adding a host. Nothing links the two sites publicly today; whether the personal site should point at the product is an open question, not an oversight (see `docs/ideas.md`).

## Booking emails

Three go to the requester — request received, confirmed, declined — and all three carry the **same subject**, so they thread and the change of state is read in the body. Confirming attaches an `.ics` built from the same timezone conversion the slots use, with the room link in `LOCATION` so the calendar entry itself can be joined. A fourth, separate email is your own notification, laid out as a labelled record of the request.

Sent through **Resend**, best-effort: with no key the request is still stored and nothing is sent. A failed send never undoes the request — it stays in `/me` — but it is no longer silent: the reason Resend gives (rejected key, unverified domain) is written to the Workers log. Secrets are `RESEND_API_KEY`, `BOOKING_TO` and `BOOKING_FROM`; the room itself is `site.meetingUrl` in `src/data/site.js`.

## Languages

English is at the root, Russian at `/ru/`, Belarusian at `/be/`. Path prefixes and never a cookie, so every locale stays shareable and indexable. Nearly every page exists in all three languages — home, recommendations, schedule, privacy and notes — and only `404` is English-only, so the footer switcher appears almost everywhere. The chrome is translated in `src/i18n/ui.mjs`, the email copy in `src/i18n/mail.mjs`, and page prose lives beside its data (the CV, the session copy, the recommendation quotes). `src/i18n/pages.mjs` is the registry of which slugs a page uses per language and which languages it exists in, and a test keeps it in step with the routes on disk.

## Stack

- **Astro 7** on **Cloudflare Workers** via `@astrojs/cloudflare` — pages prerendered, `/me` and `/api/*` on demand
- **Tailwind v4**
- **Cloudflare D1** for booking requests (`migrations/`)
- **Vitest** — slots, timezones, emails, `.ics`, security headers, the requests table, notes, i18n
- **Resend** for email

## Slot model

Availability is a single weekly grid of start times defined in **Minsk** (`src/data/sessions.js`). The UI converts each slot to the **visitor's timezone** (auto-detected, switchable). Slot instants are computed client-side.

## Schema changes

Migrations are a **precondition** of a deploy, not part of one:

```bash
npm run db:backup   # before anything destructive (DROP, ALTER … DROP)
npm run db:migrate  # apply what the remote is missing, then re-check
npm run deploy      # build → refuse if the remote is behind → deploy
```

`scripts/deploy.mjs` compares `migrations/*.sql` with D1's own `d1_migrations` table and stops
before deploying if anything is pending, naming the files and `npm run db:migrate`. CI runs the
same engine, so a push cannot ship code over a stale schema either. Applying is deliberate; it is
never a side effect of a deploy, so a failed deploy cannot leave production half-migrated.

**Write migrations to be additive.** Expand now, contract later: add the column or table, ship
code that tolerates both shapes, and drop the old thing in a later release once nothing reads it.
That is what lets the schema land before the code without breaking the running Worker, and it
keeps a rollback a code-only operation. Wrangler backs up automatically before applying, and D1
keeps 30 days of time travel; `db:backup` is the readable file for the destructive ones.

## Retention

A booking request is deleted **90 days after the session it was for**. Two things do it: a daily Cron Trigger
(`src/worker.js` → `src/lib/retention.js`), and a purge whenever `/me` is loaded, so the page can never show a
request the privacy page says has expired. `/me` also has a per-row delete for test data or an erasure request.

The privacy page says a backup may hold a copy for **up to 30 days**. That is D1's time-travel window on the
paid plan (7 days on Free), stated at its upper bound so a plan change does not quietly make the sentence false.
Time travel cannot be disabled; our own `backups/` exports are local files and can be deleted on demand.

## Local development

```bash
npm install
npm run dev        # astro dev (no database)
npm run dev:local  # build + local D1 migrations + sample rows + wrangler dev on :8787
npm run test       # vitest run
npm run build      # astro build
npm run deploy     # build + schema check + wrangler deploy
npm run db:migrate # apply pending migrations to the remote D1
npm run db:backup  # export the remote D1 to backups/ (gitignored)
npm run preview    # build + wrangler dev
```

`npm run dev:local` exists because of two traps: the build resets the local D1 state (so `/me` 500s and the
calendar has no slots), and applying migrations while a dev server holds the database open crashes the runtime.
It does build → migrate → seed → serve, in that order.

Email is skipped without secrets, which is the normal state locally — to exercise it, put `RESEND_API_KEY`,
`BOOKING_TO` and `BOOKING_FROM` in `.dev.vars`.

## Editing content

- `src/data/site.js` — name, location, availability, links, room URL
- `src/data/resume.js` — expertise, experience, recommendations
- `src/data/sessions.js` — session types + weekly availability
- `src/content/notes/` — markdown notes; `name.ru.md` / `name.be.md` are the translations
- `src/i18n/ui.mjs` — the chrome in every language; `mail.mjs` — the email copy
- `src/i18n/pages.mjs` — which languages each page exists in (edit this to add a page or a locale)
- `src/styles/global.css` — design tokens and shared component styles
- `public/fonts/` — self-hosted Geist / Geist Mono

A note is published by dropping a `.md` file in `src/content/notes/`: frontmatter carries `title`, `date`,
`summary`, and optional `draft` and `tags`. `draft: true` keeps it out of the build and out of the navigation.

## Repo layout

```
src/pages/      routes (index, schedule, recommendations, privacy, me, notes, 404, api/, ru/, be/)
src/layouts/    Base layout (ticker, header, footer, language switcher)
src/components/ Cta, LocaleSwitcher, StatusForm, Recommendation, page bodies
src/content/    notes (markdown)
src/i18n/       locales, the page registry, the chrome dictionary, email copy
src/data/       content (site, résumé, sessions, palette)
src/lib/        slots, timezone, email, .ics, requests, headers, notes, sitemap, retention, linkify, api
src/worker.js   the Worker entry: Astro's handler plus the daily retention cron
src/assets/js/  client scripts (schedule, reveal, notes, recommendations, press)
migrations/     D1 schema
public/         fonts, images, résumé PDF, bimi logo, _headers, robots.txt, accent.js
scripts/        deploy, migrate, backup, local dev bootstrap, icon generation
docs/           design, ideas, DNS, donations and legal notes
```

## Notes

- Deployed to Cloudflare Workers; API responses are `no-store` (the schedule page is edge-cached).
- **A deploy rolls out to the edge over seconds and is not tied to the `wrangler deploy` output.** While it rolls out,
  some requests still get the previous version. Measured with a probe byte on the layout: the prerendered HTML and an
  uncached API route flipped to the new version at the *same instant* — so the HTML cache is not the cause. Prerendered
  pages carry `public, max-age=0, must-revalidate` and are revalidated per request, so a cache hit reflects the origin
  immediately. If a fresh deploy doesn't show up, re-check; purging the cache won't help.
- Security headers come from `public/_headers` for prerendered pages and `src/middleware.js` for anything on demand;
  `src/lib/headers.js` is the single source and `tests/headers.test.js` keeps the two in step.
- `sitemap.xml` is generated at build from the page registry and the published notes, so it cannot advertise a URL
  the site does not have. `404`, `/me`, `/api/*`, and any language's notes index until that language has a note are
  left out; notes carry `<lastmod>` from their frontmatter date, standing pages carry none. `robots.txt` points at it
  and keeps crawlers out of `/me` and `/api/`.
- The accent colour is the **weekday**, from `src/data/palette.js`; `public/accent.js` applies it before first paint.
- See `docs/design.md` for the design language and `docs/ideas.md` for the backlog.

## License

[MIT](LICENSE) © 2026 Aliaksei Kozel
