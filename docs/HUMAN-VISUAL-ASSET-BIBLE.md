# HUMAN — Visual Asset Bible (V5)

> **Superseded by `HUMAN-VISUAL-ASSET-BIBLE-V7-FINAL.md`.** Kept for its technical notes only; do not generate from the prompts below.

**Date:** 12 November 2026. **Status:** every asset below is *outstanding* unless marked existing. Nothing here has been generated.

This session cannot control Chrome, so it cannot run Gemini or Flow. The founder generates each image and uploads it here; the site picks it up by filename. The layouts are already built and photo-ready: each empty slot currently shows abstract artwork, so nothing looks broken while images are pending.

All slot sizes below were measured in the running site at 1440×900 and 390×844.

## Production queue

Generate one, check it against its acceptance list, upload it, and I integrate and screenshot it before you start the next.

1. `PORTAL_HER_01`
2. `PORTAL_HIM_01` (attach the approved Her image as the pairing reference)
3. `S01_WALK_01`, then `S01_MEAL_01`, then `S01_REST_01`
4. `S02_STRIDE_01`
5. `S04_FINE_01`
6. `S07_PROFESSIONAL_01`, `S07_PARENT_01`, `S07_ELDER_01`
7. `S03_MACRO_01` (optional)

There is no P0 blocker: the first screen already has the hero image.

## How to run a shot in Gemini

1. New chat per shot. Use your strongest thinking setting for the chat model. Note the name of the **image** model the interface shows when it generates; tell me that name with the upload.
2. Attach the current hero image and say it is a style reference only (each prompt already says so).
3. Paste the **Full Gemini prompt**, then on a new line "Negative prompt:" followed by the **Negative prompt**.
4. Generate one image. Check the acceptance list. One corrective retry is allowed, changing one thing.
5. Download the full-resolution original. Do not crop, upscale, filter or screenshot it.
6. Rename it to the exact filename and upload it to this session.

People in every image are fictional models. No real person, celebrity or lookalike.

## Manifest

| Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency |
|---|---|---|---|---|---|---|---|---|
| HERO_01 | Keep | / → hero | Existing: `src/assets/hero/hero-desktop-1672.webp` (+1100 w, +800 w mobile crop) | 16:9 | 800×941 crop | Left 46% dark | (existing) | Send the original PNG if you have it |
| PORTAL_HER_01 | P1 | / → Her/Him portals (left panel); also /women hero | New (slot shows garnet abstract artwork) | 3:4 source, shown about 6:7 (636×738 px at 1440) | same file, shown 5:8 (350×560 px at 390) | Left third and bottom third stay dark and empty | `src/assets/human/portal-her.png` | None |
| PORTAL_HIM_01 | P1 | / → Her/Him portals (right panel); also /men hero | New (slot shows teal abstract artwork) | 3:4 source, shown about 6:7 (636×738 px at 1440) | same file, shown 5:8 (350×560 px at 390) | Right third and bottom third stay dark and empty | `src/assets/human/portal-him.png` | Generate after PORTAL_HER_01 is approved, and attach it as the pairing reference |
| S01_WALK_01 | P1 | / → Scene 01, large top frame | New (slot shows ivory abstract artwork) | 3:2 (626×418 px at 1440) | 3:2 (350×233 px at 390) | Bottom-left corner stays quiet (a small caption chip sits there) | `src/assets/human/care-walk.png` | None |
| S01_MEAL_01 | P1 | / → Scene 01, lower-left frame | New (slot shows amber abstract artwork) | 4:5 (302×377 px at 1440) | 4:5 (169×211 px at 390) | Upper-left quiet; bottom-left carries a small caption chip | `src/assets/human/care-meal.png` | None |
| S01_REST_01 | P1 | / → Scene 01, lower-right frame | New (slot shows amber abstract artwork) | 4:5 (302×377 px at 1440) | 4:5 (169×211 px at 390) | Upper-right is dark window; small caption chip bottom-left | `src/assets/human/care-rest.png` | None |
| S02_STRIDE_01 | P1 | / → Scene 02, left column | New (slot shows amber abstract artwork) | 4:5 (515×643 px at 1440) | 4:5 (350×438 px at 390) | Lower-left third dark; no text sits on this image | `src/assets/human/progress-stride.png` | None |
| S04_FINE_01 | P1 | / → Scene 04, wide frame | New (slot shows ivory abstract artwork) | 3:2 (738×492 px at 1440) | 3:2 (350×233 px at 390) | Right half calm pale wall | `src/assets/human/feeling-fine.png` | None |
| S07_PROFESSIONAL_01 | P1 | / → Scene 07, tall left frame | New (slot shows abstract artwork) | 4:5 (302×377 px at 1440) | 4:5 (350×438 px at 390) | No text on the image | `src/assets/human/journey-professional.png` | Generate the three Scene 07 images in sequence and compare them side by side |
| S07_ELDER_01 | P1 | / → Scene 07, small lower-right frame | New (slot shows abstract artwork) | 4:5 (193×242 px at 1440) | 4:5 (229×287 px at 390) | No text on the image | `src/assets/human/journey-elder.png` | Generate the three Scene 07 images in sequence and compare them side by side |
| S07_PARENT_01 | P1 | / → Scene 07, upper-right frame | New (slot shows abstract artwork) | 3:2 (302×201 px at 1440) | 3:2 (350×233 px at 390) | No text on the image | `src/assets/human/journey-parent.png` | Generate the three Scene 07 images in sequence and compare them side by side |
| S03_MACRO_01 | P2 | / → Scene 03, inside the Reveal Lens | Optional. The lens currently uses code-drawn artwork, which is acceptable | 4:5 (626×~640 px stage at 1440) | about 1:1.05 (350×368 px at 390) | Detail centred slightly up-right; all four edges fall to near-black | `src/assets/human/lens-macro.png` | Only after every P1 asset |
| WAITLIST_BG | NOT NEEDED | /waitlist chapters | Code-drawn | n/a | n/a | n/a | n/a | CSS/SVG is lighter and keeps the form readable |
| S05_REPORT | NOT NEEDED | / → Scene 05 | Code-drawn sheet | n/a | n/a | n/a | n/a | Must stay HTML so it carries no fake values |
| S06, S08, FINAL | NOT NEEDED | / → Scenes 06, 08, final CTA | Code-drawn | n/a | n/a | n/a | n/a | Typography and coded light do the work |
| APP_SCREENS | BLOCKED | / → app section | Awaiting the real prototype folder | n/a | n/a | n/a | n/a | Never generated; real screens only |

