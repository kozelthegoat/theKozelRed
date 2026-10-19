# kozel.red

Personal site and 1:1 booking for **Aliaksei Kozel** — strategy / operations / production work, plus free (volunteer) 1:1 sessions.

**Live:** https://kozel.red

## What's here

- `/` — home: expertise, experience, recommendations, résumé download
- `/schedule/` — 1:1 booking: pick a session type → a time → leave a note
- `/notes/` — writing, dated by when it was written (also `/ru/notes/`, `/be/notes/`)
- `/privacy/` — what's stored and why
- `/me` — the requests table, where a request is confirmed or declined (behind Cloudflare Access in production)
- `404` — styled not-found page

Booking is **request-based and free**: pick a slot, send a request, and I answer either way. Every session is **30 minutes** — `Intro Call`, `Career Review`, `Working Session`.

## Booking emails

Three go to the requester — request received, confirmed, declined — and all three carry the **same subject**, so they thread and the change of state is read in the body. Confirming attaches an `.ics` built from the same timezone conversion the slots use, with the room link in `LOCATION` so the calendar entry itself can be joined. A fourth, separate email is your own notification, laid out as a labelled record of the request.

Sent through **Resend**, best-effort: with no key the request is still stored and nothing is sent. Secrets are `RESEND_API_KEY`, `BOOKING_TO` and `BOOKING_FROM`; the room itself is `site.meetingUrl` in `src/data/site.js`.

## Languages

English is at the root, Russian at `/ru/`, Belarusian at `/be/`. Path prefixes and never a cookie, so every locale stays shareable and indexable. The chrome is translated in `src/i18n/ui.mjs`, and `src/i18n/pages.mjs` is the registry of which slugs a page uses per language and which languages it exists in. A switcher appears only on pages that exist in more than one language — today that means the notes.

## Stack

- **Astro 7** on **Cloudflare Workers** via `@astrojs/cloudflare` — pages prerendered, `/me` and `/api/*` on demand
- **Tailwind v4**
- **Cloudflare D1** for booking requests (`migrations/`)
- **Vitest** — slots, timezones, emails, `.ics`, security headers, the requests table, notes, i18n
- **Resend** for email

## Slot model

Availability is a single weekly grid of start times defined in **Minsk** (`src/data/sessions.js`). The UI converts each slot to the **visitor's timezone** (auto-detected, switchable). Slot instants are computed client-side.

## Local development

```bash
npm install
npm run dev        # astro dev (no database)
npm run dev:local  # build + local D1 migrations + sample rows + wrangler dev on :8787
npm run test       # vitest run
npm run build      # astro build
npm run deploy     # build + wrangler deploy
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
- `src/i18n/ui.mjs` — the chrome in every language
- `src/styles/global.css` — design tokens and shared component styles
- `public/fonts/` — self-hosted Geist / Geist Mono

A note is published by dropping a `.md` file in `src/content/notes/`: frontmatter carries `title`, `date`,
`summary`, and optional `draft` and `tags`. `draft: true` keeps it out of the build and out of the navigation.

## Repo layout

```
src/pages/      routes (index, schedule, privacy, me, notes, 404, api/, ru/, be/)
src/layouts/    Base layout (header, footer, language switcher slot)
src/components/ Cta, LocaleSwitcher, StatusForm, page bodies
src/content/    notes (markdown)
src/i18n/       locales, the page registry, the chrome dictionary
src/data/       content (site, résumé, sessions, palette)
src/lib/        slots, timezone, email, .ics, requests, headers, notes, locale preference
src/assets/js/  client scripts (schedule, reveal, notes)
migrations/     D1 schema
public/         fonts, images, résumé PDF, _headers, accent.js
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
- The accent colour is the **weekday**, from `src/data/palette.js`; `public/accent.js` applies it before first paint.
- See `docs/design.md` for the design language and `docs/ideas.md` for the backlog.

## License

[MIT](LICENSE) © 2026 Aliaksei Kozel
