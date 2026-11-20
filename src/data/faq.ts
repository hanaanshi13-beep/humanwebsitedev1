// HUMAN — Frequently asked questions. Five categories, 26 questions. Founder-approved copy (2026-11):
// do not add, remove, shorten or reword entries here without a decision. Answers use the inline markup in rich.ts
// only to link existing words to existing pages.
export interface FaqItem {
  q: string;
  a: string;
}
export interface FaqCategory {
  id: string;
  name: string;
  items: FaqItem[];
}

export const FAQ: FaqCategory[] = [
  {
    id: 'understanding-human',
    name: 'Understanding HUMAN',
    items: [
      {
        q: 'What is HUMAN?',
        a: 'HUMAN is a preventive health platform being developed to help you understand your body through blood tests, personalised health insights and tracking changes in your health over time.',
      },
      {
        q: 'What is preventive health?',
        a: 'Preventive health is about taking care of your health before problems arise. It means understanding your body, paying attention to changes and taking appropriate action when something needs attention.',
      },
      {
        q: 'Why was HUMAN created?',
        a: 'Blood test reports can be difficult to understand. We want to make it easier for people to understand their results, learn more about their bodies and make informed decisions about their health.',
      },
      {
        q: 'How is HUMAN different from a regular health check-up?',
        a: 'A regular health check-up often gives you a picture of your health at one point in time. HUMAN is being built around understanding your results and following how they change over time.',
      },
      {
        q: 'Is HUMAN available right now?',
        a: 'HUMAN is currently in development. You can [[join our waitlist|/waitlist]] to stay informed about our progress and upcoming availability.',
      },
    ],
  },
  {
    id: 'health-plans',
    name: 'Health Plans & Memberships',
    items: [
      {
        q: 'Who is HUMAN for?',
        a: 'HUMAN is being developed for both men and women, with different plans designed around different ages, lifestyles and health needs.',
      },
      {
        q: 'What health plans does HUMAN offer?',
        a: 'We are developing plans for men, women, athletes, seniors, families, professionals, young adults, children and couples. You can discover these upcoming plans on our [[Explore Plans page|/explore-plans]].',
      },
      {
        q: 'Are the plans for men and women different?',
        a: 'Yes, that is our intended approach. Men and women share many health needs, but they can also have different hormonal, nutritional and other health concerns. We are developing plans that take these differences into consideration.',
      },
      {
        q: 'How much will a HUMAN membership cost?',
        a: 'We are currently working on our membership structure and pricing. We will share confirmed details before memberships become available.',
      },
      {
        q: 'Can I choose a plan based on my health concerns?',
        a: 'Our upcoming plans are being designed around different health needs and stages of life. We will provide further guidance on choosing an appropriate plan once the membership details are finalised.',
      },
    ],
  },
  {
    id: 'blood-tests',
    name: 'Blood Tests & Health Insights',
    items: [
      {
        q: 'What is a biomarker?',
        a: 'A biomarker is something we can measure in your body that gives us information about your health. For example, your blood sugar, cholesterol and iron levels are biomarkers.',
      },
      {
        q: 'What can blood tests tell me about my health?',
        a: 'Blood tests can provide useful information about areas such as your blood sugar, cholesterol, thyroid function, nutrient levels and certain hormones. They are one part of understanding your overall health.',
      },
      {
        q: 'Which blood tests will be included?',
        a: 'We are currently developing our blood testing panels. The exact tests included in each membership will be shared once they are finalised.',
      },
      {
        q: 'How will my blood samples be collected?',
        a: 'We are currently evaluating blood collection methods and diagnostic partners. We will explain the confirmed collection process before memberships become available.',
      },
      {
        q: 'How often will I need to get tested?',
        a: 'The appropriate testing frequency depends on the tests, your health needs and medical guidance. The testing schedules for our memberships will be shared once they are finalised.',
      },
      {
        q: 'Will HUMAN help me understand my results?',
        a: 'Yes, this is one of the main reasons we are building HUMAN. Our goal is to explain blood test results in clear, everyday language and help you understand what may need further attention.',
      },
      {
        q: 'Will I be able to track my health over time?',
        a: 'Yes. We are developing HUMAN to help you follow changes in your blood test results over time, rather than viewing each report separately.',
      },
    ],
  },
  {
    id: 'medical-care',
    name: 'Medical Care & Safety',
    items: [
      {
        q: 'Can HUMAN replace my doctor?',
        a: 'No. HUMAN is intended to help you understand your health information. It is not a replacement for a qualified medical professional, medical diagnosis or treatment.',
      },
      {
        q: 'Can HUMAN detect every health condition?',
        a: 'No. Blood tests can provide valuable information, but they cannot detect or rule out every health condition. Some conditions require other examinations, investigations or medical assessments.',
      },
      {
        q: 'What if something is abnormal in my blood test results?',
        a: 'An abnormal result does not always mean that something is seriously wrong. Results need to be understood in the context of your health. A qualified medical professional can help determine whether further investigation or treatment is needed.',
      },
      {
        q: 'Can I use HUMAN if I already have a medical condition?',
        a: 'HUMAN is not intended to replace the care you receive for an existing medical condition. You should continue following your doctor’s advice and discuss any additional testing with them.',
      },
      {
        q: 'Should I wait for HUMAN if I am experiencing symptoms?',
        a: 'No. If you are experiencing symptoms or have concerns about your health, please seek appropriate medical advice. Do not wait for HUMAN to become available.',
      },
    ],
  },
  {
    id: 'waitlist',
    name: 'Waitlist & Availability',
    items: [
      {
        q: 'What happens when I join the waitlist?',
        a: 'Joining the waitlist registers your interest in HUMAN and allows us to keep you informed about our progress and upcoming availability.',
      },
      {
        q: 'Does joining the waitlist mean I have purchased a membership?',
        a: 'No. Joining the waitlist does not purchase a membership or commit you to buying one.',
      },
      {
        q: 'When will HUMAN launch?',
        a: 'We are currently working on developing the platform, membership plans and operational processes. We will share a launch date once it is confirmed.',
      },
      {
        q: 'Where will HUMAN be available?',
        a: 'HUMAN is being developed for India. Our initial service locations will be announced once our operational arrangements are confirmed.',
      },
    ],
  },
];
