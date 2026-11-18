# Alec Dewell | personal website

A Next.js portfolio with a dark editorial design, copper accents, an interactive orbital illustration, a career timeline, a page for future portfolio collections and an optional AI career chat.

## Run locally

Requires Node.js 20.9 or newer. From the repository root:

```powershell
cd site
npm install
copy .env.example .env.local   # then fill in OPENAI_API_KEY if you want the chat
npm run dev
```

Open **http://127.0.0.1:3100**.

For a production server, run `npm run build` followed by `npm start`. Both use port 3100, so stop any existing server on that port first.

## Update the content

All career facts live in **`src/lib/content.ts`**: profile, experience, education, about paragraphs, practice areas and portfolio collections. The pages **and** the AI chat both read from this file, so edit facts there only. A test (`M2` in `tests/chat-api.spec.ts`) fails if a displayed fact stops reaching the AI prompt.

| File                                                                 | Purpose                                                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `src/app/page.tsx`, `src/app/work/page.tsx`                          | Page layout                                                |
| `src/app/privacy/page.tsx`                                           | Privacy notice (see the launch checklist below)            |
| `src/components/sections.tsx`                                        | Reusable section heading, career entry, project card       |
| `src/components/header.tsx`, `copy-email.tsx`, `reveal-observer.tsx` | The only client-side components besides the chat and orbit |
| `src/app/globals.css` → `src/styles/*.css`                           | Styles, split by section; import order matters             |

Fonts are subsetted variable WOFF2 files served locally. `scripts/prepare-assets.py` regenerates them (development only; needs `pip install fonttools brotli`). `scripts/generate-orbit.mjs` regenerates the point-cloud sphere.

## Career chat

The floating **Ask my AI** button opens Alec’s digital twin. It answers career questions using `src/lib/content.ts` via the prompt in `src/lib/server/career-context.ts`. Requests go from the server to OpenAI’s Responses API with `store: false` and a 900-token cap. The key is read only on the server and never sent to the browser. The rest of the site works without a key.

### Environment variables

See `.env.example` for the full list. Restart the server after changing any of them.

| Variable                   | Default                 | Purpose                                                                                                                 |
| -------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`           | —                       | Required for the chat                                                                                                   |
| `OPEN_AI_EXPIRATION`       | —                       | ISO 8601 cutoff after which the app stops calling OpenAI (does not revoke the key)                                      |
| `CAREER_MODEL`             | `gpt-4.1-mini`          | Model ID; invalid values fall back to the default                                                                       |
| `CHAT_DAILY_REQUEST_LIMIT` | `200`                   | Global ceiling on chat requests per UTC day, whoever sends them                                                         |
| `CHAT_CLIENT_IP_HEADER`    | —                       | Header your host sets with the real client IP (e.g. `cf-connecting-ip`). Unset: all visitors share one 10/minute bucket |
| `CHAT_SIGNING_SECRET`      | random per process      | Signs assistant replies so visitors cannot forge chat history. **Set it** when running more than one instance           |
| `SITE_URL`                 | `http://127.0.0.1:3100` | Public origin for canonical URLs, Open Graph, sitemap; `https://` also enables HSTS                                     |

### How abuse and cost are limited

- Cross-site browser requests are rejected. Requests with no `Origin` header (scripts) are allowed but go through the same limits.
- Per-client limit of 10 requests per minute. `X-Forwarded-For` is **not** trusted unless named in `CHAT_CLIENT_IP_HEADER`, because clients can forge it. When the limiter table is full it evicts the oldest client rather than locking everyone out.
- A daily request budget caps total spend. Also set a hard monthly budget on the OpenAI project.
- Questions are limited to 2,000 characters. The browser trims older exchanges so a conversation never exceeds 21 messages or 24,000 characters.
- Each assistant reply carries a server HMAC signature. Edited or invented "assistant" turns are rejected with HTTP 409 before reaching OpenAI.
- Limits and budgets are in memory: they reset on restart and are per instance. A shared store (for example Redis) is needed for multi-instance hosting.

## Quality checks

```powershell
npm run lint          # ESLint (Next.js core-web-vitals + TypeScript rules)
npm run typecheck     # TypeScript
npm run format:check  # Prettier (npm run format to fix)
npm run test:e2e      # Builds, starts the server and runs all Playwright tests
npm run check         # All of the above
```

Playwright starts the production server automatically. If a server is already running on port 3100 locally it is reused, so stop it first if it is serving old code. Install Chromium once with `npx playwright install chromium`.

The `api` project tests server logic once, without a browser. The `desktop` and `mobile` projects cover navigation, chat behaviour, security headers and CSP, an automated WCAG 2.2 AA scan (axe), minimum text size, layout overflow, the privacy page, SEO routes and asset weight. Every chat test mocks the provider, so the suite never spends API credit. CI runs the same checks on each push (`.github/workflows/ci.yml`).

`node scripts/check-career-chat.mjs` sends three real questions to the configured model through a running server. It uses **billable** tokens; run it deliberately.

## Before deploying publicly

- [ ] Oliver James Comms and Information Security have approved the level of internal detail in `src/lib/content.ts` being published and sent to OpenAI.
- [ ] The privacy notice (`src/app/privacy/page.tsx`) has been reviewed by a qualified adviser (controller, lawful basis, international transfers).
- [ ] `CHAT_CLIENT_IP_HEADER`, `CHAT_SIGNING_SECRET`, `CHAT_DAILY_REQUEST_LIMIT` and `SITE_URL` are set for the host.
- [ ] A hard monthly budget is set on the OpenAI project.
- [ ] HSTS is enabled at the host or via `SITE_URL=https://…`.
