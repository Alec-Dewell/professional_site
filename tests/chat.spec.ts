import { expect, test } from "@playwright/test";

test("career chat answers a suggested question and sends follow-up context", async ({ page }) => {
  const requests: { messages: { role: string; content: string }[] }[] = [];
  await page.route("**/api/chat", async route => {
    requests.push(route.request().postDataJSON());
    expect(route.request().headers()["authorization"]).toBeUndefined();
    await route.fulfill({ json: { message: requests.length === 1 ? "I lead product at Oliver James." : "I became Head of Product in November 2025." } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Chat with Alec’s digital twin" }).click();
  const dialog = page.getByRole("dialog", { name: "Alec’s digital twin" });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Your question")).toBeFocused();
  await dialog.getByRole("button", { name: "What do you do at Oliver James?" }).click();
  await expect(dialog.getByText("I lead product at Oliver James.", { exact: true })).toBeVisible();
  await page.getByLabel("Your question").fill("When did you start that role?");
  await page.getByLabel("Your question").press("Enter");
  await expect(dialog.getByText("I became Head of Product in November 2025.", { exact: true })).toBeVisible();
  expect(requests[1].messages).toEqual([
    { role: "user", content: "What do you do at Oliver James?" },
    { role: "assistant", content: "I lead product at Oliver James." },
    { role: "user", content: "When did you start that role?" },
  ]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Chat with Alec’s digital twin" })).toBeFocused();
  await page.getByRole("button", { name: "Chat with Alec’s digital twin" }).click();
  await expect(dialog.getByText("I became Head of Product in November 2025.", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Start a new chat" }).click();
  await expect(dialog.locator(".chat-message")).toHaveCount(0);
  await expect(dialog.getByText("I’m an AI version of Alec.", { exact: false })).toBeVisible();
});

test("rate limits allow retry without duplicating the question", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/chat", async route => {
    calls++;
    await route.fulfill(calls === 1
      ? { status: 429, json: { error: "The chat service is busy. Please try again later." } }
      : { json: { message: "I studied at the University of Sheffield." } });
  });
  await page.goto("/work");
  await page.getByRole("button", { name: "Chat with Alec’s digital twin" }).click();
  await page.getByLabel("Your question").fill("Where did you study?");
  await page.getByRole("button", { name: "Send question", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("busy");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByText("I studied at the University of Sheffield.", { exact: true })).toBeVisible();
  await expect(page.locator(".chat-message-user")).toHaveCount(1);
  await expect(page.getByRole("dialog").getByRole("alert")).not.toBeAttached();
});

test("a reply can be stopped and a new chat cancels a pending request", async ({ page }) => {
  await page.route("**/api/chat", async route => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    await route.fulfill({ json: { message: "Late answer" } }).catch(() => {});
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Chat with Alec’s digital twin" }).click();
  await page.getByRole("button", { name: "Have you worked with Salesforce?" }).click();
  await page.getByRole("button", { name: "Stop reply", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Reply stopped");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page.getByRole("button", { name: "Start a new chat" }).click();
  await expect(page.locator(".chat-message")).toHaveCount(0);
  await expect(page.locator(".chat-suggestions button")).toHaveCount(4);
});

test("chat fits small screens and renders model text without executing HTML", async ({ page }) => {
  await page.route("**/api/chat", async route => {
    await route.fulfill({ json: { message: '<img src=x onerror="window.chatInjected=true"> A plain text answer.' } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Chat with Alec’s digital twin" }).click();
  const dialog = page.getByRole("dialog");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 700 });
    const bounds = await dialog.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(700);
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await expect(page.getByRole("button", { name: "Close career chat", exact: true })).toBeInViewport();
  }
  await page.getByLabel("Your question").fill("A question");
  await page.getByLabel("Your question").press("Shift+Enter");
  await expect(page.getByLabel("Your question")).toHaveValue("A question\n");
  await page.getByRole("button", { name: "Send question", exact: true }).click();
  await expect(page.locator(".chat-message-assistant")).toContainText("<img");
  await expect(page.locator(".chat-message-assistant img")).toHaveCount(0);
  expect(await page.evaluate(() => "chatInjected" in window)).toBe(false);
});
