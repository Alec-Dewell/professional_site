# Code review: `site` (Alec Dewell portfolio)

**Date:** 18 November 2026
**Branch reviewed:** `AI-integration` (commits `d5bcf45`, `82b54d0`), plus the untracked working tree
**Scope:** everything under `site/` except `node_modules/`, `.next/` and the vendored `.tools/pypdf` package
**Changes made:** none. This document only reports findings and recommendations.

---

## 1. Summary

This is a small, tidy Next.js 16 / React 19 portfolio site with an OpenAI-backed "digital twin" career chat. The code is in better shape than most projects at this stage. Particular strengths:

- The OpenAI key stays on the server.
- Errors from the AI provider are sanitised before they reach the browser.
- Model output is rendered as plain text.
- The test suite already covers several adversarial cases.

The main risks only appear **once the site is publicly deployed**:

1. The chat endpoint is effectively an open, paid proxy to OpenAI. Its only protection is a per-IP rate limiter that clients can trick by sending a false `X-Forwarded-For` header, and that any client can fill up to lock everyone else out.
2. There are no HTTP security headers (CSP, frame-ancestors and so on).
3. Two compliance points need someone to sign them off:
   - **Internal company detail.** The site and the chat context describe Oliver James's internal strategy, team structure and tooling.
   - **Visitor messages.** What visitors type goes to a third-party AI provider, and there is no privacy notice explaining that.

There is also an unused third-party API key in `.env`.

Maintainability is the other big theme. Much of the JSX and almost all of `globals.css` is written as very long single lines (up to 7,725 characters). That makes the code hard to review, change and compare in diffs.

### Verified health checks

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Passes (exit 0) |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `.env` tracked or in git history | No (correctly ignored) |
| Playwright suite | **Not run** during this review (it needs a running server) |

---

## 2. Strengths worth keeping

