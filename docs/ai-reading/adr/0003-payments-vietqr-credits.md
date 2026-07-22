# ADR-0003: Payments via VietQR auto-reconciliation with a prepaid credit wallet

- **Status:** Accepted
- **Date:** 2026-07-22

## Context

Pricing is in VND micro-amounts — 100,000 ₫ for a reading, 25,000 ₫ per
paid question — for anonymous users (no accounts, ADR-0001). Paying
per-question via a fresh checkout each time is high-friction and runs into
gateway minimums and settlement overhead. The market is Vietnam, where
bank-transfer QR (VietQR) is ubiquitous and works from any banking app
without the payer holding an account with us.

## Decision

- **Collection via VietQR auto-reconciliation** using a provider such as
  **SePay or Casso** that monitors a linked Vietnamese bank account and
  fires a webhook on incoming transfers.
  - For each pending payment the Worker mints a VietQR encoding
    `bank + account + amount + a unique memo code` (e.g. `AST7QK2`).
  - The **memo code is the join key** (bank transfers carry no payer
    identity). It is unique per pending payment and expires if unpaid.
  - The webhook matches the memo, verifies the provider signature, and
    credits the reading — idempotently.
- **Prepaid credit wallet** per reading token: the 100,000 ₫ purchase
  unlocks the reading and includes the first 3 questions free; further
  questions cost 25,000 ₫ each, drawn from a **credit balance** the user
  tops up in bundles. No per-question checkout.
- The **payment provider is abstracted** behind a `PaymentProvider`
  interface so MoMo/ZaloPay/VNPay can be added without touching business
  logic.

## Consequences

**Positive**
- Lowest fees and best no-account UX for the Vietnamese market.
- Wallet removes per-question payment friction and smooths unit economics.
- Provider abstraction avoids lock-in.

**Negative / risks**
- Bank-transfer QR has **no payer identity** — reconciliation depends
  entirely on a correct, unique memo; users who edit the memo can create
  unmatched payments (need a manual-reconciliation/admin path and clear
  instructions).
- Under/over-payment and late payments must be handled explicitly.
- Depends on a real bank account + provider account (procurement lead
  time); until then payment is behind a **dev-unlock flag** (Phase 0).

## Alternatives considered

- **MoMo/ZaloPay/VNPay hosted checkout:** more familiar UI for some, but
  higher fees and a redirect flow; kept as future providers behind the
  same abstraction.
- **Pay-per-action, no wallet:** rejected — friction and gateway minimums
  on 25,000 ₫ micro-payments.
