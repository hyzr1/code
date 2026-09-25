import { expect, test } from "@playwright/test";

test("beta access is optional and can be redeemed from the sidebar", async ({ page }, testInfo) => {
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
  await expect(page.getByRole("heading", { name: "Python", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Beta access" }).click();
  await expect(page.getByRole("heading", { name: "Lock in lifetime free access." })).toBeVisible();
  await page.getByLabel("Beta access code").fill("wrong");
  await page.getByRole("button", { name: "Redeem code" }).click();
  await expect(page.getByRole("alert")).toHaveText("That access code is not valid");
  await page.getByLabel("Beta access code").fill("HYZR-TEST-PASS");
  await page.getByRole("button", { name: "Redeem code" }).click();
  await expect(page.getByRole("heading", { name: "You’re beta certified." })).toBeVisible();
});
