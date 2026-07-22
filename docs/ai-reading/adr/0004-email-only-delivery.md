# ADR-0004: Email-only link delivery for MVP, behind a pluggable notifier

- **Status:** Accepted (supersedes the earlier "email + Zalo/SMS" direction)
- **Date:** 2026-07-22

## Context

The dedicated URL must be delivered to the visitor. Options were email,
Zalo (via an Official Account + ZNS), and SMS (brandname). Zalo ZNS and SMS
brandname each require business verification and template approval with
multi-week lead times and per-message fees. An email provider is already
connected to the workspace. The product owner chose to **drop Zalo/SMS for
now**.

## Decision

- **Email is the only delivery channel for the MVP**, sent via the already
  connected email provider from a verified `astrologik.app` sending domain.
- Email is also the **recovery channel**: a visitor can request their link
  be re-sent to the same address.
- Delivery is implemented behind a **`Notifier` interface** with a single
  `email` implementation now. SMS/Zalo remain possible later by adding an
  implementation, with no change to the calling code.
- The data model stores a generic `contact_email` (plus a channel field
  kept nullable-generic) so adding a channel later needs no destructive
  migration.

## Consequences

**Positive**
- Removes the only multi-week procurement blocker; the MVP can go fully
  live once payments are connected.
- Cheapest channel; no per-message fee.
- Abstraction keeps the door open for Zalo/SMS without rework.

**Negative / risks**
- Email deliverability (spam folders, transactional reputation) is on the
  critical path — requires SPF/DKIM/DMARC on `astrologik.app` and a
  transactional (not marketing) sending stream.
- Some Vietnamese users prefer Zalo; a share of visitors may not check
  email promptly. Accepted for MVP; revisit with data.

## Alternatives considered

- **Email + Zalo/SMS at launch:** rejected for MVP due to OA/brandname
  approval lead time and added integration cost.
- **On-screen link only (no send):** rejected — the email step doubles as
  lightweight proof-of-contact and enables recovery + re-engagement.
