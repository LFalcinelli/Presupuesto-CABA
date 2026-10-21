const assert=require('node:assert/strict'),{auditTheme}=require('./theme-route-reading.cjs');
module.exports=async({page,base})=>{
 const ready=()=>page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');
 for(const width of [375,1440])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
  let home;
  for(const route of ['#inicio','#buscar?q=salud','#inicio?vineta=2']){
   await page.goto(base+route);await ready();await page.evaluate(async t=>{CabaTheme.set(t);await render();},theme);await ready();
   assert(await page.locator('.hero-request').isHidden());assert(await page.locator('.hero-own-taxes').isHidden());assert(await page.locator('.project-hero').isHidden());
   const text=await page.locator('.home-highlights').textContent();if(!home)home=text;else assert.equal(text,home);
   assert.equal(await page.locator('.highlight-project-total a').getAttribute('href'),'#proyecto-2027?vista=summary');
   assert.equal(await page.locator('.fm-heading .eyebrow').textContent(),'PRESUPUESTO 2027');
   assert(!/déficit económico/i.test(await page.locator('main').textContent()));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(route.includes('vineta')){const t=await page.locator('#home-highlight-body').innerText();assert.match(t,/588.821/);assert.match(t,/268.478/);assert.match(t,/No hay proyección oficial/);assert.match(t,/No es un resultado asegurado/);await page.keyboard.press('Escape');}
   if(route.includes('buscar'))await page.keyboard.press('Escape');
   assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]});
  }
  assert(!(await page.locator('[data-highlight-card="1"] h2').innerText()).includes('(sin intereses)'));const text=(await page.locator('[data-highlight-card="2"]').innerText()).replace(/\u00a0/g,' ');assert.match(text,/ESCENARIO ESTIMADO/);assert.match(text,/≈ −\$588.821 millones · estimado/);assert.match(text,/≈ −\$268.478 millones · estimado/);
  await page.evaluate(async()=>{Object.assign(state.config.flags,{homeProjectHero:true,homeOwnTaxes:true,homeClosing2026Projection:false});await render();});await ready();
  assert(await page.locator('.hero-request').isVisible());assert(await page.locator('.hero-own-taxes').isVisible());assert.match(await page.locator('[data-highlight-card="2"]').innerText(),/1er SEMESTRE 2026 · SUPERÁVIT/);
  await page.evaluate(async()=>{Object.assign(state.config.flags,{homeProjectHero:false,homeOwnTaxes:false,homeClosing2026Projection:true});await render();});await ready();
 }
 await page.emulateMedia({reducedMotion:'no-preference'});console.log('v15 A: rutas equivalentes, banderas reversibles y estimaciones visibles; contraste y ancho en cuatro estados.');
};
if(require.main===module)(async()=>{const{chromium}=require('playwright'),b=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined}),page=await b.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await module.exports({page,base:process.env.SITE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