## HERO_01 — existing, keep

- **Decision:** keep the current hero. It passes the layout at 1440 and 390 and the headline clears both faces.
- **Known weakness:** the only copy in the repository is a compressed 1672 px upload, so it is soft at 1920 px and on high-density screens.
- **Ask:** send the original full-resolution file if it exists. Do not regenerate the hero unless you want a different image; a new hero would also need a dedicated mobile portrait frame.

---

## PORTAL_HER_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`PORTAL_HER_01` | P1 | / → Her/Him portals (left panel); also /women hero | New (slot shows garnet abstract artwork) | 3:4 source, shown about 6:7 (636×738 px at 1440) | same file, shown 5:8 (350×560 px at 390) | Left third and bottom third stay dark and empty | `src/assets/human/portal-her.png` | None

- **Why it exists:** The portal is currently abstract artwork. This is the single most visible gap after the hero, and the same file becomes the hero of the Her page.
- **What it must communicate:** Composed, intelligent, warm. A woman who takes herself seriously, in a garnet world that is not pink.
- **Layout composition:** One subject in the right two-thirds, eyes on the upper third line (about 62% across, 28% down). Live text (eyebrow, "For Her", one line, Explore button) sits bottom-left over a dark shade covering the bottom third. On /women the image fills the right 44% of a 1440×830 hero and dissolves leftward into the page colour, so the left edge of the photograph must already be dark.
- **Canvas:** Generate one 3:4 portrait, long edge 2400 px or more. No separate mobile frame: the same file is cropped. CSS: object-fit cover, object-position 62% 28%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: an environmental editorial portrait for the "HUMAN for Her" entry panel.

