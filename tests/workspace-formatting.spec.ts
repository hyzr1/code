import { test, expect } from '@playwright/test';

test('consistent syntax, centered actions, and distinct argument fields', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem('unwashed.onboarding.v1', 'complete');
    localStorage.setItem('forge.settings.v1', JSON.stringify({ appearance: { mode: 'algo', theme: 'dark' }, learning: { course: 'algo', language: 'python' }, watch: { autoplay: false, muted: true, engine: 'system' } }));
    localStorage.setItem('hyzr.draft.v2.py.nc.valid-anagram', 'class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        # str is a type, but this is a comment\n        note = "str"\n        return sorted(s) == sorted(t)');
  });
  await page.goto('/');
  const mobile = info.project.name === 'mobile';
  if (mobile) await page.getByLabel('Open menu').click();
  await page.getByTitle('Algo', { exact: true }).click();
  await page.getByRole('button', { name: /Valid Anagram/ }).first().click();
  await expect(page.locator('.cm-content .syntax-type.syntax-variable').filter({ hasText: /^str$/ }).first()).toHaveCSS('color', 'rgb(78, 201, 176)');
  await expect(page.locator('.cm-content .syntax-type.syntax-variable').filter({ hasText: /^bool$/ })).toHaveCSS('color', 'rgb(78, 201, 176)');
  await expect(page.locator('.cm-content .syntax-string')).toHaveCSS('color', 'rgb(206, 145, 120)');
  const offset = await page.evaluate(() => {
    const header = document.querySelector('.topbar')!.getBoundingClientRect();
    const actions = document.querySelector('.practice-run-actions')!.getBoundingClientRect();
    return Math.abs(header.x + header.width / 2 - actions.x - actions.width / 2);
  });
  expect(offset).toBeLessThan(2);
  if (mobile) await page.getByRole('tab', { name: 'Problem', exact: true }).click();
  await expect(page.locator('.practice-prose p code').filter({ hasText: /^s$/ }).first()).toBeVisible();
  await page.getByRole('tab', { name: 'Solution', exact: true }).click();
  await expect(page.locator('.practice-prose pre .syntax-type.syntax-variable').filter({ hasText: /^str$/ }).first()).toHaveCSS('color', 'rgb(78, 201, 176)');
  if (mobile) await page.getByRole('tab', { name: 'Tests', exact: true }).click();
  await expect(page.locator('.test-argument-name')).toHaveText(['s =', 't =']);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Examples passed' })).toBeVisible({ timeout: 35000 });
  await expect(page.locator('.case-observation .test-argument-name')).toHaveText(['s =', 't =']);
  await expect(page.locator('.case-observation > label').filter({ hasText: /^Output/ }).locator('pre')).toHaveText('true');
  await page.screenshot({ path: info.outputPath('formatting.png') });
});
