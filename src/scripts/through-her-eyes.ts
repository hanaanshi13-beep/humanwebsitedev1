// Through Her Eyes — the scroll-driven film for wide screens (src/components/home/ThroughHerEyes.astro).
//
// One number drives everything: q, the visitor's position through the film's travel, from 0 (the section's stage
// reaches the top of the screen) to 1 (the travel is used up and the editorial page begins to rise). Every frame
// is a pure function of q and the stage size, so the film reverses exactly, survives fast scrolling, the scrollbar
// and the keyboard, and never runs on a timer. The editorial page then rises over the pinned stage by ordinary
// scrolling: no script is involved in the last act.
//
// Writes: transform, opacity and clip-path only. Nothing is measured while scrolling except one bounding box.
// Off screen it does nothing. On narrow or short screens, with reduced motion (also when it is switched on while
// the page is open), or without the site's js-motion flag, it removes .is-film from the section, which hands the
// layout back to the CSS flow mode, and clears every style it wrote.

/* ---------------------------------------------------------------------------------------------- tunables */

/** The supplied master portrait, in pixels. */
const HERO = { w: 1672, h: 941 };
/** Points on the photograph, as fractions of its width and height (measured on the supplied file). */
const EYES = { x: 0.52, y: 0.38 }; // between the eyes
const FACE = { x: 0.545, y: 0.45 }; // centre of the face
/**
 * The closest the camera may get, in screen pixels per photograph pixel. Beyond about 1.3 the supplied portrait
 * starts to soften, and the founders asked that her eyes never be enlarged until the picture blurs.
 */
const MAX_ZOOM = 1.3;
/** Where the eyes sit on screen at the start, and where the face settles when the pullback ends. */
const START_AT = { x: 0.5, y: 0.47 };
const END_AT = { x: 0.71, y: 0.5 };
/** At the end of the pullback the portrait is this many stage heights tall (a touch over, so no edge shows). */
const END_HEIGHT = 1.04;

/**
 * Timeline, as fractions of the travel (q). Derived from the approved prototype, whose 0–72 % ran these two acts:
 * prototype value ÷ 0.72. Overlaps are deliberate: there are no dead zones.
 */
const T = {
  pull: [0, 0.46], // camera pullback (prototype 0–36 %, a little quicker so the face clears the headline)
  head: [0.16, 0.44], // eyebrow and headline lines arrive in turn (prototype 8–28 %, later: the face moves first)
  headOut: [0.53, 0.76], // headline gives way to the triptych (prototype 38–55 %)
  montage: [0.53, 0.875], // the triptych as a whole (prototype 38–63 %)
  panelStep: 0.049, // each panel starts this much after the previous one (prototype 3.5 %)
  panelLen: 0.278, // and takes this long to open (prototype 20 %)
  para: [0.78, 0.94], // the first paragraph once the panels have opened, then held for reading
} as const;
/** Each of the four headline lines takes this share of the headline window, and starts this much after the last. */
const LINE_LEN = 0.55;
const LINE_STEP = (1 - LINE_LEN) / 3;

/* --------------------------------------------------------------------------------------------- helpers */

const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const smooth = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const span = (q: number, [a, b]: readonly [number, number] | readonly number[]) => smooth((q - a) / (b - a));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------------------------------------------------------ film */

