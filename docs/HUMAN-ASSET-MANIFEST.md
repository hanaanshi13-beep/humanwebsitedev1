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
