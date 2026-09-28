import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
    localStorage.setItem(
      "forge.settings.v1",
      JSON.stringify({
        appearance: { theme: "dark", reducedMotion: true },
        learning: { course: "swe", language: "python" },
        watch: { autoplay: false, muted: true, engine: "system" },
      }),
    );
  });
});

test("course and problem URLs are directly loadable and preserve browser history", async ({
  page,
}, testInfo) => {
  await page.goto("/courses/dsa");
  await expect(
    page.getByRole("heading", { name: "Data Structures & Algorithms" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/courses\/dsa$/);

  await page.goto("/problems/py.nc.two-sum");
  if (testInfo.project.name === "mobile")
    await page.getByRole("tab", { name: "Problem" }).click();
  await expect(
    page.getByRole("heading", { name: "Two Sum", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/problems\/py\.nc\.two-sum$/);

  await page
    .getByRole("button", { name: "Back to Problems", exact: true })
    .click();
  await expect(page).toHaveURL(/\/problems$/);
  await page.goBack();
  if (testInfo.project.name === "mobile")
    await page.getByRole("tab", { name: "Problem" }).click();
  await expect(
    page.getByRole("heading", { name: "Two Sum", exact: true }),
  ).toBeVisible();
});

test("course picker switches to machine learning without route feedback", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/courses/python");
  await page.getByRole("button", { name: "Course: Python" }).click();
  await page.getByRole("option", { name: /Machine Learning/ }).click();

  await expect(page).toHaveURL(/\/courses\/machine-learning$/);
  await expect(
    page.getByRole("heading", { name: "Machine Learning", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(/\/courses\/machine-learning$/);
  expect(errors).toEqual([]);

  await page.getByRole("button", { name: "Course: Machine Learning" }).click();
  await page.getByRole("option", { name: /^PY Python/ }).click();
  await expect(page).toHaveURL(/\/courses\/python$/);
  await expect(
    page.getByRole("heading", { name: "Python", exact: true }),
  ).toBeVisible();
});

test("mathematics route opens the first authored lesson and marks later topics as planned", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/courses/mathematics");
  await expect(
    page.getByRole("heading", { name: "Mathematics", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".course-facts")).toContainText("212 lessons");
  await expect(page.locator(".lesson-row.planned").first()).toContainText(
    "Coming soon",
  );
  await page.getByRole("button", { name: "Start the course" }).click();
  await expect(page).toHaveURL(
    /\/courses\/mathematics\/lessons\/math\.m1\.l1$/,
  );
  await expect(
    page.getByText("Functions, domains, and ranges", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m2.l10");
  await expect(
    page
      .getByText("Mixed limit and continuity problems", { exact: true })
      .first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m3.l7");
  await expect(
    page
      .getByText("First-principles derivative practice", { exact: true })
      .first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m4.l9");
  await expect(
    page
      .getByText("Mixed-rule differentiation workshop", { exact: true })
      .first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m5.l5");
  await expect(
    page.getByText("Optimization with constraints", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m6.l6");
  await expect(
    page.getByText("Substitution and change of variables", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m7.l3");
  await expect(
    page.getByText("Washers and shells", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m8.l5");
  await expect(
    page.getByText("Numerical integration and error", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m9.l5");
  await expect(
    page.getByText("Monotone bounded sequences", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m10.l10");
  await expect(
    page.getByText("Taylor series and approximation error", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m11.l9");
  await expect(
    page.getByText("Lagrange multipliers and constrained extrema", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m3.l4");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /continuous corner has different slopes/ }),
  ).toBeVisible();
  await page.goto("/courses/mathematics/lessons/math.m2.l5");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /vertical asymptote: the two sides grow/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
