// One place to change the live address. Re-run `npm run assets` after changing it
// so the QR codes and social image point at the right URL.
export const SITE_URL = (process.env.SITE_URL || 'https://boardsignoff.vercel.app').replace(/\/$/, '');

// The QR code opens /s, which Vercel rewrites to the home page. It lets you
// tell poster scans apart from other visits in Vercel Web Analytics.
export const QR_PATH = '/s';