function film(sec: HTMLElement) {
  const $ = <T extends Element>(s: string) => sec.querySelector<T>(s)!;
  const filmEl = $<HTMLElement>('[data-the-film]');
  const stage = $<HTMLElement>('[data-the-stage]');
  const travel = $<HTMLElement>('[data-the-travel]');
  const img = $<HTMLImageElement>('[data-the-hero]');
  const shade = $<HTMLElement>('[data-the-shade]');
  const veil = $<HTMLElement>('[data-the-veil]');
  const lines = [...sec.querySelectorAll<HTMLElement>('[data-the-line]')];
  const montage = $<HTMLElement>('[data-the-montage]');
  const panels = [...sec.querySelectorAll<HTMLElement>('[data-the-panel]')];
  const para = $<HTMLElement>('[data-the-para]');
  const bar = $<HTMLElement>('[data-the-bar]');
  const label = $<HTMLElement>('[data-the-label]');
  const hud = label.parentElement!;

  const wide = window.matchMedia('(min-width: 1024px) and (min-height: 640px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => document.documentElement.classList.contains('js-motion') && !reduce.matches;

  // cached per stage size; recomputed on resize, never while scrolling
  let W = 0;
  let H = 0;
  let travelPx = 1;
  let s0 = 0; // portrait width at the start (its layout width: it is only ever scaled down from here)
  let s1 = 0; // portrait width at the end of the pullback

  let active = false; // film mode is on
  let near = false; // the section is on or near the screen
  let queued = false;
  let lastLabel = '';

  function measure() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    travelPx = Math.max(1, travel.offsetHeight);
    const A = HERO.w / HERO.h;
    // end: tall enough to fill the stage top to bottom, and wide enough that no right-hand edge ever shows
    // ... and never past MAX_ZOOM: on very tall screens the portrait then stays shorter than the stage and its
    // top and bottom dissolve into the room (.is-capped) rather than being enlarged until it blurs
    const cap = HERO.w * MAX_ZOOM;
    s1 = Math.min(cap, Math.max(H * END_HEIGHT * A, (W - END_AT.x * W) / (1 - FACE.x) + 2));
    // start: as close as the photograph allows, never less than the end size, never past MAX_ZOOM
    const cover = Math.max(W, H * A) * 1.02;
    s0 = Math.min(cap, Math.max(s1, cover, W * 1.75));
    sec.classList.toggle('is-capped', s1 / A < H * 1.01);
    img.style.width = `${s0}px`;
    img.style.height = `${s0 / A}px`;
  }

  function render() {
    queued = false;
    if (!active) return;
    const top = filmEl.getBoundingClientRect().top;
    const q = clamp(-top / travelPx);

    // entering: the top of the portrait comes out of the dark, and is fully clear by the time the stage pins
    veil.style.opacity = clamp(top / (H * 0.3)).toFixed(3); // fully opaque at the edge until nearly pinned: no seam

    // 01 — the camera. Interpolate size, the point of the photograph we look at, and where it sits on screen.
    const a = span(q, T.pull);
    const s = mix(s0, s1, a);
    const h = s / (HERO.w / HERO.h);
    const fx = mix(EYES.x, FACE.x, a);
    const fy = mix(EYES.y, FACE.y, a);
    let x = mix(START_AT.x * W, END_AT.x * W, a) - fx * s;
    let y = mix(START_AT.y * H, END_AT.y * H, a) - fy * h;
    // never leave a gap on the right (the left edge dissolves into the room); when the portrait is held at its
    // sharpness limit and is narrower than the screen, it sits against the right edge
    x = s >= W ? Math.min(Math.max(x, W - s), Math.max(0, x)) : W - s;
    y = h >= H ? clamp(y, H - h, 0) : clamp(y, 0, H - h); // or at the top or bottom (when capped: stay inside)
    img.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${(s / s0).toFixed(5)})`;

    // the headline, line by line, then away as the triptych opens
    const head = span(q, T.head);
    const out = span(q, T.headOut);
    const hw = T.head[1] - T.head[0];
    lines.forEach((el, i) => {
      const start = T.head[0] + i * LINE_STEP * hw;
      const t = smooth((q - start) / (LINE_LEN * hw));
      el.style.opacity = (t * (1 - out)).toFixed(3);
      el.style.transform = `translate3d(0,${((1 - t) * (i === 0 ? 14 : 38) - out * 18).toFixed(2)}px,0)`;
    });
    shade.style.opacity = (0.15 + 0.85 * head).toFixed(3);

    // 02 — the triptych opens from each panel's centre, left first; the portrait recedes behind it
    const b = span(q, T.montage);
    img.parentElement!.style.opacity = (1 - b).toFixed(3);
    montage.style.opacity = b.toFixed(3);
    panels.forEach((el, i) => {
      const z = smooth((q - T.montage[0] - i * T.panelStep) / T.panelLen);
      el.style.clipPath = `inset(${((1 - z) * 18).toFixed(2)}% ${((1 - z) * 50).toFixed(2)}%)`;
      el.style.transform = `translate3d(${((i - 1) * 65 * (1 - z)).toFixed(2)}px,0,0)`;
      (el.firstElementChild as HTMLElement).style.transform = `scale(${(1.12 - 0.12 * z).toFixed(4)})`;
    });

    // the first thought of the message, held for reading; the editorial page then rises over it
    const p = span(q, T.para);
    para.style.opacity = p.toFixed(3);
    para.style.transform = `translate3d(0,${(20 * (1 - p)).toFixed(2)}px,0)`;

    // the quiet progress line fills over the film; the editorial page then rises over it
    bar.style.transform = `scaleX(${q.toFixed(4)})`;
    const text = q < T.montage[0] ? '01 / Through her eyes' : '02 / Her world';
    if (text !== lastLabel) label.textContent = lastLabel = text;
    // once the editorial page covers the stage, its skip link must not take keyboard focus behind it
    const covered = -top > travelPx + 1;
    if (hud.inert !== covered) hud.inert = covered;
  }

  const request = () => {
    if (!queued && active && near) {
      queued = true;
      requestAnimationFrame(render);
    }
  };

  // every inline style this script writes, so the flow layout is exactly as the CSS defines it
  const owned = () => [img, shade, veil, img.parentElement!, montage, para, bar, ...lines, ...panels, ...panels.map((p) => p.firstElementChild as HTMLElement)];
  function clear() {
    owned().forEach((el) => {
      el.style.removeProperty('transform');
      el.style.removeProperty('opacity');
      el.style.removeProperty('clip-path');
      el.style.removeProperty('width');
      el.style.removeProperty('height');
    });
  }

  function sync() {
    const on = wide.matches && motionAllowed();
    if (on && !active) {
      active = true;
      sec.classList.add('is-film');
      measure();
      request();
    } else if (!on && active) {
      active = false;
      sec.classList.remove('is-film', 'is-capped');
      hud.inert = false;
      clear();
    } else if (on) {
      measure();
      request();
    }
  }

  // only work while the section is on or near the screen
  new IntersectionObserver(
    (entries) => {
      near = entries.some((e) => e.isIntersecting);
      if (near) request();
    },
    { rootMargin: '50% 0px 50% 0px' },
  ).observe(sec);

  window.addEventListener('scroll', request, { passive: true });
  wide.addEventListener('change', sync);
  reduce.addEventListener('change', sync);
  // stage size changes (window resize, rotation, the mobile address bar) re-measure once, then redraw
  new ResizeObserver(() => sync()).observe(stage);
  sync();
}

const sec = document.querySelector<HTMLElement>('[data-the]');
if (sec) film(sec);
