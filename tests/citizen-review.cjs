const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async function({page,base}){
 const root=path.join(__dirname,'..'),load=p=>JSON.parse(fs.readFileSync(path.join(root,p))),stages=load('data/budget/2027/stages.json'),comparison=load('data/budget/2027/comparison-2026.json'),budget=load('data/budget/2026/2026-2.json'),income=load('data/revenue/income-2026-2.json');
 const expected=(key,r,base)=>{
  if(base==='current')return r.reference;
  if(['purposes','objects'].includes(key))return stages.groups[key].find(s=>s.name===r.name).initial;
  if(['revenue','taxRevenue'].includes(key))return income.rows.find(s=>s.codes.join('.')===r.referenceCode).s;
  const dim={functions:7,jurisdictions:1,economic:9}[key];return budget.rows.filter(s=>s.fiscal&&(key==='economic'?s.codes[9].startsWith(r.id==='current'?'21':'22'):key==='jurisdictions'?s.codes[1]===r.jurisdictionCode:s.codes[7]===r.id)).reduce((sum,s)=>sum+s.s,0);
 };
 const ready=()=>page.waitForFunction(()=>document.querySelector('#content')?.getAttribute('aria-busy')==='false');
 for(const width of [1440,375]){
  await page.setViewportSize({width,height:1000});
  for(const baseName of ['initial','current']){
   await page.goto(base+'#proyecto-2027?vista=summary&base='+baseName);await ready();
   assert.equal(await page.locator('#project-review-base').inputValue(),baseName);
   const actual=await page.evaluate(()=>Object.fromEntries(Object.keys(state.projectComparison.groups).map(key=>[key,reviewComparisonRows(key).map(r=>({a:r.a,b:r.b}))])));
   for(const [key,rows] of Object.entries(comparison.groups))rows.forEach((r,i)=>{assert.equal(actual[key][i].a,expected(key,r,baseName));assert.equal(actual[key][i].b,r.project/comparison.deflator.factor);});
   assert.equal(await page.locator('.fiscal-result-card:visible').count(),1);assert.equal(await page.locator('.fiscal-steps-disclosure').getAttribute('open'),null);
   await page.locator('.fiscal-steps-disclosure>summary').click();assert.equal(await page.locator('.fiscal-result-card:visible').count(),4);
   assert((await page.locator('.project-key-readings').innerText().then(text=>text.replace(/\u00a0/g,' '))).includes('99,8%'));
   for(const tab of ['expenses','revenue','areas','summary']){await page.locator(`.tabs [data-project-tab="${tab}"]`).click();await ready();assert(page.url().includes('base='+baseName));assert.equal(await page.locator(tab==='areas'?'#gov-base':'#project-review-base').inputValue(),baseName);}
  }
  await page.goto(base+'#proyecto-2027?vista=revenue');await ready();assert.equal(await page.locator('#project-review-base').inputValue(),'current');
  assert.equal(await page.locator('.income-composition .treemap-tile').count(),0);assert.equal(await page.locator('.production-group').count(),1);
  await page.locator('.review-bar-children button').filter({hasText:'Ingresos Brutos'}).click();await page.locator('#reading-detail-dialog[open]').waitFor();assert((await page.locator('#reading-detail-body').innerText().then(text=>text.replace(/\u00a0/g,' '))).includes('13.279.892.329.152'));await page.keyboard.press('Escape');
  await page.goto(base+'#presupuesto-explicado?tema=servicios');await ready();assert(await page.locator('#pregunta-servicios').evaluate(n=>n.open));assert((await page.locator('#pregunta-servicios').innerText().then(text=>text.replace(/\u00a0/g,' '))).includes('publicidad'));
  await page.goto(base+'#comparar');await ready();assert.equal(await page.locator('#comparison-budget-base').inputValue(),'initial');assert.equal(await page.locator('#arg-indicator option[value="budgetArea"],#arg-indicator option[value="expenseArea"]').count(),0);assert.equal(await page.locator('#arg-indicator optgroup').count(),5);
  assert((await page.locator('.pair-panel').innerText().then(text=>text.replace(/\u00a0/g,' '))).includes('Primer trimestre:'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 console.log('Revisión integral: bases verificadas independientemente en siete aperturas, elección conservada, saldos plegados, ingresos y glosario navegables; escritorio y 375 px.');
};
