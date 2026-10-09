const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async function compositionReading(page,base){
 const ready=()=>page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const period of ['2026-2','2025-4','2019-4']){
   await page.goto(base+'#gastos?periodo='+period);await ready();
   for(const dimension of ['functions','jurisdictions','objects','economic']){
    await page.locator('#spending-composition').selectOption(dimension);await ready();
    assert(await page.locator('.treemap-tile').count()>0);
    assert.equal(await page.locator('#spending-composition').inputValue(),dimension);
    if(dimension==='economic')assert.equal(await page.locator('.chart-panel .rect-treemap').first().locator('.treemap-tile').count(),2);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width} ${period} ${dimension}`);
   }
   await page.reload();await ready();assert.equal(await page.locator('#spending-composition').inputValue(),'economic');
  }
  for(const period of ['2026-2','2025-4']){
   await page.goto(base+'#ingresos?periodo='+period);await ready();
   assert.equal(await page.locator('.income-composition .treemap-branch').count(),1);
   assert((await page.locator('.treemap-branch-title').innerText()).includes('producción'));
   const iibb=page.locator('.income-composition [data-income="1.11.3.6"]').first();
   assert((await iibb.getAttribute('aria-label')).includes('Ingresos Brutos'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(width===390){await iibb.click();await ready();assert(page.url().includes('rubro=1.11.3.6'));assert((await page.locator('#content h1').innerText()).includes('Ingresos Brutos'));}
  }
  for(const kind of ['expenses','revenue']){
   await page.goto(base+'#proyecto-2027?vista='+kind);await ready();
   const changes=page.locator('[data-budget-changes]');assert(await changes.isVisible());
   assert((await changes.innerText()).includes('2026 ampliado'));
   assert((await changes.innerText()).includes('18%'));
   if(kind==='expenses'){
    for(const dimension of ['functions','jurisdictions','objects','economic']){
     await page.locator('#project-dimension').selectOption(dimension);await ready();
     if(dimension==='functions')assert.equal(await changes.locator('.change-row').count(),20);
     if(dimension==='jurisdictions'){
      assert.equal(await changes.locator('.change-row').count(),22);
      assert((await changes.innerText()).includes('Movilidad'));
     }
    }
   }else{
    assert.equal(await changes.locator('.change-row').count(),6);
    assert.equal(await page.locator('.income-composition .treemap-branch').count(),1);
    assert.equal(await page.locator('.treemap-branch-interior button').filter({hasText:'Sellos'}).count(),1);
    assert(await page.locator('.treemap-branch-interior').evaluate(e=>{const a=e.getBoundingClientRect(),b=e.querySelector('.rect-treemap').getBoundingClientRect();return b.bottom<=a.bottom+1&&b.top>=a.top-1;}));
    if(width===390){await page.locator('.treemap-branch-interior button').first().click();await page.locator('#reading-detail-dialog[open]').waitFor();assert((await page.locator('#reading-detail-body').innerText()).includes('Recurso estimado'));await page.locator('[data-reading-close]').click();}
    await page.locator('#project-revenue-mode').selectOption('taxRevenue');await ready();
    assert.equal(await changes.locator('.change-row').count(),4);
   }
   await page.locator('#budget-change-mode').selectOption('amount');await ready();
   assert((await changes.locator('figcaption').innerText()).includes('billones'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width} ${kind}`);
  }
 }
 await page.goto(base+'#gastos?periodo=2026-2');await ready();await page.locator('#analysis-dim').selectOption('jurisdictions');await ready();
 assert.equal(await page.locator('.semester-analysis .change-row').filter({hasText:'Infraestructura'}).count(),1);
 await page.locator('#analysis-dim').selectOption('functions');await ready();assert.equal(await page.locator('.semester-analysis .change-row').count(),20);
 if(process.env.QA_SCREENSHOTS){const out=path.resolve(process.env.QA_SCREENSHOTS);fs.mkdirSync(out,{recursive:true});for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#proyecto-2027?vista=revenue');await ready();await page.evaluate(()=>document.fonts.ready);
  await page.locator('.income-composition').screenshot({path:path.join(out,`ingresos-composicion-${width}.png`)});
  await page.locator('.budget-real-changes').screenshot({path:path.join(out,`ingresos-variacion-${width}.png`)});
 }}
 assert.deepEqual(errors,[]);console.log('Composición: cuatro aperturas, tres períodos, ingresos navegables, variaciones reales 2027 y jurisdicción 31; escritorio y móvil.');
};
if(require.main===module)(async()=>{const {chromium}=require('playwright'),browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});try{await module.exports(await browser.newPage(),process.env.SITE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
