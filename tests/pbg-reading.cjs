const assert=require('node:assert/strict'),{auditTheme}=require('./theme-route-reading.cjs');
module.exports=async({page,base})=>{
 const ready=()=>page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');
 for(const width of [375,1440])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#evolucion?serie=currentPrimaryPbg');await ready();await page.evaluate(t=>{CabaTheme.set(t);render();},theme);await ready();
  assert.deepEqual(await page.locator('#execution-series option').evaluateAll(ns=>ns.map(n=>n.value)),['total','currentPrimary','currentPrimaryPbg','capital','revenue']);
  assert.equal(await page.locator('#execution-series').inputValue(),'currentPrimaryPbg');await page.reload();await ready();assert(page.url().includes('serie=currentPrimaryPbg'));
  assert.equal(await page.locator('[data-pbg-year]').count(),31);assert.equal(await page.locator('.project-history-bridge').getAttribute('stroke-dasharray'),'3 5');
  const events=await page.locator(width<=650?'.history-mobile-events':'.history-event-label').allTextContents();assert.match(events.join(' '),/Subte/);assert.match(events.join(' '),/Policía/);
  assert((await page.locator('.history-chart-scroll').innerHTML()).includes('2027*'));assert((await page.locator('.history-impact').innerText()).includes('puntos porcentuales'));
  await page.locator('#execution-year').selectOption('2027');assert.match(await page.locator('#execution-point').innerText(),/PBG nominal.*estimado/);assert.match(await page.locator('#execution-point').innerText(),/Proyecto 2027/);
  const differences=await page.evaluate(()=>executionRows().map(r=>Math.abs(r.real-r.nominal/r.pbg.pbgNominal*100)));assert(differences.every(d=>d<1e-9));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]});
  for(const series of ['total','currentPrimary','capital','revenue']){await page.locator('#execution-series').selectOption(series);await ready();assert(!await page.locator('.history-pbg').count());assert.equal(await page.locator('#execution-series').inputValue(),series);}
 }
 console.log('PBG: cinco opciones, URL/recarga, cocientes, etapas, tabla accesible, ambos temas y 375/1440 px.');
};
if(require.main===module)(async()=>{const{chromium}=require('playwright'),b=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined}),page=await b.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await module.exports({page,base:process.env.SITE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
