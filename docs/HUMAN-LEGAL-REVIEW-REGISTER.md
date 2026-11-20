# HUMAN — Legal, privacy and medical review register

**Status: internal. Not part of the website. Nothing in this file is published.**

The Privacy Policy, Terms of Use and Medical Disclaimer on the staging site are **drafts**. They carry a visible
"Draft for review — not approved for publication" flag, the whole site is marked `noindex, nofollow`, and nothing is
deployed. This register lists what must be confirmed before any of the three documents is published.
Implementing these pages does not make the website legally or medically compliant.

Source files: `src/data/legal/privacy.ts`, `src/data/legal/terms.ts`, `src/data/legal/disclaimer.ts`.
Every unconfirmed fact is written there as `{{…}}` and shows on the page as a marked placeholder.

## A. Placeholders still in the documents (11)

| # | Document, section | Placeholder | Who decides |
|---|---|---|---|
| 1 | Privacy, intro | Last updated: date of publication | Owner, at approval |
| 2 | Privacy 01 | Legal name and contact details of the responsible individual or business | Owner |
| 3 | Privacy 02 | Exact information collected by the website and its forms (see B1) | Owner + counsel |
| 4 | Privacy 05 | Actual service providers or recipient categories, purposes, data-sharing arrangements | Owner |
| 5 | Privacy 06 | Verified security measures | Owner + engineer |
| 6 | Privacy 07 | Cookies and analytics actually used, purposes, preference controls | Owner + engineer |
| 7 | Privacy 08 | Retention and deletion periods for waitlist data, enquiries, other data | Owner + counsel |
| 8 | Privacy 12 | Verified privacy contact email; responsible contact or grievance officer | Owner |
| 9 | Terms, intro | Last updated: date of publication | Owner, at approval |
| 10 | Terms 13 | Verified legal name, contact email, business or correspondence address | Owner |
| 11 | Medical Disclaimer, end | Last updated: date of publication | Owner, at approval |

## B. Register

Evidence column: what the codebase shows today (2026-11-20). "Verified" means verified in code only, not in
operations or law.

| Item | Required verification | What the code shows today | Status |
|---|---|---|---|
| Legal entity | Exact responsible website operator | Nothing in the codebase. `CONTACT_EMAIL` in `src/data/site.ts` is `null`. | **Owner decision needed** |
| Contact information | Official website and privacy contact details | None configured. | **Owner decision needed** |
| Business address | Registered or correspondence address | None. | **Owner decision needed** |
| Waitlist fields (B1) | Exact information collected | `src/pages/waitlist.astro`: first name (required), age group (optional), gender incl. self-described (optional), up to ten health interests (optional), email (required), country code + mobile (optional), city (optional), consent checkbox (required). Payload also carries a consent version label (`draft-unapproved`). | Verified in code. **Mismatch to resolve:** the draft policy lists name, contact, age group, location, health interests and questionnaire answers, but **does not mention gender**. |
| Health-related information | Whether and how sensitive information is collected | The form collects **health interests** (e.g. hormonal health, heart health) and gender. No reports, results or medical history. Counsel should say whether health interests count as sensitive personal data and what consent wording that needs. | **Legal review needed** |
| Hosting | Actual hosting provider and arrangements | None. The site is a static build; it has never been deployed. | Not yet applicable. **Owner decision needed before launch** |
| Storage | Actual database or storage service | None. `WAITLIST_ENDPOINT` is empty, so the form is in preview mode and sends nothing (`src/scripts/portal.ts`). Form values are not written to the URL, localStorage, sessionStorage or cookies (test `HP-10`). | Verified in code. **Owner decision needed for the real backend** |
| Third-party services | Providers, purposes, data sharing | None. No third-party requests on any route (test `NO-TRACKERS`). Fonts are self-hosted. | Verified in code |
| Analytics | Tools actually installed and enabled | None installed. | Verified in code. The draft Privacy 07 must say so, or describe whatever is added later |
| Cookies | Actual cookies, purposes, preference controls | The site sets no cookies. | Verified in code |
| Security | Real technical and organisational safeguards | Nothing to describe yet: there is no data store. | **Owner decision needed with the backend** |
| Retention | Approved retention periods | None defined. | **Owner + counsel** |
| Deletion | Deletion and withdrawal procedures | None defined. No process exists to action a request. | **Owner + counsel** |
| Privacy rights | Operational process for handling requests | None. The draft promises access, correction, deletion and withdrawal; someone must be able to deliver them. | **Owner decision needed** |
| Grievances | Responsible person and verified contact | None named. | **Owner decision needed** |
| Children | Approved age and guardian-consent policy | The draft says the waitlist is for people aged 18 and above. **This is a proposed policy, not yet approved.** The form's lowest age group is 18–24 but age is optional and nothing verifies it. No age gate was added. | **Owner approval needed** |
| Communications | Approved waitlist and marketing consent arrangements | One required checkbox: "I agree to receive HUMAN waitlist and launch updates and acknowledge the Privacy Notice". Joining and receiving updates are a single consent. The link text says "Privacy Notice"; the document is now titled "Privacy Policy". The waitlist was not changed in this work. | **Owner + counsel**: is one bundled consent acceptable; align the wording |
| Cross-border processing | Actual arrangements, if any | None today. Depends on the hosting, storage and email providers chosen. | Not yet applicable |
| Applicable laws | Review by qualified Indian legal counsel | Not done. The documents make no compliance claim (no DPDP Act, GDPR, HIPAA or ISO statements) and none should be added without review. | **Legal review needed** |
| Publication | Owner approval and final publication dates | Not approved. Dates are placeholders. | **Owner approval needed** |

