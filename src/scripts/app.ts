// All interactivity for the page. Plain DOM, no framework.

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORE_KEY = 'signoff-scorecard-v1';

function buzz(pattern: number | number[]) {
  if (motionOK() && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch { /* not allowed, ignore */ }
  }
}

// Re-trigger a CSS animation class.
function replay(el: Element | null, cls: string) {
  if (!el) return;
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
}

/* ---------------- Tabs (ARIA tabs pattern, automatic activation) ---------------- */

interface TabsApi { select: (id: string, focus?: boolean) => void; current: () => string; }

function initTabs(list: HTMLElement, onChange: (id: string, index: number, user: boolean) => void): TabsApi {
  const tabs = $$<HTMLButtonElement>('[role="tab"]', list);
  let current = tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.id ?? tabs[0].dataset.id!;

  const select = (id: string, focus = false, user = true) => {
    tabs.forEach((t, i) => {
      const on = t.dataset.id === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!);
      if (panel) panel.hidden = !on;
      if (on) {
        if (focus) t.focus();
        if (id !== current || !user) onChange(id, i, user);
      }
    });
    current = id;
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t.dataset.id!));
    t.addEventListener('keydown', (e) => {
      const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next = -1;
      if (e.key in keys) next = (i + keys[e.key] + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      select(tabs[next].dataset.id!, true);
    });
  });

  return { select: (id, focus) => select(id, focus), current: () => current };
}

/* ---------------- Top bar: menu, progress, active link ---------------- */

