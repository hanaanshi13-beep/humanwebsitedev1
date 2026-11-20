// Shape of a long-form document (Privacy Policy, Terms of Use, Medical Disclaimer).
// Text uses the inline markup in ../rich.ts. {{…}} marks a fact that is NOT yet confirmed: it renders as a visible
// placeholder in review builds and must be replaced with verified information before the document is published.
// Every placeholder is tracked in docs/HUMAN-LEGAL-REVIEW-REGISTER.md.

export type Block =
  | { p: string } // paragraph
  | { ul: string[] } // list
  | { pending: string } // a whole passage still to be written from verified facts
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
  /** 'Last updated' value: stays a placeholder until an approved version is actually published */
  updated: string;
  updatedAt: 'top' | 'end';
  sections: LegalSection[];
  /** not approved for publication: shown with a review flag, never indexed */
  draft: true;
}
