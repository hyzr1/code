import { expect, test } from "@playwright/test";

test("account settings support sign-up and show synchronized state", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
    localStorage.setItem("forge.settings.v1", JSON.stringify({ appearance: { theme: "dark" } }));
  });
  await page.route("**/api/account", async route => {
    const body = route.request().postDataJSON() as { action: string };
    if (body.action === "status") return route.fulfill({ json: { user: null } });
    if (body.action === "signup") return route.fulfill({ json: { user: { email: "learner@example.com" }, snapshot: null } });
    if (body.action === "pull") return route.fulfill({ json: { user: { email: "learner@example.com" }, snapshot: null } });
    return route.fulfill({ json: { ok: true, updatedAt: Date.now() } });
  });

  await page.goto("/");
  if (testInfo.project.name === "mobile") await page.getByLabel("Open menu").click();
  await page.getByLabel("Settings and preparation profile").click();
  await page.getByRole("button", { name: "Account & sync" }).click();
  await page.getByRole("tab", { name: "Create account" }).click();
  await page.getByLabel("Email").fill("learner@example.com");
  await page.getByLabel("Password").fill("a-secure-demo-password");
  await page.getByRole("button", { name: "Create account" }).last().click();
  await expect(page.getByText("Cloud sync on")).toBeVisible();
  await expect(page.getByRole("heading", { name: "learner@example.com" })).toBeVisible();
});
