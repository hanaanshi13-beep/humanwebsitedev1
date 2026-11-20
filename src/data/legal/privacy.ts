// Privacy Policy — DRAFT for review. 12 sections. Founder-supplied wording (2026-11); not legally approved.
// Do not publish while any {{placeholder}} remains. See docs/HUMAN-LEGAL-REVIEW-REGISTER.md.
import type { LegalDoc } from './types';

export const PRIVACY: LegalDoc = {
  id: 'privacy',
  heading: 'Your privacy matters.',
  intro: [
    'Your health is personal. So is the information you choose to share with us.',
    'We believe you should always understand what information you are sharing, why it is needed and how it is being used.',
    'This Privacy Policy explains how HUMAN handles your personal information when you visit our website or join our waitlist.',
  ],
  updated: '{{Date of publication}}',
  updatedAt: 'top',
  draft: true,
  sections: [
    {
      title: 'Who we are',
      blocks: [
        { p: 'HUMAN is a preventive health platform being developed to help people better understand their health through blood tests and personalised health insights.' },
        { p: 'This policy applies to our website and the information you share with us through it.' },
        { p: 'The website is operated by {{legal name and contact details of the responsible individual or business}}.' },
      ],
    },
    {
      title: 'What information we collect',
      blocks: [
        { p: 'When you join our waitlist, contact us or complete a form on our website, we may collect information that you choose to share with us.' },
        { p: 'This may include:' },
        {
          ul: [
            'Your name.',
            'Your contact information.',
            'Your age or age group.',
            'Your location.',
            'Your health interests and preferences.',
            'Information you provide through questionnaires or enquiries.',
          ],
        },
        { pending: 'Confirm the exact information collected by the current website and its forms before publication.' },
      ],
    },
    {
      title: 'Why we collect your information',
      blocks: [
        { p: 'We collect information for specific purposes connected to HUMAN.' },
        { p: 'These may include:' },
        {
          ul: [
            'Registering your interest in HUMAN.',
            'Keeping you informed about our progress and upcoming availability.',
            'Understanding what people need from a preventive health platform.',
            'Improving our website and developing our services.',
            'Responding to your questions and enquiries.',
          ],
        },
        { p: 'We aim to collect only the information necessary for the purpose for which it is being requested.' },
      ],
    },
    {
      title: 'Your health information',
      blocks: [
        { p: 'We understand that information about your health is particularly personal.' },
        { p: 'HUMAN is currently in development. Visiting our website or joining our waitlist does not establish a medical relationship with HUMAN.' },
        { p: 'Please do not send medical reports, prescriptions or detailed medical records through ordinary website contact forms unless we specifically provide an appropriate way to receive them.' },
        { p: 'Before introducing blood testing and personalised health services, we will explain how the information required for those services will be collected, used and protected.' },
      ],
    },
    {
      title: 'Who we share your information with',
      blocks: [
        { p: 'Running a website may require the support of trusted technology and service providers.' },
        { p: 'These may include website hosting providers, data storage services, email communication tools and other services necessary to operate HUMAN.' },
        { p: 'Where information is shared, it should be limited to what is necessary for the relevant purpose and handled in accordance with applicable law.' },
        { p: 'We may also need to disclose information when legally required to do so.' },
        { pending: 'Insert the actual service providers or recipient categories, their purposes and relevant data-sharing arrangements.' },
      ],
    },
    {
      title: 'How we protect your information',
      blocks: [
        { p: 'We understand the responsibility that comes with handling personal information.' },
        { p: 'We are committed to taking reasonable measures to protect your information from unauthorised access, misuse, loss or disclosure.' },
        { p: 'However, no online platform can guarantee complete security.' },
        { pending: 'Insert the verified security measures used by HUMAN.' },
      ],
    },
    {
      title: 'Cookies and website analytics',
      blocks: [
        { p: 'Cookies are small files that websites may store on your device. They can help a website function properly, remember preferences or understand how visitors use it.' },
        { pending: 'Explain the cookies and analytics tools actually used by HUMAN, their purposes and how visitors can manage their preferences.' },
      ],
    },
    {
      title: 'How long we keep your information',
      blocks: [
        { p: 'We aim to keep your personal information only for as long as it is needed for the purpose for which it was collected, or as required by law.' },
        { pending: 'Insert the actual retention and deletion periods for waitlist information, enquiries and other collected data.' },
      ],
    },
    {
      title: 'Your information, your choices',
      blocks: [
        { p: 'You should have a say in how your personal information is handled.' },
        { p: 'Subject to applicable law, you may contact us to:' },
        {
          ul: [
            'Find out what personal information we hold about you.',
            'Request corrections to your information.',
            'Request deletion of your information.',
            'Withdraw consent where processing is based on your consent.',
            'Stop receiving promotional communications.',
            'Raise a concern about how your information is being handled.',
          ],
        },
        { p: 'Some information may need to be retained where we have a legal obligation to keep it.' },
      ],
    },
    {
      title: 'Children’s privacy',
      blocks: [
        { p: 'Although HUMAN is exploring preventive health plans for children, those services are not currently available.' },
        { p: 'Our website waitlist is intended for individuals aged 18 and above.' },
        { p: 'Parents or legal guardians may register their own interest in future family and children’s plans.' },
        { p: 'Please do not submit a child’s personal or medical information unless an appropriate process and necessary consent arrangements have been established.' },
      ],
    },
    {
      title: 'Changes to this policy',
      blocks: [
        { p: 'As HUMAN develops, our website and services may change.' },
        { p: 'We may update this Privacy Policy to reflect those changes. Where appropriate, we will inform you about significant changes and seek your consent when required.' },
      ],
    },
    {
      title: 'Get in touch',
      blocks: [
        { p: 'If you have a question about your privacy, want to exercise your rights or have a concern about your personal information, please contact us.' },
        {
          fields: [
            { label: 'Email', value: '{{Verified privacy contact email}}' },
            { label: 'Responsible contact or grievance officer', value: '{{Name and contact details}}' },
          ],
        },
        { p: 'Your trust matters to us, and we want you to feel comfortable asking questions about the information you share with HUMAN.' },
      ],
    },
  ],
};
