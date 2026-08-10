import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  const naturalPlayback = testInfo.title.includes("natural narration");
  await page.addInitScript((useNaturalPlayback) => {
    localStorage.setItem("unwashed.onboarding.v1", "complete");
    // Browser QA should be deterministic and must not depend on the host's
    // speech voices or begin advancing while assertions inspect a slide.
    localStorage.setItem("forge.settings.v1", JSON.stringify({
      watch: useNaturalPlayback
        ? { autoplay: false, muted: false, engine: "natural", neuralVoice: "af_heart" }
        : { autoplay: false, muted: true, engine: "system" },
    }));
  }, naturalPlayback);
});

test("the narrated lesson stays synchronized and within the mobile viewport", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Start the course", exact: true }).click();
  await expect(page.getByText(/Watch · 1 of/)).toBeVisible();

  const sceneButtons = page.getByRole("button", { name: /^Scene \d+$/ });
  const sceneCount = await sceneButtons.count();
  expect(sceneCount).toBeGreaterThan(10);

  // Exercise every rendered state in the opening lesson, including its model
  // and trap visuals and the code walkthrough that used to reveal/highlight
  // lines before the narration reached them.
  for (let index = 0; index < sceneCount; index += 1) {
    await sceneButtons.nth(index).click();
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow, `scene ${index + 1} should not overflow horizontally`).toBe(false);
  }

  await sceneButtons.nth(9).click();
  const focused = page.locator(".stage-line[aria-current='true']");
  await expect(focused).toHaveCount(0);
  await expect(page.locator(".stage-line").first()).toHaveCSS("opacity", "0.24");

  expect(errors).toEqual([]);
});

test("natural narration uses matching assets and resumes from the paused word", async ({ page }) => {
  const voiceRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/voice-packs/")) voiceRequests.push(request.url());
  });

  await page.addInitScript(() => {
    const probe = { starts: [] as { offset: number; slide: string }[] };
    Object.assign(window, { __audioProbe: probe });
    const original = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function createBufferSource() {
      const node = original.call(this);
      const start = node.start.bind(node);
      node.start = ((when = 0, offset = 0, duration?: number) => {
        probe.starts.push({
          offset,
          slide: document.querySelector(".step-kind")?.textContent ?? "",
        });
        if (duration === undefined) start(when, offset);
        else start(when, offset, duration);
      }) as AudioBufferSourceNode["start"];
      return node;
    };
  });

  await page.goto("/");
  // Reproduce the production failure: an older service worker has cached the
  // mutable manifest and lecture URL. The new player must bypass both entries
  // and still reach the correctly versioned recording.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    const stale = await caches.open("legacy-voice-cache-regression");
    await stale.put(
      "/voice-packs/af_heart/manifest.json",
      new Response('{"version":0,"lectures":{},"entries":{}}', {
        headers: { "Content-Type": "application/json" },
      }),
    );
    await stale.put(
      "/voice-packs/af_heart/lectures/py.atom.programs.ogg",
      new Response(new Uint8Array(2048), { headers: { "Content-Type": "audio/ogg" } }),
    );
  });
  await page.reload();
  await page.getByRole("button", { name: "Start the course", exact: true }).click();

  // Use a long explanatory scene so the pause cannot race the natural end.
  const sceneButtons = page.getByRole("button", { name: /^Scene \d+$/ });
  await sceneButtons.nth(3).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { __audioProbe: { starts: unknown[] } }).__audioProbe.starts.length,
  )).toBeGreaterThan(0);

  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator(".step-kind")).toContainText("4 of");
  await page.waitForTimeout(900);
  await expect(page.locator(".step-kind")).toContainText("4 of");

  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { __audioProbe: { starts: unknown[] } }).__audioProbe.starts.length,
  )).toBeGreaterThan(1);
  const offsets = await page.evaluate(() =>
    (window as unknown as {
      __audioProbe: { starts: { offset: number; slide: string }[] };
    }).__audioProbe.starts,
  );
  expect(offsets[0].offset).toBe(0);
  expect(offsets[0].slide).toContain("4 of");
  expect(offsets[1].offset).toBeGreaterThan(0.1);
  expect(offsets[1].slide).toContain("4 of");

  // A scene change owns and stops the previous source. Its replacement must
  // begin at zero only after the next slide is present in the DOM.
  await sceneButtons.nth(4).click();
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { __audioProbe: { starts: unknown[] } }).__audioProbe.starts.length,
  )).toBeGreaterThan(2);
  const sceneChange = await page.evaluate(() =>
    (window as unknown as {
      __audioProbe: { starts: { offset: number; slide: string }[] };
    }).__audioProbe.starts.at(-1),
  );
  expect(sceneChange?.offset).toBe(0);
  expect(sceneChange?.slide).toContain("5 of");

  await expect.poll(() => voiceRequests.some((url) => /manifest\.json\?v=2/.test(url))).toBe(true);
  await expect.poll(() => voiceRequests.some((url) => /\.ogg\?v=[a-f0-9]{24}/.test(url))).toBe(true);
});

test("loads the course without runtime errors", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page).toHaveTitle(/Hyzr Code/);
  await expect(page.getByText("Hyzr Code", { exact: true }).first()).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-accent", "violet");

  if (!isMobile) {
    await expect(page.getByRole("button", { name: "Start the course", exact: true })).toBeVisible();
  }

  expect(errors).toEqual([]);
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(horizontalOverflow).toBe(false);
});

test("the live course is the complete fixed Frontier and FAANG path", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Frontier + FAANG SWE" })).toBeVisible();
  await expect(page.locator(".frontier-path-pillars > div")).toHaveCount(3);
  await expect(page.locator(".prep-roadmap")).toContainText("Finish every lesson, exercise, and scheduled review");
  await expect(page.locator(".lesson-row")).toHaveCount(73);
  await expect(page.locator(".company-map, .company-graph-node")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Python Reels" })).toHaveCount(0);
  await expect(page.getByText("Mastery tier · optional")).toHaveCount(0);
  await expect(page.locator(".mastery-coming-row b")).toHaveCount(3);

  const horizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(horizontalOverflow).toBe(false);
  expect(errors).toEqual([]);
});

test("portfolio projects stay archived and absent from the live course", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page.locator(".project-gallery, .project-card")).toHaveCount(0);
  await expect(page.locator(".portfolio-checkpoint, .portfolio-dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /View projects/ })).toHaveCount(0);
  const horizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(horizontalOverflow).toBe(false);
  expect(errors).toEqual([]);
});

test("the fixed preparation course fills every responsive layout without overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser is enough for the responsive width matrix.");

  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  for (const width of [320, 390, 479, 480, 540, 700, 760, 900, 1064, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole("heading", { name: "Frontier + FAANG SWE" })).toBeVisible();
    await expect(page.locator(".frontier-path-pillars > div")).toHaveCount(3);
    await expect(page.locator(".lesson-row")).toHaveCount(73);

    const horizontalOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(horizontalOverflow, `${width}px layout should not overflow horizontally`).toBe(false);
  }

  expect(errors).toEqual([]);
});

test("ships required offline runtime assets", async ({ request }) => {
  for (const path of ["/manifest.webmanifest", "/sw.js", "/favicon.svg", "/company-logos/google.ico", "/pyodide/pyodide.mjs"]) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should be available`).toBe(true);
  }
});
