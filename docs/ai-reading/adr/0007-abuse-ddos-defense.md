# ADR-0007: Layered abuse & DDoS defense with cost circuit breakers

- **Status:** Accepted
- **Date:** 2026-07-22

## Context

The service spends real money on three things: LLM calls, email sends, and
(via fraud) payment processing. Being anonymous and public, it is exposed
to scraping, spam, and cost-exhaustion attacks. The product owner
explicitly asked for DDoS/abuse prevention.

## Decision

Defense in depth, cheapest checks first:

1. **Edge protection (Cloudflare):** WAF, IP/ASN rate-limiting rules, and
   **Turnstile** (privacy-friendly, no account) on the two write endpoints
   that cost money or send mail: *start reading → capture contact/send
   link* and any *resend*.
2. **Payment gates the LLM:** with templated verification (ADR-0006), **no
   LLM call exists before a confirmed payment**, so the expensive surface is
   behind money.
3. **Stateless token rejection:** HMAC-signed tokens (ADR-0001) let the
   Worker drop forged requests before DB/LLM access.
4. **Send throttling:** cap link sends per email and per IP per day; cap
   resends; Turnstile before every send — prevents use as a spam cannon.
5. **Server-side quotas:** free-question count, one-shot reading generation,
   and credit balance are enforced against the database row, never trusted
   from the client. Reading generation is **idempotent** (ADR-0008-adjacent)
   so refreshes cannot double-spend.
6. **Cost circuit breakers:** per-reading and global **daily token/spend
   caps** with an operator **kill switch**; alerting when thresholds near.
7. **Webhook hardening:** verify provider signatures; idempotent crediting
   keyed on memo code / event id.

## Consequences

**Positive**
- The realistic worst case (someone hammering the funnel) burns static
  compute + rate-limited emails, not unbounded LLM spend.
- Circuit breakers bound catastrophic cost from any novel vector.

**Negative / risks**
- Turnstile adds a small UX step and a Cloudflare dependency.
- Rate limits can false-positive on shared NATs (offices, campuses); limits
  must be generous enough and paired with Turnstile rather than hard IP
  bans.

## Alternatives considered

- **Accounts + email verification as the gate:** rejected — conflicts with
  ADR-0001; Turnstile + payment gating achieves the cost goal without
  accounts.
- **No global caps, rely on per-IP limits only:** rejected — distributed
  attacks bypass per-IP limits; a global spend ceiling is the backstop.
