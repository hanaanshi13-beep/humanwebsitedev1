// Through Her Eyes — the scroll-driven film for wide screens (src/components/home/ThroughHerEyes.astro).
//
// HOW IT STAYS SMOOTH (each point answers a cause of jitter found by profiling the first version, 2026-11):
//
// 1. The portrait is prepared before the visitor arrives. The <img> downloads at low priority with the page; once
//    the page has loaded and the browser is idle, it is decoded (img.decode, createImageBitmap) and painted ONCE
//    into a <canvas> at the photograph's own size. The camera then moves that canvas: a single GPU texture that is
//    never re-rasterised, never re-decoded and never drawn tile by tile, however fast the visitor scrolls. Its edge
//    fades are baked into it, so no CSS mask is recomposited on every frame. Until it is ready, the room stays dark
//    and the portrait fades in when it is; it can never appear half-drawn or jump in mid-move.
// 2. The portrait waits in place. It is fixed to the screen and only revealed by the section rising over it
//    (the stage clips it), so the opening close-up is already perfectly still when the stage pins: no sudden stop
//    where the page's movement hands over to the camera's.
// 3. The camera is one continuous move: a single similarity transform interpolated about its own fixed point,
//    with the scale interpolated geometrically (an even rate of zoom). Both end compositions keep the photograph
//    over the screen's edges, and every edge moves monotonically between them, so nothing has to be clamped part of
//    the way through (the first version froze the vertical motion part-way, a visible kink).
// 4. The film follows the scroll through a critically damped spring (FOLLOW): a mouse wheel's 100 px notches
//    become one continuous glide instead of a run of jumps. The page itself scrolls natively and is never
//    intercepted; the spring only decides how the picture catches up, settles within about a quarter of a second
//    and never overshoots, so nothing moves on its own once it has settled.
// 5. One requestAnimationFrame loop, one bounding-box read per frame, and only transform, opacity and clip-path
//    written. Nothing is measured while scrolling; sizes come from CSS and are read once per resize.
//
// Off screen it does nothing. On narrow or short screens, with reduced motion (also when it is switched on while
// the page is open), or without the site's js-motion flag, it removes .is-film from the section, which hands the
// layout back to the CSS flow mode, and clears every style it wrote.

/* ---------------------------------------------------------------------------------------------- tunables */

/** The supplied master portrait, in pixels. */
const HERO = { w: 1672, h: 941 };
const A = HERO.w / HERO.h;
/** Points on the photograph, as fractions of its width and height (measured on the supplied file). */
const EYES = { x: 0.52, y: 0.38 }; // between the eyes
const FACE = { x: 0.545, y: 0.45 }; // centre of the face
/**
 * The closest the camera may get, in screen pixels per photograph pixel. Beyond about 1.3 the supplied portrait
 * starts to soften, and the founders asked that her eyes never be enlarged until the picture blurs.
 * The CSS sizes the canvas with the same limit (1672 × 1.3 = 2173.6px): keep the two in step.
 */
const MAX_ZOOM = 1.3;
/** Where the eyes sit on screen at the start, and where the face settles when the pullback ends. */
const START_AT = { x: 0.5, y: 0.47 };
const END_AT = { x: 0.71, y: 0.5 };
/** At the end of the pullback the portrait is this many stage heights tall (a touch over, so no edge shows). */
const END_HEIGHT = 1.04;
/**
 * Very large screens (e.g. 2560 × 1440): the sharpness limit stops the portrait from filling the screen at any
 * useful closeness, so it is shown as a picture floating in the dark room, its top and bottom dissolving into it,
 * and the camera still pulls back by this much.
 */
const FLOAT_PULLBACK = 0.84;
/** Baked edge fades, as fractions of the photograph: left (when the portrait moves right), top and bottom (floating). */
const FADE = { left: 0.13, top: 0.12, bottom: 0.14 };
/**
 * How tightly the film follows the scroll: the natural frequency (rad/s) of a critically damped spring. 18 blends a
 * mouse wheel's notches into one glide, settles within about 0.3 s, and trails a steady scroll by about 2/18 s
 * (0.11 s). Higher is tighter but lets wheel notches show; 0 follows the scroll exactly.
 */
const FOLLOW = 18;

/**
 * Timeline, as fractions of the travel (q). Derived from the approved prototype, whose 0–72 % ran these two acts:
 * prototype value ÷ 0.72. Overlaps are deliberate: there are no dead zones.
 */
const T = {
  pull: [0, 0.46], // camera pullback (prototype 0–36 %, a little quicker so the face clears the headline)
  head: [0.16, 0.44], // eyebrow and headline lines arrive in turn, as the portrait settles into place
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
const idle = (fn: () => void, timeout = 1500) => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => fn(), { timeout });
  else setTimeout(fn, 200);
};

