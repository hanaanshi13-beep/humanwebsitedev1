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

## V6 / V6.1 premium refinement (2026-11-13)

Directives: `HUMAN — V6 Premium Website Refinement` and `V6.1 Creative Director's Final Quality Directive`. Rollback point: git tag `v5-photos-baseline`.

**Design system**
- `src/styles/global.css` now holds named tokens for the type scale, reading measure, column gap, section rhythm, label / heading / action spacing and a radius hierarchy (image 4px, control 14px, panel 20px, pill). Scenes use the tokens instead of one-off values.
- Buttons: the layered metallic glass is gone. Primary is a flat muted-amber fill with ink text (8.4:1); secondary is a hairline outline in the surrounding text colour. One primary style on every page, including For Her / For Him and the waitlist. Pointer-tracking light removed.
- Header: lighter shell (thinner border, smaller shadow, less blur); nav links are plain text with a 1px amber underline on the current page; "Home" replaced by "How it works" (the wordmark is the home link; Home remains in the footer). Mobile menu is a solid sheet with ruled rows.
- Status pill, Scene 03 controls and labels flattened. Motion: shorter distances and durations; pointer steering, parallax offsets, Scene 04 exposure veil and Scene 08 scroll-driven ring removed.

**Communication**
- New `Brief.astro` band directly under the hero: "A preventive-health membership, being built in India", the six stage names, the development status and a link to how it works. Hero note now states what HUMAN is.

**Chapters**
- Scene 01: captions moved under the photographs (no glass chips over images).
- Scene 02: photograph left, heading and the three measures right, in one composition; the grey dusk gradient into Scene 03 was removed for a clean cut.
- Scene 05 (mandatory fix): the three questions and their answers are always at full contrast. Scroll only draws an amber accent line. Covered by new test `S5-READ` (desktop, mobile, no-JS, reduced motion).
- Scene 06: the tab rail and its script are gone. All six stages show at once as a static 3 × 2 plate on one hairline (2 columns on tablet, one vertical thread on phones). No controls, no scroll state. Test `SIG-3` rewritten.
- Scene 07: mosaic kept, parallax removed, mobile arrangement recomposed.
- Scene 08: three lines, a short amber rule, the name. Ring, artwork and coloured glows removed.
- Portals: square-edged editorial plates on plain carbon, outline "Explore" control, both left-aligned.
- App section: the empty dashed frame is replaced by a schematic of the six planned stages on one circle with "Prototype in development", plus a three-row status list. No screens, values or records are shown or implied. The extra waitlist button here was removed.
- Final invitation: statement and heading on the left, status, offer, one button and the waitlist caveat on the right. Glass tray and horizon glow removed.
- Waitlist page: background artwork toned down.

**Unchanged**: every photograph and the hero image (no file in `src/assets` or `public` differs from the rollback tag), the hero headline, the eight-chapter order, all body copy in Scenes 01–08, routes, waitlist behaviour (still preview mode, no network request), disclaimers.

**Copy added or edited (needs founder sign-off)**: the Brief band; the hero note; app status rows and caption; nav label "How it works".

**Measured**
- Build: 0 errors. e2e: 44/44 in Chromium (two tests rewritten, one added).
- No horizontal overflow at 320, 375, 390, 430, 768, 1024, 1440; none at 200% text size on /, /women, /men, /about, /faq, /waitlist.
- Contrast (computed from tokens): lowest text pair is the amber-deep accent on ivory at 4.6:1; body and muted text are 5.9:1 or higher.
- Homepage: HTML 57 KB, CSS 35 KB, no homepage scene script beyond the shared motion module and the Scene 03 slider.

**Not measured**: Lighthouse / Core Web Vitals, Safari, Firefox, real devices, screen readers.

**Evidence**: `docs/reviews/v6/` — before / after pairs for all twelve homepage sections at 1440 and 390.

## Scene 03 rebuild: light-to-dark anatomical passage (2026-11-13)

Directive: `HUMAN — Scene 03 Complete Website Implementation Master Prompt`. Rollback point: git tag `v6-baseline`. Reference: founders' `HUMAN_Scene03_Light_to_Dark_Prototype.html` (timing and atmosphere only; not copied in).

