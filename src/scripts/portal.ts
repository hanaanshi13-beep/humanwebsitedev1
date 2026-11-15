// HUMAN Portal — chapter navigation, questionnaire state, the cinematic transitions and submission.
// The draft lives in memory only: never in the URL, storage, logs or analytics.
// The Finale is reachable for real only from an authoritative `accepted` response to this submission.
import type { Visual } from '../data/portal';

type Manifest = {
  images: Record<string, { src: string; alt: string; w: number; h: number }>;
  interests: { key: string; label: string; visual: Visual }[];
  fallback: Visual;
  motion: { chapterOut: number; bloodwork: Record<string, number>; finale: number };
  privacyVersion: string;
};

export type Draft = {
  firstName: string;
  ageGroup: string | null;
  gender: string | null;
  genderSelfDescribed: string | null;
  interests: string[];
  email: string;
  mobile: string | null;
  city: string | null;
  waitlistConsent: boolean;
};

export const validators = {
  firstName(v: string) {
    const s = v.trim();
    if (!s) return 'Enter your first name.';
    if (s.length > 80) return 'That name is too long. Use up to 80 characters.';
    return '';
  },
  email(v: string) {
    const s = v.trim();
    if (!s) return 'Enter your email address.';
    if (s.length > 254 || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(s)) return 'Enter an email address like you@example.com.';
    return '';
  },
  /** Optional. Any plausible international number: a country code and 6–14 further digits. */
  mobile(cc: string, v: string) {
    if (!v.trim()) return '';
    return normaliseMobile(cc, v) ? '' : 'Enter a mobile number with its country code, or leave this blank.';
  },
};

/** E.164-style string for a plausible number, else ''. A number typed with its own + keeps its own country code. */
export function normaliseMobile(cc: string, v: string): string {
  const raw = v.replace(/[\s\-().]/g, '');
  if (!raw) return '';
  const own = raw.startsWith('+');
  const code = (own ? '' : cc.replace(/[\s\-()]/g, '')).replace(/^00/, '+');
  const digits = raw.replace(/^\+/, '').replace(/^0+(?=\d)/, own ? '' : '');
  if (!/^\d+$/.test(digits)) return '';
  if (!own && !/^\+\d{1,4}$/.test(code)) return '';
  const full = (own ? '+' : code) + digits;
  return /^\+\d{7,15}$/.test(full) ? full : '';
}

