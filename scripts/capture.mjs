import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("test-results/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
  ["tablet", 768, 1024],
]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
  for (const [path, title] of [
    ["/", "home"],
    ["/work", "work"],
  ]) {
    await page.goto("http://127.0.0.1:3100" + path);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `test-results/screenshots/${title}-${name}.png`,
      fullPage: true,
    });
    console.log(`${title}-${name}: ${await page.title()}`);
  }
  await page.close();
}
await browser.close();
