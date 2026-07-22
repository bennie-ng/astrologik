# Functional Requirements — AI-assisted Tử Vi Reading ("Luận giải")

Status: Draft for review · Date: 2026-07-22

Scope: the paid, AI-assisted interpretation layer on top of the existing
free lá số tử vi chart. Anonymous users, capability-URL access
(ADR-0001), Cloudflare Worker + Supabase (ADR-0002), VietQR + credits
(ADR-0003), email-only delivery (ADR-0004), Fable 5 (ADR-0005), templated
verification (ADR-0006).

Priority key: **M** = MVP (must), **S** = should, **C** = could / later.

Glossary: **Reading** = one paid interpretation tied to one chart & token.
**Credit wallet** = prepaid VND balance attached to a reading token.
**Verification questionnaire** = templated true/partly/false statements.

---

## FR-1 Entry: the Explain action

- **FR-1.1 (M)** On a chart the user has already generated in the Tử vi tab,
  an **"Luận giải" (Explain)** button is visible.
- **FR-1.2 (M)** Pressing it opens a **"Nhận trang riêng" (Get your
  dedicated page)** modal. No chart data or LLM call is triggered yet.
- **FR-1.3 (M)** The modal captures a single **email** field, a Turnstile
  challenge, and a consent/disclaimer checkbox (entertainment/reference +
  privacy note).
- **FR-1.4 (M)** The birth **inputs** (solar date, birth-hour chi, gender,
  birthplace / true-solar parameters) are submitted — **not** a
  client-computed chart (ADR-0008).
- **FR-1.5 (S)** If the user re-opens the modal for the same chart in the
  same session, the previously entered email is pre-filled.

## FR-2 Contact capture & link delivery

- **FR-2.1 (M)** On submit with a valid Turnstile token, the Worker creates
  a **reading** record in state `created`, mints a signed capability token,
  and sends the **dedicated URL** (`/r/<token>`) to the email by the email
  provider.
- **FR-2.2 (M)** The modal then shows a "check your email" confirmation with
  the masked address, and a **resend** control (rate-limited, FR-9).
- **FR-2.3 (M)** The email is transactional, in Vietnamese, from a verified
  `astrologik.app` sender, and contains the link plus a "do not share this
  link" notice.
- **FR-2.4 (S)** A **"request my link again"** entry point (email input →
  resend) exists for users who lost the URL.
- **FR-2.5 (M)** No account, password, or verification code is required to
  open the link.

## FR-3 Dedicated page access

- **FR-3.1 (M)** `GET /r/<token>` renders the dedicated page for a valid,
  signed, non-expired token; invalid/forged tokens return a friendly error
  without leaking whether the token ever existed.
- **FR-3.2 (M)** The page reflects the reading's **current state** and
  resumes where the user left off (questionnaire, payment, reading, Q&A).
- **FR-3.3 (M)** The page shows the chart summary (recomputed server-side)
  so the user can confirm it is the right chart.
- **FR-3.4 (S)** The page is shareable-warning-labeled and works on mobile
  and desktop, matching the existing design system and Vietnamese copy.

## FR-4 Verification questionnaire

- **FR-4.1 (M)** The page presents **5–8 templated statements** derived
  deterministically from the chart (ADR-0006), each answerable **Đúng /
  Đúng một phần / Không đúng** (true / partly / false).
- **FR-4.2 (M)** Generating these statements makes **no LLM call**.
- **FR-4.3 (M)** Answers are persisted against the reading and are editable
  until payment is completed.
- **FR-4.4 (M)** The user can proceed to payment after answering (or
  explicitly skipping) all statements.
- **FR-4.5 (C)** Answered statements visibly influence a short "preview"
  line to build confidence before paying (no LLM; templated).

## FR-5 Payment for the reading (100,000 ₫)

- **FR-5.1 (M)** Requesting the reading opens a **payment step** priced at
  **100,000 ₫** that unlocks the detailed reading **and** grants **3 free
  questions**.
- **FR-5.2 (M)** The Worker mints a **VietQR** with bank/account/amount and
  a **unique memo code**, displayed with human-readable transfer
  instructions and an expiry countdown.
- **FR-5.3 (M)** On the provider webhook confirming a matching transfer, the
  reading moves to `paid`, the wallet is credited, and generation starts.
