// Stand mode: cycle the slides, keep the screen awake, and run the 3D shield.
import { mountShield3D } from './shield3d';

const root = document.querySelector<HTMLElement>('[data-stand]');
const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (root) {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
  const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-dot]'));
  const canvas = root.querySelector<HTMLCanvasElement>('[data-shield3d]');
  const art = root.querySelector<HTMLElement>('[data-hero-art]');
  const shield = canvas && motionOK ? mountShield3D(canvas) : null;
  if (shield && art) art.classList.add('is-3d');

  let i = 0;
  const show = (n: number) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.hidden = k !== i;
      if (k === i) { s.classList.remove('is-in'); void s.offsetWidth; s.classList.add('is-in'); }
    });
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    // The hook slide shows the approved shield drifting apart, then reforming.
    shield?.setDrift(slides[i].dataset.drift ? 0.9 : 0);
  };
  show(0);
  window.setInterval(() => show(i + 1), 6500);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') show(i + 1);
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key.toLowerCase() === 'f') toggleFs();
  });

  const fsBtn = root.querySelector<HTMLButtonElement>('[data-fullscreen]');
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  fsBtn?.addEventListener('click', toggleFs);
  document.addEventListener('fullscreenchange', () => { if (fsBtn) fsBtn.hidden = Boolean(document.fullscreenElement); });

  // Keep the laptop screen on while the stand runs.
  const wake = () => {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<unknown> } };
    nav.wakeLock?.request('screen').catch(() => {});
  };
  wake();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
}
