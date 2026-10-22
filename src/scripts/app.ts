// All interactivity for the page. Plain DOM, no framework.

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORE_KEY = 'signoff-scorecard-v2';

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

/* ---------------- Hero: 3D shield, drift on scroll ---------------- */

function initHero() {
  const art = $('[data-hero-art]');
  const svg = $<SVGSVGElement>('[data-shield="hero"]');
  const canvas = $<HTMLCanvasElement>('[data-shield3d]');
  const status = $('[data-status-text]');
  if (!art || !svg || !motionOK()) return;

  // Fallback mark: start the data packets once the draw-in settles.
  const startPackets = () => window.setTimeout(() => {
    svg.classList.add('is-live');
    $$<SVGAnimationElement>('animateMotion', svg).forEach((a) => {
      window.setTimeout(() => a.beginElement(), parseFloat(a.dataset.begin || '0') * 1000);
    });
  }, 2300);

  let setDrift: ((d: number) => void) | null = null;
  if (canvas) {
    import('./shield3d').then(({ mountShield3D }) => {
      const api = mountShield3D(canvas);
      if (!api) { startPackets(); return; }
      art.classList.add('is-3d');
      setDrift = api.setDrift;
      onScroll();
    }).catch(startPackets);
  } else {
    startPackets();
  }

  // As the hero scrolls away, the approved model starts to drift.
  let drifting = false;
  const onScroll = () => {
    const r = art.getBoundingClientRect();
    // Intact while centred on screen; drifts as it rises off the top.
    const centre = r.top + r.height / 2;
    const d = Math.max(0, Math.min(1, (window.innerHeight * 0.4 - centre) / (r.height * 0.7)));
    setDrift?.(d);
    const now = d > 0.28;
    if (now !== drifting) {
      drifting = now;
      art.classList.toggle('is-drifting', now);
      if (status) status.textContent = now ? 'Status: changed since approval' : 'Status: approved, v1.0';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------------- 01 The gap: scroll story ---------------- */

function initGap() {
  const card = $('[data-licence]');
  const steps = $$('.gap__step');
  if (!card || !steps.length) return;
  const rows = $$('[data-row]', card);
  const match = $$('.licence__match span', card);

  const setStep = (step: number) => {
    card.dataset.step = String(step);
    rows.forEach((r) => r.classList.toggle('is-changed', Number(r.dataset.row) <= step));
    const changes = Math.min(step, 4);
    card.style.setProperty('--changes', String(changes));
    match.forEach((m, i) => m.classList.toggle('is-off', i >= 4 - changes));
    const final = step >= 5;
    if (final && !card.classList.contains('is-final')) buzz([10, 40, 20]);
    card.classList.toggle('is-final', final);
    steps.forEach((s) => s.classList.toggle('is-active', Number(s.dataset.step) === step));
  };
  setStep(0);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) setStep(Number((en.target as HTMLElement).dataset.step)); });
  }, { rootMargin: '-55% 0px -35% 0px' });
  steps.forEach((s) => io.observe(s));
}

/* ---------------- 02 Quadrant ---------------- */

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

  // Draw the first pillar's illustrations when the cards come into view.
  const firstPanel = $(`[data-panel="${pillarTabs.current()}"]`);
  if (firstPanel) {
    const once = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      once.disconnect();
      replay($(`[data-panel="${pillarTabs!.current()}"]`), 'is-entering');
    }, { threshold: 0.2 });
    once.observe(firstPanel);
  }

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

/* ---------------- 04 Gate ---------------- */

function initGate() {
  const list = $('[data-tabs="gate"]');
  const map = $<SVGSVGElement>('[data-gmap]');
  if (!list) return;
  const boxes = map ? $$('[data-gbox]', map) : [];
  const ids = $$('[role="tab"]', list).map((t) => t.dataset.id!);

  const api = initTabs(list, (id, index, user) => {
    boxes.forEach((b, i) => b.classList.toggle('is-sel', i === index));
    if (!user) return;
    replay($(`[data-panel="${id}"]`), 'is-entering');
    buzz(10);
  });
  boxes[0]?.classList.add('is-sel');
  $$<HTMLButtonElement>('[data-goto-stage]').forEach((b) => b.addEventListener('click', () => api.select(b.dataset.gotoStage!, true)));

  // Tick the first checklist when the gate first scrolls into view.
  const first = $(`[data-panel="${ids[0]}"]`);
  const once = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    once.disconnect();
    if (api.current() === ids[0]) replay(first, 'is-entering');
  }, { threshold: 0.3 });
  once.observe(list);

  if (!map || !motionOK()) return;
  initLicenceLoop(map);
}