/* ------------------------------------------------------------------------------------------------ film */

function film(sec: HTMLElement) {
  const $ = <T extends Element>(s: string) => sec.querySelector<T>(s)!;
  const filmEl = $<HTMLElement>('[data-the-film]');
  const stage = $<HTMLElement>('[data-the-stage]');
  const travel = $<HTMLElement>('[data-the-travel]');
  const fig = $<HTMLElement>('[data-the-portrait]');
  const img = $<HTMLImageElement>('[data-the-hero]');
  const canvas = $<HTMLCanvasElement>('[data-the-canvas]');
  const shade = $<HTMLElement>('[data-the-shade]');
  const lines = [...sec.querySelectorAll<HTMLElement>('[data-the-line]')];
  const montage = $<HTMLElement>('[data-the-montage]');
  const panels = [...sec.querySelectorAll<HTMLElement>('[data-the-panel]')];
  const para = $<HTMLElement>('[data-the-para]');
  const bar = $<HTMLElement>('[data-the-bar]');
  const label = $<HTMLElement>('[data-the-label]');
  const hud = label.parentElement!;
  const later = [...sec.querySelectorAll<HTMLImageElement>('[data-the-panel] img, .the__group img')];

  const wide = window.matchMedia('(min-width: 1024px) and (min-height: 640px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => document.documentElement.classList.contains('js-motion') && !reduce.matches;

  /* ---- the portrait: prepared once, before it is needed ---- */

  let source: ImageBitmap | HTMLImageElement | null = null;
  let cam: HTMLElement = canvas; // the element the camera moves: the canvas, or the <img> if a canvas cannot be used
  let drawnFloating: boolean | null = null;
  let preparing: Promise<void> | null = null;

  function paint(floating: boolean) {
    if (!source || cam !== canvas) return;
    const g = canvas.getContext('2d');
    if (!g) return;
    if (canvas.width !== HERO.w) canvas.width = HERO.w;
    if (canvas.height !== HERO.h) canvas.height = HERO.h;
    g.globalCompositeOperation = 'copy';
    g.drawImage(source, 0, 0, HERO.w, HERO.h);
    // the edges dissolve into the room: baked in once, so no mask is recomposited while the camera moves
    g.globalCompositeOperation = 'destination-in';
    const lx = g.createLinearGradient(0, 0, HERO.w * FADE.left, 0);
    lx.addColorStop(0, 'rgba(0,0,0,0)');
    lx.addColorStop(1, '#000');
    g.fillStyle = lx;
    g.fillRect(0, 0, HERO.w, HERO.h);
    if (floating) {
      const v = g.createLinearGradient(0, 0, 0, HERO.h);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(FADE.top, '#000');
      v.addColorStop(1 - FADE.bottom, '#000');
      v.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = v;
      g.fillRect(0, 0, HERO.w, HERO.h);
    }
    g.globalCompositeOperation = 'source-over';
    drawnFloating = floating;
  }

  function useImageInstead() {
    // no canvas (or it failed): the camera moves the <img> itself, with the same sizes and a CSS edge fade
    cam = img;
    canvas.style.removeProperty('transform');
    sec.classList.add('is-fallback');
    if (active) measure();
  }

  const prepare = () =>
    (preparing ??= (async () => {
      img.loading = 'eager'; // in case the film only began after the page loaded (a resize from the phone layout)
      try {
        if (!img.complete) {
          await new Promise<void>((res, rej) => {
            img.addEventListener('load', () => res(), { once: true });
            img.addEventListener('error', () => rej(new Error('portrait failed to load')), { once: true });
          });
        }
        await img.decode();
        source = 'createImageBitmap' in window ? await createImageBitmap(img) : img;
        if (!canvas.getContext('2d')) throw new Error('no 2d canvas');
        paint(floating);
      } catch {
        // the photograph itself did not arrive (offline, blocked): the room simply stays dark around the headline
        if (!img.naturalWidth) return;
        // it arrived but a canvas could not be used: the camera moves the <img> instead
        useImageInstead();
      }
      sec.classList.add('is-ready');
      pose();
      // then the triptych and the group photograph, quietly, one after another, long before they are reached
      for (const im of later) {
        await new Promise<void>((r) => idle(() => r(), 2500));
        im.loading = 'eager';
        await im.decode().catch(() => {});
      }
    })());

  // a GPU reset can discard the canvas: draw it again
  canvas.addEventListener('contextrestored', () => paint(floating));

  /* ---- geometry: computed once per stage size, never while scrolling ---- */

  let W = 0;
  let H = 0;
  let travelPx = 1;
  let s0 = 0; // portrait width at the start: its layout width (set by the CSS), only ever scaled down from here
  let k = 1; // end width ÷ start width
  let x0 = 0, y0 = 0, x1 = 0, y1 = 0; // top-left corner at the start and at the end
  let fx = 0, fy = 0; // the fixed point of the move
  let floating = false;

  function measure() {
    W = fig.clientWidth;
    H = fig.clientHeight;
    travelPx = Math.max(1, travel.offsetHeight);
    s0 = parseFloat(getComputedStyle(cam).width) || W * 1.75;
    const cap = HERO.w * MAX_ZOOM;
    // end: tall enough to fill the stage top to bottom, and wide enough that no right-hand edge ever shows
    let s1 = Math.min(cap, Math.max(H * END_HEIGHT * A, (W - END_AT.x * W) / (1 - FACE.x) + 2), s0);
    // the sharpness limit leaves less than a tenth of pullback while still filling the screen: float the portrait
    floating = s0 * 0.9 < H * A;
    if (floating) s1 = s0 * FLOAT_PULLBACK;
    const h0 = s0 / A;
    const h1 = s1 / A;
    const inside = (v: number, size: number, room: number) => (size >= room ? clamp(v, room - size, 0) : clamp(v, 0, room - size));
    // start: the eyes where the visitor looks first; end: the face to the right, where the headline leaves room
    x0 = s0 >= W ? inside(START_AT.x * W - EYES.x * s0, s0, W) : Math.max(START_AT.x * W - EYES.x * s0, W - s0);
    y0 = inside(START_AT.y * H - EYES.y * h0, h0, H);
    x1 = Math.max(END_AT.x * W - FACE.x * s1, W - s1);
    y1 = inside(END_AT.y * H - FACE.y * h1, h1, H);
    k = s1 / s0;
    if (Math.abs(1 - k) > 1e-4) {
      fx = (x1 - k * x0) / (1 - k);
      fy = (y1 - k * y0) / (1 - k);
    }
    sec.classList.toggle('is-capped', floating);
    if (source && drawnFloating !== floating) paint(floating);
    snap = true;
  }

  /* ---- one frame ---- */

  let active = false; // film mode is on
  let near = false; // the section is on or near the screen
  let queued = false;
  let lastLabel = '';
  // the film's own progress follows the scroll position through a critically damped spring
  let q = 0;
  let v = 0;
  let lastT = 0;
  let snap = true;
  let still = '';
  // the film's top on screen, read in the scroll event (before any script writes in this frame, so it never forces
  // a style or layout pass) and when the section comes near; the frame itself only writes
  let top = 0;
  const readTop = () => (top = filmEl.getBoundingClientRect().top);
  // whether the section is on or near the screen is also decided here, in the scroll event itself: a jump (scrollbar
  // drag, Page Down, find in page) then draws the right frame before it is first shown, instead of a frame later
  const onScroll = () => {
    if (!active) return;
    const r = sec.getBoundingClientRect();
    const isNear = r.bottom > -0.5 * innerHeight && r.top < 1.5 * innerHeight;
    if (!isNear) {
      near = false;
      return;
    }
    if (!near) {
      near = true;
      snap = true;
    }
    readTop();
    request();
  };

  // draw the current position at once, even while the section is not near (cheap): it is then right whenever it shows
  function pose() {
    if (!active) return;
    readTop();
    snap = true;
    frame(performance.now(), true);
  }

  function frame(now: number, force = false) {
    queued = false;
    if (!active || (!near && !force)) return;
    const target = clamp(-top / travelPx);
    // a frame that starts the loop again after it went still counts as one ordinary frame, not the whole pause
    const dt = lastT ? Math.min(0.064, Math.max(0, (now - lastT) / 1000)) : 1 / 60;
    lastT = now;
    if (snap || FOLLOW <= 0) {
      q = target;
      v = 0;
      snap = false;
    } else {
      // exact solution of x'' = -w²(x - target) - 2w x' over dt (stable at any frame rate, never overshoots)
      const e = q - target;
      const c = v + FOLLOW * e;
      const d = Math.exp(-FOLLOW * dt);
      q = target + (e + c * dt) * d;
      v = (v - FOLLOW * c * dt) * d;
      if (Math.abs(q - target) < 2e-5 && Math.abs(v) < 2e-4) {
        q = target;
        v = 0;
      }
    }
    render(q);
    const settled = q === target && v === 0;
    const s = settled ? '1' : '0';
    if (s !== still) sec.dataset.theStill = still = s;
    if (settled) lastT = 0;
    else request();
  }

  function render(p: number) {
    // 01 — the camera: one similarity transform about its fixed point, scale interpolated geometrically
    const a = span(p, T.pull);
    const r = Math.pow(k, a);
    const x = Math.abs(1 - k) > 1e-4 ? fx + (x0 - fx) * r : x0 + (x1 - x0) * a;
    const y = Math.abs(1 - k) > 1e-4 ? fy + (y0 - fy) * r : y0 + (y1 - y0) * a;
    cam.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${r.toFixed(5)})`;

    // the headline, line by line as the portrait settles, then away as the triptych opens
    const head = span(p, T.head);
    const out = span(p, T.headOut);
    const hw = T.head[1] - T.head[0];
    lines.forEach((el, i) => {
      const start = T.head[0] + i * LINE_STEP * hw;
      const t = smooth((p - start) / (LINE_LEN * hw));
      el.style.opacity = (t * (1 - out)).toFixed(3);
      el.style.transform = `translate3d(0,${((1 - t) * (i === 0 ? 14 : 38) - out * 18).toFixed(2)}px,0)`;
    });
    shade.style.opacity = (0.15 + 0.85 * head).toFixed(3);

    // 02 — the triptych opens from each panel's centre, left first; the portrait recedes behind it
    const b = span(p, T.montage);
    fig.style.opacity = (1 - b).toFixed(3);
    montage.style.opacity = b.toFixed(3);
    panels.forEach((el, i) => {
      const z = smooth((p - T.montage[0] - i * T.panelStep) / T.panelLen);
      el.style.clipPath = `inset(${((1 - z) * 18).toFixed(2)}% ${((1 - z) * 50).toFixed(2)}%)`;
      el.style.transform = `translate3d(${((i - 1) * 65 * (1 - z)).toFixed(2)}px,0,0)`;
      (el.firstElementChild as HTMLElement).style.transform = `scale(${(1.12 - 0.12 * z).toFixed(4)})`;
    });

    // the first thought of the message, held for reading; the editorial page then rises over it
    const pp = span(p, T.para);
    para.style.opacity = pp.toFixed(3);
    para.style.transform = `translate3d(0,${(20 * (1 - pp)).toFixed(2)}px,0)`;

    // the quiet progress line fills over the film
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    const text = p < T.montage[0] ? 'Through her eyes' : 'Her world';
    if (text !== lastLabel) label.textContent = lastLabel = text;
    // once the editorial page covers the stage, its skip link must not take keyboard focus behind it
    const covered = -top > travelPx + 1;
    if (hud.inert !== covered) hud.inert = covered;
  }

  function request() {
    if (!queued && active && near) {
      queued = true;
      requestAnimationFrame(frame);
    }
  }

  // every inline style this script writes, so the flow layout is exactly as the CSS defines it
  const owned = () => [canvas, img, shade, fig, montage, para, bar, ...lines, ...panels, ...panels.map((p) => p.firstElementChild as HTMLElement)];
  function clear() {
    owned().forEach((el) => {
      el.style.removeProperty('transform');
      el.style.removeProperty('opacity');
      el.style.removeProperty('clip-path');
    });
  }

  function sync() {
    const on = wide.matches && motionAllowed();
    if (on && !active) {
      active = true;
      sec.classList.add('is-film');
      measure();
      const r = sec.getBoundingClientRect();
      near = r.bottom > -0.5 * innerHeight && r.top < 1.5 * innerHeight;
      pose();
      // the portrait is prepared once the page has finished loading and the browser is idle (or at once, if the
      // visitor is already close)
      if (document.readyState === 'complete') idle(prepare);
      else window.addEventListener('load', () => idle(prepare), { once: true });
    } else if (!on && active) {
      active = false;
      sec.classList.remove('is-film', 'is-capped');
      delete sec.dataset.theStill;
      still = '';
      hud.inert = false;
      clear();
    } else if (on) {
      measure();
      pose();
    } else {
      // never active: clear the layout the page decided on while it was being read (reduced motion switched on in
      // between, for instance)
      sec.classList.remove('is-film', 'is-capped');
    }
  }

  // only work while the section is on or near the screen; prepare at once if the visitor gets close early
  new IntersectionObserver(
    (entries) => {
      const was = near;
      near = entries.some((e) => e.isIntersecting);
      if (near && !was) pose();
      else if (near) request();
    },
    { rootMargin: '50% 0px 50% 0px' },
  ).observe(sec);
  new IntersectionObserver(
    (entries) => {
      if (active && entries.some((e) => e.isIntersecting)) {
        img.fetchPriority = 'high';
        prepare();
      }
    },
    { rootMargin: '0px 0px 200% 0px' },
  ).observe(sec);

  window.addEventListener('scroll', onScroll, { passive: true });
  wide.addEventListener('change', sync);
  reduce.addEventListener('change', sync);
  // stage size changes (window resize, browser zoom, moving to another screen) re-measure once, then redraw
  new ResizeObserver(() => sync()).observe(fig);
  sync();
}

const sec = document.querySelector<HTMLElement>('[data-the]');
if (sec) {
  // tells the page's own safety check (in ThroughHerEyes.astro) that the film is being driven
  sec.dataset.theLive = '';
  film(sec);
}
