import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
    localStorage.setItem("forge.settings.v1", JSON.stringify({
      appearance: { mode: "algo", theme: "dark" },
      learning: { course: "algo", language: "python" },
      watch: { autoplay: false, muted: true, engine: "system" },
    }));
  });
});

async function openAlgo(page: import("@playwright/test").Page) {
  if ((page.viewportSize()?.width ?? 1000) <= 860) await page.getByLabel("Open menu").click();
  await page.getByTitle("Algo").click();
}

test("ships the exact interview collections and responsive practice workspace", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await openAlgo(page);
  await expect(page.getByRole("button", { name: "NeetCode 250 250" })).toHaveClass(/on/);
  await expect(page.locator(".lesson-row")).toHaveCount(250);
  await page.getByRole("button", { name: "NeetCode 150 150" }).click();
  await expect(page.locator(".lesson-row")).toHaveCount(150);
  await page.getByRole("button", { name: "Blind 75 75" }).click();
  await expect(page.locator(".lesson-row")).toHaveCount(75);
  await page.getByRole("button", { name: "Two Sum", exact: false }).first().click();
  await expect(page.getByRole("heading", { name: "Two Sum", exact: true })).toBeVisible();
  await expect(page.getByText("Python 3", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Hints" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Solution" })).toBeVisible();
  await expect(page.locator(".practice-case-tabs button")).toHaveCount(4);
  await expect(page.locator(".practice-footer")).toContainText("203 submit checks");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("interview-workspace.png"), fullPage: true });
});

test("runs and submits Python against examples and hidden cases", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hyzr.draft.v2.py.nc.two-sum", "class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, value in enumerate(nums):\n            if target - value in seen:\n                return [seen[target - value], i]\n            seen[value] = i");
  });
  await page.goto("/");
  await openAlgo(page);
  await page.getByRole("button", { name: "Blind 75 75" }).click();
  await page.getByRole("button", { name: "Two Sum", exact: false }).first().click();
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByRole("heading", { name: "Examples passed" })).toBeVisible({ timeout: 35_000 });
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Accepted" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: /Save solve/ })).toBeVisible();
});
