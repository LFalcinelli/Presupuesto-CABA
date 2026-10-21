const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{auditTheme}=require('./theme-route-reading.cjs');
module.exports=async({page,base})=>{
 const reports=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/budget/2027/area-reports.json'),'utf8')),ready=()=>page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');
 for(const width of [375,1440])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'#proyecto-2027?vista=areas');await ready();await page.evaluate(async t=>{CabaTheme.set(t);await render();},theme);await ready();
  assert.equal(await page.locator('.gov-card-people small').count(),0);assert.equal((await page.locator('main').innerText()).match(/Padrón 2026 · corte exacto no publicado/g)?.length,1);
  for(const area of reports.areas){
   await page.goto(base+'#proyecto-2027?vista=areas&area='+area.code+'&base=initial');await ready();
   const rows=page.locator('#gov-readings>ol>li'),count=await rows.count();assert(count>=3&&count<=6,area.code+' count');assert.equal(await rows.locator('.gov-reading-title').count(),count);
   const texts=await rows.locator(':scope>span').allTextContents();assert(texts.every(t=>!/[¿?]|votado/.test(t)),area.code+' single base');
   if(await rows.locator('[data-reading-kind="advertising"]').count())assert.equal(await rows.last().getAttribute('data-reading-kind'),'advertising');
   const kinds=await rows.evaluateAll(es=>es.map(e=>e.dataset.readingKind));if(kinds.includes('advertising'))assert.equal(kinds.at(-1),'advertising');
   const before=await page.locator('#gov-readings').textContent();await page.goto(base+'#proyecto-2027?vista=areas&area='+area.code+'&base=current');await ready();assert.equal(await page.locator('#gov-readings').textContent(),before,area.code+' stable base');
   assert(!/nbsp;/.test(await page.locator('main').innerText()));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]},area.code+' '+width+' '+theme);
  }
  await page.goto(base+'#ingresos?periodo=2026-2');await ready();const income=await page.locator('.income-comparison').innerText();assert(!income.includes('nbsp;'));for(const n of ['8,02','8,31','8,58'])assert(income.replace(/\u00a0/g,' ').includes('$ '+n),n+' currency preserved');
  await page.goto(base+'#estructura');await ready();assert(!/0 personas en este nivel/.test(await page.locator('.government-count').innerText()));
  await page.goto(base+'#evolucion?serie=currentPrimaryPbg');await ready();assert.match(await page.locator('main').innerText(),/producto bruto de la Ciudad \(PBG\)/i);
 }
 await page.evaluate(()=>{const t=document.createElement('section');t.innerHTML='<p>CeSACs</p><p>producto bruto de la Ciudad (<button>PBG</button>)</p><p>IVC e IVC</p>';expandCitizenAcronyms(t);window.v15AcronymProbe=t.textContent;});assert.match(await page.evaluate(()=>window.v15AcronymProbe),/Centros de Salud y Acción Comunitaria \(CeSACs\)/);assert(!(await page.evaluate(()=>window.v15AcronymProbe)).includes('Ciudad (producto bruto'));await page.emulateMedia({reducedMotion:'no-preference'});console.log('v15 B: 22 fichas con titulares y publicidad última; base fija, cifras legibles y contraste en cuatro estados.');
};
if(require.main===module)(async()=>{const{chromium}=require('playwright'),b=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined}),page=await b.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await module.exports({page,base:process.env.SITE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
