# ADR-0005: Fable 5 for reading and Q&A, with prompt caching of the chart+reading prefix

- **Status:** Accepted
- **Date:** 2026-07-22

## Context

Interpretation and Q&A are produced by the Claude API. The product owner
chose **Fable 5 everywhere** (over Opus 4.8) for cost and latency, with
quality still strong. A single reading is a few thousand output tokens;
follow-up questions re-use the same large context (system prompt + chart +
the generated reading), which would be wasteful to resend uncached.

## Decision

- Use **Fable 5** (`claude-fable-5`) for both the one-time detailed reading
  and the natural-language Q&A.
- Structure every Q&A request so the stable prefix
  `[system prompt + structured chart JSON + the generated reading]` is
  marked for **prompt caching**; only the new question + prior short Q&A
  turns are uncached. This keeps marginal Q&A cost low (cache-read rates)
  and supports the "3 free then 25,000 ₫" economics.
- The **model id is a configuration value**, not hard-coded, so the reading
  and Q&A models can be changed or A/B tested (e.g. promote the reading to
  Opus 4.8) without code changes.
- All Claude calls are **server-side only** (Worker holds the key).

## Consequences

**Positive**
- Low, predictable per-call cost; fast responses.
- Caching makes even the free questions cheap and paid questions
  high-margin.
- Config-driven model choice preserves the option to upgrade quality.

**Negative / risks**
- Cache lifetime is limited; a question asked long after the reading may
  miss the cache and pay full input cost (still bounded, still cheap).
- Model/prompt changes can shift interpretation tone; needs a small
  regression set of golden charts to review output stability.

## Alternatives considered

- **Opus 4.8 for the reading, cheaper tier for Q&A:** stronger depth on the
  marquee artifact; deferred — kept available via the config flag.
- **No prompt caching (resend context each turn):** rejected — needlessly
  multiplies Q&A cost.
