const assert = require('node:assert/strict');
const {auditTheme} = require('./theme-route-reading.cjs');

module.exports = async ({page, base}) => {
 const ready = () => page.waitForFunction(() => document.querySelector('main')?.getAttribute('aria-busy') === 'false');
 await page.emulateMedia({reducedMotion:'reduce'});
 for (const width of [320, 375, 1440]) {
  for (const theme of ['light', 'dark']) {
   await page.setViewportSize({width, height:940});
   await page.goto(base + '#inicio');
   await ready();
   await page.evaluate(async theme => { CabaTheme.set(theme); await render(); await document.fonts.ready; }, theme);
   assert.equal(await page.locator('main h1').count(), 1);
   assert.equal(await page.locator('.home-execution-card').count(), 2);
   assert.equal(await page.locator('[data-highlight-card],.fiscal-readings').count(), 0);
   assert(await page.evaluate(() => document.fonts.check('700 16px "DM Sans"') && getComputedStyle(document.body).fontFamily.includes('DM Sans')));
   assert(await page.locator('.balance-month').evaluateAll(labels => labels.every((label, i) => i===0 || labels[i-1].getBoundingClientRect().right < label.getBoundingClientRect().left)));
   const chartContrast = await page.locator('.home-balance-series polyline').evaluateAll(lines => {
    const luminance = color => color.match(/\d+/g).slice(0,3).map(c => Number(c)/255)
     .map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4)
     .reduce((value,c,i) => value + c*[.2126,.7152,.0722][i],0);
    return lines.map(line => {
     const fg = luminance(getComputedStyle(line).stroke);
     const bg = luminance(getComputedStyle(line.closest('article')).backgroundColor);
     return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
    });
   });
   assert(chartContrast.every(ratio => ratio >= 3));
   assert.match(await page.locator('#home-balance-values .series-3').innerText(), /1,11\s+billones/);
   assert.match(await page.locator('.home-execution-change').innerText(), /−1,6%[\s\S]*\+0,3%[\s\S]*\$7,8[\s\S]*\$9,5/);
   const quarter = page.locator('#home-balance-quarter');
   await quarter.focus();
   await page.keyboard.press('End');
   await page.waitForFunction(() => document.querySelector('#home-balance-quarter').value === '4');
   assert(await quarter.evaluate(el => el === document.activeElement));
   assert.equal(await page.locator('.home-balance-series.series-3 [data-home-balance-point="4"]').count(), 0);
   assert.match(await page.locator('#home-balance-values .series-3').innerText(), /Sin dato/);
   assert.match(await page.locator('#home-balance-values .series-2').innerText(), /−\$\s?109\.527\s+millones/);
   await page.locator('.home-execution-sources>summary').click();
   assert.equal(await page.locator('.home-execution-sources table').count(), 2);
   assert.equal(await page.locator('.home-execution-sources table').first().locator('tbody tr').count(), 15);
   assert.deepEqual(await auditTheme(page), {text:[], surfaces:[]});
   assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
 }
 await page.getByRole('link', {name:'Explorá la ejecución 2026'}).click();
 await ready();
 assert(page.url().endsWith('#explorar?periodo=2026-3'));
 assert(await page.locator('.quarter-page').isVisible());
 await page.goto(base + '#inicio?vineta=2');
 await ready();
 await page.locator('#home-highlight-dialog[open]').waitFor();
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#home-highlight-dialog[open]').count(), 0);
 assert.equal(await page.locator('[data-highlight-card]').count(), 0);
 await page.emulateMedia({reducedMotion:'no-preference'});
 console.log('Portada: dos gráficos, selector por teclado, fuentes, enlaces y contraste en 320/375/1440 px.');
};
