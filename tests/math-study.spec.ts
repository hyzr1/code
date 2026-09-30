import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
    localStorage.setItem("forge.settings.v1", JSON.stringify({ watch: { autoplay: false, muted: true, engine: "system" } }));
  });
});

test("math starts with a worked study guide and keeps hints and solutions behind a choice", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/courses/mathematics");
  await expect(page.getByText("Precalculus foundations: functions and mathematical language")).toBeVisible();
  await page.getByRole("button", { name: "Start the course", exact: true }).click();
  await expect(page.getByText("Guided study")).toBeVisible();
  await expect(page.locator(".math-example")).toHaveCount(2);
  await expect(page.locator(".math-practice")).toHaveCount(3);
  const firstPractice = page.locator(".math-practice").first();
  await firstPractice.locator("textarea").fill("4 - x² ≥ 0, so x² ≤ 4");
  await expect(firstPractice.locator("textarea")).toHaveValue("4 - x² ≥ 0, so x² ≤ 4");
  await expect(firstPractice.getByText("Domain: [-2, 2].")).not.toBeVisible();
  await firstPractice.getByText("Need a hint?").click();
  await expect(firstPractice.getByText(/Begin with 4 - x²/)).toBeVisible();
  await firstPractice.getByText("Show full solution").click();
  await expect(firstPractice.getByText(/Domain: \[-2, 2\]/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("math study guide fits mobile and can still open its narrated overview", async ({ page }) => {
  await page.goto("/courses/mathematics");
  await page.getByRole("button", { name: "Start the course", exact: true }).click();
  await expect(page.getByText("Guided study")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
  await page.getByRole("button", { name: "Watch it instead" }).click();
  await expect(page.getByText(/Watch · 1 of/)).toBeVisible();
});

test("later calculus and series lessons open as complete guides", async ({ page }) => {
  for (const [id, heading] of [
    ["math.m6.l6", "Substitution and change of variables"],
    ["math.m10.l10", "Taylor series and approximation error"],
  ]) {
    await page.goto(`/courses/mathematics/lessons/${id}`);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.getByText("Guided study")).toBeVisible();
    await expect(page.locator(".math-example")).toHaveCount(2);
    await expect(page.locator(".math-practice")).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  }
});
