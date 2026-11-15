# HUMAN Portal — implementation notes, backend contract and launch prerequisites

Status on 2026-11-15: **development preview.** The portal is fully built at `/waitlist`, but no backend or approved privacy notice exists, so it sends nothing and registers nobody. Rollback tag for the previous waitlist: `v13-before-portal`.

## Where things live

| What | File |
|---|---|
| Chapter copy, options, asset mapping, motion timing | `src/data/portal.ts` |
| Markup and styles (design tokens are the `--hp-*` variables on `.hp`) | `src/pages/waitlist.astro` |
| State, validation, transitions, submission | `src/scripts/portal.ts` |
| Supplied originals (never edited) | `src/assets/portal/originals/` |
| Tests `HP-01` … `HP-17` | `tests/e2e.mjs` |

Built with the site's existing Astro + TypeScript stack. Transitions use the browser's Web Animations API and CSS; there is no React, GSAP or WebGL. Fonts (Manrope, Bodoni Moda Italic) are self-hosted from npm packages and load on this page only.

## Asset use

| ID | Used in | Note |
|---|---|---|
| A01 | Chapter 01; transition layer 1; Preventive health | |
| A02 | Transition layer 2; Chapter 03 neutral default | |
| A03 | Transition layer 3; Heart health | Stands in for A15 |
| A04 | Overall wellbeing | Shown whole, framed, so nobody is cropped |
| A05 → A08 | Fitness & performance | Runners first, anatomy after about two seconds |
| A06 | Chapter 02; Women's health | Same file as the homepage "U" photograph |
| A07 | Sleep & recovery | Cropped tighter to keep a car badge out of frame |
| A09 | Hormonal health | 320px source: shown at no more than 1.25× over a blurred copy of itself |
| A10 | Chapter 02; Men's health | |
| A11 | Longevity | Conceptual only; no genetic testing is implied |
| A12 | Energy & metabolism | |
| A13 | Chapter 05 | Kept whole; copy sits beside it (desktop) or below it (phones) |
| A14 | Chapter 04 | |
| A15 | — | **Not supplied.** When it arrives: add it to `ASSETS`, set Heart health's `asset` to `A15` in `src/data/portal.ts` |

Web derivatives are WebP at the supplied width or smaller (two sizes each). Only A01 is preloaded; the next chapter's images are fetched and decoded while the visitor is on the current one. If the transition images are not decoded in time, the passage falls back to a plain dissolve.

## Backend contract (to be built)

`POST {PUBLIC_WAITLIST_ENDPOINT}` with header `Idempotency-Key: <uuid>` and JSON body:

```json
{
  "firstName": "string, 1–80",
  "ageGroup": "18–24 | 25–34 | 35–44 | 45–54 | 55+ | Prefer not to say | null",
  "gender": "Female | Male | Other / self-describe | Prefer not to say | null",
  "genderSelfDescribed": "string ≤ 60 | null",
  "interests": ["preventive", "fitness", "hormonal", "heart", "energy", "womens", "mens", "longevity", "sleep", "wellbeing"],
  "email": "string",
  "mobile": "E.164 string | null",
  "city": "string ≤ 80 | null",
  "waitlistConsent": true,
  "consentAt": "ISO-8601 timestamp (client clock; the server should record its own as well)",
  "privacyNoticeVersion": "string"
}
```

Responses the page understands (HTTP 200 with JSON):

- `{"status":"accepted"}` → the closing chapter is shown. This is the only way to reach it.
- `{"status":"duplicate","userFacingMessage":"…"}` → a neutral notice on Chapter 04. The page never says whether an address is already registered.
- anything else, a non-200, or no response within 15 seconds → a recoverable error; every value stays in the form.

The server must do its own validation, de-duplication (by normalised email and by idempotency key), rate limiting and access control. The storage record should add a registration ID and server-side created/consent timestamps. To switch the portal on, set `PUBLIC_WAITLIST_ENDPOINT` at build time; never put service keys in front-end code.

## Launch prerequisites (none of these are done)

1. **Approved Privacy Notice.** `/privacy` is a draft marked as such. The consent line links to it; `PRIVACY_NOTICE_VERSION` is `draft-unapproved` and must be replaced with the approved version label.
2. **Backend** implementing the contract above, tested against the real page (the current tests use a stub).
3. **Legal review for India (DPDP Act 2023)** of what is collected. Health interests, age group and gender are optional but can be sensitive in combination with contact details: decide retention period, who can access them, and how a deletion or correction request is handled, before collecting anything.
4. **Consent scope.** The checkbox covers waitlist and launch updates only. An optional mobile number does not authorise calls, SMS or WhatsApp marketing; a separate, explicit consent is needed for that.
5. **Image rights.** Written confirmation that every supplied image may be used commercially, including the people shown. A07 and A05 show third-party brand marks on footwear; A01–A03 show a "HUMAN Bloodwork" tube that does not exist as a product yet.
6. **A15** supplied, or Heart health removed from the list.
7. **Checks not yet done:** Safari, Firefox, real phones (including with the keyboard open), screen readers, and performance on ordinary mobile hardware.

## Decisions made without asking (reversible)

- Duplicate registrations get a neutral message rather than the closing chapter.
- Portal buttons are solid espresso as this brief specifies; the rest of the site uses the clear-glass buttons.
- Both portraits are shown together in Chapter 02 instead of rotating, so nothing moves while someone is typing and no photograph is tied to a gender choice.
- In preview, the closing chapter can be opened from a link labelled "preview only" and carries a "No registration was made" tag.
