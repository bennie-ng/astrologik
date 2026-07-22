# ADR-0002: Cloudflare Worker as API layer, Supabase Postgres as data store

- **Status:** Accepted
- **Date:** 2026-07-22

## Context

The reading service needs: a server that holds secrets (Claude API key,
HMAC key, payment webhook secret, email provider key), a database for
readings/payments/questions, and an integration point for payment and
delivery webhooks. The existing site already runs on a Cloudflare Worker
(`worker/index.ts`) serving static assets and SSR day pages. A Supabase
project and an email provider are already connected to the workspace.

## Decision

- **Cloudflare Worker** is the single backend/API layer for the reading
  service: token validation, Turnstile verification, the templated
  verification bank, Claude calls, and inbound payment/delivery webhooks.
  New routes live under `/api/reading/*`, `/webhook/*`, and the dedicated
  page shell at `/r/:token`.
- **Supabase Postgres** is the system of record. The Worker is the **only**
  database client, using the service-role key. Row-Level Security is set to
  **deny-all for the anon/public role** — the browser never queries
  Supabase directly.
- Secrets are stored as Worker secrets/bindings, never shipped to the
  client bundle.

## Consequences

**Positive**
- Reuses existing infra and deploy pipeline (one Worker, one domain).
- Clear trust boundary: all authorization decisions happen in the Worker.
- Postgres gives flexible schema evolution, JSONB for chart snapshots, and
  straightforward analytics/reporting later.

**Negative / risks**
- The Worker becomes a stateful-ish critical path; needs good error
  handling and observability (see NFR).
- Worker ↔ Supabase latency per request; mitigated by minimal queries and
  connection via Supabase's HTTP/`postgrest` or a pooled driver suited to
  edge runtimes.
- Two platforms to operate (Cloudflare + Supabase) instead of one.

## Alternatives considered

- **All-Supabase (Edge Functions + Postgres):** rejected — would split the
  API away from the Worker that already serves the site.
- **All-Cloudflare (Worker + D1 + KV):** viable and simplest ops, but D1
  (SQLite) is less convenient than Postgres for evolving schema, JSONB, and
  reporting. Kept as a fallback if Supabase coupling proves painful.