export function createPortal(root: HTMLElement) {
  const M = JSON.parse(root.dataset.manifest || '{}') as Manifest;
  const endpoint = () => root.dataset.endpoint || '';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const $$ = <T extends HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
  const chapterEl = (n: number) => $<HTMLElement>(`[data-ch="${n}"]`);
  const input = (name: string) => root.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
  const announce = $('[data-announce]');
  const fx = $('[data-fx]');
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const draft: Draft = {
    firstName: '', ageGroup: null, gender: null, genderSelfDescribed: null, interests: [],
    email: '', mobile: null, city: null, waitlistConsent: false,
  };
  let chapter = 1;
  let reached = 1; // furthest chapter the visitor has legitimately opened
  let busy = false; // a chapter transition is playing
  let submitting = false;
  let accepted = false; // set only by an authoritative accepted response
  let previewDemo = false; // preview build only: the visitor chose to look at the closing chapter
  let idempotencyKey = '';

  // ------------------------------------------------------------------ images
  const decoded = new Map<string, Promise<void>>();
  /** Fetch and decode ahead of need. Never rejects: a slow or failed image only costs the fancy transition. */
  const warm = (id: string) => {
    if (!decoded.has(id)) {
      const im = new Image();
      im.src = M.images[id].src;
      decoded.set(id, (im.decode ? im.decode() : Promise.resolve()).catch(() => undefined));
    }
    return decoded.get(id)!;
  };
  const ready = (ids: string[], ms: number) => Promise.race([Promise.all(ids.map(warm)).then(() => true), wait(ms).then(() => false)]);

  // ------------------------------------------------------------------ shell
  const TONE: Record<number, 'light' | 'dark'> = { 1: 'light', 2: 'light', 3: 'light', 4: 'light', 5: 'dark' };
  function paintShell() {
    root.dataset.chapter = String(chapter);
    root.dataset.tone = TONE[chapter];
    $('[data-count]').textContent = String(chapter).padStart(2, '0');
    $$('[data-seg]').forEach((s) => s.classList.toggle('is-done', Number(s.dataset.seg) <= chapter));
  }
  function settle(n: number, focus = true) {
    const el = chapterEl(n);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const h = el.querySelector<HTMLElement>('h1');
    if (focus && h) h.focus({ preventScroll: true });
    announce.textContent = `Chapter ${n} of 5. ${h?.textContent?.replace(/\s+/g, ' ').trim() ?? ''}`;
  }
  function reveal(n: number, cls = '') {
    $$('[data-ch]').forEach((c) => {
      const on = Number(c.dataset.ch) === n;
      c.hidden = !on;
      c.classList.remove('is-out', 'is-in', 'is-leaving', 'from-film');
      if (on) {
        void c.offsetWidth; // restart the entrance choreography
        c.classList.add('is-in');
        if (cls) c.classList.add(cls);
      }
    });
    chapter = n;
    reached = Math.max(reached, n);
    paintShell();
  }

  // ------------------------------------------------------------------ transitions
  const anims: Animation[] = [];
  const play = (el: Element, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
    const a = el.animate(frames, { fill: 'both', ...opts });
    anims.push(a);
    return a.finished.catch(() => undefined);
  };
  function clearFx() {
    anims.splice(0).forEach((a) => a.cancel());
    fx.hidden = true;
    fx.querySelectorAll<HTMLElement>('img, span').forEach((e) => e.removeAttribute('style'));
    delete root.dataset.fx;
  }

  /** Plain passage: the old chapter softens out, the new one plays its own entrance. */
  async function plain(to: number) {
    const from = chapterEl(chapter);
    if (!reduce.matches) {
      from.classList.add('is-out');
      await wait(M.motion.chapterOut);
    }
    reveal(to);
  }

  /** A colour field rises over the old chapter and clears from the new one (scientific room → champagne, form → night). */
  async function wash(to: number, colour: string, inMs: number, outMs: number) {
    if (reduce.matches) return reveal(to);
    const w = fx.querySelector<HTMLElement>('[data-fx-wash]')!;
    fx.hidden = false;
    w.style.background = colour;
    await play(w, [{ opacity: 0 }, { opacity: 1 }], { duration: inMs, easing: 'cubic-bezier(0.65,0,0.35,1)' });
    reveal(to);
    await play(w, [{ opacity: 1 }, { opacity: 0 }], { duration: outMs, easing: 'cubic-bezier(0.22,0.8,0.26,1)' });
    clearFx();
  }

  /**
   * The signature passage, Chapter 01 → 02: tube → macro → cells → portrait.
   * One continuous push-in built from three stills. Each layer keeps growing while the next opens over it through
   * a widening iris centred on the same point, so the eye reads one camera move rather than three pictures.
   */
  async function bloodwork() {
    const t = M.motion.bloodwork;
    const ok = !reduce.matches && (await ready(['A01', 'A02', 'A03', 'A06'], 250));
    if (!ok) return plain(2); // images not decoded in time, or motion not wanted: a simple dissolve
    const tube = $<HTMLImageElement>('[data-tube]');
    const r = tube.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const [a, b, c] = ['a', 'b', 'c'].map((k) => fx.querySelector<HTMLImageElement>(`[data-fx-img="${k}"]`)!);
    a.src = M.images.A01.src;
    b.src = M.images.A02.src;
    c.src = M.images.A03.src;
    fx.hidden = false;
    root.dataset.fx = 'blood';

    // layer A starts exactly where the opening photograph is, then pushes towards the label on the tube
    Object.assign(a.style, { inset: 'auto', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, opacity: '1', objectPosition: getComputedStyle(tube).objectPosition, transformOrigin: '50% 46%' });
    tube.style.visibility = 'hidden';
    chapterEl(1).classList.add('is-leaving');
    const dx = vw / 2 - (r.left + r.width * 0.5);
    const dy = vh / 2 - (r.top + r.height * 0.46);
    const ease = 'cubic-bezier(0.6,0,0.3,1)';

    play(a, [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px,${dy}px) scale(3.4)` }], { delay: t.tubeStart, duration: t.cellsStart - t.tubeStart, easing: ease });
    // macro: opens from the tube's centre, already moving, and keeps pushing in towards the sample
    b.style.transformOrigin = '38% 58%';
    play(b, [
      { opacity: 0, clipPath: 'circle(6% at 50% 50%)', transform: 'scale(1.02)' },
      { opacity: 1, clipPath: 'circle(40% at 50% 50%)', transform: 'scale(1.16)', offset: 0.35 },
      { opacity: 1, clipPath: 'circle(120% at 50% 50%)', transform: 'scale(1.9)' },
    ], { delay: t.macroStart, duration: t.handover - t.macroStart, easing: 'cubic-bezier(0.5,0,0.4,1)' });
    // cells: dissolve up out of the red of the sample, the camera still travelling
    c.style.transformOrigin = '55% 50%';
    play(c, [
      { opacity: 0, transform: 'scale(1.5)' },
      { opacity: 1, transform: 'scale(1.28)', offset: 0.5 },
      { opacity: 1, transform: 'scale(1.12)' },
    ], { delay: t.cellsStart, duration: t.end - t.cellsStart, easing: 'cubic-bezier(0.3,0.6,0.3,1)' });

    await wait(t.handover);
    // Chapter 02 is laid out underneath; the cells then close down onto the portrait and let go
    reveal(2, 'from-film');
    a.style.visibility = 'hidden';
    b.style.visibility = 'hidden';
    tube.style.visibility = '';
    const p = $('[data-portraits] .hp2__a').getBoundingClientRect();
    const inset = `inset(${Math.max(0, p.top)}px ${Math.max(0, vw - p.right)}px ${Math.max(0, vh - p.bottom)}px ${Math.max(0, p.left)}px round 4px)`;
    await play(c, [
      { clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 },
      { clipPath: inset, opacity: 1, offset: 0.6 },
      { clipPath: inset, opacity: 0 },
    ], { duration: t.end - t.handover + 260, easing: 'cubic-bezier(0.65,0,0.35,1)', composite: 'replace' });
    clearFx();
  }

  async function go(to: number, opts: { push?: boolean; focus?: boolean } = {}) {
    if (busy || to === chapter) return;
    if (to === 5 && !(accepted || previewDemo)) return; // never by navigation alone
    busy = true;
    const from = chapter;
    try {
      if (from === 1 && to === 2) await bloodwork();
      else if (from === 3 && to === 4) await wash(4, '#e8ddcc', 420, 620);
      else if (to === 5) await wash(5, '#120c08', 520, 900);
      else await plain(to);
    } catch {
      clearFx();
      reveal(to);
    }
    busy = false;
    if (opts.push) history.pushState({ hp: to }, '', location.pathname);
    settle(to, opts.focus !== false);
    onEnter(to);
  }

  function onEnter(n: number) {
    // prepare what the next step will need, a little at a time
    if (n === 1) ['A02', 'A03', 'A06', 'A10'].forEach(warm);
    if (n === 2) [M.fallback.asset, 'A14'].forEach(warm);
    if (n === 3) {
      showVisual(activeTopic);
      M.interests.forEach((i) => warm(i.visual.asset));
    }
    if (n === 4) warm('A13');
    if (n === 5) {
      const name = draft.firstName.trim();
      $('[data-thanks]').textContent = name ? `Thank you, ${name}.` : 'Thank you.';
      $<HTMLElement>('[data-preview-flag]').hidden = accepted;
    }
  }

  // ------------------------------------------------------------------ chapter 03: the visual panel
  const panel = $('[data-panel]');
  const slots = $$('[data-slot]');
  const topicLabel = $('[data-topic-label]');
  let front = 0;
  let token = 0;
  let activeTopic: string | null = null; // the visual topic (independent of what is selected)
  let previewTopic: string | null = null;
  let thenTimer = 0;
  const visualOf = (key: string | null) => M.interests.find((i) => i.key === key)?.visual ?? M.fallback;
  const labelOf = (key: string | null) => M.interests.find((i) => i.key === key)?.label ?? 'Bloodwork, up close';

  async function paint(asset: string, v: Visual, pos: string | undefined, key: string | null) {
    const mine = ++token;
    await warm(asset);
    if (mine !== token) return; // a newer request has replaced this one
    const next = slots[1 - front];
    const info = M.images[asset];
    const pic = next.querySelector<HTMLImageElement>('.hp3__pic')!;
    const bg = next.querySelector<HTMLImageElement>('.hp3__bg')!;
    const fit = asset === v.asset ? (v.fit ?? 'cover') : 'cover';
    pic.src = info.src;
    pic.alt = info.alt;
    pic.style.objectPosition = pos ?? '50% 50%';
    // a tighter crop where the photograph needs one (keeps the subject, leaves unrelated detail out of frame)
    const own = asset === v.asset;
    pic.style.transform = own && v.zoom ? `scale(${v.zoom})` : '';
    pic.style.transformOrigin = own && v.origin ? v.origin : '';
    pic.style.setProperty('--natural-w', `${Math.round(info.w * 1.25)}px`);
    next.dataset.fit = fit;
    if (fit === 'frame') bg.src = info.src;
    else bg.removeAttribute('src');
    slots[front].classList.remove('is-on');
    next.classList.add('is-on');
    front = 1 - front;
    panel.dataset.kind = asset === v.asset ? v.kind : 'science';
    panel.toggleAttribute('data-glow', !!v.glow);
    topicLabel.textContent = labelOf(key);
    panel.classList.remove('is-sweeping');
    void panel.offsetWidth;
    panel.classList.add('is-sweeping');
  }
  function showVisual(key: string | null) {
    window.clearTimeout(thenTimer);
    const v = visualOf(key);
    void paint(v.asset, v, v.pos, key);
    if (v.then) {
      const second = v.then;
      warm(second);
      // lifestyle first, then the anatomy beneath it — unless the visitor has moved on in the meantime
      thenTimer = window.setTimeout(() => {
        if ((previewTopic ?? activeTopic) === key && chapter === 3) void paint(second, v, v.thenPos, key);
      }, 1900);
    }
  }
  $$<HTMLInputElement>('[name="interests"]').forEach((box) => {
    const key = box.value;
    box.addEventListener('change', () => {
      draft.interests = $$<HTMLInputElement>('[name="interests"]').filter((b) => b.checked).map((b) => b.value);
      // choosing a topic shows it; removing the one on show falls back to the most recent that is still chosen
      if (box.checked) activeTopic = key;
      else if (activeTopic === key) activeTopic = draft.interests[draft.interests.length - 1] ?? null;
      previewTopic = null;
      showVisual(activeTopic);
    });
    // wide screens with a pointer: looking at a topic previews it without selecting it
    const chip = box.closest<HTMLElement>('[data-topic]')!;
    const preview = (on: boolean) => {
      if (!window.matchMedia('(hover: hover) and (min-width: 900px)').matches) return;
      const want = on ? key : null;
      if (want === previewTopic) return;
      previewTopic = want;
      showVisual(previewTopic ?? activeTopic);
    };
    chip.addEventListener('pointerenter', () => preview(true));
    chip.addEventListener('pointerleave', () => preview(false));
    box.addEventListener('focus', () => box.matches(':focus-visible') && preview(true));
    box.addEventListener('blur', () => preview(false));
  });

  // ------------------------------------------------------------------ fields
  function setError(el: HTMLElement, msg: string) {
    const err = root.querySelector<HTMLElement>(`#${el.id}-err`);
    if (msg) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    if (err) err.textContent = msg;
  }
  const checkedValue = (name: string) => root.querySelector<HTMLInputElement>(`[name="${name}"]:checked`)?.value ?? null;
  const selfField = $<HTMLElement>('[data-self-field]');
  $$<HTMLInputElement>('[name="gender"]').forEach((r) =>
    r.addEventListener('change', () => {
      selfField.hidden = !root.querySelector<HTMLInputElement>('[name="gender"][data-self]')!.checked;
    }),
  );

  function readChapter2() {
    draft.firstName = input('firstName').value.trim();
    draft.ageGroup = checkedValue('ageGroup');
    draft.gender = checkedValue('gender');
    draft.genderSelfDescribed = !selfField.hidden ? input('genderSelf').value.trim() || null : null;
  }
  function validate(n: number): boolean {
    const problems: [HTMLElement, string][] = [];
    if (n === 2) problems.push([input('firstName'), validators.firstName(input('firstName').value)]);
    if (n === 4) {
      problems.push([input('email'), validators.email(input('email').value)]);
      problems.push([input('mobile'), validators.mobile(input('countryCode').value, input('mobile').value)]);
      problems.push([input('waitlistConsent'), input('waitlistConsent').checked ? '' : 'To join, please agree to receive waitlist and launch updates.']);
    }
    problems.forEach(([el, msg]) => setError(el, msg));
    const bad = problems.filter(([, msg]) => msg);
    if (bad.length) {
      announce.textContent = bad.map(([, m]) => m).join(' ');
      bad[0][0].focus();
      return false;
    }
    return true;
  }
  // an error clears as soon as its field is put right
  input('firstName').addEventListener('input', () => input('firstName').getAttribute('aria-invalid') && !validators.firstName(input('firstName').value) && setError(input('firstName'), ''));
  input('email').addEventListener('input', () => input('email').getAttribute('aria-invalid') && !validators.email(input('email').value) && setError(input('email'), ''));
  (['mobile', 'countryCode'] as const).forEach((f) =>
    input(f).addEventListener('input', () => input('mobile').getAttribute('aria-invalid') && !validators.mobile(input('countryCode').value, input('mobile').value) && setError(input('mobile'), '')),
  );
  input('waitlistConsent').addEventListener('change', () => input('waitlistConsent').checked && setError(input('waitlistConsent'), ''));

  // ------------------------------------------------------------------ submission
  const notice = $('[data-notice]');
  const submitBtn = $<HTMLButtonElement>('[data-submit]');
  const submitLabel = $('[data-submit-label]');
  const demoBtn = $<HTMLButtonElement>('[data-demo]');
  function showNotice(title: string, body: string, kind: 'info' | 'error' = 'info', demo = false) {
    notice.dataset.kind = kind;
    $('[data-notice-title]').textContent = title;
    $('[data-notice-body]').textContent = body;
    demoBtn.hidden = !demo;
    notice.classList.add('is-on');
  }
  const hideNotice = () => notice.classList.remove('is-on');

  async function submit() {
    if (submitting || accepted) return; // a second press while sending does nothing
    if (!validate(4)) return;
    draft.email = input('email').value.trim();
    draft.mobile = normaliseMobile(input('countryCode').value, input('mobile').value) || null;
    draft.city = input('city').value.trim() || null;
    draft.waitlistConsent = true;

    if (!endpoint()) {
      // Preview: nothing is sent or stored, and nobody is registered.
      showNotice(
        'Preview — not accepting registrations yet.',
        'Nothing has been sent or saved, and you have not been added to a list. Registration opens once the privacy notice and the systems behind it are approved.',
        'info',
        true,
      );
      notice.focus({ preventScroll: false });
      return;
    }

    submitting = true;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Joining…';
    showNotice('Joining…', 'Please wait a moment.');
    idempotencyKey ||= crypto.randomUUID();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ ...draft, consentAt: new Date().toISOString(), privacyNoticeVersion: M.privacyVersion }),
        signal: ctrl.signal,
      });
      const data = (await res.json().catch(() => null)) as { status?: string; userFacingMessage?: string } | null;
      if (res.ok && data?.status === 'accepted') {
        accepted = true;
        hideNotice();
        const name = draft.firstName;
        // the details are no longer needed in the page once the server has them
        root.querySelectorAll('form').forEach((f) => f.reset());
        draft.firstName = name;
        history.replaceState({ hp: 5 }, '', location.pathname);
        await go(5);
        return;
      }
      if (res.ok && data?.status === 'duplicate') {
        // Neutral wording from the server; never confirms whether an address is already registered.
        showNotice('Thank you.', data.userFacingMessage || 'If this is a new registration, it has been recorded.');
        return;
      }
      showNotice(
        'We couldn’t complete your registration.',
        (res.ok && data?.userFacingMessage) || 'Your details are still here. Please try again in a moment.',
        'error',
      );
    } catch {
      showNotice('We couldn’t reach the server.', 'Your details are still here and nothing was registered. Check your connection and try again.', 'error');
    } finally {
      clearTimeout(timer);
      submitting = false;
      submitBtn.removeAttribute('aria-busy');
      if (!accepted) {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Join the waitlist';
      }
    }
  }

  // ------------------------------------------------------------------ wiring
  $('[data-begin]').addEventListener('click', () => void go(2, { push: true }));
  $$<HTMLFormElement>('[data-form]').forEach((f) =>
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = Number(f.dataset.form);
      if (busy || n !== chapter) return;
      if (n === 2) {
        if (!validate(2)) return;
        readChapter2();
        void go(3, { push: true });
      } else if (n === 3) void go(4, { push: true });
      else if (n === 4) void submit();
    }),
  );
  $$('[data-back]').forEach((b) =>
    b.addEventListener('click', () => {
      if (submitting || chapter <= 1 || chapter === 5) return;
      hideNotice();
      void go(chapter - 1, { push: true }); // everything typed stays in the fields
    }),
  );
  demoBtn.addEventListener('click', () => {
    if (endpoint()) return; // preview builds only
    previewDemo = true;
    readChapter2();
    void go(5, { push: true });
  });
  // Browser Back/Forward moves between chapters already opened; the Finale never comes back by history alone.
  window.addEventListener('popstate', (e) => {
    if (submitting) return;
    const want = Math.min(Number((e.state && e.state.hp) || 1), reached);
    if (accepted) return void go(5);
    void go(want === 5 && !previewDemo ? 4 : want);
  });
  history.replaceState({ hp: 1 }, '', location.pathname);

  // ------------------------------------------------------------------ ambient
  // Opening photograph: a few pixels of pointer parallax on wide screens, released when the pointer leaves.
  const art = $<HTMLElement>('[data-parallax]');
  const tubeImg = $<HTMLElement>('[data-tube]');
  if (window.matchMedia('(hover: hover) and (min-width: 900px)').matches && !reduce.matches) {
    art.parentElement!.addEventListener('pointermove', (e) => {
      if (chapter !== 1 || busy) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      tubeImg.style.setProperty('--px', `${(-x * 14).toFixed(1)}px`);
      tubeImg.style.setProperty('--py', `${(-y * 10).toFixed(1)}px`);
    });
    art.parentElement!.addEventListener('pointerleave', () => {
      tubeImg.style.setProperty('--px', '0px');
      tubeImg.style.setProperty('--py', '0px');
    });
  }
  document.addEventListener('visibilitychange', () => root.toggleAttribute('data-idle', document.hidden));

  paintShell();
  if ('requestIdleCallback' in window) requestIdleCallback(() => onEnter(1), { timeout: 1500 });
  else setTimeout(() => onEnter(1), 600);
}
