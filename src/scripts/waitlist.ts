// Waitlist state machine (G06): welcome → you → location → consent → submitting → success | error.
// Draft lives in memory only: never in the URL, storage, logs or analytics (G08.2).
// Success is reachable only from an authoritative `accepted` response for this submission.
import { STATES_AND_UTS } from '../data/site';

type Chapter = 'welcome' | 'you' | 'location' | 'consent' | 'success';
const ORDER: Chapter[] = ['welcome', 'you', 'location', 'consent', 'success'];

export type Draft = {
  fullName: string;
  email: string;
  city: string;
  stateOrUT: string;
  whatsappPhone: string;
  operationalConsent: boolean;
  marketingConsent: boolean;
};

export const validators = {
  fullName(v: string) {
    const s = v.trim();
    if (!s) return 'Enter your full name.';
    if (s.length > 120) return 'That name is too long. Use up to 120 characters.';
    return '';
  },
  email(v: string) {
    const s = v.trim();
    if (!s) return 'Enter your email address.';
    if (s.length > 254 || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(s)) return 'Enter an email address like name@example.com.';
    return '';
  },
  city(v: string) {
    const s = v.trim();
    if (!s) return 'Enter your city.';
    if (s.length > 80) return 'That city name is too long. Use up to 80 characters.';
    return '';
  },
  stateOrUT(v: string) {
    return STATES_AND_UTS.includes(v) ? '' : 'Select your state or union territory.';
  },
  whatsappPhone(v: string) {
    if (!v.trim()) return ''; // optional
    return normalisePhone(v) ? '' : 'Enter a 10-digit Indian mobile number, or leave this blank.';
  },
};

/** Returns +91XXXXXXXXXX for a valid Indian mobile number, else ''. */
export function normalisePhone(v: string): string {
  const d = v.replace(/[\s\-().]/g, '');
  const m = d.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  return m ? `+91${m[1]}` : '';
}

