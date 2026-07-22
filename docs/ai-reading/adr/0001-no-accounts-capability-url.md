# ADR-0001: No user accounts — access via signed capability URLs

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Product owner, engineering
- **Context feature:** AI-assisted tử vi reading ("Luận giải")

## Context

The paid reading flow must work for anonymous visitors. The product owner
explicitly does not want users to create accounts (no email/password, no
OAuth, no session login). Yet a reading is a paid, persistent artifact the
buyer must be able to return to, and follow-up Q&A must be attributed to
the same buyer to enforce the "3 free then paid" rule and the credit
balance.

## Decision

Each reading is identified by an **opaque capability token** embedded in a
**dedicated URL** (`https://astrologik.app/r/<token>`). Holding the URL is
sufficient to view and interact with that reading — it is a bearer
credential.

- The token is high-entropy (≥128 bits) and **HMAC-signed** by the Worker
  so forged or tampered tokens are rejected in-memory, before any database
  or LLM access.
- The captured **email is not a login** — it is only (a) proof the visitor
  controls a contact and (b) the recovery channel to re-send the link.
- The dedicated page communicates only with the Cloudflare Worker, which
  validates the token on every request. The browser never receives the
  signing key or a direct database credential.

## Consequences

**Positive**
- Zero-friction entry; matches the product requirement.
- No password/credential storage, no account-takeover surface, no
  auth provider dependency.
- Token can be validated statelessly (HMAC) as a cheap first line of DDoS
  defense (see ADR-0007).

**Negative / risks**
- Anyone with the URL can open the reading — the link must be treated like
  a password. Mitigation: only ever send it to the verified contact and
  show a visible "do not share this link" notice.
- No cross-device "my readings" list unless the user keeps their links or
  re-requests them by email.
- Email-based recovery means email deliverability is on the critical path
  (see ADR-0004).

## Alternatives considered

- **Full accounts (email + password / OAuth):** rejected — explicitly
  against product intent and adds friction + credential-management burden.
- **Magic-link login creating a session:** rejected for MVP — still an
  account model; the capability URL already gives the needed continuity
  without a session concept.
- **Unsigned random token only:** rejected — a signed token lets us reject
  garbage cheaply and detect tampering without a DB round-trip.