- **Secrets stay on the server.** `OPENAI_API_KEY` is only read in [src/app/api/chat/route.ts](src/app/api/chat/route.ts), and a test confirms it never appears in a response.
- **Defensive handling of AI-provider responses.** [src/lib/server/career-chat.ts:136-157](src/lib/server/career-chat.ts#L136-L157) never passes the provider's own error messages to the browser. It returns only `output_text` from assistant messages, and it throws away truncated (`incomplete`) replies instead of showing half an answer.
- **Input validation.** The server caps the request body size by streaming it in. It also enforces:
  - strict alternation of user and assistant turns
  - no `system` role allowed from the browser
  - a per-message length limit
  - a check of the Origin, Host and Sec-Fetch-Site headers
- **Safe rendering.** Chat output is plain text inside React, and a test checks that injected HTML does not run.
- **Cost controls.** `store: false`, `max_output_tokens: 900`, a 60-second timeout, and an `OPEN_AI_EXPIRATION` date after which the app stops calling OpenAI.
- **Dependency-injection seam.** `handleCareerChat(request, { fetchImpl, limiter, ... })` makes the server logic testable without network calls. That is a good pattern.
- **Accessibility basics.** Native `<dialog>`, a skip link, `aria-live` regions, `aria-pressed` toggles, `prefers-reduced-motion` support, focus-visible outlines, and the IME check `isComposing` on Enter-to-send.
- **Progressive enhancement.** The scroll-reveal hiding is applied by JavaScript, so content stays visible if JavaScript fails.
- **Pinned runtime dependencies** and locally bundled fonts with their OFL licences.

---

## 3. Findings at a glance

Severity reflects the risk **if the site is deployed publicly**. While it only runs on `127.0.0.1`, most of the High items are latent.

| ID | Severity | Area | Finding |
|---|---|---|---|
| S1 | **High** | Security / credentials | Unused `OPENROUTER_API_KEY` still stored in `.env` |
| S2 | **High** | Security / cost | Rate limiter keyed on a spoofable `X-Forwarded-For` header, with no global spend ceiling |
| S3 | **High** | Security / availability | Filling the limiter's 500-entry table locks out every new visitor |
| C1 | **High** | Compliance | Internal Oliver James detail published and sent to OpenAI; needs approval |
| C2 | **Medium** | Compliance / GDPR | No privacy notice for visitor messages processed by OpenAI |
| S4 | **Medium** | Security | No HTTP security headers (CSP, frame-ancestors, Referrer-Policy and others) |
| S5 | Low | Security / AI integrity | Client-supplied assistant turns can be fabricated |
| B1 | **Medium** | Bug | Long conversations hit a character cap and get stuck with a misleading error |
| B2 | Low | Bug / a11y | 404 page marks "Portfolio" as `aria-current="page"` |
| B3 | Low | Bug | `colorScheme: "dark light"` can render native controls in light mode |
| B4 | Low | Bug | Footer year computed in a client component can cause a hydration mismatch |
| B5 | Low | Bug / UX | Scroll-reveal hides content after first paint (flicker above the fold) |
| M1 | **Medium** | Maintainability | Very long single-line JSX and hand-minified CSS |
| M2 | **Medium** | Maintainability | Career facts duplicated across page, content and prompt |
| M3 | Low | Maintainability | No linter or formatter configured |
| M4 | Low | Maintainability | Inconsistent internal links (`<a>` and `<Link>`) |
| M5 | Low | Maintainability | Dead or legacy code and naming issues |
| A1 | **Medium** | Accessibility | Over 100 font-size declarations below 10px |
| A2 | Low | Accessibility | Textarea `outline: none`; disabling the focused input |
| P1 | Low | Performance | 185 KB point-cloud SVG; fonts served as TTF |
| P2 | Low | Performance | Entire site shell is a client component |
| T1 | **Medium** | Testing | Tests need a server started by hand; no `webServer` or CI |
| T2 | Low | Testing | Pure server tests run twice (desktop and mobile projects) |
| T3 | Low | Testing | Gaps: no tests for the S2, S3 and B1 cases or a missing Origin header |
| H1 | Low | Housekeeping | Stray logs, PID files, vendored `.tools/`, PDF, untracked `tutorial.md` |
| H2 | Low | Docs | README hard-codes a personal Windows path; PDF path is wrong |
| D1 | Low | SEO / deploy | No `metadataBase`, OG image, sitemap or robots route |

---

## 4. Detailed findings

### Security

#### S1 · High · Unused third-party API key in `.env`
**Where:** `site/.env`
**Fact:** `.env` contains `OPENROUTER_API_KEY` and `OPENAI_API_KEY`. The OpenRouter integration has been removed: nothing in `src/` reads it, and `tutorial.md` says it was replaced. The file is correctly gitignored and has never been committed.
**Risk:** a live key nobody uses is easy to forget and could leak through backups, screen-sharing, zips of the folder or AI-tool context. It also conflicts with the company rule on storing credentials.
**Recommendation:**
- Revoke the OpenRouter key in the OpenRouter dashboard, then delete the line.
- Consider whether the OpenAI key should be a dedicated project key with a hard monthly budget in the OpenAI console.
- Commit a `.env.example` that contains only variable names.
- Raise with InfoSec where personal API keys for this kind of work should live.

#### S2 · High (when public) · Spoofable rate limiting and no spend ceiling
**Where:** [src/lib/server/career-chat.ts:114](src/lib/server/career-chat.ts#L114), [src/lib/server/career-chat.ts:73-86](src/lib/server/career-chat.ts#L73-L86)
**Fact:** the client key is `x-forwarded-for` split on `,` and taking the first entry, which falls back to `"local"`. The first entry is whatever the client sent unless a trusted proxy overwrites the header. The Origin check also allows requests with no `Origin` header (`!origin`). That is correct for blocking cross-site requests from browsers, but it means any script or `curl` can call the endpoint freely.
**Risk:** an attacker can rotate `X-Forwarded-For` values to get unlimited requests, each one billed to your OpenAI account. Locally, every visitor shares the single `"local"` bucket.
**Recommendation:**
- Derive the client IP from a source you trust for your hosting provider, for example the platform's own header or the *right-most* untrusted hop. Do not use the left-most value.
- Add a **global** daily or monthly request or token budget on top of the per-client limit, and set a hard budget on the OpenAI project.
- When the site is deployed, use a shared store (Redis, Upstash, or the platform's KV store), as the README already notes.
- Optionally add a lightweight bot challenge (for example Cloudflare Turnstile) before the first message.

#### S3 · High (when public) · Rate-limiter table can be filled to lock everyone out
**Where:** [src/lib/server/career-chat.ts:21](src/lib/server/career-chat.ts#L21)
**Fact:** once 500 clients are tracked, any *new* client gets `return 60` until entries expire. Combined with S2, one attacker sending 500 different fake headers within 60 seconds blocks chat for every real visitor.
**Recommendation:** when the table is full, evict the oldest entries instead of refusing new clients (a small LRU cache). Better still, fix S2 so that keys cannot be invented, and rely on the global budget for overall protection. The cleanup loop on every call is also O(n); that is fine at 500 entries, but an LRU removes it.

#### S4 · Medium · No security headers
**Where:** [next.config.ts](next.config.ts)
**Fact:** only `poweredByHeader: false` is set. The chat API sets `nosniff` and `no-store`; pages set nothing.
**Recommendation:** add `headers()` in `next.config.ts`:
- `Content-Security-Policy`: `default-src 'self'`; `connect-src 'self'` (the browser only talks to `/api/chat`); a nonce or `'unsafe-inline'` for `style-src` as Next requires; `frame-ancestors 'none'`.
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` with unused features disabled
- `X-Content-Type-Options: nosniff`
- HSTS, applied at the host

#### S5 · Low · Client-controlled conversation history
**Where:** [src/lib/server/career-chat.ts:99-104](src/lib/server/career-chat.ts#L99-L104), [src/components/career-chat.tsx:69](src/components/career-chat.tsx#L69)
**Fact:** the server accepts any assistant turns the client sends. A visitor can fake earlier "assistant" replies, for example a made-up salary, to steer the model. The system prompt already says earlier assistant replies cannot add facts, which reduces the risk.
**Recommendation:** for a portfolio this is acceptable residual risk, but document it. If it matters later, sign each assistant reply with a server-side HMAC and reject unsigned or altered turns, or keep conversation state on the server. Periodically re-run [scripts/check-career-chat.mjs](scripts/check-career-chat.mjs) with injection-style prompts as a regression check.

### Compliance (company policy and GDPR)

> These are flagged per Oliver James AI and data-protection guidance. They are judgement calls for the business, not code defects, and should be referred to the relevant team rather than decided here.

#### C1 · High · Internal company detail in public content and the AI context
**Where:** [src/lib/content.ts:9-61](src/lib/content.ts#L9-L61), [src/lib/server/career-context.ts:15-20](src/lib/server/career-context.ts#L15-L20), [src/app/page.tsx:26](src/app/page.tsx#L26), [src/app/page.tsx:19](src/app/page.tsx#L19)
**Fact:** the copy describes:
- the AI-in-CRM strategy and build-or-buy assessments
- the product team structure, with product managers for front and middle office and an AI Product Owner
- work with the CIO and COO
- that three of five products run on Salesforce
- Pendo usage
- an external development partner

The same detail goes into every OpenAI request as system context.
**Recommendation:** ask Oliver James Marketing/Comms and Information Security to confirm this level of detail is fine to publish on a personal site and to send to OpenAI. Until then, keep the site local-only.

#### C2 · Medium · No privacy notice for visitor data
**Where:** [src/components/career-chat.tsx:122](src/components/career-chat.tsx#L122)
**Fact:** the chat tells visitors that messages go to OpenAI and links to OpenAI's policy. Visitors may still type personal data (their name, employer or job search details). The site has no privacy notice of its own, no stated lawful basis, and no data-controller contact.
**Recommendation:** before publishing, add a short `/privacy` page covering:
- what is collected
- the processor (OpenAI) and where data goes outside the UK
- retention (none on this site, plus OpenAI's API policy)
- a contact address

Link to it from the chat panel and footer. Consider adding "Please don't share personal details" to the chat's empty state. Check the wording with Legal or the Data Protection Officer.

### Bugs

#### B1 · Medium · Long conversations get stuck with a misleading error
**Where:** [src/lib/server/career-chat.ts:6](src/lib/server/career-chat.ts#L6), [src/lib/server/career-chat.ts:100-104](src/lib/server/career-chat.ts#L100-L104), [src/components/career-chat.tsx:69](src/components/career-chat.tsx#L69)
**Fact:**
- The client trims history only by *message count*: `slice(-21)`.
- The server also rejects any request where the total characters exceed 28,000, or the body exceeds 48,000 bytes.
- Assistant replies can reach about 3,600 characters (900 tokens), and user messages 2,000. About ten long exchanges can therefore go over 28,000 characters.
- The server then returns *"Please send a question of up to 2,000 characters…"*, which is wrong for this case.
- Because the client keeps sending the same oversized history, every later question fails until the visitor presses "Start a new chat".

**Recommendation:**
- Have the client drop the oldest pairs until the total is under a shared `CHAT_HISTORY_CHAR_LIMIT`. Put that constant in [src/lib/chat.ts](src/lib/chat.ts) so the client and server agree.
- Give each validation failure its own message: too long a question, too long a conversation, malformed request.
- Add a test.

#### B2 · Low · 404 page marks "Portfolio" as the current page
**Where:** [src/app/not-found.tsx:6](src/app/not-found.tsx#L6), [src/components/site-shell.tsx:21](src/components/site-shell.tsx#L21)
**Fact:** `NotFound` renders `<Header work/>`. In `Header`, `work` does two jobs: it means "not the home page" (so links become `/#about` and so on), and it means "on /work" (which sets `aria-current="page"` on Portfolio). Screen readers on the 404 page are therefore told they are on the Portfolio page.
**Recommendation:** split the prop, for example `current?: "home" | "work" | null`, or derive the current page from `usePathname()`.

#### B3 · Low · Viewport claims a light scheme that does not exist
**Where:** [src/app/layout.tsx:17](src/app/layout.tsx#L17)
**Fact:** `colorScheme: "dark light"` tells the browser that both schemes are supported. On a light-mode OS, native scrollbars, autofill and form controls may render light against the dark design. There is no light theme in the CSS.
**Recommendation:** use `colorScheme: "dark"`, or set `color-scheme: dark` on `:root`.

#### B4 · Low · Footer year can cause a hydration mismatch
**Where:** [src/components/site-shell.tsx:55](src/components/site-shell.tsx#L55)
**Fact:** `new Date().getFullYear()` runs in a client component on a page that is prerendered at build time. After the new year, the server HTML (build year) and the client render (current year) differ, and React will warn and re-render.
**Recommendation:** make `Footer` a server component (see P2) and render the year there. Alternatively, use `suppressHydrationWarning` on that element.

#### B5 · Low · Reveal animation can flicker on first load
**Where:** [src/components/site-shell.tsx:30-37](src/components/site-shell.tsx#L30-L37)
**Fact:** the server HTML shows the content. After hydration, `will-reveal` sets opacity to 0, and the IntersectionObserver then fades it back in. Elements already on screen can flash visible, then hidden, then visible again.
**Recommendation:** add a `js` class to `<html>` with a tiny inline script before first paint, and scope the CSS to `.js [data-reveal]:not(.is-visible)`. Alternatively, skip the hide step for elements already in the viewport on mount.

### Maintainability

#### M1 · Medium · Very long lines and hand-minified CSS
**Where:**
- [src/app/globals.css](src/app/globals.css): 49 lines and 36 KB, with one line of 7,725 characters
- [src/app/page.tsx:26](src/app/page.tsx#L26): 981 characters
- [src/components/career-chat.tsx:109-122](src/components/career-chat.tsx#L109-L122)
- [src/app/work/page.tsx:10-11](src/app/work/page.tsx#L10-L11)
- [src/components/site-shell.tsx:25](src/components/site-shell.tsx#L25)
- [src/components/site-shell.tsx:55](src/components/site-shell.tsx#L55)

**Risk:** diffs become a single changed line, merge conflicts are hard to resolve, review is nearly impossible, and editor tools work poorly. Next.js already minifies CSS and JS for production, so there is nothing to gain from writing them minified.
**Recommendation:**
- Add Prettier and format the whole project in one dedicated commit.
- Split `globals.css` into section files or CSS Modules: tokens, layout, hero, timeline, contact and so on.
- Extract repeated markup into small components such as `SectionHeading`, `CareerEntry`, `PracticeRow` and `ProjectCard`.
- Move the inline `practice` array ([src/app/page.tsx:42-46](src/app/page.tsx#L42-L46)) into `content.ts`.

#### M2 · Medium · Career facts duplicated in three places
**Where:**
- Education: [src/app/page.tsx:36](src/app/page.tsx#L36) and [src/lib/server/career-context.ts:11-14](src/lib/server/career-context.ts#L11-L14)
- About copy and `additionalExperience`: [src/app/page.tsx:26](src/app/page.tsx#L26) and [src/lib/server/career-context.ts:15-20](src/lib/server/career-context.ts#L15-L20)
- Hard-coded timeline facts in the prompt: [src/lib/server/career-context.ts:30](src/lib/server/career-context.ts#L30) ("promotion happened in April 2024 … Head of Product in November 2025")
- `year` alongside `period` in [src/lib/content.ts](src/lib/content.ts)

**Risk:** the site and the AI twin can contradict each other after a content update. The README says to edit `content.ts`, but that does not update the prompt's prose.
**Recommendation:** make [src/lib/content.ts](src/lib/content.ts) the single source of truth. Add `education` and `highlights` there, render the page from them, and build the prompt's clarifying sentences from the data, or at least add a test that checks they agree.

#### M3 · Low · No linting or formatting
**Fact:** there is no ESLint or Prettier config or script. Next 16 no longer includes `next lint`.
**Recommendation:** add `eslint` with `eslint-config-next` (including the `react-hooks` and `jsx-a11y` rules) and Prettier, with `lint` and `format` scripts.

#### M4 · Low · Inconsistent internal links
**Where:** [src/app/page.tsx:15](src/app/page.tsx#L15), [src/app/page.tsx:51-52](src/app/page.tsx#L51-L52), [src/app/work/page.tsx:10](src/app/work/page.tsx#L10), [src/components/career-chat.tsx:113](src/components/career-chat.tsx#L113)
**Fact:** some internal routes use plain `<a href="/work">` or `<a href="/">`, which reload the whole page, while others use `next/link`.
**Recommendation:** use `<Link>` for all internal routes so navigation is client-side and pages can be prefetched.

#### M5 · Low · Small code-quality items
- [src/components/orbit.tsx:13](src/components/orbit.tsx#L13): `useId().replace(/:/g, "")` is a leftover workaround. Recent React 19 versions no longer produce `:` in IDs, so the replace does nothing. It is harmless but misleading.
- [src/lib/chat.ts:2](src/lib/chat.ts#L2): `CHAT_HISTORY_LIMIT = 21` is a magic number. Express it as `MAX_EXCHANGES * 2 + 1`.
- [src/lib/server/career-chat.ts:18](src/lib/server/career-chat.ts#L18), [src/lib/server/career-chat.ts:21-22](src/lib/server/career-chat.ts#L21-L22), [src/lib/server/career-chat.ts:39](src/lib/server/career-chat.ts#L39): the hard-coded `10`, `500`, `60_000` and `6000` should be named constants.
- [src/lib/server/career-chat.ts:4](src/lib/server/career-chat.ts#L4): the model ID is hard-coded, and repeated in [scripts/check-career-chat.mjs:24](scripts/check-career-chat.mjs#L24). Consider reading an optional `CAREER_MODEL` environment variable with this as the default, and have the script check against the server's reported model.
- [src/components/project-art.tsx:1](src/components/project-art.tsx#L1): `type: string` could be the union `"orbital" | "grid" | "steps"`, taken from `content.ts`.
- Chat messages use the array index as `key` ([src/components/career-chat.tsx:113](src/components/career-chat.tsx#L113)). That is acceptable for an append-only list, but a stable ID per message is more robust.

### Accessibility

#### A1 · Medium · Very small text
**Fact:** the CSS contains 4 × 5px, 10 × 6px, 30 × 7px, 32 × 8px and 25 × 9px font-size declarations. Many are decorative eyebrows and labels, but some carry meaning: `CURRENT FOCUS`, project types, `COMING SOON`, chat speaker labels and SVG labels at `fontSize="8"`.
**Recommendation:**
- Set a minimum of about 11–12px for any text that carries meaning, and mark purely decorative text `aria-hidden`.
- Prefer `rem` so text respects the visitor's browser font settings.
- Run an axe or Lighthouse accessibility pass and check the contrast of muted colours, such as `#718461` placeholder text on `#13180f`, against WCAG 2.2 AA.

#### A2 · Low · Focus handling in the chat composer
**Where:** [src/components/career-chat.css:80](src/components/career-chat.css#L80), [src/components/career-chat.tsx:120](src/components/career-chat.tsx#L120)
**Fact:** the textarea uses `outline: none`. A `:focus-within` border on the wrapper replaces it, which is acceptable, but the replacement is a subtle colour change only. The textarea is also `disabled` while a reply is loading, which drops keyboard and screen-reader focus to `<body>` until it is restored in `finally`.
**Recommendation:** strengthen the `:focus-within` indicator (at least 3:1 contrast and 2px). Use `readOnly` plus `aria-busy` instead of `disabled` so focus stays put.

### Performance

#### P1 · Low · Asset weight
- [public/images/point-sphere.svg](public/images/point-sphere.svg) is 185 KB, with 3,192 `<circle>` elements created by [scripts/generate-orbit.mjs](scripts/generate-orbit.mjs). Gzip will compress it well, but the browser still has to parse and draw every point. Options: fewer points, combined into a single `<path>`, or pre-render it to a WebP or AVIF image at 2× resolution.
- Fonts are variable **TTF** files (165 KB and 137 KB). Convert them to **WOFF2** and subset them to Latin characters, which is typically 50–70% smaller. Update [scripts/prepare-assets.py](scripts/prepare-assets.py) to match.

#### P2 · Low · Unnecessary client components
**Where:** [src/components/site-shell.tsx:1](src/components/site-shell.tsx#L1)
**Fact:** `"use client"` at the top of the file makes `Footer`, and all the static markup in `Header` and `Contact`, client components.
**Recommendation:** split the file so that only the interactive pieces are client components: the mobile menu toggle, the copy-email button and `RevealObserver`. This reduces JavaScript sent to the browser and fixes B4.

### Testing

#### T1 · Medium · Tests depend on a server started by hand
**Where:** [playwright.config.ts](playwright.config.ts)
**Fact:** there is no `webServer` block, so `npm run test:e2e` fails unless someone has already started the server on port 3100. There is no CI workflow.
**Recommendation:** add `webServer: { command: "npm run build && npm start", url: "http://127.0.0.1:3100", reuseExistingServer: true }`. Add a GitHub Actions workflow that runs typecheck, lint, build and Playwright on each push or PR.

#### T2 · Low · Server tests run twice
**Where:** [tests/chat-api.spec.ts](tests/chat-api.spec.ts)
**Fact:** these are pure function tests with no browser, but they run under both the `desktop` and `mobile` Playwright projects.
**Recommendation:** move them to Vitest or Node's built-in `node:test`, or give them their own Playwright project with `testMatch` set so they run once.

#### T3 · Low · Coverage gaps
Add tests for:
- B1: history character overflow, with the client trimming and the right error message
- S2 and S3: spoofed `X-Forwarded-For` rotation, and behaviour when the table is full
- requests with **no** `Origin` header (currently allowed by design; a test documents that decision)
- the B2 `aria-current` behaviour on the 404 page

Also make brittle checks more robust. Examples: `bounds!.y > 1000` in [tests/site.spec.ts:17](tests/site.spec.ts#L17), and the hard-coded email at [tests/site.spec.ts:55](tests/site.spec.ts#L55), which could import `profile.email` instead.

### Housekeeping and documentation

#### H1 · Low · Stray files in the project folder
These are all gitignored, but they clutter the workspace:
- `server.log`, `server-error.log`, `.server.pid`, `tsconfig.tsbuildinfo`, `test-results/`
- `.tools/`: a vendored copy of `pypdf`, used once to read the profile PDF
- `alec_linkedin.pdf`, which contains personal data
- `tutorial.md` is **untracked** and not ignored, so it should be either committed or removed

**Recommendation:** delete the logs and PID files. Move `.tools/` and the PDF outside the project, or delete them once they are no longer needed. Decide what to do with `tutorial.md`.

#### H2 · Low · README issues
**Where:** [README.md](README.md)
- It hard-codes `C:\Users\Alec.Dewell\Udemy\AIVIbeCoding\site`, which exposes a username and does not work on any other machine. Use `cd site` instead.
- It says profile facts come from `../alec_linkedin.pdf`, but the PDF is actually inside `site/`.
- Add a `.env.example` reference and a short "Deploying publicly" checklist that links to S2, S4, C1 and C2.

#### D1 · Low · SEO and deployment readiness
**Where:** [src/app/layout.tsx:9-15](src/app/layout.tsx#L9-L15)
**Recommendation:** when a domain exists:
- set `metadataBase` so Open Graph URLs resolve
- add an `opengraph-image`
- add `app/sitemap.ts` and `app/robots.ts`
- add canonical URLs

Until then, `robots: { index: true }` has no effect locally.

---

## 5. Suggested remediation order

1. **Now (no code needed):**
   - revoke and remove the OpenRouter key (S1) and set an OpenAI project budget
   - raise C1 and C2 with Comms, InfoSec and Legal
   - tidy the stray files (H1)
2. **Before any public deployment:** S2, S3, S4 and C2 (privacy page), then B1.
3. **Quality pass:** Prettier and ESLint (M3), then reformat and split CSS and components (M1), single source of truth for content (M2), `webServer` and CI (T1).
4. **Polish:** A1, A2, B2–B5, P1, P2, M4, M5, T2, T3, H2, D1.

---

## 6. Assumptions and limits of this review

- **Not run:** the Playwright suite (it needs a running server), and the live OpenAI smoke test (it costs money). Runtime behaviour described in B1, B4 and B5 is inferred from the code, not observed.
- **Estimates:** the character figures in B1 assume roughly four characters per token for English text.
- **S2 depends on hosting:** whether a given host overwrites `X-Forwarded-For` varies by platform; check the provider's documentation.
- **Colour contrast** was not measured with a tool; A1 recommends an automated audit instead of asserting specific failures.
- **Out of scope:** the `.env` values were not displayed or inspected beyond the variable names. The `.tools/pypdf` package and `tutorial.md` were not reviewed.
