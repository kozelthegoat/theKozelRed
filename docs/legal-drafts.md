# Legal & contact drafts (for VPOS bank review)

Status: **Draft for review** · Last updated: 2026-10-17 · Nothing here is published on the site yet.

Written as website copy for a bank/vPOS pre-check. Not legal advice — a reviewer (or a lawyer) should read it
before it goes live. Placeholders are marked «like this».

## 1. Terms and Conditions

*Drafted on the premise that 1:1 sessions are paid services.*

**Who this is with.** «Legal name» ("I", "me"), an individual entrepreneur in «country», operating kozel.red. Contact
details are at the bottom of every page.

**What is offered.** One-to-one sessions booked through kozel.red/schedule/. The session type, duration and price are
shown before you pay. Sessions take place online, by video call; a link is sent with the confirmation.

**Prices.** «Price table — see §"Prices" — must be filled in before this goes live»

| session | duration | price |
|---|---|---|
| Intro Call | 30 min | «AMD / USD / EUR» |
| Career Review | 45 min | «AMD / USD / EUR» |
| Working Session | 60 min | «AMD / USD / EUR» |

Prices are shown before payment and are not changed after a booking is confirmed. Any bank or card fees charged by
your bank are outside my control.

**Booking.** You pick a session, a date, a time and leave a note; that is a *request*, not a binding contract. I
confirm by e-mail, and the payment link is then issued. If a request is declined, nothing is charged.

**Payment.** Payment is taken through a bank-hosted checkout (payment card; other methods only if enabled for my
merchant account). Card details are entered on the bank's page — they never reach this site, and I cannot see them.

**Cancellation and rescheduling.**

- **You, 24 hours or more before the session:** free reschedule, or a full refund on request.
- **You, under 24 hours before, or a no-show:** the session is treated as delivered; no refund, and rescheduling is
  at my discretion.
- **Me, any time:** full refund, or a reschedule if you prefer — your choice.
- **Non-refundable:** a session that has already taken place, and any session cancelled by you inside the 24-hour
  window.

See the standalone Cancellation & Refund Policy below, which forms part of these terms.

**Refunds.** Refunds go back to the card used for payment, through the same bank, typically within «N» business days.
A refund can only be sent to the original payment method. If a refund is due because of an error on my side, the
bank's fee is not deducted.

**Fiscal receipts.** «If local rules require a fiscal receipt for these services, state here how the buyer receives
it. Nothing is issued today.»

**Your responsibilities.** Be on time, have a working connection, and take part in good faith. Sessions may be
recorded only with mutual agreement; otherwise recording is not allowed by either side.

**What you get.** Advice and opinion, offered honestly. It is not legal, financial, medical or other regulated
professional advice, and no specific outcome is promised. Decisions you take remain yours.

**Liability.** To the extent permitted by law, liability is limited to the amount paid for the session in question.
Nothing here excludes liability that cannot be excluded.

**Changes.** These terms may change; the version in force is the one published when you book.

**Governing law.** «The laws of «country», with disputes heard by the courts of «city».»

## 2. Cancellation & Refund Policy

*Stands alone, because the bank asks for it separately.*

1. Sessions are booked through kozel.red/schedule/. Prices are shown before payment.
2. You may reschedule or cancel free of charge up to **24 hours** before the session, and ask for a full refund.
3. Cancelling **less than 24 hours** before, or not attending, means the session is considered delivered: **no refund**,
   and a reschedule is at my discretion.
4. **If I cancel**, you choose: a full refund, or a reschedule.
5. Sessions that have already taken place are **non-refundable**.
6. Refunds are issued to the original payment method through the bank, typically within «N» business days.
7. To cancel, reschedule or request a refund, write to the contact below — a message is enough.

## 3. Contact details (block for the footer, in every language)

| channel | value |
|---|---|
| e-mail | `hello@kozel.red` |
| messenger | «Telegram or WhatsApp handle — optional if e-mail is enough» |
| phone | «optional — the bank asks for at least one working channel, and e-mail qualifies» |

**Answer to your question:** a Contacts *page* is not required — the requirement is that the contact details are
public and findable. A footer block on every page is arguably better than a separate page, because a reviewer
checking any single page finds it there. `hello@kozel.red` already exists (the family mailbox) and is the address
already published in `docs/dns.md`, so exposing it costs nothing and keeps `aliaksei@` private.

## 4. Pilot enquiry to send VPOS.am

> Hello,
>
> I run kozel.red, a small personal consulting site (Astro on Cloudflare Workers, custom backend, not a CMS), with a
> 1:1 booking flow. I would like to add **donations** — one-off amounts, cards — through a bank-hosted checkout, and
> VPOS.am looks like the right integration layer.
>
> Three questions before I start the paperwork with a bank:
>
> 1. My site is custom-built, not one of the supported site builders. Is the public widget (`vpos.js` + a public
>    key) an acceptable path for a custom site, or do you require the server-side `/v1/payment-sessions` flow?
> 2. For **donations** rather than goods or services: is a merchant side refund/cancellation policy still required
>    for the bank review, and are fiscal receipts (SRC e-HDM) applicable to a voluntary payment with no invoice?
> 3. Which bank route would you suggest for a very low volume of small donations, and what does onboarding require
>    from me as an individual entrepreneur?
>
> I can prepare the Armenian version of the site and the legal pages if that unblocks the review.
>
> Regards,
> Aliaksei Kozel

## 5. Language switcher — plan, and the one limit that matters

Following KozelGo's approach: **path-prefixed locales** (`/` = English, `/ru/`, `/hy/`), with the switcher in the
footer next to the legal links.

- Astro i18n config: `defaultLocale: 'en'`, `locales: ['en','ru','hy']`, `prefixDefaultLocale: false`.
- Page bodies move behind a per-locale dictionary, so one component renders all three.
- Canonical + `hreflang` per locale, so the three versions do not compete in search.

**The limit:** I can draft the **Russian**, but I will not machine-translate into **Armenian** for a document a bank
reviews — a wrong register or a mistranslated refund clause is worse than an untranslated one. Armenian needs you or
a translator. That is the one item on the whole donations path that code cannot close.
