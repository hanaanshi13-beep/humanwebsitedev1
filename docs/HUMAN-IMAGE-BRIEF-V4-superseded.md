# HUMAN — image brief for manual generation (V4)

**Why this exists:** the cloud session that builds the site cannot control Chrome, so it cannot drive Gemini or Flow. These are the images the site is missing, in priority order, with one prompt each. Generate them in Gemini (strongest thinking setting for the chat model; note which image model the interface names) and send the files back.

**Status of every image below:** not generated. Nothing here is on the site yet.

## How to run each shot

1. Start a new Gemini chat per shot. Attach the approved hero image as a *style reference only* and say so (the prompts already tell it not to copy the people).
2. Paste the **Global style block**, then the **shot prompt**, as one message.
3. Generate **one** image. Check it against the **Reject if** list. Allow one corrective retry, naming the exact flaw ("the left hand has six fingers", "remove the amber haze behind the head"). If the second try also fails, stop and move on; tell me which shot failed.
4. Download the **full-resolution original** (not a screenshot, not a chat preview). Do not crop, upscale, filter or add text.
5. Name the file exactly as given and upload it to this session. Any order is fine.

**Sizes:** ask for the largest size offered. Minimum useful long edge is 2400 px for landscape shots and 1800 px for portrait shots. If Gemini only returns about 1024 px, send it anyway and say so; I will judge it in the layout.

**People:** all subjects are fictional campaign models. No real person, celebrity or lookalike. Every shot uses different people from the hero and from each other.

---

## Global style block (paste before every shot prompt)

```
You are producing ONE photographic asset for a premium brand website. It is a photograph, not a website mock-up, not an illustration, not a 3D render.

BRAND: HUMAN, an India-focused preventive-health membership that is still in development. Mood: calm, adult, intelligent, optimistic, quietly luxurious. Never clinical, never alarming, never sci-fi.

PHOTOGRAPHIC STANDARD: high-end editorial campaign photography, the quality of a luxury wellness or fashion-house campaign shot on a medium-format digital camera (Fujifilm GFX 100 or Hasselblad X2D class). Natural optical depth of field, real lens falloff, fine natural film-like grain, true-to-life colour. Skin must look like real skin: visible pores, fine lines, slight unevenness, natural under-eye texture, real flyaway hairs. No beauty-filter smoothing, no waxy or plastic skin, no over-sharpening, no HDR look.

PEOPLE: fictional South Asian (Indian) adults with believable, individual faces. Relaxed, asymmetric, unposed body language. Natural expressions caught between moments, not smiling at the camera, not stock-photo cheerful. Anatomically correct hands with five fingers, natural nails, correct teeth and eyes.

LIGHT AND COLOUR: one motivated soft key light with gentle falloff, deep neutral shadows that keep detail, and a restrained warm rim or practical light only where the scene justifies it. Palette: warm near-black charcoal (#0B0D0F), soft ivory (#F6F3EC), muted natural skin and fabric tones, a single controlled amber accent (#E8A523) used sparingly. No all-over orange or yellow wash. No teal-and-orange grading.

WARDROBE AND STYLING: contemporary, understated, well-made everyday clothing in natural fabrics (cotton, linen, fine knit, handloom textures). No visible logos or branding. No gym wear unless stated. No costume-like "ethnic" styling; clothing should look like what a well-dressed urban Indian adult actually wears.

ABSOLUTELY EXCLUDE: text, letters, numbers, captions, logos, watermarks, UI, buttons, phone or laptop screens showing content, charts, medical equipment, hospitals, lab coats, stethoscopes, pills, syringes, glowing DNA, holograms, floating particles or bubbles, light ribbons, lens-flare halos behind heads, smoke or haze, neon, fantasy elements, duplicated faces, extra limbs or fingers, cartoon or CGI look.

The attached image is a STYLE REFERENCE ONLY for lighting quality, tonal depth and finish. Do not reproduce its people, pose or composition.
```

---

## Priority 1 — the two portal images (homepage "For Her" / "For Him", and the top of each page)

These replace flat gradients, so they matter most.

### P1-A · `portal-her.png` — 3:4 portrait, largest size

