# HUMAN — CINEMATIC WEBSITE PRODUCTION MASTER PROMPT V2.0
**Authoritative end-to-end implementation specification for Claude Code / supported Claude Desktop Code environments**  
**Status:** Ready for implementation as of 12 November 2026  
**Scope:** Existing HUMAN repository; core prelaunch website; app prototype to be supplied later; optional generated media where actually accessible  
**Priority:** Build a beautiful real website first. Do not substitute another plan, mockup, empty scaffold, or video storyboard.

> **CLAUDE: THIS FILE IS AN EXECUTION INSTRUCTION.** You are the lead interactive art director, design systems architect, motion designer, frontend engineer, integration engineer, accessibility lead, QA engineer, and documentation owner. Inspect the actual project, implement its pages, test them in a browser, revise visible defects and leave a working codebase. Treat specific motion specifications as a design implementation contract, not as permission to ignore performance or users' motion preferences. Preserve the locked brand and factual constraints. Never state that you generated footage, accessed an app, connected a backend or completed a test unless your active tools actually did so.

---

# PART A — NON-NEGOTIABLE OPERATING CONTRACT

## A01. Founder intent and quality standard

We are creating **HUMAN**, a premium, India-focused, prelaunch preventive-health membership brand. The website must feel like a meticulously art-directed international editorial experience with subtle futuristic science-inspired visual design. It should be emotionally compelling, technologically fluent, credible, useful and **fully functional**. It should not look like a template, a hospital advertisement, a crypto landing page, an aggressive fitness supplement, an AI-generated sci-fi poster or a linear slideshow made of separate full-screen JPEGs.

Our central design metaphor is **REVEAL**: what is not obvious becomes visible, information becomes understandable and the visitor progresses from personal everyday experience to the future HUMAN membership concept. Motion is part of that narrative, not decoration. The experience is immersive without reducing user agency.

Do **not** waste the project on repeated prompts, connector setups or theoretical architecture exercises. Start coding after a concise inspection. Do not regenerate visuals just because a generator is available. The visual quality is judged through **real rendered desktop and mobile screenshots**, not adjective-rich descriptions.

## A02. Decision hierarchy

Resolve conflicting information using this precedence:
1. Founder instructions issued after this document, especially actual supplied code/app folder and content approvals.
2. **This V2 master prompt** and its route, motion, security and release contracts.
3. Approved current reference images and approved current copy listed below.
4. Current working code and confirmed product behavior discovered in the repository.
5. Older research/archive files as historical context only.
6. Rejected images, earlier experiments, old copy and stale workflow prompts: **not directives**.

Never silently import an outdated headline, promotional claim or altered form from an old build. Keep a `docs/HUMAN-DECISION-REGISTER.md` describing `LOCKED`, `WORKING`, `CONDITIONAL`, `PENDING REVIEW` and `REJECTED` decisions.

## A03. First actions in the actual environment

1. Locate the repository by inspecting the workspace. It may previously have been named `fundinghouseofkings-lab/HUMAN-Website` or the local Windows folder `claudeHUMAN`, but confirm paths and current Git state rather than assuming them.
2. Read `package.json`, lockfiles, source tree, current routes, assets, tests, build/deploy config, environment files **without printing secret values**, and existing UI. Detect whether any app prototype has already been mounted.
3. Read this prompt and the included reference assets. Verify whether the source assets have the appropriate rights for this use; do not redistribute unlicensed source material.
4. List actual capabilities: file editing, terminal, browser/screenshot, Claude in Chrome, Gemini, Google Flow, and any supported OpenAI/ChatGPT access. **Do not infer shared capabilities from another Claude session.**
5. Create a status file, route inventory, motion checklist and asset manifest before major modifications. Record what exists, what is missing and what is actually available.
6. Decide whether to preserve the current framework. Retain a credible existing implementation. Do not rebuild solely to use a preferred library.
7. Implement and browser-test the **hero + first scroll transition** before rendering the other routes. Then continue in the release order below without waiting for permission for ordinary code/design choices.

## A04. Autonomy and approvals

**Allowed without repeated approvals:** local design/code changes, reversible image optimization, building routes/components, generating SVG/CSS graphics, adding reasonable dependencies compatible with the project, local test servers, lint/build/test runs, local screenshots, creating fake demo-only in-memory form states where explicitly labelled, creating docs, fixing UX defects.

**Ask once for explicit permission before:** purchasing services, using separately billed APIs, consuming a substantial quantity of Google Flow/Ultra generation credits (agree a budget cap before a batch), importing external private accounts, altering credentials or app permissions, public deployment, DNS/domain changes, exposing production endpoints, sending real emails/messages, collecting/storing real visitor data, publishing real marketing claims, deleting unrelated project material or destructive repository operations. A verified safe no-cost local test need not become a recurring approval loop.

If generation access is unavailable or blocked, **continue building** using existing assets and CSS/SVG. If the app prototype folder has not yet been shared, build the website integration surface and leave a precise `APP_INTEGRATION_PENDING.md`; do not hallucinate app screens or mark the integration complete. If a backend is unavailable, make the waitlist a fully usable and validated **staging-only frontend** with no fake public success state.

## A05. Absolute factual and safety constraints

- HUMAN is **under development**. It is not an operating clinic, certified medical service or launched product.
- Planned conceptual experience: **TEST → UNDERSTAND → ACT → TRACK → RETEST → IMPROVE**.
- The first pilot is **planned** for Delhi NCR in early 2027; waitlist interest is intended for people across India. These are plans, not guarantees.
- `10,000+` is an internal **target** for interest, not current registration volume. No number counters unless real verified source data exists and public use is approved.
- No confirmed memberships for sale, prices, doctor roster, diagnostic panels, service levels, partner list, clinical validation, consultation promises, testimonials, outcomes or member stories may be invented.
- No fabricated patient health values, pseudo-clinical scores, healthy/unhealthy classifications, fake diagnosis or universal recommendations. If depicting a prototype or conceptual report, clearly mark **“Illustrative demo data — not a real person or medical assessment.”**
- Never imply a general blood test diagnoses every condition or detects PCOS by itself. Medical ideas require qualified context and appropriate clinician review.
- Avoid manipulative fear appeals and medical alarm imagery. The message is understanding and continuity, not discovering hidden disasters.
- No real personal information stored in browser logs, analytics, external prompts, static JSON, URLs, Git, Jetpost or screenshots.
- Real waitlist submission stays OFF until approved privacy, secure backend and server-side safeguards are implemented.

## A06. HANDOFF FILES provided with this prompt

`assets/HUMAN-ORIGINAL-APPROVED-REFERENCE.png` — visual **north star** for the premium dark editorial hero, but embedded wording is superseded by the current headline.  
`assets/HUMAN-CHATGPT-HERO-CANDIDATE.png` — latest text-free current portrait still generated here; use as a **testable visual candidate** rather than declaring it approved as final.  
`context/HUMAN-RESEARCH-DECISION-ARCHIVE.md` — historic decisions and background, only where consistent with this V2 specification.  
`context/HUMAN-ORIGINAL-MASTER-V1.md` — previous master prompt for extra context, subordinate to V2.  
`checklists/MOTION-CUE-SHEET.csv` — implementation and QA index generated from this specification.  
`checklists/ROUTE-ACCEPTANCE-CHECKLIST.md` — route and quality-control acceptance criteria.  
The **actual app prototype folder will be provided separately**. Do not guess its location.

---

# PART B — COMPLETE INFORMATION ARCHITECTURE & RELEASE BOUNDARIES

## B01. Route table: exact intended priority

| Route | Purpose | Release status | Rule |
|---|---|---|---|
| `/` | Brand story → eight scenes → Her/Him → real prototype preview → waitlist conversion | **BUILD FIRST** | Full cinematic and functional homepage |
| `/women` | HUMAN for Her: distinct women's preventive-health journey | **CORE** | Garnet art direction, credible scope |
| `/men` | HUMAN for Him: distinct men's preventive-health journey | **CORE** | Ocean teal art direction, equal polish |
| `/waitlist` | Five sequential immersive chapters, three data-entry stages | **CORE** | Staging flow until backend/privacy approval |
| `/about` | Mission, philosophy, verifiable story; founder details pending | **CORE** | Do not fabricate bios/history |
| `/faq` | Membership stage, rollout, waitlist, trust, prototype, guidance | **CORE** | Honest, specific Q&A |
| `/privacy` | Privacy notice | **REQUIRED BEFORE REAL SIGNUPS** | Draft placeholder in staging until legally reviewed |
| `/terms` | Terms of use | **REQUIRED BEFORE PUBLIC DATA COLLECTION** | Draft/legal review status clear |
| `/medical-disclaimer` | Medical/educational boundary | **REQUIRED BEFORE PUBLIC DATA COLLECTION** | Approved wording needed before launch |
| `/research` or external survey | Separate research questionnaire | **SEPARATE WORKSTREAM** | Do not mix with waitlist or silently activate |
| `/app` | Optional dedicated app overview/preview | **CONDITIONAL** | Decide after inspecting supplied app folder and observing usability |
| `/science` | Clinical principles, evidence and governance | **LATER** | Verified clinical review only |
| `/partners` | Lab/doctor/collection partnerships | **LATER** | Confirmed partner program only |
| `/memberships` | Membership offer and price details | **LATER** | No invented product/price specifics |
| `/404` or framework equivalent | Branded page not found | **CORE SUPPORT** | Accessible recovery navigation |

Do not advertise unready routes in main navigation. `/research`, `/science`, `/partners`, `/memberships` are out of first public release unless specifically approved. Build only safe, well-marked stubs if the repo needs them for internal navigation and never present them as finished public content.

## B02. Global navigation map and information hierarchy

**Desktop navigation**: left HUMAN wordmark (home); a small set of well-spaced main links `Home`, `For Her`, `For Him`, `About`, `FAQ`; conditional `Explore the App` anchor (homepage app segment; not broken `/app` route). Right-aligned persistent **JOIN THE WAITLIST** high-contrast action. On hero overlay use restrained transparent/dark header; on pale sections adjust surface and text; avoid unreadable mixed-contrast states. Use route-aware accessible aria-current.

**Mobile**: HUMAN wordmark left, `Menu` button right, accessible modal or full-height navigation panel (not a misleading hamburger glyph with no accessible name). Opening menu pauses background video if it distracts. Menu layers should have sensible focus trapping/return, ESC dismissal, backdrop click, no scroll bleed, and 44px comfortable target sizes. Permanent accessible waitlist CTA must be reachable in menu and optionally via a subtle non-overlapping mobile dock if tests show it helps.

**Footer**: brand statement; Home, For Her, For Him, About, FAQ, Waitlist; policy links to verified staging/legal pages; business contact only if an email is verified/approved (`hello@humanforlife.in` appears in earlier documentation, verify before using). Social links only when genuine. Current status: `HUMAN is being developed.` Don't show made-up awards, doctors, logos or social proof. Good keyboard and focus affordances.

**Global interactions**: clear link vs button semantics, hover/focus equivalence, logo returns home, sticky CTA reaches waitlist, native browser history/Back works, loading states do not trap scroll. All routes have proper `<main>`, heading hierarchy, descriptive titles and meta.

## B03. Actual homepage order — LOCKED

1. Cinematic Hero / Entry.
2. Story Scene 01 — You Take Care of Yourself.
3. Story Scene 02 — You Know the Progress You Can See.
4. Story Scene 03 — The Side You Can't See.
5. Story Scene 04 — Feeling Fine Doesn't Tell You Everything.
6. Story Scene 05 — Getting Tested Is Only the Beginning.
7. Story Scene 06 — That's Why We're Building HUMAN.
8. Story Scene 07 — Your Health. Your Body. Your Journey.
9. Story Scene 08 — The Story Continues.
10. Immersive portal pair — HUMAN for Her and HUMAN for Him.
11. Actual App Prototype Preview (from supplied folder when available; honest stub until then).
12. Final Waitlist Invitation, Footer.

There are **eight story scenes**, not eight separate websites. All copy is selectable real HTML, never text baked into image/video. Hero acts as an introduction before Scene 01; portals/app/conversion follow Scene 08.

## B04. Homepage copy: exact locked and working beats

**LOCKED HERO HEADLINE, typography and casing:**

> **HOW WELL DO YOU**  
> *know your health?*

Line 1 must render as uppercase bold General Sans-style sans; Line 2 lowercase Instrument Serif-style italic, with intentional rhythm and baseline alignment. The overarching story is **THE INVISIBLE SIDE OF YOUR HEALTH**. Suggested support sentence (WORKING): “There's more to your health than what you can see. We're building a more connected way to understand it.” Primary button `JOIN THE WAITLIST`. Secondary `EXPLORE THE STORY` or calm scroll cue (working, not a new destination).

Scene 01 — **YOU TAKE CARE OF YOURSELF**. “You try to eat well. You work out. You go for a run. You try to get enough sleep. Maybe you're working towards a fitness goal. Maybe you just want to feel better, stay active and take care of yourself. You put effort into becoming a healthier version of yourself.”

Scene 02 — **YOU KNOW THE PROGRESS YOU CAN SEE**. “You know how much you can lift. How far you can run. Whether you've been sleeping better. You can see the changes. You can track your progress. You know when something is working. But there's another side to your health.”

Scene 03 — **THE SIDE YOU CAN'T SEE**. “But there's another side to your health. One you can't see in the mirror or track on a fitness watch. What's happening inside your body? How are your blood sugar and cholesterol levels? What about iron, thyroid and other relevant health markers? You might not know. Most of us were never taught to look beyond how we feel or what we see.” Remove repeated transition wording between Scene 02/03 in final implementation; preserve user intention, not accidental duplication. Do not imply everyone needs these tests.

Scene 04 — **FEELING FINE DOESN'T TELL YOU EVERYTHING**. “You can feel fine and still have health markers that deserve attention. Some changes happen gradually, without obvious signs. Understanding your health shouldn't begin only when something feels wrong. It's not about assuming the worst. It's about making more informed decisions.” Treat this as WORKING copy requiring medical review before public marketing.

Scene 05 — **GETTING TESTED IS ONLY THE BEGINNING**. “You got your report. Looked through the numbers. Maybe searched a few things. But what happened next? Did you know which results mattered, where to start, how to follow through, or whether anything had changed when you checked again? Getting information is a start. Understanding it and knowing what to do makes it useful.”

Scene 06 — **THAT'S WHY WE'RE BUILDING HUMAN**. Six-stage planned journey: **TEST** (relevant testing with professional context) → **UNDERSTAND** (clear explanations) → **ACT** (suitably qualified priorities) → **TRACK** (follow-up/consistency) → **RETEST** (revisit appropriate indicators over time) → **IMPROVE** (learn and adjust; no guaranteed outcome). Explicitly describe a **planned connected membership**, not six live operating features.

Scene 07 — **YOUR HEALTH. YOUR BODY. YOUR JOURNEY.** “Your age, lifestyle, health history, priorities and life stage matter. What deserves attention for one person may differ for another. HUMAN is being built around that idea.”

Scene 08 — **THE STORY CONTINUES**. “You don't have to wait until something feels wrong to start understanding your health. And you don't have to figure everything out alone. There's more to your health than what you can see. There's HUMAN.” This must lead smoothly into the segment portals rather than being a dead end.

Each scene's copy may be edited minimally for rhythm and medically careful phrasing. Keep a `content/status` record of LOCKED vs WORKING vs CLINICAL REVIEW. Do not silently replace the brand's voice with corporate clichés.