**What replaced what**: the abstract Reveal Lens (code-drawn artwork, aperture, range slider) is gone. Scene 03 is now one pinned stage built on the two founder-supplied anatomical illustrations.

**Assets**: `src/assets/scene03/HUMAN_S03_LIGHT.webp` (1199 × 1312) and `HUMAN_S03_DARK.webp` (1122 × 1402), stored exactly as received (the uploads arrived as WebP, not PNG). Astro generates 480 / 800 / full-width derivatives at quality 86; both load lazily, so the homepage's first paint does not wait for them.

**How the transition works**: one value, `--p` (0–1), is written while the stage is pinned (desktop travel 200vh, phone 160svh). The room darkens and the luminous still fades over 0.10–0.34; the stage is empty and dark from 0.37 to 0.42; the dark still fades in over 0.42–0.62; from 0.64 the scene is "immersive" and the controls appear. The two stills are never visible together (test `S3-GHOST` samples 120 scroll positions on desktop and phone). Nothing inside either image moves, warps or is recoloured.

**Exploration**: three labelled buttons (the accessible controls) — Heart and circulation, Lungs and breathing, Beyond the visible — plus two markers on the artwork for heart and lungs as pointer conveniences. One panel at a time; close button, Escape (focus returns), toggling, and scrolling back out all put it away. The third topic has no marker; selecting it dims the figure. Controls are inert until the dark state.

**Organ highlighting**: none. There are no masks; selection is shown by the marker and the panel only. Marker positions were read off the dark illustration by eye.

**Fallbacks**: reduced motion steps between light and dark (no scrubbing); without JavaScript the scene is a still with the luminous figure, the copy and all three topics written out.

**Copy added (founder draft; needs clinical and editorial review before launch)**: the three panels, "Explore what lies beneath", the caption "An illustration, not a scan. It does not show anyone's results.", and the closing lines after the stage. Existing Scene 03 heading and paragraphs are unchanged.

**Scope**: only `Scene03.astro`, the two image files and `tests/e2e.mjs` changed. Scene 02 and Scene 04 are untouched.

**Measured**: build 0 errors; e2e 47/47 in Chromium (three Scene 03 tests rewritten, three added). No overflow and panel inside the viewport at 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 430×932, 390×844, 375×812, 360×800, 320×568. No console errors.

**Known limits**: text contrast dips to roughly 4:1 for a short stretch of scroll while the room passes mid-grey; on phones the open panel covers the lower half of the figure; at 1024×768 it covers the lower lungs. Not measured: Lighthouse, Safari, Firefox, real devices, screen readers.

**Evidence**: `docs/reviews/v7-scene03/`.

## Scene 03 rebuild 2: phone entrance and eight-system explorer (2026-11-14)

Directive: `HUMAN — Scene 03 Complete Cinematic Website Implementation Directive`. Rollback point: git tag `v7-scene03-baseline`. This replaces the two-image light-to-dark version from 2026-11-13 (its two images were removed; they remain in git history).

**Assets**: eleven founder-supplied illustrations in `src/assets/scene03/`, named `human-s3-01-phone.webp` … `human-s3-11-metabolic.webp`, matched to the brief by what each shows. They arrived through chat as WebP at about 1,090 px wide (phone 1122 × 1402), not as the original PNGs, and are stored as received. Astro serves a 640 px and a full-width derivative of each; the four guided stills load as the scene nears, the other seven on demand and then quietly in the background once the explorer opens.

**Guided sequence** (one pinned stage; 300vh of scroll on desktop, 260svh on phones; fully reversible)
- 0.00–0.12 the phone photograph settles. A real "Explore" button and two decorative dots sit in the phone's own screen coordinates.
- 0.12–0.42 the photograph scales about the chest of the figure on its screen until bezel and hand leave the frame, then the luminous overview takes over under a brief blush veil.
- 0.42–0.57 the overview rests. Five markers (thyroid, heart, lungs, liver, digestion) each open that system.
- 0.57–0.78 the overview leans toward the heart and hands to the luminous heart close-up.
- 0.78–0.90 the dark heart fades in over its luminous twin (same framing) while the room deepens.
- 0.90–1.00 the explorer is live, starting on the heart.

