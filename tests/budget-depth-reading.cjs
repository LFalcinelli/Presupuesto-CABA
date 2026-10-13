const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {auditTheme}=require('./theme-route-reading.cjs');
module.exports=async({page,base})=>{
 const contrast=[];await page.emulateMedia({reducedMotion:'reduce'});
 for(const theme of ['light','dark'])for(const width of [375,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#proyecto-2027?vista=areas');await page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');await page.evaluate(t=>CabaTheme.set(t),theme);await page.evaluate(()=>render());
  for(const view of ['execution','structure','services','transfers','debt','support','positions']){
   if(width===375)await page.locator('#depth-view').selectOption(view);else await page.locator(`[data-depth-view="${view}"]`).click();await page.waitForFunction(v=>state.budgetDepthView===v&&document.querySelector('main')?.getAttribute('aria-busy')==='false',view);
   assert.equal(await page.locator('.budget-depth').count(),1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),theme+' '+width+' '+view);
   assert.equal(await page.locator('a[data-depth-download][download]').count(),2);for(const mode of ['source','display']){const link=await page.locator(`a[data-depth-download="${mode}"]`).getAttribute('href');assert.equal((await page.request.get(link)).status(),200);}
   if(view==='execution'){
    await page.locator('#depth-execution-order').selectOption('high');await page.waitForFunction(()=>document.querySelector('[data-execution-area]')?.dataset.executionArea==='75');assert.match(await page.locator('.depth-voted-ranks article').first().innerText(),/223% de lo que votó la Legislatura/);
    await page.locator('#depth-execution-order').selectOption('low');await page.waitForFunction(()=>document.querySelector('[data-execution-area]')?.dataset.executionArea==='31');assert.match(await page.locator('.depth-voted-ranks article').first().innerText(),/Ministerio de Movilidad e Infraestructura/);
    await page.locator('#depth-execution-order').selectOption('high');await page.waitForFunction(()=>document.querySelector('[data-execution-area]')?.dataset.executionArea==='75');
   }
   if(view==='services'){assert.equal(await page.locator('.budget-depth .depth-ranks article').count(),9);await page.locator('.budget-depth .depth-ranks button').filter({hasText:'Otros servicios'}).click();await page.locator('#reading-detail-dialog[open]').waitFor();assert.match(await page.locator('#reading-detail-body').innerText(),/El presupuesto no detalla qué servicios agrupa esta partida/);assert.match(await page.locator('#reading-detail-body').innerText(),/Áreas que concentran/);await page.keyboard.press('Escape');}
   if(view==='transfers')assert.match(await page.locator('.budget-depth').innerText(),/Subterráneos de Buenos Aires/);
   if(view==='structure')for(const metric of ['jurisdictions','units','programs']){await page.locator('#depth-structure-metric').selectOption(metric);await page.waitForFunction(v=>state.depthStructureMetric===v&&document.querySelector('main')?.getAttribute('aria-busy')==='false',metric);assert.equal(await page.locator('.depth-line .depth-forecast-line').count(),0,'No unir fuentes distintas');assert.equal(await page.locator('.depth-line .depth-forecast-point').count(),1);assert(!String(await page.locator('.depth-line path').getAttribute('data-depth-years')).includes('2027'));assert.match(await page.locator('.depth-source-boundary').innerText(),/fuente distinta, no comparable/);if(metric==='programs')assert.match(await page.locator('.depth-line svg').getAttribute('aria-label'),/2027: 499/);}
   if(view==='positions'){assert.equal(await page.locator('.depth-positions-list article:visible').count(),9);assert.match(await page.locator('[data-position-area="31"]').innerText(),/1.022/);assert.match(await page.locator('[data-position-area="31"]').innerText(),/911/);assert(!await page.locator('.budget-depth').innerText().then(t=>/Min\.Infraestructura|Defensoria|1 programas/.test(t)));}
   await page.evaluate(()=>{for(const d of document.querySelectorAll('.budget-depth details'))d.open=false;});
   if(view==='debt')assert.match(await page.locator('.budget-depth').innerText(),/1.995/);
   if(process.env.DEPTH_QA_DIR&&width===375){fs.mkdirSync(process.env.DEPTH_QA_DIR,{recursive:true});await page.locator('.budget-depth').screenshot({path:path.join(process.env.DEPTH_QA_DIR,view+'-'+theme+'.png')});}
   for(const expanded of [false,true]){if(expanded)await page.evaluate(()=>{for(const d of document.querySelectorAll('details'))d.open=true;});const found=await auditTheme(page);contrast.push({theme,width,view,expanded,...found});assert.deepEqual(found,{text:[],surfaces:[]},theme+' '+width+' '+view+' contrast');}
  }
  await page.goto(base+'#proyecto-2027?vista=areas&area=31');await page.waitForSelector('.depth-area');await page.locator('.depth-area>summary').click();assert.match(await page.locator('.depth-area').innerText(),/1.022/);assert.match(await page.locator('.depth-area').innerText(),/911/);assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]},'area details contrast');
 }
 await page.goto(base+'#proyecto-2027?vista=areas&mirada=services&base=current');await page.waitForSelector('.budget-depth');await page.reload();await page.waitForSelector('.budget-depth');assert.match(await page.locator('.budget-depth').innerText(),/presupuesto ampliado 2026/);assert.equal(await page.locator('.budget-depth .depth-ranks article').count(),9);
 console.log('Lecturas: siete vistas en ambos temas y anchos; fuentes, búsqueda de partidas, controles y cargos verificados.');
 if(process.env.DEPTH_QA_DIR)fs.writeFileSync(path.join(process.env.DEPTH_QA_DIR,'contrast-extra.json'),JSON.stringify(contrast,null,2));
};
