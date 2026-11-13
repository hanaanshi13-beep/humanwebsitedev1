# HUMAN — asset manifest

| asset_id | file | source | rights | type / size | used in | status |
|---|---|---|---|---|---|---|
| HERO-CANDIDATE-SRC | `HUMAN-Claude-Master-V3/assets/HUMAN-CHATGPT-HERO-CANDIDATE.chat-upload.webp` | Founder-supplied (ChatGPT generation), received as a compressed chat upload | Founder to confirm; AI-generated campaign models, not members or staff | image 1672×941 | source only | CANDIDATE — not confirmed as final |
| HERO-DESKTOP-POSTER | `src/assets/hero/hero-desktop-1672.webp` (58 KB), `hero-desktop-1100.webp` (25 KB) | Derived from HERO-CANDIDATE-SRC | as above | image 16:9 | `/` hero ≥600px. `object-position` 78% 22% (72% below 1280px; 80% 20% on tablet band) | CANDIDATE |
| HERO-MOBILE-POSTER | `src/assets/hero/hero-mobile-800.webp` (47 KB) | Crop x 850–1650 of the source | as above | image 800×941 | `/` hero <600px, `object-position` 50% 10% | CANDIDATE |
| HERO-REFERENCE | `HUMAN-Claude-Master-V3/assets/HUMAN-ORIGINAL-APPROVED-REFERENCE.chat-upload.webp` | Founder-supplied mood reference with the old headline baked in | Founder | image 1536×1024 | Not used on the site | REFERENCE ONLY |
| MATERIAL-ART | `src/components/Material.astro` | Code (inline SVG) | Original | vector | Scene 03, 08, portals, CTAs, Her/Him, waitlist | ACCEPTED |
| REVEAL-LENS-LAYERS | `src/components/home/Scene03.astro` | Code (CSS + SVG) | Original | vector | Scene 03 | ACCEPTED |
| REPORT-CLARITY-ART | `src/components/home/Scene05.astro` | Code (HTML/CSS) | Original | — | Scene 05 | ACCEPTED |
| THREAD-PATH | `src/components/home/Scene06.astro` | Code (HTML/CSS) | Original | — | Scene 06 | ACCEPTED |
| FONT-SANS | `@fontsource-variable/hanken-grotesk` | npm | SIL OFL 1.1 | woff2 | all | SUBSTITUTE for General Sans |
| FONT-SERIF | `@fontsource/instrument-serif` | npm | SIL OFL 1.1 | woff2 | all | ACCEPTED |

**Known gaps**
- The original PNGs listed in the kit manifest (1.8 MB and 2.7 MB) did not arrive; only chat-compressed copies did. Replace `HERO-CANDIDATE-SRC` with the original and regenerate the three derivatives for sharper 1920px and retina output.
- No people photography exists for Scenes 01, 02, 07, the portals, `/women`, `/men` or the waitlist chapters. Nothing was generated and **no credits were spent**.
- No video. `FLOW-HERO-01`, `FLOW-REVEAL-01`, `FLOW-PORTAL-01`: not started.
- All images are decorative (`alt=""`); every word on the site is real HTML.

## Campaign photographs received 2026-11-12 (founder-generated, via chat upload)

All ten are AI-generated images of fictional models, supplied by the founders. Generation tool and image model: **not yet stated by the founders**. Files arrived as chat uploads, so they may be compressed copies; originals requested. Status of all ten: INTEGRATED, awaiting founder sign-off. Flow video: dropped by founder decision.

| File (`src/assets/human/`) | Pixels | Used in | Notes |
|---|---|---|---|
| `portal-her.jpg` | 896×1200 | Homepage Her portal; /women hero | Matches brief. Small for its 636×738 slot on high-density screens |
| `portal-him.jpg` | 1493×2000 | Homepage Him portal; /men hero | Framed closer than the Her portrait; `object-position: 42% 12%` |
| `care-walk.jpg` | 1264×848 | Scene 01, top frame | Matches brief |
| `care-meal.jpg` | 928×1152 | Scene 01, lower-left | Departs from brief (woman at a table, not a top-down still life) |
| `care-rest.jpg` | 928×1152 | Scene 01, lower-right | Matches brief |
| `progress-stride.jpg` | 928×1152 | Scene 02 | Replaced 13 Nov: seated on stairs in a matching activewear set; departs from brief (fitness-fashion pose), flagged to founders |
| `feeling-fine.jpg` | 1264×848 | Scene 04 | Matches brief |
| `journey-professional.jpg` | 928×1152 | Scene 07, small frame | Matches brief |
| `journey-parent.jpg` | 1264×848 | Scene 07, upper-right | Replaced 13 Nov: father carrying daughter on shoulders; matches brief |
| `journey-elder.jpg` | 928×1152 | Scene 07, tall frame | Replaced 13 Nov: woman in ivory shirt; reads about 50–58, still younger than the 66–70 brief |
