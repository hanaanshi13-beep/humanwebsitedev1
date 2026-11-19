// Explore Plans — the horizontal membership explorer.
// The row is a native scroll container: trackpads, touch and the keyboard work without any of this. The script adds
// mouse dragging (with a click/drag threshold), the previous/next arrows, the progress line, the one-time entrance,
// and a tonal fallback for a photograph that fails to load. It never autoplays and never redirects the wheel.

const rail = document.querySelector<HTMLElement>('[data-rail]');
const scroller = rail?.querySelector<HTMLElement>('[data-rail-scroller]');

if (rail && scroller) {
  const cards = Array.from(rail.querySelectorAll<HTMLElement>('.xp-card'));
  const thumb = rail.querySelector<HTMLElement>('[data-rail-thumb]');
  const prev = rail.querySelector<HTMLButtonElement>('[data-rail-prev]');
  const next = rail.querySelector<HTMLButtonElement>('[data-rail-next]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ----- geometry -----
  const pad = () => parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
  const maxScroll = () => Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  /** every scroll position that puts a card on the page's left edge (the last ones collapse to the end) */
  const stops = () => {
    const p = pad();
    const m = maxScroll();
    return Array.from(new Set(cards.map((c) => Math.round(Math.min(m, Math.max(0, c.offsetLeft - p))))));
  };
  const unit = () => (cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : scroller.clientWidth);
  /** how many whole cards fit in view */
  const perView = () => {
    const w = cards[0]?.offsetWidth || 1;
    return Math.max(1, Math.floor((scroller.clientWidth - pad() + (unit() - w)) / unit()));
  };
  const scrollToX = (x: number) => scroller.scrollTo({ left: x, behavior: reduce.matches ? 'auto' : 'smooth' });

  // ----- progress line + arrow states, driven by the real scroll position -----
  let queued = false;
  const paint = () => {
    queued = false;
    const m = maxScroll();
    const frac = scroller.scrollWidth > 0 ? Math.min(1, scroller.clientWidth / scroller.scrollWidth) : 1;
    const pos = m > 0 ? Math.min(1, Math.max(0, scroller.scrollLeft / m)) : 0;
    if (thumb) {
      thumb.style.setProperty('--w', `${(frac * 100).toFixed(3)}%`);
      // translate is relative to the thumb's own width
      thumb.style.setProperty('--x', `${frac < 1 ? ((pos * (1 - frac)) / frac) * 100 : 0}%`);
    }
    prev?.setAttribute('aria-disabled', String(scroller.scrollLeft <= 1));
    next?.setAttribute('aria-disabled', String(scroller.scrollLeft >= m - 1));
    rail.dataset.pos = pos.toFixed(4);
  };
  const request = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(paint);
    }
  };
  scroller.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  if ('ResizeObserver' in window) new ResizeObserver(request).observe(scroller);
  paint();

  // ----- arrows: move by the number of whole cards in view, always landing on a card edge -----
  const step = (dir: 1 | -1) => {
    const s = stops();
    const x = scroller.scrollLeft;
    const span = perView() * unit();
    let target: number;
    if (dir > 0) {
      const within = s.filter((v) => v > x + 2 && v <= x + span + 2);
      target = within.length ? within[within.length - 1] : maxScroll();
    } else {
      const within = s.filter((v) => v < x - 2 && v >= x - span - 2);
      target = within.length ? within[0] : 0;
    }
    scrollToX(target);
  };
  prev?.addEventListener('click', () => prev.getAttribute('aria-disabled') !== 'true' && step(-1));
  next?.addEventListener('click', () => next.getAttribute('aria-disabled') !== 'true' && step(1));

  // ----- keyboard: arrow keys move between cards; Home and End reach the ends -----
  scroller.addEventListener('keydown', (e) => {
    const from = (e.target as HTMLElement).closest<HTMLElement>('.xp-card');
    if (!from || e.altKey || e.ctrlKey || e.metaKey) return;
    const i = cards.indexOf(from);
    const to = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? cards.length - 1 : -1;
    if (to < 0 || to >= cards.length || to === i) return;
    e.preventDefault();
    cards[to].querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    scrollToX(Math.min(maxScroll(), Math.max(0, cards[to].offsetLeft - pad())));
  });

  // ----- mouse dragging -----
  // Touch and pen keep the browser's own scrolling. A press only becomes a drag after 6px of travel, and a drag
  // never opens a card: the click that follows it is swallowed.
  const THRESHOLD = 6;
  let press: { x: number; left: number } | null = null;
  let dragging = false;
  let swallow = false;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0; // px per ms, smoothed
  let settle = 0;

  const onMove = (e: PointerEvent) => {
    if (!press) return;
    const dx = e.clientX - press.x;
    if (!dragging) {
      if (Math.abs(dx) < THRESHOLD) return;
      dragging = true;
      rail.classList.add('is-dragging');
    }
    e.preventDefault();
    const now = performance.now();
    if (now > lastT) velocity = velocity * 0.7 + ((e.clientX - lastX) / (now - lastT)) * 0.3;
    lastX = e.clientX;
    lastT = now;
    scroller.scrollLeft = press.left - dx;
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (!press) return;
    press = null;
    if (!dragging) return;
    dragging = false;
    swallow = true;
    // a little momentum, then rest on the nearest card edge
    const stale = performance.now() - lastT > 90;
    const glide = stale ? 0 : -velocity * 260;
    const aim = Math.min(maxScroll(), Math.max(0, scroller.scrollLeft + glide));
    const target = stops().reduce((a, b) => (Math.abs(b - aim) < Math.abs(a - aim) ? b : a), 0);
    scrollToX(target);
    // snapping returns once the row has come to rest, so it cannot fight the release
    window.clearTimeout(settle);
    const done = () => {
      window.clearTimeout(settle);
      scroller.removeEventListener('scrollend', done);
      rail.classList.remove('is-dragging');
    };
    scroller.addEventListener('scrollend', done, { once: true });
    settle = window.setTimeout(done, 700);
    // the swallowed click arrives synchronously after pointerup; if none comes, forget it
    window.setTimeout(() => (swallow = false), 0);
  };
  scroller.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    window.clearTimeout(settle);
    rail.classList.remove('is-dragging');
    press = { x: e.clientX, left: scroller.scrollLeft };
    dragging = false;
    swallow = false;
    lastX = e.clientX;
    lastT = performance.now();
    velocity = 0;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });
  scroller.addEventListener(
    'click',
    (e) => {
      if (!swallow) return;
      swallow = false;
      e.preventDefault();
      e.stopPropagation();
    },
    true,
  );
  scroller.addEventListener('dragstart', (e) => e.preventDefault());

  // ----- entrance, once -----
  if (!('IntersectionObserver' in window)) rail.classList.add('is-in');
  else {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          rail.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(scroller);
  }

  // ----- photographs -----
  // A photograph that fails leaves a quiet tonal card with its title, never a broken-image icon.
  const missing = (img: HTMLImageElement) => img.closest('.xp-card')?.classList.add('is-missing');
  rail.querySelectorAll<HTMLImageElement>('.xp-card img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) missing(img);
    img.addEventListener('error', () => missing(img));
    img.addEventListener('load', () => img.closest('.xp-card')?.classList.remove('is-missing'));
  });
  // The cards beyond the first screen load as soon as the page is idle, so they are ready before they are reached.
  const warm = () => rail.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
  const idle = () => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(warm, { timeout: 1500 });
    else setTimeout(warm, 600);
  };
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}
