# kozel.red — design

Status: **Living document** · Last updated: 2026-10-19

Personal site for Aliaksei Kozel — a consulting + 1:1 page with a résumé, in an immersive but
**non-interactive** style. English at the root, Russian at `/ru/`, Belarusian at `/be/`.

## Stack

- **Astro 7** (SSR) on **Cloudflare Workers** via `@astrojs/cloudflare` (`wrangler.jsonc`).
- **Tailwind v4** (tokens live in `src/styles/global.css`).
- **D1** for booking requests (`migrations/`). Migrations are applied deliberately with
  `npm run db:migrate`; the deploy refuses to ship while the remote is behind (see README).
  **Vitest** for the logic tests.
- **i18n by path prefix** — `src/i18n/config.mjs` (locales), `pages.mjs` (the page registry),
  `ui.mjs` (the chrome), `mail.mjs` (the email copy). No cookie; every locale is a shareable URL.
- API as **Astro endpoints** (`src/pages/api/…`); vanilla-JS client for the calendar.

## Pages

- `/` — one scrolling page: **Hero** · **Expertise** · **Experience** · **Recommendations** (the two
  featured) · **Pro Bono / 1:1** CTA.
- `/recommendations/` — every quote, each with an original / translation toggle.
- `/notes/` — the writing archive (a list plus one page per note, translated per note).
- `/schedule/` — the 1:1 request flow (session type → date → time → note).
- `/privacy/` — what's stored and why.
- `/me` — the owner's view of incoming requests, **gated by Cloudflare Access** (not linked publicly).
- `404` — styled not-found page (English only).

Every page but `404` exists in all three languages; `src/i18n/pages.mjs` is the registry and
`tests/i18n-pages.test.js` keeps it in step with the routes on disk.

`/sitemap.xml` is generated at build from that same registry and the published notes, so it can
never point at a page that isn't there. `404`, `/me`, `/api/*` and an empty notes index are left
out; notes carry `<lastmod>` from their frontmatter date, standing pages carry none.
`/robots.txt` points at it and disallows `/me` and `/api/`.

**Hosts:** `kozel.red` + `www.kozel.red` both serve the site (Worker custom domains); the
`<link rel="canonical">` points at the apex. This is the **apex of the `kozel.red` umbrella** — the
product (`go.kozel.red`, **KozelGo** — websites and apps for energy healers) and its client
instances (`NNN.go.kozel.red`) are the sibling codebase, whose `docs/routing.md` owns the hostname map.

### API (Astro endpoints)

- `GET /api/slots?type=<id>&from=<date>&to=<date>` — open slots.
- `POST /api/requests` — create a 1:1 request (sends the host alert + requester confirmation).
- `POST /api/me/status` — set a request's status (confirm / decline); declining emails the requester.

## 1:1 booking

- **Session types** (`src/data/sessions.js`): `RE: Anything` · `RE: Career` · `RE: Business` — all
  30 minutes. The name is a label, untranslated (like "Pro Bono"); the description / `bring` / `build`
  copy is per language. What separates the three is intent, not duration.
- **Availability:** a single weekly grid of start times defined in **Minsk**, every day
  08:00–20:00, with a **24-hour minimum notice** (`minNoticeHours`).
- **Flow:** pick a type → see open slots (the grid minus existing requests) → accept the privacy
  policy → submit a **request** (name, email, note). **No payment**, no accounts. Requester + owner
  get an email; a confirm attaches the `.ics`, a decline closes the thread — same subject either way.
- **Data (D1):** one `requests` table. A partial unique index keeps one active request per slot,
  and a declined row frees the slot again. The visitor's timezone and locale are stored with the row.
- **Abuse guards:** the endpoint drops a filled honeypot field and anything submitted faster than a
  person could fill the form, both with a silent success, and refuses a second request still waiting
  for an answer from the same address (`409 already_pending`) until the first is confirmed or
  declined. The edge rate limit on `POST /api/requests` lives in the Cloudflare dashboard, not this
  repo.

## Retention

- A request is deleted **90 days after its `slot_date`** by a daily Cron Trigger (`src/worker.js` →
  `src/lib/retention.js`). That is the only enforcement point: a read-time purge would repair the
  state and hide a cron that had stopped. Each run writes `last_retention_run` into `meta`, and
  `/me` warns when the marker is older than 26 hours; the cron itself also logs when the previous
  run was stale. `/me` has a per-row delete for test data or an erasure request; neither logs the
  payload.
