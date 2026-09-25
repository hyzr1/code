import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
    localStorage.setItem("forge.settings.v1", JSON.stringify({ appearance: { theme: "dark", reducedMotion: true }, learning: { course: "algo", language: "python" } }));
  });
});

test("systems design plan opens structured questions with hints, solution, and notes", async ({ page }) => {
  await page.goto("/problems");
  const systemsPlan = page.getByRole("button", { name: /Systems Design/ });
  await systemsPlan.click();
  await expect(systemsPlan).toContainText("19");
  await page.getByRole("button", { name: /Design a URL Shortener/ }).click();
  await expect(page).toHaveURL(/\/system-design\/sd\.url-shortener$/);
  await expect(page.getByRole("heading", { name: "Design a URL Shortener" })).toBeVisible();
  await expect(page.getByText("Core requirements")).toBeVisible();

  await page.getByRole("button", { name: "Hints" }).click();
  await page.getByRole("button", { name: "Reveal next hint" }).click();
  await expect(page.getByText("Estimate read/write ratio before selecting storage.")).toBeVisible();
  await page.getByRole("button", { name: "Solution" }).click();
  await expect(page.getByRole("heading", { name: "Write path" })).toBeVisible();
  await page.getByLabel("System design notes").fill("Cache hot redirects at the edge.");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
});
