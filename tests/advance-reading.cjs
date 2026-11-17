const assert=require('node:assert/strict'),{auditTheme}=require('./theme-route-reading.cjs');
module.exports=async({page,base})=>{
 const ready=()=>page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');
 const go=async h=>{await page.goto(base+h);await ready();};
 for(const width of [375,1440])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:940});await page.emulateMedia({reducedMotion:'reduce'});
  await go('#explorar?periodo=2026-3');await page.evaluate(async t=>{CabaTheme.set(t);await render();},theme);await ready();
  assert.match(await page.locator('main').innerText(),/984\.125\s+millones/);
  assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]});
  assert(await page.locator('.tabs [data-view="income"]').evaluate(n=>{
   const tab=n.getBoundingClientRect(),list=n.parentElement.getBoundingClientRect();
   return tab.left>=list.left&&tab.right<=list.right+1&&tab.right<=innerWidth;
  }));
  await page.getByRole('button',{name:'Explorar gastos'}).click();await ready();
  await page.locator('#quarter-dimension').selectOption('jurisdictions');await ready();
  await page.locator('[data-quarter-group="40"]').click();await ready();
  assert(page.url().includes('grupo3t=40'));await page.reload();await ready();
  assert.match(await page.locator('main h2').first().innerText(),/Salud/);
  await page.locator('#quarter-measure').selectOption('v');await ready();
  assert(page.url().includes('monto=vigente'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]});
  await go('#ingresos?periodo=2026-3');assert.match(await page.locator('main').innerText(),/12,67.*billones/);
  await page.locator('button[data-income="1.11.3.6"]').first().click();await ready();
  assert.match(await page.locator('main h1').innerText(),/Ingresos Brutos/i);
  await go('#metodologia?seccion=avance-2026');assert.match(await page.locator('main').innerText(),/Expediente legislativo 3561\/2026/);
  await go('#proyecto-2027?vista=areas&area=40&base=current');
  assert.match(await page.locator('.gov-kpis').innerText(),/septiembre/);
  assert.match(await page.locator('#gov-readings').innerText(),/junio/);
 }
 console.log('3T 2026: navegación, aperturas, fechas y contraste verificados en móvil/escritorio y ambos temas.');
};
if(require.main===module)(async()=>{
 const {chromium}=require('playwright'),b=await chromium.launch({channel:process.env.BROWSER_CHANNEL||undefined});
 const page=await b.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{await module.exports({page,base:process.env.SITE_URL||'http://127.0.0.1:8771/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
