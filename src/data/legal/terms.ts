// Terms of Use — interim prototype notice (see ./types.ts). No legal entity, address, governing-law or compliance
// statement is made here: none has been confirmed.
import type { LegalDoc } from './types';
import { INTERIM_DATE } from './types';
import { CONTACT_EMAIL } from '../site';

export const TERMS: LegalDoc = {
  id: 'terms',
  heading: 'Using HUMAN.',
  intro: [
    'We want your experience with HUMAN to be simple, transparent and built on trust.',
    'These terms explain what this website is and what you can expect from it. They are an interim notice for a prototype website, not a professionally reviewed legal document.',
  ],
  updated: INTERIM_DATE,
  updatedAt: 'top',
  status: 'interim',
  sections: [
    {
      title: 'What this website is',
      blocks: [
        { p: 'HUMAN is a preventive health platform currently in development.' },
        { p: 'This website is a prototype that demonstrates the proposed HUMAN experience: our approach, the health plans we are developing and how joining is intended to work.' },
      ],
    },
    {
      title: 'Nothing is available to buy',
      blocks: [
        { p: 'No membership can be purchased through this website, and no medical, testing or other health service is currently available.' },
        { p: 'The health plans shown are concepts in development. Their names, features, tests included, pricing and availability may change before launch, and not every plan shown may be offered.' },
      ],
    },
    {
      title: 'The waitlist demonstration',
      blocks: [
        { p: 'The waitlist on this website is a demonstration. Completing it:' },
        {
          ul: [
            'Does not register you or add you to a list.',
            'Does not purchase a membership.',
            'Does not establish a medical relationship with HUMAN.',
            'Does not guarantee access to a particular plan or launch date.',
          ],
        },
        { p: 'Our [[Privacy Policy|/privacy]] explains what happens to information entered into it.' },
      ],
    },
    {
      title: 'Health information on this website',
      blocks: [
        { p: 'The health-related information on this website is general, informational and illustrative. It is not a substitute for professional medical advice, diagnosis or treatment.' },
        { p: 'Please read our [[Medical Disclaimer|/medical-disclaimer]] for more information.' },
      ],
    },
    {
      title: 'Photographs and illustrations',
      blocks: [
        { p: 'The photographs on this website are illustrative. The people shown are not HUMAN members or customers.' },
        { p: 'Anatomical visuals, example reports and other illustrations show ideas, not a real person’s health information.' },
      ],
    },
    {
      title: 'Our content',
      blocks: [
        { p: 'The HUMAN brand, website designs, written content, photographs and illustrations belong to HUMAN or their respective rights holders.' },
        { p: 'You are welcome to explore the website and share links to it. Please do not reproduce its materials for commercial purposes without permission.' },
      ],
    },
    {
      title: 'Changes',
      blocks: [{ p: 'This website and these terms will change as HUMAN develops. Before HUMAN launches, they will be replaced by full Terms of Use prepared with professional legal advice.' }],
    },
    {
      title: 'Contact us',
      blocks: [
        { p: 'If you have any questions about HUMAN or this website, we would be happy to hear from you.' },
        { fields: [{ label: 'Email', value: `[[${CONTACT_EMAIL}|mailto:${CONTACT_EMAIL}]]` }] },
      ],
    },
  ],
};