---

# PART C — ART DIRECTION, DESIGN SYSTEM, STATIC COMPONENTS

## C01. The approved visual world

**A high-end human editorial campaign with sophisticated scientific art**, not two people standing in cheap T-shirts surrounded by literal DNA. The supplied original approved hero reference is a mood/composition reference; the newest clean hero candidate is a source asset to try in actual HTML. Light ivory editorial chapters are permitted elsewhere even though the **homepage hero is irrevocably dark**. In every screenshot, ask: does this look like HUMAN or like stock art with an orange glow?

- Mood: quiet confidence, intelligence, human connection, forward-looking but medically responsible.
- Atmosphere: near-black charcoal with disciplined light sculpting; warm rim light with neutral realistic skin; very sparse translucent membrane/refraction.
- People: authentic Indian/South Asian adults spanning different ages and lives; women and men represented equally across homepage and portals. Do not repeat identical models in all sections. Show ordinary lives, not just athletes.
- Science art: symbolic membranes, fine channels, refractive organic glass, botanical-like and cellular material abstractions **clearly metaphorical**; not real diagnostic scans, faux holograms, bright DNA ladders, energy rings, floating bubbles or random hexagons.
- Brand personality: documentary intimacy + luxury editorial restraint + precise product-interface discipline.

## C02. Working palette as CSS design tokens

| Token | Value | Usage |
|---|---|---|
| `--carbon` | `#0B0D0F` | Hero, signature dark chapters |
| `--ink` | `#14191C` | Dark elevated surfaces |
| `--paper` | `#F6F3EC` | Light editorial background |
| `--ivory` | `#ECE8DF` | Warm input/card surfaces |
| `--stone` | `#DCD8CE` | Fine rules and dividers |
| `--amber` | `#E8A523` | Controlled accent, focus-adjacent design |
| `--amber-deep` | `#B5831A` | Secondary warm accent |
| `--her-ink` | `#241018` | Women immersive world |
| `--her-garnet` | `#54263B` | Women's middle tones |
| `--her-glow` | `#82445C` | Selective highlight |
| `--him-ink` | `#091D1F` | Men immersive world |
| `--him-ocean` | `#164846` | Men's middle tones |
| `--him-teal` | `#286B67` | Selective highlight |

Refine actual luminance and contrast after screenshots; do not blindly use amber as small body text on pale surfaces or medical severity coding. Standard foreground roles: `--text-on-dark`, `--muted-on-dark`, `--text-on-light`, `--muted-on-light`, and accessible focus colour derived with contrast checks. Separate colour roles from medical interpretation colours.

## C03. Type system and exact implementation rules

Preferred approved pair: **General Sans** for UI/body/strong type and **Instrument Serif italic** for expressive secondary headline phrases. Verify font availability and licensing. If General Sans isn't legally available in project files, select a close reputable legally usable sans fallback (e.g. Inter, Manrope or system sans), record the substitution and retain aesthetic hierarchy. Never ship pirated fonts.

Suggested responsive type CSS rather than fixed numbers: desktop hero sans `clamp(3.7rem, 5.8vw, 7.4rem)` as needed for headline fit; desktop serif line `clamp(3.8rem, 6vw, 7.7rem)`; mobile `clamp(2.6rem, 10vw, 4.5rem)` adjusting for 360px safety. Actual choices must be screenshot-verified at all target widths. Large editorial scene headings around 48–88px desktop depending on layout, 34–56px mobile; body 16–20px with 1.45–1.65 line-height; micro labels 11–13px with restraint. Avoid tiny inaccessible captions to simulate luxury.

Typography must have intentional widths: no orphaned last word, no awkward clipped serifs, comfortable touch interactions, native selection, no kinetic word-splitting that scrambles screen readers, no huge uppercase block over someone's face. For animations use visual span wrappers while exposing full semantic text to AT; don't duplicate visible headings to screen readers.

## C04. Grid, spacing and layout geometry

- Desktop width: fluid 12-column editorial grid; content max-width about 1440–1520px with controlled gutters ~4–6vw, subject to visual testing.
- Tablet: collapse into 8/6/4-column equivalents depending on composition. Mobile: a deliberate 4-column editorial layout, ~18–24px lateral safe margins at 360–390px.
- Use consistent tokens for space `4/8/12/16/24/32/48/64/96/128px` as a scale, not blindly everywhere. Major editorial sections need breathing room; interactive forms need functional density.
- Use `min-height: 100svh` on large story environments where appropriate, not rigid `height:100vh` everywhere. Mobile browser UI and keyboard must never hide content.
- Hero left copy safe-zone ~43–48% at 1440 width; hero subjects occupy right; intentional gradient overlays preserve contrast. At smaller widths **recompose** rather than shrink.
- Desktop masthead z-index and overlay stacking must be centrally declared and not conflict with video, modals, mobile menus, sticky scenes or focus rings.
- At most **one dominant visual movement per viewport**; secondary layers support it with near-imperceptible motion.

## C05. Global shared components — exact behaviors

**SiteHeader**: wordmark as live link; transparent over dark hero; surface-aware background after threshold; CSS transition background/foreground; persistent CTA; nav links; keyboard focus. Never flash white on scroll, disappear unpredictably or cover content. Header height starting ~72–88px desktop, ~60–72px mobile; measure actual content.

**PrimaryButton**: live `<a>` for navigation or `<button>` for form action; 44px+ target; amber or high-contrast off-white treatment; gentle hover translate of arrow `2–4px`, border/fill shift, active depress `1px`; no wobble, magnetic button that moves beyond click target or auto-trigger.

**SecondaryLink**: clear underline/rule reveal not relying exclusively on colour, arrow movement on hover/focus; proper external indicator if leaving website.

**ScrollCue**: optional vertical fine line and label `SCROLL TO EXPLORE`; one low-amplitude repetitive animation only if motion allowed; clicking cue scrolls to Scene 01; keyboard focus + button/link semantics.

**EditorialEyebrow**: small precise numerical chapter label and index; may slide in 8px with fade; never text reveal that hides important content >1s.

**ImageFrame**: `picture` sources and object-position per breakpoint, meaningful alt or empty alt for decoration, optional restrained crop reveal; `<figure>`/caption for illustrative visuals. Avoid CLS.

**AmbientMedia**: isolated component for background video with poster, `autoplay muted playsinline loop` only if verified as loopable, visibility-controlled playback, reduced-motion poster-only fallback, network/power-aware degradation, no audio in rendered website. Explicit Video SOP below.

**FocusOutline**: globally visible keyboard indicator, not a flash of neon that conflicts with brand; user must still be able to locate focus over dark/light media.

**PageTransition**: no fake 3-second loading screen. Prefer a short CSS fade/scene-wipe up to ~350ms; links must navigate reliably even when animation fails and handle browser Back and reduced motion. No inaccessible SPA-only route traps.

**Footer**: quiet return to brand with links and small legal staging labels. On dark footer, contrast and accessible links are more important than ornamental animation.

## C06. Prohibitions / visual anti-patterns

No generic 3-column feature cards repeated down the site; no uniform 50/50 hero copies for every scene; no fake data dashboard; no copied third-party UI; no chunky neon; no constant particle storms; no animated cursor that replaces the OS cursor; no huge scrolling marquees that reduce readability; no global smooth-scrolling hijack; no scroll-to-top on every animation; no loud background sound; no misleading “live now” statuses; no gigantic canvas shader if CSS/SVG achieves the effect; no mandatory WebGL to read content; no floating medical words around real people implying measured data.

---
# PART D — GLOBAL MOTION LANGUAGE, SCROLL ENGINE & EXACT EFFECT CONTRACT

## D01. Motion rules that apply to every page

The website is a **responsive interactive document**, not a fixed video timeline. Scroll position may drive a small set of animations, but content must remain accessible without JS, on low-powered devices, and for reduced-motion settings. Do not over-design the scroll. The feeling should be cinematic **through pacing, typography, composition and physically plausible transitions**, not through constant spectacle.

**Motion vocabulary (define reusable functions/variants):**
- `revealUp`: opacity `0→1`, translateY `20–36px → 0`, duration `0.55–0.85s`, ease `power2.out` or equivalent; for captions/paragraph groups.
- `lineMask`: vertical `clip-path`/mask revealing a line or phrase from below, duration `0.7–1.0s`; at most once per major heading; include accessible fallback.
- `softDissolve`: opacity transition `0→1` / `1→0`, duration `0.55–1.05s`; use where content meaning changes.
- `imageReveal`: clipping rectangle expands from 0 to full image, or clip inset `8–14% → 0`, duration `0.8–1.2s`; don't zoom every image.
- `parallaxGentle`: media position translates only `2–6%` of image/container height through normal section scroll, on desktop only; no sudden jumps on reversal.
- `lightSweep`: low-opacity mask/highlight travels through an abstract material, duration `2–5s` if ambient or scrubbed over a specific transition; no full-page flash.
- `strokeDraw`: SVG stroke `pathLength 0→1`, duration `0.8–1.4s` or scrubbed; used for connected-journey / network motifs.
- `depthShift`: scale `1.035→1.0` or `1.0→1.025` and translate under `24px` over a long scroll range; preserve subjects and avoid blur.
- `colourMorph`: CSS custom property/background transition between token-defined palettes over `0.6–1.1s` or scroll-scrubbed; no abrupt colour flashing.
- `numberStep`: step/chapter indicator only; no fake analytics numbers or count-up social proof.
- `focusHalo`: accessible outline/border transition `0.12–0.2s`; do not animate fields away during typing.
- `reducedMotion`: turn all decorative entrance states on immediately, disable pin/scrub/parallax/lightSweep/video, display posters, preserve form feedback and normal navigation.

**Animation duration guideline (subject to browser QA):** microinteraction 120–220ms; text and buttons 450–800ms; section visual entrances 700–1100ms; major palette handoff 500–1000ms; video clips 5–10s only where worthwhile. Easing: `power2.out` for content, `power3.inOut` for controlled scene wipes, `sine.inOut` for gentle light, `none` for scrubbed transforms. Do not overuse elastic/back/spring effects. GSAP is optional if performance is sound; Motion One/CSS equivalent is acceptable where appropriate.

**Scroll coordinate conventions:** an `onEnter` threshold such as `start: 'top 80%'` means the entering section reaches 80% of viewport height; choose actual trigger by browser evidence. For `scrub` sequences define `start/end` explicitly and ensure the visual narrative survives fast scrolling, reverse scrolling, reload mid-page and browser Back. Start all nonessential decorative motion only after layout stabilises and fonts/media are ready; no animation can hide core copy if JS fails.

**Pinned scenes:** at most **two major desktop pins on the homepage**—recommended only for the Scene 02→03 reveal and Scene 06 six-stage journey. Their combined extra scroll length must be reasonable, roughly one additional viewport each at most. Do not pin the hero and every section, and **disable pins on narrow/touch/mobile layouts**. Leave enough vertical travel for readable text. No hijacked wheel, endless sticky traps or scroll-snap through the entire homepage.

**Continuous browser state:** only one foreground video actively plays; pause ambient videos outside viewport with `IntersectionObserver`; suspend in hidden tabs; always remove listeners/ScrollTrigger contexts on route unmount. Do not instantiate duplicated timelines during hydration or resize. Use `matchMedia`/framework equivalents to set breakpoint-specific motion and restore previous DOM state on revert.

## D02. Global motion cues: exact element, trigger, sequence and fallback

| ID | Element | Trigger | Desktop choreography | Duration/travel | Mobile & reduced motion |
|---|---|---|---|---|---|
| `G-01` | Initial page content | After fonts are stable / ready | Background poster remains visible immediately; minimal 0→1 exposure fade; never show blank startup screen | 350–600ms | Immediate poster |
| `G-02` | Header wordmark and links | First load | Wordmark opacity and 8px upward rise, nav items stagger 40–60ms | 350–550ms | Plain fade or immediate |
| `G-03` | Header surface state | Scroll 40–80px / hero exit | Background becomes ink/ivory as needed; slight hairline border; no abrupt jumps | 180–300ms | Same without blur if costly |
| `G-04` | Header CTA | Hover/focus/press | Border/fill transition; small arrow shift 3px; press move 1px | 120–200ms | Focus/press only |
| `G-05` | Navigation link underline | Hover/focus | Short underline grows left→right using transform scaleX | 180–260ms | Focus underline static if reduced |
| `G-06` | Mobile menu | Menu activation | Backdrop opacity + panel move 12px; instantly mount functional links, trap focus; invert on close | 200–320ms | Prefer 0–180ms |
| `G-07` | Scroll cue | Hero idle + click | 12–22px line/tracer travels at low opacity, repeating slowly; click moves to Scene 01 using native smooth where allowed | ~2.6s optional | Static arrow / standard anchor |
| `G-08` | Section index/eyebrow | Section top at 85% viewport | opacity rise and 10px translation | 350–550ms | Immediate |
| `G-09` | Main editorial heading | Section top at 75–80% | `lineMask` once; do not split letters per frame | 650–950ms | Fade or immediate |
| `G-10` | Paragraph group | Heading settled or top 65% | `revealUp` on full sentences/paragraphs, stagger <=120ms | 500–700ms | Immediate readable |
| `G-11` | Editorial fine rule | Section visible | stroke/width grows from 0→100% | 350–700ms | Static rule |
| `G-12` | Image-frame reveal | Image at 80% | horizontal or vertical clip opening, image fully laid out; optional 1.02 scale correction | 700–1000ms | Short fade |
| `G-13` | Ambient material highlight | Material enters view | subtle `lightSweep` with low opacity and no faces being obscured | 3–6s slow | Off / static |
| `G-14` | Page route transition | Actual link click + navigation | 120–300ms veil/dissolve; never block native link navigation or history | <=350ms | Instant / reduced fade |
| `G-15` | Footer call-to-action | Footer 85% entering | understated line and text reveal once; no expanding fireworks | 500–800ms | Static |
| `G-16` | External-link arrow | Hover/focus | 2–4px translate and small opacity shift | 120–200ms | Static icon |
| `G-17` | Media loading | Video canplay / loading failed | Video crossfades over poster only once ready, or poster stays permanently | 250–500ms | Poster only if reduced/save-data |
| `G-18` | Return-to-top link | Footer / pressed | accessible anchor, native smooth if allowed and safe | navigation action | Instant if reduced |
| `G-19` | Input and select | Focus/blur/errors | focus border and outline, error text stable layout, optional 1px label accent; no shape bounce | 120–200ms | static focus is fine |
| `G-20` | Dialog/FAQ disclosure | Activation | content height adjusts without clipping; opacity subtle; focus/ARIA preserved | 150–260ms | Immediate |

Implement decorative transitions as transforms/opacity of composited layers. Avoid expensive continuously animated `filter: blur`, height and box-shadow on large images. Any class that starts `opacity: 0` must default to visible if JS not active (progressive enhancement with a `.js-motion` opt-in root flag and safe initialization).

## D03. Hero choreography — exact specification (`H-01` through `H-10`)

**Element map:** `<Header>`, `HeroAtmosphere` image/video, transparent material film layer, right-side portrait subject(s), dark-to-clear left readability overlay, eyebrow, two-line heading, support sentence, primary CTA, secondary story cue, optional minuscule section index. The actual hero background must not include website text/buttons or invented charts. The headline safe area is left; people on right. Image cannot become the entire layout.