**Explorer**: eight systems in the brief's order (Heart, Lungs, Metabolic, Digestion, Thyroid, Nervous system, Circulation, Reproductive health). A glass list of icon buttons (vertical on wide screens, a labelled scrolling row on phones), a strip with previous / eight markers / next / Overview, and the explanation text. Only the artwork changes; the interface does not move (tested). Latest choice wins on rapid clicks; a failed image load keeps the previous view. The nervous-system rear view is reached through a short dip to dark, not a blend. Scroll never changes the chosen system, and the choice is remembered if the visitor scrolls back and returns.

**Not built, by decision**: no targeting rings on organs, no heart pulse, no per-organ masks, no 3D, no muscular system, no values or scores.

**Fallbacks**: reduced motion has no pin or zoom and opens directly on the overview with the explorer live. Without JavaScript the scene is the overview still with all eight systems written out.

**Scene boundaries**: Scene 02 and Scene 04 files are untouched. Scene 03 ends on the existing closing lines over deep rose, then a gradient back to the page's paper tone.

**Copy**: Scene 03 heading, paragraphs, disclaimer and closing lines unchanged. System copy is the founders' approved text from the directive, word for word; it still needs clinical review before launch.

**Measured**: build 0 errors; e2e 49/49 in Chromium (Scene 03 tests rewritten: sequence order and reversal, overlap limits, all eight systems plus strip / overview / markers / rapid switching / remembered choice, entry controls and keyboard, no-JS and reduced motion, honesty checks, resize and landscape). No overflow or console errors at 1920×1080, 1440×900, 1280×720, 1024×768, 768×1024, 430×932, 390×844, 360×800, 360×640, 320×568.

**Known limits**
- The two handovers (phone → overview, overview → heart close-up) join renders that do not match exactly; for about 5% of the scroll each, two soft bodies overlap under the veil.
- The zoomed phone image is upscaled about 1.2× at the moment of entry on large desktops and looks soft there.
- Text contrast is low for a short stretch while the room passes mid-rose.
- Icons are simple custom outlines drawn for this build.
- Not measured: Lighthouse, Safari, Firefox, real devices, screen readers, frame rate on low-end phones.

**Evidence**: `docs/reviews/v8-scene03/` (21 states at 1440 and 390, plus overview sheets).

## Scene 05 rebuild: the report, translated (2026-11-14)

Directive: `HUMAN — Scene 05 After the Report: complete cinematic … implementation directive`. Rollback point: git tag `v8-scene05-baseline`. Only `src/components/home/Scene05.astro` and `tests/e2e.mjs` changed.

**What replaced what**: the grey-bar placeholder sheet and its floating black pill are gone. Scene 05 is now a typeset, value-free document built in HTML/CSS/SVG (no image, canvas or video), on a small stack of paper, with a reading lens, an interpretation note and three question controls.

**The document**: HUMAN wordmark, "Illustrative document", "Health assessment", four example markers (lipid profile, blood glucose, thyroid function, iron status) with a result column of dashes only, Clinical context, Follow-up. It contains no digits; a test enforces that. The disclaimer sits under the page and never moves.

**Intro (scroll, not pinned, no added page height)**: as the stage rises into view the stack arrives (lift, slight tilt, scale), the two supporting sheets part, one pass of warm light crosses the page, the view leans about 5% toward the markers, the lens settles, and a strip the size of the lens lifts off the page, crosses to the note's position as paper, then darkens into the note. A thin amber thread then draws from the page to the note. It reverses if the visitor scrolls back, until they choose a question.

**Three states (one source of truth, `data-active`)**
- What matters? → lens on the example markers; close framing; note "Understand the context."
- What should I ask? → lens on Clinical context; close framing; note "Start a conversation."
- What happens next? → lens on Follow-up; the view pulls back to the whole page and the sheets draw together; note "Know the next step." plus the line Information → Context → Conversation → Follow-through.
Regions not being read drop to 60% opacity, never lower. Each change re-runs the lift from the new region (about 0.66 s). Latest choice wins on rapid clicks; one reusable fragment element, cancelled and reused. After the first choice, scroll no longer drives anything.

**Small screens (< 1100 px)**: page, a compact three-button chooser directly under it (same state as the questions), the note in flow, then the three full questions. One supporting sheet, no zoom, no thread.

