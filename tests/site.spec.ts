import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { profile } from "../src/lib/content";

const PAGES = ["/", "/work", "/privacy"];

test("home renders without browser errors and uses local WOFF2 font assets", async ({ page }) => {
  const errors: string[] = [];
  const failed: string[] = [];
  const fonts: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failed.push(request.url()));
  page.on("response", (response) => {
    if (response.request().resourceType() === "font") fonts.push(response.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Alec");
  await expect(page.getByRole("heading", { name: "About me." })).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      document.fonts.check("500 16px " + getComputedStyle(document.body).fontFamily.split(",")[0]),
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  expect(fonts.length).toBeGreaterThan(0);
  for (const font of fonts) expect(font).toMatch(/^http:\/\/127\.0\.0\.1:3100\/.*\.woff2$/);
  for (const art of await page.locator(".project-art").all()) {
    const bounds = await art.boundingBox();
    expect(bounds!.height).toBeGreaterThan(100);
    expect(bounds!.height).toBeLessThan(500);
  }
});

test("career details expand and orbital controls respond", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".current-role")).toHaveAttribute("open", "");
  await expect(page.locator(".career-year").first()).toContainText("2025");
  const bullhorn = page
    .locator("details")
    .filter({ has: page.locator(".career-company", { hasText: "Bullhorn" }) });
  await bullhorn.locator("summary").click();
  await expect(bullhorn).toHaveAttribute("open", "");
  await expect(bullhorn.locator(".career-body")).toBeVisible();
  await bullhorn.locator("summary").click();
  await expect(bullhorn).not.toHaveAttribute("open");
  await page.getByRole("button", { name: "People", exact: true }).click();
  await expect(page.getByRole("button", { name: "People", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".orbit-caption")).toContainText("understand how people work");
  // The orbit's gradients resolve (the old useId workaround is gone).
  const fill = await page.locator(".orbit-svg circle").first().getAttribute("fill");
  expect(fill).toMatch(/^url\(#.+-glow\)$/);
  const id = fill!.slice(5, -1);
  expect(await page.evaluate((gradientId) => !!document.getElementById(gradientId), id)).toBe(true);
});

test("portfolio links lead to actual future collections", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Portfolio", exact: true }).last().click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("My project");
  await expect(page.locator(".collection-entry")).toHaveCount(3);
  await expect(page.locator(".collection-note").first()).toContainText("No entries published yet.");
  await page.goto("/work#building-in-public");
  await expect(page.locator("#building-in-public")).toBeInViewport();
  await page.getByRole("link", { name: "Back to home", exact: true }).click();
  await expect(page).toHaveURL("/");
});

test("M4: internal links navigate client-side without a full page reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => ((window as unknown as { marker: string }).marker = "same-document"));
  await page.locator(".hero-actions").getByRole("link", { name: "Portfolio" }).click();
  await expect(page).toHaveURL(/\/work$/);
  expect(await page.evaluate(() => (window as unknown as { marker?: string }).marker)).toBe(
    "same-document",
  );
});

test("contact works and all internal destinations exist", async ({
  page,
  context,
  browserName,
}) => {
  if (browserName === "chromium")
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Copy email address", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Email copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
  const broken = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href")!)
        .filter((href) => href.length > 1 && !document.getElementById(href.slice(1))),
    );
  expect(broken).toEqual([]);
  await expect(page.locator(`a[href="mailto:${profile.email}"]`).first()).toBeAttached();
});

test("navigation supports mobile and keyboard", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeAttached();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Career" })
      .click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeAttached();
    await expect(page).toHaveURL(/#journey$/);
  } else {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "About" })
      .click();
    await expect(page).toHaveURL(/#about$/);
  }
});