| ID | Trigger | Choreography | Desktop target | Mobile/reduced fallback |
|---|---|---|---|---|
| `H-01` | First render | Display well-composed still poster immediately; camera-frame dark exposure overlay settles from ~12% to 0 | 0.45s | Same or immediate |
| `H-02` | 0.18s after readiness | Eyebrow `THE INVISIBLE SIDE OF YOUR HEALTH` appears by 10px rise and fade | 0.5s | Fade only |
| `H-03` | 0.25s after readiness | Line 1 “HOW WELL DO YOU” reveals behind a horizontal baseline mask, no letter scrambling | 0.8s | All text appears immediately if reduced |
| `H-04` | 0.35s after readiness | Line 2 `know your health?` appears with a slower 12px lift, delicate italic contrast | 0.9s | Same without mask if mobile constrained |
| `H-05` | 0.75s | Supporting copy fades in from 16px below after heading is mostly visible | 0.55s | No stagger if mobile |
| `H-06` | 0.9s | Primary CTA and secondary cue appear; arrow nudges 3px | 0.45s | Immediate interactive CTA |
| `H-07` | Ambient while visible | Very subtle film layer: material refraction, minor luminance variation; *almost still faces*; no floating orange ribbon across eyes | loop only if proven seamless | Poster only; save-data disables video |
| `H-08` | On pointer movement (desktop only) | Optional optical depth translation of distant material layer only, at most 3px; never move CTA or subjects under cursor | <=120ms smoothing | Off |
| `H-09` | First 35–55% of normal scroll exiting hero | Foreground hero material recedes by <3% scale; heading opacity softly reduces as content leaves naturally | scrub or restrained fixed | Normal flow + static fade |
| `H-10` | Hero bottom intersects Scene 01 top | Charcoal membrane/gradient mask yields to first real-life imagery; eyebrow/index changes; no jarring black-to-white flash | 0.8–1.2s perceptual | Simple background/color transition |

**Hero visual targets:** Composition feels premium even with video removed; no text on face; on 1440x900 CTA and headline visible; on 390x844 faces/subject intact, headline readable and CTA reachable; no stretch of model bodies. On ultrawide preserve portrait and left safe zone; on mobile place image as top/right upper field with gradient for text below or choose a safe mobile crop. If candidate image cannot support mobile, create a crop or new mobile image **only with available approved tools/budget**.

**Hero anti-effects:** No 3D sphere orbiting the head; no animated data HUD; no particle burst; no floating bones/organs; no direct text-to-video lip/face movement; no zooming camera into eyes; no always-on glowing DNA.

## D04. Hero → Story Scene 01 handoff (`T-01` through `T-04`)

This is the **first mandatory quality gate**. The visitor's sense of scale changes from brand mystery to familiar human routines.

| ID | Trigger | Action | Hard constraint |
|---|---|---|---|
| `T-01` | Hero's bottom approaches 35% viewport | Soft warm light enters from the edge of the next image; restrained amber visual motif exits behind it | Avoid full-screen flash |
| `T-02` | Scene 01 enters 80% viewport | One everyday-life photograph is revealed through a horizontal crop; second photo optional (not a 12-image montage) | Keep subject authentic and diverse |
| `T-03` | Scene 01 enters 70% | Scene number `01` + title reveals, paragraphs follow in a simple paced group | Text doesn't wait for animation |
| `T-04` | Scene 01 occupies reading zone | Hero background video has stopped; poster no longer occupies GPU decoding | Verify pause in DevTools |

**Screen-level QA before proceeding:** inspect hero/Scene01 at 1440, 1280, 390 and 360 widths, a mid-scroll screenshot, fast scroll down/up, keyboard focus and reduced motion. Correct actual issues, not merely report them.

---

# PART E — HOMEPAGE SCENES: COMPLETE VISUAL & SCROLL STORYBOARDS

Use unique layouts rather than multiplying the hero. Every scene must contain: a semantic `<section id=...>`, an optional scene number/eyebrow, one meaningfully ordered heading, readable concise copy, a relevant image/visual, purposeful motion and a clean exit into the following scene. The designer decides between adjacent visual and copy blocks vs stacked layout to protect rhythm; the intent below is the baseline.

## E01. Scene 01: YOU TAKE CARE OF YOURSELF (`S1-01` to `S1-06`)

**Narrative:** ordinary care is meaningful and familiar. Emotional tone: human, observational, warm, never accusatory or gym-only.

**Visual layout:** warm off-white/editorial ink or a softened deep neutral transition; one larger portrait showing everyday movement/preparation/rest (not the hero couple), paired with 1–2 supporting smaller crops like an early walk, a meal, morning sunlight, quiet personal care. Asymmetric editorial stack with generous typography. Avoid fake smartwatch metrics. Keep body copy in a readable text block under ~68 characters per line.

| ID | Start/trigger | Exact effect | End state / safety |
|---|---|---|---|
| `S1-01` | Section `top 85%` | Background palette settles from dark hero to restrained warm paper via colourMorph | No white flash, text contrast maintained |
| `S1-02` | Main image `top 80%` | ImageFrame clip reveals from left to right with a slight depth shift 1.025→1 | No distorted subject |
| `S1-03` | Headline `top 75%` | Heading phrase lineMask once, eyebrows follow | Heading visible without JS |
| `S1-04` | Body `top 70%` | Full paragraph block revealUp; limit stagger to 0.12s | No line-by-line unreadable flying copy |
| `S1-05` | Supporting crops entering | Secondary crops cross-dissolve sequentially and hold, each contextualizing care | No looping autoplay photo collage |
| `S1-06` | Section leaves top 20% | Image may rise <2% to create depth while next section comes in | Natural scroll reverse supported |

**Responsive:** 390px puts main image above copy or as inset, with an intentional visible heading and no awkward fixed-height multi-columns. All supporting images optional on 360px. Reduced motion: static clear photo + copy.

## E02. Scene 02: YOU KNOW THE PROGRESS YOU CAN SEE (`S2-01` to `S2-07`)

**Narrative:** people observe external progress: movement, sleep, habits. The design moves from the tangible to a subtle question: what is unseen?

**Visual layout:** editorial triptych or stepped media sequence of 3 actual lifestyle ideas (movement, rest, routine), each with restrained title treatment; supporting typography “WHAT YOU CAN SEE” then “WHAT YOU CAN'T”. These are concepts, not measured dashboard results. A horizontal array may scroll naturally on desktop; on mobile reflow stacked or native horizontal snap **only for a user-controlled gallery**, never mandatory auto-scroll.

| ID | Trigger | Exact effect | End state |
|---|---|---|---|
| `S2-01` | top 82% | Section index, eyebrow and title reveal in order | Instantly usable if motion off |
| `S2-02` | visual group enters 75% | First lifestyle image reveals with crop, no zoom | First image stable |
| `S2-03` | visual group enters 60% or user advances optional slider | Second lifestyle frame gains clarity, first dims slightly; no auto-loop while reading | Image transition <0.8s |
| `S2-04` | third frame entrance | Third frame reveals; captions transition with actual subject context | Readable labels |
| `S2-05` | copy lower third enters | Small editorial rule draws connecting examples | Subtle horizontal alignment |
| `S2-06` | near section end | The phrase “But there's another side to your health” isolates visually, surrounding imagery falls to low opacity | Prepare reveal, not alarm |
| `S2-07` | transition next | Charcoal/scientific surface begins as an opaque dark cinematic overlay from edge, not a glitter explosion | Controlled tonal shift |

**Responsive:** images vertically layered or horizontal swipe carousel with visible dots and accessible prev/next. Keyboard/arrow operation if carousel; never require hover. Reduced motion: all image examples directly visible.

## E03. Scene 03: THE SIDE YOU CAN'T SEE — SIGNATURE REVEAL (`S3-01` to `S3-10`)

**Narrative:** a compelling visual and intellectual pivot into the invisible-health idea. **This is the main futuristic effect of the homepage.**

**Visual layout:** cinematic near-black environment with one abstract translucent organic membrane/strand, lit as if photographed in a dark studio; a subtle opening aperture/contour exposes an underlayer. Person-centered metaphors must not imply literal see-through bodies, medical scans or actual biomarkers of pictured people. Use existing SVG/CSS layers first; one optional 5–8s Google Flow clip if meaningful. Headline and body remain real HTML and readable during motion.

**Desktop choreography:** Optional **one pinned segment**; sticky illustrated visual and adjacent copy, not whole page forced to scroll for 300vh. Pin should be ≤ roughly one additional viewport of scroll travel after content enters, with native scroll recovery and no full-page lock. Disable pin on mobile/touch/reduced motion.

| ID | Trigger/scroll progress | Exact effect | Limit |
|---|---|---|---|
| `S3-01` | Section top reaches 80% | Background fully settles into carbon/ink | Contrast clear |
| `S3-02` | 0–12% of reveal scroll | Editorial label `THE INVISIBLE SIDE OF YOUR HEALTH` and heading appear | No random text scramble |
| `S3-03` | 10–30% | Soft opaque material contour drifts horizontally 10–30px as a slow light line appears | No fast particles |
| `S3-04` | 25–50% | Organic translucent material shows internal refraction and layered depth (SVG mask or short approved film) | Metaphorical, not scan |
| `S3-05` | 45–70% | Subtle narrow light reveals a second material layer without bright flash; foreground dims just enough for copy | One main visual reveal |
| `S3-06` | 55–85% | Question “What's happening inside your body?” resolves into accessible high-contrast copy, not a fake numeric answer | No health numbers |
| `S3-07` | 70–100% | Fine connected line motif emerges, suggests transition toward marker concepts | Single clean line |
| `S3-08` | Scrolling backward | Entire sequence reverses smoothly; no duplicate overlays | Explicit QA |
| `S3-09` | Video visible | If film is used, muted loop/poster management; no lip movement or frame warping | Pause when off screen |
| `S3-10` | Exit to Scene 04 | Charcoal gives way to a light editorial layout by a soft iris/crop and colourMorph | No clinical alarm jump |

**Mobile:** one static material artwork or reduced-motion short crossfade with readable text immediately below/over a strong contrast overlay; no pin, no WebGL dependency. **Quality gate:** screenshot 4 positions in this reveal, including mobile, check typographic legibility and reverse scroll.

## E04. Scene 04: FEELING FINE DOESN'T TELL YOU EVERYTHING (`S4-01` to `S4-06`)

**Narrative:** concern without fear. Visual result should communicate the distinction between feelings and some relevant measured indicators; never give an individual diagnostic reading.

**Layout:** warm paper chapter; single understated abstract biomarker legend, labels “blood sugar”, “cholesterol”, “iron”, “thyroid” only as examples of health-marker categories; optional short explanatory caption “Examples only — testing needs vary by person and clinical context.” Draw a subtle line connecting neutral markers; no red/green status bars, fake patient results, percentages or health scores.

| ID | Trigger | Effect | Hard limit |
|---|---|---|---|
| `S4-01` | section top 83% | Large heading enters with editorial vertical mask | Fine motion |
| `S4-02` | graphic top 75% | Thin SVG line draws across neutral 4 marker labels | ~0.9s, no counts |
| `S4-03` | line passes each anchor | Label fades in and remains; never changes value or colour to suggest status | No real patient meaning |
| `S4-04` | paragraphs enter | Copy comes in as one readable group, optional 70ms stagger across distinct blocks | Calm emotional tone |
| `S4-05` | pointer hover/focus marker (optional) | A neutral explanatory tooltip describes marker *category*, not health advice | Keyboard & touch accessible |
| `S4-06` | exit | Illustrated line compresses/softly aligns into next report-motif edge | No jump cut |

**Responsive:** stack label rows and line safely or use straightforward semantic list; no horizontally cramped diagram; screen-reader alternative that explains it's decorative. Reduced motion: full diagram at rest.

## E05. Scene 05: GETTING TESTED IS ONLY THE BEGINNING (`S5-01` to `S5-08`)

**Narrative:** a report is not the whole journey. Avoid suggesting actual results or diagnosis. The user experiences the shift from unclear information to understandable next questions.

**Layout:** an elegant, wholly **illustrative** report-paper motif (blurred/obscured document structure without invented real-looking biomarker values). As the visitor reads, layout transforms toward three meaningful questions: `What matters?`, `Where do I begin?`, `What changes over time?`. These are actual typography/SVG layers, not baked into photo.

| ID | Trigger | Effect | Exclusion |
|---|---|---|---|
| `S5-01` | top 80% | Paper/report silhouette emerges from ink or light neutral | No fake authentic clinical PDF |
| `S5-02` | 75% | Heading reveals alongside report artwork | Remain readably stable |
| `S5-03` | 65% | Placeholder lines in decorative report quietly shift focus; no randomized values | No data-like digits |
| `S5-04` | first callout enters | `What matters?` line fades in with fine connector | Calm |
| `S5-05` | next callout | `Where do I begin?` emerges while report motif dims | No bouncing cards |
| `S5-06` | third callout | `What changes over time?` emerges with connective rule | No false tracking data |
| `S5-07` | hover/focus callout (optional) | tiny underline/contrast shift; not a fake clickable link unless functional | Honest semantics |
| `S5-08` | exit | Three questions resolve into single amber/ink pathway that leads toward six-stage model | Visual continuity |

**Mobile:** questions shown as numbered typographic list with static fine rules; no tiny angled report mockup. Reduced motion: all three visible.

## E06. Scene 06: THAT'S WHY WE'RE BUILDING HUMAN (`S6-01` to `S6-12`)

**Narrative:** this is the **product explanation centrepiece**. It must make the planned ongoing membership understandable. Six connected stages, not six equal commercial features falsely presented as live.

**Layout:** large heading on upper/left; an elegant connected vertical/curved SVG pathway across six points; paired detail label+description; warm amber point follows user's progress, against dark neutral or deliberate light editorial environment. Desktop can use one brief pinned/sticky diagram; mobile a simple six-stage vertical timeline with semantic list structure. Do not invent outcome promises.

**Stages and grounded descriptions:**
1. **TEST:** Relevant testing considered in context; details to be clinically reviewed.
2. **UNDERSTAND:** Help make results easier to interpret, with appropriate professional context.
3. **ACT:** Plan appropriate next steps, subject to qualified guidance.
4. **TRACK:** Stay connected to meaningful follow-through over time.
5. **RETEST:** Revisit selected markers when appropriate, not blanket schedules.
6. **IMPROVE:** Learn from trends and refine healthy decisions over time; never promise improving numbers.

| ID | Trigger / progress | Effect | Semantic fallback |
|---|---|---|---|
| `S6-01` | section top 83% | Heading and small `A CONNECTED JOURNEY` eyebrow enter | Static heading |
| `S6-02` | section progress 0–15% | First visible line path draws from top origin to TEST node | Full static SVG/list |
| `S6-03` | 15–28% | TEST point gains soft ring; description becomes dominant | All text remains in DOM |
| `S6-04` | 28–40% | Line draws to UNDERSTAND; prior node stays readable but softens | No hidden stage |
| `S6-05` | 40–50% | ACT point activates, connecting line completes | Controlled amber |
| `S6-06` | 50–63% | TRACK activates; small frame shift follows path | No faux dashboard |
| `S6-07` | 63–77% | RETEST activates; semantics specify individual review | No auto schedule claim |
| `S6-08` | 77–90% | IMPROVE activates; all six remain visible in final frame | No promised result |
| `S6-09` | hover/focus node | Highlight corresponding paragraph and active point, with touch-click equivalent | Actual button/tab if interactive |
| `S6-10` | reverse scrolling | Progress indicator and highlights reverse cleanly, without snapping/re-trigger bug | Regression test |
| `S6-11` | section bottom | Entire sequence visually resolves into HUMAN wordmark or clean thread into Scene07 | No forced extra scrolling |
| `S6-12` | reduced motion/mobile | Render sequential numbered list; no pin, no scrub, no animated SVG | All six immediately readable |

