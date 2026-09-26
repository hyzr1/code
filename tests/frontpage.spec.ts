import { expect, test } from "@playwright/test";

test("landing preview does not overwrite the offline course shell", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Service worker cache contract is covered on desktop");
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.goto("/frontpage/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Learn to think.",
  );
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const cache = await caches.open("hyzr-code-v13");
        const root = await cache.match("/");
        const landing = await cache.match("/frontpage/");
        return {
          root: (await root?.text())?.includes("Learn Python, DSA"),
          landing: (await landing?.text())?.includes("Build understanding."),
        };
      }),
    )
    .toEqual({ root: true, landing: true });
});

test("frontpage story, examples, navigation and reduced motion work", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/frontpage/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Learn to think.",
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
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator(".preference-lab")).toHaveClass(/light/);
  await page.getByRole("button", { name: "Code", exact: true }).click();
  await expect(page.locator(".lab-preview .syntax-keyword").first()).toHaveText(
    "def",
  );
  await page.getByRole("button", { name: "Increase playback pace" }).click();
  await expect(page.locator("#preview-speed")).toHaveValue("1.25");
  await page.getByRole("button", { name: "Decrease playback pace" }).click();
  await expect(page.locator("#preview-speed")).toHaveValue("1");
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await expect(page.locator(".lab-preview")).toContainText(
    "A function takes an input",
  );
  if (!isMobile) {
    await page.locator(".nav-explore summary").click();
    await expect(page.locator(".mega-menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".mega-menu")).not.toBeVisible();
  }
  await expect(page.locator(".path-row")).toHaveCount(3);
  await expect(page.locator(".path-row").nth(2)).toHaveAttribute(
    "href",
    "/courses/machine-learning",
  );
  await page.getByRole("link", { name: "Build your understanding" }).click();
  await expect(page).toHaveURL(/\/courses\/python$/);
  expect(errors).toEqual([]);
});

test("frontpage remains usable without canvas", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/frontpage/");
  await expect(page.locator(".network-fallback")).toBeVisible();
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(page.getByRole("button", { name: "Play motion" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start learning", exact: true }).last(),
  ).toBeVisible();
});
