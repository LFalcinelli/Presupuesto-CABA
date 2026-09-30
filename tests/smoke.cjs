const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.SITE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/';
const routes=['#inicio','#explorar?periodo=2026-2','#gastos?periodo=2026-2','#ingresos?periodo=2026-2','#evolucion?periodo=2026-2','#comparar','#estructura?periodo=2026-2','#sueldos?periodo=2026-2','#presupuesto-explicado','#metodologia'];
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
  if(route.startsWith('#estructura'))assert.equal(await page.locator('.government-count>strong').innerText(),'2.595');
  if(route.startsWith('#evolucion'))assert.equal(await page.locator('#execution-year option').count(),30);
  checks.push(width+' '+route);
 }
 await page.goto(base+'#detalle?periodo=2025-4&dimension=7&filtros=%7B%226%22%3A%223%22%7D');await page.reload();await page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
 assert(page.url().includes('dimension=7'));assert(!await page.getByText('No pudimos cargar esta vista.').count());
 const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/index.json')));
 for(const d of catalog.datasets)for(const file of d.files){const response=await page.request.get(new URL(file,base).href);assert.equal(response.status(),200,file);}
 for(const file of fs.readdirSync(path.resolve(__dirname,'../public/sources'))){const response=await page.request.get(new URL('sources/'+file,base).href);assert.equal(response.status(),200,file);}
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log(JSON.stringify({smoke:checks.length,deepLinkReload:true,datasets:catalog.datasets.length,downloads:true,errors}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