## C. Copy points to review (reported, not changed)

The supplied wording was implemented as written. These points are for the founders, counsel and a clinician.

1. **Waitlist statements versus the current build.** The FAQ, Privacy Policy and Terms say joining the waitlist
   "registers your interest" and lets HUMAN "keep you informed". On the current build the form is a preview and sends
   nothing. The statements become true only when a reviewed backend is connected. Do not publish before then.
2. **Emergency number.** Medical Disclaimer 06 gives 112 as India's national emergency number. Verify against the
   current official source and decide whether to mention ambulance numbers (for example 108) that many states use.
3. **Children's and fertility-related plans.** The FAQ lists plans for children, and Explore Plans names paediatric
   and fertility-related plans. These need clinical and legal review (consent for minors, scope of testing).
4. **"We" as a measurer.** FAQ: "A biomarker is something we can measure in your body". Read literally this implies
   HUMAN measures. HUMAN does not operate a laboratory. Consider whether this needs rewording at launch.
5. **Blood-test examples.** FAQ lists blood sugar, cholesterol, thyroid function, nutrient levels and "certain
   hormones" as things blood tests can inform. These are general statements, not a HUMAN panel; a clinician should
   confirm the wording.
6. **Terms 12, governing law.** "Applicable Indian law" without a named jurisdiction or dispute forum. For counsel.
7. **Limitation wording** (Terms 10) and the Medical Disclaimer as a whole do not remove obligations under consumer
   protection or healthcare law. For counsel.
8. **Medical Disclaimer** has not been reviewed by a clinician. No reviewer is named anywhere, and none may be
   invented. Review again once clinical, diagnostic and operational arrangements exist.

## D. Before any of the three documents is published

- [ ] Every `{{…}}` placeholder replaced with a verified fact (section A).
- [ ] Privacy 02 matches the form exactly, including gender (section B1).
- [ ] Waitlist backend chosen, reviewed and connected; hosting, storage, retention and deletion written down.
- [ ] Adults-only waitlist policy approved or changed; consent wording agreed.
- [ ] Indian legal counsel has reviewed the Privacy Policy and Terms of Use.
- [ ] A qualified clinician and counsel have reviewed the Medical Disclaimer, including the emergency number.
- [ ] `draft: true` removed from the document data, the "Draft" flags and footer tags removed, real dates entered.
- [ ] The site-wide `noindex` is lifted only as part of the launch gates in `docs/HUMAN-RELEASE-GATES.md`.
