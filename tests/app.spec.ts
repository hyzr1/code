import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
    // Browser QA should be deterministic and must not depend on the host's
    // speech voices or begin advancing while assertions inspect a slide.
    localStorage.setItem("forge.settings.v1", JSON.stringify({
      watch: { autoplay: false, muted: true, engine: "system" },
    }));
  });
});

test("the narrated lesson stays synchronized and within the mobile viewport", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Start the course", exact: true }).click();
  await expect(page.getByText(/Watch · 1 of/)).toBeVisible();

  const sceneButtons = page.getByRole("button", { name: /^Scene \d+$/ });
  const sceneCount = await sceneButtons.count();
  expect(sceneCount).toBeGreaterThan(10);

  // Exercise every rendered state in the opening lesson, including its model
  // and trap visuals and the code walkthrough that used to reveal/highlight
  // lines before the narration reached them.
  for (let index = 0; index < sceneCount; index += 1) {
    await sceneButtons.nth(index).click();
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow, `scene ${index + 1} should not overflow horizontally`).toBe(false);
  }

  await sceneButtons.nth(9).click();
  const focused = page.locator(".stage-line[aria-current='true']");
  await expect(focused).toHaveCount(0);
  await expect(page.locator(".stage-line").first()).toHaveCSS("opacity", "0");

  expect(errors).toEqual([]);
});

test("loads the course without runtime errors", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page).toHaveTitle(/Hyzr Code/);
  await expect(page.getByText("Hyzr Code", { exact: true }).first()).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-accent", "violet");

  if (!isMobile) {
    await expect(page.getByRole("button", { name: "Start the course", exact: true })).toBeVisible();
  }

  expect(errors).toEqual([]);
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(horizontalOverflow).toBe(false);
});

test("ships required offline runtime assets", async ({ request }) => {
  for (const path of ["/manifest.webmanifest", "/sw.js", "/favicon.svg", "/pyodide/pyodide.mjs"]) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should be available`).toBe(true);
  }
});
