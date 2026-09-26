import { expect, test } from "@playwright/test";

test("frontpage story, examples, navigation and reduced motion work", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/frontpage/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Understand.",
  );
  await expect(
    page.getByRole("button", { name: "Play motion" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("navigation")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  }
  await page.getByRole("button", { name: "Explore build it" }).click();
  await expect(
    page.getByRole("heading", { name: "Understanding is hands-on." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Run example" }).click();
  await expect(page.locator(".run-row")).toContainText("2 4 8 16 32");
  await page.getByRole("button", { name: "Visualize", exact: true }).click();
  await expect(page.locator(".array")).toBeVisible();
  await page.getByRole("button", { name: "Explore keep it" }).click();
  await expect(
    page.getByRole("heading", { name: "Make progress that stays." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /items.pop/ }).click();
  await expect(page.locator(".answer-feedback")).toContainText("Try again");
  await page.getByRole("button", { name: /items.append/ }).click();
  await expect(page.locator(".answer-feedback")).toContainText("Exactly");
  await expect(page.locator(".path-row")).toHaveCount(3);
  await expect(page.locator(".path-row").nth(2)).toHaveAttribute(
    "href",
    "/courses/machine-learning",
  );
  await page.getByRole("link", { name: "Build your understanding" }).click();
  await expect(page).toHaveURL(/\/courses\/python$/);
  expect(errors).toEqual([]);
});

test("frontpage remains usable without WebGL", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/frontpage/");
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(page.getByRole("button", { name: "Play motion" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start learning", exact: true }),
  ).toBeVisible();
});
