// FAQ: category tabs and expandable questions.
// The page is complete without this script (every category and answer is written out). With it, one category shows
// at a time and each question opens and closes on its own; several may be open at once. Nothing here loads a page.

const root = document.querySelector<HTMLElement>('[data-faq]');

if (root) {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-faq-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-faq-panel]'));
  const list = root.querySelector<HTMLElement>('[data-faq-tabs]');

  const setOpen = (item: HTMLElement, open: boolean) => {
    item.classList.toggle('is-open', open);
    item.querySelector<HTMLButtonElement>('[data-faq-q]')?.setAttribute('aria-expanded', String(open));
  };

  // questions
  root.querySelectorAll<HTMLElement>('[data-faq-item]').forEach((item) => {
    const btn = item.querySelector<HTMLButtonElement>('[data-faq-q]');
    setOpen(item, item.classList.contains('is-open'));
    btn?.addEventListener('click', () => setOpen(item, !item.classList.contains('is-open')));
  });

  // categories
  const select = (id: string, opts: { focus?: boolean; first?: boolean } = {}) => {
    const tab = tabs.find((t) => t.dataset.faqTab === id);
    if (!tab) return;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => {
      const on = p.dataset.faqPanel === id;
      // leaving a category closes its questions, so nothing is found open on return by accident
      if (!on && p.classList.contains('is-active')) p.querySelectorAll<HTMLElement>('[data-faq-item]').forEach((i) => setOpen(i, false));
      p.classList.toggle('is-active', on);
    });
    root.dataset.faq = id;
    if (!opts.first) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (opts.focus) tab.focus({ preventScroll: true });
  };

  if (list) {
    list.setAttribute('role', 'tablist');
    tabs.forEach((t) => {
      t.setAttribute('role', 'tab');
      t.addEventListener('click', () => select(t.dataset.faqTab!));
    });
    panels.forEach((p) => {
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', `faq-tab-${p.dataset.faqPanel}`);
    });
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (i < 0) return;
      const to = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
      if (to < 0) return;
      e.preventDefault();
      select(tabs[to].dataset.faqTab!, { focus: true });
    });
  }

  // a link such as /faq#waitlist opens that category
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (tabs.some((t) => t.dataset.faqTab === id)) {
      select(id);
      return true;
    }
    return false;
  };
  if (!fromHash()) select(tabs[0]?.dataset.faqTab ?? '', { first: true });
  window.addEventListener('hashchange', fromHash);
}