```
SHOT: an environmental editorial portrait for the "HUMAN for Her" entry panel.

SUBJECT: one Indian woman, around 34–38, strong and composed, intelligent eyes. Shoulder-length dark hair worn naturally, a few loose strands. Minimal make-up, real skin. She wears a deep garnet (dark wine, #54263B) silk-cotton shirt with the sleeves pushed up, one fine gold ring, small gold ear studs. No bindi-and-sari styling, no bridal styling.

ACTION AND EXPRESSION: seated sideways on a low upholstered chair, torso turned three-quarters to camera, one forearm resting on the chair back, gaze directed just past the lens to camera-left, mid-thought, the faintest beginning of a smile. Self-possessed, not posing.

SETTING: a quiet, dim, well-designed interior at dusk. Behind her, a wall in deep mulberry plaster with a soft texture, and a sliver of sheer curtain with fading daylight at the far right edge. One out-of-focus ceramic vessel on a dark wood surface in the background. The environment is felt, not shown in detail.

COMPOSITION: vertical 3:4. Subject occupies the right two-thirds. Her eyes sit on the upper third line. The LEFT third of the frame and the BOTTOM quarter are calm, dark, uncluttered mulberry shadow, because live website text will be placed there. Nothing important within 8% of any edge. Camera at her eye level.

LENS AND LIGHT: 85mm equivalent at f/2.8, shallow depth of field, background softly defocused. Key light is soft window light from camera-right at 45 degrees, wrapping her face with gentle shadow on the left cheek. A very subtle warm rim on her hair and shoulder from a practical lamp out of frame behind her. Shadows are deep garnet-black, never pure black, never pink.

COLOUR: a rich garnet and mulberry world with neutral, accurate skin tones. Not pink. Not magenta. No amber wash.

AVOID IN THIS SHOT: flowers, pregnancy or fertility cues, yoga poses, spa imagery, jewellery-ad glamour, soft-focus "feminine" clichés.
```

**Reject if:** the palette reads pink; the left third is busy; she looks at the camera with a stock smile; skin looks airbrushed.

### P1-B · `portal-him.png` — 3:4 portrait, largest size

```
SHOT: an environmental editorial portrait for the "HUMAN for Him" entry panel. It must feel like the companion to a garnet portrait of a woman: same maturity, same quality, equal presence.

SUBJECT: one Indian man, around 36–42, thoughtful and at ease. Short dark hair with a little natural grey at the temples, light well-kept stubble. He wears a deep ocean-teal (#164846) fine-gauge crew-neck knit over a white T-shirt collar barely visible, a simple steel watch. Average healthy build, not muscular, not a fitness model.

ACTION AND EXPRESSION: standing, leaning one shoulder against a wall, arms loosely folded low, weight on one leg. Head turned slightly to camera-right, eyes looking out of frame toward soft light, calm and reflective, mouth relaxed. Not brooding, not smouldering.

SETTING: the shaded verandah or corridor of a modern Indian home in the blue hour. Wall in deep teal-grey lime plaster. At the far left edge, a narrow out-of-focus band of cool evening sky and one dark leaf of a potted plant. Quiet, architectural, real.

COMPOSITION: vertical 3:4. Subject occupies the left two-thirds. His eyes sit on the upper third line. The RIGHT third of the frame and the BOTTOM quarter are calm, dark, uncluttered teal shadow, because live website text will be placed there. Nothing important within 8% of any edge. Camera at his eye level.

LENS AND LIGHT: 85mm equivalent at f/2.8. Key light is cool-neutral soft evening light from camera-left at 45 degrees. A faint warm practical light from inside the house touches the edge of his jaw and shoulder on the right, giving a restrained warm-against-cool contrast. Shadows are deep teal-black with detail.

COLOUR: a deep ocean-teal world with neutral, accurate skin tones. No cyan cast on skin. No amber wash.

AVOID IN THIS SHOT: gym, weights, sportswear, suits and boardroom imagery, crossed-arms "power pose" high on the chest, whisky-ad masculinity, dramatic scowl.
```

**Reject if:** he looks like a fitness or corporate stock model; skin has a blue cast; the right third is busy.

---

## Priority 2 — Scene 01 "CARE": three everyday moments, three different people

### P2-A · `care-meal.png` — 4:5 portrait

```
SHOT: a close, quiet kitchen moment. The story beat is "we take care of ourselves in ordinary ways".

SUBJECT: the hands and forearms of an Indian woman in her late 40s, and a soft, partial view of her profile at the top edge of the frame (chin to nose only, out of focus). She wears a rolled-sleeve indigo cotton kurta. Thin plain gold bangle on one wrist.

ACTION: she is tearing fresh coriander over a steel bowl of chopped tomato, cucumber and sprouted moong on a worn wooden board. A halved lime and a small steel katori of salt sit beside it. Mid-motion, a few leaves in the air between fingers and bowl.

SETTING: a real Indian home kitchen counter in dark stone, morning. Slight evidence of use: a damp cloth, a knife with a wooden handle. Background falls to deep charcoal shadow.

COMPOSITION: vertical 4:5, camera at 45 degrees looking down from over her left shoulder. The bowl sits on the lower-right third intersection. The upper-left area is dark and quiet.

LENS AND LIGHT: 50mm equivalent at f/2.8, focus on the fingers and the leaves. A single shaft of soft morning window light from the left rakes across the counter, picking out water droplets on the vegetables and the texture of the wood. Deep neutral shadows.

AVOID IN THIS SHOT: styled food-magazine perfection, smoothie bowls, avocado toast, supplements, measuring scales, anything that reads as a diet.
```

