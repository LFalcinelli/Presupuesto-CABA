const assert=require('node:assert/strict');
module.exports=async function({page,base}){
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:950});await page.goto(base+'#proyecto-2027?vista=summary');await page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false'&&document.querySelector('.tabs [data-project-tab="summary"]')?.getAttribute('aria-pressed')==='true'&&document.querySelector('.area-search'));
  await page.locator('.area-search-examples [data-area-report="area-40"]').click();await page.locator('.gov-kpis').waitFor();
  assert((await page.locator('.gov-kpis').innerText()).includes('+18%'));assert(page.url().includes('vista=areas&area=40'));
  await page.reload();await page.locator('.gov-kpis').waitFor();assert.equal(await page.locator('.government-areas h1').innerText(),'Ministerio de Salud');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(base+'#proyecto-2027?vista=summary');await page.locator('#area-report-search').waitFor();
  await page.locator('#area-report-search').fill('ramos mejia');await page.locator('#area-report-results [data-area-report]').first().click();await page.locator('.gov-unit-detail').waitFor();
  assert((await page.locator('.gov-unit-detail h2').innerText()).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes('ramos mejia'));
  assert.equal(await page.locator('#area-report-dialog[open]').count(),0);assert(page.url().includes('area=40'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(base+'#proyecto-2027?vista=summary');await page.locator('#area-report-search').waitFor();await page.locator('#area-report-search').fill('zzzzzzz');assert((await page.locator('#area-report-results').innerText()).includes('No encontramos'));
  await page.locator('#area-search-clear').click();assert.equal(await page.locator('#area-report-search').inputValue(),'');
  await page.goto(base+'#proyecto-2027?vista=expenses&apertura=jurisdictions');await page.locator('.exact-values>summary').first().click();
  assert.equal(await page.locator('.project-values [data-area-report]').count(),22);
  await page.locator('.project-values [data-area-report="area-55"]').click();await page.locator('.gov-kpis').waitFor();assert.equal(await page.locator('.government-areas h1').innerText(),'Ministerio de Educación');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await page.goto(base+'#proyecto-2027?vista=summary&informe=ue-0-0-0-0-0');await page.locator('#area-report-search').waitFor();assert.equal(await page.locator('#area-report-dialog[open]').count(),0);
 console.log('Informes: búsqueda, aperturas verificadas de Salud, enlaces de áreas y unidades, teclado y 3 anchos sin desbordes.');
};
