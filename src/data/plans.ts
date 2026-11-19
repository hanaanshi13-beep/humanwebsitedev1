// HUMAN — Explore Plans. The single source for the membership architecture: nine categories, 41 plan names.
//
// STATUS: every name below is a membership being developed, not a service on offer. Nothing here carries a price,
// a panel, a testing frequency or a clinical claim, and none may be added without clinical, diagnostic-partner and
// operational review. Overall Health for Him and for Her are the current development priorities; the rest is the
// wider roadmap. Names are founder-approved copy: do not rename, reorder or remove them here without a decision.
//
// To add a category: add its photograph to src/assets/memberships/ (named human-for-<id>.webp) and one entry below.
// `focus` is the object-position used when the overlay crops the photograph to a narrower portrait (desktop);
// `focusWide` is used when it crops to a wide band (phones). Cards show the whole 3:4 photograph, uncropped.

export type PlanStatus = 'in-development';

export interface PlanCategory {
  /** stable identifier, also the photograph's filename suffix */
  id: string;
  /** full category name */
  name: string;
  /** the italic title shown on the card and in the overlay */
  title: string;
  /** describes the photograph (people shown are models, not HUMAN members) */
  alt: string;
  focus: string;
  focusWide: string;
  /** average colour of the photograph: shown while it loads, and if it fails to load */
  tint: string;
  /** strength of the card's lower gradient, 0–1: brighter photographs need a little more for the white title */
  shade: number;
  plans: string[];
  status: PlanStatus;
}

export const STATUS_NOTE: Record<PlanStatus, string> = {
  'in-development': 'Memberships currently in development.',
};

export const PLAN_CATEGORIES: PlanCategory[] = [
  {
    id: 'him',
    name: 'HUMAN for Him',
    title: 'for Him.',
    alt: 'Three men of different generations sitting close together in warm window light, dressed in cream linen.',
    focus: '50% 30%',
    focusWide: '50% 12%',
    tint: '#98714f',
    shade: 0.8,
    plans: ['Overall Health', 'Energy & Hormones', 'Weight & Blood Sugar', 'Sexual & Fertility Health', 'Healthy Ageing'],
    status: 'in-development',
  },
  {
    id: 'her',
    name: 'HUMAN for Her',
    title: 'for Her.',
    alt: 'Three women of different generations sitting close together in warm window light, dressed in ivory.',
    focus: '50% 30%',
    focusWide: '50% 10%',
    tint: '#8b694c',
    shade: 0.8,
    plans: ['Overall Health', 'Periods & Hormones', 'Energy & Nutrition', 'Weight & Blood Sugar', 'Menopause & Healthy Ageing'],
    status: 'in-development',
  },
  {
    id: 'athletes',
    name: 'HUMAN for Athletes',
    title: 'for Athletes.',
    alt: 'A man in black training kit flexing one arm in front of an event backdrop, a finisher’s lanyard around his neck.',
    focus: '50% 30%',
    focusWide: '50% 17%',
    tint: '#3d2d21',
    shade: 0.6,
    plans: [
      'HYROX & Hybrid Athletes',
      'Runners & Endurance Athletes',
      'Strength & Physique Athletes',
      'Cyclists & Triathletes',
      'Competitive & Team Sports',
      'Everyday Fitness',
    ],
    status: 'in-development',
  },
  {
    id: 'seniors',
    name: 'HUMAN for Seniors',
    title: 'for Seniors.',
    alt: 'An older couple outdoors under trees, smiling at each other mid-conversation.',
    focus: '50% 40%',
    focusWide: '50% 36%',
    tint: '#6d634c',
    shade: 0.76,
    plans: ['Active Ageing', 'Comprehensive Senior Health', 'Strength & Independence', 'Assisted Health Monitoring'],
    status: 'in-development',
  },
  {
    id: 'families',
    name: 'HUMAN for Families',
    title: 'for Families.',
    alt: 'Three generations of a family sharing lunch around a wooden table, a grandmother serving a child.',
    focus: '52% 40%',
    focusWide: '50% 33%',
    tint: '#87715e',
    shade: 0.78,
    plans: ['Family Essential', 'Extended Family', 'Parents’ Health', 'Build Your Family Plan'],
    status: 'in-development',
  },
  {
    id: 'professionals',
    name: 'HUMAN for Professionals',
    title: 'for Professionals.',
    alt: 'Four colleagues in discussion around a table with laptops in a glass-walled office.',
    focus: '50% 45%',
    focusWide: '50% 40%',
    tint: '#5f503a',
    shade: 0.72,
    plans: ['Workplace Health', 'Executive Health', 'Shift Worker Health', 'Frequent Traveller Health', 'Corporate Membership'],
    status: 'in-development',
  },
  {
    id: 'young-adults',
    name: 'HUMAN for Young Adults',
    title: 'for Young Adults.',
    alt: 'Four university students laughing together on campus steps in the sun.',
    focus: '50% 45%',
    focusWide: '50% 36%',
    tint: '#5e554a',
    shade: 0.74,
    plans: ['Student Health', 'Early Career Health', 'Active Lifestyle', 'First Health Check'],
    status: 'in-development',
  },
  {
    id: 'kids',
    name: 'HUMAN for Kids',
    title: 'for Kids.',
    alt: 'Three children sitting on the grass in a sunny park, laughing, one holding a football.',
    focus: '50% 45%',
    focusWide: '50% 38%',
    tint: '#736e52',
    shade: 0.78,
    plans: ['Early Childhood', 'School-Age Health', 'Adolescent Health', 'Young Sportspeople'],
    status: 'in-development',
  },
  {
    id: 'couples',
    name: 'HUMAN for Couples',
    title: 'for Couples.',
    alt: 'A young couple laughing in a sunlit kitchen, one holding a mug while the other slices fruit.',
    focus: '50% 35%',
    focusWide: '50% 26%',
    tint: '#856c54',
    shade: 0.76,
    plans: ['Everyday Couples', 'Active Couples', 'Preparing for Parenthood', 'Healthy Ageing Together'],
    status: 'in-development',
  },
];
