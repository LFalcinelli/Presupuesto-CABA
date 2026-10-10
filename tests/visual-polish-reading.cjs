const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async({page,base})=>{
 const h=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/history/execution-history.json'))),p=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/budget/2027/project.json')));
 const percentValue=n=>new Intl.NumberFormat('es-AR',{minimumFractionDigits:Math.abs(n)>=10?0:1,maximumFractionDigits:Math.abs(n)>=10?0:1}).format(n);
 const a=h.rows.find(r=>r.year===2005),b=h.rows.find(r=>r.year===2025),growth=percentValue((b.real/a.real-1)*100);
 const ready=()=>page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#inicio');await ready();
  assert.equal(await page.locator('.fiscal-map').count(),1);
  assert.equal(await page.locator('.hero-request-value').innerText(),'≈ $ 24,1 billones de pesos');
  assert((await page.locator('.hero-exact-value').innerText()).includes('24.094.340.599.263'));
  assert(await page.locator('.project-hero').evaluate(e=>!!(e.compareDocumentPosition(document.querySelector('.fiscal-map'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  assert(await page.locator('.fiscal-map').evaluate(e=>!!(e.compareDocumentPosition(document.querySelector('.project-questions'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  if(width>1100)assert.equal(await page.locator('.hero-request>p:not(.eyebrow)').evaluate(e=>{const range=document.createRange();range.selectNodeContents(e);return range.getClientRects().length;}),1);
  await page.goto(base+'#proyecto-2027?vista=expenses');await ready();
  assert.equal(await page.locator('.purpose-function-tile').count(),8);
  assert(await page.locator('.project-purpose-tree').evaluate(e=>!!(e.compareDocumentPosition(document.querySelector('.area-search'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  const sum=await page.locator('.purpose-function-tile').evaluateAll(es=>es.reduce((v,e)=>v+Number(e.dataset.value),0));assert.equal(sum,p.breakdowns.purposes.find(r=>r.name==='Servicios Sociales').value);
  for(const tile of await page.locator('.purpose-function-tile,.purpose-rest-tile').all())assert(await tile.evaluate(e=>e.scrollHeight<=e.clientHeight+2),'Every function label fits');
  await page.locator('[data-project-function="13"]').click();await page.locator('#project-detail-dialog[open]').waitFor();assert((await page.locator('#project-dialog-body').innerText()).includes('Educación'));await page.keyboard.press('Escape');
  await page.locator('[data-project-debt]').click();await ready();assert((await page.locator('.project-spending').innerText()).includes('Deuda'));
  await page.goto(base+'#evolucion?periodo=2026-2');await ready();assert.equal(await page.locator('.explorer-location').count(),0);assert.equal(await page.locator('.price-label').isVisible(),false);
  assert((await page.locator('.history-impact').innerText()).includes(growth));assert.equal(await page.locator('.history-year-label').count(),31);assert.equal(await page.locator('.history-event-label a').count(),2);
  for(const selector of ['.legacy-history-bridge','.budget-history-bridge','.project-history-bridge'])assert.equal(await page.locator(selector).getAttribute('stroke-dasharray'),'3 5');
  assert((await page.locator('.history-actual-line').getAttribute('d')).includes('C'));
  assert.equal(await page.locator('.execution-chart [data-execution-year]').count(),31);
  await page.locator('#execution-year').selectOption('2005');assert((await page.locator('#execution-point').innerText()).includes(new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(a.real)));
  assert.equal(await page.locator('.history-growth-guide').count(),1);for(const [year,attr] of [[2005,'data-start'],[2025,'data-end']])assert.equal(await page.locator('.history-growth-guide').getAttribute(attr),await page.locator(`[data-execution-year="${year}"] circle`).evaluate(e=>e.getAttribute('cx')+','+e.getAttribute('cy')));assert((await page.locator('.history-event-label').allTextContents()).join(' ').includes('2016–2017'));
  await page.locator('#execution-series').selectOption('currentPrimary');await ready();assert(new URL(page.url()).hash.includes('serie=currentPrimary'));
  const ca=h.series.currentPrimary.rows.find(r=>r.year===2005),cb=h.series.currentPrimary.rows.find(r=>r.year===2025),cg=percentValue((cb.real/ca.real-1)*100);
  assert((await page.locator('.history-impact').innerText()).includes(cg));await page.locator('#execution-year').selectOption('2027');assert((await page.locator('#execution-point').innerText()).includes('autorización, no ejecución'));
  await page.reload();await ready();assert.equal(await page.locator('#execution-series').inputValue(),'currentPrimary');assert((await page.locator('.history-chart-unit').innerText()).includes('Gasto corriente sin intereses'));
  await page.locator('#execution-series').selectOption('revenue');await ready();assert(new URL(page.url()).hash.includes('serie=revenue'));
  assert.equal(await page.locator('#execution-series option').last().getAttribute('value'),'revenue');assert.equal(await page.locator('.history-page h1').innerText(),'30 años de recaudación.');
  const ra=h.series.revenue.rows.find(r=>r.year===2005),rb=h.series.revenue.rows.find(r=>r.year===2025),rg=percentValue((rb.real/ra.real-1)*100);
  assert((await page.locator('.history-impact').innerText()).includes(rg));assert((await page.locator('.history-impact').innerText()).includes('Más recaudación'));
  assert.equal(await page.locator('.history-year-label').count(),31);assert.equal(await page.locator('.execution-chart [data-execution-year]').count(),31);
  assert.equal(await page.locator('.history-event-label,.legacy-history-bridge').count(),0);assert((await page.locator('.history-legend').innerText()).includes('Recaudación efectiva'));
  for(const [year,attr] of [[2005,'data-start'],[2025,'data-end']])assert.equal(await page.locator('.history-growth-guide').getAttribute(attr),await page.locator(`[data-execution-year="${year}"] circle`).evaluate(e=>e.getAttribute('cx')+','+e.getAttribute('cy')));
  await page.locator('#execution-year').selectOption('1997');assert((await page.locator('#execution-point').innerText()).includes('Recaudación efectiva'));assert(!(await page.locator('#execution-point').innerText()).includes('criterio distinto'));
  await page.locator('#execution-year').selectOption('2026');assert((await page.locator('#execution-point').innerText()).includes('19.881.406.042.845'));assert((await page.locator('#execution-point').innerText()).includes('ingresos previstos, no recaudación efectiva'));
  await page.locator('#execution-year').selectOption('2027');assert((await page.locator('#execution-point').innerText()).includes('24.095.657.042.129'));
  await page.reload();await ready();assert.equal(await page.locator('#execution-series').inputValue(),'revenue');assert((await page.locator('.history-chart-unit').innerText()).includes('Recaudación total'));
  await page.locator('.history-values>summary').click();assert.equal(await page.locator('.history-values tbody tr').count(),31);assert((await page.locator('.history-values tbody tr').last().innerText()).includes('Ingresos previstos'));assert.equal(await page.locator('.history-values a[href^="https://"]').count(),3);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#execution-series').selectOption('total');await ready();assert(!new URL(page.url()).hash.includes('serie='));assert.equal(await page.locator('.history-event-label a').count(),2);
  const tips=await page.locator('.execution-chart [data-execution-year]').evaluateAll(es=>es.map(e=>e.getAttribute('data-viz-tip')||e.getAttribute('aria-label')).join(' '));assert(!tips.includes('trimestre'));
  await page.locator('.dollar-perspective>summary').click();await page.locator('[data-usd-history="7"]').click();await ready();if(await page.locator('[data-usd-group=""]').count()){await page.locator('[data-usd-group=""]').click();await ready();}
  await page.locator('[data-usd-group="3"]').click();await ready();assert.equal(await page.locator('.usd-paired-bars article').count(),8);
  await page.locator('[data-usd-history="8"]').click();await ready();assert.equal(await page.locator('.usd-paired-bars article').count(),8);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'#inicio');await ready();assert.equal(await page.locator('.hero-request').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await page.locator('.reveal-ready').count(),0);await page.emulateMedia({reducedMotion:'no-preference'});
 if(process.env.QA_SCREENSHOTS){const out=path.resolve(process.env.QA_SCREENSHOTS);fs.mkdirSync(out,{recursive:true});for(const [name,route,selector,width] of [['portada','#inicio','.project-hero',1440],['evolucion','#evolucion?periodo=2026-2','.execution-history',1440],['gastos-2027','#proyecto-2027?vista=expenses','.project-spending',1440],['gastos-2027-mobile','#proyecto-2027?vista=expenses','.project-spending',390]]){await page.setViewportSize({width,height:1500});await page.goto(base+route);await ready();await page.evaluate(()=>document.fonts.ready);await page.locator(selector).scrollIntoViewIfNeeded();await page.locator(selector).screenshot({path:path.join(out,name+'.png'),animations:'disabled'});}}
 console.log('Pulido visual: portada, mapa, jerarquía del gasto, 31 años, contraste USD y movimiento reducido verificados.');
};
