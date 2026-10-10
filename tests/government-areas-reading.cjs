const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async function({page,base}){
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#proyecto-2027?vista=areas');await page.locator('.gov-cards').waitFor();
  assert.equal(await page.locator('.tabs [data-project-tab]').count(),4);assert.equal(await page.locator('.gov-card').count(),22);
  assert((await page.locator('.gov-card').first().innerText()).includes('Educación'));
  await page.locator('#gov-directory-search').fill('infraestructura');assert.equal(await page.locator('.gov-card').count(),1);
  await page.locator('.gov-card').click();await page.locator('.gov-kpis').waitFor();assert(page.url().includes('area=31'));assert.equal(await page.locator('#area-report-dialog[open]').count(),0);
  assert((await page.locator('.gov-kpis').innerText()).includes('+5,0%'));assert.equal(await page.locator('.gov-ranking article').count(),13);assert.equal(await page.locator('.gov-organization details').count(),7);
  await page.locator('[data-gov-scroll="gov-composition"]').click();assert(page.url().includes('vista=areas&area=31'));
  assert((await page.locator('.gov-positions').innerText()).includes('911'));assert((await page.locator('.gov-positions').innerText()).includes('no es la dotación total'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(process.env.QA_SCREENSHOTS&&width===1440){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'ficha-infraestructura-desktop.png')});}
  await page.locator('#gov-prices').selectOption('nominal');await page.waitForFunction(()=>document.querySelector('.gov-kpis')?.textContent.includes('+24%'));
  await page.locator('#gov-base').selectOption('initial');await page.waitForURL(/base=initial/);await page.reload();await page.locator('.gov-kpis').waitFor();assert.equal(await page.locator('#gov-base').inputValue(),'initial');assert.equal(await page.locator('#gov-prices').inputValue(),'nominal');
  assert((await page.locator('.gov-kpis').innerText()).includes('+24%'));
  await page.locator('#gov-base').selectOption('current');await page.locator('#gov-prices').selectOption('real');
  await page.locator('.gov-ranking [data-gov-unit="3126"]').click();await page.locator('.gov-unit-detail').waitFor();assert(page.url().includes('unidad=3126'));assert.equal(await page.locator('.gov-ranking article').count(),1);
  await page.locator('.gov-program-links [data-gov-program]').click();await page.locator('.gov-program-detail').waitFor();assert(page.url().includes('programa=31-0-0-3126-40'));await page.reload();await page.locator('.gov-program-detail').waitFor();
  assert((await page.locator('.gov-program-detail').innerText()).includes('Subterráneos'));await page.locator('[data-gov-clear-program]').click();await page.locator('[data-gov-clear-unit]').click();
  await page.locator('#gov-rank-group').selectOption('programs');await page.waitForFunction(()=>document.querySelectorAll('.gov-ranking article').length===27);
  await page.locator('#gov-ranking-sort').selectOption('increase');await page.waitForFunction(()=>document.querySelector('.gov-ranking article button')?.textContent.includes('Estacionamiento'));
  await page.locator('#gov-ranking-sort').selectOption('decrease');await page.waitForFunction(()=>document.querySelector('.gov-ranking article button')?.textContent.includes('Infraestructura Sistemas'));
  await page.locator('.gov-organization summary').first().click();assert((await page.locator('.gov-organization details').first().innerText()).includes('Trambus'));
  await page.locator('.gov-organization details').first().locator('[data-gov-program]').click();await page.locator('.gov-program-detail').waitFor();assert((await page.locator('.gov-program-detail').innerText()).includes('Código')||(await page.locator('.gov-program-detail').innerText()).includes('Ambas descripciones'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(process.env.QA_SCREENSHOTS&&width===390){await page.goto(base+'#proyecto-2027?vista=areas&area=31');await page.locator('.gov-kpis').waitFor();await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'ficha-infraestructura-mobile.png')});}
  await page.locator('[data-gov-directory]').click();await page.locator('.gov-cards').waitFor();await page.locator('#gov-directory-search').fill('');
  await page.locator('#gov-directory-sort').selectOption('alphabetic');assert((await page.locator('.gov-card').first().innerText()).includes('Auditoria'));
  await page.locator('#gov-directory-type').selectOption('Ministerio');assert.equal(await page.locator('.gov-card').count(),10);
  await page.locator('#gov-directory-type').selectOption('');await page.locator('#gov-directory-sort').selectOption('amount');
  if(process.env.QA_SCREENSHOTS&&width===1440)await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'directorio-desktop.png')});
  await page.locator('.gov-card[href*="area=40&"]').click();await page.locator('.gov-ranking').waitFor();assert((await page.locator('.gov-kpis').innerText()).includes('+3,4%'));assert.equal(await page.locator('.gov-ranking article').count(),62);
  await page.locator('.gov-source-details').filter({has:page.locator('.area-history')}).locator(':scope>summary').click();await page.locator('#area-history-year').selectOption('2013');assert((await page.locator('#area-history-value').innerText()).includes('2013'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await page.goto(base+'#proyecto-2027?vista=areas&area=90');await page.locator('.government-areas').filter({hasText:'Área no encontrada'}).waitFor();assert((await page.locator('.government-areas').innerText()).includes('Área no encontrada'));
 await page.goto(base+'#proyecto-2027?vista=summary&informe=area-31');await page.locator('.gov-kpis').waitFor();assert(page.url().includes('vista=areas&area=31'));
 await page.goto(base+'#proyecto-2027?vista=expenses&informe=ue-1-31-0-0-3126');await page.locator('.gov-unit-detail').waitFor();assert(page.url().includes('unidad=3126'));
 console.log('Áreas: directorio, búsqueda, clasificación, ficha, homologaciones, filtros, unidades, programas y enlaces antiguos verificados en 3 anchos.');
};
if(require.main===module)(async()=>{const {chromium}=require('playwright'),browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await module.exports({page,base:process.env.SMOKE_BASE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
