# Ideas & backlog — living doc

Status: **Living document** · Last updated: 2026-10-19

Parked, decided-against, or not yet built.

## Shipped since v1 (no longer backlog)

- **Multilingual** — English at the root, Russian at `/ru/`, Belarusian at `/be/`; path prefixes,
  never a cookie, so every locale stays shareable and indexable. Every page but `404`.
- **Notes** — the writing archive, with per-note translations.
- **Recommendations page** — every quote on a page of its own, with a translation toggle.
- **Donate button** — wired to `site.donateUrl`, still hidden while that is empty (see
  `donations.md`).

## Out of scope

- **Family history.**
- **Coat of arms as a brand mark** — not ready yet.
- **Donation provider integration** — the button links out; no payment code lives here (see
  `donations.md`).

## Parked for later

- **Social preview image** — `og:title`, `og:description` and `og:type` are set, but there is no
  `og:image` and no `twitter:card`, so a shared link renders without a picture. The sitemap and
  hreflang are done; this is the missing half of link presentation. Parked 2026-10-23 — not now.

## Open questions

- **The umbrella, in public.** The apex is the person and `go.kozel.red` is the product
  (**KozelGo** — websites and apps for energy healers), but nothing on either site links to the
  other. Decide whether the personal site should point at the product (a "work" or "studio" line),
  or keep the two deliberately unlinked. The hostname map itself is settled — KozelGo's
  `docs/routing.md` owns it; this is only about whether the sites acknowledge each other.
- **Session buffers ("recharge" gaps).** Settled by the product rather than by code: every session
  is 30 minutes on one hourly grid (`08:00–20:00` Minsk), so each booking leaves a uniform
  30-minute gap. Revisit only if durations diverge again.