**Simplified against the directive**
- Camera zoom is 5%, not 12–25%: larger values pushed the page into the note and the questions.
- No magnifying duplicate inside the lens and no optical blur; the lens is a tonal highlight.
- The fragment changes size while it travels (animated left/top/width/height on one absolutely placed element) rather than using transform-only FLIP, so its edges stay crisp at both ends.
- Scene 05 still ends in a clean cut to the dark Scene 06, like every other chapter boundary on the site; no gradient was added.

**Fallbacks**: reduced motion shows the page, lens and note at once and switches states instantly. Without JavaScript the report, the first note and the three questions are plain readable text (the lens and state indicators are hidden).

**Copy**: heading, intro, three questions, closing line and link unchanged. New microcopy is the directive's own wording (document text and the three notes). "What does this mean for me?" is kept as the first line of the note.

**Measured**: build 0 errors; e2e 52/52 in Chromium (S5-READ extended; S5-INTRO, S5-STATES, S5-FALLBACK added; desktop, 768 and 390). No overflow or console errors at 1920×1080, 1440×900, 1280×720, 768×1024, 390×844, 360×800.

**Not measured**: Lighthouse, Safari, Firefox, real devices, screen readers, frame rate on low-end phones.

**Evidence**: `docs/reviews/v9-scene05/`.

## Scene 05 rebuild 2: the report film (2026-11-14, later the same day)

Directive: `HUMAN — Scene 05 … Final locked cinematic art direction`. The code-built report from earlier today was rejected by the founders and is replaced; it is kept at git tag `v9-scene05-codebuilt`. Only `Scene05.astro`, `src/assets/scene05/` and `tests/e2e.mjs` changed.

**Assets used** (`src/assets/scene05/`; untouched originals of the slices in `originals/`)
- `human-s05-environment.webp` — the empty charcoal studio (1672 × 941, as received through chat).
- `human-s05-macro.webp` — the macro close-up (1672 × 941, as received).
- `human-s05-frag-*.png` — the eight slices from `HUMAN_S05_04_Report_Fragments.zip`, positioned from `fragment-layout.json`.
- `human-s05-report.png` — the whole report, rebuilt by stacking those eight slices (pixel-identical to the isolated report); used while the sheet is whole so no seams can show.
- Production copies of the report and slices have 3,701 stray semi-transparent pixels outside the paper removed (alpha only; paper and type untouched).
- Not used: the combined dark master (reference only), the glass-card dashboard image (rejected in the directive), and two amber anatomy images that arrived with the brief but are not in its inventory.

**The film**: one sticky full-viewport stage on a 400svh track (300svh on phones and portrait tablets). Every property is a function of scroll progress, so it is reversible and repeatable.
- I (0–17%) the report rises into the light with a floor shadow; "You got tested. Now what?"
- II (17–41%) the camera closes to 2.4–3.6× on the title. Wide screens then cut through a beat of shadow to the macro plate and back; phones stay on the enlarged report. "So much information. So little clarity."
- III (41–56%) the whole report is swapped for its eight slices in place; header and footer fall back; the six rows move to their own offsets, depths and angles, staggered. "But what actually matters?"
- IV (56–70%) each row cross-fades to a thin glass plane of the same size and position, with one light edge travelling across it and a code-rendered heading. "Numbers alone aren't the whole story."
- V (70–80%) the six gather in pairs into three planes: Context / What matters?, Questions / What should I ask?, Next steps / What happens next? "Understand more. Guess less."
- VI (80–100%) the planes close up, the camera withdraws, the light drops. "Getting tested is only the beginning." A link to Scene 06 appears; the stage then releases.

**Controls**: "Skip animation" (jumps to the closing shot and moves focus to the continue link) and the continue link. The three planes are not interactive and carry no clickable styling.

**Simplified against the directive**
- Macro handover is a match cut through shadow, not a blend: the macro plate's perspective does not register with the report.
- Glass is flat translucent fills, a champagne top edge and one travelling highlight; no backdrop blur or refraction.
- The pairing of rows into three planes is positional (1+2, 3+4, 5+6) and purely narrative; it is not a clinical grouping.
- Phones have no macro plate and far less sideways travel.