export function createWaitlist(root: HTMLElement) {
  const endpoint = () => root.dataset.endpoint || '';
  const draft: Draft = {
    fullName: '', email: '', city: '', stateOrUT: '', whatsappPhone: '',
    operationalConsent: false, marketingConsent: false,
  };
  let chapter: Chapter = 'welcome';
  let submitting = false;
  let accepted = false; // set only by an authoritative accepted response
  let idempotencyKey = '';

  const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const nextBtn = $<HTMLButtonElement>('[data-next]');
  const nextLabel = $('[data-next-label]');
  const backBtn = $<HTMLButtonElement>('[data-back]');
  const progress = $('[data-progress-label]');
  const announce = $('[data-announce]');
  const notice = $('[data-notice]');
  const input = (name: string) => root.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!;

  const LABELS: Record<Chapter, string> = {
    welcome: 'Begin your registration',
    you: 'Continue',
    location: 'Continue',
    consent: 'Join the HUMAN waitlist',
    success: '',
  };

  function setError(name: string, msg: string) {
    const el = input(name);
    const err = root.querySelector<HTMLElement>(`#${el.id}-err`);
    if (msg) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    if (err) err.textContent = msg;
  }

  /** Validates the fields of one step, shows errors, focuses the first invalid field. */
  function validateStep(step: Chapter): boolean {
    const fields: (keyof typeof validators)[] =
      step === 'you' ? ['fullName', 'email'] : step === 'location' ? ['city', 'stateOrUT', 'whatsappPhone'] : [];
    let first: HTMLElement | null = null;
    const problems: string[] = [];
    for (const f of fields) {
      const msg = validators[f](input(f).value);
      setError(f, msg);
      if (msg) {
        problems.push(msg);
        first ??= input(f);
      }
    }
    if (first) {
      announce.textContent = problems.join(' ');
      first.focus();
      return false;
    }
    return true;
  }

  function readStep(step: Chapter) {
    if (step === 'you') {
      draft.fullName = input('fullName').value.trim();
      draft.email = input('email').value.trim();
    } else if (step === 'location') {
      draft.city = input('city').value.trim();
      draft.stateOrUT = input('stateOrUT').value;
      draft.whatsappPhone = normalisePhone(input('whatsappPhone').value);
    }
  }

  const stepValid = (step: Chapter) =>
    step === 'you'
      ? !validators.fullName(draft.fullName) && !validators.email(draft.email)
      : step === 'location'
        ? !validators.city(draft.city) && !validators.stateOrUT(draft.stateOrUT)
        : true;

  /** Is the visitor allowed to be on this chapter, given what is in memory? */
  function allowed(c: Chapter) {
    if (c === 'success') return accepted;
    if (accepted) return false;
    if (c === 'location') return stepValid('you');
    if (c === 'consent') return stepValid('you') && stepValid('location');
    return true;
  }

  function renderSummary() {
    const set = (k: string, v: string) => (root.querySelector<HTMLElement>(`[data-sum="${k}"]`)!.textContent = v);
    set('fullName', draft.fullName);
    set('email', draft.email);
    set('place', `${draft.city}, ${draft.stateOrUT}`);
    // optional number is masked in the summary (G04)
    set('phone', draft.whatsappPhone ? `WhatsApp: +91 ••••• •${draft.whatsappPhone.slice(-4)}` : 'No WhatsApp number given');
  }

  function show(c: Chapter, opts: { push?: boolean; focus?: boolean } = {}) {
    if (!allowed(c)) c = accepted ? 'success' : 'welcome';
    chapter = c;
    root.dataset.chapter = c;
    root.querySelectorAll<HTMLElement>('[data-ch]').forEach((el) => (el.hidden = el.dataset.ch !== c));
    const n = ORDER.indexOf(c);
    progress.textContent = n >= 1 && n <= 3 ? `Step ${n} of 3` : '';
    nextLabel.textContent = LABELS[c];
    backBtn.hidden = c === 'welcome' || c === 'success';
    notice.hidden = true;
    announce.textContent = '';
    if (c === 'consent') renderSummary();
    if (opts.push) history.pushState({ wl: c }, '', c === 'welcome' ? location.pathname : `#${c}`);
    if (opts.focus !== false) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      root.querySelector<HTMLElement>(`#wl-h-${c}`)?.focus({ preventScroll: true });
    }
  }

  function showNotice(title: string, body: string) {
    notice.replaceChildren();
    const s = document.createElement('strong');
    s.textContent = title;
    notice.append(s, document.createTextNode(body));
    notice.hidden = false;
    notice.scrollIntoView({ block: 'nearest' });
  }

  async function submit() {
    if (submitting || accepted) return; // double-click guard (E2E-33)
    const c1 = input('operationalConsent') as HTMLInputElement;
    draft.operationalConsent = c1.checked;
    draft.marketingConsent = (input('marketingConsent') as HTMLInputElement).checked;
    if (!draft.operationalConsent) {
      const msg = 'To join, please agree to the use of your details for your waitlist registration.';
      root.querySelector<HTMLElement>('#wl-c1-err')!.textContent = msg;
      c1.setAttribute('aria-invalid', 'true');
      announce.textContent = msg;
      c1.focus();
      return;
    }
    root.querySelector<HTMLElement>('#wl-c1-err')!.textContent = '';
    c1.removeAttribute('aria-invalid');

    if (!endpoint()) {
      // Preview mode: nothing is sent or stored, and Success is never shown (WL3-09).
      showNotice(
        'Preview mode — not accepting registrations yet.',
        'Nothing has been sent or saved, and you have not been added to a list. Registration will open once our privacy notice and systems have been reviewed.',
      );
      return;
    }

    submitting = true;
    nextBtn.disabled = true;
    nextBtn.setAttribute('aria-busy', 'true');
    nextLabel.textContent = 'Submitting…';
    showNotice('Submitting…', 'Please wait a moment.');
    idempotencyKey ||= crypto.randomUUID();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ ...draft, whatsappPhone: draft.whatsappPhone || undefined }),
        signal: ctrl.signal,
      });
      const data = (await res.json().catch(() => null)) as { status?: string; userFacingMessage?: string } | null;
      if (res.ok && data?.status === 'accepted') {
        accepted = true;
        // The draft is no longer needed in memory or in the form.
        root.querySelectorAll('form').forEach((f) => f.reset());
        history.replaceState({ wl: 'success' }, '', location.pathname);
        show('success');
        return;
      }
      if (res.ok && data?.status === 'duplicate') {
        // Neutral wording supplied by the server; never reveals whether an address is registered (G08.3).
        showNotice('Thank you.', data.userFacingMessage || 'If this is a new registration, it has been recorded.');
        return;
      }
      showNotice(
        'We couldn’t complete your registration.',
        (res.ok && data?.userFacingMessage) || 'Your details are still here. Please try again in a moment.',
      );
    } catch {
      showNotice(
        'We couldn’t reach the server.',
        'Your details are still here and nothing was registered. Check your connection and try again.',
      );
    } finally {
      clearTimeout(timer);
      submitting = false;
      nextBtn.removeAttribute('aria-busy');
      if (!accepted) {
        nextBtn.disabled = false;
        nextLabel.textContent = LABELS.consent;
      }
    }
  }

  let returnToConsent = false;
  function next() {
    if (chapter === 'welcome') return show('you', { push: true });
    if (chapter === 'you' || chapter === 'location') {
      if (!validateStep(chapter)) return;
      readStep(chapter);
      if (chapter === 'location') input('whatsappPhone').value = draft.whatsappPhone ? draft.whatsappPhone.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2') : '';
      const to: Chapter = returnToConsent && allowed('consent') ? 'consent' : chapter === 'you' ? 'location' : 'consent';
      returnToConsent = false;
      return show(to, { push: true });
    }
    if (chapter === 'consent') return void submit();
  }

  nextBtn.addEventListener('click', next);
  backBtn.addEventListener('click', () => {
    if (submitting) return;
    // Values typed so far stay in the inputs; nothing is cleared (WL1-08, WL2-08).
    returnToConsent = false;
    show(ORDER[Math.max(0, ORDER.indexOf(chapter) - 1)], { push: true });
  });
  root.querySelectorAll('form').forEach((f) =>
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      next();
    }),
  );
  // Enter in a text field continues, like a native form submit (the action buttons live in the shared bar).
  root.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (e.key === 'Enter' && t instanceof HTMLInputElement && t.type !== 'checkbox') {
      e.preventDefault();
      next();
    }
  });
  root.querySelectorAll<HTMLElement>('[data-edit]').forEach((b) =>
    b.addEventListener('click', () => {
      returnToConsent = true;
      show(b.dataset.edit as Chapter, { push: true });
    }),
  );
  // Clear a field's error as soon as it becomes valid again.
  (Object.keys(validators) as (keyof typeof validators)[]).forEach((f) =>
    input(f).addEventListener('input', () => {
      if (input(f).getAttribute('aria-invalid') && !validators[f](input(f).value)) setError(f, '');
    }),
  );
  // Browser Back/Forward moves between chapters; a chapter that isn't allowed falls back safely.
  window.addEventListener('popstate', (e) => {
    if (submitting) return;
    show(((e.state && e.state.wl) || 'welcome') as Chapter);
  });
  // A deep link or reload always starts at Welcome: there is no draft in memory, and no forged Success (WL4-06).
  history.replaceState({ wl: 'welcome' }, '', location.pathname);
  show('welcome', { focus: false });
}
