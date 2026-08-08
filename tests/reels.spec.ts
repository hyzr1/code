import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
    localStorage.removeItem("hyzr.python-reels.v1");
    localStorage.setItem("hyzr.python-reels.muted", "false");
  });
});

async function openReels(page: import("@playwright/test").Page) {
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open menu" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Python Reels" }).click();
  await expect(page.locator(".reel-card.active")).toBeVisible();
  const unlock = page.getByRole("button", { name: "Tap for sound" });
  if (await unlock.isVisible({ timeout: 1500 }).catch(() => false)) await unlock.click();
}

test("reels stay synchronized through pause, resume, and scroll", async ({ page }) => {
  const errors: string[] = [];
  const audioRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/reels/audio/")) audioRequests.push(request.url());
  });

  await openReels(page);
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThan(.15);
  const beforePause = await page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime);
  await page.locator(".reel-card.active").click({ position: { x: 180, y: 210 } });
  await expect(page.locator(".reel-paused")).toBeVisible();
  const paused = await page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime);
  expect(paused).toBeGreaterThanOrEqual(beforePause - .05);
  await page.waitForTimeout(220);
  expect(await page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeLessThan(paused + .08);

  await page.locator(".reel-card.active").click({ position: { x: 180, y: 210 } });
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThan(paused + .1);

  const firstSource = await page.locator("audio").getAttribute("src");
  await page.locator(".reels-feed").evaluate((feed) => feed.scrollTo({ top: feed.clientHeight, behavior: "instant" }));
  await expect.poll(() => page.locator(".reel-card.active").getAttribute("aria-label")).not.toBe("");
  await expect.poll(() => page.locator("audio").getAttribute("src")).not.toBe(firstSource);
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThan(.1);

  expect(audioRequests.some((url) => url.includes("manifest.json?v=1"))).toBe(true);
  expect(audioRequests.some((url) => /\.ogg\?v=[a-f0-9]+/.test(url))).toBe(true);
  expect(errors).toEqual([]);
});

test("reels fit the viewport and feed controls persist", async ({ page }) => {
  await openReels(page);
  const overflow = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    feed: document.querySelector(".reels-feed")!.scrollWidth > document.querySelector(".reels-feed")!.clientWidth + 1,
  }));
  expect(overflow).toEqual({ page: false, feed: false });

  await page.getByRole("button", { name: "Like" }).click();
  await expect(page.getByRole("button", { name: "Like" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Tune feed" }).click();
  await expect(page.getByRole("dialog", { name: "Tune your feed" })).toBeVisible();
  await page.getByRole("button", { name: /Too advanced/ }).click();
  await expect(page.locator(".reel-toast")).toContainText("foundations");

  const history = await page.evaluate(() => JSON.parse(localStorage.getItem("hyzr.python-reels.v1")!));
  expect(history.liked).toHaveLength(1);
  expect(Object.values(history.feedback)).toContain("hard");
});
