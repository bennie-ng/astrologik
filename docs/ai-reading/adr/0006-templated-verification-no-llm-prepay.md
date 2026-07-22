# ADR-0006: Templated verification questionnaire — no LLM spend before payment

- **Status:** Accepted
- **Date:** 2026-07-22

## Context

Before paying, the visitor answers several "is this true of you?" questions
derived from their chart, confirming or denying each. This builds trust and
gives the paid reading calibration data. If those questions were generated
by the LLM, an attacker could trigger unlimited pre-payment LLM spend by
starting readings — the primary cost-abuse surface.

## Decision

- The verification questions are drawn from a **curated, templated
  statement bank keyed to chart features** (specific stars, brightness/độ
  sáng, star combinations, palace placements), computed **deterministically
  from the `lunar-core` chart** with **no LLM call**.
- The visitor's answers (true / partly / false) are stored and later
  injected into the paid reading prompt to calibrate emphasis and tone.
- Consequently, **all LLM spend is gated behind a confirmed payment.** The
  only pre-payment costs are static compute, one email, and a Turnstile
  check.

## Consequences

**Positive**
- Eliminates the biggest pre-payment cost-abuse vector entirely.
- Deterministic, testable, and fast; no latency or model variance in the
  funnel's most-hit step.
- Still feels personalized (statements cite the user's actual stars).

**Negative / risks**
- The statement bank must be authored and maintained by someone with tử vi
  domain knowledge; coverage gaps produce generic-feeling questions.
- Less adaptive than LLM-generated questions. Accepted; the paid reading is
  where LLM adaptivity is spent.

## Alternatives considered

- **LLM-generated verification questions:** richer, but creates unbounded
  pre-payment LLM cost and latency in the funnel — rejected.
- **Generate the full reading first, reveal only questions pre-pay:**
  rejected — spends the expensive call before payment.
