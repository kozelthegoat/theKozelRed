# kozel.red

Personal site and 1:1 booking for **Aliaksei Kozel** — product / operations / production work, plus free (volunteer) 1:1 sessions.

**Live:** https://kozel.red

## What's here

- `/` — home: expertise, experience, recommendations, résumé download
- `/schedule/` — 1:1 booking: pick a session type → a time → leave a note
- `/privacy/` — what's stored and why
- `404` — styled not-found page

Booking is **request-based, no payment**: you pick a slot and send a request; I reply to confirm (with the Zoom link). Styles: `Intro Call` (30 min), `Career Review` (45), `Working Session` (60).

## Stack

- **Astro 7** (SSR) on **Cloudflare Workers** via `@astrojs/cloudflare`
- **Tailwind v4**
- **Cloudflare D1** for booking requests (`migrations/`)
- **Vitest** for the booking-logic tests

## Slot model

Availability is a single weekly grid of start times defined in **Minsk** (`src/data/sessions.js`). The UI converts each slot to the **visitor's timezone** (auto-detected, switchable). Slot instants are computed client-side.

## Local development

```bash
npm install
npm run dev        # astro dev
npm run test       # vitest run
npm run build      # astro build
npm run deploy     # build + wrangler deploy
npm run preview    # build + wrangler dev
```

## Editing content

- `src/data/site.js` — name, location, links, languages, education…
- `src/data/resume.js` — expertise bullets, experience, recommendations
- `src/data/sessions.js` — session types + weekly availability
- `src/styles/global.css` — design tokens and shared component styles
- `public/fonts/` — self-hosted Geist / Geist Mono

## Repo layout

```
src/pages/      routes (index, schedule, privacy, me, 404, api/)
src/layouts/    Base layout (header/footer)
src/data/       content (site, résumé, sessions)
src/lib/        slots + timezone + api + email + headers helpers
src/assets/js/  client scripts (schedule, reveal)
migrations/     D1 schema
public/         fonts, images, résumé PDF
docs/           design, ideas, DNS & donations notes
```

## Notes

- Deployed to Cloudflare Workers; the API responses are `no-store` (the schedule page is edge-cached).
- **A deploy rolls out to the edge over seconds and is not tied to the `wrangler deploy` output.** While it rolls out,
  some requests still get the previous version. Measured with a probe byte on the layout: the prerendered HTML and an
  uncached API route flipped to the new version at the *same instant* — so the HTML cache is not the cause. Prerendered
  pages carry `public, max-age=0, must-revalidate` and are revalidated per request, so a cache hit reflects the origin
  immediately. If a fresh deploy doesn't show up, re-check; purging the cache won't help.
- See `docs/design.md` for the design language and `docs/ideas.md` for the backlog.

## License

[MIT](LICENSE) © 2026 Aliaksei Kozel
