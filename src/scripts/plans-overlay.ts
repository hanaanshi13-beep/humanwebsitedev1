// Explore Plans — the expanding category overlay.
// A selected card expands, from where it sits, into one large panel (a FLIP: the panel's box and its photograph are
// animated from the card's rectangle to their resting rectangles), and returns to the same card on close. The
// dialog is native (<dialog>.showModal): focus is held inside it, the page behind is inert, Escape closes it.
// With reduced motion there is no flight, only a short fade. Nothing here navigates, and nothing is sent anywhere.

type State = 'closed' | 'opening' | 'open' | 'closing';

const found = document.querySelector<HTMLDialogElement>('[data-plans-overlay]');
if (found && typeof found.showModal === 'function') init(found);

function init(dlg: HTMLDialogElement) {
  const scrim = dlg.querySelector<HTMLElement>('[data-xo-scrim]')!;
  const shell = dlg.querySelector<HTMLElement>('[data-xo-shell]')!;
  const photo = dlg.querySelector<HTMLElement>('[data-xo-photo]')!;
  const img = dlg.querySelector<HTMLImageElement>('[data-xo-img]')!;
  const cap = dlg.querySelector<HTMLElement>('[data-xo-cap]')!;
  const capTitle = dlg.querySelector<HTMLElement>('[data-xo-cap-title]')!;
  const body = dlg.querySelector<HTMLElement>('[data-xo-body]')!;
  const closeBtn = dlg.querySelector<HTMLButtonElement>('[data-xo-close]')!;
  const panels = new Map<string, HTMLElement>();
  dlg.querySelectorAll<HTMLElement>('[data-xo-panel]').forEach((p) => panels.set(p.dataset.xoPanel!, p));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'; // settles smoothly, no overshoot
  const OPEN_MS = 500;
  const CLOSE_MS = 450;
  const SCRIM_MS = 400;

  let state: State = 'closed';
  let source: HTMLButtonElement | null = null;
  let running: Animation[] = [];
  let token = 0; // invalidates late callbacks from an interrupted transition

  const setState = (s: State) => {
    state = s;
    dlg.dataset.state = s;
  };
  const stopAll = () => {
    running.forEach((a) => a.cancel());
    running = [];
  };
  const play = (el: Element, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
    const a = el.animate(frames, opts);
    running.push(a);
    return a;
  };
  const box = (r: DOMRect, radius: string): Keyframe => ({
    left: `${r.left}px`,
    top: `${r.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    right: 'auto',
    bottom: 'auto',
    margin: '0',
    maxWidth: 'none',
    maxHeight: 'none',
    borderRadius: radius,
  });

  // ----- page scroll is held while the overlay is open, without the page shifting sideways -----
  const root = document.documentElement;
  const lock = (on: boolean) => {
    if (on) {
      const before = root.clientWidth;
      root.style.overflow = 'hidden';
      const gained = root.clientWidth - before; // a classic scrollbar just disappeared
      if (gained > 0) root.style.paddingRight = `${gained}px`;
    } else {
      root.style.overflow = '';
      root.style.paddingRight = '';
    }
  };

  // ----- the body becomes a keyboard-scrollable region only when it actually overflows -----
  const syncScrollable = () => {
    const overflows = body.scrollHeight > body.clientHeight + 1;
    body.classList.toggle('is-scrollable', overflows);
    body.classList.toggle('is-at-end', body.scrollTop + body.clientHeight >= body.scrollHeight - 2);
    if (overflows) {
      body.tabIndex = 0;
      body.setAttribute('role', 'group');
      body.setAttribute('aria-label', 'Memberships');
    } else {
      body.removeAttribute('tabindex');
      body.removeAttribute('role');
      body.removeAttribute('aria-label');
    }
  };

  /** fix the text block at its resting size, anchored to the panel's far corner, for the length of a flight */
  const pinBody = () => {
    const b = body.getBoundingClientRect();
    shell.classList.add('is-flying');
    body.style.width = `${b.width}px`;
    body.style.height = `${b.height}px`;
  };
  const unpinBody = () => {
    shell.classList.remove('is-flying');
    body.style.width = '';
    body.style.height = '';
  };

  /** once open, fetch a sharper rendition if the panel shows the photograph larger than the card did */
  const sharpen = (cardImg: HTMLImageElement, mine: number) => {
    if (!cardImg.srcset) return;
    const r = photo.getBoundingClientRect();
    const need = Math.ceil(Math.max(r.width, r.height * 0.75));
    const have = cardImg.currentSrc;
    const probe = new Image();
    probe.sizes = `${need}px`;
    probe.srcset = cardImg.srcset;
    probe
      .decode()
      .then(() => {
        if (mine === token && state !== 'closed' && probe.currentSrc && probe.currentSrc !== have && probe.naturalWidth > img.naturalWidth) {
          img.src = probe.currentSrc;
        }
      })
      .catch(() => {});
  };

  function open(btn: HTMLButtonElement) {
    if (state !== 'closed') return; // one overlay, one transition at a time
    const id = btn.dataset.planOpen ?? '';
    const panel = panels.get(id);
    if (!panel) return;
    const mine = ++token;
    source = btn;
    const card = btn.closest<HTMLElement>('.xp-card');
    const cardImg = btn.querySelector<HTMLImageElement>('img');
    const from = btn.getBoundingClientRect();

    // content for this category
    panels.forEach((p, key) => (p.hidden = key !== id));
    dlg.setAttribute('aria-labelledby', `xo-title-${id}`);
    const cs = card ? getComputedStyle(card) : null;
    photo.style.setProperty('--tint', cs?.getPropertyValue('--tint') || '');
    photo.style.setProperty('--focus', panel.dataset.focus ?? '');
    photo.style.setProperty('--focus-wide', panel.dataset.focusWide ?? '');
    const usable = !!cardImg && !card?.classList.contains('is-missing') && cardImg.complete && cardImg.naturalWidth > 0;
    img.hidden = !usable;
    if (usable) {
      // the very image the card is showing: already downloaded and decoded, so the expansion never flashes
      const src = cardImg!.currentSrc || cardImg!.src;
      if (img.getAttribute('src') !== src) img.src = src;
      img.alt = panel.dataset.alt ?? '';
    } else {
      img.removeAttribute('src');
      img.alt = '';
    }
    // the card's caption, repeated at the card's own size for the first moments
    const title = btn.querySelector<HTMLElement>('.xp-card__title');
    const capBox = btn.querySelector<HTMLElement>('.xp-card__cap');
    capTitle.textContent = title?.textContent ?? '';
    if (title && capBox) {
      const t = getComputedStyle(title);
      const c = getComputedStyle(capBox);
      capTitle.style.fontSize = t.fontSize;
      cap.style.setProperty('--xp-inset', c.left);
      cap.style.setProperty('--xp-go', '46px');
      cap.style.setProperty('--shade', cs?.getPropertyValue('--shade') || '0.74');
    }
    body.scrollTop = 0;

    lock(true);
    dlg.showModal();
    card?.classList.add('is-source');
    setState('opening');
    syncScrollable();

    if (reduce.matches) {
      stopAll();
      play(dlg, [{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
      setState('open');
      if (usable) sharpen(cardImg!, mine);
      return;
    }

    // FLIP. Measure the resting layout first, then start every piece from the card's rectangle.
    unpinBody();
    const to = shell.getBoundingClientRect();
    const pane = photo.getBoundingClientRect();
    const restRadius = getComputedStyle(shell).borderTopLeftRadius;
    const cardRadius = getComputedStyle(btn).borderTopLeftRadius;
    const restFocus = getComputedStyle(img).objectPosition;
    pinBody();
    stopAll();
    const flight = play(shell, [box(from, cardRadius), box(to, restRadius)], { duration: OPEN_MS, easing: EASE });
    play(photo, [{ width: `${from.width}px`, height: `${from.height}px` }, { width: `${pane.width}px`, height: `${pane.height}px` }], { duration: OPEN_MS, easing: EASE });
    play(img, [{ objectPosition: '50% 50%' }, { objectPosition: restFocus }], { duration: OPEN_MS, easing: EASE });
    play(cap, [{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out' });
    play(scrim, [{ opacity: 0 }, { opacity: 1 }], { duration: SCRIM_MS, easing: 'ease-out' });
    flight.finished
      .then(() => {
        if (mine !== token || state !== 'opening') return;
        stopAll();
        unpinBody();
        setState('open');
        syncScrollable();
        if (usable) sharpen(cardImg!, mine);
      })
      .catch(() => {});
  }

  function finish() {
    stopAll();
    unpinBody();
    const card = source?.closest<HTMLElement>('.xp-card');
    if (dlg.open) dlg.close();
    card?.classList.remove('is-source');
    lock(false);
    setState('closed');
    // back to the card that opened it, without moving the page or the row
    source?.focus({ preventScroll: true });
    source = null;
  }

  function close() {
    if (state === 'closed' || state === 'closing') return;
    const mine = ++token;
    // where things are right now (possibly mid-expansion), before the running animations are dropped
    const fromShell = shell.getBoundingClientRect();
    const fromPane = photo.getBoundingClientRect();
    const fromRadius = getComputedStyle(shell).borderTopLeftRadius;
    const fromFocus = getComputedStyle(img).objectPosition;
    const fromScrim = getComputedStyle(scrim).opacity;
    const wasFlying = shell.classList.contains('is-flying');
    setState('closing');

    const target = source?.isConnected ? source.getBoundingClientRect() : null;
    const onScreen = !!target && target.width > 0 && target.right > 0 && target.left < window.innerWidth && target.bottom > 0 && target.top < window.innerHeight;

    if (reduce.matches || !target || !onScreen) {
      stopAll();
      play(dlg, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-in', fill: 'forwards' })
        .finished.then(() => mine === token && finish())
        .catch(() => {});
      return;
    }

    if (!wasFlying) pinBody();
    stopAll();
    const cardRadius = getComputedStyle(source!).borderTopLeftRadius;
    const opts: KeyframeAnimationOptions = { duration: CLOSE_MS, easing: EASE, fill: 'forwards' };
    const flight = play(shell, [box(fromShell, fromRadius), box(target, cardRadius)], opts);
    play(photo, [{ width: `${fromPane.width}px`, height: `${fromPane.height}px` }, { width: `${target.width}px`, height: `${target.height}px` }], opts);
    play(img, [{ objectPosition: fromFocus }, { objectPosition: '50% 50%' }], opts);
    play(body, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease-out', fill: 'forwards' });
    play(closeBtn, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease-out', fill: 'forwards' });
    play(cap, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: CLOSE_MS - 300, easing: 'ease-out', fill: 'both' });
    play(scrim, [{ opacity: Number(fromScrim) }, { opacity: 0 }], { duration: CLOSE_MS, easing: 'ease-in-out', fill: 'forwards' });
    flight.finished.then(() => mine === token && finish()).catch(() => {});
  }

  // ----- wiring -----
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element | null)?.closest?.<HTMLButtonElement>('[data-plan-open]');
    if (btn) open(btn);
  });
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', close); // outside the panel
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault(); // Escape: play the return rather than vanish
    close();
  });
  // if the browser closes the dialog itself (a second Escape), leave everything in a clean state
  dlg.addEventListener('close', () => {
    if (state !== 'closed') {
      token++;
      finish();
    }
  });
  window.addEventListener('resize', () => state === 'open' && syncScrollable());
  body.addEventListener('scroll', () => body.classList.toggle('is-at-end', body.scrollTop + body.clientHeight >= body.scrollHeight - 2), { passive: true });
}
