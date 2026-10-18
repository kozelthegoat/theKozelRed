# Donations

Status: **Living document** · Last updated: 2026-10-16

Donations are **not offered**. The 1:1s are free and request-based, and the site has **no payment code** — nothing to do with cards, VAT, or payouts lives in this repo.

## How the button is wired

The floating **Donate** button (fixed, screen corner) reads `site.donateUrl` from `src/data/site.js`. While that value is empty the button stays hidden; set it to any donation link to show it. The `/schedule/` hero also carries a **Donations** tag.

## VPOS.am — assessed (2026-10-17)

**Enquiry sent — 2026-10-17.** Awaiting their reply. Four answers decide what comes next:

| their answer | what it unblocks |
|---|---|
| which bank route, what onboarding needs from a solo IE | the contract step, and the bank pre-check |
| whether donations need fiscal receipts (SRC e-HDM) | whether the `donations` table carries a receipt status at all |
| whether a refund policy is required for donations | how much of `legal-drafts.md` §1–2 we actually need |
| the exact document set + language scope | **what goes to the translator, and nothing more** |

Nothing here is blocked on any of it except the document set — the i18n scaffolding and the payment
skeleton are the same work either way, and can start before the reply lands.


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

### Their donation article — what it adds (2026-10-17)

Source: `vpos.am/en/blog/donation-fundraising-payments-armenia/`. It confirms the flow above and sharpens four things.

1. **Campaign context is part of the payment request.** Fix campaign id, amount, currency, request id and an
   expiration *before* payment, from a controlled form — "amount without campaign id ... does not help close
   reporting". Even with a single campaign, pass an id (e.g. `donations-2026`) so reports stay separable later.
2. **One-off only, for now.** Recurring donations need provider tokenization and contract support; their advice
   otherwise is links, reminders and CRM tasks — and we have no CRM. So v1 is a single payment, and the site must
   not hint at recurring.
3. **Privacy-minimal storage, and refunds never delete.** Store the payment id, merchant order id, amount, currency,
   status and (separately) receipt status — nothing about the donor that is not required, and nothing in the logs
   that the public layer could leak. A refund is a new state on the original donation, not a deletion.
   Consequence for the page: the **bank's checkout collects the donor's details**, so `/donate` needs no donor form
   at all beyond the amount — which is the privacy-minimal design *and* the least code.
4. **Do not mark a donation received from the return URL** (they repeat this twice), and handle the 3-D Secure
   mid-states: their related article notes the site must cope with pending, retries and unfinished authentication.
   So the return page says "checking with the bank", not "thank you" — thanks belongs to the verified webhook.

They also offer a free flow review at `/en/company/contacts/?source=blog&article=donation-fundraising-payments-armenia`,
which is a better opening than a cold enquiry.

## Pivot: straight to the bank (2026-10-17)

vpos.am is an **aggregator** — a middleman between the merchant and the bank. Ardshinbank (the likely acquirer
anyway) offers its own **vPOS**, including Apple Pay, so the aggregator agreement can be skipped: one contract
instead of two, one fewer party taking a cut.

What that trade looks like, from what I could read:

| | bank direct | via vpos.am |
|---|---|---|
| contracts | one (bank) | two (bank + VPOS.am) |
| docs & API | unknown — usually a hosted payment page, a callback URL and a merchant-portal status lookup | published OpenAPI, signed webhooks, idempotency, sandbox |
| fiscal receipts (SRC e-HDM) | our own problem | a product they sell (VPOS Fiscal) |
| integration effort | higher | lower |

**What I could not read:** `ardshinbank.am/for-your-business/pos-vpos?sft=vpos` renders the POS-terminal content
server-side and the **VPOS tab client-side**, so the online-gateway specifics — merchant requirements, fees,
integration docs — did not come through a plain fetch. Unverified, not absent.

**Unchanged either way:** the source of truth is the **server-side status lookup**, never the return URL — which is
what VPOS.am's own article insists on twice, and it matters more with a bank that may not sign webhooks at all.

### Ardshinbank vPOS — read from the screenshots (2026-10-18)

Eight screenshots of the VPOS tab, OCR'd with macOS Vision (no image context spent, text only).

**Fees, from the published tariff** ("Terms and tariffs for non-cash transactions via virtual terminals ... valid
from 01.03.2026"), split by card issuer and risk class:

| risk class | ArCa (Ardshinbank) | ArCa (other banks) | Visa/MC (Ardshinbank) | Visa/MC (other banks) |
|---|---|---|---|---|
| Low | 1% | 1.5% | 1.5% | 1.8% |
| High | 1.5% | 2% | 2% | ~2.5% |

So the MDR is roughly **1–2.5%**, cheaper for cards issued by Ardshinbank itself — which is a real argument for
naming the bank in the donate copy, if we ever want to.

**Recurring: no mention anywhere.** A keyword sweep of all eight screenshots for *recurring, subscription, token,
regular, periodic, monthly, repeat, auto* returns **zero** hits. What the pages do advertise: MasterCard/Visa/ArCa,
3-D Secure, 24/7 worldwide, and the two connection routes.

That is a strong signal, not proof: the screenshots cover the VPOS tab and the POS-terminal FAQ, not the linked
tariff document in full nor the merchant-onboarding pages. Banks usually advertise what they support, so the
working assumption is **no recurring on vPOS**, and the enquiry question stands:

> Does the merchant agreement support **tokenization for recurring charges**, or do you sell a subscription
> product separately?

## Correction: no "legal-work-free" donation path (2026-10-18)

Something I said and should not have: that PayPal or GitHub Sponsors would mean donations "without legal
contracts". Wrong. Using a payment platform means accepting **its** agreement, its KYC and (for business receipts)
a Business account with the entity's details. What such a route *does* skip is **our bank's merchant-acquiring
contract and its website review** — because the platform holds the regulated end. Fewer documents, not none.

Two things to verify before relying on it:
- **Does an Armenian account *receive* funds?** Our earlier note confirmed PayPal *operates* in Armenia, which is
  mostly about sending. Receiving, and receiving as a business, is unverified. GitHub Sponsors expects an
  OSS-maintainer profile.
- **The tax character**, which is an accountant's question, not a website one.

And the trap in the word: if the 1:1s are **paid services**, money for them is **service income** — not a donation —
and it attracts the bank, fiscal and refund rules. A true voluntary gift with nothing in return is a different
thing. Calling service payments "donations" is exactly what a regulator looks at, and it is why the pre-check asks
for prices before payment and a refund policy.

**The move that answers both paths at once:** one conversation with the accountant — *is this income for the IE,
and does it need fiscal receipts?* Those are the bank's questions too. Until they are answered, `site.donateUrl`
stays empty and the Donate button stays hidden.
