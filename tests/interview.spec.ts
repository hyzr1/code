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
  const mobile = testInfo.project.name === "mobile";
  if (mobile) await page.getByRole("tab", { name: "Problem" }).click();
  await expect(page.getByRole("heading", { name: "Two Sum", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Hints" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Solution" })).toBeVisible();
  if (mobile) await page.getByRole("tab", { name: "Code" }).click();
  await expect(page.getByText("Python 3", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Toggle line wrap")).toBeVisible();
  if (mobile) await page.getByRole("tab", { name: "Tests" }).click();
  await expect(page.locator(".practice-case-tabs button")).toHaveCount(4);
  await expect(page.locator(".practice-footer")).toContainText("submit checks");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("interview-workspace.png"), fullPage: true });
});

test("runs and submits Python against examples and hidden cases", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hyzr.draft.v2.py.nc.two-sum", "class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, value in enumerate(nums):\n            if target - value in seen:\n                return [i, seen[target - value]]\n            seen[value] = i");
  });
  await page.goto("/");
  await openAlgo(page);
  await page.getByRole("button", { name: "Blind 75 75" }).click();
  await page.getByRole("button", { name: "Two Sum", exact: false }).first().click();
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.getByRole("heading", { name: "Examples passed" })).toBeVisible({ timeout: 35_000 });
  await expect(page.locator(".case-observation label").filter({ hasText: /^Output/ }).locator("pre")).toHaveText("[1, 0]");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Accepted", exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: /Save solve/ })).toBeVisible();
});

test("rejects example-only answers and preserves submission details", async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("hyzr.draft.v2.py.nc.concatenation-of-array", "class Solution:\n    def getConcatenation(self, nums):\n        if nums == [1,2,1]: return [1,2,1,1,2,1]\n        if nums == [1,3,2,1]: return [1,3,2,1,1,3,2,1]\n        return []"));
  await page.goto("/");
  await openAlgo(page);
  await page.getByRole("button", { name: /Concatenation of Array/ }).click();
  await page.getByRole("button", { name: "Run", exact:true }).click();
  await expect(page.getByRole("heading", {name:"Examples passed"})).toBeVisible({timeout:35000});
  await page.getByRole("button", { name: "Submit", exact:true }).click();
  await expect(page.getByRole("heading", {name:"Wrong answer",exact:true})).toBeVisible({timeout:15000});
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("hyzr.submissions.v1.py.nc.concatenation-of-array")||"[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0].result.results.length).toBeGreaterThan(200);
  expect(saved[0].result.results.some((t:{passed:boolean})=>!t.passed)).toBe(true);
  if(testInfo.project.name==="mobile")await page.getByRole("tab",{name:"Problem",exact:true}).click();
  await page.getByRole("tab",{name:"Solution",exact:true}).click();
  await expect(page.getByRole("link",{name:/NeetCode video walkthrough/})).toHaveAttribute("href","https://www.youtube.com/watch?v=68isPRHgcFQ");
  await page.getByRole("tab",{name:"Submissions",exact:true}).click();
  await expect(page.locator('.submission-list')).toContainText('Wrong answer');
  if(testInfo.project.name==="desktop"){
    await page.setViewportSize({width:1920,height:1080});
    await page.getByRole("tab",{name:"Description",exact:true}).click();
    await page.screenshot({path:testInfo.outputPath("workspace-1920.png")});
    expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1)).toBe(true);
  }
});
