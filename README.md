# Before you sign off on AI

Companion site for the poster *"Before you sign off on AI"*, shown at **AI Essentials, Assurance & Business Leadership** (TÜV SÜD and Aston University, IET London, Savoy Place, 4 November 2026).

By [Namit Sarna](https://www.linkedin.com/in/namitsarna), MSc AI for Business Transformation, Aston University.

## What is in it

Central idea: **sign-off is a licence, not a verdict.** The AI a board approved can be updated by the vendor, fed new data, given new permissions or used in new ways, and then it is no longer the thing they approved.

- **Hero**: a 3D point-cloud shield (raw WebGL, about 3 kB) that assembles on load, turns when dragged, and drifts apart as you scroll. Falls back to the animated SVG shield without WebGL or with reduced motion. Big "Score yours" button.
- **The gap**: scroll story. A sticky AI system licence changes row by row (model, data, permissions, use) until it is stamped "Not what you approved".
- **The 8 questions**: four-pillar quadrant (ARIA tabs), each question with a line illustration, why it matters and what good looks like.
- **The pilot trap**: Gartner forecast (29 July 2024), presented as a forecast.
- **The investment gate**: three gates with the licence loop animation: a material change hits Run, the licence expires, and it loops back to Scale for reassessment. Illustrative, not a validated method.
- **Board scorecard**: an illustrative discussion aid. Evidence-only scoring, controls can be marked critical (a missing critical control blocks approval in the exercise), "Evidenced" or "Blocked" stamps, saved on the device, shareable as `/#score=N`.
- **Informed by**: ISO/IEC 42001, NIST AI RMF, EU AI Act, UK AI principles, plus the UK AI Risk Management Toolkit.
- **One-page A4 board checklist** via the print stylesheet, including the visitor's scorecard and critical flags.
- **The 60-second lab**: four quick experiments in dialogs, bundled with the main script: rubber stamp test (Q08, flag 12 decisions in 20 seconds), the 3am drill (Q07, 30 seconds), spot the injection (Q03, 30 seconds) and the drift dial (Q05, illustrative review point). Ends with a text card, "Before you sign it off".
- **Share a question**: every question card has a Share button. `/q/01/` to `/q/08/` carry a preview image for that question and forward to the card.
- **Board checklist**: a blank one-page PDF (`public/board-checklist.pdf`) to download, plus "Print it with my answers", which fills in the visitor's scorecard.
- **Save my contact**: `public/namit-sarna.vcf` adds Namit to the phone's contacts.
- **Works offline**: a service worker (`public/sw.js`) keeps the page available on weak venue signal.
- **Event day banner**: only shows on 4 November 2026 (London time).
- **Terms, privacy and accessibility**: `/legal/`, a plain-English page linked from the footer. Educational use only, not advice, "licence" is a metaphor, what is stored on the device, and known accessibility limits.
- **Stand mode**: `/stand/` is a full-screen page for a laptop at the poster: the 3D shield, the questions cycling, and a large QR code. Press F for full screen, arrow keys to step. It keeps the screen awake where the browser allows.

Stack: [Astro](https://astro.build) static output, vanilla TypeScript (about 5 kB gzipped, plus the 3 kB WebGL shield loaded after first paint). All graphics are inline SVG or WebGL; the only images are generated PNGs for social sharing and icons.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
npm run preview
```

All copy lives in `src/data/content.ts`.

## Live site

GitHub Pages: **https://namitzz.github.io/AI/** (poster QR code: https://namitzz.github.io/AI/s/)

`.github/workflows/pages.yml` builds and publishes the site on every push to `main`.
One-time setup: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Change the live URL

The address is set in `site.config.mjs`. By default builds target GitHub Pages under `/AI`; builds on Vercel (which sets `VERCEL=1`) target `https://boardsignoff.vercel.app` at the root and turn on Vercel Web Analytics. Override with `SITE_URL` and `BASE_PATH`, then regenerate the images:

```bash
npm run assets   # writes public/og.png, favicons and poster-assets/qr-*
```

## Deploy to Vercel instead (optional)

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Project name: `boardsignoff`. Framework preset: **Astro**. Deploy.
3. In the project, open **Analytics** and click **Enable**, then redeploy.
4. Run `VERCEL=1 npm run assets`, commit, and use the new QR codes, which open `https://boardsignoff.vercel.app/s/`.

## Regenerate the PDF

After changing the questions or scorecard, rebuild the blank checklist:

```bash
npm run build && npm run preview          # keep running
npm i --no-save playwright && npx playwright install chromium
node scripts/build-pdf.mjs                # writes public/board-checklist.pdf
```

## The QR code

`poster-assets/qr-ink.png` / `.svg` (recommended) and `qr-cobalt.*`. They open `/s/`, a copy of the home page whose canonical link points at `/`, so poster scans can be counted separately. Error correction H, 4 module quiet zone. Print at 25 mm or larger.
