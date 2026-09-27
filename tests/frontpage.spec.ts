import { expect, test } from "@playwright/test";

test("home landing and course app keep separate offline shells", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Service worker cache contract is covered on desktop");
  await page.goto("/courses/python");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Understand deeply.",
  );
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const cache = await caches.open("hyzr-code-v14");
        const landing = await cache.match("/");
        const course = await cache.match("/courses/python");
        return {
          landing: (await landing?.text())?.includes(
            "Learn to Code with Interactive Lessons",
          ),
          course: (await course?.text())?.includes("Learn Python, DSA"),
        };
      }),
    )
    .toEqual({ landing: true, course: true });
});

test("frontpage story, examples, navigation and reduced motion work", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Understand deeply.",
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
  await page.goto("/");
  await expect(page.locator(".hero-content")).toBeVisible();
  await expect(page.locator(".hero canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(page.getByRole("button", { name: "Play motion" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start learning", exact: true }).last(),
  ).toBeVisible();
});

test("GSAP motion can be paused without hiding content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".frontpage")).toHaveClass(/gsap-ready/);
  await expect(page.locator(".hero-content h1")).toBeVisible();
  await page
    .getByRole("button", { name: "Pause motion", exact: false })
    .first()
    .click();
  await expect(page.locator(".frontpage")).not.toHaveClass(/gsap-ready/);
  await page.locator("#paths").scrollIntoViewIfNeeded();
  await expect(page.locator(".path-row").first()).toBeVisible();
  await page.getByRole("link", { name: "Build your understanding" }).click();
  await expect(page).toHaveURL(/\/courses\/python$/);
  const primary = page.locator(".course-resume>button");
  await expect(primary).toBeVisible();
  expect(await primary.evaluate((e) => getComputedStyle(e).borderRadius)).toBe(
    "6px",
  );
  expect(errors).toEqual([]);
});