- **FR-5.4 (M)** Payment confirmation and crediting are **idempotent**
  (ADR-0008); duplicate webhooks do not double-credit.
- **FR-5.5 (S)** Under-payment, over-payment, wrong/edited memo, and expiry
  are handled with clear user messaging and an operator reconciliation path.
- **FR-5.6 (M)** In Phase 0 (before the gateway is live) a **dev-unlock
  flag** simulates a confirmed payment in non-production only.

## FR-6 Detailed reading generation

- **FR-6.1 (M)** After `paid`, the Worker calls **Fable 5** with the system
  prompt + server-recomputed chart JSON + the user's verification answers,
  and produces a structured Vietnamese reading.
- **FR-6.2 (M)** The reading covers, at minimum: tổng quan/tính cách, sự
  nghiệp & tài lộc, tình duyên & hôn nhân, sức khỏe, and an đại vận
  timeline.
- **FR-6.3 (M)** Generation is **one-shot and idempotent** (ADR-0008); the
  stored `reading_md` is returned on subsequent views without re-calling the
  model.
- **FR-6.4 (M)** While generating, the page shows a progress state; on
  failure the user is not charged again and generation can be safely
  retried by the Worker.
- **FR-6.5 (M)** The reading renders with the entertainment/reference
  disclaimer.
- **FR-6.6 (S)** The reading is downloadable/printable (e.g. save as PDF).

## FR-7 Natural-language Q&A

- **FR-7.1 (M)** After the reading, the user can ask **free-text questions**
  in Vietnamese about their chart.
- **FR-7.2 (M)** The **first 3 questions are free**; from the 4th, each
  costs **25,000 ₫**, drawn from the credit wallet.
- **FR-7.3 (M)** Free-question count and wallet balance are enforced
  **server-side** per reading; the client cannot bypass the limit.
- **FR-7.4 (M)** When the balance is insufficient, the user is prompted to
  **top up** (FR-8) before the question is answered; a question is only
  charged once answered successfully.
- **FR-7.5 (M)** Answers are grounded in the chart and prior reading using
  the **cached** prefix (ADR-0005); Q&A history is shown and persisted.
- **FR-7.6 (S)** The model declines or redirects out-of-scope, harmful, or
  definitive medical/financial/legal requests, staying within tử vi
  interpretation.
- **FR-7.7 (C)** Suggested starter questions are offered.

## FR-8 Credit top-up

- **FR-8.1 (M)** The user can **top up** the wallet via VietQR in bundles
  (e.g. 100,000 ₫ = 5 questions, 200,000 ₫ = 12) — amounts configurable.
- **FR-8.2 (M)** Top-ups use the same VietQR + memo + idempotent crediting
  path as FR-5.
- **FR-8.3 (M)** The current balance and question price are always visible.
- **FR-8.4 (S)** A simple ledger of purchases and spends is viewable on the
  dedicated page.

## FR-9 Notifications & recovery

- **FR-9.1 (M)** Link delivery and resends go out by **email** via the
  `Notifier` abstraction (ADR-0004).
- **FR-9.2 (M)** Resend is **rate-limited** per email and per IP (see NFR).
- **FR-9.3 (S)** A payment-confirmed / reading-ready email is sent so the
  user can return via a fresh link.
- **FR-9.4 (C)** SMS/Zalo channels may be added later with no change to
  calling code.

## FR-10 Operations, trust & compliance

- **FR-10.1 (M)** Every reading displays an **entertainment/reference
  disclaimer**; a privacy note explains what contact data is stored and why.
- **FR-10.2 (M)** An operator **kill switch** can disable new LLM
  generation and new payments without taking the site down.
- **FR-10.3 (M)** An audited **admin path** can reconcile a mismatched
  payment, refund, or authorize a single reading regeneration.
- **FR-10.4 (S)** Basic funnel metrics (explain → contact → verify → pay →
  reading → Q&A) are captured for analytics.
- **FR-10.5 (S)** A user can request deletion of their reading/contact data.

---

## Out of scope (MVP)

- User accounts, login, or a cross-device "my readings" dashboard.
- Zalo/SMS delivery (deferred, ADR-0004).
- MoMo/ZaloPay/VNPay checkout (future providers behind the abstraction).
- Multi-language reading output (Vietnamese only at launch).
- Human-astrologer review / marketplace.