function initTopBar() {
  const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const label = $('[data-menu-label]');
  if (toggle && menu) {
    $$('li', menu).forEach((li, k) => li.style.setProperty('--k', String(k)));
    const setOpen = (open: boolean) => {
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close menu' : 'Open menu';
      menu.hidden = !open;
      menu.classList.toggle('is-open', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('[data-menu-link]', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => m.matches && setOpen(false));
  }

  const bar = $('[data-progress]');
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar?.style.setProperty('--p', String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  const links = $$<HTMLAnchorElement>('[data-navlink]');
  const sections = links.map((a) => document.querySelector(a.hash)).filter(Boolean) as Element[];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => {
        if (a.hash === `#${en.target.id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
  const hero = document.getElementById('top');
  if (hero) io.observe(hero);
}

/* ---------------- Scroll reveals ---------------- */

function initReveal() {
  const els = $$('[data-reveal], [data-closer]');
  if (!('IntersectionObserver' in window) || !motionOK()) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

/* ---------------- Hero shield: packets and tilt ---------------- */

function initHero() {
  const svg = $<SVGSVGElement>('[data-shield="hero"]');
  if (!svg || !motionOK()) return;

  window.setTimeout(() => {
    svg.classList.add('is-live');
    $$<SVGAnimationElement>('animateMotion', svg).forEach((a) => {
      const delay = parseFloat(a.dataset.begin || '0') * 1000;
      window.setTimeout(() => a.beginElement(), delay);
    });
  }, 2300);

  const art = $('[data-tilt]');
  if (!art) return;
  let raf = 0;
  const set = (x: number, y: number) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      art.style.setProperty('--ry', `${x * 10}deg`);
      art.style.setProperty('--rx', `${-y * 10}deg`);
    });
  };
  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', (e) => {
      set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    }, { passive: true });
  } else {
    // On phones, lean the shield gently as the page scrolls past it.
    window.addEventListener('scroll', () => {
      const r = art.getBoundingClientRect();
      if (r.bottom < 0) return;
      const t = Math.max(-0.5, Math.min(0.5, (r.top + r.height / 2) / window.innerHeight - 0.5));
      set(0, t);
    }, { passive: true });
  }
}

/* ---------------- 01 Quadrant ---------------- */

let pillarTabs: TabsApi | null = null;

function initQuadrant() {
  const list = $('[data-tabs="pillars"]');
  if (!list) return;
  const core = $('[data-core]');
  const progress = $('[data-pillar-progress]');
  const seen = new Set<string>();

  const markSeen = (id: string) => {
    seen.add(id);
    $(`[role="tab"][data-id="${id}"]`, list)?.classList.add('is-seen');
    if (progress) {
      progress.textContent = seen.size === 4 ? 'All 4 pillars explored' : `${seen.size} of 4 pillars explored`;
    }
  };

  pillarTabs = initTabs(list, (id, _i, user) => {
    markSeen(id);
    if (!user) return;
    replay(core, 'is-bump');
    replay($(`[data-panel="${id}"]`), 'is-entering');
    buzz(8);
  });
  markSeen(pillarTabs.current());

  $$<HTMLButtonElement>('[data-goto-pillar]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.gotoPillar!;
    pillarTabs!.select(id, true);
    list.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
  }));
}

// Jump to a question card from anywhere (scorecard chips, hash links).
function goToQuestion(n: string) {
  const card = document.getElementById(`q-${n}`);
  const panel = card?.closest<HTMLElement>('[data-panel]');
  if (!card || !panel || !pillarTabs) return;
  pillarTabs.select(panel.dataset.panel!);
  requestAnimationFrame(() => {
    card.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
    replay(card, 'is-flash');
    card.setAttribute('tabindex', '-1');
    card.focus({ preventScroll: true });
  });
}

/* ---------------- 02 Gate ---------------- */

function initGate() {
  const gate = $('[data-gate]');
  const list = $('[data-tabs="gate"]', gate ?? document);
  if (!gate || !list) return;
  const token = $('.gate__token', gate);
  const posts = $$('[data-post]', gate);
  const tabs = $$('[role="tab"]', list);

  const paint = (index: number) => {
    gate.style.setProperty('--stage', String(index));
    posts.forEach((p, i) => p.classList.toggle('is-open', i <= index));
    tabs.forEach((t, i) => t.classList.toggle('is-passed', i < index));
  };

  const api = initTabs(list, (id, index, user) => {
    paint(index);
    if (!user) return;
    replay(token, 'is-moving');
    replay($(`[data-panel="${id}"]`, gate), 'is-entering');
    buzz(10);
  });

  $$<HTMLButtonElement>('[data-goto-stage]', gate).forEach((b) => b.addEventListener('click', () => {
    api.select(b.dataset.gotoStage!, true);
  }));

  // Open the first gate and tick its list when the section scrolls into view.
  const first = $('[data-panel="pilot"]', gate);
  paint(-1);
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    const index = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    paint(Math.max(0, index));
    if (index <= 0) replay(first, 'is-entering');
  }, { threshold: 0.35 });
  io.observe(gate);
}

/* ---------------- 03 Scorecard ---------------- */

interface ScoreData {
  verdicts: { title: string; line: string }[];
  items: { id: string; startWith: string[] }[];
  questions: Record<string, { q: string; pillar: string }>;
}

function readStore(): string[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function writeStore(ids: string[]) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(ids)); } catch { /* private mode, ignore */ }
}

function sharedScoreFromHash(): number | null {
  const m = /(?:^|[#&])score=([0-5])\b/.exec(location.hash);
  return m ? Number(m[1]) : null;
}

let currentScore = 0;

function initScorecard() {
  const root = $('[data-score]');
  const dataEl = document.getElementById('score-data');
  if (!root || !dataEl) return;
  const data: ScoreData = JSON.parse(dataEl.textContent || '{}');

  const inputs = $$<HTMLInputElement>('[data-score-item]', root);
  const val = $('[data-score-val]', root);
  const sr = $('[data-score-sr]', root);
  const segs = $$('.score__seg', root);
  const title = $('[data-verdict-title]', root);
  const line = $('[data-verdict-line]', root);
  const next = $('[data-start-with]', root);
  const nextLabel = $('[data-start-label]', root);
  const chips = $('[data-chips]', root);
  const barScore = $('[data-bar-score]');
  const status = $('[data-status]', root);

  const saved = new Set(readStore());
  inputs.forEach((i) => { i.checked = saved.has(i.dataset.scoreItem!); });

  const render = (user: boolean) => {
    const checked = inputs.filter((i) => i.checked).map((i) => i.dataset.scoreItem!);
    const score = checked.length;
    const prev = currentScore;
    currentScore = score;

    if (val) val.textContent = String(score);
    if (user && score !== prev) replay(val, 'is-tick');
    if (sr) sr.textContent = `Score ${score} out of 5.`;
    if (barScore) barScore.textContent = `${score}/5`;
    segs.forEach((s, i) => s.classList.toggle('on', i < score));
    const v = data.verdicts[score];
    if (title) title.textContent = v.title;
    if (line) line.textContent = v.line;

    // Questions to start with, from the items still missing.
    const missing = data.items.filter((it) => !checked.includes(it.id));
    const ns = [...new Set(missing.flatMap((it) => it.startWith))].sort().slice(0, score <= 2 ? 4 : 3);
    if (next) next.hidden = score === 5;
    if (nextLabel) nextLabel.textContent = score >= 4 ? 'Close the last gap with' : 'Start with these questions';
    if (chips) {
      chips.replaceChildren(...ns.map((n, k) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'chip';
        a.href = `#q-${n}`;
        a.dataset.q = n;
        a.style.setProperty('--k', String(k));
        const b = document.createElement('b');
        b.textContent = n;
        a.append(b, document.createTextNode(data.questions[n].q));
        li.append(a);
        return li;
      }));
    }

    const full = score === 5;
    const wasFull = root.classList.contains('is-full');
    root.classList.toggle('is-full', full);
    if (full && !wasFull && user) {
      replay(root, 'is-stamping');
      buzz([12, 60, 30]);
    }

    // Keep the printable sheet in step.
    $$('[data-print-item]').forEach((li) => li.classList.toggle('is-checked', checked.includes(li.dataset.printItem!)));
    const ps = $('[data-print-score]');
    if (ps) ps.textContent = `${score}/5`;
    const pv = $('[data-print-verdict]');
    if (pv) pv.textContent = `${v.title}. ${v.line}`;

    if (user) writeStore(checked);
  };

  inputs.forEach((i) => i.addEventListener('change', () => { render(true); buzz(6); }));
  root.addEventListener('click', (e) => {
    const chip = (e.target as Element).closest<HTMLAnchorElement>('a.chip');
    if (!chip) return;
    e.preventDefault();
    goToQuestion(chip.dataset.q!);
  });

  $('[data-reset]', root)?.addEventListener('click', () => {
    inputs.forEach((i) => { i.checked = false; });
    render(true);
    if (status) status.textContent = 'Scorecard cleared.';
  });

  render(false);

  // Someone shared their score with us.
  const shared = sharedScoreFromHash();
  const banner = $('[data-shared-banner]');
  const sharedText = $('[data-shared-text]');
  if (shared !== null && banner && sharedText) {
    sharedText.textContent = `A colleague’s board scored ${shared}/5 (${data.verdicts[shared].title.toLowerCase()}). How does yours compare?`;
    banner.hidden = false;
    requestAnimationFrame(() => document.getElementById('scorecard')?.scrollIntoView({ block: 'start' }));
  }
}