SUBJECT: one Indian woman, around 34–38, strong and composed, intelligent eyes. Shoulder-length dark hair worn naturally, a few loose strands. Minimal make-up, real skin. She wears a deep garnet (dark wine, #54263B) silk-cotton shirt with the sleeves pushed up, one fine gold ring, small gold ear studs. No bindi-and-sari styling, no bridal styling.

ACTION AND EXPRESSION: seated sideways on a low upholstered chair, torso turned three-quarters to camera, one forearm resting on the chair back, gaze directed just past the lens to camera-left, mid-thought, the faintest beginning of a smile. Self-possessed, not posing.

SETTING: a quiet, dim, well-designed interior at dusk. Behind her, a wall in deep mulberry plaster with a soft texture, and a sliver of sheer curtain with fading daylight at the far right edge. One out-of-focus ceramic vessel on a dark wood surface in the background. The environment is felt, not shown in detail.

COMPOSITION: vertical 3:4. Subject occupies the right two-thirds. Her eyes sit on the upper third line. The LEFT third of the frame and the BOTTOM quarter are calm, dark, uncluttered mulberry shadow, because live website text will be placed there. Nothing important within 8% of any edge. Camera at her eye level.

LENS AND LIGHT: 85mm equivalent at f/2.8, shallow depth of field, background softly defocused. Key light is soft window light from camera-right at 45 degrees, wrapping her face with gentle shadow on the left cheek. A very subtle warm rim on her hair and shoulder from a practical lamp out of frame behind her. Shadows are deep garnet-black, never pure black, never pink.

COLOUR: a rich garnet and mulberry world with neutral, accurate skin tones. Not pink. Not magenta. No amber wash.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, flowers, pregnancy or fertility cues, yoga poses, spa imagery, jewellery-ad glamour, soft-focus "feminine" clichés
```

### Continuity

Same lens family (85mm), same soft single-key lighting logic and same finish as PORTAL_HIM_01, so the two read as a pair. Different person from the hero woman and from every other asset. Garnet world here; teal world there. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as portal-her.png. I convert to WebP at 480/800/1200/1600 widths, lazy-load on the homepage and load eagerly on /women. Decorative alt on the homepage (the link text carries the meaning); short descriptive alt on /women. Budget: under 180 KB at 1200 w. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] Palette reads garnet/mulberry, not pink or magenta
- [ ] Left third and bottom third are dark and uncluttered at both 1440 and 390 crops
- [ ] Face is not covered by the title when placed in the panel
- [ ] Skin shows pores and natural unevenness; hands (if visible) are correct
- [ ] Expression is thoughtful, not a stock smile; no jewellery-ad glamour
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If too pink: ask for "deeper wine and mulberry, less saturation". If the left side is busy: "move her further right and let the left third fall to shadow". Change one thing per retry. Approve at the first image that passes; do not batch variants.

---

## PORTAL_HIM_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`PORTAL_HIM_01` | P1 | / → Her/Him portals (right panel); also /men hero | New (slot shows teal abstract artwork) | 3:4 source, shown about 6:7 (636×738 px at 1440) | same file, shown 5:8 (350×560 px at 390) | Right third and bottom third stay dark and empty | `src/assets/human/portal-him.png` | Generate after PORTAL_HER_01 is approved, and attach it as the pairing reference

- **Why it exists:** Equal weight with the Her panel; doubles as the hero of the Him page.
- **What it must communicate:** Thoughtful and at ease. Calm confidence without gym or boardroom cues.
- **Layout composition:** One subject in the left two-thirds, eyes on the upper third line (about 38% across, 28% down). On desktop the live text sits bottom-RIGHT; on mobile bottom-left, so the whole bottom third must be dark. On /men the image fills the left 44% of the hero and dissolves rightward, so its right edge must already be dark.
- **Canvas:** One 3:4 portrait, long edge 2400 px or more. CSS: object-fit cover, object-position 38% 28%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: an environmental editorial portrait for the "HUMAN for Him" entry panel. It must feel like the companion to a garnet portrait of a woman: same maturity, same quality, equal presence.

SUBJECT: one Indian man, around 36–42, thoughtful and at ease. Short dark hair with a little natural grey at the temples, light well-kept stubble. He wears a deep ocean-teal (#164846) fine-gauge crew-neck knit over a white T-shirt collar barely visible, a simple steel watch. Average healthy build, not muscular, not a fitness model.

ACTION AND EXPRESSION: standing, leaning one shoulder against a wall, arms loosely folded low, weight on one leg. Head turned slightly to camera-right, eyes looking out of frame toward soft light, calm and reflective, mouth relaxed. Not brooding, not smouldering.

SETTING: the shaded verandah or corridor of a modern Indian home in the blue hour. Wall in deep teal-grey lime plaster. At the far left edge, a narrow out-of-focus band of cool evening sky and one dark leaf of a potted plant. Quiet, architectural, real.

COMPOSITION: vertical 3:4. Subject occupies the left two-thirds. His eyes sit on the upper third line. The RIGHT third of the frame and the BOTTOM quarter are calm, dark, uncluttered teal shadow, because live website text will be placed there. Nothing important within 8% of any edge. Camera at his eye level.

LENS AND LIGHT: 85mm equivalent at f/2.8. Key light is cool-neutral soft evening light from camera-left at 45 degrees. A faint warm practical light from inside the house touches the edge of his jaw and shoulder on the right, giving a restrained warm-against-cool contrast. Shadows are deep teal-black with detail.

COLOUR: a deep ocean-teal world with neutral, accurate skin tones. No cyan cast on skin. No amber wash.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, gym, weights, sportswear, suits and boardroom imagery, crossed-arms "power pose" high on the chest, whisky-ad masculinity, dramatic scowl
```

### Continuity

Must pair with PORTAL_HER_01: same camera height, same subject scale in frame, same finish. Cool-neutral key with one warm edge, mirroring her warm key. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as portal-him.png. Same export and loading rules as PORTAL_HER_01. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] Reads deep ocean teal with accurate skin (no cyan cast)
- [ ] Subject scale matches the Her portrait within about 10%
- [ ] Right third and bottom third are dark and uncluttered
- [ ] Not a fitness or corporate stock type; arms relaxed and low
- [ ] Natural grey at the temples and real skin texture retained
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If skin goes blue: "keep the environment teal but light his face with neutral daylight". If he looks stern: "soften the brow, relaxed mouth".

---

## S01_WALK_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`S01_WALK_01` | P1 | / → Scene 01, large top frame | New (slot shows ivory abstract artwork) | 3:2 (626×418 px at 1440) | 3:2 (350×233 px at 390) | Bottom-left corner stays quiet (a small caption chip sits there) | `src/assets/human/care-walk.png` | None

- **Why it exists:** Lead image of the triptych that replaces the old typographic list in Scene 01.
- **What it must communicate:** Ordinary, unhurried movement. Care as a habit, not a workout.
- **Layout composition:** Full-length figure, small to medium in frame, on the right third, walking into space on the left. The left half is tree shadow. Caption chip "Move, when you can" sits bottom-left.
- **Canvas:** 3:2 landscape, long edge 2000 px or more. CSS: object-fit cover, object-position 62% 50%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: an unposed early-morning walk. The story beat is "movement as an ordinary habit".