**Do not misrepresent:** use “We're building a membership designed to connect...” rather than “Your account now tests/tracks...” If specific stages aren't implemented in supplied app, don't demo them as functional.

## E07. Scene 07: YOUR HEALTH. YOUR BODY. YOUR JOURNEY (`S7-01` to `S7-07`)

**Narrative:** people differ. The subject is broader than gender stereotypes or high-performance fitness.

**Layout:** editorial portrait mosaic with at least 3 distinct types of real-life context (working professional, walking/movement, rest or day-to-day), ages/life stages represented respectfully. Alternating photo sizes, controlled negative space; no claim pictured models are customers. Gentle editorial warmth prepares segment pages.

| ID | Trigger | Effect | Constraint |
|---|---|---|---|
| `S7-01` | heading entering | Title reveals in two meaningful phrases; no letter scatter | Accessible |
| `S7-02` | collage top 80% | First image clip reveal from one edge | Slow and polished |
| `S7-03` | collage center | Second image appears in counter-composed crop, 10–14px offset settling | No busy mosaic |
| `S7-04` | next entry | Third smaller frame appears; no hero couple repeated | Distinct people |
| `S7-05` | explanatory copy | Text reveals as entire paragraph | Readable |
| `S7-06` | desktop pointer optional | Parallax on background crop <=3px, not on faces individually | Off on touch |
| `S7-07` | exit | Image arrangement settles into colour field that informs next brand portals | No faux personalized data |

## E08. Scene 08: THE STORY CONTINUES (`S8-01` to `S8-06`)

**Narrative:** a calm reflective pause concluding the story and inviting exploration; no dead end or repeated generic manifesto.

**Layout:** restrained near-black or paper field, generous typesetting, one human portrait silhouette/material accent, HUMAN brand mark. A quiet transition from existential question to specific offer.

| ID | Trigger | Effect | Constraint |
|---|---|---|---|
| `S8-01` | top 83% | Editorial rule appears first, indicating change of chapter | No big animation |
| `S8-02` | 78% | “The story continues.” serif contrast appears | Polished typography |
| `S8-03` | 70% | Closing lines reveal as whole sentences | No coercive delay |
| `S8-04` | lower viewport | HUMAN wordmark enters via short matte mask | No inflated logo animation |
| `S8-05` | portal preview enters | Soft warm-to-garnet / cool-to-teal dual atmospheric highlight appears | Don't imply binary biological choice |
| `S8-06` | scroll onward | Seamless handoff to segment portal links | Actual links visible |

## E09. HUMAN for Her / HUMAN for Him immersive portals (`P-01` to `P-10`)

**Purpose:** present two routes with distinct environments that feel like immersive doors into the brand, not generic two identical cards tinted pink and blue. Her = deep garnet, Him = dark ocean teal. Both have equal visual prominence and equivalent CTA style. Do not enforce biological assumptions through interaction; these are optional editorial paths, not a personal medical assessment.

**Desktop composition:** full-width portal section with two offset editorial panels, cinematic portraits, edge light, large route titles and small grounded descriptive subtitles, asymmetric juxtaposition. Hover/focus reveals depth through subtle crop, colour and fine line. Inactive panel darkens gently, not disappearing. Both remain readable even without hover.

| ID | Trigger | Effect | Constraint |
|---|---|---|---|
| `P-01` | portal top 85% | Two large surfaces reveal with offset clip masks | Both equal status |
| `P-02` | panel enter | Her portrait/background softly resolves, subtle garnet light | Authentic subject |
| `P-03` | panel enter | Him portrait/background softly resolves, subtle teal edge light | Equal quality |
| `P-04` | hover/focus Her | Garnet panel media scale 1→1.025, text contrast increases, arrow shifts 3px | No card jump |
| `P-05` | hover/focus Him | Teal panel same behavior and intensity | Equal balance |
| `P-06` | hovering one | Other panel opacity changes max ~10%; avoid 50% dim | Both readable |
| `P-07` | Enter/click Her | Actual navigation to `/women` | Must work with keyboard |
| `P-08` | Enter/click Him | Actual navigation to `/men` | Must work with keyboard |
| `P-09` | mobile | Stack full-width portal panels with vertical safe crop, clear tap target | No hover dependency |
| `P-10` | reduced motion | Fully visible images and CTAs, no scaling | Same navigation |

**Working intro copy (do not invent clinical specifics):** “Different bodies. Different life stages. A more thoughtful starting point.” Explain both paths are representations of intended experiences, not live customised services.

## E10. Actual app-prototype introduction on homepage (`A-01` to `A-09`)

**Purpose:** show the real app *as it exists* once a folder is supplied, not an invented interface. The user explicitly says they will share the app folder. The architecture deliberately has the app experience **within the homepage first**. Build `/app` only if inspection and user testing show it helps.

**Initial layout while folder missing:** elegant brand-matched shell with title `A look at what we're building`; honest support copy `App prototype preview coming soon` if genuine screenshots/assets unavailable; a non-deceptive waitlist CTA. Do NOT fabricate screen screenshots. When folder arrives, replace with actual running images or working interactive demo using approved integration strategy in Part H.

| ID | Trigger | Effect | Constraint |
|---|---|---|---|
| `A-01` | homepage app section top 82% | Section heading/eyebrow reveal; no fake loading phone | Real content |
| `A-02` | actual screenshot frame enters | Real screen frame (if supplied) reveals via clip, no skewed perspective that obscures text | Legibility |
| `A-03` | screenshot list available | User-controlled tab/step buttons switch between **verified** actual screens | No fabricated app modules |
| `A-04` | switch to screen | 180–300ms crossfade/very small slide, no 3D carousel | Accessible tabs |
| `A-05` | hover/focus real screen item | Tiny border/contrast response | Keyboard equivalent |
| `A-06` | click `Explore prototype` | Open actual working prototype route or safe external link with label | Verify URL and access |
| `A-07` | iframe allowed (conditional) | Progressive iframe load with poster/placeholder and explicit link to open separately | Handle blocked frame |
| `A-08` | failure/unavailable | Show honest unavailability state and waitlist link, never an endless spinner | No fake behavior |
| `A-09` | mobile/reduced motion | Static faithful screenshot, accessible selector and link; no phone spin | Usable first |

## E11. Final homepage waitlist invitation (`C-01` to `C-06`)

**Narrative:** after long storytelling, invitation to participate. Clear one primary action, not multiple competing sales offers.

**Visual layout:** quiet dark field with possibly subtle warm material edge and an authentic single portrait crop different from hero. Locked brand tone. Copy: “Be part of what we're building.” Explain invitation for prelaunch interest across India; pilot planned Delhi NCR. One strong `JOIN THE WAITLIST` button. No fake countdown, registrant count, scarcity, partner logo strip or “limited spots” claim.

| ID | Trigger | Effect | Constraint |
|---|---|---|---|
| `C-01` | enters 83% | Background soft charcoal/amber settles | Quiet after story |
| `C-02` | heading 77% | Main phrase lineMask once | Readable |
| `C-03` | support 69% | Short supporting copy fade/rise | No hidden qualifiers |
| `C-04` | CTA 65% | Button visible with micro arrow/underline effect | Clear primary action |
| `C-05` | CTA click | Goes to `/waitlist` and initial Welcome chapter | No automatic form submission |
| `C-06` | footer entering | Typography and brand line settle, no additional dramatic sequence | Calm ending |

**Global homepage quality contract:** Story text must be fully understandable if all media fails and every timeline is disabled; there are no autoplay narrators, no inaccessible scroll-timed quiz, no fake progress data and no repeated giant AI-generated subjects. The page can be cinematic with **only one or two actual video assets**.

---
# PART F — COMPLETE CORE PAGE DESIGN: WOMEN, MEN, ABOUT, FAQ, LEGAL

## F00. Shared page rules

Every interior page needs a genuine editorial identity **within one HUMAN design system**. Header/nav, typography, route transitions, footer, CTA, spacing, focus treatment and form semantics remain consistent. The homepage's eight scenes should not be blindly duplicated; each page should answer a visitor's specific question. Do not invent product capabilities or treat these pages as live product brochures.

At top of each route use a meaningful visible `h1`. Expose page status where necessary: “HUMAN is in development.” Avoid a huge mandatory scroll film before users can navigate or find an answer. Make page entrance animation settle within ~800ms; reduce motion to immediate. Never use image-based text.

## F01. `/women` — HUMAN for Her: garnet editorial world

**Art direction:** deep garnet / burgundy atmospheric world (`--her-ink`, `--her-garnet`, `--her-glow`), natural lighting with muted warm highlights, photography of Indian women in credible day-to-day contexts and varied ages. Do **not** presume every woman is trying to conceive, has PCOS, or is pregnant. Do not promise diagnoses, panels, hormone protocols, clinical consultations or special feature availability until confirmed. The proposition is more thoughtful preventive understanding across different needs and life stages.

**Section architecture:**
- `W-HERO` full-but-practical editorial hero. `HUMAN FOR HER` eyebrow + a working, editable statement such as “A more thoughtful way to understand your health.” Support copy clarifies **in-development** status. CTA join waitlist; secondary down-page anchor. Portrait is different from homepage hero; garnish with abstract organic light, not pink/purple stars.
- `W-01` one quiet human-centred section: “Your health isn't one-size-fits-all.” Diverse contexts, priorities, evolving life stages. Text + two image compositions.
- `W-02` three grounded themes as editorial stories, **not confirmed product modules**: understanding what is relevant to you; translating information into better questions; staying connected to follow-through. Avoid named unverified tests or promises.
- `W-03` shared six-stage HUMAN journey, abbreviated and intentionally linked to homepage; subtle garnet line motif. Do not copy giant six-step animation verbatim.
- `W-04` honest access/preview link: app prototype if verified, otherwise “We're developing this experience” and an explanation of scope.
- `W-05` waitlist invitation with India-wide interest and planned pilot qualification.

| ID | Section/trigger | Specific animation | Interaction / fallback |
|---|---|---|---|
| `W-01A` | Hero load | Deep garnet appears under editorial portrait; controlled portrait reveal from right; tiny warm light edge | Poster static on mobile |
| `W-01B` | Hero load +0.2s | Strong heading and serif support line reveal with stagger 0.1s | Text immediate if reduced |
| `W-01C` | Secondary action | Scroll to next section, no hijack | Anchor works |
| `W-02A` | Theme 01 at top 80% | Primary photo crop reveals with contrasting text column | No health stats |
| `W-02B` | Theme 02 at top 80% | Second image dissolves in; restrained line sweeps into section label | No floating icons |
| `W-02C` | Theme 03 enters | Subtle two-tone garnet layer shifts 10px, typography anchors | Desktop only |
| `W-03A` | Journey enters | One simple 6-node connector draws as user scrolls; all stages remain readable | Static list mobile |
| `W-04A` | App segment enters | Actual app still gently reveals; real CTA to verified route | Honest placeholder if missing |
| `W-05A` | Final conversion | Calm wordmark + CTA reveal, not an extra cinematic trailer | Real `/waitlist` link |

**Desktop interaction:** one 2-column editorial chapter may feature hover/focus controlled crop or accessible accordion for explanatory topics. **Mobile:** all content in natural document order, headline visible above fold as possible, imagery re-composed; no tiny multi-column healthcare icons. **QA:** nothing on this page should suggest targeted endocrine conditions are universally applicable.

## F02. `/men` — HUMAN for Him: ocean-teal editorial world

**Art direction:** deep ocean teal and charcoal, cool neutral skin lighting with restrained teal refraction. Authentic Indian men of varied ages, work and leisure contexts; do not build a steroid/testosterone/abs advertisement. Equal sophistication, information density, interactions and conversion emphasis to `/women`.

**Section architecture:**
- `M-HERO` editorial portrait hero, label `HUMAN FOR HIM`, working line “Go beyond what you can see.” Explain intended preventive-health journey in development. Waitlist CTA.
- `M-01` “There is more to your health than how you feel.” Daily care and self-knowledge, without fear.
- `M-02` reflective three-beat information narrative: relevant context, understandable information, meaningful follow-up; no unverified prescriptions or panels.
- `M-03` shared connected six-stage journey in a **different layout** from the women's and homepage journey, e.g. an elegant horizontal→vertical line adapted for mobile.
- `M-04` honest prototype invitation when actual app supports this representation, else truthful in-development state.
- `M-05` waitlist and planned pilot qualification.

| ID | Section/trigger | Specific animation | Interaction / fallback |
|---|---|---|---|
| `M-01A` | Hero load | Cool directional highlight subtly reveals separate new portrait from charcoal to ocean teal | Poster mobile |
| `M-01B` | Hero +0.25s | Serif accent word appears after strong sans heading; CTA appears with short delay | Immediate if reduced |
| `M-02A` | Context section 80% | Editorial image lineMask or crop from left; text enters on opposite side | Stable reading order |
| `M-02B` | Theme groups entering | A short fine teal line moves between 3 **textual themes**, not numerical outputs | Full static list |
| `M-03A` | Journey section | Neutral-to-teal path draws 6 connected stages using SVG stroke | No pin on mobile |
| `M-03B` | Hover/focus step | Accessible detail highlight, preserves all labels | Keyboard/touch |
| `M-04A` | App section | Verified real app screen/crop slides up <=20px; external link exact | Placeholder if unavailable |
| `M-05A` | CTA enters | Quiet teal glow settles behind clear waitlist button | No misleading promises |

**Parity test:** screenshot `/women` and `/men` side by side. Both routes must feel equally original, premium and helpful; neither can become a thin three-card page while the other has rich effects. Their colour worlds differentiate them but do not define medical eligibility.

## F03. `/about` — verified story only

**Purpose:** tell HUMAN's philosophy, why ongoing understanding matters, what the team intends to build and what is still being developed. Founder bios, ages, qualifications, origin stories or milestones require *explicit verified founder-provided copy*. Do not infer from unrelated past work, personal memories or archive drafts. Reserve an elegant editorial component for founder story, but if not supplied, use a clearly honest message such as `Our story is still being written — more about the people building HUMAN will be shared soon.` Do not create invented photos labelled founders.

**Sections:** `AB-HERO` mission: “Health is more than a moment in time.” (WORKING, editable); `AB-01` What we believe: understanding/continuity/individual context; `AB-02` What we're building: six-stage aspiration; `AB-03` What is happening now: in development, planned first pilot Delhi NCR, waitlist across India; `AB-04` founders/mission space pending genuine content; `AB-05` join waitlist; footer.

| ID | Trigger | Effect | Rule |
|---|---|---|---|
| `AB-01` | Hero ready | Large typographic crop reveal + thin amber line | Short <0.8s |
| `AB-02` | philosophy enters | Two-column statement reveals through soft fade | Not a sales animation |
| `AB-03` | concept pathway enters | Sparse 6-point line animation or static timeline | Honest stage labels |
| `AB-04` | current status enters | Subtle editorial type reveal, **no fake countdown** | Real development state |
| `AB-05` | final CTA enters | Brand line and waitlist link | Clear functionality |