// The signature motion: a change hits the running system, its licence
// expires, and it travels the loop back to Gate 2 to be re-approved.
function initLicenceLoop(map: SVGSVGElement) {
  const token = $<SVGAnimationElement>('[data-token]', map);
  const label = $('[data-change-text]', map);
  const kinds = ['MODEL', 'DATA', 'PERMISSIONS', 'USE'];
  let k = 0, timers: number[] = [], loop = 0, visible = false;

  const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
  const cycle = () => {
    if (label) label.textContent = `CHANGE: ${kinds[k++ % kinds.length]}`;
    map.classList.add('is-change');
    at(700, () => { map.classList.add('is-moving'); token?.beginElement(); });
    at(2100, () => { map.classList.remove('is-moving'); map.classList.add('is-retest'); });
    at(3600, () => map.classList.remove('is-change', 'is-retest'));
  };
  const start = () => {
    if (loop) return;
    cycle();
    loop = window.setInterval(cycle, 5600);
  };
  const stop = () => {
    window.clearInterval(loop);
    loop = 0;
    timers.forEach(window.clearTimeout);
    timers = [];
    map.classList.remove('is-change', 'is-retest', 'is-moving');
  };
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !document.hidden) start(); else stop();
  }, { threshold: 0.4 }).observe(map);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (visible) start(); });
}

/* ---------------- 05 Scorecard ---------------- */

interface ScoreData {
  verdicts: { title: string; line: string }[];
  blocked: { title: string; line: string };
  items: { id: string; label: string; startWith: string[] }[];
  questions: Record<string, { q: string; pillar: string }>;
}
interface Stored { checked: string[]; critical: string[] }

function readStore(): Stored {
  const empty = { checked: [], critical: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const v = raw ? JSON.parse(raw) : null;
    const clean = (a: unknown) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);
    return v && typeof v === 'object' ? { checked: clean(v.checked), critical: clean(v.critical) } : empty;
  } catch {
    return empty;
  }
}
function writeStore(s: Stored) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* private mode, ignore */ }
}

