# kozel.red — design

Status: **Living document** · Last updated: 2026-10-16

Personal site for Aliaksei Kozel — a consulting + 1:1 page with a résumé, in an immersive but
**non-interactive** style. English only (v1).

## Stack

- **Astro 7** (SSR) on **Cloudflare Workers** via `@astrojs/cloudflare` (`wrangler.jsonc`).
- **Tailwind v4** (tokens live in `src/styles/global.css`).
- **D1** for booking requests (`migrations/`). **Vitest** for the logic tests.
- API as **Astro endpoints** (`src/pages/api/…`); vanilla-JS client for the calendar.

## Pages

- `/` — one scrolling page: **Hero** · **Expertise** · **Experience** · **Recommendations** ·
  **Résumé** · **Services / 1:1** CTA.
- `/schedule/` — the 1:1 request flow (session type → date → time → note).
- `/privacy/` — what's stored and why.
- `/me` — the owner's view of incoming requests, **gated by Cloudflare Access** (not linked publicly).
- `404` — styled not-found page.

**Hosts:** `kozel.red` + `www.kozel.red` both serve the site (Worker custom domains); the
`<link rel="canonical">` points at the apex.

### API (Astro endpoints)

- `GET /api/slots?type=<id>&from=<date>&to=<date>` — open slots.
- `POST /api/requests` — create a 1:1 request (sends the host alert + requester confirmation).
- `POST /api/me/status` — set a request's status (confirm / decline); declining emails the requester.

## 1:1 booking

- **Session types** (`src/data/sessions.js`): `Intro Call` 30 min · `Career Review` 45 · `Working Session` 60.
- **Availability:** a single weekly grid of start times defined in **Minsk**, every day
  08:00–20:00, with a **24-hour minimum notice** (`minNoticeHours`).
- **Flow:** pick a type → see open slots (the grid minus existing requests) → submit a
  **request** (name, email, note). **No payment**, no accounts. Requester + owner get an email.
- **Data (D1):** one `requests` table. A partial unique index keeps one active request per slot,
  and a declined row frees the slot again.
- **Timezones:** the API returns raw `{date, time}` wall-clock in Minsk; the browser shows each
  slot in the **visitor's** timezone (auto-detected, switchable).

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
| `--background` | `#f5f5ed` | page background |
| `--foreground` | `#282828` | primary ink |
| `--secondary` | `#414140` | secondary text |
| `--muted` | `#72726f` | muted labels |
| `--border` | `#d9d9d5` | hairlines |
| `--brand` | `#fa3600` | accent: links, highlights, focus, active state |
| `--brand-deep` | derived | brand hover (e.g. scrollbar) — `color-mix` of `--brand` and black |
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

### Type & headings

**Geist** (sans) + **Geist Mono** (labels), both self-hosted. Headings are
uppercase with tight `line-height` (0.98) and `text-wrap: balance`; longer ones carry a width
cap (`max-w-16ch` / `18ch` / `22ch`) so they read as two lines. Restrained nav, statement hero,
subtle non-interactive motion (no canvas/drag).

## Content

Pulled from the résumé (experience, skills, recommendations) in `src/data/resume.js`.
