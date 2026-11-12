// Shared navigation + verified-status facts. Nothing here is a live-service claim.
export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/women', label: 'For Her' },
  { href: '/men', label: 'For Him' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

export const LEGAL = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/medical-disclaimer', label: 'Medical disclaimer' },
];

// PENDING: no verified public contact address yet. Leave null until a founder confirms one.
export const CONTACT_EMAIL: string | null = null;

// Waitlist backend. Empty string = preview mode (no network request is ever made).
// Only set after legal + backend approval (docs/HUMAN-RELEASE-GATES.md).
export const WAITLIST_ENDPOINT: string = import.meta.env.PUBLIC_WAITLIST_ENDPOINT ?? '';

export const STAGES = [
  {
    key: 'test',
    name: 'Test',
    line: 'Relevant testing, considered in context.',
    detail:
      'Planned: testing chosen with professional context rather than a one-size-fits-all panel. What is included is still being developed and will be clinically reviewed.',
  },
  {
    key: 'understand',
    name: 'Understand',
    line: 'Clear explanations of what results mean.',
    detail:
      'Planned: help making results easier to interpret, with appropriate professional context — so a report reads as information, not a wall of numbers.',
  },
  {
    key: 'act',
    name: 'Act',
    line: 'Sensible next steps, with qualified guidance.',
    detail:
      'Planned: a way to agree on appropriate priorities, subject to suitably qualified guidance. Not automated advice.',
  },
  {
    key: 'track',
    name: 'Track',
    line: 'Staying connected to follow-through.',
    detail: 'Planned: a way to stay close to what you decided to do, over weeks and months rather than a single visit.',
  },
  {
    key: 'retest',
    name: 'Retest',
    line: 'Revisiting selected markers when appropriate.',
    detail:
      'Planned: looking again at the indicators that matter for you, when it makes sense for you — not a blanket schedule.',
  },
  {
    key: 'improve',
    name: 'Improve',
    line: 'Learning from what changes over time.',
    detail:
      'Planned: learning from trends and adjusting decisions over time. HUMAN does not promise any particular result.',
  },
];

export const STATES_AND_UTS = [
  // 28 states
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // 8 union territories
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi (NCT)',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