## F04. `/faq` — genuinely useful, accurate and accessible

**Purpose:** quick real answers. No unnecessary cinematic scrolling; prioritize readable questions with clearly actionable links.

**Working FAQ questions and safe factual answer directions:**
1. **What is HUMAN?** An India-focused preventive-health membership concept currently being developed; intended connected TEST→UNDERSTAND→ACT→TRACK→RETEST→IMPROVE journey.
2. **Is HUMAN available yet?** No; in prelaunch development; joining interest list does not start care.
3. **Where will HUMAN launch?** First pilot planned in Delhi NCR, subject to change; interest across India.
4. **Can I join from anywhere in India?** Yes, to express interest; availability of eventual services is not guaranteed.
5. **Does joining the waitlist guarantee membership or a slot?** No, it registers interest only.
6. **How much will it cost?** Pricing is not final and no memberships are on sale.
7. **What tests or medical services are included?** Final testing, clinician oversight, eligibility and scope are still being developed; no specific universal panel promised.
8. **Is this medical advice or a diagnosis service?** The site describes a planned concept, not individualized medical advice. Contact licensed professionals for personal care.
9. **Is the app ready?** A prototype is under development; any preview is illustrative and may change.
10. **What information is collected to express interest?** Only approved waitlist fields, subject to reviewed privacy notice and operational consent when live; no health information requested in initial flow.
11. **Will I receive updates?** Only if the appropriate optional marketing consent is explicitly chosen, and only after mailing capability is actually implemented/approved. Do not promise automatic email.
12. **How can I contact HUMAN?** Show only verified/approved business email or a working contact route.

**Components:** category eyebrow, sensible search input only if implemented to truly filter results, 12 `<details>` or accessible disclosure buttons, visible answer content, links to waitlist and legal pages, empty search state if search built, ability to expand one or multiple without focus loss. Use actual `<details><summary>` if robust; avoid custom animated dropdown with incorrect aria-expanded. `FAQPage` JSON-LD only if SEO rules and actual displayed content support it; no fake authority schema.

| ID | Trigger | Effect | Rule |
|---|---|---|---|
| `FAQ-01` | Hero entering | Minimal type fade, no full-viewport blocking animation | Information first |
| `FAQ-02` | FAQ row hover/focus | Underline/arrow rotate <=90deg over 150–200ms | Equivalent for keyboard |
| `FAQ-03` | Disclosure open/close | Answer expands with restrained 160–250ms transition; instant if reduced | No clipped text or jump |
| `FAQ-04` | Search typing if implemented | Immediate accessible filter and count update, no network request | Client-only, no analytics of query |
| `FAQ-05` | bottom CTA enters | Simple reveal and real waitlist link | No fake sticky CTA |

## F05. `/privacy`, `/terms`, `/medical-disclaimer` — legal review stage

**These are launch prerequisites for actual data collection, not license to hallucinate legal notices.** Build readable, accessible routes and a content-review pipeline. If legal text is not signed off, render a clear staging indicator such as “Draft — not approved for public launch”, while deployment/data collection stays blocked. Do not publish a made-up legally binding agreement. Coordinate with appropriate legal/privacy professionals for final copy.

`/privacy` content map: data controller identity **verified**, purposes, collected field categories, optional communications choices, sharing/processor relationships **verified**, storage/security policy **verified**, retention/erasure method **verified**, contact address **verified**, rights and complaint process as legally required after counsel review. Do not invent retention durations, security certifications, processor names or assurances.

`/terms` content map: definitions and development-stage limitations, site access, permitted use, ownership/licensing, external prototype boundaries, liability/limitations consistent with applicable law and legal review, contact mechanism.

`/medical-disclaimer` content map: informational prelaunch website vs medical advice, professional guidance, urgent/emergency handling language reviewed by counsel and qualified clinicians, prototype demonstrations illustrative, no individualized diagnosis or recommendations.

**Interaction:** legal content in uncluttered paper/ink layout, sticky table of contents on wide screens optional with true anchor links, print-friendly styling, clear updated date only when actual review/publish date is known. `LEG-01` headings/references appear without animation; `LEG-02` TOC active location uses IntersectionObserver with no forced scroll; `LEG-03` links have focus/hover states. Avoid theatrical scroll masking on legal text.

## F06. Research questionnaire — separate workstream, not waitlist step

Keep research form and its backend completely separate. Do not merge consent, results, analytics or datasets with waitlist registrations. If `/research` exists, it must use an approved survey schema and required research consent, **not** inherit arbitrary older fields. Possible research topics in older briefs include general motivation, prior testing, understanding reports and demographics, but final question wording and data workflow await approval. Until then, do not create a public active form collecting health information. Only build a separate staging route/redirect if instructed. Design may share brand tokens but distinct consent and success behavior.

## F07. Later pages — do not build from assumptions

- `/science`: only after relevant clinical principles, sources, medical reviewers and claim boundaries are verified; never fabricate citations.
- `/partners`: only after verified partner strategy/contact and factual partnership status.
- `/memberships`: only after pricing, deliverables, geography, medical process and purchase terms are decided.
- `/app`: build only if actual supplied app prototype warrants a dedicated full experience page (see Part H). Do not create a fake interactive mock to justify a route.
- `404`: a simple dark editorial page with “This page isn't here.” and functional Home/Waitlist links; subtle type reveal `404-01` <0.5s, static fallback.

---

# PART G — `/waitlist`: FIVE CINEMATIC CHAPTERS, EXACT FORM LOGIC

## G00. The approved experience — hard rules

The waitlist is a **separate full-screen cinematic chapter journey**. It is **NOT** a permanent left-image/right-form split and **NOT** five data forms. The approved sequence is:

**00 Welcome → 01 You → 02 Your Location → 03 Stay Connected → 04 Success**.

Only chapters 01, 02 and 03 are **registration steps 1/3, 2/3, 3/3**. Welcome and Success do not count as data steps. The user must be able to move backward without losing data, correct individual fields, use the browser history where supported, navigate with keyboard and complete without waiting for art-direction transitions. Mobile reflows with keyboard and uses natural scrolling when screen content is taller than viewport; do not enforce exact height.

**Shared chrome:** HUMAN logo linked home, close/back to home clearly labelled, step progress labels for form steps, accessible Back/Continue controls, logical tab order, concise error messages. Each chapter uses a **different editorial photo / different Indian subject** rather than repeating the same man and woman in every frame. Avoid imply pictured people are actual customers. Keep form on a solid or translucent high-contrast UI surface, not directly on busy photo.

## G01. Chapter 00 / Welcome (`WL0-01` to `WL0-06`)

**Content:** Eyebrow `THE HUMAN WAITLIST`. Working headline **YOUR HEALTH.** / *Beyond what you can see.* Supporting copy: “We're building a more considered way to understand and manage your health — from relevant testing and clearer information to meaningful follow-through.” Qualification “For people across India. First pilot planned in Delhi NCR.” Reassurance “A few details. No medical information required.” Primary button `BEGIN YOUR REGISTRATION`.

**Visual:** dark charcoal luxury editorial composition with Indian woman and man or varied genuine portraits, controlled amber edge, one translucent scientific material; does not need duplicate the homepage hero image. Hierarchy intentionally centered/offset as art direction permits; CTA clearly visible.

| ID | Trigger | Effect | Logic |
|---|---|---|---|
| `WL0-01` | route enter | Quiet dark exposure reveal 500–750ms | Don't block begin button |
| `WL0-02` | +0.2s | Eyebrow/heading lineMask 600–750ms | Real HTML |
| `WL0-03` | +0.4s | Short support text fades/rises | No excessive delay |
| `WL0-04` | idle ambient | Gentle 3–5s material light shift if performant | Poster if reduced |
| `WL0-05` | click Begin | Form state advances to Chapter 01; dark-to-paper/garnet restrained crossfade 350–500ms | No data save/network |
| `WL0-06` | back/home | Navigate `/` without abandoning invisible stored PII | Never silently submit |

## G02. Chapter 01 / You (`WL1-01` to `WL1-09`)

**Content:** eyebrow `01 · A LITTLE ABOUT YOU`; heading **LET'S START** / *with you.* Support “We'd love to know who's joining us on this journey.” Fields **Full name** required, **Email address** required. Primary `CONTINUE`; secondary `BACK` to Welcome.

**Layout:** warmer editorial environment (ivory/card space or muted charcoal with ivory form), photograph of different authentic Indian adult; asymmetrical type/portrait composition but high legibility. Explicit visible labels above fields, helpful input autofill. Avoid an overbearing floating image that hides form.

| ID | Trigger | Effect | Logic |
|---|---|---|---|
| `WL1-01` | enter from Welcome | Background settles charcoal→paper or nuanced warm neutral 350–500ms | Focus preserved |
| `WL1-02` | enter | Heading rises 10px + fades 450ms | Form fields mount immediately |
| `WL1-03` | enter | Form surface fades in, no bounce | Input immediately tappable |
| `WL1-04` | focus input | Border/accessible outline 120–180ms; label stable | `:focus-visible` |
| `WL1-05` | input invalid on submit/blur as appropriate | Real inline error message appears, margin reserved to avoid layout jump; input aria-invalid | No shake animation |
| `WL1-06` | valid Continue click | Save to in-memory session component state and advance to Chapter 02 | No network request |
| `WL1-07` | invalid Continue click | Stay on You, focus first invalid input, announce error | No animation covering error |
| `WL1-08` | Back click | Return to Welcome while keeping form data in memory within session | Do not clear fields |
| `WL1-09` | reload / accidental navigation | Define explicitly whether staging data persists; prefer no PII persistence by default, with warning on leaving if warranted | No localStorage PII by default |

**Validation:** trim surrounding whitespace, full name nonempty and reasonable length (do not forbid legitimate punctuation/single-word names unnecessarily); email syntactically valid via standards-compatible check and reasonable length; don't falsely claim email address ownership is verified. Provide maxlength where justified and server-side equivalent once backend exists. `autocomplete="name"` and `autocomplete="email"`, `type="email"`, `inputmode="email"` as appropriate. No forced capitalisation or space breaking. Client-side validation helps UX, not security.

## G03. Chapter 02 / Your Location (`WL2-01` to `WL2-09`)

**Content:** eyebrow `02 · WHERE YOU'RE JOINING FROM`; heading **WHERE ARE YOU** / *joining us from?* Support “HUMAN is being built for people across India. We're starting with a pilot planned in Delhi NCR.” Fields City required; Indian State/Union Territory required; WhatsApp number **optional**, with helper explaining no effect on waitlist eligibility. `CONTINUE`, `BACK`.

**Layout:** one quiet geographic contour illustration (abstract, not fake map with fake member pins) and different new editorial model. Colour can shift from warm paper to muted dark-neutral with amber cartographic accents. Form remains accessible.

| ID | Trigger | Effect | Logic |
|---|---|---|---|
| `WL2-01` | enter | Abstract geographic contour line lightly draws 500–700ms | Not geographic data |
| `WL2-02` | enter | Form heading/fields fade in gently | No waiting |
| `WL2-03` | state selector open | Accessible listbox/native select, no fake search unless actually built | Full keyboard/touch |
| `WL2-04` | state selected | Fine accent line and label settle | Preserve selection |
| `WL2-05` | WhatsApp focus | Helper text stays visible and readable | Explicit optional |
| `WL2-06` | invalid city/state | Inline error with aria-describedby; focus first invalid field | Stay put |
| `WL2-07` | valid Continue | Advance Chapter 03; save state in memory | No network |
| `WL2-08` | Back | Return to Chapter 01 with all fields preserved | Correct history |
| `WL2-09` | mobile software keyboard | Form scrolls into safe visible viewport; actions accessible after scrolling | No fixed 100vh trap |

**State/UT selector:** include the current official list of Indian states and union territories, maintained in a local verified dataset, with clear labeling, accessible keyboard handling and no assumption that city must match an external city API. Do not invent exhaustive city autofill. Optional WhatsApp: allow empty; if provided, normalise/display international Indian format with consent-aware validation; do not auto-message or treat the number as consent to marketing.

## G04. Chapter 03 / Stay Connected (`WL3-01` to `WL3-12`)

**Content:** eyebrow `03 · ONE LAST THING`; heading **STAY IN THE LOOP.** / *On your terms.* Summary of values entered with separate `EDIT` actions. Consent 1 required to process registration, with real approved Privacy link; Consent 2 optional (unchecked) for marketing communications. Primary `JOIN THE HUMAN WAITLIST`; Back to Location. The consent wording is working draft and **requires legal review** before public collection.

**Working consent #1:** “I agree that HUMAN can collect and use the information I've provided to administer my waitlist registration, in accordance with its Privacy Notice.” **Required.**

**Working consent #2:** “I'd like to receive updates from HUMAN about its development, launch and membership plans. I understand that I can opt out at any time.” **Optional, unchecked by default.** Declining must not block waitlist registration.

| ID | Trigger | Effect | Logic |
|---|---|---|---|
| `WL3-01` | enter | Composition simplifies, background distractions recede | Consent priority |
| `WL3-02` | heading enters | Calm 450ms type fade, no large cinematic wipe | Immediate function |
| `WL3-03` | summary enters | Rows reveal at once or 50ms stagger, not scrolling columns | Actual values only |
| `WL3-04` | Edit name/email | Navigate back to Chapter 01 with all values intact | Clear context |
| `WL3-05` | Edit city/state/phone | Navigate back to Chapter 02 with all values intact | Clear context |
| `WL3-06` | required checkbox toggle | Subtle checkmark reveal, correct checked state and screen-reader announcement | Never auto-checked |
| `WL3-07` | optional checkbox toggle | Same restrained feedback, starts unchecked | Independent consent |
| `WL3-08` | submit without required consent | Inline error and focus checkbox/group, no transition | No phantom submit |
| `WL3-09` | submit in staging without backend | Explicit `Not accepting registrations yet` / `Preview mode` notice, never fake success | No PII sent anywhere |
| `WL3-10` | valid submit with approved backend | Disable button/spinner + accessible `Submitting` live region; POST exactly once with idempotency | Review required |
| `WL3-11` | server error | Show actionable error, preserve fields and consent; retry only on user action | No infinite retries |
| `WL3-12` | server confirms accepted | Transition to real Success chapter 450–750ms | Requires actual accepted response |

**Summary:** mask optional phone in some display contexts as appropriate; don't expose data to screenshot automation or analytics. No PHI asked. Do not label the consent block with pre-checked default toggles. Clicking a privacy link in a new tab must preserve form safely.

## G05. Chapter 04 / Success (`WL4-01` to `WL4-06`)

**Content:** **You're on the list.** / *Welcome to HUMAN.* Supporting text “Thank you for being interested in what we're building. Something more thoughtful about your health is taking shape.” Confirmation “Your registration has been received.” The last line may appear **only if an approved backend actually accepted the registration**. No fake waitlist number, queue position, promised availability or automated confirmation email unless later approved.

**Visual:** calm charcoal/warm editorial environment with new authentic subject or abstract HUMAN identity, small restrained saffron halo resolving around real HUMAN logotype. Avoid green check-mark alert-card cliché.

