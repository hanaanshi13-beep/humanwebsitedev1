# HUMAN — legal, privacy and medical review register

**Status: internal. Not part of the website.**

Since 2026-11-20 the Privacy Policy, Terms of Use and Medical Disclaimer are **interim prototype notices** for the
investor-facing prototype. Each says so on the page ("Interim prototype notice") and in its first paragraph. They are
written to be accurate about what the prototype does today. They are **not** professionally approved legal or medical
documents, and the site is not legally or medically compliant because they exist.

Source: `src/data/legal/privacy.ts`, `terms.ts`, `disclaimer.ts`. The earlier, longer founder-supplied drafts (with
their placeholders) are in git history at commit 7cba72d and are the starting point for the production documents.

## A. What the notices state, and how each statement was verified

| Statement | Evidence (2026-11-20) |
|---|---|
| The waitlist is a demonstration; nothing entered is sent or saved | `src/scripts/portal.ts` makes no request without an endpoint; `src/data/site.ts` requires two variables to enable one; test `HP-09` (no non-GET request, no storage) |
| Fields asked for: first name, age group, gender incl. self-described, health interests, email, mobile, city, consent | `src/pages/waitlist.astro`; matches the notice line for line |
| No cookies, no analytics or advertising tools, no third-party content | tests `NO-TRACKERS`, `HP-10`; built pages contain no external URL |
| The host may process IP address, browser type and pages requested | True of any web host. **Re-check against the chosen host's own logging and analytics settings before going live** |
| Email sent to us is received and used to reply | hello@ and privacy@humanforlife.in, founder-confirmed |
| A private development environment is tested separately with test information | A Supabase project, reached only by the `/api/waitlist` function, which is off by default and not used by the investor build (`docs/HUMAN-WAITLIST-BACKEND.md`) |
| 112 is India's national emergency number | Government of India ERSS (112.gov.in) and PIB describe 112 as the pan-India single emergency number. Checked through search results for those official sites; the pages themselves could not be opened from the build environment. **Re-verify before any public launch** |

## B. Deliberately not stated (nothing confirmed)

Legal entity or registered name, postal address, phone number, grievance officer, governing law or jurisdiction,
security measures, retention periods, hosting or storage location, any compliance or certification claim.

## C. If any of these change, change the notice first

- A live build is made (`PUBLIC_WAITLIST_MODE=live` with the backend enabled): the Privacy Policy's "demonstration"
  section is false for that build. Live builds are therefore private, founder-only and labelled "Private test".
- Analytics, cookies, embedded third-party content or a contact form are added.
- The host adds its own analytics or bot protection that sets cookies.

## D. Before HUMAN accepts real registrations or offers any service

- [ ] Legal entity, address and responsible contact decided and stated.
- [ ] Full Privacy Policy and Terms of Use prepared by Indian legal counsel (start from commit 7cba72d).
- [ ] What is collected, why, retention, deletion, and the process for access and correction requests defined.
- [ ] Consent wording reviewed: today one checkbox covers both joining and receiving updates.
- [ ] Adults-only policy decided; whether health interests and gender need special handling.
- [ ] Medical Disclaimer and all health wording reviewed by a qualified clinician and counsel.
- [ ] Waitlist backend reviewed (validation, duplicates, rate limiting, access control, no personal data in logs).

## E. Copy points for the founders (reported, not changed)

1. **Waitlist language elsewhere on the site.** The FAQ, the For Her and For Him pages and several buttons say that
   joining the waitlist "registers your interest". On the investor prototype the waitlist is a demonstration and says
   so on every chapter, and the Terms explain it. The approved wording was left as it describes the intended product.
2. **Delhi NCR.** The homepage, For Her, For Him and the footer say the first pilot is planned for Delhi NCR. The FAQ
   says initial service locations will be announced once arrangements are confirmed. Both can be true, but an
   investor may ask which is the current position.
3. **HYROX** name and imagery on Explore Plans: see `docs/HUMAN-EXPLORE-PLANS.md`.
4. **"A biomarker is something we can measure in your body"** (FAQ): HUMAN does not operate a laboratory.
