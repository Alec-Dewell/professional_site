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

The original profile PDF stays outside the website. The full-profile link goes to LinkedIn. Fonts are served locally. Contact actions open an email client or copy the email address; there is no contact-form backend.

## Career chat

The floating **Ask my AI** button opens Alec’s digital twin on either page. It answers career questions using the profile in `src/lib/content.ts` and the additional professional context in `src/lib/server/career-context.ts`.

Add your OpenAI API key to `site/.env` or `site/.env.local`:

```dotenv
OPENAI_API_KEY=your_key_here
# Optional UTC cutoff for this app:
OPEN_AI_EXPIRATION=2026-12-07T00:00:00Z
```

Restart the server after changing the key. It is read only by the server’s `POST /api/chat` route and is never sent to the browser. Environment files are ignored by Git. The rest of the website works without a key.

If `OPEN_AI_EXPIRATION` is set, the app stops sending requests at that timestamp. Use an ISO 8601 timestamp with a timezone. An invalid timestamp also disables chat. This is an application cutoff; it does not revoke the credential in your OpenAI account.

The model is `gpt-4.1-mini`, set by `CAREER_MODEL` in `src/lib/server/career-chat.ts`. Requests go directly to OpenAI’s [Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create), with `store: false` and a maximum of 900 output tokens. API usage is billed to your OpenAI account. Rate limits or account configuration problems are shown as safe error messages in the chat.

Conversations are kept in React state in the current tab. Closing the panel preserves the conversation; **Start a new chat** clears it, and reloading the page resets it. The latest ten exchanges accompany each follow-up so the model can understand the conversation. This app does not write transcripts to storage or logs. OpenAI processes the submitted messages under its [API data policies](https://developers.openai.com/api/docs/guides/your-data), as noted in the chat. Setting `store: false` disables stored Responses state; it does not claim that all provider-side retention is disabled.

The prompt requires the twin to acknowledge missing information and identify itself as AI. Answers are generated, so they can still be wrong. Keep the career profile current and verify anything important with Alec.

Requests are validated, limited to 2,000 characters per question and subject to a 60-second timeout. A basic in-memory limiter permits ten requests per client per minute. It resets when the process restarts; shared rate limiting would be needed for a public deployment across multiple server instances.

## Verification

```powershell
npm run typecheck
npm run build
# With the local server running:
npm run test:e2e
```

The checks cover desktop/mobile navigation, career disclosures, portfolio destinations, clipboard actions, local fonts, layout overflow and the 404 page. Chat tests exercise conversation history and retries, keyboard access, cancellation and input validation. Provider responses are mocked in repeatable tests so they do not consume API quota. The live smoke check is run separately against the real model. Chromium must be installed for Playwright (`npx playwright install chromium` if needed).

With the server running, `node scripts/check-career-chat.mjs` sends three real career questions to the configured model. It prints the answers, checks the model ID, and stops on a provider error. This check uses billable OpenAI API tokens.

Variable fonts and their open-source licenses are bundled locally. `scripts/prepare-assets.py` can refresh them from the official Google Fonts repository during development; it is not used at build time or runtime.
