import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("unwashed.onboarding.v1", "done"));
});

test("loads the course without runtime errors", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page).toHaveTitle(/Hyzr Code/);
  await expect(page.getByText("Hyzr Code", { exact: true }).first()).toBeVisible();

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
