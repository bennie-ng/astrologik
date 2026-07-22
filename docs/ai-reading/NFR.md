# Non-Functional Requirements — AI-assisted Tử Vi Reading ("Luận giải")

Status: Draft for review · Date: 2026-07-22

Each requirement has an ID, a target, and how it is verified. Targets are
initial and should be tuned against real traffic and current Claude
pricing. Currency reference: ~26,000 ₫/USD (2026); reading = 100,000 ₫
(~$3.8), paid question = 25,000 ₫ (~$0.95).

Priority key: **M** = MVP, **S** = should, **C** = later.

---

## NFR-P Performance & latency

- **NFR-P1 (M)** Dedicated page first render (state fetch) **< 1.5 s p95**
  on a 4G Vietnamese mobile connection.
- **NFR-P2 (M)** Verification questionnaire generation (no LLM) **< 200 ms
  p95** server time.
- **NFR-P3 (M)** VietQR mint + display **< 1 s p95** after the pay action.
- **NFR-P4 (M)** Detailed reading generation **< 25 s p95** end-to-end;
  a progress state is shown throughout (FR-6.4). Streaming is preferred if
  it improves perceived latency.
- **NFR-P5 (M)** Q&A answer **< 10 s p95** (aided by prompt caching,
  ADR-0005).
- **NFR-P6 (S)** Payment confirmation surfaced to the page **< 10 s p95**
  after the bank transfer settles and the webhook fires.

## NFR-A Availability & reliability

- **NFR-A1 (M)** Reading service availability **≥ 99.5%/month** (excludes
  upstream Claude/provider outages, which must degrade gracefully).
- **NFR-A2 (M)** A paid-but-not-yet-generated reading is **never lost**: if
  generation fails, it retries and the user is not re-charged (FR-6.4).
- **NFR-A3 (M)** Payment webhooks are processed **at-least-once** with
  **idempotent** effects (ADR-0008); a missed/duplicated webhook never
  corrupts the wallet.
- **NFR-A4 (S)** Upstream LLM/provider failures show a clear retry message
  and never leave the user charged without value.

## NFR-SEC Security

- **NFR-SEC1 (M)** Capability tokens are **≥128-bit** entropy and
  **HMAC-signed**; tampered/forged tokens are rejected without DB/LLM
  access (ADR-0001).
- **NFR-SEC2 (M)** All secrets (Claude key, HMAC key, payment webhook
  secret, email + Supabase service keys) live as **server-side Worker
  secrets**; none appear in the client bundle or logs.
- **NFR-SEC3 (M)** Supabase **RLS denies the anon/public role**; the Worker
  (service role) is the only DB client (ADR-0002).
- **NFR-SEC4 (M)** Payment and delivery webhooks **verify provider
  signatures** and reject unsigned/replayed events.
- **NFR-SEC5 (M)** All traffic over HTTPS/TLS; tokens only transit URL path
  + TLS, never logged in plaintext analytics.
- **NFR-SEC6 (S)** Dependency and secret scanning in CI; least-privilege
  keys (e.g. scoped email/send-only).

## NFR-ABU Abuse resistance & cost control

- **NFR-ABU1 (M)** **No LLM call before a confirmed payment** (ADR-0006);
  verified by design review + tests asserting the pre-pay path issues zero
  Claude requests.
- **NFR-ABU2 (M)** **Turnstile** required on contact-capture and resend;
  **rate limits**: ≤ N link-sends per email/day and per IP/day (initial
  N=3), ≤ M readings started per IP/hour.
- **NFR-ABU3 (M)** **Per-reading and global daily token/spend caps** with an
  operator **kill switch** (FR-10.2); breaching a cap disables new
  generation and alerts, without taking the free site down.
- **NFR-ABU4 (M)** Server-side enforcement of free-question count, one-shot
  generation, and wallet balance (ADR-0008); client cannot override.
- **NFR-ABU5 (S)** Anomaly alerting on spend rate, send rate, and
  unmatched-payment rate.

## NFR-COST Unit economics

- **NFR-COST1 (M)** Marginal LLM + delivery cost of one reading **≤ 15%** of
  the 100,000 ₫ price (target; validate against current Fable 5 pricing).
