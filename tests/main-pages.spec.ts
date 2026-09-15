import {test,expect} from '@playwright/test';
test('main pages share readable type and responsive navigation',async({page},info)=>{
 await page.addInitScript(()=>{localStorage.setItem('unwashed.onboarding.v1','complete');localStorage.setItem('forge.settings.v1',JSON.stringify({appearance:{theme:'dark',reducedMotion:true},watch:{autoplay:false,muted:true,engine:'system'}}));});
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('.course-overview h1')).toHaveCSS('font-family',/Inter/);
 await expect(page.locator('.course-module[open]')).toHaveCount(1);
 const second=page.locator('.course-module').nth(1);
 await second.locator('summary').click();await expect(second).toHaveAttribute('open','');
 await expect(second.locator('.lesson-open').first()).toBeVisible();await second.locator('summary').click();
 await page.locator('.course-overview').scrollIntoViewIfNeeded();
 await page.screenshot({path:info.outputPath('course.png'),animations:'disabled'});
 const navigate=async(label:string,mode=false)=>{if((page.viewportSize()?.width??1000)<=860)await page.getByLabel('Open menu').click();if(mode)await page.getByTitle(label,{exact:true}).click();else await page.getByRole('button',{name:label,exact:true}).click();};
 await navigate('Progress');await expect(page.getByRole('heading',{name:'Progress',exact:true})).toBeVisible();await page.screenshot({path:info.outputPath('progress.png'),animations:'disabled'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await navigate('Type',true);await expect(page.getByRole('heading',{name:'Typing practice'})).toBeVisible();await page.screenshot({path:info.outputPath('typing.png'),animations:'disabled'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await navigate('Algo',true);await expect(page.getByRole('heading',{name:'DSA Interview Prep'})).toBeVisible();await page.screenshot({path:info.outputPath('problems.png'),animations:'disabled'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