SUBJECT: an Indian man in his late 50s to early 60s, grey hair, trimmed grey moustache, glasses. He wears a plain off-white cotton shirt with sleeves rolled, dark trousers and simple walking shoes. Upright, unhurried stride.

ACTION: walking left to right along a tree-lined residential lane or park path, mid-stride, hands free, looking ahead down the path with a calm, content expression. He is not exercising for the camera.

SETTING: an Indian city neighbourhood just after sunrise: old trees with long roots, a low boundary wall, dappled light on the path, soft morning haze in the far distance only. No traffic, no signage, no other recognisable people.

COMPOSITION: horizontal 3:2. Subject is full-length and small-to-medium in frame, placed on the right third, walking into the space on the left. The left half is deep tree shadow with soft light patches. Camera at chest height, slightly low.

LENS AND LIGHT: 70mm equivalent at f/4, natural compression. Low warm sunlight from behind-right gives a fine rim on his shoulder and hair; the shadow side is cool and detailed. This warm rim is the only amber in the frame.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, running gear, earphones, fitness trackers held up, jogging pose, laughing-at-nothing stock expression, tourist landmarks
```

### Continuity

Same natural-light logic as the other two Scene 01 frames (one soft source, deep neutral shadows). Deliberately a different age, gender and setting from S01_MEAL_01 and S01_REST_01. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as care-walk.png. Lazy-loaded. Decorative alt (the caption chip names the idea). Budget: under 120 KB at 1200 w. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] Reads as a morning walk, not exercise for the camera
- [ ] Warm light is a rim only; shadows stay neutral
- [ ] No traffic, signage or recognisable bystanders
- [ ] Legible when shown only 350 px wide
- [ ] Left half calm enough for the caption chip
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If it looks like a fitness advert: "everyday shirt and trousers, slower stride". If the light is orange overall: "cooler shadows, warm only on the edge of his shoulder".

---

## S01_MEAL_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`S01_MEAL_01` | P1 | / → Scene 01, lower-left frame | New (slot shows amber abstract artwork) | 4:5 (302×377 px at 1440) | 4:5 (169×211 px at 390) | Upper-left quiet; bottom-left carries a small caption chip | `src/assets/human/care-meal.png` | None

- **Why it exists:** Second frame of the Scene 01 triptych.
- **What it must communicate:** Quiet, tactile, domestic. Food as care, not diet.
- **Layout composition:** Hands and bowl on the lower-right third intersection. Shown small, so the action must read at a glance.
- **Canvas:** 4:5 portrait, long edge 1600 px or more. CSS: object-position 60% 60%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: a close, quiet kitchen moment. The story beat is "we take care of ourselves in ordinary ways".

SUBJECT: the hands and forearms of an Indian woman in her late 40s, and a soft, partial view of her profile at the top edge of the frame (chin to nose only, out of focus). She wears a rolled-sleeve indigo cotton kurta. Thin plain gold bangle on one wrist.

ACTION: she is tearing fresh coriander over a steel bowl of chopped tomato, cucumber and sprouted moong on a worn wooden board. A halved lime and a small steel katori of salt sit beside it. Mid-motion, a few leaves in the air between fingers and bowl.

SETTING: a real Indian home kitchen counter in dark stone, morning. Slight evidence of use: a damp cloth, a knife with a wooden handle. Background falls to deep charcoal shadow.

COMPOSITION: vertical 4:5, camera at 45 degrees looking down from over her left shoulder. The bowl sits on the lower-right third intersection. The upper-left area is dark and quiet.

LENS AND LIGHT: 50mm equivalent at f/2.8, focus on the fingers and the leaves. A single shaft of soft morning window light from the left rakes across the counter, picking out water droplets on the vegetables and the texture of the wood. Deep neutral shadows.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, styled food-magazine perfection, smoothie bowls, avocado toast, supplements, measuring scales, anything that reads as a diet
```

### Continuity

Darker and closer than S01_WALK_01 on purpose. Same finish and grain. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as care-meal.png. Lazy-loaded, decorative alt. Budget: under 70 KB at 800 w. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] Both hands anatomically correct at 200% zoom
- [ ] Food looks real and slightly imperfect
- [ ] Reads clearly at 170 px wide
- [ ] No diet or supplement cues
- [ ] Shadows neutral, light from one direction
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If hands fail twice, ask for "one hand only, the other out of frame".

---

## S01_REST_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`S01_REST_01` | P1 | / → Scene 01, lower-right frame | New (slot shows amber abstract artwork) | 4:5 (302×377 px at 1440) | 4:5 (169×211 px at 390) | Upper-right is dark window; small caption chip bottom-left | `src/assets/human/care-rest.png` | None

- **Why it exists:** Third frame of the Scene 01 triptych.
- **What it must communicate:** Still and comfortable. Rest as something chosen.
- **Layout composition:** Seated figure in profile in the lower-left two-thirds; night window upper-right. The caption chip "Rest" sits over the very bottom-left corner, so keep her face well above it.
- **Canvas:** 4:5 portrait, long edge 1600 px or more. CSS: object-position 40% 45%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: a late-evening moment of rest. The story beat is "we slow down, and we pay attention to how we feel".

SUBJECT: an Indian woman in her late 20s, hair loosely tied, no make-up, wearing an oversized oatmeal cotton-knit sweater. A different person from any other shot.

