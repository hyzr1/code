import { expect, test } from "@playwright/test";

test("beta gate validates an invite before opening the platform", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Desktop covers the access transaction.");
  let allowed = false;
  await page.route("**/api/access", async route => {
    if (route.request().method() === "GET") return route.fulfill({ json: { access: allowed } });
    const { code } = route.request().postDataJSON() as { code: string };
    if (code !== "HYZR-TEST-PASS") return route.fulfill({ status: 401, json: { error: "That access code is not valid" } });
    allowed = true;
    return route.fulfill({ json: { access: true } });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your path starts here." })).toBeVisible();
  await page.getByLabel("Access code").fill("wrong");
  await page.getByRole("button", { name: "Enter beta" }).click();
  await expect(page.getByRole("alert")).toHaveText("That access code is not valid");
  await page.getByLabel("Access code").fill("HYZR-TEST-PASS");
  await page.getByRole("button", { name: "Enter beta" }).click();
  await expect(page.getByRole("heading", { name: "Python", exact: true })).toBeVisible();
});