- **NFR-COST2 (M)** Marginal cost of a paid question **≤ 15%** of 25,000 ₫,
  achieved via prompt caching (ADR-0005).
- **NFR-COST3 (M)** The 3 free questions per reading remain **cheap in
  absolute terms** (cents) due to caching; monitored per reading.
- **NFR-COST4 (S)** Payment-gateway fees per transaction tracked and kept
  within margin (favors VietQR, ADR-0003).

## NFR-PRIV Privacy & compliance

- **NFR-PRIV1 (M)** Only the data needed to deliver the service is stored:
  email, birth inputs, chart, verification answers, reading, Q&A, payment
  records. No marketing profile is built without consent.
- **NFR-PRIV2 (M)** A visible **privacy note** and **entertainment/reference
  disclaimer** are shown before capture and on the reading (FR-10.1),
  consistent with Vietnam's PDPD (Decree 13/2023).
- **NFR-PRIV3 (M)** Contact data has a **defined retention period** and a
  **deletion path** on request (FR-10.5).
- **NFR-PRIV4 (S)** PII is minimized in logs (mask emails, never log full
  tokens); analytics events carry no PII.

## NFR-SCAL Scalability

- **NFR-SCAL1 (M)** Stateless Worker scales horizontally on Cloudflare;
  no in-process session state.
- **NFR-SCAL2 (M)** Sustained **50 concurrent readings** and **500
  dedicated-page views/min** with targets held; LLM concurrency bounded by
  cost caps, with queued/back-pressured generation rather than failure.
- **NFR-SCAL3 (S)** Database access patterns indexed for token lookup, memo
  lookup, and per-reading question counts.

## NFR-OBS Observability

- **NFR-OBS1 (M)** Structured logs for each state transition (created →
  contact → verified → paid → generated → Q&A) with a correlation id per
  reading (no PII/tokens in plaintext).
- **NFR-OBS2 (M)** Metrics: funnel conversion per step, generation latency,
  Q&A latency, LLM spend, email send/deliver/bounce, payment
  matched/unmatched, cap-breach events.
- **NFR-OBS3 (M)** Alerting on: spend approaching cap, kill-switch active,
  webhook signature failures, elevated generation errors, email bounce
  spikes.
- **NFR-OBS4 (S)** A lightweight ops dashboard for reconciliation and
  refunds (FR-10.3).

## NFR-MAINT Maintainability & portability

- **NFR-MAINT1 (M)** `Notifier` and `PaymentProvider` are **interfaces**;
  adding Zalo/SMS or MoMo/ZaloPay needs no change to business logic
  (ADR-0003, ADR-0004).
- **NFR-MAINT2 (M)** Model ids and prices are **configuration**, not
  hard-coded (ADR-0005); changing the model or amounts needs no code change.
- **NFR-MAINT3 (M)** Chart computation reuses the existing **`lunar-core`**
  engine (single source of truth, ADR-0008).
- **NFR-MAINT4 (S)** A golden-chart regression set reviews reading/Q&A
  output stability across prompt/model changes.

## NFR-UX Usability, i18n & accessibility

- **NFR-UX1 (M)** All user-facing copy in **Vietnamese**, consistent with
  the existing product voice.
- **NFR-UX2 (M)** Dedicated page meets **WCAG AA** contrast and works in
  light/dark, matching the current design system and responsive breakpoints.
- **NFR-UX3 (M)** The payment step gives unambiguous transfer instructions
  (exact amount, exact memo) to minimize unmatched payments.
- **NFR-UX4 (S)** Clear, non-alarming error/empty/expiry states throughout
  the funnel.

## NFR-QUAL Content quality & safety

- **NFR-QUAL1 (M)** Readings and answers stay within tử vi interpretation;
  the model avoids definitive medical, financial, or legal directives
  (FR-7.6).
- **NFR-QUAL2 (M)** No fabricated certainty about identity/real-world facts;
  outputs are framed as interpretation, not prediction of fact.
- **NFR-QUAL3 (S)** A feedback control ("was this accurate?") feeds prompt
  and statement-bank tuning.