**Reject if:** hands are malformed; the food looks plastic or over-styled.

### P2-B · `care-walk.png` — 3:2 landscape

```
SHOT: an unposed early-morning walk. The story beat is "movement as an ordinary habit".

SUBJECT: an Indian man in his late 50s to early 60s, grey hair, trimmed grey moustache, glasses. He wears a plain off-white cotton shirt with sleeves rolled, dark trousers and simple walking shoes. Upright, unhurried stride.

ACTION: walking left to right along a tree-lined residential lane or park path, mid-stride, hands free, looking ahead down the path with a calm, content expression. He is not exercising for the camera.

SETTING: an Indian city neighbourhood just after sunrise: old trees with long roots, a low boundary wall, dappled light on the path, soft morning haze in the far distance only. No traffic, no signage, no other recognisable people.

COMPOSITION: horizontal 3:2. Subject is full-length and small-to-medium in frame, placed on the right third, walking into the space on the left. The left half is deep tree shadow with soft light patches. Camera at chest height, slightly low.

LENS AND LIGHT: 70mm equivalent at f/4, natural compression. Low warm sunlight from behind-right gives a fine rim on his shoulder and hair; the shadow side is cool and detailed. This warm rim is the only amber in the frame.

AVOID IN THIS SHOT: running gear, earphones, fitness trackers held up, jogging pose, laughing-at-nothing stock expression, tourist landmarks.
```

**Reject if:** it looks like a fitness advert; the light is a uniform orange wash.

### P2-C · `care-rest.png` — 4:5 portrait

```
SHOT: a late-evening moment of rest. The story beat is "we slow down, and we pay attention to how we feel".

SUBJECT: an Indian woman in her late 20s, hair loosely tied, no make-up, wearing an oversized oatmeal cotton-knit sweater. A different person from any other shot.

ACTION: sitting on a wide window ledge with her knees drawn up, both hands wrapped around a plain ceramic cup, head resting lightly against the window frame, eyes open and soft, looking out at the evening. Still, comfortable, not sad.

SETTING: a small city apartment at night. One warm table lamp out of frame. Through the window, the city is only a dark blur with a few distant out-of-focus lights. A folded cotton throw beside her.

COMPOSITION: vertical 4:5. She occupies the lower-left two-thirds in profile; the upper-right is dark window and night. Camera at her seated eye level.

LENS AND LIGHT: 50mm equivalent at f/2. The lamp gives a soft warm key on the near side of her face and hands; cool, faint night light from the window outlines her profile. Shadows deep and neutral.

AVOID IN THIS SHOT: phone in hand, laptop, sleeping in bed, candles and spa props, rain-on-glass melancholy.
```

**Reject if:** she is holding a phone; the mood reads as lonely or unwell.

---

## Priority 3 — Scene 04 "FEELING FINE"

### P3 · `feeling-fine.png` — 3:2 landscape

```
SHOT: a calm, confident everyday portrait. The story beat is "you can feel perfectly fine and still not have the full picture". The person looks well. Nothing in the image suggests illness or worry.

SUBJECT: an Indian man in his early 30s, clean-shaven or light stubble, short hair. He wears a charcoal linen overshirt on a cream T-shirt. A different person from every other shot.

ACTION AND EXPRESSION: sitting at a wooden table in a quiet café or home dining space, one hand loosely around a glass of water, the other resting on the table. He has just looked up from his thoughts and is looking out of a window to camera-left with an easy, open, untroubled expression.

SETTING: daytime interior with large soft window light, pale plaster wall, a dark wood table. Minimal: the glass, a folded newspaper with no legible text, nothing else.

COMPOSITION: horizontal 3:2. Subject on the LEFT third, turned toward the window at the left edge. The RIGHT half of the frame is a calm, softly lit pale wall with gentle gradation and no objects, because website text and labels will be placed there. Camera at his eye level.

LENS AND LIGHT: 85mm equivalent at f/2.8. Broad, soft daylight from the left. Bright, airy, ivory-toned overall (this scene sits on a light page), with natural contrast on his face. No amber accent needed.

AVOID IN THIS SHOT: doctor, consultation, hand on chest or head, tired or anxious expression, wearable devices, phone, laptop.
```

**Reject if:** the right half is cluttered; he looks tired, worried or unwell.

---

## Priority 4 — Scene 07 "INDIVIDUAL JOURNEYS": three people, three lives

