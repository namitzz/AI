# Before you sign off on AI

Companion site for the poster *"Before you sign off on AI"*, shown at **AI Essentials, Assurance & Business Leadership** (TÜV SÜD and Aston University, IET London, Savoy Place, 4 November 2026).

By [Namit Sarna](https://www.linkedin.com/in/namitsarna), MSc AI for Business Transformation, Aston University.

## What is in it

Central idea: **sign-off is a licence, not a verdict.** The AI a board approved can be updated by the vendor, fed new data, given new permissions or used in new ways, and then it is no longer the thing they approved.

- **Hero**: a 3D point-cloud shield (raw WebGL, about 3 kB) that assembles on load, turns when dragged, and drifts apart as you scroll. Falls back to the animated SVG shield without WebGL or with reduced motion. Big "Score yours" button.
- **The gap**: scroll story. A sticky AI system licence changes row by row (model, data, permissions, use) until it is stamped "Not what you approved".
- **The 8 questions**: four-pillar quadrant (ARIA tabs), each question with a line illustration, why it matters and what good looks like.
- **The pilot trap**: Gartner forecast (29 July 2024), presented as a forecast.
- **The investment gate**: three gates with the licence loop animation: a change hits Run, the licence expires, and it loops back to Scale for re-approval.
- **Board scorecard**: evidence-only scoring, controls can be marked critical (a missing critical control blocks approval), "Licensed" or "Blocked" stamps, saved on the device, shareable as `/#score=N`.
- **Informed by**: ISO/IEC 42001, NIST AI RMF, EU AI Act, UK AI principles, plus the UK AI Risk Management Toolkit.
- **One-page A4 board checklist** via the print stylesheet, including the visitor's scorecard and critical flags.

Stack: [Astro](https://astro.build) static output, vanilla TypeScript (about 5 kB gzipped, plus the 3 kB WebGL shield loaded after first paint). All graphics are inline SVG or WebGL; the only images are generated PNGs for social sharing and icons.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
npm run preview
```

All copy lives in `src/data/content.ts`.

## Change the live URL

The site address is set in one place, `site.config.mjs` (default `https://boardsignoff.vercel.app`). If your Vercel URL ends up different:

```bash
SITE_URL=https://your-project.vercel.app npm run assets
```

Then change the default in `site.config.mjs` to match, and commit. This regenerates `public/og.png`, the favicons and the QR codes in `poster-assets/`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repository.
3. Project name: `boardsignoff` (gives `boardsignoff.vercel.app`). Framework preset: **Astro** (auto-detected). Leave build settings as they are.
4. Click **Deploy**.
5. In the project, open **Analytics** and click **Enable** (Web Analytics). Redeploy once so the script is served.
6. Open the live URL on your phone and scan the QR code in `poster-assets/` to check it lands.

If `boardsignoff` is taken, use `board-signoff` or `signoff-ai`, then follow "Change the live URL" above.

## The QR code

`poster-assets/qr-ink.png` / `.svg` (recommended) and `qr-cobalt.*`. They open `/s`, which Vercel rewrites to the home page (see `vercel.json`). That way the **Pages** panel in Vercel Analytics shows `/s` as poster scans, separate from other visits. Error correction H, 4 module quiet zone. Print at 25 mm or larger.
