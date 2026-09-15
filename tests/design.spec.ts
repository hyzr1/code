import { test, expect } from '@playwright/test';
test('visual surfaces and usable editor controls', async ({page}, info) => {
 await page.addInitScript(()=>{localStorage.setItem('unwashed.onboarding.v1','complete');localStorage.setItem('forge.settings.v1',JSON.stringify({appearance:{theme:'dark'},watch:{autoplay:false,muted:true,engine:'system'}}));});
 await page.goto('/');
 await page.screenshot({path:info.outputPath('course.png')});
 if((page.viewportSize()?.width??1000)<=860) await page.getByLabel('Open menu').click();
 await page.getByTitle('Algo').click();
 await page.getByLabel('Filter by topic').selectOption('Arrays & Hashing');
 await expect(page.locator('.problem-topic-head')).toHaveCount(1);
 await page.getByLabel('Search problems',{exact:true}).fill('two sum');
 await expect(page.locator('.lesson-row')).toHaveCount(1);
 await page.getByLabel('Search problems',{exact:true}).fill('');
 await page.getByLabel('Filter by topic').selectOption('');
 await page.screenshot({path:info.outputPath('library.png')});
 await page.getByRole('button',{name:'Two Sum',exact:false}).first().click();
 if(info.project.name==='mobile') await page.getByRole('tab',{name:'Code',exact:true}).click();
 await page.getByLabel('Toggle line wrap').click();
 await expect(page.locator('.cm-content')).toHaveClass(/cm-lineWrapping/);
 await page.getByLabel('Toggle line wrap').click();
 await expect(page.locator('.cm-content')).not.toHaveClass(/cm-lineWrapping/);
 await page.getByLabel('Editor font size').selectOption('16');
 await expect(page.locator('.cm-scroller')).toHaveCSS('font-size','16px');
 if(info.project.name==='desktop') {
  await page.getByLabel('Expand editor',{exact:true}).click();
  await expect(page.locator('.practice-description')).toBeHidden();
  await page.getByLabel('Restore panels').click();
  await expect(page.locator('.practice-description')).toBeVisible();
 } else {
  await page.getByRole('tab',{name:'Problem',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Two Sum',exact:true})).toBeVisible();
 }
 await page.screenshot({path:info.outputPath('editor.png')});
});
