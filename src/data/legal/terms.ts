// Terms of Use — DRAFT for review. 13 sections. Founder-supplied wording (2026-11); not legally approved.
// Do not publish while any {{placeholder}} remains. See docs/HUMAN-LEGAL-REVIEW-REGISTER.md.
import type { LegalDoc } from './types';

export const TERMS: LegalDoc = {
  id: 'terms',
  heading: 'Using HUMAN.',
  intro: [
    'We want your experience with HUMAN to be simple, transparent and built on trust.',
    'These Terms of Use explain what you can expect from our website and what we ask of you when you use it.',
  ],
  updated: '{{Date of publication}}',
  updatedAt: 'top',
  draft: true,
  sections: [
    {
      title: 'About HUMAN',
      blocks: [
        { p: 'HUMAN is a preventive health platform currently in development.' },
        { p: 'We are working towards helping individuals better understand their health through blood tests, personalised insights and tracking changes in their health over time.' },
        { p: 'The information on this website introduces our vision, our approach and the health plans we are developing.' },
      ],
    },
    {
      title: 'Using our website',
      blocks: [
        { p: 'By using our website, you agree to follow these Terms of Use.' },
        { p: 'You are welcome to explore HUMAN, learn about our approach and register your interest in our upcoming services.' },
        { p: 'We ask that you use the website responsibly and provide accurate information whenever you complete a form.' },
      ],
    },
    {
      title: 'Our health plans',
      blocks: [
        { p: 'The health plans displayed on our website represent services and membership concepts that we are developing.' },
        { p: 'Their names, features, testing inclusions, pricing and availability may change as development progresses.' },
        { p: 'Displaying a health plan on our website does not mean that it is currently available for purchase or that every proposed feature will be included at launch.' },
        { p: 'Confirmed membership details will be shared before the relevant services become available.' },
      ],
    },
    {
      title: 'Joining the waitlist',
      blocks: [
        { p: 'Joining the HUMAN waitlist allows you to register your interest in our upcoming platform.' },
        { p: 'Joining the waitlist:' },
        {
          ul: [
            'Does not purchase a membership.',
            'Does not require you to purchase a membership in the future.',
            'Does not establish a medical relationship with HUMAN.',
            'Does not guarantee access to a particular plan or launch date.',
          ],
        },
        { p: 'You remain free to decide whether HUMAN is right for you when our services become available.' },
      ],
    },
    {
      title: 'Health information on our website',
      blocks: [
        { p: 'The health-related information on our website is intended for general educational and informational purposes.' },
        { p: 'It is not a substitute for professional medical advice, diagnosis or treatment.' },
        { p: 'You should speak with a qualified medical professional if you have questions or concerns about your health.' },
        { p: 'Please read our [[Medical Disclaimer|/medical-disclaimer]] for more information.' },
      ],
    },
    {
      title: 'Eligibility',
      blocks: [
        { p: 'Our current waitlist is intended for individuals aged 18 and above.' },
        { p: 'If you are a parent or legal guardian, you may register your own interest in future plans designed for families or children.' },
        { p: 'Joining the waitlist does not confirm eligibility for any future health service.' },
      ],
    },
    {
      title: 'Responsible use',
      blocks: [
        { p: 'We ask that you use our website respectfully and lawfully.' },
        { p: 'Please do not:' },
        {
          ul: [
            'Submit false or misleading information.',
            'Attempt to access information or systems without permission.',
            'Interfere with the operation or security of our website.',
            'Misuse the website or its content.',
            'Submit another person’s personal information without appropriate permission.',
          ],
        },
      ],
    },
    {
      title: 'Our content',
      blocks: [
        { p: 'The HUMAN brand, website designs, written content, illustrations and other materials are protected by applicable intellectual property laws and belong to HUMAN or their respective rights holders.' },
        { p: 'You may explore and share links to our website for personal and informational purposes.' },
        { p: 'You may not reproduce protected materials for commercial purposes without the appropriate permission.' },
      ],
    },
    {
      title: 'External websites',
      blocks: [
        { p: 'Our website may contain links to external websites or resources.' },
        { p: 'These websites may have their own privacy policies and terms of use.' },
        { p: 'HUMAN does not control the content, availability or practices of independently operated websites.' },
        { p: 'A link to another organisation does not necessarily mean that we have a partnership with or endorse that organisation.' },
      ],
    },
    {
      title: 'Website availability and limitations',
      blocks: [
        { p: 'We aim to keep the information on our website accurate and up to date.' },
        { p: 'However, as HUMAN is still being developed, information may change, and parts of the website may occasionally be unavailable.' },
        { p: 'To the extent permitted by applicable law, HUMAN does not guarantee uninterrupted website access or that every piece of information will always be complete or error-free.' },
        { p: 'Nothing in these terms is intended to exclude your statutory rights or responsibilities that cannot legally be excluded.' },
      ],
    },
    {
      title: 'Changes to these terms',
      blocks: [
        { p: 'We may update these terms as HUMAN continues to develop.' },
        { p: 'If significant changes affect how you use our website, we will communicate them where appropriate.' },
        { p: 'The latest version of these terms will be available on this page.' },
      ],
    },
    {
      title: 'Applicable law',
      blocks: [{ p: 'These Terms of Use are governed by applicable Indian law, without limiting any rights you may have under applicable consumer protection laws.' }],
    },
    {
      title: 'Contact us',
      blocks: [
        { p: 'If you have any questions about HUMAN or these Terms of Use, we would be happy to hear from you.' },
        {
          fields: [
            { label: 'Website operator', value: '{{Verified legal name}}' },
            { label: 'Email', value: '{{Verified contact email}}' },
            { label: 'Address', value: '{{Applicable business or correspondence address}}' },
          ],
        },
      ],
    },
  ],
};
