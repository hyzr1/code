import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
    localStorage.setItem("forge.settings.v1", JSON.stringify({
      appearance: { theme: "dark", reducedMotion: true },
      learning: { course: "swe", language: "python" },
      watch: { autoplay: false, muted: true, engine: "system" },
    }));
  });
});

test("course and problem URLs are directly loadable and preserve browser history", async ({ page }, testInfo) => {
  await page.goto("/courses/dsa");
  await expect(page.getByRole("heading", { name: "Data Structures & Algorithms" })).toBeVisible();
  await expect(page).toHaveURL(/\/courses\/dsa$/);

  await page.goto("/problems/py.nc.two-sum");
  if (testInfo.project.name === "mobile") await page.getByRole("tab", { name: "Problem" }).click();
  await expect(page.getByRole("heading", { name: "Two Sum", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/problems\/py\.nc\.two-sum$/);

  await page.getByRole("button", { name: "Back to Problems", exact: true }).click();
  await expect(page).toHaveURL(/\/problems$/);
  await page.goBack();
  if (testInfo.project.name === "mobile") await page.getByRole("tab", { name: "Problem" }).click();
  await expect(page.getByRole("heading", { name: "Two Sum", exact: true })).toBeVisible();
});

test("course picker switches to machine learning without route feedback", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  await page.goto("/courses/python");
  await page.getByRole("button", { name: "Course: Python" }).click();
  await page.getByRole("option", { name: /Machine Learning/ }).click();

  await expect(page).toHaveURL(/\/courses\/machine-learning$/);
  await expect(page.getByRole("heading", { name: "Machine Learning", exact: true })).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(/\/courses\/machine-learning$/);
  expect(errors).toEqual([]);

  await page.getByRole("button", { name: "Course: Machine Learning" }).click();
  await page.getByRole("option", { name: /^PY Python/ }).click();
  await expect(page).toHaveURL(/\/courses\/python$/);
  await expect(page.getByRole("heading", { name: "Python", exact: true })).toBeVisible();
});
