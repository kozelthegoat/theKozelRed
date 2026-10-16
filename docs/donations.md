# Donations

Status: **Living document** · Last updated: 2026-10-16

Donations are **not offered**. The 1:1s are free and request-based, and the site has **no payment code** — nothing to do with cards, VAT, or payouts lives in this repo.

## How the button is wired

The floating **Donate** button (fixed, screen corner) reads `site.donateUrl` from `src/data/site.js`. While that value is empty the button stays hidden; set it to any donation link to show it. The `/schedule/` hero also carries a **Donations** tag.