**Fallbacks**: with reduced motion or without JavaScript the film is replaced by a still: the report, the three ideas, the closing line, the disclosure and the link. A visually hidden heading and summary carry the six statements for assistive technology.

**Open content points for the founders** (text baked into the supplied images, so not changeable in code)
- The sheet is headed "LABORATORY REPORT". The earlier Scene 05 brief ruled out implying a real clinical document; the on-screen disclosure "Illustrative report. No patient results." is the only mitigation.
- Row sub-lines include "risk factors", "deficiencies" and "Next steps & recommendations", which read as findings and advice. The code-rendered glass headings use the category names only.

**Measured**: build 0 errors; e2e 53/53 in Chromium (Scene 05 tests rewritten: slice geometry, six acts and their exclusivity sampled every 1.25% of scroll, reversal, determinism, skip, resize, fallbacks, honesty). No overflow or console errors at 1920×1080, 1440×900, 1280×720, 768×1024, 390×844, 360×800.

**Not measured**: frame rate, Lighthouse, Safari, Firefox, real devices, screen readers, touch scrolling on hardware, image-load failure beyond the macro plate.

**Evidence**: `docs/reviews/v10-scene05/`.

---

## INSIDE HUMAN — homepage hero film (2026-11-14)

Replaces the previous dark photographic hero. Rollback tag: `v10-before-inside-human`. Nothing else on the site was changed.

**Source assets** (supplied; no images generated, no video): `src/assets/inside-human/` — H run club, U female portrait, M eye macro, A couple (1122×1402 each), N mature man (1611×2000).

**How it is built**: one inline SVG wordmark, five letterforms as clip paths, one photograph per letter. The camera is the SVG `viewBox`, recomputed from scroll progress, so the eye inside the M is the same single image that fills the screen — there is no second copy and no cross-fade. A circle in the M's clip path opens once the camera is inside the letter. The darkness is a radial gradient that starts at the pupil's own size.

**The film** (sticky stage on a 380svh track, 300svh on phones; every value is a function of scroll, so it reverses exactly)
- 0–10% statement: eyebrow, wordmark, headline, supporting copy, both CTAs, disclosure.
- 10–40% each photograph makes its own slow move inside its letter; the wordmark holds.
- 22–34% copy fades and is made inert.
- 32–64% camera closes on the M and centres on the pupil; the letter opens.
- 64–76% full-screen eye.
- 76–97% the pupil's dark spreads to the whole frame; the stage releases onto the next (dark) section.

**Preserved**: exact headline, eyebrow, supporting copy, "Join the waitlist" / "Explore the story", disclosure, fonts, navigation, waitlist, and every other scene.

**Controls and fallbacks**: "Skip intro" jumps past the film and moves focus to the next section. Reduced motion or no JavaScript gives one static screen with the wordmark and the full copy. If images fail, the letters are drawn as solid shapes and the copy stays readable.

**Fixed during review**: on phones the entry zoom cropped to the iris only (now framed by eye width); the darkness had a hard disc edge (now soft, with the surrounding frame dimming too); "Skip intro" scrolled but did not move focus (found by the new test).

**Limitations**
- The reference files named in the directive (`INSIDE_HUMAN_Mask_Study.html` / `.png`) were not received; letter geometry follows the paths in the written brief.
- At full screen the eye image is enlarged roughly 2× on a 1440-wide display and more on larger ones; it holds because the plate is a soft macro, but a higher-resolution original would be sharper.
- On phones the wordmark is limited by screen width (about 90–100px tall), so it is less monumental than on desktop.
- The N photograph arrived at a different size from the other four; it is cropped to match.

**Measured**: build 0 errors; e2e 58/58 in Chromium (five new hero tests: letter-to-photo mapping and single eye image, act sequence with exact reversal, handover and skip focus, reduced-motion and no-JS static state, eight viewport sizes for overflow, fold and header legibility). No console errors or horizontal overflow at 1920×1080, 1440×900, 1366×768, 768×1024, 390×844, 360×640.

**Not measured**: frame rate, Lighthouse, Safari, Firefox, real devices, screen readers, touch scrolling on hardware.

**Evidence**: `docs/reviews/v11-inside-human/`.
