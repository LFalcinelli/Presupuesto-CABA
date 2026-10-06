const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async({page,browser,base})=>{
 const caif=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/fiscal-results/caif.json'))),provinces=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/provinces/comparisons-argentina.json')));
 const number=n=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(n);
 const ready=()=>page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#inicio');await ready();
  assert(await page.locator('.project-questions').evaluate(e=>!!(e.compareDocumentPosition(document.querySelector('.fiscal-readings'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  assert(!await page.locator('.hero-data').innerText().then(t=>/paga.*impuestos/i.test(t)));
  await page.goto(base+'#explorar?periodo=2025-4');await ready();
  const closed=caif.periods['2025-4'];assert((await page.locator('.fiscal-main-result').innerText()).includes(number(Math.abs(closed.financialResult))));assert((await page.locator('.fiscal-main-result h2').innerText()).includes('déficit'));
  assert.equal(await page.locator('.fiscal-account-detail').count(),1);assert.equal(await page.locator('.fiscal-summary .fiscal-kpis').count(),0);
  await page.locator('.fiscal-account-detail>summary').click();assert.equal(await page.locator('.fiscal-account-detail tbody tr').count(),10);
  assert((await page.locator('.fiscal-account-detail').innerText()).includes(number(closed.income)));assert((await page.locator('.fiscal-account-detail').innerText()).includes(number(closed.expense)));
  if(width<650){assert.equal(await page.locator('#period-tabs').isVisible(),false);await page.locator('#mobile-period').selectOption('2026-2');}else await page.locator('[data-period="2026-2"]').click();await ready();
  assert(page.url().includes('2026-2'));assert((await page.locator('.fiscal-main-result h2').innerText()).includes('superávit'));
  const semester=await page.locator('.semester-bars').innerText();for(const r of caif.context.semesters){assert(semester.includes(String(r.year)));assert(semester.includes(new Intl.NumberFormat('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1}).format(r.financialRatio)));}
  if(width<650)await page.locator('#mobile-period').selectOption('history');else await page.locator('#period-tabs [data-view="history"]').click();await ready();assert.equal(await page.locator('.tabs').isVisible(),false);
  assert((await page.locator('.history-impact').innerText()).includes('descontando la inflación'));await page.locator('#execution-year').selectOption('1997');assert((await page.locator('#execution-point').innerText()).includes('criterio distinto'));assert(!(await page.locator('#execution-point').innerText()).includes('Etapa definitiva'));
  await page.goto(base+'#comparar');await ready();assert.equal(await page.locator('#pair-province').inputValue(),'06');
  assert.deepEqual(await page.locator('.pair-identities h3').allTextContents(),['CABA','Buenos Aires']);
  assert(await page.locator('.pair-silhouette').evaluateAll(es=>es.every(e=>e.getAttribute('viewBox').split(' ').every(v=>Number.isFinite(+v))&&e.querySelector('path').getBBox().width>0)));
  for(const id of ['06','14']){
   await page.locator('#pair-province').selectOption(id);const p=provinces.periods.find(p=>p.id==='2026-2'),r=p.rows.find(r=>r.id===id),c=p.rows.find(r=>r.id==='02');
   assert.deepEqual(await page.locator('.pair-identities h3').allTextContents(),['CABA',r.name]);
   const values=await page.locator('.pair-sheet>.pair-metrics>div').first().locator('dd').allTextContents();assert.deepEqual(values,['$ '+number(c.indicators.budgetPc),'$ '+number(r.indicators.budgetPc)]);
  }
  await page.locator('.pair-additional>summary').filter({hasText:'Gastos e ingresos del cierre 2025'}).click();assert.equal(await page.locator('.pair-additional[open] .pair-metrics>div').count(),18);
  assert((await page.locator('.pair-additional[open]').innerText()).includes('no al presupuesto 2026'));
  await page.locator('.pair-additional>summary').filter({hasText:'Puestos públicos'}).click();assert((await page.locator('.pair-additional[open]').last().innerText()).includes('No equivale a cantidad de funcionarios políticos'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(base+'#gastos?periodo=2026-2');await ready();
  assert(await page.locator('.treemap-figure figcaption').first().isVisible());
  const small=await page.locator('.rect-treemap').first().locator('.tile-no-label .tile-marker').allTextContents(),legend=await page.locator('.treemap-figure').first().locator('.treemap-labels b').allTextContents();assert.deepEqual(legend,small);
  for(const label of await page.locator('.treemap-labels button').all())assert(await label.innerText());
  if(width<650){assert(await page.locator('.main-nav .wrap').evaluate(e=>e.scrollWidth<=e.clientWidth+1));assert(await page.locator('#mobile-period').isVisible());}
 }
 if(process.env.QA_SCREENSHOTS){const out=path.resolve(process.env.QA_SCREENSHOTS);fs.mkdirSync(out,{recursive:true});for(const [name,route,selector,width] of [['comparacion','#comparar','.pair-panel',1366],['cuenta-2025','#explorar?periodo=2025-4','.fiscal-summary',1366],['gastos-mobile','#gastos?periodo=2026-2','.panel',390],['inicio','#inicio','.citizen-home',1366]]){const capture=await browser.newPage({viewport:{width,height:1000}});await capture.goto(base+route);await capture.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');await capture.evaluate(()=>document.fonts.ready);if(name==='comparacion'){await capture.locator(selector).first().evaluate(e=>e.scrollIntoView({block:'start'}));await capture.screenshot({path:path.join(out,name+'.png')});}else if(name==='inicio')await capture.screenshot({path:path.join(out,name+'.png'),fullPage:true});else await capture.locator(selector).first().screenshot({path:path.join(out,name+'.png')});await capture.close();}}
 console.log('Lectura ciudadana: saldos, navegación móvil, etiquetas y comparación bilateral con períodos separados verificados.');
};
