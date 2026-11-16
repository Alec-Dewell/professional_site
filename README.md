# Alec Dewell | personal website

A locally running Next.js portfolio, with a dark editorial design, copper accents, a custom interactive orbital illustration, a career timeline and a dedicated page for future portfolio collections. Profile facts come from `../alec_linkedin.pdf`.

## Run locally

Requires Node.js 20.9 or newer.

```powershell
cd C:\Users\Alec.Dewell\Udemy\AIVIbeCoding\site
npm install
npm run dev
```

Open **http://127.0.0.1:3100**.

For a production server, run `npm run build` followed by `npm start`. Both scripts use port 3100, so stop any existing server on that port first.

If this handoff’s background server is still running, stop it from the `site` directory with `Stop-Process -Id (Get-Content .server.pid)` before starting another one.

## Update the content

- `src/lib/content.ts`: contact details, career entries and future portfolio collections.
- `src/app/page.tsx`: introduction, about section and approach.
- `src/app/work/page.tsx`: future portfolio page; replace the clearly labelled upcoming entries with real projects as they are ready.
- `src/app/globals.css`: responsive layouts, colours, typography and animation.

The original profile PDF stays outside the website. The full-profile link goes to LinkedIn. No API key, `.env` file, account or external font request is needed to use the website. Contact actions open an email client or copy the email address; there is no contact-form backend.

## Verification

```powershell
npm run typecheck
npm run build
# With the local server running:
npm run test:e2e
```

The browser checks cover desktop/mobile navigation, career disclosures, portfolio destinations, clipboard actions, local fonts, layout overflow at five widths and the 404 page. Chromium must be installed for Playwright (`npx playwright install chromium` if needed).

Variable fonts and their open-source licenses are bundled locally. `scripts/prepare-assets.py` can refresh them from the official Google Fonts repository during development; it is not used at build time or runtime.