Three separate images. Together they must read as different ages, settings and light.

### P4-A · `journey-professional.png` — 4:5 portrait

```
SHOT: a working professional between tasks.

SUBJECT: an Indian woman in her early 40s, short bob haircut, wearing a rust handloom-cotton blazer over a black top, small silver earrings.

ACTION: standing at a tall window in a modern office corridor, holding a closed notebook against her hip, turned three-quarters away, looking out and slightly down at the city, thinking. A real pause in a real day.

SETTING: late afternoon. Glass, concrete and warm wood. The city outside is a soft blur. No screens, no signage, no other faces.

COMPOSITION: vertical 4:5, subject on the right third, three-quarter length. Left side is window light falling across a plain wall.

LENS AND LIGHT: 85mm at f/2.8. Low warm afternoon sun through the glass edges her profile and blazer; interior shadows stay cool and neutral.

AVOID: laptops, lanyards, handshake, meeting room, power pose.
```

### P4-B · `journey-elder.png` — 4:5 portrait

```
SHOT: an older adult in a moment of everyday contentment.

SUBJECT: an Indian woman in her late 60s, silver hair in a low bun, reading glasses pushed up on her head, wearing a soft grey-blue cotton sari with a plain blouse. Warm, lived-in face with real lines.

ACTION: on a shaded balcony, watering a row of potted tulsi and curry-leaf plants with a small brass lota, looking at the plants with quiet amusement.

SETTING: an older apartment balcony with a painted iron railing, morning. Terracotta pots, a cane chair partly in frame. Background trees soft and green-grey.

COMPOSITION: vertical 4:5, subject left of centre, waist-up, with the plants in the lower right foreground slightly out of focus.

LENS AND LIGHT: 50mm at f/2.8. Open shade with soft bounce light on her face; one streak of sun on the brass and the leaves.

AVOID: walking stick, medicine, frailty cues, namaste pose, festival styling.
```

### P4-C · `journey-parent.png` — 3:2 landscape

```
SHOT: a parent in the middle of ordinary family life.

SUBJECT: an Indian father in his mid 30s with a beard, wearing an olive cotton shirt, and his daughter of about 6 seen only from behind or in soft profile (her face is not the subject and should not be clearly identifiable).

ACTION: he is crouched at her level in a doorway, fastening the strap of her school bag, mid-laugh at something she has said. Natural, unstaged.

SETTING: the entrance of an Indian home on a school morning: shoe rack, a steel tiffin on a side table, daylight from the open door.

COMPOSITION: horizontal 3:2. The father's face on the left third in focus; the child in the right foreground, soft. Upper-right area is bright doorway light falling to shadow.

LENS AND LIGHT: 50mm at f/2.2. Soft daylight from the open door as key; warm interior shadows.

AVOID: posed family portrait, everyone looking at camera, matching outfits, toys arranged for the shot.
```

**Reject any P4 image if:** it resembles another P4 image in pose, light or setting; faces look alike.

---

## Priority 5 — optional abstract macro for the Reveal Lens (Scene 03)

Only if the first four priorities are done. The lens currently uses code-drawn artwork, which is acceptable.

### P5 · `lens-macro.png` — 4:5 portrait, no people

```
SHOT: an abstract macro photograph of real physical material, for use as a decorative layer. It must not look like a medical scan, a cell, an organ or a diagram.

SUBJECT: layered sheets of thin, translucent amber-tinted resin and clear optical glass, overlapping at slight angles, with a few fine hair-thin glass fibres resting between the layers. Photographed as a real still life on a black surface.

COMPOSITION: vertical 4:5. The densest detail sits slightly above and right of centre and falls away softly toward all four edges into near-black, so the image can be masked into an oval.

LENS AND LIGHT: 100mm macro at f/5.6, very shallow focus plane running diagonally. One small hard light from behind-left creates precise bright refractive edges and soft internal caustics; a large black card absorbs spill. Colours: near-black, deep honey, pale champagne, a little neutral clear glass.

AVOID: liquid, smoke, bubbles, glitter, iridescent rainbow, sci-fi energy, anything biological.
```

---

## What I do with the files

For each file: check dimensions and quality against the layout at 1440 px and 390 px, crop responsive variants, convert to WebP, wire it into the scene, record it in `docs/HUMAN-ASSET-MANIFEST.md` (source, image model you tell me Gemini named, date, where used), and re-run the browser tests. An image that weakens the page stays out; I will say which and why.

## Flow video

Not requested yet. A hero loop is only worth generating if a full-resolution original of the approved hero still exists (the copy in the repository is a compressed 1672 px upload). Send that original first; I will then write a single image-to-video prompt and give you the credit cost to approve.
