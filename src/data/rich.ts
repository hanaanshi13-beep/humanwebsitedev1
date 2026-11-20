// Minimal inline markup for approved copy held as data, so the words stay in one place and stay plain text:
//   [[label|/href]]  an internal link on existing words
//   {{text}}         a detail that is not yet confirmed. Shown as a marked placeholder in review builds; it must be
//                    replaced with a verified fact before publication (see docs/HUMAN-LEGAL-REVIEW-REGISTER.md).
//   **text**         emphasis
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function rich(source: string): string {
  return esc(source)
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<a class="text-link" href="$2">$1</a>')
    .replace(/\{\{([^}]+)\}\}/g, '<mark class="inf-pending" title="To be confirmed before publication">[$1]</mark>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/** every unresolved placeholder in a piece of copy */
export const pendingIn = (source: string): string[] => Array.from(source.matchAll(/\{\{([^}]+)\}\}/g), (m) => m[1]);
