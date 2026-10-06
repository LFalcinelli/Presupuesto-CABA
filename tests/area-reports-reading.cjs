const assert=require('node:assert/strict');
module.exports=async function({page,base}){
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:950});await page.goto(base+'#proyecto-2027?vista=summary');await page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false'&&document.querySelector('.tabs [data-project-tab="summary"]')?.getAttribute('aria-pressed')==='true'&&document.querySelector('.fiscal-map'));
  await page.locator('.area-search-examples [data-area-report="area-40"]').click();await page.locator('#area-report-dialog[open]').waitFor();
  assert((await page.locator('.area-change').innerText()).includes('3,4% por encima'));assert.equal(await page.locator('.area-composition li').count(),6);
  assert(await page.locator('#area-report-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));assert(page.url().includes('informe=area-40'));
  await page.reload();await page.locator('#area-report-dialog[open]').waitFor();assert.equal(await page.locator('#area-report-title').innerText(),'Ministerio De Salud');
  await page.locator('#area-history-year').selectOption('2013');assert((await page.locator('#area-history-value').innerText()).includes('2013'));
  await page.keyboard.press('Escape');await page.locator('#area-report-dialog').waitFor({state:'hidden'});await page.waitForFunction(()=>!location.hash.includes('informe='));
  await page.locator('#area-report-search').fill('ramos mejia');await page.locator('#area-report-results [data-area-report]').first().click();await page.locator('#area-report-dialog[open]').waitFor();
  assert((await page.locator('#area-report-title').innerText()).includes('Ramos Mejia'));assert((await page.locator('.area-missing').innerText()).includes('2027: falta el detalle'));
  assert.equal(await page.locator('.area-change').count(),0);assert.equal(await page.locator('.area-amounts>div').count(),1);assert(await page.locator('#area-report-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  await page.locator('.area-missing [data-area-report]').click();assert.equal(await page.locator('#area-report-title').innerText(),'Ministerio De Salud');
  await page.locator('[data-area-close]').click();await page.locator('#area-report-search').fill('zzzzzzz');assert((await page.locator('#area-report-results').innerText()).includes('No encontramos'));
  await page.locator('#area-search-clear').click();assert.equal(await page.locator('#area-report-search').inputValue(),'');
  await page.goto(base+'#proyecto-2027?vista=expenses&apertura=jurisdictions');await page.locator('.exact-values>summary').first().click();
  assert.equal(await page.locator('.project-values [data-area-report]').count(),22);
  await page.locator('.project-values [data-area-report="area-55"]').click();assert.equal(await page.locator('#area-report-title').innerText(),'Ministerio De Educación');await page.keyboard.press('Escape');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await page.goto(base+'#proyecto-2027?vista=summary&informe=ue-0-0-0-0-0');await page.locator('#area-report-search').waitFor();assert.equal(await page.locator('#area-report-dialog[open]').count(),0);
 console.log('Informes: búsqueda, faltantes, historial, enlace directo, teclado y 3 anchos sin desbordes.');
};
