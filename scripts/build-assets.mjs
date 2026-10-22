// Generates the static image assets: social preview, favicons and poster QR codes.
// Run with `npm run assets` (set SITE_URL=... first if the live address changes).
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import QRCode from 'qrcode';
import { SITE_URL, QR_PATH } from '../site.config.mjs';

const root = new URL('..', import.meta.url).pathname;
const pub = join(root, 'public');
const out = join(root, 'poster-assets');
const fontDir = join(root, '.cache', 'fonts');

const C = { paper: '#F1F0EC', surface: '#FFFFFF', ink: '#10141A', accent: '#2541E6', onAccent: '#FFFFFF' };

// Static font instances for rendering text in the PNGs (fetched once, then cached).
const fonts = [
  ['archivo-75-850.ttf', 'Archivo:wdth,wght@75,850'],
  ['plexmono-600.ttf', 'IBM+Plex+Mono:wght@600'],
  ['plexsans-500.ttf', 'IBM+Plex+Sans:wght@500'],
];
async function ensureFonts() {
  await mkdir(fontDir, { recursive: true });
  for (const [file, family] of fonts) {
    const path = join(fontDir, file);
    try { await access(path); continue; } catch {}
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`, { headers: { 'User-Agent': 'Mozilla/4.0' } })).text();
    const url = css.match(/url\((https:[^)]+)\)/)?.[1];
    if (!url) throw new Error(`No font URL for ${family}`);
    await writeFile(path, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  return fonts.map(([file]) => join(fontDir, file));
}

const render = (svg, width, fontFiles = []) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'IBM Plex Sans' } }).render().asPng();

// Shield geometry, matching src/components/ShieldMark.astro.
const SHIELD = 'M200 44 L320 88 V196 C320 270 268 326 200 356 C132 326 80 270 80 196 V88 Z';
const nodes = [[140, 126], [200, 100], [260, 126], [290, 198], [250, 270], [200, 304], [150, 270], [110, 198]];
function shieldGroup({ ink, surface, accent, onAccent }) {
  const ring = nodes.map((n, i) => [n, nodes[(i + 1) % nodes.length]]);
  const spokes = [0, 2, 3, 4, 6, 7].map((i) => [nodes[i], [200, 200]]);
  const edges = [...ring, ...spokes].map(([a, b]) => `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}"/>`).join('');
  return `
    <circle cx="200" cy="200" r="186" fill="none" stroke="${ink}" stroke-width="3" stroke-dasharray="7 11"/>
    <path d="${SHIELD}" fill="${surface}" stroke="${ink}" stroke-width="6"/>
    <g fill="none" stroke="${ink}" stroke-width="3">${edges}</g>
    <g fill="${surface}" stroke="${ink}" stroke-width="4">${nodes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10"/>`).join('')}</g>
    <circle cx="200" cy="200" r="32" fill="${accent}"/>
    <path d="M184 201 L196 213 L218 188" fill="none" stroke="${onAccent}" stroke-width="8" stroke-linecap="square"/>`;
}

// Favicon: filled cobalt shield with a white check, readable at 16px.
function faviconSvg(dark = false) {
  const fill = dark ? '#8197FF' : C.accent;
  const check = dark ? '#0F1218' : '#FFFFFF';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M32 3 L57 11.5 V31 C57 45 47.5 55 32 61 C16.5 55 7 45 7 31 V11.5 Z" fill="${fill}"/>
  <path d="M20 32 L28.5 40.5 L44.5 23.5" fill="none" stroke="${check}" stroke-width="7" stroke-linecap="square"/>
</svg>`;
}
const faviconAdaptive = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>.s{fill:#2541E6}.c{stroke:#FFFFFF}@media (prefers-color-scheme:dark){.s{fill:#8197FF}.c{stroke:#0F1218}}</style>
  <path class="s" d="M32 3 L57 11.5 V31 C57 45 47.5 55 32 61 C16.5 55 7 45 7 31 V11.5 Z"/>
  <path class="c" d="M20 32 L28.5 40.5 L44.5 23.5" fill="none" stroke-width="7" stroke-linecap="square"/>
</svg>
`;

function appleIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="${C.paper}"/>
  <g transform="translate(18 18) scale(0.36)">${shieldGroup(C)}</g>
</svg>`;
}

function ogSvg(host) {
  const display = `font-family="Archivo Condensed" font-weight="800"`;
  const mono = `font-family="IBM Plex Mono SemiBold"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${C.paper}"/>
  <rect x="64" y="58" width="196" height="40" fill="${C.ink}"/>
  <text x="80" y="85" ${mono} font-size="20" letter-spacing="2.4" fill="${C.paper}">4 NOV 2026</text>
  <text x="280" y="85" ${mono} font-size="20" letter-spacing="2.4" fill="${C.ink}">IET LONDON</text>
  <text x="1136" y="85" ${mono} font-size="20" letter-spacing="2" fill="${C.ink}" text-anchor="end">${host.toUpperCase()}</text>
  <g ${display} font-size="132" fill="${C.ink}">
    <text x="60" y="244">BEFORE YOU</text>
    <text x="60" y="358" fill="${C.accent}">SIGN OFF</text>
    <text x="60" y="472">ON AI</text>
  </g>
  <rect x="64" y="369" width="388" height="10" fill="${C.accent}"/>
  <g transform="translate(796 128) scale(0.98)">${shieldGroup(C)}</g>
  <rect x="0" y="548" width="1200" height="82" fill="${C.ink}"/>
  <text x="64" y="598" font-family="IBM Plex Sans" font-weight="500" font-size="28" fill="${C.paper}">The AI you approved may not be the AI that’s running.</text>
</svg>`;
}

async function main() {
  const fontFiles = await ensureFonts();
  await mkdir(out, { recursive: true });
  const host = new URL(SITE_URL).host;

  await writeFile(join(pub, 'favicon.svg'), faviconAdaptive);
  await writeFile(join(pub, 'favicon-32.png'), render(faviconSvg(), 32));
  await writeFile(join(pub, 'apple-touch-icon.png'), render(appleIconSvg(), 180));
  await writeFile(join(pub, 'og.png'), render(ogSvg(host), 1200, fontFiles));

  // Poster QR codes: high error correction, 4 module quiet zone.
  const qrUrl = `${SITE_URL}${QR_PATH}`;
  const qrOpts = { errorCorrectionLevel: 'H', margin: 4 };
  for (const [name, dark] of [['ink', C.ink], ['cobalt', C.accent]]) {
    const color = { dark, light: '#FFFFFF' };
    await writeFile(join(out, `qr-${name}.svg`), await QRCode.toString(qrUrl, { ...qrOpts, type: 'svg', color }));
    await writeFile(join(out, `qr-${name}.png`), await QRCode.toBuffer(qrUrl, { ...qrOpts, type: 'png', width: 2400, color }));
  }
  await writeFile(join(out, 'README.txt'), `QR codes for the poster.\nThey open: ${qrUrl}\nError correction: H (30%). Quiet zone: 4 modules.\nPrint at 25 mm or larger. qr-ink is the safest choice for scanning.\n`);

  console.log(`Assets written. QR opens ${qrUrl}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