ACTION: sitting on a wide window ledge with her knees drawn up, both hands wrapped around a plain ceramic cup, head resting lightly against the window frame, eyes open and soft, looking out at the evening. Still, comfortable, not sad.

SETTING: a small city apartment at night. One warm table lamp out of frame. Through the window, the city is only a dark blur with a few distant out-of-focus lights. A folded cotton throw beside her.

COMPOSITION: vertical 4:5. She occupies the lower-left two-thirds in profile; the upper-right is dark window and night. Camera at her seated eye level.

LENS AND LIGHT: 50mm equivalent at f/2. The lamp gives a soft warm key on the near side of her face and hands; cool, faint night light from the window outlines her profile. Shadows deep and neutral.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, phone in hand, laptop, sleeping in bed, candles and spa props, rain-on-glass melancholy
```

### Continuity

Warm lamp against cool night: the one place in Scene 01 where two colour temperatures meet. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as care-rest.png. Lazy-loaded, decorative alt. Budget: under 70 KB at 800 w. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] No phone or screen anywhere
- [ ] Mood is restful, not lonely or unwell
- [ ] Face readable at 170 px wide
- [ ] Hands around the cup are correct
- [ ] No candles or spa props
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If the mood reads sad: "eyes open, relaxed half-smile, warmer lamp".

---

## S02_STRIDE_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`S02_STRIDE_01` | P1 | / → Scene 02, left column | New (slot shows amber abstract artwork) | 4:5 (515×643 px at 1440) | 4:5 (350×438 px at 390) | Lower-left third dark; no text sits on this image | `src/assets/human/progress-stride.png` | None

- **Why it exists:** Scene 02 pairs one photograph of visible effort with three coded line drawings (Movement, Rest, Routine). Without it the left column is abstract.
- **What it must communicate:** Steady effort you can see and feel. Personal, not competitive.
- **Layout composition:** Single figure from behind on the right third, climbing up-left along strong diagonals. No text overlays this image.
- **Canvas:** 4:5 portrait, long edge 2000 px or more. CSS: object-position 50% 40%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: a quiet moment of visible, physical progress. The story beat is "you know the progress you can see". It is about an ordinary person's own effort, not athletic performance.

SUBJECT: one Indian woman in her early 30s, medium build, hair tied back in a low ponytail with loose strands at the neck. She wears a charcoal cotton long-sleeve top, loose dark olive trousers and plain grey trainers. No visible brands. A different person from every other shot.

ACTION: she is climbing a long flight of wide, worn stone steps outdoors, seen from behind and slightly to her left (three-quarter back view), mid-stride with her right foot on the higher step, one hand lightly brushing a low stone wall. Her head is turned a little to the left so the line of her cheek and jaw is visible but her face is not the subject. Steady, unhurried effort.

SETTING: an old stepped path in an Indian hill town or city park at dawn. Stone darkened by age, a few fallen leaves, the top of the steps dissolving into soft early light. No other people, no signage, no landmarks.

COMPOSITION: vertical 4:5. She is on the right-hand third, about half the frame height, climbing up and away toward the upper left. The steps form strong diagonal lines rising from lower right to upper left. The lower-left third is dark, quiet stone in shadow. Nothing important within 8% of any edge. Camera low, at the height of her knees, looking up the steps.

LENS AND LIGHT: 50mm equivalent at f/2.8, focus on her back and shoulder. Low warm dawn light comes over the top of the steps from the upper left, giving a thin rim along her shoulder, arm and hair and a soft glow on the upper steps. Everything else falls into deep, detailed charcoal shadow. This rim is the only amber in the frame.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, gym or stadium stairs, running gear, sports bra, fitness watch, earphones, water bottle, fist-pump or victory pose, sweat-drenched drama, tourist monuments
```

### Continuity

Dark, warm-rimmed image that hands over to the dark Scene 03 below it. Different woman from PORTAL_HER_01, S01_REST_01 and the hero. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as progress-stride.png. Lazy-loaded, decorative alt. Budget: under 110 KB at 1200 w. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] Reads as everyday effort, not sport
- [ ] Step geometry is consistent (no warped or merging steps)
- [ ] Feet and the visible hand are correct
- [ ] Warm rim only; the rest neutral charcoal
- [ ] Face is not the focus and is not distorted
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If the stairs warp: "simpler, straight flight of ten steps". If it looks athletic: "everyday clothes, slower pace".

---

## S04_FINE_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`S04_FINE_01` | P1 | / → Scene 04, wide frame | New (slot shows ivory abstract artwork) | 3:2 (738×492 px at 1440) | 3:2 (350×233 px at 390) | Right half calm pale wall | `src/assets/human/feeling-fine.png` | None

- **Why it exists:** Scene 04 needs a person who visibly looks well, so the line "feeling fine doesn’t tell you everything" lands without fear.
- **What it must communicate:** Easy, open, untroubled. Curiosity, not anxiety.
- **Layout composition:** Subject on the left third facing a window at the left edge; right half pale and empty. The four marker categories are set in type beside the image, not on it.
- **Canvas:** 3:2 landscape, long edge 2000 px or more. CSS: object-position 30% 40%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: a calm, confident everyday portrait. The story beat is "you can feel perfectly fine and still not have the full picture". The person looks well. Nothing in the image suggests illness or worry.

