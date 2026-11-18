# Understanding your website: a beginner’s tutorial

This guide explains the website in this repository, including the AI career chat. It assumes you are new to front-end development. You do not need to understand every line before making your first useful edit.

The examples describe the code as reviewed on **18 November 2026**. The website currently uses **OpenAI directly**, with the `gpt-4.1-mini` model. An earlier version used OpenRouter; that integration has been replaced.

Read this alongside your editor. File links are relative to this `site` folder. Code samples are excerpts from the project, sometimes reformatted or shortened for teaching. A sample marked **teaching example** explains an idea rather than providing a replacement for an entire file.

## Contents

1. [What we built](#1-what-we-built)
2. [The technology involved](#2-the-technology-involved)
3. [Run the project locally](#3-run-the-project-locally)
4. [Find your way around the files](#4-find-your-way-around-the-files)
5. [Read the basic syntax](#5-read-the-basic-syntax)
6. [Understand Next.js pages and the shared layout](#6-understand-nextjs-pages-and-the-shared-layout)
7. [Review the content and home page](#7-review-the-content-and-home-page)
8. [Understand the styling](#8-understand-the-styling)
9. [Review the navigation and other interactions](#9-review-the-navigation-and-other-interactions)
10. [Understand the illustrations and local assets](#10-understand-the-illustrations-and-local-assets)
11. [Review the chat interface](#11-review-the-chat-interface)
12. [Follow a request through the server](#12-follow-a-request-through-the-server)
13. [Understand what the digital twin knows](#13-understand-what-the-digital-twin-knows)
14. [Understand the tests](#14-understand-the-tests)
15. [Try small changes yourself](#15-try-small-changes-yourself)
16. [Debug common problems](#16-debug-common-problems)
17. [Work safely with Git and AI](#17-work-safely-with-git-and-ai)
18. [Useful terms and further reading](#18-useful-terms-and-further-reading)
19. [Self-review: five improvements](#19-self-review-five-improvements)

## 1. What we built

Your website has a home page introducing you and a separate portfolio page for future projects. The home page includes your career history, with expandable entries. A floating button opens a conversation with an AI representation of you.

The work began with your LinkedIn PDF. Its professional information supplied the initial content. We built the page layouts, added the orbital artwork, and checked the site at different screen sizes. You then asked for more direct copy, so the headings and descriptions were rewritten. The career chat was added later and subsequently switched to OpenAI.

The app does not parse the PDF each time someone visits. The relevant information is already represented in the source files. Updating the original PDF alone will not update the website or the AI’s context.

There are two different journeys through the app.

### Reading the website

```text
Visitor opens /
    ↓
Next.js supplies the page and its assets
    ↓
The browser displays the content
    ↓
React activates browser interactions such as the chat button
```

### Asking a career question

```text
Visitor types in the chat panel
    ↓
Browser sends messages to /api/chat
    ↓
The local Next.js server validates the request
    ↓
The server adds your professional profile and instructions
    ↓
The server calls OpenAI using the private API key
    ↓
The server extracts the answer and returns it to the browser
    ↓
React adds the reply to the conversation
```

The browser never needs your OpenAI key. It talks to your own server, which makes the authenticated request.

## 2. The technology involved

Front-end development is the work involved in the interface people see and use. This project also contains a small back end, because calling an AI service safely requires server-side code.

| Technology | What it means here | Where you will see it |
| --- | --- | --- |
| HTML | The structure of the page, such as headings, links and forms | Inside the `.tsx` components |
| CSS | Rules controlling appearance and layout | `globals.css` and `career-chat.css` |
| JavaScript | The programming language used for interactions | React event handlers and `.mjs` scripts |
| TypeScript | JavaScript with extra checks describing expected values | `.ts` and `.tsx` files |
| React 19.3.0 | A library for describing interfaces using components | `src/components/` and page files |
| Next.js 16.4.6 | The framework providing routes, builds and server functionality | `src/app/`, `next.config.ts` |
| Node.js | Runs JavaScript outside the browser, including the local server | Commands such as `npm run dev` |
| npm | Installs packages and runs the project’s named commands | `package.json`, `package-lock.json` |
| Lucide React | Supplies the arrow, menu and chat icons | Imports from `lucide-react` |
| SVG | Describes vector graphics using text and coordinates | The orbital artwork and favicon |
| OpenAI API | The remote service generating career answers | The server’s request to `/v1/responses` |
| Playwright | Runs automated checks, including browser interactions | `tests/` and `playwright.config.ts` |
| Python | Used by a development script to download font files | `scripts/prepare-assets.py` |
| Git | Records the history of your source files | Commits and branches in this repository |

The versions above are the versions declared by this project, not a recommendation to upgrade anything while following the guide.

We use ordinary CSS rather than Tailwind. The OpenAI request uses the built-in `fetch` function rather than an installed OpenAI SDK. There is no database or account system in this app.

### What is a dependency?

A dependency is code the project uses from another package. For example, React supplies the `useState` function, and Lucide supplies the `MessageCircle` icon.

In [`package.json`](package.json), `dependencies` lists the main packages the app needs. `devDependencies` contains development tools such as TypeScript and Playwright.

`package-lock.json` records the resolved dependency versions, including packages used by other packages. Commit it so other people can install a consistent set of dependencies.

## 3. Run the project locally

Open PowerShell in the project directory:

```powershell
cd C:\Users\Alec.Dewell\Udemy\AIVIbeCoding\site
```

You can check your installed tools with:

```powershell
node --version
npm --version
```

The project requires Node.js 20.9 or newer. Install the dependencies if they are missing:

```powershell
npm install
```

This creates `node_modules`, which can contain many thousands of dependency files. You normally edit files in `src`, not files in `node_modules`.

Start development mode:

```powershell
npm run dev
```

Open **http://127.0.0.1:3100** in your browser. The address refers to your own computer. `3100` is the port, which identifies this particular local server.

Development mode watches your source files. After you save an edit, Next.js usually updates the page automatically. Keep the terminal running while using the site. Press **Ctrl + C** in that terminal to stop the server you started there.

### Development mode and production mode

The commands come from `scripts` in `package.json`:

```json
{
  "dev": "next dev --hostname 127.0.0.1 --port 3100",
  "build": "next build",
  "start": "next start --hostname 127.0.0.1 --port 3100",
  "typecheck": "tsc --noEmit",
  "test:e2e": "playwright test"
}
```

`npm run build` prepares an optimised version of the site. `npm start` serves that built version. Stop any server already using port 3100 before starting another one.

```powershell
npm run build
npm start
```

Production mode does not automatically rebuild when you edit source files. If your changes are missing, check which mode is running.

We previously started a background server during development. If it is still running, it will not stop when you close an unrelated terminal. The [README](README.md#run-locally) explains its `.server.pid` file and how to stop that server.

### Configure the AI chat

The rest of the website can run without an API key. The chat needs an OpenAI key in the `site` directory’s `.env` file:

```dotenv
OPENAI_API_KEY=replace_with_your_actual_key
```

That is a placeholder, not a working key. Keep the real value out of screenshots and Git commits.

The app also supports an optional cutoff:

```dotenv
OPEN_AI_EXPIRATION=2027-01-01T00:00:00Z
```

The date above is only an example. Use the date you intend. `Z` means UTC. The variable name really is `OPEN_AI_EXPIRATION`, while the key is named `OPENAI_API_KEY`; the code reads those exact names.

After changing these settings, restart the server. An invalid or expired cutoff disables chat. This stops this app from using the key; it does not revoke the key in your OpenAI account.

## 4. Find your way around the files

This is the main structure, with some generated files omitted:

```text
site/
├── src/
│   ├── app/
│   │   ├── layout.tsx             Shared document, fonts and chat widget
│   │   ├── page.tsx               Home page
│   │   ├── globals.css            Main website styles
│   │   ├── not-found.tsx          Missing-page screen
│   │   ├── icon.svg               Browser-tab icon
│   │   ├── work/page.tsx          Portfolio page
│   │   └── api/chat/route.ts      Chat API entry point
│   ├── components/
│   │   ├── site-shell.tsx         Header, contact section and footer
│   │   ├── orbit.tsx              Interactive orbital illustration
│   │   ├── project-art.tsx        Artwork for portfolio categories
│   │   ├── career-chat.tsx        Chat interface and browser behaviour
│   │   └── career-chat.css        Chat styles
│   ├── lib/
│   │   ├── content.ts             Shared professional content
│   │   ├── chat.ts                Shared chat types and limits
│   │   └── server/
│   │       ├── career-context.ts  Professional context and AI instructions
│   │       └── career-chat.ts     Validation and OpenAI request handling
│   └── fonts/                    Local fonts and their licences
├── public/images/point-sphere.svg Generated orbital point field
├── scripts/                      Asset helpers and manual checks
├── tests/                        Automated checks
├── package.json                  Packages and npm commands
├── package-lock.json             Resolved package versions
├── tsconfig.json                 TypeScript configuration
├── next.config.ts                Next.js configuration
├── playwright.config.ts          Test-runner configuration
├── .gitignore                    Files Git should leave untracked
├── .env                          Local secrets; ignored by Git
├── README.md                     Quick setup instructions
└── tutorial.md                   This guide
```

`src` means source. `lib` is a conventional name for shared supporting code. These folder names help people organise the project; the `app` directory’s special filenames also have meaning to Next.js.

| Extension | How to read it |
| --- | --- |
| `.tsx` | TypeScript containing React markup |
| `.ts` | TypeScript without JSX markup |
| `.css` | A stylesheet |
| `.mjs` | A JavaScript module run by Node.js |
| `.py` | A Python script |
| `.json` | Structured data or configuration |
| `.md` | A Markdown document, such as this guide |

The `.next` folder contains generated build files. Editing it is not a lasting way to change the app. A later build can replace those files.

## 5. Read the basic syntax

You will meet the following ideas throughout the code. It is useful to recognise them before reviewing the larger components.

### HTML and JSX

An HTML element has a tag describing its purpose:

```html
<h1>Alec Dewell</h1>
<p>I lead product at Oliver James.</p>
<a href="/work">View portfolio</a>
```

`h1` is the main heading. `p` is a paragraph. `a` creates a link, with `href` specifying its destination.

React components use **JSX**, which looks like HTML inside JavaScript or TypeScript. JSX uses `className` for CSS classes:

```tsx
<p className="lead">I took my first product management role in 2021.</p>
```

It also uses `htmlFor` on a label, corresponding to an input’s `id`:

```tsx
<label htmlFor="career-question">Your question</label>
<textarea id="career-question" />
```

That association helps people using assistive technology understand the input.

### Variables, objects and arrays

`const` gives a value a name. An **object** groups named properties. An **array** contains an ordered collection of values.

From [`content.ts`](src/lib/content.ts):

```ts
export const profile = {
  name: "Alec Dewell",
  role: "Head of Product & AI Transformation Lead",
  location: "Manchester, UK",
  email: "alecdewell@gmail.com",
  linkedin: "https://www.linkedin.com/in/alecdewell/",
};
```

`profile.name` reads the `name` property. The `experience` array contains one object for each career entry.

`export` makes a value available to other files. An `import` brings that exported value into the file that needs it:

```ts
import { profile } from "@/lib/content";
```

The `@/` shortcut maps to `src/`, as configured in `tsconfig.json`. It is a source-code import shortcut, not a website address.

### Functions and components

A function contains instructions you can run. A React component is a function that returns interface markup. Component names begin with a capital letter. The [React component introduction](https://react.dev/learn/your-first-component) explains this convention.

**Teaching example:**

```tsx
function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}.</p>;
}

// This would display: Hello, Alec.
<Greeting name="Alec" />
```

`name` is a **prop**, a value passed into the component. `{ name }` takes the property out of the props object. The TypeScript annotation says it must be a string, meaning text.

Curly braces inside JSX evaluate a JavaScript expression. They let a component display a value rather than fixed text.

### Types

The actual chat message type is in [`src/lib/chat.ts`](src/lib/chat.ts):

```ts
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
```

The `|` means “or”. A message’s role must be either `"user"` or `"assistant"`. TypeScript can catch an accidental value such as `"visitor"` in your code.

TypeScript checks your source code. It does not automatically check JSON arriving from a browser. That is why the server also validates requests at runtime.

### A few expressions you will see

| Expression | Meaning in this project |
| --- | --- |
| `condition ? a : b` | Choose one value depending on a condition |
| `condition && <p>Text</p>` | Render the paragraph when the condition is truthy |
| `value?.property` | Read a property only if the value is not `null` or `undefined` |
| `value || fallback` | Use the fallback when the first value is falsy |
| `...messages` | Copy the entries from an array into another array |
| `question => send(question)` | A short function taking `question` as its argument |
| `async` and `await` | Work with operations that finish later, such as network requests |

## 6. Understand Next.js pages and the shared layout

### Routes follow the folder structure

Next.js’s App Router uses special filenames:

| File | Result |
| --- | --- |
| `src/app/page.tsx` | Home page at `/` |
| `src/app/work/page.tsx` | Portfolio page at `/work` |
| `src/app/api/chat/route.ts` | Server endpoint at `/api/chat` |
| `src/app/not-found.tsx` | A screen shown for an unknown page |

A **route** is the address or path that the app responds to. A page route produces a user interface. The chat route returns JSON data.

### The shared layout

[`layout.tsx`](src/app/layout.tsx) wraps every page. Here is its return value, reformatted:

```tsx
return (
  <html lang="en-GB" className={`${sans.variable} ${display.variable}`}>
    <body>
      {children}
      <CareerChat />
    </body>
  </html>
);
```

`children` is the page being displayed. `<CareerChat />` sits alongside it, which makes the floating chat available on the home and portfolio pages. It is also part of the missing-page screen because that uses the same root layout.

The `lang` attribute declares the document’s language. The font variables come from `next/font/local`, which loads the font files already included in `src/fonts`.

The layout also exports `metadata`, including the browser-tab title and page description. These values help describe the page to browsers and services that generate link previews. They are separate from the visible `<h1>` heading.

### Server Components and Client Components

Pages and layouts are Server Components by default. Next.js can render their content on the server, including during the build. Interactive components start with:

```tsx
"use client";
```

You will find that line in `career-chat.tsx`, `orbit.tsx` and `site-shell.tsx`. These components need browser-side behaviour.

A Client Component can still contribute to the initial server-rendered HTML. The browser then receives JavaScript that activates its interactions. That activation is called **hydration**. See the [Next.js explanation of the component boundary](https://nextjs.org/docs/app/getting-started/server-and-client-components).

The directive is not a statement that a file only ever renders in the browser. It establishes a boundary for the client-side component code and its imported dependencies.

The server’s OpenAI module is imported by an API route, not by the chat component. The key is read there. The directory name `server` is an organisational convention; the server-side import path is what keeps this code out of the browser in the current implementation.

## 7. Review the content and home page

Start with [`src/lib/content.ts`](src/lib/content.ts), then open [`src/app/page.tsx`](src/app/page.tsx).

### Data is separate from some of its presentation

The `experience` array holds career facts such as company names, roles and dates. The page describes how to display those facts.

An excerpt from one entry:

```ts
{
  company: "Oliver James",
  role: "Head of Product",
  period: "Nov 2025 to present",
  year: "2025",
  current: true,
  summary: "Responsible for product and AI strategy.",
  // description, details and tags follow in the actual object
}
```

`current: true` is a boolean. Unlike `"true"`, which is text, `true` represents a logical yes/no value.

Not all content is centralised yet. The hero heading and About paragraphs are written directly in `page.tsx`. Changing `profile.role` will affect the AI context, but it will not rewrite a hardcoded heading. Always check where the value is used.

### Rendering repeated content with `.map()`

The timeline uses `experience.map(...)`. `map` takes each array item and produces a corresponding result, which is JSX here.

This is a shortened excerpt of the existing pattern:

```tsx
{experience.map((item, i) => (
  <details
    key={`${item.company}-${i}`}
    className={`career-entry ${item.current ? "current-role" : ""}`}
    open={item.current || undefined}
  >
    <summary>
      <span>{item.company}</span>
      <span>{item.role}</span>
    </summary>
    <p>{item.description}</p>
  </details>
))}
```

`item` is the current career entry, and `i` is its array position. Backticks create a template string; `${...}` inserts a value into it.

`key` helps React distinguish one repeated item from another. It is not visible content. The current timeline combines company and array position; a permanent entry ID would be easier to maintain when rearranging entries.

### Expandable entries use native HTML

`<details>` and `<summary>` supply the expandable behaviour. The browser handles opening and closing the entry, including keyboard activation. We did not need to write a React state variable for every job.

The current role starts open. Other entries start closed. The CSS then styles the summary, timeline line and expansion indicator.

An optional list is rendered only when it has entries:

```tsx
{item.details.length > 0 && (
  <ul>
    {item.details.map(detail => <li key={detail}>{detail}</li>)}
  </ul>
)}
```

That prevents an empty bullet list appearing under roles without additional details.

### Links can target a page or a section

```tsx
<a href="/work">Portfolio</a>
<a href="#journey">My career</a>
```

The first opens another route. The second targets the element with `id="journey"` on the current page.

A portfolio card links to a destination such as `/work#ai-in-practice`. The part after `#` identifies an existing article on `/work`. It is not a separate `/work/ai-in-practice` page.

The code also uses Next.js’s `<Link>` component in places such as the header. It supports client-side navigation. Ordinary `<a>` links can perform a full page navigation. Both are present in this project, which matters when considering whether React state survives navigation.

## 8. Understand the styling

Open [`globals.css`](src/app/globals.css) for the website and [`career-chat.css`](src/components/career-chat.css) for the chat. Some of the main stylesheet is compressed onto long lines. The examples below expand those rules to make them easier to read.

### Selectors and declarations

```css
.button-primary {
  color: var(--bg);
  background: var(--accent);
}
```

`.button-primary` is a selector matching elements with that class. Each declaration pairs a property, such as `background`, with a value. Semicolons separate declarations.

### Shared colour variables

The stylesheet defines values on `:root`:

```css
:root {
  --bg: #171917;
  --paper: #eeeae1;
  --text: #eeeae1;
  --accent: #e7b48f;
}
```

`var(--accent)` reads the shared accent colour. Changing it affects the elements that refer to it. Some artwork colours are written directly into SVG or other CSS rules, so this one variable does not control every copper-coloured pixel.

### The box model

An element occupies a rectangular box. Its content is surrounded by padding, then a border. Margin controls the space outside the box.

The project applies `box-sizing: border-box` to all elements. With that rule, a declared width includes padding and borders. This makes layout calculations more predictable.

### A centred container

The main content uses this rule:

```css
.container {
  width: min(1240px, calc(100% - 112px));
  margin-inline: auto;
}
```

`100%` refers to the available width. `calc()` subtracts space for the sides. `min()` chooses the smaller width, so the container stops growing at 1240 pixels. Automatic inline margins centre it.

Smaller-screen rules change those side spaces. The site is not one fixed-width desktop page squeezed onto a phone.

### Grid and responsive layouts

The portfolio cards use CSS Grid:

```css
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 27px;
}
```

`1fr` means a share of the available space. Here, the three columns receive equal shares.

At a smaller viewport width, the actual stylesheet changes the layout:

```css
@media (max-width: 600px) {
  .project-grid {
    grid-template-columns: 1fr;
    gap: 33px;
  }
}
```

A **media query** applies rules when its condition matches. This one produces a single column on narrow screens. Resize the browser and watch the cards move below one another.

### Flexbox keeps the chat composer visible

The chat panel uses a vertical Flexbox layout:

```css
.chat-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.chat-transcript {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
```

The transcript takes the remaining height between the header and composer. It scrolls when there are too many messages. `min-height: 0` allows it to shrink rather than forcing the whole panel beyond the viewport.

### Motion and focus

The orbital artwork moves gently, and sections reveal as they enter view. The styles also respect `prefers-reduced-motion`, a preference a visitor can set in their operating system or browser.

`:focus-visible` adds a visible outline when navigating with a keyboard. This lets someone see which control will respond when they press Enter or Space.

### These CSS files use global class names

`career-chat.css` is a separate file, but its selectors are still global. It is not a CSS Module. The `chat-` prefixes reduce the chance of matching unrelated elements.

During development, one illustration’s class collided with another rule. Giving the artwork wrapper a distinct `variant-` class fixed the collision. A separate file alone does not guarantee that CSS is isolated.

## 9. Review the navigation and other interactions

[`site-shell.tsx`](src/components/site-shell.tsx) exports several components used on different pages.

### Header props and menu state

```tsx
export function Header({ work = false }: { work?: boolean }) {
  const [open, setOpen] = useState(false);
  // Remaining implementation follows in the source file.
}
```

`work?: boolean` makes the prop optional. The default value is `false`. `<Header work />` passes `true` on the portfolio page, so section links can point back to the home page.

`useState(false)` creates a value React remembers between renders. `open` reads that value. Calling `setOpen(true)` requests an update, and React renders the component with the new state. The [React state reference](https://react.dev/reference/react/useState) provides more examples.

The mobile menu button uses the state to show or hide the menu. `aria-expanded` reports its state to assistive technology. An Escape-key listener closes it, and an effect removes that listener when it is no longer needed.

### Copying the email address

The contact section uses:

```ts
await navigator.clipboard.writeText(profile.email);
```

`navigator` is a browser object. Clipboard writing is asynchronous, so the function waits for success before displaying “Email copied”. If the browser refuses, the component displays a fallback instruction.

The ordinary email link also remains available. A `mailto:` link opens an email application; this website does not receive or send that email itself.

### Revealing sections

`RevealObserver` uses `IntersectionObserver`, a browser feature that reports when an element enters the visible area. It adds an `is-visible` class, and CSS transitions the section into view.

The component observes elements carrying `data-reveal`. `data-` attributes are a way to attach custom information to HTML elements. The observer stops watching an element once it has been revealed.

The initial page content is not hidden by default. The observer adds the class that prepares the animation after JavaScript runs. That is preferable to relying on JavaScript to make all content readable in the first place.

## 10. Understand the illustrations and local assets

### The orbital illustration

[`orbit.tsx`](src/components/orbit.tsx) combines an SVG illustration with three focus buttons. Choosing a button changes the active state, caption and visual treatment.

An SVG’s `viewBox="0 0 520 500"` defines its coordinate system. The browser can scale the graphic while preserving its proportions. Elements such as `<circle>` and `<ellipse>` describe shapes within that coordinate system.

The component uses `useId()` for unique gradient identifiers. Without unique IDs, multiple copies of an SVG could accidentally refer to the same gradient definition elsewhere in the document.

The point field is a local asset:

```tsx
<image
  className="point-sphere"
  href="/images/point-sphere.svg"
  x="0"
  y="0"
  width="520"
  height="500"
/>
```

Inside SVG, `<image>` embeds another image. The file lives under `public/images`, but the browser URL does not contain `public`.

### Why there is a generator script

[`generate-orbit.mjs`](scripts/generate-orbit.mjs) calculates coordinates for 42 rings, with 76 points per ring. That produces 3,192 circles in a generated SVG file.

The browser still draws those circles, but React does not create and hydrate thousands of separate circle components for each visit. Generating an asset reduced the amount of interactive component work.

You do not need to understand the trigonometry to change the page copy. If you edit the generator, regenerate the asset from the `site` directory:

```powershell
node scripts/generate-orbit.mjs
```

The generated SVG is committed so ordinary setup does not require running this script.

### Portfolio artwork

[`project-art.tsx`](src/components/project-art.tsx) takes a `type` prop and chooses the appropriate decorative markup. Its `aria-hidden` attribute marks the artwork as decorative; the accompanying project heading supplies the useful information.

### Local fonts

[`prepare-assets.py`](scripts/prepare-assets.py) downloads variable font files and their open-source licences. A variable font can represent a range of font weights within one file.

The script is a development helper. It does not run for every visitor, and Python is not required just to run the already-prepared website. The browser receives fonts from the local app rather than requesting them from Google Fonts at runtime.

The font preparation was corrected during development after checking that the downloaded files actually contained variable-font data. A filename ending in a particular extension is not enough to prove that a file has the expected contents.

## 11. Review the chat interface

Open [`src/components/career-chat.tsx`](src/components/career-chat.tsx). This file controls what visitors see when they use the floating chat button. It does not call OpenAI directly.

### State describes the current interface

The component starts with these state variables:

```tsx
const [open, setOpen] = useState(false);
const [messages, setMessages] = useState<DisplayMessage[]>([]);
const [input, setInput] = useState("");
const [busy, setBusy] = useState(false);
const [error, setError] = useState("");
const [failedQuestion, setFailedQuestion] = useState("");
```

| State | Purpose |
| --- | --- |
| `open` | Whether the dialog should be open |
| `messages` | The conversation currently displayed |
| `input` | What the visitor is typing |
| `busy` | Whether a reply is being requested |
| `error` | A message explaining a failed request |
| `failedQuestion` | The question to resend if the visitor chooses Retry |

`DisplayMessage[]` means “an array of DisplayMessage objects”. The display type extends the shared message type:

```ts
type DisplayMessage = ChatMessage & { failed?: boolean };
```

Here `&` combines the two shapes. `failed?` is an optional property that belongs to the interface’s bookkeeping, not to the OpenAI conversation format.

### Refs hold values that do not need to trigger rendering

```tsx
const dialogRef = useRef<HTMLDialogElement>(null);
const inputRef = useRef<HTMLTextAreaElement>(null);
const requestRef = useRef<AbortController | null>(null);
const sequence = useRef(0);
```

A **ref** stores a value across renders. Changing `ref.current` does not, by itself, request a new render.

`dialogRef` and `inputRef` point to actual browser elements. `requestRef` holds the controller for the current request. `sequence` helps identify whether a response still belongs to the active conversation.

Use state when a value affects what should be displayed. Use refs for handles or other values that must survive without causing an update to the screen.

### Effects coordinate React with the browser

The dialog is opened using the browser’s `showModal()` method. A `useEffect` coordinates that browser operation with React’s `open` state.

An excerpt:

```tsx
if (!dialog.open) dialog.showModal();

const previousOverflow = document.body.style.overflow;
document.body.style.overflow = "hidden";

const frame = requestAnimationFrame(() => {
  inputRef.current?.focus({ preventScroll: true });
});

return () => {
  document.body.style.overflow = previousOverflow;
  cancelAnimationFrame(frame);
};
```

The effect stops the background page scrolling and focuses the question field. `requestAnimationFrame` schedules the focus change around the browser’s next rendering opportunity.

The returned function is **cleanup**. It restores the old scrolling behaviour when the effect is cleaned up. Without cleanup, closing a dialog could leave the whole page unable to scroll.

The native modal dialog helps constrain keyboard focus to the dialog. It can close with Escape, and its close event updates React state. Other code scrolls the transcript when messages change and aborts a pending request when the component unmounts.

### The question field is controlled by React

This excerpt shows the connection between the text field and state:

```tsx
<textarea
  id="career-question"
  value={input}
  maxLength={CHAT_MESSAGE_LIMIT}
  onChange={event => setInput(event.target.value)}
  onKeyDown={keyDown}
  disabled={busy}
/>
```

`value={input}` makes React state the current value of the field. When the visitor types, `onChange` receives an event and updates that state.

This is called a **controlled input**. It lets the component clear the field after sending or disable it while a reply is pending.

The form’s submit handler calls `event.preventDefault()`. This prevents the browser’s normal form submission from navigating away or reloading the page. The app sends its own request instead.

Enter sends the question. Shift + Enter allows a new line. The handler also checks `isComposing` so it does not submit in the middle of composing text with an input method.

### Follow the `send()` function

The function begins by checking the question:

```ts
const content = question.trim();
if (busy || !content || content.length > CHAT_MESSAGE_LIMIT) return;
```

`trim()` removes whitespace from the ends. The checks prevent an empty question or a second submission while another request is pending. The server repeats important checks because browser-side code can be bypassed.

The component prepares a new conversation array:

```ts
const base = messages.filter(message => !message.failed);
const next: DisplayMessage[] = [
  ...base,
  { role: "user", content },
];
```

`filter` keeps successful messages. The spread operator copies those entries into a new array, followed by the new user message. Creating a new array is important: React state should be replaced rather than mutated with operations such as `messages.push(...)`.

Next, the component displays the question immediately, clears the input and sets `busy` to `true`. The visitor sees that something is happening before the remote answer arrives.

### Sending JSON to your server

The request itself is:

```ts
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: next.slice(-CHAT_HISTORY_LIMIT).map(message => ({
      role: message.role,
      content: message.content,
    })),
  }),
  signal: controller.signal,
});
```

`fetch` makes an HTTP request. `POST` sends data to be processed. `JSON.stringify` converts the JavaScript object into JSON text, and the content-type header tells the server how to interpret it.

There is no API key in this request. The visitor’s browser only sends conversation messages to your app.

`CHAT_HISTORY_LIMIT` is 21. The final 21 messages can represent ten completed question-and-answer exchanges plus the new question. The full visible conversation may be longer; the model only receives the recent window.

The server also has a total character limit, so a conversation made up of long messages can require a reset before it reaches that number of exchanges.

### Handle success and failure separately

`fetch` does not throw an exception just because a server returns a status such as 429 or 503. The code must check `response.ok`:

```ts
const data = await response.json().catch(() => null);

if (!response.ok) {
  throw new Error(
    typeof data?.error === "string"
      ? data.error
      : "The chat is unavailable. Please try again."
  );
}

if (typeof data?.message !== "string" || !data.message.trim()) {
  throw new Error("No answer came back. Please try again.");
}
```

The successful answer is appended as a message with `role: "assistant"`.

On failure, `catch` marks the latest question as failed and shows an error. Retrying replaces that failed question rather than displaying it twice. `finally` releases the busy state and returns focus to the input when the request is still current.

You may notice `void send(input)` in event handlers. `send` returns a Promise because it is asynchronous. `void` makes it explicit that the handler is not using that return value; the error handling is already inside `send`.

### Stopping requests and ignoring late replies

`AbortController` lets the app cancel its pending fetch. The Stop button calls `abort()` on that controller.

Cancellation alone does not solve every timing problem. Consider this sequence:

1. A visitor asks a question.
2. They choose Start a new chat before the reply arrives.
3. The old request finishes while the new conversation is displayed.

Without another check, the old reply could appear in the new conversation. The component increments a sequence number when resetting and compares it after asynchronous work:

```ts
if (requestId !== sequence.current) return;
```

That line means “ignore this result if another conversation has replaced the one that requested it”. Stopping a request does not undo work the remote service has already performed.

### Conversation persistence and safe display

Closing the dialog preserves its React state while the component remains mounted. Reset clears it. Reloading the page clears it too. A full navigation through an ordinary link can also reset it; the app does not use local storage or a database for conversations.

Replies are rendered as text:

```tsx
<p>{message.content}</p>
```

React escapes text inserted this way. A reply containing `<img ...>` is displayed as text rather than creating an image element. The component does not use `dangerouslySetInnerHTML` to interpret model output as HTML.

`white-space: pre-wrap` in the stylesheet preserves line breaks in answers. The model is asked to use plain text, so there is no Markdown-rendering library involved.

## 12. Follow a request through the server

Now open [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts).

### The route is a small entry point

```ts
import { handleCareerChat } from "@/lib/server/career-chat";

export const runtime = "nodejs";
export const maxDuration = 65;

export async function POST(request: Request) {
  return handleCareerChat(request, {
    apiKey: process.env.OPENAI_API_KEY,
    expiresAt: process.env.OPEN_AI_EXPIRATION,
  });
}
```

The exported function’s name tells Next.js that it handles POST requests. `request` describes the incoming HTTP request. `process.env` reads configuration available to the Node.js server.

`maxDuration` is a deployment-related configuration value; it does not replace the explicit timeout in the OpenAI request. Hosting platforms can impose their own limits.

The route passes its settings into a separate handler. This makes the logic easier to test without starting a browser or using a real API key.

### Validate before contacting OpenAI

[`src/lib/server/career-chat.ts`](src/lib/server/career-chat.ts) performs the following checks before making a provider request:

| Check | Reason |
| --- | --- |
| Origin and cross-site headers | Reject obvious requests coming from another website |
| JSON content type and valid JSON | Ensure the server can understand the submitted data |
| Body size of at most 48,000 bytes | Stop an oversized request while reading it |
| Between 1 and 21 messages | Bound the conversation window |
| Alternating user and assistant roles, ending in a user question | Enforce the expected conversation shape |
| User text up to 2,000 characters; assistant text up to 6,000 | Bound individual message sizes |
| Total history up to 28,000 characters | Bound the complete submitted conversation |
| A configured, nonblank key | Avoid an unauthenticated provider request |
| A valid future expiry, when configured | Honour the application’s cutoff |
| At most ten requests per client per minute | Reduce repeated API calls |

Bytes, characters and tokens are different measurements. Bytes measure encoded request data. Characters measure text length in the application. Tokens are the pieces of text processed by the model. A 900-token limit is not the same as a 900-character limit.

The body is read in chunks using a reader and `TextDecoder`. The code counts incoming bytes rather than assuming a request’s declared length is accurate. `finally` releases the reader when it finishes or fails.

The `isMessage` function is a **type guard**: it checks an unknown value’s actual structure and tells TypeScript when it can be treated as a `ChatMessage`.

The server accepts user and assistant messages from the browser, but not a system message supplied by the browser. It creates its own instructions. A forged browser request cannot select a different model or provide a replacement credential through the JSON body.

Origin checks are not authentication. Someone making a direct HTTP request outside a browser can still contact a publicly reachable endpoint. This distinction matters before publishing an app that uses a paid API.

### Read the rate limiter

`ChatRateLimiter` is a class holding a `Map`, a collection of keys and values. It stores a request count and an expiry time for each client.

Old entries are removed. A new window lasts 60 seconds. Once the count reaches ten, another request receives a wait time instead of contacting OpenAI.

This is process-local memory. Restarting the server resets it, and another server instance would have its own separate counters. The current client identifier also depends on request headers, which need a trusted proxy arrangement in a public deployment.

### The actual OpenAI call

This is the central request, with some surrounding error handling omitted:

```ts
const response = await (dependencies.fetchImpl || fetch)(
  "https://api.openai.com/v1/responses",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${dependencies.apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CAREER_MODEL,
      instructions: careerSystemPrompt(),
      input: messages.map(message => ({
        role: message.role,
        content: message.content.trim(),
      })),
      temperature: 0.3,
      max_output_tokens: 900,
      store: false,
      stream: false,
    }),
    cache: "no-store",
    signal: AbortSignal.any([
      request.signal,
      AbortSignal.timeout(TIMEOUT_MS),
    ]),
  }
);
```

Here is how to read its main settings:

| Setting | Meaning |
| --- | --- |
| `Authorization` | Authenticates the server to OpenAI using the private key |
| `model` | Selects `gpt-4.1-mini`, the value of `CAREER_MODEL` |
| `instructions` | Supplies the career context and response rules |
| `input` | Supplies the recent conversation |
| `temperature` | Requests a relatively low-variation response; it does not guarantee accuracy |
| `max_output_tokens` | Caps the generated output at 900 tokens |
| `store: false` | Disables stored Responses state for this request |
| `stream: false` | Requests the whole answer rather than displaying text as it is generated |
| `cache: "no-store"` | Tells this fetch not to use the Next.js data cache |

`TIMEOUT_MS` is 60,000 milliseconds, or one minute. `AbortSignal.any` combines the incoming request’s cancellation signal with the timeout.

`dependencies.fetchImpl || fetch` is a testing seam. Normal requests use `fetch`. Tests supply a substitute function that returns a controlled response. Passing in a dependency is often called **dependency injection**.

The [OpenAI text-generation guide](https://developers.openai.com/api/docs/guides/text) describes the Responses API. The exact request for this project is in the source linked above. Switching to a different model may require reviewing which request settings it supports.

### Extract the text from the response

The raw Responses API returns an `output` array. It can include items other than a final assistant message. The handler keeps assistant message items and their `output_text` parts:

```ts
.filter(item => item?.type === "message" && item.role === "assistant")
.flatMap(item => Array.isArray(item.content) ? item.content : [])
.filter(part => part?.type === "output_text" && typeof part.text === "string")
.map(part => part.text)
.join("\n")
.trim()
```

This excerpt leaves out the TypeScript annotations for readability. `flatMap` collects the content arrays into one array. The subsequent operations select text and combine it into the answer.

The handler does not send the full provider response to the browser. It returns a small object:

```ts
return Response.json(
  { message: answer, model: CAREER_MODEL },
  { headers }
);
```

`Response.json` creates an HTTP response containing JSON. An HTTP 200 response means the request succeeded; it does not prove every factual statement in a generated answer is correct.

### Errors have useful, safe responses

The handler catches failures and returns messages the interface can display. It avoids returning raw upstream error messages, which could contain provider details that visitors do not need.

| Status used by this app | Typical meaning |
| --- | --- |
| 400 | Invalid JSON or message structure |
| 403 | An origin or cross-site check failed |
| 413 | Request body too large |
| 415 | Unsupported content type |
| 429 | Too many requests, locally or at the provider |
| 502 | Empty or incomplete provider output |
| 503 | Missing configuration, expired cutoff or a provider/account problem |
| 504 | Timeout or cancellation reported during the provider call |

The app treats OpenAI’s `insufficient_quota` response as a site-owner configuration issue rather than suggesting that a visitor can solve it by repeatedly retrying. For temporary rate limits, it preserves a suitable `Retry-After` header when available. The current interface offers manual Retry; it does not display a countdown based on that header.

### Where the key belongs

The environment value is read in the server route. It should never be added to the request body in `career-chat.tsx` or put in a variable beginning with `NEXT_PUBLIC_`, which Next.js uses for browser-exposed values.

The `.gitignore` excludes `.env*`. You can check that with:

```powershell
git check-ignore .env
```

If it prints `.env`, the ignore rule applies. Ignoring a file does not remove it from history if it was previously committed, and it is not a substitute for keeping server secrets out of client-side code.

`store: false` is also not a claim that every form of provider-side data retention is disabled. The app does not store transcripts itself; OpenAI’s service has its own [API data policies](https://developers.openai.com/api/docs/guides/your-data).

## 13. Understand what the digital twin knows

Open [`career-context.ts`](src/lib/server/career-context.ts).

The `careerProfile` object combines the shared `profile` and `experience` data with education and a few additional professional notes. `careerSystemPrompt()` places that information inside a longer instruction string using:

```ts
${JSON.stringify(careerProfile)}
```

Inside a template string, `${...}` inserts the result of an expression. Here it inserts a JSON representation of your profile.

The instructions ask the model to answer in the first person while identifying itself as an AI representation when appropriate. They also require it to acknowledge missing information and avoid inventing achievements. Your preference for direct copy is included in the writing instructions.

This is **context supplied at request time**. We have not trained or fine-tuned a new model. There is no vector database, document search or automatic LinkedIn lookup. The model does not open your PDF or read `.env` to answer career questions.

The profile and instructions are sent again with each question. Recent messages supply conversational context, so a question such as “When did you start that role?” can refer to the previous answer. Once an exchange falls outside the submitted history window, it is no longer supplied to the model.

The text “Checking my career profile…” in the interface is a loading message. It does not mean a separate search engine or live LinkedIn query is running.

### The limits of prompt instructions

Instructions influence generated behaviour; they are not a guarantee that a model will always comply. A model can still produce an incorrect claim or follow a misleading request. Earlier assistant messages should not be treated as newly verified biography.

The profile deliberately excludes private facts such as salary. The safest answer to a question the profile cannot answer is an honest acknowledgement, with a way to contact you directly.

Updating career entries in `content.ts` updates the context that imports them after the application uses the new code. Education is currently duplicated between the home page and this context file, so updating one location alone will not update the other. This is one of the issues identified in the final self-review.

## 14. Understand the tests

The project’s tests are in three files:

| File | What it checks |
| --- | --- |
| [`site.spec.ts`](tests/site.spec.ts) | Navigation, career entries, contact actions and page layouts |
| [`chat.spec.ts`](tests/chat.spec.ts) | Chat interactions in a browser |
| [`chat-api.spec.ts`](tests/chat-api.spec.ts) | Server logic and its provider request contract |

At the last functional verification, **34 test executions passed**. There are 17 named tests, run under both desktop and mobile projects. The server-only tests are also repeated because of that shared configuration; the number does not mean there are 34 different user journeys.

### A browser test

An excerpt from the chat test:

```ts
await page.goto("/");
await page.getByRole("button", {
  name: "Chat with Alec’s digital twin",
}).click();

const dialog = page.getByRole("dialog", {
  name: "Alec’s digital twin",
});

await expect(dialog).toBeVisible();
await expect(page.getByLabel("Your question")).toBeFocused();
```

`page` is a browser tab controlled by Playwright. `await` waits for the operation or assertion. An assertion states what must be true for the test to pass.

Locating a control by its role and name also encourages us to give it an accessible label. It is easier to understand than identifying “the fifth button inside the third div”.

### Mocked responses

The repeatable browser tests intercept `/api/chat`:

```ts
await page.route("**/api/chat", async route => {
  await route.fulfill({
    json: { message: "I lead product at Oliver James." },
  });
});
```

This is a **mock**: the test supplies a predictable answer instead of contacting OpenAI. That lets us test the interface without spending API tokens or depending on a remote service’s availability.

A mock passing does not prove OpenAI is available. The server tests separately inspect the endpoint, instructions and JSON request format using an injected fetch function. They also check invalid inputs and expiry handling.

The tests cover retry behaviour, stopping a reply and ignoring a late response after Reset. A test supplies HTML-looking model text and verifies that it is not interpreted as an image element.

### Run checks yourself

With no other TypeScript-related command running, you can check types:

```powershell
npm run typecheck
```

This checks types without producing a separate JavaScript output tree. A production build also checks TypeScript as part of its work:

```powershell
npm run build
```

To run browser tests, have the app serving at port 3100, then use another terminal:

```powershell
npm run test:e2e
```

If the required Chromium browser is missing:

```powershell
npx playwright install chromium
```

`playwright.config.ts` defines the base URL and viewport sizes. It does not start the app automatically. The mobile project changes the browser’s viewport and mobile-related behaviour; it is not the same as testing on a physical iPhone or Android phone.

If a test fails, read the named expectation and the saved error context in `test-results`. The configuration retains traces on failure so you can inspect what happened.

### A live smoke check

For an explicit test against OpenAI, with a configured server running:

```powershell
node scripts/check-career-chat.mjs
```

This sends three real questions. It exercises a follow-up and a question about information absent from the profile. It prints answers and stops on a provider error. It uses billable API tokens.

The script checks for a nonempty answer and the expected model identifier. Reviewing whether the answers are factually correct is still necessary. It is a small smoke check, not an exhaustive evaluation of the twin.

`scripts/capture.mjs` and `scripts/capture-chat.mjs` save screenshots for visual review. The chat screenshot script uses a mocked answer. Screenshots help find layout issues that type checks cannot detect.

This documentation task does not require another paid live call; it explains the implementation and its existing verification tools.

## 15. Try small changes yourself

Use a working branch and change one thing at a time. These exercises are changes for you to try, not changes this tutorial has made to the app.

### Exercise A: change a visible sentence

Open `src/app/page.tsx`. Find this sentence in the hero:

```tsx
<p>
  I lead product at Oliver James. My work includes deciding where AI is
  useful and helping our teams adopt it.
</p>
```

The source is currently written on one line, but it represents the same markup. Rewrite it in your own words, save the file and check the browser.

Expected result: the sentence changes, but the heading and career entries do not. This sentence is not imported by the AI context, so changing it does not automatically teach the twin a new fact.

### Exercise B: update a shared career summary

Open `content.ts` and find the Head of Product entry’s `summary`. Make a small factual wording change.

Expected result: the text appears in the expanded career entry. The server context also imports the updated experience array. In production mode, rebuild and restart before expecting either side to use edited source.

Check that you have changed text inside quotes without deleting a comma or closing brace.

### Exercise C: adjust the accent colour

Open `globals.css` and change `--accent` to another valid colour. For example:

```css
--accent: #d9c291;
```

Expected result: elements using that variable change colour. Some illustration colours remain unchanged because they are defined separately.

Use the browser’s responsive preview and keyboard navigation to check that text and focus indicators remain readable.

### Exercise D: replace a suggested question

Open `src/lib/chat.ts`. Change one entry in `careerQuestions` to a question the existing career profile can answer.

Expected result: a different suggestion appears in a new chat. The model still uses the same verified profile. A suggested question is a shortcut, not a factual source.

Finish by reviewing your changes:

```powershell
git diff
npm run typecheck
```

If you deliberately change text that a test locates by name, update that test to use the new text while preserving the behaviour it checks.

## 16. Debug common problems

Debugging means finding the cause of a problem rather than changing unrelated code until the symptom disappears.

### Use the right place to look

| Tool | Useful for |
| --- | --- |
| Browser Elements panel | Inspecting rendered HTML and applied CSS |
| Browser Console | Browser-side JavaScript errors |
| Browser Network panel | Seeing `/api/chat` requests and responses |
| Server terminal or server log | Build errors and server-side failures |
| TypeScript output | Type errors and missing imports |
| `git diff` | Seeing exactly what your edits changed |

In a Chromium browser, press F12 or use the browser menu to open developer tools. In the Network panel, filter for `chat`, send a question and inspect the request and response. The browser request should contain conversation messages, not your OpenAI credential.

### “My edit is not appearing”

Confirm you saved the file. Then check whether you are running development mode or an older production build. Stop the production server before rebuilding and starting it again. Also check that the browser is using port 3100 and that you edited the correct file.

### “Port 3100 is already in use”

Another process is already listening on that port. Often it is a server from an earlier terminal or the background server we started. Stop the known server rather than starting several copies or terminating unrelated Node.js processes.

### “The chat isn’t configured yet”

Check the exact key name `OPENAI_API_KEY` and that `.env` is in the `site` directory. Save the file and restart the server. A valid OpenRouter credential is not an OpenAI credential.

Do not put the key in React markup or paste it into an error report.

### “The chat service needs attention from the site owner”

Possible causes include an expired cutoff, an invalid key or an account quota issue. The app intentionally shows a generic public message. First check your local configuration and account status rather than repeatedly clicking Retry.

### “The chat service is busy”

The local or provider request limit may have been reached. Wait before retrying. A failed question remains available to resend without being duplicated in the transcript.

### “The chat opens, but no model text appears”

Inspect `/api/chat` in Network. A 502 response can mean the provider returned no answer or an incomplete response. A 503 can mean a provider request failed. If a 200 response has a usable `message`, focus your investigation on the browser component instead.

### A syntax error after editing

Start at the first reported error. A missing quote or brace can cause later lines to look wrong too. Compare the edited section with `git diff` before asking AI to rewrite a whole file.

## 17. Work safely with Git and AI

Git records changes to files. It does not automatically record every keystroke, and pushing a branch does not merge it into `main`.

Before asking for another change:

```powershell
git status
git branch --show-current
```

These show uncommitted work and your current branch. Do not switch away from work you do not understand or discard files simply to get a clean status.

When your current changes are ready to save:

```powershell
git add .
git diff --staged
git commit -m "Describe the change"
```

`git add` prepares a snapshot in the staging area. `git diff --staged` lets you review it. `git commit` records that snapshot in your local history. Files edited again after staging need to be staged again if you want the later edit included.

### Create a branch for a task

When the working tree is clean, create a new branch:

```powershell
git switch -c improve-career-layout
```

The branch starts at your current commit. It is a named reference in the history, not a second project folder. New commits move that branch forward. `main` stays at its existing commit until you update or merge it.

To deliberately start from the latest `main`, first save your current work, then:

```powershell
git switch main
git pull --ff-only origin main
git switch -c improve-career-layout
```

If the pull reports that it cannot fast-forward, stop and inspect the histories. The command has refused to combine diverging histories automatically.

### Upload and review

```powershell
git push -u origin improve-career-layout
```

`origin` is the configured remote repository. `-u` records the upstream relationship so later pushes on that branch can usually use `git push`.

On GitHub, a pull request compares your working branch with a target such as `main`. Reviewing and merging that pull request is a separate step. After a GitHub merge, `git pull --ff-only origin main` updates a suitable local `main` checkout.

Warnings about LF being replaced with CRLF concern line endings. They do not, by themselves, mean `git add` failed. Use `git status` to see what is staged. PowerShell commands in this guide do not need a trailing backslash.

### Give AI a specific request

For example:

> On a new branch, increase the readability of the chat labels on mobile. Keep the API behaviour unchanged. Explain the relevant CSS changes and verify that the close button remains usable at 320 pixels wide.

You can also ask for an explanation before accepting a change:

> Show me which state changes when I click Send, and explain why a ref is used for the AbortController.

After AI makes an edit, read the diff and try the affected behaviour yourself. Passing tests are useful evidence, but they do not replace understanding what changed.

## 18. Useful terms and further reading

| Term | Meaning |
| --- | --- |
| Component | A function describing a reusable part of the interface |
| Prop | A value passed into a component |
| State | A value React remembers that can affect rendering |
| Ref | A stored handle or value that can change without requesting a render |
| Render | Produce the interface description for the current inputs and state |
| DOM | The browser’s in-memory representation of the HTML document |
| Hydration | Activating interactive React behaviour on initial rendered content |
| Route | A path the app responds to |
| Endpoint | A route used to exchange data, such as `/api/chat` |
| JSON | A text format used to exchange structured data |
| Promise | A JavaScript value representing an operation that will finish later |
| Mock | A controlled substitute used in a test |
| Commit | A recorded snapshot in Git’s history |
| Merge | Combining the work represented by different histories |

For the code in this repository, the linked local files are the most specific reference. Official introductions can help when you want more practice:

- [React: your first component](https://react.dev/learn/your-first-component)
- [React: state with useState](https://react.dev/reference/react/useState)
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [OpenAI: text generation](https://developers.openai.com/api/docs/guides/text)

The following self-review concerns the current implementation. These are proposed improvements, not features already added by writing this tutorial.

## 19. Self-review: five improvements

### 1. Make the source easier to maintain

**What I found:** Much of `globals.css` and several components are written on very long lines. The home page and chat component also contain substantial markup and logic in single files. Some test response typing uses `any`, which turns off useful TypeScript checks.

**What I would change:** Apply a consistent formatter, divide large sections into named components, and use explicit types for provider responses. Give career entries and chat messages permanent IDs rather than relying partly or entirely on array positions.

**How to judge the improvement:** A beginner should be able to find and edit one section without reading a large unrelated block. Existing behaviour should continue to pass its tests after the refactor.

### 2. Put professional facts in one shared data model

**What I found:** Career entries are shared between the timeline and AI context, which is useful. However, education is duplicated, and some About text and additional professional notes live in separate files. Those copies can drift apart.

**What I would change:** Define a typed professional profile containing the factual fields needed by both the website and the twin. Render education from that shared data and build the AI context from it. Keep presentation wording separate where that helps, but avoid maintaining duplicate dates or qualifications.

**How to judge the improvement:** Updating an education entry once should update the visible section and the context supplied to the model. A small consistency test should catch missing required fields.

### 3. Improve small-text readability and broaden accessibility checks

**What I found:** Several decorative labels and chat hints are only 7 to 9 pixels. Chat icon buttons are currently 32 pixels wide and 36 pixels high. The native dialog and keyboard checks are a useful start, but the existing tests do not constitute a full accessibility audit.

**What I would change:** Increase the smallest useful text, enlarge interactive targets where space permits, and check colour contrast. Test the dialog and transcript with a screen reader and on a real phone. Add automated accessibility checks to complement the existing keyboard tests.

**How to judge the improvement:** The interface should remain readable when zoomed, controls should be comfortable to activate, and focus and new messages should be understandable without relying on the visual layout.

### 4. Strengthen the API boundary before public hosting

**What I found:** The current limiter is stored in one Node.js process and derives client identity from request headers. There is no authentication or shared quota system. Origin checks and input validation do not prevent all direct calls to a publicly exposed paid endpoint.

**What I would change:** Choose public access rules deliberately, use a shared rate-limit store with a trusted client-identity mechanism, and configure account spending controls. Add operational reporting for safe metadata such as status codes and response times without recording keys or raw conversations.

**How to judge the improvement:** Limits should remain effective across restarts and multiple instances. Repeated provider failures should be visible to the owner without exposing confidential information to visitors.

### 5. Evaluate the twin’s answers systematically

**What I found:** The repeatable tests mostly use controlled responses. The live smoke script checks connectivity and supplies a few questions, but does not comprehensively score factual accuracy. A detailed prompt cannot guarantee that every generated answer stays within the profile.

**What I would change:** Maintain a small evaluation set covering employment dates, role transitions and unsupported personal questions. Include misleading requests that try to invent credentials or override the profile. Check expected facts and appropriate acknowledgements of missing information, then rerun the evaluation when the prompt or model changes.

**How to judge the improvement:** We should be able to compare model or prompt versions using the same cases, identify incorrect claims, and keep evidence of which career questions the twin answers reliably.