test("responsive layouts have no horizontal overflow, and missing pages return 404", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of PAGES) {
      await page.goto(path);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${path} overflows at ${width}px`,
      ).toBe(true);
    }
  }
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Page not found");
});

test("B2: only the real current page is marked aria-current", async ({ page }) => {
  const current = () =>
    page.locator('[aria-label="Main navigation"] [aria-current="page"]').allTextContents();
  await page.goto("/this-page-does-not-exist");
  expect(await current()).toEqual([]);
  await page.goto("/privacy");
  expect(await current()).toEqual([]);
  await page.goto("/");
  expect(await current()).toEqual([]);
  await page.goto("/work");
  expect(await current()).toEqual(["Portfolio"]);
});

test("B3: the page declares a dark-only colour scheme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", "dark");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(
    "dark",
  );
});

test("B4: the footer year renders without hydration warnings", async ({ page }) => {
  const messages: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) messages.push(message.text());
  });
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator(".copyright")).toHaveText(
      `© ${new Date().getFullYear()} Alec Dewell`,
    );
  }
  expect(messages.filter((text) => /hydrat/i.test(text))).toEqual([]);
});

test("B5: content above the fold is never hidden by the reveal animation", async ({ page }) => {
  // Record every element that ever gets .will-reveal and whether it was on screen.
  await page.addInitScript(() => {
    const hiddenOnScreen: string[] = [];
    (window as unknown as { hiddenOnScreen: string[] }).hiddenOnScreen = hiddenOnScreen;
    new MutationObserver((records) => {
      for (const record of records) {
        const element = record.target as Element;
        if (!element.classList.contains("will-reveal")) continue;
        const bounds = element.getBoundingClientRect();
        if (bounds.top < innerHeight && bounds.bottom > 0) {
          hiddenOnScreen.push(element.className);
        }
      }
    }).observe(document, { attributes: true, attributeFilter: ["class"], subtree: true });
  });
  await page.goto("/work");
  await page.waitForLoadState("networkidle");
  expect(
    await page.evaluate(() => (window as unknown as { hiddenOnScreen: string[] }).hiddenOnScreen),
  ).toEqual([]);
  // Below-the-fold content still reveals when scrolled into view.
  const last = page.locator(".collection-entry").last();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveClass(/is-visible/);
});

test("S4: security headers and a CSP that the pages do not violate", async ({ page }) => {
  await page.addInitScript(() => {
    const violations: string[] = [];
    (window as unknown as { violations: string[] }).violations = violations;
    document.addEventListener("securitypolicyviolation", (event) =>
      violations.push(`${event.violatedDirective} ${event.blockedURI}`),
    );
  });
  const response = await page.goto("/");
  const headers = response!.headers();
  const csp = headers["content-security-policy"];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("connect-src 'self'");
  expect(csp).not.toContain("unsafe-eval"); // production build
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-powered-by"]).toBeUndefined();
  for (const path of [...PAGES, "/this-page-does-not-exist"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Ask my AI About my career" }).click();
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(() => (window as unknown as { violations: string[] }).violations),
      path,
    ).toEqual([]);
  }
});

/** Text that carries meaning (not aria-hidden, not inside an SVG illustration). */
async function smallestMeaningfulText(page: Page) {
  return page.evaluate(() => {
    const offenders: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const element = node.parentElement;
      if (!element || !node.textContent?.trim()) continue;
      if (element.closest('[aria-hidden="true"], svg, script, style, noscript')) continue;
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || bounds.width === 0) continue;
      if (element.closest("dialog:not([open])")) continue;
      const size = parseFloat(style.fontSize);
      if (size < 11) offenders.push(`${size}px "${node.textContent.trim().slice(0, 30)}"`);
    }
    return offenders;
  });
}

test("A1: no meaningful text is smaller than 11px", async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    expect(await smallestMeaningfulText(page), path).toEqual([]);
  }
  await page.getByRole("button", { name: "Ask my AI About my career" }).click();
  expect(await smallestMeaningfulText(page), "chat dialog").toEqual([]);
});

test("A1: automated WCAG 2.2 AA scan finds no violations", async ({ page }) => {
  // Reduced motion shows reveal sections immediately, so contrast is measured
  // on the final colours rather than mid-fade.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const scan = async (label: string) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const summary = results.violations.map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.nodes
          .slice(0, 3)
          .map((node) => node.target.join(" "))
          .join(", ")}`,
    );
    expect(summary, label).toEqual([]);
  };
  for (const path of [...PAGES, "/this-page-does-not-exist"]) {
    await page.goto(path);
    await scan(path);
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Ask my AI About my career" }).click();
  await scan("chat dialog");
});

test("P1: decorative and font assets are lightweight", async ({ request }) => {
  const sphere = await request.get("/images/point-sphere.svg");
  const svg = await sphere.text();
  expect(svg.length).toBeLessThan(60_000);
  expect((svg.match(/<(path|circle)\b/g) || []).length).toBeLessThan(40);
});

test("C2: privacy notice exists, and browsing sets no cookies or third-party requests", async ({
  page,
  context,
}) => {
  const origins = new Set<string>();
  page.on("request", (request) => {
    if (!request.url().startsWith("data:")) origins.add(new URL(request.url()).origin);
  });
  for (const path of PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  await expect(page.getByRole("heading", { name: "The AI career chat" })).toBeVisible();
  await expect(page.getByRole("main").getByText("sent to OpenAI", { exact: false })).toBeVisible();
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  expect([...origins]).toEqual(["http://127.0.0.1:3100"]);
  expect(await context.cookies()).toEqual([]);
});

test("D1: sitemap, robots, canonical and Open Graph image are served", async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/work", "/privacy"]) expect(sitemap).toContain(`127.0.0.1:3100${path}`);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: http://127.0.0.1:3100/sitemap.xml");
  expect(robots).toContain("Disallow: /api/");
  await page.goto("/work");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://127.0.0.1:3100/work",
  );
  const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(ogImage).toMatch(/^http:\/\/127\.0\.0\.1:3100\/opengraph-image/);
  const image = await request.get(ogImage!);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
  expect((await image.body()).length).toBeGreaterThan(5_000);
});
