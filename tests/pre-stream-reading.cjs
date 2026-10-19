const assert=require('node:assert/strict');
module.exports=async function({page,base}){
 for(const theme of ['light','dark'])for(const width of [375,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#inicio');await page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');await page.evaluate(t=>CabaTheme.set(t),theme);await page.evaluate(()=>render());
  assert.match(await page.locator('.hero-own-taxes').innerText(),/5,4\s+millones/);assert.equal(await page.locator('[data-feedback]:visible').count(),0);
  assert.equal(await page.locator('#theme-toggle').getAttribute('aria-label'),'Tema: '+(theme==='dark'?'oscuro':'claro')+' (cambiar)');assert.equal(await page.locator('#theme-toggle svg').count(),1);
  for(const route of ['#explorar?periodo=2025-4','#explorar?periodo=2026-2','#proyecto-2027?vista=summary']){
   await page.goto(base+route);await page.evaluate(()=>render());
   const result=await page.evaluate(()=>{const n=document.querySelector('[data-fiscal-balance="label"]'),color=getComputedStyle(document.documentElement).getPropertyValue(n.classList.contains('is-deficit')?'--expense':'--income').trim(),probe=document.createElement('span');probe.style.color=color;document.body.append(probe);const expected=getComputedStyle(probe).color;probe.remove();return {label:n.textContent,group:!!n.closest('[data-fiscal-group]'),expected,actual:getComputedStyle(n.querySelector('strong')).color,ribbons:[...document.querySelectorAll('path[data-fiscal-balance]')].map(r=>getComputedStyle(r).fill),groupBalances:[...document.querySelectorAll('[data-fiscal-group]')].filter(n=>/Déficit:|Superávit:/.test(n.textContent)).length};});
   assert.equal(result.group,false);assert.equal(result.groupBalances,0);assert.equal(result.actual,result.expected);assert(result.ribbons.length>=2);assert(result.ribbons.every(c=>c===result.expected));assert.match(result.label,/2025/.test(route)?/Déficit: lo que faltó/:/Superávit: lo que quedó/);
  }
  await page.goto(base+'#evolucion');await page.evaluate(()=>render());await page.locator('.history-values>summary').click();assert.equal(await page.locator('.history-compact tbody tr').count(),31);assert.equal(await page.locator('.history-compact thead th').count(),3);assert.equal(await page.locator('.history-full-values').evaluate(n=>n.open),false);if(width===375)assert((await page.locator('.history-compact').boundingBox()).height<1600);
  await page.goto(base+'#proyecto-2027?vista=expenses&grafico=bars');await page.evaluate(()=>render());assert.equal(await page.locator('.expense-composition .production-group .review-bar-track>i').first().evaluate(n=>getComputedStyle(n).backgroundColor),theme==='dark'?'rgb(199, 179, 240)':'rgb(103, 51, 155)');
 }
 await page.goto(base+'#proyecto-2027?vista=areas&ordenAreas=amplification');await page.evaluate(()=>render());assert.equal(await page.locator('#gov-directory-sort').inputValue(),'amplification');assert.match(await page.locator('.gov-card-change').first().textContent(),/durante 2026/);
 for(const query of ['servicios de higiene urbana','AUTODROMO','Gestion Electoral']){
  await page.goto(base+'#proyecto-2027?vista=summary');await page.evaluate(()=>render());await page.locator('#area-report-search').fill(query);const button=page.locator('#area-report-results button').filter({hasText:'Programa ·'}).first();assert.match(await button.innerText(),/Programa/);await button.click();await page.locator('.search-report [data-search-exit]').first().click();await page.waitForSelector('#gov-program');assert.match(await page.locator('#gov-program').getAttribute('class'),/search-selected-program/);assert(new URLSearchParams((await page.url()).split('?')[1]).has('programa'));
 }
 console.log('Pre-stream: saldos separados y colores, tabla, tema, barras, ampliación y búsqueda de programas verificados.');
};
