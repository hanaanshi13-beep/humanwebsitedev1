// Shared motion engine. Two primitives only (D00: few reusable primitives, not 202 timelines):
//  1. [data-reveal]   one-shot entrance when the element enters the viewport (IntersectionObserver).
//  2. [data-progress] writes --p (0..1) while the element is on screen, for the scrubbed signatures.
// With reduced motion, neither runs: CSS shows every element in its final, readable state.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const wide = window.matchMedia('(min-width: 1024px) and (min-height: 640px)');

function initReveals() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduce.matches || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -14% 0px', threshold: 0.01 },
  );
  els.forEach((el) => {
    // Anything already above the fold line on load (deep link, reload mid-page, Back) shows at once.
    if (el.closest('[data-reveal-eager]') || el.getBoundingClientRect().top < window.innerHeight * 0.86) el.classList.add('is-in');
    else io.observe(el);
  });
}

function initProgress() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-progress]'));
  if (!els.length || reduce.matches) return;
  const active = new Set<HTMLElement>();
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    active.forEach((el) => {
      const r = el.getBoundingClientRect();
      const mode = el.dataset.progress;
      // "through" drives a sticky desktop stage only; elsewhere the CSS default (a still composition) stands.
      if (mode === 'through' && !wide.matches) {
        el.style.removeProperty('--p');
        return;
      }
      let p: number;
      if (mode === 'through') {
        // 0 when the element's top hits the viewport top, 1 when its bottom hits the viewport bottom
        // (for tall sections with a sticky child).
        const span = r.height - vh;
        p = span > 0 ? -r.top / span : 0;
      } else {
        // 0 as the top enters at 85% of the viewport, 1 when the bottom reaches 45%.
        const start = vh * 0.85;
        const end = vh * 0.45;
        p = (start - r.top) / (start - end + r.height);
      }
      p = Math.min(1, Math.max(0, p));
      el.style.setProperty('--p', p.toFixed(4));
      el.dispatchEvent(new CustomEvent('progress', { detail: p }));
    });
  };
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) active.add(e.target as HTMLElement);
      else active.delete(e.target as HTMLElement);
    }
    request();
  });
  els.forEach((el) => io.observe(el));
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
}

initReveals();
initProgress();
