// Medical Disclaimer — interim prototype notice (see ./types.ts). Not medically or legally reviewed.
// Emergency number: 112 is described by the Government of India's Emergency Response Support System as the
// pan-India single emergency number (112.gov.in; PIB release "Pan-India Emergency Number '112' launched").
// Checked 2026-11-20 through search results for those official sites; re-verify before any public launch.
import type { LegalDoc } from './types';
import { INTERIM_DATE } from './types';
import { CONTACT_EMAIL } from '../site';

export const DISCLAIMER: LegalDoc = {
  id: 'disclaimer',
  heading: 'Understanding your health starts with the right information.',
  intro: [
    'HUMAN is being built to make health information easier to access, understand and follow over time.',
    'It is important to understand what this website is and what it is not. This is an interim notice for a prototype website, not a professionally reviewed medical or legal document.',
  ],
  updated: INTERIM_DATE,
  updatedAt: 'end',
  status: 'interim',
  sections: [
    {
      title: 'HUMAN is in development',
      blocks: [
        { p: 'HUMAN is a preventive health platform currently in development. No health service is operating yet.' },
        { p: 'Everything on this website is informational and illustrative. It shows what we intend to build.' },
      ],
    },
    {
      title: 'This website is not medical advice',
      blocks: [
        { p: 'This website does not provide medical diagnosis, treatment or individual medical advice.' },
        { p: 'Decisions about your health should be made with a qualified medical professional who knows your history and circumstances.' },
        { p: 'Do not start, stop or change any medication or treatment because of something you read here.' },
      ],
    },
    {
      title: 'About blood tests',
      blocks: [
        { p: 'Blood tests can provide valuable information, but they are only one part of understanding your health.' },
        { p: 'They cannot detect or rule out every condition, and results need to be understood alongside your symptoms, medical history and other relevant information.' },
      ],
    },
    {
      title: 'If you are feeling unwell',
      blocks: [
        { p: 'Please do not ignore symptoms or delay seeking medical attention because of information on this website or because you are waiting for HUMAN to become available.' },
        {
          urgent: [
            'If you are experiencing a medical emergency, seek immediate medical assistance.',
            'In India, you can call the national emergency number, [[112|tel:112]].',
          ],
        },
        { p: 'HUMAN is not an emergency medical service.' },
      ],
    },
    {
      title: 'The waitlist and our health plans',
      blocks: [
        { p: 'The health plans shown on this website are still being developed, and the waitlist is a demonstration.' },
        { p: 'Using this website does not establish a doctor-patient relationship, provide medical supervision or enrol you in a health service.' },
      ],
    },
    {
      title: 'Questions about this website',
      blocks: [
        { p: `For questions about this website, write to [[${CONTACT_EMAIL}|mailto:${CONTACT_EMAIL}]]. We cannot give medical advice by email.` },
        { statement: ['Our purpose is not to replace your doctor.', 'It is to help you better understand your health.'] },
      ],
    },
  ],
};