SUBJECT: an Indian man in his early 30s, clean-shaven or light stubble, short hair. He wears a charcoal linen overshirt on a cream T-shirt. A different person from every other shot.

ACTION AND EXPRESSION: sitting at a wooden table in a quiet café or home dining space, one hand loosely around a glass of water, the other resting on the table. He has just looked up from his thoughts and is looking out of a window to camera-left with an easy, open, untroubled expression.

SETTING: daytime interior with large soft window light, pale plaster wall, a dark wood table. Minimal: the glass, a folded newspaper with no legible text, nothing else.

COMPOSITION: horizontal 3:2. Subject on the LEFT third, turned toward the window at the left edge. The RIGHT half of the frame is a calm, softly lit pale wall with gentle gradation and no objects, because website text and labels will be placed there. Camera at his eye level.

LENS AND LIGHT: 85mm equivalent at f/2.8. Broad, soft daylight from the left. Bright, airy, ivory-toned overall (this scene sits on a light page), with natural contrast on his face. No amber accent needed.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, doctor, consultation, hand on chest or head, tired or anxious expression, wearable devices, phone, laptop
```

### Continuity

The brightest image on the site (it sits on an ivory page). Same finish and skin realism as the rest. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as feeling-fine.png. Lazy-loaded, decorative alt. Budget: under 120 KB at 1200 w. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] He looks healthy and relaxed
- [ ] No medical, device or screen cues
- [ ] Right half genuinely empty
- [ ] Bright and airy without blown highlights
- [ ] Newspaper, if present, has no legible text
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If he looks tired: "rested, bright eyes, relaxed shoulders". If text appears on objects: "remove the newspaper".

---

## S07_PROFESSIONAL_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`S07_PROFESSIONAL_01` | P1 | / → Scene 07, tall left frame | New (slot shows abstract artwork) | 4:5 (302×377 px at 1440) | 4:5 (350×438 px at 390) | No text on the image | `src/assets/human/journey-professional.png` | Generate the three Scene 07 images in sequence and compare them side by side

- **Why it exists:** Scene 07 says no two people are alike. It needs three visibly different lives; today it has none.
- **What it must communicate:** A working professional, mid-life, unposed. Dignity and specificity.
- **Layout composition:** Shown small inside a three-frame mosaic, so one clear subject and one clear gesture. No overlays.
- **Canvas:** 4:5 source, long edge 1600 px or more. CSS: object-position 60% 30%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: a working professional between tasks.

SUBJECT: an Indian woman in her early 40s, short bob haircut, wearing a rust handloom-cotton blazer over a black top, small silver earrings.

ACTION: standing at a tall window in a modern office corridor, holding a closed notebook against her hip, turned three-quarters away, looking out and slightly down at the city, thinking. A real pause in a real day.

SETTING: late afternoon. Glass, concrete and warm wood. The city outside is a soft blur. No screens, no signage, no other faces.

COMPOSITION: vertical 4:5, subject on the right third, three-quarter length. Left side is window light falling across a plain wall.

LENS AND LIGHT: 85mm at f/2.8. Low warm afternoon sun through the glass edges her profile and blazer; interior shadows stay cool and neutral.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, laptops, lanyards, handshake, meeting room, power pose
```

### Continuity

The three Scene 07 images must differ in age, setting and light (afternoon office, morning balcony, doorway daylight) while sharing lens family and finish. None may resemble the hero pair or the portal subjects. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as journey-professional.png. Lazy-loaded, decorative alt. A line under the mosaic already states that images show models, not members. Budget: under 70 KB at 800 w. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] Clearly a different person, age and place from the other two
- [ ] Reads at the small display size
- [ ] No posed-for-camera look
- [ ] Hands and faces correct at 200% zoom
- [ ] No props that imply illness, a clinic or a testimonial
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If two of the three look alike, regenerate the later one with a different time of day and wardrobe colour.

---

## S07_ELDER_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`S07_ELDER_01` | P1 | / → Scene 07, small lower-right frame | New (slot shows abstract artwork) | 4:5 (193×242 px at 1440) | 4:5 (229×287 px at 390) | No text on the image | `src/assets/human/journey-elder.png` | Generate the three Scene 07 images in sequence and compare them side by side

- **Why it exists:** Scene 07 says no two people are alike. It needs three visibly different lives; today it has none.
- **What it must communicate:** An older adult, mid-life, unposed. Dignity and specificity.
- **Layout composition:** Shown small inside a three-frame mosaic, so one clear subject and one clear gesture. No overlays.
- **Canvas:** 4:5 source, long edge 1600 px or more. CSS: object-position 40% 30%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: an older adult in a moment of everyday contentment.

SUBJECT: an Indian woman in her late 60s, silver hair in a low bun, reading glasses pushed up on her head, wearing a soft grey-blue cotton sari with a plain blouse. Warm, lived-in face with real lines.

ACTION: on a shaded balcony, watering a row of potted tulsi and curry-leaf plants with a small brass lota, looking at the plants with quiet amusement.

SETTING: an older apartment balcony with a painted iron railing, morning. Terracotta pots, a cane chair partly in frame. Background trees soft and green-grey.

