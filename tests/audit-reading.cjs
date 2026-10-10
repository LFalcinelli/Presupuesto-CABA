const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async({page,base})=>{
 const history=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/history/execution-history.json'))),budget=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/history/budget-history-long.json'))),categories=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/history/category-history.json')));
 const factor=y=>history.rows.find(r=>r.year===y).factor;
 for(const row of budget.rows){assert.equal(row.factor,factor(row.year));assert.equal(row.real,row.nominal*factor(row.year));}
 for(const series of categories.series)for(const row of series.rows){assert.equal(row.factor,factor(row.year));assert.equal(row.real,row.nominal*factor(row.year));}
 assert.equal(budget.rows.at(-1).nominal,19877152039294);
 const ready=()=>page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
 const cleanSources=async()=>{
  const hrefs=await page.locator('#content a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
  assert(!hrefs.some(h=>/\.(?:json|csv|xlsx?|zip)(?:[?#]|$)/i.test(h)),hrefs.join('\n'));
  assert.equal(await page.locator('#content [download]').count(),0);
  const text=await page.locator('#content').textContent();assert(!/archivo aportado|aportado por el usuario|\.xlsx|solapa Análisis|BASE 2T Gestion|benchmark ex ante/.test(text),'No internal source wording: '+text.match(/.{0,80}(?:archivo aportado|aportado por el usuario|\.xlsx|solapa Análisis|BASE 2T Gestion|benchmark ex ante).{0,80}/)?.[0]);
 };
 await page.setViewportSize({width:1440,height:1100});await page.goto(base+'#inicio');await ready();
 await page.locator('.hero-actions [data-project-piece="changes"]').click();await ready();assert(page.url().includes('pieza=changes'));assert(await page.locator('#cambios-2027').evaluate(e=>e.getBoundingClientRect().top<200));
 await page.goto(base+'#inicio');await ready();await page.locator('.hero-actions [data-project-tab="summary"]').first().click();await ready();assert(!page.url().includes('pieza=changes'));
 assert((await page.locator('.annual-price-scenario').innerText()).includes('−0,1%'));assert((await page.locator('.project-reading-cards').innerText()).includes('+2,7%'));
 assert((await page.locator('.project-key-readings').innerText()).includes('5,05 billones'));assert((await page.locator('.project-key-readings').innerText()).includes('100%'));assert(await page.locator('.companion-grid article').first().isVisible());await cleanSources();
 await page.goto(base+'#inicio');await ready();await page.locator('.question-card[data-project-focus="Personal"]').click();await ready();assert(page.url().includes('foco=personal'));assert.equal(await page.locator('.highlight-personal').count(),1);await page.reload();await ready();assert.equal(await page.locator('.highlight-personal').count(),1);
 await page.goto(base+'#comparar');await ready();const updated=await page.locator('.pair-metrics dd').first().innerText();await page.locator('#comparison-budget-base').selectOption('initial');await ready();assert(page.url().includes('presupuesto=inicial'));const initial=await page.locator('.pair-metrics dd').first().innerText();assert.notEqual(updated,initial);assert(initial.includes('5.556.211'));assert((await page.locator('.comparison-context').innerText()).includes('Tierra del Fuego'));await page.reload();await ready();assert.equal(await page.locator('#comparison-budget-base').inputValue(),'initial');assert.equal(await page.locator('.pair-metrics dd').first().innerText(),initial);await cleanSources();
 for(const route of ['#proyecto-2027?vista=revenue','#gastos?periodo=2026-2','#ingresos?periodo=2026-2','#estructura?periodo=2026-2']){
  await page.goto(base+route);await ready();await cleanSources();
  for(const figure of await page.locator('.treemap-figure').all()){
   const badges=await figure.locator('.rect-treemap .tile-marker').allTextContents();assert.equal(new Set(badges).size,badges.length,'Distinct IDs through the nested composition');
   const labels=await figure.locator('.treemap-labels b').allTextContents();assert.equal(new Set(labels).size,labels.length,'Distinct small-tile legend');
  }
  if(route.includes('gastos'))assert((await page.locator('.period-price-reading').innerText()).includes('7,10 billones'));
  if(route.includes('ingresos'))assert((await page.locator('.period-price-reading').innerText()).includes('8,02 billones'));
 }
 await page.goto(base+'#metodologia?seccion=historia');await ready();assert.equal(await page.locator('.method-index a').count(),8);await cleanSources();assert((await page.locator('.method-page').textContent()).split(/\s+/).length<1300);assert((await page.locator('#updated-label').innerText()).includes('09/10/2026'));
 const out=process.env.QA_SCREENSHOTS;
 if(out){fs.mkdirSync(out,{recursive:true});for(const [name,route,width] of [['resumen-auditado','#proyecto-2027?vista=summary',1440],['metodologia-sencilla','#metodologia',1440],['ingresos-auditados-mobile','#proyecto-2027?vista=revenue',390]]){await page.setViewportSize({width,height:1100});await page.goto(base+route);await ready();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});}}
 console.log('Auditoría: mismos precios en CABA, escenarios explícitos, fuentes públicas, rutas diferenciadas y comparación inicial verificadas.');
};
