import { expect, test } from "@playwright/test";

test("light theme uses coordinated readable surfaces and never opens a refresh modal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Desktop verifies the full split workspace.");
  await page.addInitScript(() => {
    localStorage.removeItem("unwashed.onboarding.v1");
    localStorage.setItem("forge.settings.v1", JSON.stringify({
      appearance: { theme: "light", reducedMotion: true },
      learning: { course: "swe", language: "python" },
      watch: { autoplay: false, muted: true, engine: "system" },
    }));
  });

  await page.goto("/problems/py.nc.reverse-string");
  await expect(page.getByRole("heading", { name: "Reverse String", exact: true })).toBeVisible();
  await expect(page.locator(".practice-code-panel .cm-editor")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const colors = await page.evaluate(() => {
    const read = (selector: string) => {
      const style = getComputedStyle(document.querySelector(selector)!);
      return { background: style.backgroundColor, color: style.color };
    };
    return {
      description: read(".practice-description"),
      editor: read(".practice-code-panel .cm-editor"),
      sidebar: read(".sidebar"),
      page: read(".main"),
    };
  });
  expect(colors.description.background).toBe("rgb(255, 255, 255)");
  expect(colors.editor.background).toBe("rgb(255, 255, 255)");
  expect(colors.description.color).toBe("rgb(29, 33, 41)");
  expect(colors.sidebar.background).toBe("rgb(255, 255, 255)");
  expect(colors.page.background).toBe("rgb(244, 245, 247)");
});
