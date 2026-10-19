# DNS & email — living doc

Status: **Living document** · Last updated: 2026-10-19

Zone **`kozel.red`** — managed entirely on **Cloudflare DNS** (nameservers `alaric` / `margaret.ns.cloudflare.com`).

Three things share this zone: **email** (receive via Migadu, send via Resend), **this site** (the
`kozel-red` Worker at the apex), and the **KozelGo umbrella hosts** (`go.kozel.red` and its client
instances). Edit records in the Cloudflare dashboard → DNS → Records; the `wrangler` token has **no
DNS scope**, so records are edited by hand (or with a scoped API token).

## Receive — Migadu

| Name | Type | Value | Proxy | Purpose |
|---|---|---|---|---|
| `@` | MX 10/20 | `aspmx1.migadu.com` / `aspmx2.migadu.com` | n/a | receive mail for the domain |
| `*` | MX 10/20 | `aspmx1/aspmx2.migadu.com` | n/a | receive on **any** subdomain |
| `autoconfig` | CNAME | `autoconfig.migadu.com` | **DNS only** | mail-client autoconfig |
| `_autodiscover` | SRV | `0 1 443 autodiscover.migadu.com` | n/a | client autodiscovery |
| `_imaps` | SRV | `0 1 993 imap.migadu.com` | n/a | IMAP autodiscovery |
| `_pop3s` | SRV | `0 1 995 pop.migadu.com` | n/a | POP3 autodiscovery |
| `_submissions` | SRV | `0 1 465 smtp.migadu.com` | n/a | SMTP (submission) autodiscovery |

## Sending & authentication

| Name | Type | Value | Proxy | Purpose |
|---|---|---|---|---|
| `@` | TXT | `v=spf1 include:spf.migadu.com -all` | n/a | SPF — authorises **Migadu** to send as the domain |
| `key1/key2/key3._domainkey` | CNAME | `keyN.kozel.red._domainkey.migadu.com` | **DNS only** | Migadu **DKIM** signing |
| `@` | TXT | `hosted-email-verify=…` | n/a | Migadu domain verification |
| `_dmarc` | TXT | `v=DMARC1; p=quarantine; rua=mailto:dmarc@kozel.red;` | n/a | DMARC policy + aggregate reports |
| `send` | CNAME | `send.forge.rmta.net` | **DNS only** | **Resend** sending |
| `rsend` | CNAME | `rsend-euw1.forge.rmta.net` | **DNS only** | Resend transport |
| `resend._domainkey` | TXT | `p=…` | n/a | Resend **DKIM** signing |
| `default._bimi` | TXT | `v=BIMI1; l=https://kozel.red/bimi/logo.svg;` | n/a | **BIMI** — brand avatar in supporting mail clients |

So: **one address (`hello@kozel.red`), two paths** — *receive* via Migadu's MX, *send* via Resend on the `send.*` subdomain. They don't conflict because they use different names.

## Hosts — Proxied

| Host | Purpose |
|---|---|
| `kozel.red`, `www.kozel.red` | this site (Worker `kozel-red`, custom domains) |
| `go.kozel.red` | the **KozelGo** product gateway (Worker `kozel-red-go-gateway`) |
| `NNN.go.kozel.red` (e.g. `001.go.kozel.red`) | a client instance's gateway |

`www` redirects to the apex. Every host here is a Cloudflare **"Worker"-type** record (orange cloud /
Proxied), so they don't appear in a BIND export — that's expected.

**The hostname map for `go.` and below lives in KozelGo's `docs/routing.md`** — that is the source of
truth for the product and its clients; this doc owns the apex and the email records. A client's own
domain (e.g. `www.aelia.love`) is **not** in this zone: a Pages custom domain must sit in the account
that owns the zone, so a client's production lives on the client's account, not ours.

## Rules of thumb (the gotchas)

- **Mail records = DNS only (grey).** Only the Worker records are Proxied (orange). A proxied `autoconfig`/`autodiscover` (or any mail CNAME) silently breaks.
- **One SPF record only.** It lives at the root as a single TXT — *replace* it, never add a second (multiple SPF records = SPF fails).
- **DKIM is multi-tenant by name.** Migadu uses `key1/2/3._domainkey` (CNAMEs); Resend uses `resend._domainkey` (TXT). Different names → they coexist. Don't let a setup wizard overwrite the other provider's records.
- **CNAMEs can't share a name** with other records — watch `autoconfig` / `autodiscover`.
- **The wildcard MX** means *any* `x.kozel.red` accepts mail via Migadu; unknown local-parts are rejected unless a catch-all is set in Migadu.

## After any DNS change — checklist

1. `dig +short MX kozel.red` → Migadu's two hosts.
2. `dig +short TXT kozel.red` → the SPF (Migadu) + verify TXT.
3. `dig +short TXT _dmarc.kozel.red` → the DMARC policy.
4. `dig +short CNAME key1._domainkey.kozel.red` + `autoconfig.kozel.red` → still present.
5. `dig +short CNAME send.kozel.red` + `resend._domainkey` → Resend intact.
6. Receive test: mail to `hello@kozel.red` → lands in Migadu. Send test: from Migadu → SPF/DKIM pass.
7. Re-run the booking flow → the host alert (Resend → `aliaksei@kozel.red`) should land; the requester confirmation goes to their own address.

## Open items

- **Mailboxes & aliases (Migadu)** — mailboxes `hello@` + `aliaksei@`; aliases `postmaster@` / `abuse@` / `admin@` / `dmarc@` → `hello@` (RFC 2142 + DMARC reports). Bookings use `aliaksei@kozel.red` — the site's `BOOKING_FROM` and `BOOKING_TO`.
- **`autodiscover` CNAME** — confirm against Migadu's guide whether a CNAME is also expected alongside the `_autodiscover` SRV.
- **BIMI** — logo at `/bimi/logo.svg` (regenerate with `npm run icons` against the design tokens). The `default._bimi` record is **live** (verified). Apple Mail / Fastmail / Yahoo show the mark (after their caches refresh); **Gmail needs a paid VMC**, so Gmail falls back to a letter avatar.
