// One place for the live address. Builds on Vercel (which sets VERCEL=1) use
// boardsignoff.vercel.app at the root; every other build targets GitHub Pages
// under /AI (the repo name, which is case sensitive in the URL). SITE_URL and BASE_PATH env vars override either.
// Re-run `npm run assets` after a change so the QR codes and social image match.
const onVercel = Boolean(process.env.VERCEL);

export const SITE_URL = (process.env.SITE_URL || (onVercel ? 'https://boardsignoff.vercel.app' : 'https://namitzz.github.io')).replace(/\/$/, '');
export const BASE_PATH = (process.env.BASE_PATH ?? (onVercel ? '' : '/AI')).replace(/\/$/, '');
export const PAGE_URL = `${SITE_URL}${BASE_PATH}/`;

// The poster QR code opens /s/, a copy of the home page, so analytics can tell
// poster scans apart from other visits.
export const QR_URL = `${PAGE_URL}s/`;

// Vercel Web Analytics only exists on Vercel.
export const ANALYTICS = onVercel ? 'vercel' : '';
