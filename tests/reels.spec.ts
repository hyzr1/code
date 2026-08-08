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
  if (await unlock.waitFor({ state: "visible", timeout: 1800 }).then(() => true).catch(() => false)) {
    await unlock.click();
  }
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
  expect(firstSource).toMatch(/\.(ogg|m4a)\?v=[a-f0-9]+/);
  expect(errors).toEqual([]);
});

test("reels are distraction-free with verbatim captions", async ({ page }) => {
  await openReels(page);
  const overflow = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    feed: document.querySelector(".reels-feed")!.scrollWidth > document.querySelector(".reels-feed")!.clientWidth + 1,
  }));
  expect(overflow).toEqual({ page: false, feed: false });

  await expect(page.locator(".reels-brand, .reels-tabs, .reel-actions, .reel-author, .reel-tags, .reel-footer")).toHaveCount(0);
  const caption = await page.locator(".reel-card.active .reel-caption").evaluate((element) => ({
    spoken: (element as HTMLElement).dataset.narration!.replace(/\s+/g, " ").trim(),
    shown: element.textContent!.replace(/\s+/g, " ").trim(),
  }));
  expect(caption.shown).toBe(caption.spoken);

  await page.getByRole("button", { name: "Mute reels" }).click();
  await expect(page.getByRole("button", { name: "Unmute reels" })).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem("hyzr.python-reels.v1") ?? '{"views":{}}').views,
  )).not.toEqual({});
});
