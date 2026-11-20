# HUMAN — release gates

**Public deployment and real data collection are BLOCKED.** This build is a staging preview only.

| Gate | Status | Evidence / what is missing |
|---|---|---|
| 1 — Hero + Scene 01 | Built, self-reviewed. Awaiting founder review | `docs/reviews/gate1-*` |
| 2 — Full homepage | Built, self-reviewed. Awaiting founder review | `docs/reviews/gate2-*` |
| 3 — Core pages + preview waitlist | Built, self-reviewed. Awaiting founder review | `docs/reviews/gate3-*` |
| 4 — Production readiness | NOT STARTED | Everything below |

## Blocking items for Gate 4
- [ ] Legal entity, privacy notice, terms, medical disclaimer reviewed by qualified counsel (India-specific).
- [ ] Consent wording approved; consent version recorded server-side.
- [ ] Waitlist backend approved: server-side validation, rate limiting/bot protection, idempotency, duplicate handling that does not reveal registrations, no PII in logs, retention and deletion policy.
- [ ] Scene 04 and all health-marker wording reviewed by a qualified clinician.
- [ ] App prototype audited (`docs/APP_INTEGRATION_PENDING.md`) and permission given to show it.
- [ ] Hero image and any future photography: rights and provenance confirmed.
- [ ] Verified public contact address and domain; canonical URLs; remove `noindex` and the `robots.txt` disallow.
- [ ] Security headers on the host; analytics only with an approved privacy basis.
- [ ] Safari, Firefox, real iOS/Android, screen reader and Lighthouse runs.
- [ ] Explicit founder approval to deploy and to collect data.

## Waitlist modes
The investor-facing build is a **demonstration**: no request is made and nothing is stored. Sending needs both
`PUBLIC_WAITLIST_MODE=live` and `PUBLIC_WAITLIST_ENDPOINT` at build time (private development only). In a live build
the client POSTs JSON once, with an `Idempotency-Key` header, and shows the closing chapter only for
`{ "status": "accepted" }`. See `docs/HUMAN-HOSTING.md` and `docs/HUMAN-PORTAL.md`.