/* ---------------- Share and print ---------------- */

async function share(payload: ShareData, status: HTMLElement | null) {
  const say = (msg: string) => { if (status) status.textContent = msg; };
  if (navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(payload.url!);
    say('Link copied. Paste it anywhere to share.');
  } catch {
    window.prompt('Copy this link to share', payload.url);
  }
}

function initShare() {
  const status = $('[data-status]');
  const base = `${location.origin}/`;
  $('[data-share]')?.addEventListener('click', () => {
    share({
      title: 'Before you sign off on AI',
      text: `Our board scored ${currentScore}/5 on the AI sign off scorecard. Eight questions to ask before approving AI investment:`,
      url: `${base}#score=${currentScore}`,
    }, status);
  });
  $$('[data-share-page]').forEach((b) => b.addEventListener('click', () => {
    share({
      title: 'Before you sign off on AI',
      text: 'Eight questions every board should ask before approving AI investment.',
      url: base,
    }, status);
  }));
  $$('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));
}

/* ---------------- Deep links ---------------- */

function initHashLinks() {
  const handle = () => {
    const m = /^#q-(0[1-8])$/.exec(location.hash);
    if (m) goToQuestion(m[1]);
  };
  window.addEventListener('hashchange', handle);
  handle();
}

/* ---------------- Analytics (Vercel Web Analytics, cookieless) ---------------- */

function initAnalytics() {
  const host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '') return;
  const w = window as unknown as { va?: (...a: unknown[]) => void; vaq?: unknown[] };
  w.va = w.va || function (...args: unknown[]) { (w.vaq = w.vaq || []).push(args); };
  const s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.append(s);
}

initTopBar();
initReveal();
initHero();
initQuadrant();
initGate();
initScorecard();
initShare();
initHashLinks();
initAnalytics();
