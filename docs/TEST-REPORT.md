# HUMAN — test report

**Run:** 12 November 2026, Chromium (Playwright), against the production build served by `astro preview`.
**Command:** `npm run test:e2e` → **43 passed, 0 failed, 43 total**. Raw output: `docs/e2e-latest.txt`.

Tests marked [TEST FIXTURE] inject a fake endpoint into the test browser only. No backend exists and no data left the machine.

## Automated checks (executed)
| ID | Check | Result |
|---|---|---|
| E2E-01 | Direct load /: exact headline, CTA visible, no missing assets, no console errors | PASS |
| GATE1-390 | Hero at 390x844: headline, CTA and status all inside first viewport; nothing overlaps the faces | PASS |
| GATE1-1440 | Hero at 1440x900: headline fully inside the dark left zone (not clipped, clear of faces) | PASS |
| E2E-03 | Hero waitlist CTA opens /waitlist on the Welcome chapter | PASS |
| E2E-04 | Story cue scrolls to Scene 01; skip link reaches Scene 06 (V3-QA-09 deep anchors) | PASS |
| GATE2-ORDER | Eight scenes in locked order; transition line appears exactly once | PASS |
| E2E-05/06 | Reveal Lens opens with scroll and reverses cleanly (V3-QA-10) | PASS |
| E2E-07 | Resize from desktop to mobile inside Scene 03: pin releases, static composition, no overflow | PASS |
| SIG-3 | Connected Thread: all six stages readable; selecting a stage activates it (interaction wins) | PASS |
| E2E-08 | Keyboard: every homepage link/button is reachable and shows a focus indicator | PASS |
| E2E-09 | Reduced motion: every route fully visible, no sticky pin, no hidden reveal states (V3-QA-04) | PASS |
| E2E-10/11 | Portals navigate to /women and /men (mouse and keyboard); garnet and teal worlds applied | PASS |
| PARITY | /women and /men have the same section count, headings count and CTA count | PASS |
| E2E-12 | Mobile menu: opens as modal, focus trapped, ESC closes, focus returns, page does not scroll | PASS |
| E2E-13 | App folder absent: honest placeholder, no screenshots, no prototype link (V3-QA-12, E2E-46) | PASS |
| E2E-43 | Final homepage CTA and header CTA both go to /waitlist | PASS |
| E2E-02 | Logo from an interior page returns home | PASS |
| E2E-16 | FAQ: 12 questions; a question opens with keyboard and shows its answer | PASS |
| E2E-17 | About: no founder names or bios; pending line shown | PASS |
| E2E-18 | Legal routes exist, are marked Draft, and are linked from the waitlist | PASS |
| E2E-47 | Unknown route returns the branded 404 with working recovery links | PASS |
| E2E-38/39 | Every core route loads directly with one h1, a <main>, no console errors; Back/Forward works | PASS |
| OVERFLOW | No horizontal overflow on any core route at 320, 360, 390, 768, 1024, 1280, 1440, 1920 | PASS |
| E2E-37 | JavaScript off: homepage story, headline, nav and CTAs all present and visible (V3-QA-01) | PASS |
| E2E-15/44 | Images blocked: hero headline, CTA and status still readable on a dark background (V3-QA-02) | PASS |
| CLAIMS | No invented counters, prices, testimonials, partners or live-service claims on any route | PASS |
| NO-TRACKERS | No third-party requests on any route (no analytics, pixels, remote fonts) (V3-QA-19) | PASS |
| E2E-19 | Welcome → Begin moves to You, labelled Step 1 of 3; five chapters, three data steps | PASS |
| E2E-20 | You: Continue with blank fields shows two errors, focuses the first, does not advance | PASS |
| E2E-21 | You: invalid email shows an inline error and focuses the email field | PASS |
| E2E-22 | You: valid fields (Enter key) move to Location, Step 2 of 3; single-word name accepted | PASS |
| E2E-23/24/25 | Location: blank required fields error; blank WhatsApp allowed; invalid WhatsApp rejected | PASS |
| E2E-26/27 | Back and Edit preserve every value; Edit returns to the summary; phone is masked there | PASS |
| E2E-28 | Consent: neither box pre-checked; submitting without required consent errors and stays | PASS |
| E2E-30 | Preview mode: valid submit shows "not accepting registrations", never Success, and sends NOTHING | PASS |
| PII | No form value reaches the URL, localStorage, sessionStorage, cookies or the console (V3-QA-19, E2E-45) | PASS |
| E2E-34 | Reload or forged URL (#success, ?success=true) never shows Success; draft is not retained (WL4-06) | PASS |
| E2E-31/33/29 | [TEST FIXTURE] Accepted response → Success; double-click sends once; optional consent off does not block | PASS |
| E2E-32 | [TEST FIXTURE] 500 and network failure → recoverable error, values and consent preserved, no Success (V3-QA-14) | PASS |
| V3-QA-15 | [TEST FIXTURE] Duplicate response shows neutral wording, no Success, no account enumeration | PASS |
| E2E-35 | Waitlist at 360x640 (keyboard-height proxy): fields, Back and Continue reachable by scrolling; bar not fixed | PASS |
| A11Y-FORM | Every input has a label, autocomplete purpose and error hook; touch targets ≥ 44px (V3-QA-17) | PASS |
| ZOOM | 200% text size at 390px: hero and waitlist grow vertically, no clipping or overflow | PASS |

## Kit test IDs not covered above
| ID | Status | Reason |
|---|---|---|
| E2E-14, E2E-41, V3-QA-11, V3-QA-13 | BLOCKED | App prototype folder not supplied |
| E2E-36, V3-QA-05 (slow network / Save-Data) | NOT RUN | No throttled run. Mitigation in place: no video, hero image ≤58 KB, whole site 660 KB |
| V3-QA-03 (unsupported video codec) | N/A | The site has no video |
| E2E-49 (Safari / Firefox) | BLOCKED | Only Chromium available in the build environment |
| E2E-48 (high DPR) | FAIL (known) | Hero source is 1672px wide; soft on 1920px and retina until the original PNG is supplied |
| E2E-50 | PASS | No paid service, API or generation credit was used |
| LCP / CLS / INP | NOT MEASURED | No Lighthouse run; no numbers are claimed |
| Screen reader pass, real-device soft keyboard | NOT RUN | Keyboard-only and a reduced-height viewport were tested instead |
| Motion screen recordings | NOT RUN | Signatures were verified by scripted scroll (forward, reverse, resize) and four still positions |

## CEO signoff checklist (kit `CEO-SIGNOFF-V3.md`) — self-assessment, pending founder review
| Item | Status | Evidence |
|---|---|---|
| Hero: exact headline, status, live CTA, desktop + mobile, faces clear of words | PASS | E2E-01, GATE1-390, GATE1-1440; `reviews/gate1-hero-*` |
| Hero: story, jump to how it works, or waitlist; no forced story | PASS | E2E-03, E2E-04 |
| Eight scenes in order; no repeated transition line; real text | PASS | GATE2-ORDER |
| Three signatures decided on evidence; not all cues implemented | PASS | `HUMAN-BUILD-STATUS.md`, `HUMAN-MOTION-REGISTRY.csv` |
| Understandable with JS off / reduced motion / media blocked | PASS | E2E-37, E2E-09, E2E-15/44 |
| Her and Him: distinct, equal quality, truthful | PASS (structure) | PARITY, E2E-10/11. Portrait photography still pending for both |
| App: audited before preview, or honest placeholder | PASS (placeholder) | E2E-13 |
| Waitlist: five chapters, three steps, validation, back/edit, no fake acceptance | PASS | E2E-19 to E2E-35, PII |
| About: founder story verified or omitted; FAQ transparent | PASS | E2E-17, E2E-16 |
| Legal pages labelled pending; no real registration | PASS | E2E-18, E2E-30 |
| No invented claims | PASS | CLAIMS |
| Screenshots at 320/360/390/768/1024/1440/1920; keyboard and reduced motion documented | PASS | `docs/reviews/`, OVERFLOW, E2E-08, E2E-09 |
| No unapproved costs, leaked keys, PII, unlicensed images, deployment | PASS, with one open item | Hero image rights to be confirmed by founders |
| Builds and works without Flow footage | PASS | No footage exists |
| Evidence pack | PASS | This folder |