function sharedScoreFromHash(): number | null {
  const m = /(?:^|[#&])score=([0-5])\b/.exec(location.hash);
  return m ? Number(m[1]) : null;
}

let currentScore = 0;
let currentBlocked = false;

function initScorecard() {
  const root = $('[data-score]');
  const dataEl = document.getElementById('score-data');
  if (!root || !dataEl) return;
  const data: ScoreData = JSON.parse(dataEl.textContent || '{}');

  const inputs = $$<HTMLInputElement>('[data-score-item]', root);
  const crits = $$<HTMLButtonElement>('[data-critical]', root);
  const val = $('[data-score-val]', root);
  const sr = $('[data-score-sr]', root);
  const segs = $$('.score__seg', root);
  const title = $('[data-verdict-title]', root);
  const line = $('[data-verdict-line]', root);
  const next = $('[data-start-with]', root);
  const nextLabel = $('[data-start-label]', root);
  const chips = $('[data-chips]', root);
  const barScores = $$('[data-bar-score]');
  const status = $('[data-status]', root);

  const saved = readStore();
  inputs.forEach((i) => { i.checked = saved.checked.includes(i.dataset.scoreItem!); });
  crits.forEach((b) => b.setAttribute('aria-pressed', String(saved.critical.includes(b.dataset.critical!))));

  const render = (user: boolean) => {
    const checked = inputs.filter((i) => i.checked).map((i) => i.dataset.scoreItem!);
    const critical = crits.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.critical!);
    const blocking = critical.filter((id) => !checked.includes(id));
    const score = checked.length;
    const prev = currentScore;
    currentScore = score;
    currentBlocked = blocking.length > 0;

    if (val) val.textContent = String(score);
    if (user && score !== prev) replay(val, 'is-tick');
    barScores.forEach((b) => { b.textContent = `${score}/5`; });
    segs.forEach((s, i) => s.classList.toggle('on', i < score));
    $$('[data-row]', root).forEach((r) => r.classList.toggle('is-blocking', blocking.includes(r.dataset.row!)));

    const v = currentBlocked ? data.blocked : data.verdicts[score];
    if (title) title.textContent = v.title;
    if (line) {
      const names = blocking.map((id) => data.items.find((it) => it.id === id)?.label).join(', ');
      line.textContent = currentBlocked ? `${v.line} Missing: ${names}.` : v.line;
    }
    if (sr) sr.textContent = `Score ${score} out of 5.${currentBlocked ? ' Blocked by a critical control.' : ''}`;

    // Questions to start with: blocking controls first, then the other gaps.
    const missing = data.items.filter((it) => !checked.includes(it.id))
      .sort((a, b) => Number(blocking.includes(b.id)) - Number(blocking.includes(a.id)));
    const ns = [...new Set(missing.flatMap((it) => it.startWith))].slice(0, score <= 2 ? 4 : 3);
    if (next) next.hidden = score === 5;
    if (nextLabel) nextLabel.textContent = currentBlocked ? 'Unblock it with these questions' : score >= 4 ? 'Close the last gap with' : 'Start with these questions';
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
    const wasBlocked = root.classList.contains('is-blocked');
    root.classList.toggle('is-full', full);
    root.classList.toggle('is-blocked', currentBlocked);
    if (user && ((full && !wasFull) || (currentBlocked && !wasBlocked))) {
      replay(root, 'is-stamping');
      buzz([12, 60, 30]);
    }

    // Keep the printable sheet in step.
    $$('[data-print-item]').forEach((li) => {
      li.classList.toggle('is-checked', checked.includes(li.dataset.printItem!));
      li.classList.toggle('is-critical', critical.includes(li.dataset.printItem!));
    });
    const ps = $('[data-print-score]');
    if (ps) ps.textContent = `${score}/5`;
    const pv = $('[data-print-verdict]');
    if (pv) pv.textContent = `${v.title}. ${line?.textContent ?? v.line}`;

    if (user) writeStore({ checked, critical });
  };

  inputs.forEach((i) => i.addEventListener('change', () => { render(true); buzz(6); }));
  crits.forEach((b) => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    render(true);
  }));
  root.addEventListener('click', (e) => {
    const chip = (e.target as Element).closest<HTMLAnchorElement>('a.chip');
    if (!chip) return;
    e.preventDefault();
    goToQuestion(chip.dataset.q!);
  });

  $('[data-reset]', root)?.addEventListener('click', () => {
    inputs.forEach((i) => { i.checked = false; });
    crits.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    render(true);
    if (status) status.textContent = 'Scorecard cleared.';
  });

  render(false);

  // Someone shared their score with us.
  const shared = sharedScoreFromHash();
  const banner = $('[data-shared-banner]');
  const sharedText = $('[data-shared-text]');
  if (shared !== null && banner && sharedText) {
    sharedText.textContent = `A colleague’s board scored ${shared}/5. How does yours compare?`;
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
  const base = $<HTMLLinkElement>('link[rel="canonical"]')?.href || `${location.origin}/`;
  $('[data-share]')?.addEventListener('click', () => {
    share({
      title: 'Before you sign off on AI',
      text: `Our board scored ${currentScore}/5 on the AI sign-off scorecard. Sign-off is a licence, not a verdict. Score yours:`,
      url: `${base}#score=${currentScore}`,
    }, status);
  });
  $$('[data-share-page]').forEach((b) => b.addEventListener('click', () => {
    share({
      title: 'Before you sign off on AI',
      text: 'The AI you approved may not be the AI that’s running. Eight questions for boards:',
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
  // Only Vercel builds serve the analytics script.
  if (document.documentElement.dataset.analytics !== 'vercel') return;
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
initGap();
initQuadrant();
initGate();
initScorecard();
initShare();
initHashLinks();
initAnalytics();
