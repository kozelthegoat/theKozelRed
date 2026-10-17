# Donations

Status: **Living document** · Last updated: 2026-10-16

Donations are **not offered**. The 1:1s are free and request-based, and the site has **no payment code** — nothing to do with cards, VAT, or payouts lives in this repo.

## How the button is wired

The floating **Donate** button (fixed, screen corner) reads `site.donateUrl` from `src/data/site.js`. While that value is empty the button stays hidden; set it to any donation link to show it. The `/schedule/` hero also carries a **Donations** tag.

## VPOS.am — assessed (2026-10-17)

Source: `vpos.am/en/` (integrations, developers, webhooks) + the public API contract at `api.vpos.am/openapi.yaml`.

**What it is:** integration *software*, not a payment provider. In their words: "not a bank, acquirer, payment
organization, payment system, an e-wallet or Merchant of Record; it does not accept, hold or transfer customer
funds." Funds move under a separate **merchant agreement with a bank or licensed provider** — so the contract that
matters is with a bank (they document routes for Ardshinbank, Ameriabank, Inecobank, IDBank, Evocabank, ACBA,
Converse, plus ArCa, Idram, Telcell). The entity behind it appears to be amobit.io (their legal pages live there).

**Minimum pilot contract** (their wording): create a payment, check status, receive a webhook.

| step | endpoint |
|---|---|
| create a session | `POST /v1/payment-sessions` (merchant API key, required `Idempotency-Key`) |
| hosted checkout | the session response points at a bank-hosted page |
| confirm status | `GET /v1/payments?paymentId=` or `?merchantOrderId=` |
| event | webhook `payment.status_changed`, signed |
| refund / capture / void | `POST /v1/payments/{id}/{refunds,capture,void}`, each idempotent |
| capability check | `GET /v1/capabilities` — what this route actually allows (Apple Pay, refunds, currencies, settlement) |

**Webhook contract:** `X-VPOS-Signature: t=<unix>,v1=<hex hmac>` over the exact bytes of
`<timestamp>.<raw body>`, HMAC-SHA256, 5-minute tolerance, multiple `v1` values during rotation, up to 8 retries
with exponential backoff, 5-second timeout, and `X-VPOS-Event-Id` for duplicate detection. Their guidance is
exactly what this repo would do anyway: verify against the raw body, persist the event id, return 2xx quickly, and
apply side effects idempotently. Only `payment.status_changed` is in the public contract.

**Two integration shapes exist.** Server-side sessions (above), or the public widget `vpos.js` +
a public key + product id, aimed at closed site builders (Webflow, Squarespace, Wix) — no server integration, less
control. Worth asking them whether the widget is acceptable for a custom site.

**Gate before any of this: the bank review.** Their pre-check list, against this site:

| requirement | here |
|---|---|
| HTTPS | ✅ |
| privacy + personal-data policy | ✅ `/privacy/` |
| cancellation + refund policy | ❌ |
| terms and conditions | ❌ |
| prices before payment | ❌ (donations have no price — worth asking) |
| contact details: phone, e-mail, messenger | ❌ (email was deliberately removed from the site) |
| **Armenian version of the site, with the same information** | ❌ |

So: **technically yes, contractually not yet.** The buttons are the bank contract and those five site items —
and the Armenian version needs a translator, not a developer.
