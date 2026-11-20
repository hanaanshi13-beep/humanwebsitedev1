// Medical Disclaimer — DRAFT for review. Eight sections. Founder-supplied wording (2026-11).
// Not medically or legally approved. The emergency number must be verified, and the whole document reviewed again
// once HUMAN's clinical, diagnostic and operational arrangements exist. See docs/HUMAN-LEGAL-REVIEW-REGISTER.md.
import type { LegalDoc } from './types';

export const DISCLAIMER: LegalDoc = {
  id: 'disclaimer',
  heading: 'Understanding your health starts with the right information.',
  intro: [
    'At HUMAN, we believe that understanding your body can help you make more informed decisions about your health.',
    'We are building HUMAN to make health information easier to access, understand and follow over time.',
    'However, it is important to understand what HUMAN can and cannot do.',
  ],
  updated: '{{Date of publication}}',
  updatedAt: 'end',
  draft: true,
  sections: [
    {
      title: 'Our role in your health',
      blocks: [
        { p: 'HUMAN is a preventive health platform currently in development.' },
        { p: 'Our aim is to help you better understand your body through blood tests, personalised health insights and changes in your health over time.' },
        { p: 'HUMAN is intended to support your understanding of your health, not replace the care you receive from a qualified medical professional.' },
      ],
    },
    {
      title: 'We are not a replacement for your doctor',
      blocks: [
        { p: 'The health information available on our website is intended for educational and informational purposes.' },
        { p: 'It should not be considered a medical diagnosis, prescription or treatment recommendation.' },
        { p: 'Your doctor understands your medical history, symptoms and individual health circumstances. These are important when making decisions about your health.' },
        { p: 'Always speak with a qualified medical professional when you have questions or concerns about your health.' },
      ],
    },
    {
      title: 'Understanding your blood test results',
      blocks: [
        { p: 'Blood tests can provide valuable information about what is happening inside your body.' },
        { p: 'However, they are only one part of understanding your overall health.' },
        { p: 'A result outside the normal range does not necessarily mean you have a medical condition. Similarly, results within the normal range do not always mean that everything is fine.' },
        { p: 'Your results need to be understood alongside your symptoms, medical history, lifestyle and other relevant information.' },
        { p: 'Some health conditions require additional examinations or investigations that cannot be replaced by blood tests alone.' },
      ],
    },
    {
      title: 'Everyone’s health is different',
      blocks: [
        { p: 'No two bodies are exactly the same.' },
        { p: 'Your age, biological sex, medical history, lifestyle, medications and other circumstances can influence your health and blood test results.' },
        { p: 'Information that is relevant to one person may not be appropriate for another.' },
        { p: 'This is why individual medical decisions should be made with appropriate professional guidance.' },
      ],
    },
    {
      title: 'Existing medical conditions and medications',
      blocks: [
        { p: 'If you have an existing medical condition, are taking medication or are receiving treatment, please continue following your healthcare professional’s advice.' },
        { p: 'Do not start, stop or change any medication or prescribed treatment based solely on information provided by HUMAN.' },
        { p: 'Always discuss significant changes to your treatment, supplements or health routine with a qualified medical professional.' },
      ],
    },
    {
      title: 'If you are feeling unwell',
      blocks: [
        { p: 'Please do not ignore symptoms or delay seeking medical attention because of information you read on our website or because you are waiting for HUMAN to become available.' },
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
      title: 'Our developing health plans',
      blocks: [
        { p: 'The health plans displayed on our website represent memberships and services that we are currently developing.' },
        { p: 'Their exact blood tests, features, clinical arrangements and availability have not yet been finalised.' },
        { p: 'Joining the HUMAN waitlist does not establish a doctor-patient relationship, provide medical supervision or enrol you in a health service.' },
        { p: 'We will communicate the confirmed scope and limitations of our services before they become available.' },
      ],
    },
    {
      title: 'Our commitment to responsible health information',
      blocks: [
        { p: 'We believe health information should be clear, meaningful and responsible.' },
        { p: 'As we develop HUMAN, our aim is to provide information that helps you better understand your body and have more informed conversations with your healthcare professional.' },
        { statement: ['Our purpose is not to replace your doctor.', 'It is to help you better understand your health.'] },
      ],
    },
  ],
};
