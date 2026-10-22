// Renders the blank one-page board checklist to public/board-checklist.pdf
// from the print stylesheet. Needs a running preview and Playwright:
//   npm run build && npm run preview   (in one terminal)
//   npm i --no-save playwright && npx playwright install chromium
//   node scripts/build-pdf.mjs [http://localhost:4321/AI/]
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const url = process.argv[2] || 'http://localhost:4321/AI/';
const out = fileURLToPath(new URL('../public/board-checklist.pdf', import.meta.url));
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
// Scripts off: the sheet keeps its blank default state.
const page = await browser.newPage({ javaScriptEnabled: false });
await page.goto(url, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`Wrote ${out}`);
