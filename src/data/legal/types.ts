// Shape of a long-form notice (Privacy Policy, Terms of Use, Medical Disclaimer).
// Text uses the inline markup in ../rich.ts.
//
// STATUS: all three are INTERIM PROTOTYPE NOTICES for an investor-facing prototype. They were written to be accurate
// about what this website does today. They are not professionally approved production legal documents and must be
// replaced, with legal and medical advice, before HUMAN accepts registrations or offers any service.

export type Block =
  | { p: string } // paragraph
  | { ul: string[] } // list
  | { fields: { label: string; value: string }[] } // labelled contact lines
  | { urgent: string[] } // lines that must be easy to find (emergency information)
  | { statement: string[] }; // closing lines given a quiet editorial emphasis

export interface LegalSection {
  title: string;
  blocks: Block[];
}

export interface LegalDoc {
  id: string;
  /** the document's own heading */
  heading: string;
  intro: string[];
  /** date this version was written */
  updated: string;
  updatedAt: 'top' | 'end';
  sections: LegalSection[];
  status: 'interim';
}

/** shown on each notice */
export const INTERIM_FLAG = 'Interim prototype notice';
/** date of the current interim versions */
export const INTERIM_DATE = '20 November 2026';
