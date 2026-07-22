# ADR-0008: Server-authoritative chart recomputation and idempotent, one-shot generation

- **Status:** Accepted
- **Date:** 2026-07-22

## Context

The chart, the reading, and the credit ledger have money attached. A client
could tamper with a submitted chart to get a different reading, or trigger
repeated generation (page refresh, retries) to double-spend LLM budget or
corrupt credit accounting.

## Decision

- The Worker **recomputes the chart server-side from the birth inputs**
  using `lunar-core` (the same deterministic engine the app uses). The
  client-submitted chart is never trusted; only birth inputs
  (date, birth-hour chi, gender, birthplace/true-solar parameters) cross the
  boundary.
- **Reading generation is one-shot and idempotent per reading:** the first
  successful generation persists `reading_md`; subsequent requests return
  the stored result rather than calling the model again.
- **Credit and payment mutations are idempotent and atomic:** payment
  crediting is keyed on the memo code / webhook event id; question charging
  decrements the balance in a single transactional step guarded so the same
  question cannot be charged twice.

## Consequences

**Positive**
- No client-side tampering of paid output.
- Refreshes, retries, and duplicate webhooks cannot double-charge or
  double-spend.
- Reading output is stable and cacheable.

**Negative / risks**
- Regeneration (e.g. after a genuinely bad output) needs an explicit,
  audited admin/support path rather than "just refresh".
- Requires careful transaction design around the credit ledger.

## Alternatives considered

- **Trust client-sent chart JSON:** rejected — tamperable and inconsistent
  with the engine of record.
- **Regenerate on each view:** rejected — nondeterministic, wasteful, and
  double-spends budget.
