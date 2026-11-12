# HUMAN — design decisions and decision register

Status words: **LOCKED** (founder decision), **WORKING** (editable), **CONDITIONAL**, **PENDING REVIEW**, **REJECTED**.

| Decision | Status | Note |
|---|---|---|
| Hero headline `HOW WELL DO YOU` / *know your health?* | LOCKED | Exact text, case and italic are asserted by test E2E-01 |
| Dark hero, eight scenes in order, garnet/teal split, five waitlist chapters | LOCKED | |
| India-wide interest; first pilot **planned** for Delhi NCR | LOCKED | Always worded as a plan. "Early 2027" is deliberately not shown on the site. |
| All body copy, eyebrows, microcopy | WORKING | Scene copy follows the kit with minimal edits |
| Scene 02→03 transition line appears once (end of Scene 02) | WORKING | Kit asked for the duplicate to be removed |
| Scene 04 copy | PENDING REVIEW | Needs medical review before public marketing |
| Consent wording on `/waitlist` | PENDING REVIEW | Legal review; labelled as draft on the page |
| Privacy / Terms / Medical disclaimer | PENDING REVIEW | Outlines only; no invented legal text, no dates |
| Sans typeface: Hanken Grotesk in place of General Sans | WORKING | Fontshare unreachable from the build environment. Swap by replacing one import and `--sans`. |
| Tokens from C02; `--amber-deep` darkened to `#8a5f0a` | WORKING | Original failed contrast as small text on paper |
| No people photography beyond the hero | CONDITIONAL | No stock, no invented faces. Scenes 01, 02, 07 are typographic/line-art by design until approved images exist. |
| Hero duo not reused anywhere else | LOCKED (kit) | Portals, Her/Him, waitlist use abstract material art |
| Header is always dark once scrolled | WORKING | Avoids mixed-contrast states over light sections |
| Motion: CSS + IntersectionObserver + one rAF scroll variable | WORKING | No GSAP, no WebGL, no smooth-scroll library |
| One pin only (Scene 03, desktop ≥1024×640) | WORKING | Scene 06 needs no pin |
| Hero stacked (image band above copy) below 1024px | WORKING | Text never sits on a face |
| Mobile hero poster is a separate crop | WORKING | 800×941 from the candidate |
| `/app` route | CONDITIONAL | Not built. Decide after the real folder is audited. |
| `/research`, `/science`, `/partners`, `/memberships` | REJECTED for this release | Not built, not linked |
| Counters, testimonials, prices, partner logos, countdowns, "limited spots" | REJECTED | Test CLAIMS scans every route |
| Analytics, cookies, third-party scripts or fonts | REJECTED for now | Test NO-TRACKERS confirms zero external requests |
| Waitlist draft kept in memory only; reload starts over | WORKING | No URL, storage or log ever holds a form value (test PII) |
| Whole site `noindex` + `robots.txt` disallow | WORKING | Staging; lift only at launch gate |
| Old URL `humanapp-1.edgeone.dev` | REJECTED | Unverified; not linked or embedded |
