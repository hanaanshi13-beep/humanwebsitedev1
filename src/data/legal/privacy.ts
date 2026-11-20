// Privacy Policy — interim prototype notice (see ./types.ts). Every statement about what the website processes was
// checked against the code and tests on 2026-11-20:
//   - waitlist demonstration sends nothing and stores nothing (src/scripts/portal.ts; tests HP-09, HP-10)
//   - no cookies, no analytics, no third-party requests, self-hosted fonts (tests NO-TRACKERS, HP-10)
// If any of that changes (a host with analytics, a live endpoint, a contact form), this notice must change first.
import type { LegalDoc } from './types';
import { INTERIM_DATE } from './types';
import { PRIVACY_EMAIL } from '../site';

export const PRIVACY: LegalDoc = {
  id: 'privacy',
  heading: 'Your privacy matters.',
  intro: [
    'Your health is personal. So is the information you choose to share with us.',
    'This notice explains what this website does, and does not do, with information. It is an interim notice for a prototype website, not a professionally reviewed legal document.',
  ],
  updated: INTERIM_DATE,
  updatedAt: 'top',
  status: 'interim',
  sections: [
    {
      title: 'About this website',
      blocks: [
        { p: 'HUMAN is a preventive health platform currently in development.' },
        { p: 'This website is a prototype. It demonstrates the proposed HUMAN experience and the health plans we are developing. It does not provide health services, sell memberships or register members.' },
      ],
    },
    {
      title: 'The waitlist demonstration',
      blocks: [
        { p: 'The waitlist on this website is a demonstration of how registration is intended to work. Please use fictional details.' },
        { p: 'It asks for:' },
        {
          ul: [
            'A first name.',
            'An age group (optional).',
            'A gender, including a self-described option (optional).',
            'Health interests (optional).',
            'An email address.',
            'A mobile number (optional).',
            'A city (optional).',
            'Agreement to receive waitlist and launch updates.',
          ],
        },
        { p: 'Whatever is entered stays in your browser for that visit. It is not sent to HUMAN, it is not saved, and it is cleared when you leave or reload the page. Completing the demonstration does not add you to a list.' },
      ],
    },
    {
      title: 'What this website processes',
      blocks: [
        { p: 'This website does not set cookies, does not use analytics or advertising tools, and does not load content from third-party services.' },
        { p: 'As with any website, the service that hosts it may automatically process standard technical information needed to deliver its pages, such as your IP address, browser type and the pages requested.' },
        { p: 'If you write to us by email, we receive your email address and whatever you choose to include in your message. We use it to reply to you.' },
      ],
    },
    {
      title: 'Your health information',
      blocks: [
        { p: 'Visiting this website or completing the demonstration does not establish a medical relationship with HUMAN.' },
        { p: 'Please do not send us medical reports, prescriptions or other medical records.' },
      ],
    },
    {
      title: 'Development testing',
      blocks: [
        { p: 'Separately from this website, our team tests the registration system in a private development environment, using test information. The demonstration on this website is not connected to it.' },
      ],
    },
    {
      title: 'Children',
      blocks: [{ p: 'This website is intended for adults. Please do not enter or send a child’s personal or medical information.' }],
    },
    {
      title: 'Before HUMAN launches',
      blocks: [
        { p: 'Before HUMAN accepts real registrations or offers any service, this notice will be replaced by a full Privacy Policy prepared with professional legal advice. It will explain what is collected, why, how long it is kept and the choices you have.' },
      ],
    },
    {
      title: 'Get in touch',
      blocks: [
        { p: 'If you have a question about your privacy or a request about your information, please write to us.' },
        { fields: [{ label: 'Email', value: `[[${PRIVACY_EMAIL}|mailto:${PRIVACY_EMAIL}]]` }] },
      ],
    },
  ],
};
