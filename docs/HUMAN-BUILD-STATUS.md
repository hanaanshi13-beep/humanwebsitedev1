# HUMAN — build status

**Date:** 12 November 2026 · **Branch:** `claude/sharp-knuth-tnlel1` · **State:** working staging preview (Gates 1–3 built). Gate 4 (production) not started and not authorised.

## Starting point
The repository was empty (no commits). There was no existing site, app prototype or backend. Built from scratch with Astro 5 + TypeScript, plain CSS, and ~3 KB of hand-written motion JS. GSAP was not needed.

## Built
- `/` — hero, eight scenes in locked order, Her/Him portals, honest app placeholder, "planned vs available now", final invitation.
- `/women`, `/men` — garnet and ocean-teal worlds from one shared skeleton (parity enforced by a test), different hero, theme and journey layouts.
- `/waitlist` — five chapters, three data steps, validation, Back/Edit, browser history, preview mode.
- `/about`, `/faq` (12 questions), `/privacy`, `/terms`, `/medical-disclaimer` (all marked Draft), branded 404.

## Three signature decisions
| Signature | Decision | Notes |
|---|---|---|
| Reveal Lens (Scene 03) | IMPLEMENTED | One CSS mask aperture scrubbed by scroll on a sticky stage (desktop only, one extra viewport). Static half-open still on mobile, reduced motion and no-JS. |
| From Numbers to Clarity (Scene 05) | SIMPLIFIED | Illustrative report rows quieten with scroll; one question, then three. Explanations are always visible rather than behind a disclosure. No morph into Scene 06. |
| Connected Thread (Scene 06) | IMPLEMENTED | Semantic list of six stages; amber thread fills with scroll; each stage is a button and selection overrides scroll. No pin needed. |

Only one pin is used on the whole site (Scene 03). Full per-cue status: `docs/HUMAN-MOTION-REGISTRY.csv`.

## Verified (real runs)
- `npm run build` — `astro check` 0 errors, 0 warnings; 10 pages.
- `npm run test:e2e` — **43 passed, 0 failed** (output: `docs/e2e-latest.txt`; mapping to the kit's test IDs: `docs/TEST-REPORT.md`).
- 61 screenshots in `docs/reviews/` at 320/360/390/768/1024/1280/1440/1920.
- Page weight (built): homepage HTML 49 KB, CSS 26 KB, hero image 25–58 KB, fonts ~80 KB latin. Whole `dist/` is 660 KB.

## Defects found in review and fixed
1. Desktop headline clipped ("YOU" cut off) → sized to the dark zone; tested.
2. Mobile hero pushed the "In development" status below the first screen → recomposed; tested at 390×844.
3. Tablet (768–1023) hero text sat on the faces → stacked composition below 1024px.
4. Her/Him panels never revealed on mobile (a fully clipped element is invisible to the observer) → observe the parent.
5. Enter key did not continue in the waitlist → fixed; tested.
6. 200% text size overflowed on mobile → fixed; tested.
7. Reveal Lens ring misaligned with the aperture; hard edge on blurred art; Back button showing on Welcome → fixed.

## Not done / blocked (owner: founders)
| Item | Status | Needed |
|---|---|---|
| App prototype integration | BLOCKED | The actual folder — see `docs/APP_INTEGRATION_PENDING.md` |
| People photography for scenes, portals, Her/Him, waitlist | PENDING | Approved stills or a generation budget. Scenes are typographic/abstract until then. |
| Original hero PNG | PENDING | Only a 1672px compressed copy arrived; soft at 1920 and on retina |
| General Sans | SUBSTITUTED | Font host unreachable here; Hanken Grotesk (OFL) used |
| Real waitlist backend, legal wording | BLOCKED | Approved endpoint + reviewed privacy/consent |
| Founder story, public contact email, domain | PENDING | Verified copy; `CONTACT_EMAIL` in `src/data/site.ts` is null |
| Flow footage | NOT STARTED | Optional; site does not need it |
| Safari/Firefox, real-device keyboard, screen reader, Lighthouse | NOT RUN | Chromium only was available |
| Motion screen recordings | NOT RUN | Motion verified by scripted scroll checks and stills, not video |

## Resume
`npm install && npm run dev`, then continue with whichever blocked item is unblocked first.
