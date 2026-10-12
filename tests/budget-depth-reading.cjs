const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {auditTheme}=require('./theme-route-reading.cjs');
module.exports=async({page,base})=>{
 const contrast=[];await page.emulateMedia({reducedMotion:'reduce'});
 for(const theme of ['light','dark'])for(const width of [375,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#proyecto-2027?vista=areas');await page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');await page.evaluate(t=>CabaTheme.set(t),theme);await page.evaluate(()=>render());
  for(const view of ['execution','structure','services','transfers','debt','support','positions']){
   if(width===375)await page.locator('#depth-view').selectOption(view);else await page.locator(`[data-depth-view="${view}"]`).click();await page.waitForFunction(v=>state.budgetDepthView===v&&document.querySelector('main')?.getAttribute('aria-busy')==='false',view);
   assert.equal(await page.locator('.budget-depth').count(),1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),theme+' '+width+' '+view);
   assert.equal(await page.locator('a[data-depth-download][download]').count(),1);const link=await page.locator('a[data-depth-download]').getAttribute('href');assert.equal((await page.request.get(link)).status(),200);
   if(view==='services'){assert.equal(await page.locator('.budget-depth .depth-ranks article').count(),9);await page.locator('.budget-depth .depth-ranks button').first().click();await page.locator('#reading-detail-dialog[open]').waitFor();assert.match(await page.locator('#reading-detail-body').innerText(),/Áreas que concentran/);await page.keyboard.press('Escape');}
   if(view==='transfers')assert.match(await page.locator('.budget-depth').innerText(),/Subterráneos de Buenos Aires/);
   if(view==='structure'){await page.locator('#depth-structure-metric').selectOption('programs');await page.waitForFunction(()=>document.querySelector('.depth-line figcaption')?.textContent.includes('Programas'));assert.match(await page.locator('.depth-line svg').getAttribute('aria-label'),/2027: 499/);}
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