COMPOSITION: vertical 4:5, subject left of centre, waist-up, with the plants in the lower right foreground slightly out of focus.

LENS AND LIGHT: 50mm at f/2.8. Open shade with soft bounce light on her face; one streak of sun on the brass and the leaves.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, walking stick, medicine, frailty cues, namaste pose, festival styling
```

### Continuity

The three Scene 07 images must differ in age, setting and light (afternoon office, morning balcony, doorway daylight) while sharing lens family and finish. None may resemble the hero pair or the portal subjects. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as journey-elder.png. Lazy-loaded, decorative alt. A line under the mosaic already states that images show models, not members. Budget: under 70 KB at 800 w. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] Clearly a different person, age and place from the other two
- [ ] Reads at the small display size
- [ ] No posed-for-camera look
- [ ] Hands and faces correct at 200% zoom
- [ ] No props that imply illness, a clinic or a testimonial
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If two of the three look alike, regenerate the later one with a different time of day and wardrobe colour.

---

## S07_PARENT_01 — P1

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`S07_PARENT_01` | P1 | / → Scene 07, upper-right frame | New (slot shows abstract artwork) | 3:2 (302×201 px at 1440) | 3:2 (350×233 px at 390) | No text on the image | `src/assets/human/journey-parent.png` | Generate the three Scene 07 images in sequence and compare them side by side

- **Why it exists:** Scene 07 says no two people are alike. It needs three visibly different lives; today it has none.
- **What it must communicate:** A parent, mid-life, unposed. Dignity and specificity.
- **Layout composition:** Shown small inside a three-frame mosaic, so one clear subject and one clear gesture. No overlays.
- **Canvas:** 3:2 source, long edge 1600 px or more. CSS: object-position 35% 40%.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: a parent in the middle of ordinary family life.

SUBJECT: an Indian father in his mid 30s with a beard, wearing an olive cotton shirt, and his daughter of about 6 seen only from behind or in soft profile (her face is not the subject and should not be clearly identifiable).

ACTION: he is crouched at her level in a doorway, fastening the strap of her school bag, mid-laugh at something she has said. Natural, unstaged.

SETTING: the entrance of an Indian home on a school morning: shoe rack, a steel tiffin on a side table, daylight from the open door.

COMPOSITION: horizontal 3:2. The father's face on the left third in focus; the child in the right foreground, soft. Upper-right area is bright doorway light falling to shadow.

LENS AND LIGHT: 50mm at f/2.2. Soft daylight from the open door as key; warm interior shadows.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, posed family portrait, everyone looking at camera, matching outfits, toys arranged for the shot
```

### Continuity

The three Scene 07 images must differ in age, setting and light (afternoon office, morning balcony, doorway daylight) while sharing lens family and finish. None may resemble the hero pair or the portal subjects. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as journey-parent.png. Lazy-loaded, decorative alt. A line under the mosaic already states that images show models, not members. Budget: under 70 KB at 800 w. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] Clearly a different person, age and place from the other two
- [ ] Reads at the small display size
- [ ] No posed-for-camera look
- [ ] Hands and faces correct at 200% zoom
- [ ] No props that imply illness, a clinic or a testimonial
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If two of the three look alike, regenerate the later one with a different time of day and wardrobe colour.

---

## S03_MACRO_01 — P2

**Asset ID | Priority | Page / section | Existing or new | Desktop aspect | Mobile aspect | Text-safe zone | Output filename | Dependency**
`S03_MACRO_01` | P2 | / → Scene 03, inside the Reveal Lens | Optional. The lens currently uses code-drawn artwork, which is acceptable | 4:5 (626×~640 px stage at 1440) | about 1:1.05 (350×368 px at 390) | Detail centred slightly up-right; all four edges fall to near-black | `src/assets/human/lens-macro.png` | Only after every P1 asset

- **Why it exists:** Would give the lens real optical depth. Skip it if the result looks biological or like a scan.
- **What it must communicate:** Precise, quiet, material. An art object, not anatomy.
- **Layout composition:** Shown through an oval aperture that opens with scroll or the slider. Centre of interest near 56% across, 46% down.
- **Canvas:** 4:5 portrait, long edge 2000 px or more.

### Full Gemini prompt

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.

SHOT: an abstract macro photograph of real physical material, for use as a decorative layer. It must not look like a medical scan, a cell, an organ or a diagram.

SUBJECT: layered sheets of thin, translucent amber-tinted resin and clear optical glass, overlapping at slight angles, with a few fine hair-thin glass fibres resting between the layers. Photographed as a real still life on a black surface.

COMPOSITION: vertical 4:5. The densest detail sits slightly above and right of centre and falls away softly toward all four edges into near-black, so the image can be masked into an oval.

