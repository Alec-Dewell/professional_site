import { expect, test } from "@playwright/test";

test("home renders without browser errors and uses local font assets", async ({ page }) => {
  const errors: string[] = [];
  const failed: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("requestfailed", request => failed.push(request.url()));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Alec");
  await expect(page.getByRole("heading", { name: "About me." })).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check("500 16px " + getComputedStyle(document.body).fontFamily.split(",")[0]))).toBe(true);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  for (const art of await page.locator(".project-art").all()) {
    const bounds = await art.boundingBox();
    expect(bounds!.y).toBeGreaterThan(1000);
    expect(bounds!.height).toBeGreaterThan(100);
    expect(bounds!.height).toBeLessThan(500);
  }
});

test("career details expand and orbital controls respond", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".current-role")).toHaveAttribute("open", "");
  const bullhorn = page.locator("details").filter({ has: page.locator(".career-company", { hasText: "Bullhorn" }) });
  await bullhorn.locator("summary").click();
  await expect(bullhorn).toHaveAttribute("open", "");
  await expect(bullhorn.locator(".career-body")).toBeVisible();
  await bullhorn.locator("summary").click();
  await expect(bullhorn).not.toHaveAttribute("open");
  await page.getByRole("button", { name: "People", exact: true }).click();
  await expect(page.getByRole("button", { name: "People", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".orbit-caption")).toContainText("understand how people work");
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

test("contact works and all internal destinations exist", async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Copy email address", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Email copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("alecdewell@gmail.com");
  const broken = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute("href")!).filter(href => href.length > 1 && !document.getElementById(href.slice(1))));
  expect(broken).toEqual([]);
  await expect(page.locator('a[href="mailto:alecdewell@gmail.com"]').first()).toBeAttached();
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
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Career" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeAttached();
    await expect(page).toHaveURL(/#journey$/);
  } else {
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/#about$/);
  }
});

test("responsive layouts have no horizontal overflow, and missing pages return 404", async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/work"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} overflows at ${width}px`).toBe(true);
    }
  }
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Page not found");
});
