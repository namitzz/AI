# Before you sign off on AI

Companion site for the poster *"Before you sign off on AI: 8 questions every board should ask before approving AI investment"*, shown at **AI Essentials, Assurance & Business Leadership** (TÜV SÜD and Aston University, IET London, Savoy Place, 4 November 2026).

By [Namit Sarna](https://www.linkedin.com/in/namitsarna), MSc AI for Business Transformation (with Capgemini), Aston University.

## What is in it

- **Hero** with a self-drawing shield graphic (shield, network, checked core, orbit) and a 2 minute route.
- **The 8 questions**: four-pillar quadrant (ARIA tabs) with "Why it matters" and "What good looks like" for each question.
- **The investment gate**: Pilot, Scale, Run, with gates that open as you go.
- **Board scorecard**: five checks, a live meter, a verdict, suggested questions, a "Signed off" stamp at 5/5, saved on the device, shareable as `/#score=N`.
- **Built on**: ISO/IEC 42001, NIST AI RMF, EU AI Act, UK AI principles.
- **One-page A4 board checklist** via the print stylesheet (includes the scorecard state and a QR code).
- Open Graph image, favicons, Vercel Web Analytics (cookieless), dark mode and reduced-motion support.

Stack: [Astro](https://astro.build) static output, one small vanilla TypeScript file (under 4 kB gzipped), no images except generated PNGs for social sharing and icons.

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