| ID | Trigger | Effect | Logic |
|---|---|---|---|
| `WL4-01` | **actual backend accepted event only** | Dim form environment and reveal calm final stage | Hard gate |
| `WL4-02` | +0.1s | Amber accent line resolves around a small dot/wordmark | <=700ms |
| `WL4-03` | +0.25s | Confirmation heading fades in | Screen reader announces |
| `WL4-04` | +0.35s | Confirmation copy appears, link back Home available | No delay to navigation |
| `WL4-05` | error/failure | Never display this chapter; return to actionable error state in Step 03 | Honest status |
| `WL4-06` | screen refresh | Success may be shown only from verifiable accepted state, not a `?success=true` URL | Security |

## G06. Waitlist state machine and backend contract

Design around explicit finite states, not loosely coupled booleans:

`welcome` → `you` → `location` → `consent` → `submitting` → `success` **or** `error`.

- `welcome` initial route: no field values required.
- `you` valid fullName/email to proceed.
- `location` valid city/state; optional phone validated only if present.
- `consent` checked requiredOperationalConsent plus optionalMarketingConsent, edit summary links.
- `submitting` is visible and idempotent, submit button disabled to prevent duplicates.
- `success` only after authoritative successful response from a real approved server; not from simulated Promise or localStorage.
- `error` returns to a recoverable state with preserved data and error message.

**Form data model (planned, review before live):**

```ts
type WaitlistDraft = {
  fullName: string;
  email: string;
  city: string;
  stateOrUT: string;
  whatsappPhone?: string;
  operationalConsent: boolean;
  marketingConsent: boolean;
};

// Only a reviewed backend may accept an actual registration.
// Server should record timestamp, consent version, source and status securely.
type WaitlistSubmissionResult =
  | { status: 'accepted'; registrationId: string }
  | { status: 'duplicate'; userFacingMessage: string }
  | { status: 'rejected'; userFacingMessage: string };
```

The server must validate and sanitise independent of client; rate limit and use bot protection mindful of accessibility; handle duplicate email carefully without leaking other people's registration status; store consent types and version, timestamp and opt-in explicitly; avoid logging PII; encrypt transport, apply least-privilege storage and defined retention/deletion policy after legal/security review; no email automation in V1. User privacy/legal advice needed before live launch. Do not hard-code Google Sheet or unapproved Apps Script URL as backend. No analytics PII and no third-party AI prompts containing entered values.

**Staging mode requirements:** Use a visibly labelled `Preview — registrations are not being accepted yet` state whenever the secure backend isn't approved. Allow user to experience chapters/validation with dummy values; keep final action non-submitting, and no believable success or “You're registered” confirmation. Internal automated tests can simulate an accepted response in a clearly labeled test fixture, not visible as a public successful real signup.

**Analytics only after approved configuration:** page view, begin registration, step completion, validation error category (not value), submitted/success counts from verified backend. No names/emails/phone or research answers in events.

## G07. Mobile, keyboard and validation QA for waitlist

Test widths 360x800, 390x844, 768x1024, landscape mobile. Use actual input keyboard behavior when tooling permits; ensure text and CTA remain visible while keyboard opens; allow natural scroll; avoid bottom-fixed buttons covering last field. `Back` preserves values, `Edit` returns to correct stage and then back to summary, browser Back behaves sensibly. On invalid submit focus first invalid and announce error; inputs have labels, error messages, aria-invalid and autocomplete. Check screen-reader reading order, required vs optional consent, checkboxes not prechecked and submit disabled/staging. Refresh should not leak stored personal information. No abandoned iframe or video playing behind form. Respect `prefers-reduced-motion` and `prefers-reduced-data` where supported.

---
# PART H — REAL APP PROTOTYPE INTEGRATION (FOLDER WILL BE SUPPLIED)

## H00. Non-negotiable purpose

The founder will share **the actual existing HUMAN app prototype folder**. That app is a real source artifact whose contents may include working UI, screen transitions, mock users, placeholder medical data and/or outdated designs. Your duty is to **inspect and integrate faithfully**, not invent functionality, clone fake screenshots, blindly iframe something, or rewrite the app's data model to suit a website marketing mockup.

**Before the folder arrives:** implement the homepage section architecture with a beautifully designed, honest placeholder labeled `Prototype preview — assets pending`, a verified waitlist link and documentation explaining what to supply. Do **not** claim completed app integration. An optional old URL (`https://humanapp-1.edgeone.dev/`) appeared in archival plans but **is not guaranteed current**. Check accessibility, ownership, privacy and content before linking or embedding.

**When the folder is supplied:** immediately perform the following intake without asking redundant questions:

1. Locate and read the precise provided folder or ZIP; do not infer it from a similarly named directory. Create a working copy, preserve original and note its checksum/source.
2. Inventory framework (React, Next, Astro, Vue, static HTML, etc.), routes, dependencies, package scripts, build mechanism, configured public base path, environments, dev/prod API endpoints, authentication and data stores.
3. Run build/lint/typechecks where safe. Start the app locally and inspect actual views via browser; record available screens and navigation with screenshots. Don't execute untrusted install scripts blindly; inspect scripts first.
4. Identify **fictional health data, fake members, health scores and placeholder credentials**. Prevent their appearance as actual real-user data; explicitly label them as illustrative. Confirm whether demo requires auth and whether demo login can be publicly exposed (default **no**).
5. Identify assets and terms of use, graphics/fonts and image rights. Check whether any user PII, test passwords or secrets are present; never commit/print or send them to cloud tools.
6. Compare actual app UI to HUMAN's current brand direction. The marketing website may visually frame the app without forcing an unsafe or destructive CSS rewrite. Record deliberate design differences and modernization options.
7. Produce `docs/APP-PROTOTYPE-AUDIT.md` with a route/screen inventory, functioning actions, mock vs real states, security issues, open blockers and recommended presentation.
8. Integrate only **verified screens/functions** into homepage preview; do not claim any backend endpoints are available if only mocked.

## H01. Integration decision matrix — choose based on actual evidence

**Option A — Screen preview + direct open (safest default):** use actual screenshots from locally running prototype, cropped and optimized, inside a clean device/screen composition with labels; provide `Explore the prototype` link only if actual running URL verified. This preserves performance, avoids cross-origin framing restrictions and lets marketing storytelling stay intact. Usually choose this first.

**Option B — Controlled interactive inline module:** if source app's screen components can be safely imported and are compatible with website runtime, mount a small isolated **demo-only** interactive experience (not actual medical data). Protect scope and CSS by namespacing; use verified actions only. Keep no hidden external side effects. Document exact imported files and update mechanism.

**Option C — iframe embed:** only if the app is hosted safely, intentionally embeddable, origin/trust/headers allow it, performance is acceptable, responsive resizing is reliable, keyboard and focus interactions work, and user/privacy implications have been reviewed. Provide `Open full prototype` fallback. Never disable security headers merely to force an iframe; do not pretend CORS and X-Frame-Options/CSP are the same thing.

**Option D — Dedicated `/app` page:** choose only after actual prototype inspection demonstrates clear usability need, e.g. larger app frame, mobile accessibility or multiple complex screens that cannot be shown clearly inline. If built, link from homepage app section; retain actual app route identity and label demo scope. Don't create `/app` just to pad the sitemap.

**Option E — unavailable/unsafe:** no embed, no fake screens. Present honest placeholder and waitlist CTA. Clearly document blocker.

Choose one or a safe combination based on browser QA; keep a simple maintainable implementation. Avoid copying full app source into the site and silently forking it if linkage/ownership/maintainability matters. If separate projects should stay separate, create a documented build integration or keep deep link to stable hosted prototype.

## H02. Exact app showcase UI elements and interactions

- Section eyebrow `THE HUMAN EXPERIENCE` or `A LOOK AT WHAT WE'RE BUILDING`, with development-status label.
- Title and one short grounded explanatory line describing the **observed** app; never add unverified features such as AI diagnoses or telemedicine.
- App imagery uses a real screen, not a generated mockup. Keep readable at normal scale, no exaggerated 3D rotating phone that obscures the UI.
- If multiple real screens exist, a semantic accessible tab set or simple prev/next viewer cycles through them. Labels come from app's actual named views, not invented feature titles.
- Active tab has a visible underline/border and aria-selected; arrow keys and Home/End as appropriate; focus order predictable; mobile buttons reachable.
- Screen transition is a **short 180–300ms crossfade with <=12px translation**. Don't animate UI's contents independently unless those animations exist in the real prototype.
- If there is a true live demo, offer an explicit `OPEN THE PROTOTYPE` link and open target appropriately. If external, label as such; ensure it is reachable and returns a coherent experience.
- Include small visible label **“Prototype / illustrative data”** whenever example data is visible. Provide a clearer accessible explanation in an adjacent paragraph.
- Never collect or relay real user health information through the marketing page while demoing.
- App screenshot images need descriptive alt such as `Illustrative HUMAN prototype dashboard screen showing [verified visible elements]`; don't mislabel as a diagnosis.
- Error/loading state: if live embed fails, accessible `The preview isn't available right now` with a verified fallback link (or waitlist if no URL). No indefinite spinner.

## H03. App motion and preview interaction QA (`APP-INT-01` to `APP-INT-12`)

| ID | Event | Required action | Pass condition |
|---|---|---|---|
| `APP-INT-01` | file arrives | Inspect actual contents and scripts before executing | Audit documented |
| `APP-INT-02` | app built locally | Capture screenshots of actual real views | Verified manifest |
| `APP-INT-03` | user opens homepage app section | Show honest title + verified screenshot/poster | No fake screen |
| `APP-INT-04` | user changes tab | Display corresponding actual screen with 180–300ms transition | Correct screen/title |
| `APP-INT-05` | keyboard tab navigation | Tab/arrow changes focus/selection properly | Accessible |
| `APP-INT-06` | mobile screen <390 | App frame shrinks/resizes without illegible text; provide separate open | No overflow |
| `APP-INT-07` | demo source unavailable | Static fallback + explicit message | No dead spinner |
| `APP-INT-08` | user selects Explore | Opens correct verified demo URL or internal route | No 404 |
| `APP-INT-09` | screen shows numbers | Data marked illustrative in visible UI | No medical inference |
| `APP-INT-10` | embed selected | Security/framing/browser tests passed | No unsafe header bypass |
| `APP-INT-11` | app build changes | Screenshot/regression check compares screens and output | No silent UI drift |
| `APP-INT-12` | production review | Confirm permission to publicly expose demo and its data | Explicit approval |

**Actual app integration is a blocking dependency for claiming the app section complete.** It is **not** a blocker to building the rest of the website.

---

# PART I — CHATGPT, GEMINI & GOOGLE FLOW: MEDIA PRODUCTION PIPELINE

## I00. The truth about tool access — no pretend connectivity

- **ChatGPT Plus and the OpenAI API are different services.** Claude cannot assume it can access this exact ChatGPT conversation, ChatGPT memory or Plus image-generation allowance through an API.
- Claude in Chrome may have been able to view Gemini and Flow in a **separate browser session**. That does not prove the current Claude Code process has direct browser control or automatically downloaded assets. Verify tool availability before invoking it.
- If a legitimate authorised tool, browser handoff or supplied file enables use of ChatGPT-generated images, use them. Do **not** automatically scrape ChatGPT content, attempt unauthorized cross-service access or request users' ChatGPT passwords. If direct ChatGPT generation is not available, use **provided ChatGPT assets** plus approved Gemini/Flow and code-generated graphics.
- The founder has **Google AI Ultra**; Flow/Gemini usage may consume included credits or be subject to product limits. It is not necessarily free/unlimited. Confirm live model list and generation cost/credits before use, and agree a small total budget once.
- **Never make completion depend on a connector that isn't available.** The site must function with still image fallback and native code animations.

## I01. Media preference hierarchy

For every proposed visual ask in this order:
1. Can this be accomplished by excellent editorial typography/layout alone?
2. Can CSS gradient, blur-free translucent overlay, SVG mask, controlled `clip-path` or lightweight vector path yield superior interactive clarity?
3. Do we already have an approved or usable image asset with correct rights and crop?
4. If needed, can one carefully generated image solve the gap with better art direction?
5. Does it genuinely need moving photoreal footage from Google Flow, or would a static still plus GSAP be more robust?

**Default media allocation:** hero still and optional one ambient Flow loop; Scene 03 optional single Flow reveal; perhaps one secondary short shot on portals or final transition **only if visually justified**. Most sections should be built from typography, real photography, code-driven reveal and restrained SVG, not multiple videos.

## I02. Asset classification & required manifest fields

Create `docs/HUMAN-ASSET-MANIFEST.md` or machine-readable equivalent with one entry per asset:

`asset_id | filename | source (supplied/ChatGPT/Gemini/Flow/code) | prompt/origin | creator/rights status | image/video | dimensions | format | duration/fps if video | file bytes | desktop/mobile crop | alt/decorative status | section(s) used | accepted/rejected/candidate | optimized variants | credits/cost if any | reviewer/date`.

No CSS references to missing assets. Verify local filenames with filesystem. Never use random hot-linked images. Preserve original input asset and derived production asset separately where rights allow. Mark AI-generated people as campaign models, not actual members or medical staff.

## I03. Cinematic hero image asset brief — when replacement is genuinely necessary

The hero reference is an atmosphere/layout benchmark, **not** a command to endlessly generate two people standing in black T-shirts. If existing candidate fails in browser, critique exactly *why* first (subject scale, negative space, skin realism, fabric styling, over-orange lights, artificial science graphics, gradient balance). A better image should feature authentic premium editorial portraiture, tactile materials, scientific abstraction integrated as lighting rather than generic giant DNA. Left ~45–50% safe dark area; realistic Indian adults to the right; beautiful controlled facial lighting; quiet charcoal, amber accent; no burned-in text/logo/buttons.

**Generation prompt format**: composition/subject/lighting/material/negative space/realism/strict negatives. Use one candidate and inspect at actual final layout scale. Crop/fix using code where appropriate. Reject any uncanny faces, strange hands, muddy orange glow, artificial glass ribbons in front of faces, corporate standing poses or same model repeated. A longer prompt alone is not a guarantee of higher quality; browser inspection decides.

## I04. Google Flow setup and credit budget

1. If available, open the signed-in Google Flow through the actually supported browser UI. Verify current model, frames/ingredients modes, upload/download controls, resolution, duration, output-count options and current credit costs. Model names and credit rates change; **do not hard-code a previously observed name as guaranteed availability**.
2. Create a **new project `HUMAN Website`**. Do not touch older user projects for YouTube doodle/explainer/ghost videos.
3. Upload only approved, legally usable, text-free stills. Keep source image assets in a separate project folder so subjects can be reused consistently.
4. For a shot, record asset ID, exact generation prompt, reference file, target duration, aspect, intended use, candidate count, current credit estimate and test criteria. Ask for one modest cap covering the batch before consuming included credits.
5. Start with **one output** at the most economical adequate preview setting; inspect the actual motion before additional takes. Do not begin with x4 or repeated blind reruns. Upscale only the chosen working clip if it materially improves hero sharpness.
6. Download local original, verify dimensions/format/length/frames and loop seam with an actual viewer. Image upload and video creation in a browser account do not imply the website repo now has the file. Copy/move it to actual repo path and record provenance.
7. Convert/transcode responsibly to web-friendly MP4 (H.264) and optionally WebM/AV1 when tooling permits, with a static high-quality poster. Preserve rights, avoid automatic uploads elsewhere, inspect compression.
8. Embed video silent, muted/playsinline, and fallback to static still. Pause out of view; don't autoload dozens of clips.

