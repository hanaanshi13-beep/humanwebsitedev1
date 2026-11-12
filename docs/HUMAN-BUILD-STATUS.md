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

## V4 improvement pass 1 (2026-11-12)

Directive: `HUMAN-FIRST-BUILD-IMPROVEMENT-MASTER-V4` plus the founder's "ultra-premium liquid glass button" brief.

**Implemented**
- Central optical-glass button system in `src/styles/global.css`: primary (smoked amber glass, ivory text), secondary (clear charcoal / clear neutral on ivory), utility icon buttons. Layers: tinted body, pointer-following light pool, upper refractive edge, inner border, lower caustic, specular band, one-pass hover reflection. Hover lifts 2px, press settles 1px. States: default, hover, focus-visible, pressed, disabled, loading (`aria-busy`). Garnet / teal light on the Her / Him pages. Fallbacks for no `backdrop-filter`, reduced transparency, reduced motion, forced colours.
- Arrows are now one SVG glyph (CSS mask) instead of text characters.
- Header is a floating glass shell that fades in on scroll; nav hover pills; current page marked. Mobile header now carries a "Join" button. Mobile menu is a bounded glass sheet over a dim scrim; tap outside or Escape closes; `aria-expanded` kept in sync.
- Status pill, FAQ toggles, waitlist panel, fields and Back button restyled to the same system.
- Scene 03 Reveal Lens: glass rim, filament artwork with inner parallax, pointer steering, and a labelled slider ("Explore beneath the surface") for keyboard, touch and reduced motion. Pin shortened from 190vh to 170vh.
- Scene 06 Connected Thread: on desktop the six stages are one glass rail with a single description pane (no layout jump); arrow keys, Home and End work. Mobile keeps the vertical list, tightened.
- Section padding reduced. Desktop homepage height at 1440px: about 14,240px before, 12,760px after.
- Fixed: finished reveals no longer clip button shadows.

**Not done / blocked**
- No new photography. This cloud session has no Chrome control, so Gemini and Flow could not be operated. Prompts for manual generation: `docs/HUMAN-IMAGE-BRIEF-V4.md`.
- Because of that, Scenes 01, 02, 04, 07 and the Her / Him portals are unchanged apart from the shared controls.
- Scene 05 report-to-clarity rework, Scene 08, final CTA tray: not started.
- App section: still the honest "coming soon" state; no prototype folder received.
- Not measured: Lighthouse / Core Web Vitals, Safari, Firefox, real devices, screen readers.

**Evidence**: before = `docs/reviews-v3-baseline/`; after = `docs/reviews/` and close-ups in `docs/reviews/v4-controls/`. e2e: 43/43 (Chromium).

## V5 pass (2026-11-12, later the same day)

Directive: `HUMAN-Claude-Consolidated-Improvement-and-Asset-Bible-V5`.

**Implemented**
- `src/components/Slot.astro`: a photo-ready frame. A file named in the Asset Bible and placed in `src/assets/human/` is picked up at build time and served as responsive WebP; with no file the frame shows abstract artwork. Verified with a temporary test image (then removed).
- Scene 01: copy plus a three-frame triptych (walk, meal, rest) with small glass captions and 20–24px of scroll depth. Copy edit: the four-line "rituals" list was removed because it repeated the paragraph beside it.
- Scene 02: one photo slot, three measures (Movement, Rest, Routine) with a single line that traces down as you scroll, then a dusk gradient into Scene 03.
- Scene 04: wide photo slot with a one-time pale-to-full exposure, marker categories set beside it.
- Scene 05: the value-free sheet settles, most rows recede, three rows turn amber and three questions resolve in sequence; one small glass lens asks "What does this mean for me?". Ends with a link to Scene 06. Final state is the default for reduced motion and no-JS.
- Scene 07: copy plus a three-frame mosaic; a line states that images show models, not members. Heading now breaks into three lines.
- Scene 08: centred resolution; an aperture ring closes, a thin amber line draws, then the wordmark. Garnet and teal glows rise at the bottom to hand over to the portals.
- Portals: two large rounded panels with photo slots, shade for readability (no blur over the image), glass Explore control, hover/focus image lift.
- /women and /men heroes use the portal photograph on the side opposite the copy once the file exists.
- Final CTA: centred end act with a horizon of light and one glass tray holding status, promise and the single action.

**Awaiting files**: all ten P1 photographs and the optional macro (see `docs/HUMAN-VISUAL-ASSET-BIBLE.md`); the original hero file; the app prototype folder; founder story; legal and backend approvals.

**Blocked**: Gemini / Flow from this session (no Chrome control). GitHub push (403).

**Not measured**: Lighthouse / Core Web Vitals, Safari, Firefox, real devices, screen readers.

**Evidence**: `docs/reviews/` (full set) and `docs/reviews/v5-scenes/` (each rebuilt scene at 1440 and 390). e2e 43/43 in Chromium.
