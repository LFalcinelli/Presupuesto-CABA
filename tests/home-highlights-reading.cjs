const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {auditTheme}=require('./theme-route-reading.cjs');
module.exports=async({page,base})=>{
 const ready=()=>page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');
 const normal=s=>s.replace(/\u00a0/g,' ');
 await page.emulateMedia({reducedMotion:'reduce'});
 const out=process.env.HIGHLIGHTS_QA_DIR;if(out)fs.mkdirSync(out,{recursive:true});
 for(const theme of ['light','dark'])for(const width of [1440,375]){
  await page.setViewportSize({width,height:900});await page.goto(base+'#inicio');await ready();await page.evaluate(t=>CabaTheme.set(t),theme);await ready();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('main h1').count(),1);assert.equal(await page.locator('[data-highlight-card]').count(),4);assert.equal(await page.locator('.citizen-home').count(),1);
  assert.match(normal(await page.locator('[data-highlight-card="1"]').innerText()),/GASTO CORRIENTE POR PORTEÑO\s+\$6,1 millones al año/);
  const third=normal(await page.locator('[data-highlight-card="3"]').innerText());assert.match(third,/ELIMINAR LAS PASO\s+\$28.845 millones/);assert(!third.includes('ahorro estimado'));assert(third.includes('$372.519 millones'));
  assert.match(normal(await page.locator('[data-highlight-card="4"]').innerText()),/\$2,11 billones/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===1440)assert((await page.locator('.home-highlights').boundingBox()).height<760,'compact desktop');
  assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]},'home '+theme+' '+width);
  if(out)await page.locator('.home-highlights').screenshot({path:path.join(out,`home-${theme}-${width}.png`),animations:'disabled'});
  for(let id=1;id<=4;id++){
   const trigger=page.locator(`[data-highlight-open="${id}"]`);await trigger.focus();await page.keyboard.press('Enter');const d=page.locator('#home-highlight-dialog');await page.locator('#home-highlight-dialog[open]').waitFor();assert(page.url().includes('vineta='+id));assert.equal(await d.getAttribute('aria-modal'),'true');
   assert(await d.locator('#home-highlight-title').evaluate(e=>e===document.activeElement));
   // Native modal confines keyboard focus, including backwards from its first control.
   await d.locator('[data-highlight-close]').focus();await page.keyboard.press('Shift+Tab');assert(await d.evaluate(e=>e.contains(document.activeElement)));await page.keyboard.press('Tab');assert(await d.evaluate(e=>e.contains(document.activeElement)));
   if(id===1){assert.match(normal(await d.innerText()),/0,7%/);assert.match(normal(await d.innerText()),/no es una factura de impuestos individual/);}
   if(id===2){assert.match(normal(await d.innerText()),/Los tres semestres tuvieron superávit/);assert.match(normal(await d.innerText()),/no se suman al gasto/);}
   if(id===3){await d.locator('[data-highlight-jump="paso"]').click();assert(await d.locator('[data-highlight-group="paso"]').isVisible());await d.evaluate(e=>e.scrollTop=0);assert.match(normal(await d.innerText()),/35% × \$82.415 millones = \$28.845 millones/);assert.match(normal(await d.innerText()),/no separa PASO/);}
   if(id===4){const list=d.locator('[data-highlight-group="green"] .highlight-components').first();assert.match(normal(await list.locator(':scope>li').first().innerText()),/Operaci[oó]n Del Reciclado/i);assert.equal(await list.locator(':scope>li').count(),13);}
   assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]},'dialog '+id+' '+theme+' '+width);
   assert(await d.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   if(out){await d.evaluate(e=>e.scrollTop=0);await d.screenshot({path:path.join(out,`dialog-${id}-${theme}-${width}.png`),animations:'disabled'});}
   await page.keyboard.press('Escape');assert.equal(await page.locator('#home-highlight-dialog[open]').count(),0);assert(!page.url().includes('vineta='));assert(await trigger.evaluate(e=>e===document.activeElement));
   await page.goto(base+'#inicio?vineta='+id);await ready();await page.locator('#home-highlight-dialog[open]').waitFor();await page.reload();await ready();await page.locator('#home-highlight-dialog[open]').waitFor();await page.locator('[data-highlight-close]').click();assert(!page.url().includes('vineta='));
  }
  await page.goto(base+'#inicio');await ready();await page.locator('#home-highlight-query').fill('pauta');await page.locator('#home-highlight-query').press('Enter');await page.locator('#budget-search-body [data-search-result]').first().waitFor();assert(page.url().includes('#buscar?q=pauta'));await page.keyboard.press('Escape');
  await page.goto(base+'#evolucion');await ready();assert.equal(await page.locator('#execution-series').inputValue(),'currentPrimary');assert.match(normal(await page.locator('.history-impact').innerText()),/122%/);
  if(out)await page.locator('.execution-history').screenshot({path:path.join(out,`history-${theme}-${width}.png`),animations:'disabled'});
  for(const series of ['total','capital','revenue']){await page.goto(base+'#evolucion?serie='+series);await ready();assert.equal(await page.locator('#execution-series').inputValue(),series);await page.reload();await ready();assert.equal(await page.locator('#execution-series').inputValue(),series);}
 }
 await page.evaluate(async()=>{state.view='history';state.executionSeries=undefined;await render();});await ready();assert.equal(await page.locator('#execution-series').inputValue(),'currentPrimary');
 // Fast scroll never strands any section at opacity 0, and reduced motion is respected.
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'#inicio');await ready();await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert(await page.locator('.citizen-home>section').evaluateAll(es=>es.every(e=>Number(getComputedStyle(e).opacity)>0)));await page.waitForTimeout(270);assert(await page.locator('.citizen-home>section').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')));
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'#inicio');await ready();assert.equal(await page.locator('.reveal-ready').count(),0);assert.equal(await page.locator('.hero-request').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.goto(base+'#proyecto-2027?vista=expenses&apertura=personnel');await ready();assert.equal(await page.locator('.personnel-area-track').count(),22);await page.emulateMedia({reducedMotion:'no-preference'});
 console.log('Viñetas: dos temas, 375/1440, teclado, cuatro enlaces recargables, buscador, movimiento reducido y apertura histórica comprobados.');
};
if(require.main===module)(async()=>{const{chromium}=require('playwright'),browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||undefined,headless:true}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await module.exports({page,base:process.env.SITE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