LENS AND LIGHT: 100mm macro at f/5.6, very shallow focus plane running diagonally. One small hard light from behind-left creates precise bright refractive edges and soft internal caustics; a large black card absorbs spill. Colours: near-black, deep honey, pale champagne, a little neutral clear glass.
```

### Negative prompt

```
text, letters, numbers, captions, logos, brand marks, watermarks, UI overlays, buttons, charts, phone or laptop screens showing content, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, giant glowing rings, floating particles or bubbles, light ribbons, halo or lens flare behind heads, amber fog, smoke, haze, neon, teal-and-orange grading, all-over orange wash, plastic or airbrushed skin, beauty-filter smoothing, over-sharpening, HDR look, generic smiling stock expression, awkward stiff pose, extra or fused fingers, malformed hands, distorted teeth or eyes, repeated or duplicated faces, incoherent anatomy, warped architecture, CGI or 3D-render look, illustration, cartoon, liquid, smoke, bubbles, glitter, iridescent rainbow, sci-fi energy, anything biological
```

### Continuity

Honey, champagne and near-black only, matching the amber accent used on the site. These are fictional models and are never presented as members, patients or customers.

### Crop + integration instructions

Upload as lens-macro.png. I would wire it in as the under-layer of the lens and keep the coded artwork as the fallback. Nothing in the current code needs removing: the slot swaps its abstract artwork for the photograph automatically.

### Acceptance tests

- [ ] Cannot be mistaken for a scan, cell or organ
- [ ] No rainbow iridescence or liquid
- [ ] Edges fall to black for masking
- [ ] Sharp plane is visible, not all blur
- [ ] No text, letters, logos or watermark anywhere at 200% zoom
- [ ] Does not look like generic AI healthcare advertising

### If it fails

If it looks biological: "flat sheets of glass and resin only, straight edges".

---

# Google Flow motion assets

Neither clip is needed for the site to be complete. Both are optional, and both are blocked on an approved still.

## FLOW_HERO_01 — OPTIONAL

1. **Source still:** `HERO_01`, the original full-resolution file (not the compressed copy). Target: homepage hero background.
2. **Why optional:** the hero already works as a still with coded entrance motion. A clip only earns its place if it adds believable life (breath, light) without disturbing the faces. CSS cannot do that; it also is not required.
3. **First frame:** the approved hero still, unmodified, 16:9. **Last frame:** the same still, as a loop experiment only.
4. **Flow prompt:**

```
Image-to-video from the attached still. Keep the composition, framing, both people, their faces, hair, clothing and positions exactly as in the still for the entire clip.

Allowed motion, all extremely subtle: both people breathe slowly and naturally (a barely visible rise of the shoulders); the woman's loose strands of hair move a few millimetres as if in very light air; the warm edge light on their shoulders and hair brightens and eases by a small amount once, slowly; the translucent material in the background shifts and refracts very slowly behind them. The camera is locked off on a tripod with at most an imperceptible drift.

Do not change or animate facial features, expressions, eye direction or head position. No blinking close-ups, no turning heads, no smiling, no talking. No walking or body movement. No zoom, pan, tilt, push-in or handheld shake. No new objects, particles, smoke, text, logos or light flares. No cuts. The dark left half of the frame must stay dark, even and free of movement.
```

5. **Duration and loop:** choose the shortest 16:9 option the interface offers at generation time (check the live UI; do not assume). A matching first and last frame is an experiment, not a guaranteed seamless loop. I will test the seam in the browser and, if needed, cross-fade the last 12 frames into the first or play it once and hold the final frame.
6. **Sound:** none. I strip any audio track.
7. **Output handling:** upload the downloaded file as `hero-loop-source.mp4`. I produce `hero-loop.webm` and `hero-loop.mp4` at 1600 px wide, target under 2.5 MB each, with the existing still as poster. `autoplay muted loop playsinline`, `preload="none"`, started only after the still has painted, paused when off-screen, and not loaded at all for reduced-motion or Save-Data visitors or on phones.
8. **Credits:** read the cost shown in Flow before generating and tell me the number; I have not been given a budget and will not assume one. One candidate first. No upscaling until a candidate passes.
9. **Acceptance:** faces identical frame to frame; eyes stable; no flicker, ghosting or texture crawl on skin; no drift of either person; dark text zone unchanged; no visible seam on loop; usable when cropped to the mobile hero band.

## FLOW_MACRO_01 — OPTIONAL

1. **Source still:** `S03_MACRO_01` once approved. Target: inside the Reveal Lens.
2. **Why optional:** the lens already has coded parallax. A slow refraction loop could add depth that CSS cannot fake, with no people to go wrong.
3. **First frame:** the approved macro still. **Last frame:** same still (loop experiment).
4. **Flow prompt:**

```
Image-to-video from the attached macro still of layered glass and amber resin. Keep every object exactly where it is. The only change is light: a small light source behind the material travels very slowly a short distance from left to right, so the bright refractive edges and soft internal caustics slide gently across the layers. Locked-off camera, no focus change.

No movement of the objects themselves. No liquid, smoke, particles, bubbles or dust. No colour change beyond honey, champagne and near-black. No zoom or camera motion. No text. No cuts.
```

5. **Duration and loop:** shortest 16:9 option offered; I crop to 4:5. Loop tested in the browser.
6. **Sound:** none.
7. **Output handling:** upload as `lens-loop-source.mp4`. I produce a 900 px-wide WebM/MP4 under 1.2 MB with the still as poster; same loading rules as above.
8. **Credits:** report the cost shown in Flow first.
9. **Acceptance:** no flicker or popping highlights; edges stay near-black; nothing reads as biological; seamless or cleanly cross-faded.
