// HUMAN Portal — the single source for chapter copy, questionnaire options, asset mapping and motion timing.
// Headlines are approved copy: do not edit them here without a founder decision.

export const CHAPTERS = [
  { n: 1, key: 'opening', l1: 'Welcome', l2: 'to Human.' },
  { n: 2, key: 'individual', l1: 'Let’s get to', l2: 'know you.' },
  { n: 3, key: 'discovery', l1: 'What matters', l2: 'to you?' },
  { n: 4, key: 'invitation', l1: 'Be among', l2: 'the first.' },
  { n: 5, key: 'finale', l1: 'You’re on', l2: 'the list.' },
] as const;

export const AGE_GROUPS = ['18–24', '25–34', '35–44', '45–54', '55+', 'Prefer not to say'] as const;
export const GENDERS = ['Female', 'Male', 'Other / self-describe', 'Prefer not to say'] as const;
export const SELF_DESCRIBE = 'Other / self-describe';

/** The supplied asset library. `file` is the original in src/assets/portal/originals. */
export const ASSETS = {
  A01: { file: 'A01-blood-tube.webp', alt: 'A blood collection tube labelled HUMAN Bloodwork, floating against a warm cream background.' },
  A02: { file: 'A02-blood-macro.webp', alt: 'Extreme close-up of the labelled tube, with small bubbles in the red sample.' },
  A03: { file: 'A03-red-blood-cells.webp', alt: 'Illustration of red blood cells drifting in warm light.' },
  A04: { file: 'A04-outdoor-friends.webp', alt: 'Six friends posing together outdoors at sunset, arms outstretched.' },
  A05: { file: 'A05-female-runners.webp', alt: 'Two women running side by side on a red track, seen from above.' },
  A06: { file: 'A06-womens-portrait.webp', alt: 'A young woman sitting on stone steps, smiling and looking away.' },
  A07: { file: 'A07-male-runner.webp', alt: 'A man tying his running shoe beside a car in a pine forest on a wet morning.' },
  A08: { file: 'A08-muscular-system.webp', alt: 'Illustration of the muscles of the human torso, lit in amber.' },
  A09: { file: 'A09-endocrine-system.png', alt: 'Illustration of a human torso with glands and organs highlighted in amber.' },
  A10: { file: 'A10-mens-formal-portrait.webp', alt: 'A young man in a dark suit sitting outdoors, looking into the distance.' },
  A11: { file: 'A11-dna.webp', alt: 'Illustration of a glowing DNA double helix.' },
  A12: { file: 'A12-cell.webp', alt: 'Illustration of a single cell with its inner structures, lit in amber.' },
  A13: { file: 'A13-nighttime-friends.webp', alt: 'A group of friends laughing together on stone steps outside a lamplit building at night.' },
  A14: { file: 'A14-corporate-professionals.webp', alt: 'Three colleagues laughing together around a laptop in a sunlit office.' },
} as const;
export type AssetId = keyof typeof ASSETS;

/**
 * Chapter 03: what each interest shows. `fit: 'frame'` keeps the whole picture visible inside the panel over a
 * blurred copy of itself (used for the landscape photograph and the small endocrine image, which must not be
 * enlarged). `then` is a second image the panel moves on to (lifestyle → anatomy).
 * A15 (cardiovascular) has not been supplied: Heart health uses A03 until it is.
 */
export type Visual = { asset: AssetId; fit?: 'cover' | 'frame'; pos?: string; then?: AssetId; thenPos?: string; zoom?: number; origin?: string; glow?: boolean; kind: 'science' | 'life' };
export const INTERESTS: { key: string; label: string; visual: Visual }[] = [
  { key: 'preventive', label: 'Preventive health', visual: { asset: 'A01', pos: '50% 50%', kind: 'science' } },
  { key: 'fitness', label: 'Fitness & performance', visual: { asset: 'A05', pos: '50% 40%', then: 'A08', thenPos: '50% 30%', kind: 'life' } },
  { key: 'hormonal', label: 'Hormonal health', visual: { asset: 'A09', fit: 'frame', kind: 'science' } },
  { key: 'heart', label: 'Heart health', visual: { asset: 'A03', pos: '60% 50%', glow: true, kind: 'science' } },
  { key: 'energy', label: 'Energy & metabolism', visual: { asset: 'A12', pos: '50% 45%', kind: 'science' } },
  { key: 'womens', label: 'Women’s health', visual: { asset: 'A06', pos: '50% 22%', kind: 'life' } },
  { key: 'mens', label: 'Men’s health', visual: { asset: 'A10', pos: '50% 22%', kind: 'life' } },
  { key: 'longevity', label: 'Longevity', visual: { asset: 'A11', pos: '50% 50%', kind: 'science' } },
  { key: 'sleep', label: 'Sleep & recovery', visual: { asset: 'A07', pos: '100% 50%', zoom: 1.5, origin: '74% 56%', kind: 'life' } },
  { key: 'wellbeing', label: 'Overall wellbeing', visual: { asset: 'A04', fit: 'frame', kind: 'life' } },
];
export const DEFAULT_VISUAL: Visual = { asset: 'A02', pos: '45% 50%', kind: 'science' };

/** Motion timing in milliseconds, shared by CSS (as custom properties) and script. */
export const MOTION = {
  feedback: 160,
  type: 760,
  image: 1000,
  chapterOut: 280,
  bloodwork: { textOut: 300, tubeStart: 300, macroStart: 700, cellsStart: 1100, handover: 1500, end: 1900 },
  finale: 1700,
} as const;

/** Version label recorded with consent. The notice itself is still a draft: a launch prerequisite. */
export const PRIVACY_NOTICE_VERSION = 'draft-unapproved';
