import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
  });
});

test("Python Reels stays archived but is absent from the live product", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open menu" });
  if (await menu.isVisible()) await menu.click();

  await expect(page.getByRole("button", { name: "Python Reels" })).toHaveCount(0);
  await expect(page.locator(".reels, .reels-feed, .reel-card")).toHaveCount(0);

  // The authored feed and voice assets remain in the repository so the
  // feature can return later without rebuilding it from scratch.
  const manifest = await request.get("/reels/audio/manifest.json");
  expect(manifest.ok()).toBe(true);
  expect(errors).toEqual([]);
});
