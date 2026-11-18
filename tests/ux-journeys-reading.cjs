const assert=require('node:assert/strict');
const {auditTheme}=require('./theme-route-reading.cjs');

module.exports=async({page,base})=>{
 const ready=()=>page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');
 for(const width of [320,375,1440])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'#inicio');
  await ready();
  await page.evaluate(async theme=>{CabaTheme.set(theme);await render();},theme);
  await page.getByRole('button',{name:'Explorar los datos',exact:true}).click();
  await ready();
  if(width<=650)await page.locator('#mobile-period').selectOption('project');
  else await page.locator('#period-tabs [data-project-tab="summary"]').click();
  await ready();
  assert.match(await page.locator('.project-reading-cards article').first().innerText(),/24,1\s+billones/);
  assert(await page.locator('.project-overview').evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('.page-index'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  assert(await page.locator('.fiscal-flow-panel').evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('.area-search'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  if(width<=650){
   for(const label of ['Resumen','Gastos','Ingresos','Áreas']){
    const box=await page.locator('.tabs').getByRole('button',{name:label,exact:true}).boundingBox();
    assert(box.x>=0&&box.x+box.width<=width+1,label+' cabe completo');
   }
  }
  await page.locator('.page-index').evaluate(el=>el.open=true);
  await page.locator('[data-page-anchor="obras-2027"]').click();
  assert(page.url().includes('bloque=obras-2027'));
  await page.reload();
  await ready();
  await page.waitForFunction(()=>document.getElementById('obras-2027')===document.activeElement);
  assert(await page.locator('#obras-2027').evaluate(el=>el.open));
  assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]});
  await page.goto(base+'#comparar');
  await ready();
  assert(await page.locator('#province-pair').evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('.national-layout'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  assert.equal(await page.locator('#province-select').count(),1);
  assert.equal(await page.locator('#province-select').inputValue(),'06');
  assert.match(await page.locator('.pair-identities').innerText(),/votado/i);
  await page.locator('#comparison-budget-base').selectOption('current');
  await ready();
  assert.match(await page.locator('.pair-budget-stage').first().innerText(),/septiembre|30\/09/);
  await page.locator('#province-select').focus();
  await page.keyboard.press('ArrowDown');
  const province=await page.locator('#province-select').inputValue();
  assert.notEqual(province,'06');
  assert(await page.locator('#province-select').evaluate(el=>el===document.activeElement));
  await page.reload();
  await ready();
  assert.equal(await page.locator('#province-select').inputValue(),province);
  assert.equal(await page.locator('#comparison-budget-base').inputValue(),'current');
  await page.locator('.page-index').evaluate(el=>el.open=true);
  await page.locator('[data-page-anchor="comparison-landscape"]').click();
  assert(page.url().includes('provincia='+province));
  assert(page.url().includes('presupuesto=ampliado'));
  await page.locator('[data-compare-display="map"]').click();
  await ready();
  assert.equal(await page.locator('.map-frame').count(),1);
  assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#arg-indicator').selectOption('employeesRate');
  await ready();
  assert.match(await page.locator('.pair-sheet>.pair-metrics dt').first().innerText(),/Puestos públicos/);
  assert.equal(await page.locator('.pair-sheet>.pair-metrics dt').filter({hasText:'Puestos públicos'}).count(),1);
  await page.goto(base+'#presupuesto-explicado?tema=ejecutado');
  await ready();
  assert(await page.locator('#pregunta-ejecutado').evaluate(el=>el.open));
  if(width<=650){
   await page.goto(base+'#inicio');
   await ready();
   await page.locator('.fm-data-table').evaluate(el=>{
    for(let ancestor=el;ancestor;ancestor=ancestor.parentElement)if(ancestor.tagName==='DETAILS')ancestor.open=true;
   });
   const wrapper=page.locator('.fm-data-table .table-wrap');
   await page.waitForFunction(()=>document.querySelector('.fm-data-table .table-wrap').classList.contains('table-overflow'));
   assert.equal(await wrapper.getAttribute('tabindex'),'0');
   assert.match(await wrapper.getAttribute('aria-label'),/Recursos y destinos/);
   await wrapper.focus();
   await page.keyboard.press('ArrowRight');
   await page.waitForFunction(()=>document.querySelector('.fm-data-table .table-wrap').scrollLeft>0);
   assert.equal(await page.locator('.fm-data-table .table-scroll-hint:visible').count(),1);
   assert.deepEqual(await auditTheme(page),{text:[],surfaces:[]});
  }
 }
 await page.setViewportSize({width:1440,height:1000});
 await ready();
 assert.equal(await page.locator('.main-nav [data-view="summary"]').innerText(),'Explorar los datos');
 assert.equal(await page.locator('.main-nav [data-view="explained"]').innerText(),'Presupuesto explicado');
 await page.emulateMedia({reducedMotion:'no-preference'});
 console.log('Recorridos UX: navegación, Resumen 2027, comparación bilateral, bases recargables y tablas por teclado en ambos temas y tres anchos.');
};