- `/privacy/` states the backup window as **up to 30 days** — D1 time travel on the paid plan (7 on
  Free) — as an upper bound, so a plan change cannot make the page false. Time travel is always on
  and cannot be shortened; `backups/` exports are local and can be deleted on demand.
- **Timezones:** the API returns raw `{date, time}` wall-clock in Minsk; the browser shows each
  slot in the **visitor's** timezone (auto-detected, switchable).

## Ribbon

The strip above the header is the weekday's colour with white-on-brand text, one dry line of mood
copy (“Today is the 84th of August”). It is static, so there is nothing to pause. The X stores
one local preference (`public/ribbon.js`) and is switched on by `site.ribbonDismissible`; there is
no cookie and no identifier.

## Type

- The base is the browser default (**16px**), not a percentage of it: the site is text-first, and
  body copy is the thing people read.
- `.mono` micro-labels are **12px** (uppercase, tracked). Buttons take **14px**, because an action
  is not a label.
- Display sizes keep their old rendered sizes: when the base rose from 87% to 100%, every
  `clamp()` rem bound was trimmed by 0.87, so headlines did not grow with the copy.
- Fields are 14px on desktop and **16px under 768px**, because iOS zooms the page whenever a
  focused control is smaller than that.

## Donations

A **floating "Donate" button** → an **external link** (`site.donateUrl`), hidden while unset.
No payment code.

## Résumé

Host the PDF; a **download** button.

## Security headers

`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and
`Strict-Transport-Security` are defined once in `src/lib/headers.js` and delivered two ways,
because Cloudflare serves prebuilt assets without running the Worker:

- `public/_headers` → static pages (`/`, `/schedule/`, …)
- `src/middleware.js` → Worker/SSR responses (`/me`, `/api/*`)

`tests/headers.test.js` asserts the two stay in sync. The CSP needs no script hashes — every
script is same-origin (the weekday accent is `/accent.js`, the rest is bundled), so
`script-src 'self'` covers them all.

## Design

Warm-minimal editorial. **Every color is a CSS variable** — single source of truth in
`src/styles/global.css` (`:root` + the Tailwind `@theme inline` block). Change a value
there once and it propagates everywhere. Components must use **no hardcoded colors**;
if a new one is needed, add a token.

### Color tokens

| Token | Value | Used for |
|---|---|---|
| `--background` | `#ffffff` | page background (Google's search-page white) |
| `--foreground` | `#282828` | primary ink |
| `--secondary` | `#414140` | secondary text |
| `--muted` | `#72726f` | muted labels |
| `--border` | `#dadce0` | hairlines (Google's border grey) |
| `--brand` | `#fa3600` | accent: links, highlights, focus, active state |
| `--brand-deep` | derived | brand hover (e.g. scrollbar) — `color-mix` of `--brand` and black |
| `--brand-tint` | derived | the accent at 10% — selected / hovered chips, tiles, buttons |
| `--on-brand` | `#ffffff` | text on brand |
| `--hair` | `max(1px, .0625rem)` | border width |
| `--pad` | `clamp(1rem, 3vw, 2.5rem)` | page gutter |

Tailwind maps these via `@theme` → `bg-background`, `text-foreground`, `text-brand`,
`text-secondary`, `text-muted`, `text-on-brand`, `border-border`, plus opacity forms like
`bg-brand/10`. The header mark and SVGs use `var(--brand)` too.

**Weekday accent.** `--brand` rotates by weekday — one hue per day (Mon→Sun:
`#dc2626 #fa3600 #d97706 #16a34a #2563eb #4f46e5 #7c3aed`). `public/accent.js` sets it in
`<head>` (before paint, no flash) plus `theme-color` and the **SVG favicon** (as a data-URI,
so the tab matches the day). `--brand-deep` derives from `--brand` via `color-mix`. The static
PNG icons (apple-touch / 192 / 512) stay one color — regenerate with `npm run icons`.

### Ribbon

The strip above the header is the weekday's colour with white-on-brand text, one dry line of mood
copy (“Today is the 84th of August”). It is static, so there is nothing to pause. The X stores
one local preference (`public/ribbon.js`) and is switched on by `site.ribbonDismissible`; there is
no cookie and no identifier.

## Type & headings

**Geist** (sans) + **Geist Mono** (labels), both self-hosted. Headings are
uppercase with tight `line-height` (0.98) and `text-wrap: balance`; longer ones carry a width
cap (`max-w-16ch` / `18ch` / `22ch`) so they read as two lines. Restrained nav, statement hero,
subtle non-interactive motion (no canvas/drag).

## Content

Pulled from the résumé (experience, skills, recommendations) in `src/data/resume.js`.
