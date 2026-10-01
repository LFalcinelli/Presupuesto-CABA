const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.SITE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/';
const routes=['#inicio','#proyecto-2027?vista=summary','#proyecto-2027?vista=expenses','#proyecto-2027?vista=revenue','#proyecto-2027?vista=compare','#explorar?periodo=2026-2','#gastos?periodo=2026-2','#ingresos?periodo=2026-2','#evolucion?periodo=2026-2','#comparar','#comparar?universo=world','#estructura?periodo=2026-2','#sueldos?periodo=2026-2','#presupuesto-explicado','#metodologia?seccion=presupuesto-2027'];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
 const errors=[],failed=[],checks=[];const page=await browser.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(new URL(r.url()).origin===new URL(base).origin&&r.status()>=400)failed.push(r.status()+' '+r.url());});
 for(const width of [1440,390])for(const route of routes){
  await page.setViewportSize({width,height:1000});await page.goto(base+route);
  await page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
  await page.evaluate(()=>document.fonts.ready);
  assert(!await page.getByText('No pudimos cargar esta vista.').count());assert(await page.locator('#content').innerText());
  if(route==='#inicio')assert((await page.locator('.panorama-grid').innerText()).includes('19.877.152.039.294'));
  if(route==='#inicio'){const text=await page.locator('.panorama-grid').innerText();assert(text.includes('24.094.340.599.263')&&text.includes('7.718.322'));assert.equal(await page.locator('.approved-teaser,.edition').count(),0);}
  if(route.startsWith('#proyecto')){assert((await page.locator('.project-page').innerText()).includes('Proyecto de Presupuesto 2027'));assert.equal(await page.locator('.tabs [data-view="salaries"],.tabs [data-view="structure"]').count(),0);assert(!await page.locator('.tabs').innerText().then(t=>t.includes('tributarios')));}
  if(route==='#proyecto-2027?vista=compare'){assert((await page.locator('.project-comparison-result').innerText()).includes('+2,7%'));assert.equal(await page.locator('#project-compare-prices').inputValue(),'real');}
  if(route.startsWith('#sueldos')){assert.equal(await page.locator('.salary-history,.salary-line,#salary-observation,.salary-latest img').count(),0);assert((await page.locator('.salary-latest').innerText()).includes('12.474.468'));}
  if(route==='#comparar')assert.equal(await page.locator('.national-layout .justice-note').count(),0);
  if(route.startsWith('#estructura'))assert.equal(await page.locator('.government-count>strong').innerText(),'2.595');
  if(route.startsWith('#evolucion'))assert.equal(await page.locator('#execution-year option').count(),30);
  checks.push(width+' '+route);
 }
 await page.goto(base+'#proyecto-2027?vista=expenses');await page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');await page.locator('.project-values [data-project-purpose]').first().click();await page.waitForFunction(()=>document.querySelector('.project-controls [data-project-reset]'));assert(new URL(page.url()).hash.includes('finalidad='));await page.reload();await page.waitForFunction(()=>document.querySelector('.project-controls [data-project-reset]'));
 await page.locator('[data-project-reset]').click();await page.waitForFunction(()=>!document.querySelector('.project-controls [data-project-reset]'));await page.locator('#project-dimension').selectOption('objects');await page.waitForFunction(()=>document.querySelector('.project-values caption')?.textContent.includes('8 categorías'));assert((await page.locator('.project-values').first().innerText()).includes('Personal'));
 await page.locator('.main-nav [data-view="summary"]').click();await page.waitForFunction(()=>document.querySelector('.project-kpis'));await page.locator('[data-period="2026-2"]').click();await page.waitForFunction(()=>document.querySelector('.fiscal-summary'));assert(page.url().includes('#explorar?periodo=2026-2'));
 await page.goto(base+'#proyecto-2027?vista=revenue&apertura=taxRevenue');await page.waitForFunction(()=>document.querySelector('#project-revenue-mode')?.value==='taxRevenue');assert.equal(await page.locator('.project-values tbody tr').count(),4);
 await page.goto(base+'#proyecto-2027?vista=compare&apertura=objects');await page.waitForFunction(()=>document.querySelector('#project-compare-dimension')?.value==='objects');assert.equal(await page.locator('.project-page table tbody tr').count(),8);
 await page.locator('#project-compare-prices').selectOption('nominal');await page.waitForFunction(()=>document.querySelector('.project-comparison-result')?.textContent.includes('+21,2%'));await page.reload();await page.waitForFunction(()=>document.querySelector('#project-compare-prices')?.value==='nominal');assert(page.url().includes('precios=nominal'));
 await page.goto(base+'#metodologia?seccion=presupuesto-2027');await page.waitForFunction(()=>document.querySelector('#metodo-presupuesto-2027'));assert(page.url().includes('seccion=presupuesto-2027'));
 await page.goto(base+'#metodologia?seccion=provincias');await page.waitForFunction(()=>document.querySelector('#metodo-provincias .justice-note'));assert.equal(await page.locator('.method-index a').count(),10);
 await page.goto(base+'#detalle?periodo=2025-4&dimension=7&filtros=%7B%226%22%3A%223%22%7D');await page.reload();await page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
 assert(page.url().includes('dimension=7'));assert(!await page.getByText('No pudimos cargar esta vista.').count());
 const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/index.json')));
 for(const d of catalog.datasets)for(const file of d.files){const response=await page.request.get(new URL(file,base).href);assert.equal(response.status(),200,file);}
 for(const file of fs.readdirSync(path.resolve(__dirname,'../public/sources'))){const response=await page.request.get(new URL('sources/'+file,base).href);assert.equal(response.status(),200,file);}
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log(JSON.stringify({smoke:checks.length,deepLinkReload:true,datasets:catalog.datasets.length,downloads:true,errors}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
