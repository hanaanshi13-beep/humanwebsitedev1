// Minimal inline markup for copy held as data, so the words stay in one place and stay plain text:
//   [[label|/href]]  a link on existing words (internal path, mailto: or tel:)
//   **text**         emphasis
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function rich(source: string): string {
  return esc(source)
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<a class="text-link" href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