## I05. Exact Flow shot specifications (optional, bounded)

### `FLOW-HERO-01` — premium ambient portrait loop

- **Input:** accepted HUMAN hero still; two believable humans, dark clean left text-safe zone.
- **Aspect:** landscape 16:9; crop to website hero if necessary.
- **Concept:** near-locked cinematic camera, almost imperceptible breathing/eye microexpression, subtle translucent abstract material refraction to far right, warm amber edge light gently modulates. The environment is sculptural and still.
- **Motion:** no walking, nodding, full head turning, talking or rapid camera push; no changes to identities, wardrobe, anatomy, placement; no new objects; no science elements crossing facial features or empty headline area.
- **Working prompt:** “Use the supplied still as the sole visual source. Create a refined luxury-editorial photographic micro-motion loop: essentially locked 16:9 camera, extremely subtle natural breathing only, restrained warm rim light softly pulsing once, a delicate translucent organic material behind the subjects barely refracting. Faces, hair, clothing, anatomy, composition and blank dark left headline area must remain stable and faithful. No cuts, no camera whip, no camera orbit, no particle storms, no floating DNA, no new props, no mouth movement, no text, no graphics, no logos. Finish as close as possible to the opening frame to support a calm loop; preserve a clean still poster fallback.”
- **Acceptance:** first/last frame seam not noticeable under practical testing; people are stable; left safe zone clean; footage not overly bright; sharp at intended breakpoint. **Same start/end image is not a seamless-loop guarantee.** If artifacts persist, ship the still + code ambient gradients instead.

### `FLOW-REVEAL-01` — Scene 03 the invisible-side visual

- **Input:** one accepted abstract material reference, preferably no people.
- **Concept:** a translucent organic membrane in near-black studio environment moves microscopically; a soft narrow internal amber light reveals a second layer inside the material. It conveys a conceptual change from surface to depth; not a literal body scan.
- **Motion:** 1 calm continuous shot, barely drifting camera, very slow refractive optical layer movement, no cuts/letterforms/medical numbers.
- **Working prompt:** “A sophisticated macro-photographic abstract organic membrane suspended against near-black studio darkness, with subtle amber optical transmission moving within a translucent layer. Quiet premium material science aesthetic, restrained realism and gentle depth, no people, no medical instruments, no diagnostic scan, no giant DNA, no particles explosion, no charts, no typography, no scene cuts or rapid motion. The beginning and end should be compositionally close, with a dark negative-space area reserved for live website text.”
- **Acceptance:** doesn't look like generic stock VFX, no obvious CGI smearing, no invasive bright areas behind copy, low file size and easy still fallback. Prefer CSS/SVG if film fails.

### `FLOW-PORTAL-01` (only if truly needed) — transition between colour worlds

- **Input:** independently art-directed dark garnet/teal material texture without people.
- **Concept:** slight refractive colour shift through an abstract surface, perhaps 4–7 seconds. No need to show app or models. This is optional ambience, not an entire page.
- **Acceptance:** meaningful aesthetic enhancement compared with CSS colourMorph; otherwise omit.

## I06. Website video implementation rules

- Use a poster image immediately to preserve LCP. `<video muted playsinline preload="none|metadata">` as appropriate, turn on autoplay only where browser-policy-compliant and test in place. Never add soundtrack/sfx to an autoplaying background.
- `IntersectionObserver` pauses offscreen and resumes on visibility; listen for `visibilitychange`, errors and `canplay`; clean listeners on route changes.
- Only one primary background clip active in visible viewport; stop or suspend when a modal/menu overlays content if helpful.
- Respect `prefers-reduced-motion: reduce`, reduced-data/save-data signals where supported, and mobile performance; use still if necessary.
- Test seamless loop with a visual seam capture. If not seamless, use play-once crossfade to poster or CSS lighting loop; don't permit visible jump every 8 seconds.
- Include MP4 fallback for broad compatibility, and optionally optimized WebM; verify encode/size; no audio track required.
- No additional 4K upscale solely for prestige. Compress assets so mobile load and CLS/LCP targets remain realistic; if footage is > several MB, justify and test measured impact, not guesses.
- Screen recording and generated video cannot substitute for actual HTML buttons, form logic or interaction.

## I07. Visual criticism protocol — no endless generation loop

For each crucial generated asset: place in actual coded composition first, capture screenshot, grade on **(a) authenticity, (b) composition, (c) left/right text safe zone, (d) realistic Indian subjects, (e) restrained amber/teal/garnet lighting, (f) scientific material sophistication, (g) crop resilience, (h) fidelity to the HUMAN brand, (i) visual accessibility, (j) performance**. Specify concrete defects and revise **at most a bounded number of candidate generations within approved credit budget**. Don't call something “premium” just because it has dark tones and glow.

---

# PART J — FRONTEND ARCHITECTURE AND TECHNICAL IMPLEMENTATION

## J01. Choose architecture based on the actual repo

**Retain the existing app framework** unless there is a concrete documented reason to migrate. If starting from an empty project, a defensible lightweight default is Astro + TypeScript + CSS modules/global tokens + GSAP/ScrollTrigger for a few curated sequences. React/Next/Vue are fine when they already exist, but don't rewrite for fashion. Use accessible native semantics before adding UI libraries. Avoid client-side heavyweight shader stacks or untested AI-generated shader code without direct quality gain.

Suggested separation of concerns (adapt filenames to actual framework):

```text
src/
  components/
    site/Header, MobileMenu, Footer, Button, Link, ScrollCue
    media/ResponsiveImage, AmbientVideo, MaterialOverlay
    motion/RevealText, ScrollReveal, SceneTransition, MotionBoundary
    story/Hero, Scene01...Scene08, JourneyPath, HumanPortals
    app-preview/PrototypePreview, ScreenshotTabs, DemoStatus
    waitlist/WaitlistShell, Welcome, YouForm, LocationForm,
             ConsentForm, Success, Progress, Field, FormError
    pages or routes: /, /women, /men, /waitlist, /about, /faq,
                     /privacy, /terms, /medical-disclaimer, /404
  styles/
    tokens.css, typography.css, layout.css, motion.css, globals.css
  data/
    navigation, homepageCopy, faq, statesAndUTs (verified)
  lib/
    motionPreferences, routeState, formValidation, analyticsSafe
  assets (or public/media)/
    posters/, portraits/, abstracts/, videos/, icons/
  tests/
    route.e2e, motion.e2e, waitlist.e2e, accessibility.e2e
  docs/
    HUMAN-BUILD-STATUS.md
    HUMAN-DESIGN-DECISIONS.md
    HUMAN-ASSET-MANIFEST.md
    HUMAN-MOTION-REGISTRY.md
    APP-PROTOTYPE-AUDIT.md or APP_INTEGRATION_PENDING.md
    HUMAN-RELEASE-GATES.md
```

If current framework is Astro or another static framework, define client islands only for needed interactive scenes, form and app preview. Don't hydrate the entire site unnecessarily. Ensure routes work on direct load and refresh; avoid broken relative media paths.

## J02. Motion engine implementation requirements

- Build reusable timeline helpers, not 100 arbitrary inline scroll handlers. IDs used in this prompt should be traceable to components/test registry.
- For GSAP use scoping/context (`gsap.context`), responsive `matchMedia`, ScrollTrigger cleanup, `invalidateOnRefresh` only where needed. Remeasure after fonts/media load; avoid triggering layout thrashing.
- Respect browser native scroll; do not install an additional smooth-scroller by default. If one exists, verify focus/anchor behavior and reduced motion.
- Animations must be reversible or safely reinitialise on reverse scroll; no hidden content after jumping past trigger.
- Avoid animating every individual word; wrap text at paragraph/line level only when visual effect justifies it. Full semantic string stays accessible.
- Use CSS/SVG for organic material and lines; no WebGL until a clear measured benefit justifies cost, accessible fallback and device compatibility.
- Use `will-change` sparingly during animation only; don't permanently promote hundreds of layers.
- Avoid scroll event polling every frame; use requestAnimationFrame for necessary pointer depth only when visible, intersection observers and ScrollTrigger where appropriate.
- Every effect needs source code comment/registry `motionId`, trigger definition, reduced-motion rule, cleanup and test example.

## J03. Responsive breakpoint behavior

**Desktop large 1440–1920:** strong asymmetry, copy left/subject right, 12-column grid, portal dual layout, safe app image framing. Hero faces not cut at top/edges, no dead central gap. Use whitespace intentionally rather than 50% vacant black under a tiny headline.

**Desktop 1024–1280:** adjust columns and display type sizes, reduce complex collage rows, preserve readable hero safe zone; navigation can remain inline if it actually fits.

**Tablet 768–1023:** use explicit recomposition; portrait may shift behind or above text. Disable large scroll pins if touch/viewport height makes content hard to read. App demo stacks screen controls logically.

**Mobile 360–767:** mobile hero may use special crop/poster and copy below/overlay on safe gradient; no face behind text, no video required, mostly static atmospheric layers. Narrative panels scroll naturally; images stack; max width no overflow; hamburger/menu is accessible; waitlist step buttons reachable with keyboard open. Avoid horizontal carousels unless clear user control/accessible fallback.

**Extra small/zoom:** at 200% text zoom and wide accessibility text settings, layouts grow vertically rather than clip. Use `svh`/`dvh` appropriately, safe area insets and stable CTA placement. Portrait crop cannot take priority over readable text. Test pinch/zoom not disabled.

## J04. Performance and network strategy

Target Core Web Vitals on plausible mobile network/hardware: LCP ~2.5s, INP <=200ms, CLS <=0.1 (aspirational even lower); test rather than claim exact scores. Performance should be good before adding optional Flow videos.

- Prioritize hero poster correctly; preload only above-the-fold media/fonts required, don't eagerly load 8 scenes of images and three 4K clips.
- Generate responsive image variants and modern formats; retain fallback for compatibility. Preserve subject crop using `<picture>`/`object-position` or intentional mobile variants.
- Use `font-display: swap/optional` thoughtfully and size-adjust metrics if needed. Avoid large text layout shifts when fonts load.
- Lazy-load below fold media. Correct image width/height or aspect-ratio to prevent CLS.
- Minimize hydrated JS, optimize GSAP usage, remove detached observers; no giant scroll texture video loops on low-end phones.
- If video visually detracts from performance or quality, retain poster. Full media file must be local, compressed, licensed and reachable.
- Use performance budget file, record actual image/video bytes; test 3G/slow 4G where environment permits, simulate video failure and save-data.

## J05. Accessibility contract

Target WCAG 2.2 AA practices and validate objectively:

- Semantic landmarks, skip link, heading levels, labelled buttons/fields, sensible focus order and prominent focus ring. Use `<button>` for actions, `<a>` for navigation.
- Images have meaningful alt only if conveying information; decorative art alt empty and hidden from screen readers. Diagrams have accessible text/list equivalents.
- Contrast on shifting backgrounds must be measured at worst-case video frame; overlay sufficiently dark/opaque to protect text; never rely on colour alone.
- `prefers-reduced-motion` removes scroll pins, scrubbed transformations, parallax and unnecessary autoplay while keeping content/feedback fully functional. Do not merely shorten from 1s to 0.8s.
- Keyboard and switch access for menus, FAQ, form and app preview; visible state and announcement. No hover-only revelations.
- Pointer/touch targets comfortably ~44px, with adequate separation; no tiny invisible hit areas.
- Form validation and submission statuses announced in live regions, no timing-dependent access; controlled focus on errors and stage changes.
- Avoid inaccessible cursor-followers and background audio; user's system/device controls prevail.
- Verify non-JS content reading order. If some enhanced app preview needs JS, provide a truthful static fallback.

## J06. SEO, routes, analytics, privacy

- Unique route titles/descriptions, coherent URLs and canonical only after domain confirmed; truthful Open Graph image; sitemap/robots appropriate for staging vs production.
- Privacy/legal content status visibly reviewed before public launch. `noindex` staging or gated access to incomplete legal drafts, as appropriate to deployment strategy. Do not accidentally expose private in-progress routes as live offers.
- Add basic structured data only from verified organisation/contact facts. Do not claim doctors/health organisations or reviews without evidence.
- No PII in analytics, URLs or logs. Analytics tools, cookies/consent notices and third-party trackers require their own verified privacy basis/implementation review. No hidden social pixels by default.
- No fabricated badge/rank/counters/success events. Waitlist metrics come from a secure verified backend and only after explicit signoff.
- Avoid any auto email or WhatsApp messaging until approved. The optional WhatsApp number is just a field, not consent to contact by itself.

## J07. Testing and security dependencies

- Configure unit tests for validation/state, integration tests for app preview and routes, browser E2E for key journeys and screenshot regression. Prefer repo's existing test stack; if none, Playwright/Vitest may be added with reason.
- Lint/typecheck/build must pass without hiding errors. No fake `npm run test` output or unexecuted claims.
- Check third-party dependencies and browser console warnings; remove stray debug outputs; protect secrets and use `.gitignore` for private app/export folders.
- Inspect actual backend before connecting. Use server-side validation and bot/rate safety when approved. If not approved, submit remains staging-only.
- Ensure no broken external demo URL or hard-coded private device path remains in public markup.

---
# PART K — BUILD PHASES, VISUAL REVIEW AND AUTOMATED QA

## K01. Correct execution order: build progressively, not randomly

**PHASE 0 — REPOSITORY REALITY AUDIT (short, factual; then implement)**
- Identify framework, current routes, asset files, existing homepage, preview, app folder availability, build scripts, auth/backend status and browser tools.
- Verify provided original hero and latest ChatGPT hero candidate are physically present. Verify current quality by rendering them with actual HTML, not by viewing full-size file alone.
- Create status/decision/asset/motion registries. Preserve working code and back up existing uncommitted changes safely; don't force clean Git destructive operations.
- Report only genuine blockers. Do **not** ask founder to choose a technology stack if one is already present and workable.

**PHASE 1 — FIRST CINEMATIC PROOF (mandatory design benchmark)**
- Implement global fonts/tokens, header, hero image positioning, exact headline, support copy, real waitlist CTA, accessible scroll cue and Scene 01 handoff.
- Use the latest existing ChatGPT hero still candidate as an implementation trial, evaluate real screenshots; replace only if justified. Begin with code effects; **do not spend Flow credits before the HTML layout proves visual composition**.
- Test 1440x900, 1280x800, 390x844, 360x800; inspect mid-scroll transition and reduced motion. Fix layout/typography/face crop before moving on.
- Capture `docs/reviews/phase-1-*.png`; mark acceptance test results and actual files changed.
- Then continue to Phase 2 automatically, unless screenshot quality exposes a fundamental art-direction blocker.

**PHASE 2 — COMPLETE HOMEPAGE STORY**
- Implement scenes 01–08 with distinctive layouts and transitions; unique scene images and code/SVG scientific abstraction; no fake data.
- Only pin Scene 03 and Scene 06 if proven smooth, and only on suitable desktop sizes. All content readable independent of pin.
- Add Portal pair, prototype placeholder/real integration slot, final Waitlist CTA and footer.
- Test desktop/mobile end-to-end scroll, fast reverse, route links and reduced-motion static path. Fix overlapping sticky layers, empty gaps and jank.

