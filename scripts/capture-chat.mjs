import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("test-results/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:3100");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Ask my AI About my career" }).click();
  await page.screenshot({ path: `test-results/screenshots/chat-${name}.png` });
  // A labelled screenshot fixture; this never calls a provider or changes app code.
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      json: {
        message:
          "I’m Head of Product at Oliver James, based in Manchester. I’ve been in this role since November 2025. I lead our product team and AI strategy.\n\nBefore that, I was Senior Product Manager at Oliver James. I originally set up the product management function in 2021.",
      },
    }),
  );
  await page.getByRole("button", { name: "What do you do at Oliver James?" }).click();
  await page.locator(".chat-message-assistant").waitFor();
  await page.screenshot({ path: `test-results/screenshots/chat-conversation-${name}.png` });
  await page.close();
}
await browser.close();
console.log("Chat screenshots saved with a mocked career answer.");
