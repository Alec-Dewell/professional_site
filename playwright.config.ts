import { defineConfig } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL, headless: true, trace: "retain-on-failure" },
  // Builds and starts the production server automatically. Locally an already
  // running server on the port is reused, so stop it if it serves old code.
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    // A dedicated secret keeps chat signatures stable across server restarts in CI.
    env: {
      CHAT_SIGNING_SECRET: process.env.CHAT_SIGNING_SECRET || "playwright-test-signing-secret",
    },
  },
  projects: [
    // Pure server-logic tests: no browser needed, so run them once only.
    { name: "api", testMatch: /chat-api\.spec\.ts/ },
    {
      name: "desktop",
      testIgnore: /chat-api\.spec\.ts/,
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile",
      testIgnore: /chat-api\.spec\.ts/,
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