**PHASE 3 — CORE SEGMENT ROUTES `/women`, `/men`**
- Build garnet and ocean-teal art worlds with equally strong creative quality, factual language and genuine variety of subjects; standalone pages, not copied hero colour swaps.
- Cross-test both routes, primary CTA and navigation parity, mobile accessibility, hover/focus and real copy.

**PHASE 4 — WAITLIST AS A FUNCTIONAL STAGING UX**
- Build Welcome, You, Location, Stay Connected and Success gated by backend response. Test all steps, validation, error states and chapter transitions.
- No live data collection unless founder supplies/approves real backend plus reviewed privacy/consent and explicit launch authorization. Staging must never pretend success.

**PHASE 5 — ABOUT, FAQ, LEGAL DRAFT ROUTES & 404**
- Complete honest, readable `/about`, `/faq`, `/privacy`, `/terms`, `/medical-disclaimer`, 404. Keep pending founder story and legal content clearly pending. Core nav should have no dead links.
- Research questionnaire remains separate; do not activate. Do not create fictitious Science/Partners/Memberships marketing pages.

**PHASE 6 — APP FOLDER HANDOFF (WHEN IT ARRIVES)**
- Audit app prototype as Part H, run actual screens locally, record true state, integrate homepage preview and optionally decide `/app`; no fake screens.
- If folder is not yet provided, record exact missing input and finish other phases; **do not mark app integration complete**.

**PHASE 7 — CINEMATIC FOOTAGE / FINAL MOTION POLISH (ONLY IF IT ADDS VALUE)**
- Once static website is art-directed, optionally use Gemini/Google Flow for **1–3 controlled high-impact shots** within approved credit budget. Install only the strongest results, inspect loop seams/quality, compress and optimize.
- Prefer better scroll choreography over multiplying video assets. Validate motion reduced and mobile fallbacks.

**PHASE 8 — QUALITY, PERFORMANCE, SECURITY AND DELIVERY**
- Run all tests; compare screenshots across sizes; verify color, copy, nav, media failures and waitlist states. Optimize LCP/INP/CLS, accessibility, SEO, legal-readiness tracking.
- Leave clean build, review screenshots, status docs and exact launch blockers. No public deployment unless approved.

Do not interpret phase numbers as permission to abandon a previous phase with unresolved high-severity errors. Finish/verify each phase enough to preserve quality. Working incremental output is better than 12 unfinished routes.

## K02. Mandatory screenshot and viewport matrix

Use actual browser screenshots/screenshare tools available to Claude Code—not merely generated static mockups. At minimum:

| Test viewport | Routes | What to inspect |
|---|---|---|
| 1920×1080 | `/` hero | Subject placement, negative space, over-wide text |
| 1440×900 | `/`, `/women`, `/men`, `/waitlist` | Art direction, typography, transitions, portal detail |
| 1280×800 | all core routes | Header fit, safe crops, compact desktop |
| 1024×768 | `/`, portals, app preview | Layout transition and nav behavior |
| 768×1024 | all core routes | Tablet recompose, no forced pins |
| 390×844 | all core routes | Real mobile composition, hero CTA, waitlist fields |
| 360×800 | all core routes | Narrow phone clipping/overflow, tab/FAQ/form layout |
| 390×844 with zoom/large text | key interactions | 200% text zoom, content not truncated |
| reduced-motion emulation | every route | No sticky traps, poster-only, content visible |
| offline/failed media | hero/app/waitlist | Still fallback, no blank or fake claims |

Save before/after screenshots for critical fixes into `docs/reviews/`. Use filenames with viewport and section rather than dumping arbitrary images. A screenshot is evidence only for what was actually rendered. Include an actionable evaluation: compare mood, text contrast, subject scale, reading order, scroll timing, moving layer overlap, performance and whether the experience feels premium rather than gimmicky.

## K03. Required end-to-end interactive tests — run/record real results

| Test ID | Scenario | Expected behavior |
|---|---|---|
| `E2E-01` | Direct load `/` | Hero/primary CTA visible; no missing assets |
| `E2E-02` | Click logo from interior page | Navigate home, focus/scroll sane |
| `E2E-03` | Click hero waitlist CTA | `/waitlist` Welcome opens |
| `E2E-04` | Click story scroll cue | Arrive Scene 01 without overlay |
| `E2E-05` | Scroll down Scene 02→03 | Controlled reveal, readable headings |
| `E2E-06` | Scroll quickly back upward | Timelines reverse / no blank stuck sections |
| `E2E-07` | Resize while in Scene 03 | Triggers refresh, no pinned whitespace/overlap |
| `E2E-08` | Keyboard Tab through homepage | Every link/action focusable and visible |
| `E2E-09` | Toggle prefers-reduced-motion | All story readable, no pins/videos |
| `E2E-10` | Activate For Her portal | Navigate `/women`; correct garnet treatment |
| `E2E-11` | Activate For Him portal | Navigate `/men`; correct ocean teal treatment |
| `E2E-12` | Mobile menu open/close | Focus trap/return, ESC/outside click, no scroll bleed |
| `E2E-13` | App folder absent | Honest missing prototype state; no fake screen |
| `E2E-14` | App folder supplied | Verified real screenshot + actual functioning link |
| `E2E-15` | Failure to load optional video | Poster remains; site usable |
| `E2E-16` | Navigate to FAQ and open question | Proper answer/focus and 200ms-ish movement |
| `E2E-17` | Navigate to About | No fabricated founder story |
| `E2E-18` | Link to legal from waitlist | Real draft route; no 404 |
| `E2E-19` | Waitlist Welcome Begin | Moves to You 1/3 |
| `E2E-20` | You Continue blank | Proper field errors, no progress |
| `E2E-21` | You invalid email | Inline error, focus appropriately |
| `E2E-22` | You valid fields | Moves Location 2/3 |
| `E2E-23` | Location blank required fields | Errors, no progress |
| `E2E-24` | Location with blank optional WhatsApp | Valid, may continue |
| `E2E-25` | Location invalid entered phone | Error unless left blank |
| `E2E-26` | Move Back across steps | Existing values preserved in session |
| `E2E-27` | Consent page summary Edit | Returns to correct input step, values preserved |
| `E2E-28` | Required consent unchecked | No submission; clear error |
| `E2E-29` | Optional marketing consent unchecked | Doesn't block valid registration (once backend approved) |
| `E2E-30` | Staging submit with no backend | Explicit non-live status, never fake Success |
| `E2E-31` | Approved backend accepted test fixture | Success shown from authoritative accepted response only |
| `E2E-32` | Approved backend error test fixture | Safe recoverable error, values preserved |
| `E2E-33` | Double click submit | Only one intended backend call; duplicate guarded |
| `E2E-34` | Refresh on Success URL forgery | Doesn't fabricate accepted registration |
| `E2E-35` | Mobile keyboard on waitlist | Next/Back reachable, fields not behind fixed viewport |
| `E2E-36` | Reduced bandwidth | Above-fold content and CTAs remain useful |
| `E2E-37` | JavaScript unavailable | Homepage copy and key navigation available |
| `E2E-38` | Route direct reload | No blank page or client routing error |
| `E2E-39` | Browser Back/Forward | No broken overlay or lost navigation state beyond documented form rule |
| `E2E-40` | Console/build/lint/typecheck | No unaddressed severe errors |
| `E2E-41` | Tab navigation in app preview | Real screen labels and accessible tab behavior |
| `E2E-42` | Mobile portal links | Equal visual weight, tappable full content |
| `E2E-43` | Final homepage CTA | `/waitlist` correct initial state |
| `E2E-44` | Alt/readability with images off | Story semantics survive |
| `E2E-45` | Captured analytics events | Never contain names/emails/phones/form values |
| `E2E-46` | Unverified app external link | Hidden/disabled with honest fallback |
| `E2E-47` | 404 on unrecognized route | Branded recovery, not app crash |
| `E2E-48` | Device pixel ratio/high zoom | Sharp relevant assets / no broken layouts |
| `E2E-49` | Chrome/Safari browser where feasible | Media and motion graceful fallback |
| `E2E-50` | No new paid services approval | Workflow proceeds locally, pauses costs |

For every test report **PASS / FAIL / BLOCKED (reason)**, actual commands/tool and evidence path. Do not use PASS for a test that was not executed. `BLOCKED` is honest and has a next action.

## K04. Visual QA grading (not solely numerical Lighthouse)

For each major route and scene, self-critique:

1. **Art direction:** does it feel intentionally authored, not templated?
2. **Humanity:** do subjects feel real, diverse and contextually relevant? No artificial plastic skin or generic posed black T-shirt duo repeated?
3. **Composition:** clear headline, negative space, real focal point, comfortable crop/spacing?
4. **Hierarchy:** can someone understand the message without motion or scrolling for minutes?
5. **Motion purpose:** does effect reveal meaning or clarify sequence? If not remove it.
6. **Interaction:** is every visible CTA, tab, disclosure, gallery control and form input functional?
7. **Coherence:** does each scene transition look like part of one story rather than 13 separate prompts?
8. **Factual truth:** no invented health values, statistics, testimonials, service availability or medical claims?
9. **Performance:** smooth enough on modest mobile, poster fallback, optimized resources?
10. **Accessibility:** reduced motion, focus visibility, contrast, semantic order, keyboard/touch reachability?

**Correction loop:** Capture actual screenshot → list top 3 measurable aesthetic or functional defects → edit implementation → capture again → mark improved/remaining → advance. If an AI still image is weak, fix art direction/crop before automatically generating more. If the site looks like generic black-and-amber healthcare, the quality bar was not met even if all pages render.

## K05. Explicit severity classification & stop conditions

**Critical defects — fix before phase acceptance:** broken main navigation, exposed secret or user data, fake waitlist success, wrong headline, unreadable text/face collision, app misrepresentation, console crash, scroll trap, severe mobile overflow, inaccessible form.  
**Major defects — fix before final delivery:** janky pinned scroll, video seam, repetitive template layout, missing focus/contrast, long unintentional blank space, unoptimized hero file causing severe loading, unverified founder/medical copy.  
**Minor defects — document, batch and fix:** tiny visual alignment, subtle easing adjustment, optional decorative material not perfectly loopable (remove it), nonblocking SEO refinement.

A tool limitation cannot justify making up success. If a critical step is impossible without supplied app folder or reviewed legal/backend, **build safe other work, document the blocker and show actual current result**.

---

# PART L — DELIVERABLES, DECISION GATES, SOURCE OF TRUTH

## L01. Files Claude must leave in the repo

- Complete working website source with all **core** routes and responsive components.
- All accepted local assets and optimized derivatives under repo's media folder, with verifiable paths.
- `docs/HUMAN-BUILD-STATUS.md`: dated progress, actual changed files, commands executed, screenshots, current next task.
- `docs/HUMAN-DESIGN-DECISIONS.md`: locked vs working vs conditional decisions, no stale prompt ambiguity.
- `docs/HUMAN-ASSET-MANIFEST.md`: every externally sourced/generated visual, rights/provenance/optimization and acceptance.
- `docs/HUMAN-MOTION-REGISTRY.md`: IDs from D/E/F/G/H sections, implemented component and validation state.
- `docs/HUMAN-RELEASE-GATES.md`: legal/backend/app/claims/asset rights checks, with explicitly blocked public collection if unmet.
- `docs/APP-PROTOTYPE-AUDIT.md` if folder supplied; otherwise `docs/APP_INTEGRATION_PENDING.md` describing how to add folder.
- `docs/reviews/`: representative actual viewport screenshots for each major phase, organized not random.
- Commands/README showing how to install dependencies, start dev server, build production and run tests on user's own computer; no secret-containing commands.
- Working route-level functional/accessibility tests as much as tool/environment allows; honest test report.

## L02. Final definition of done by area

| Area | Completion requirement |
|---|---|
| Homepage | Exact locked headline, full eight-scene story, portals, app section, final CTA, coherent motion and responsive layout |
| Hero | Actually art-directed with approved/candidate image, good crop desktop/mobile, real text and CTA, scene handoff |
| Scroll effects | Purposeful reversible effect sequence with ID registry, disabled where unsafe/reduced |
| Her/Him | Distinct full pages, equal quality, careful truthful copy, real CTA links |
| Waitlist | Five full-screen chapters and three form steps; validation/edit/back; no false live success |
| App | Honest placeholder until actual folder; after supply audited real screens and verified preview/link |
| About/FAQ | Useful honest content, no fabricated founder or medical details |
| Legal | Routes clearly marked review-pending, blocked live data collection until approved |
| Technical | Builds and routes work; semantic accessibility; performant fallback; no accidental secret leaks |
| QA | Browser screenshots/tests actually executed and corrections made, failures documented |
| Public launch | **Not included without explicit authorisation**; deployment and live signup are separate signoffs |

## L03. Founder-facing progress reporting (brief, factual)

After each meaningful phase, communicate:
1. **Built:** exact routes/components and changed source files.
2. **Visible:** where preview runs, filenames of desktop/mobile screenshots and what they show.
3. **Verified:** actual commands/tests run, viewport sizes and results.
4. **Fixed:** 1–3 defects spotted and corrected.
5. **Still pending:** app folder, legal review, backend, clip budget or other real blocker.
6. **Next:** next phase continuing autonomously. Do not return to endless conceptual planning.

Never claim a preview URL, generated video, user signup, app screen or test result without real evidence. If environment has a session/output limit, update status file and leave a deterministic resumption instruction.

## L04. Founder input should be minimal and only where truly required

Routine design choices, section composition, code, timing tuning, media optimization, layout bugs and tests are YOUR responsibility. Ask only for:
- The actual app prototype folder when the integration milestone is reached, if not already shared.
- A missing approved brand asset that cannot be legally replaced or recreated.
- Verified founder story/bios if About needs truthful personal detail.
- Legal review/privacy/backend authorization before real collection.
- Permission/cap for nontrivial Flow/Ultra credit spending, new API charges and publishing.

Do not ask for design approval on every margin, border, text fade or clip. Use the locked creative direction and objective screenshot testing. If there is a meaningful visual disagreement, show two rendered options, recommend one and proceed only when decision materially changes brand identity.

## L05. Immediate implementation command to follow

**BEGIN NOW.**

1. Inspect the existing HUMAN project and handoff kit. Confirm actual capabilities and source files in no more than 10 factual lines.
2. Preserve working files and note actual repo state. Create the required documentation/checklist files.
3. Implement **Hero + Scene 01** with real HTML headline, the supplied current hero image candidate, responsive editorial layout, functional navbar/CTA and motion IDs `G-01` through `G-07`, `H-01` through `H-10`, and `T-01` through `T-04` as relevant.
4. Start the site, screenshot it at 1440x900 and 390x844 plus the hero→Scene01 mid-scroll, check reduced motion, correct the real defects.
5. Continue into the eight-scene homepage and core routes following Parts E–G, and incorporate the supplied app folder later following Part H.
6. Only create Google Flow assets where the actual built website benefits, only through available authorized tools and within an approved credit budget. Don't require the founder to reconnect ChatGPT.
7. Report actual progress and continue through the phases. **Do not stop after writing another plan or master prompt. Build the website.**

---

# END OF HUMAN MASTER PROMPT V2.0

**Integrity rule:** This specification is intentionally detailed but cannot eliminate every bug or resolve information that is not yet provided. Where facts, app files, licensing or security details are missing, implement only what can be truthfully implemented, document the conditional part and keep progressing. Excellent work means **working, tested and honest**, not merely visually elaborate.
