const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const reports=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/budget/2027/area-reports.json'),'utf8'));
module.exports=async function({page,base}){
 await page.goto(base);await page.waitForFunction(()=>document.querySelector("main")?.getAttribute("aria-busy")==="false");
 for(const theme of ['light','dark']){
  await page.evaluate(t=>CabaTheme.set(t),theme);
 for(const width of [1440,375]){
  await page.setViewportSize({width,height:1000});
  for(const comparison of ['initial','current']){
   await page.goto(base+'#proyecto-2027?vista=areas&base='+comparison);await page.locator('.gov-cards').waitFor();
   assert.equal(await page.locator('#gov-base').inputValue(),comparison);assert.equal(await page.locator('.gov-card').count(),22);
   await page.locator('#gov-directory-sort').selectOption('increase');
   const largest=[...reports.areas].sort((a,b)=>b.project2027/b[comparison+'2026']-a.project2027/a[comparison+'2026'])[0];
   assert((await page.locator('.gov-card').first().getAttribute('href')).includes('area='+largest.code+'&'));
   await page.locator('.gov-card').first().click();await page.locator('.gov-kpis').waitFor();assert.equal(await page.locator('#gov-base').inputValue(),comparison);
   await page.locator('[data-gov-directory]').click();await page.locator('.gov-cards').waitFor();assert.equal(await page.locator('#gov-base').inputValue(),comparison);
   for(const a of reports.areas){
    await page.goto(base+'#proyecto-2027?vista=areas&area='+a.code+'&base='+comparison);await page.locator(`.gov-kpis[data-gov-area="${a.code}"][data-gov-base="${comparison}"]`).waitFor();
    assert.equal(await page.locator('#gov-base').inputValue(),comparison);
    assert.equal(await page.locator('.gov-composition-stack').count(),['98','99'].includes(a.code)?0:1);if(!['98','99'].includes(a.code)){const groupCount=[['1','2','3'],['4'],['5'],['6','7','8']].filter(codes=>a.objects.some(o=>codes.includes(o.code)&&o.project2027>0)).length;assert.equal(await page.locator('.gov-composition-stack>i').count(),groupCount);assert(await page.locator('.gov-composition-stack').evaluate(n=>Math.abs([...n.children].reduce((sum,c)=>sum+c.getBoundingClientRect().width,0)+3*(n.children.length-1)-n.getBoundingClientRect().width)<1));}
    const detail=JSON.parse(fs.readFileSync(path.join(__dirname,'..',a.detailFile),'utf8'));
    assert.equal(await page.locator('.gov-ranking article').count(),detail.units.length);
    assert((await page.locator('.gov-readings>ol>li').count())>=1);assert((await page.locator('.gov-readings>ol>li').count())<=5);if(width<=650)await page.locator('.mobile-section[data-section="gov-ranking"]>summary').click();assert.equal(await page.locator('.gov-ranking article:visible').count(),Math.min(8,detail.units.length));
    const invalid=await page.evaluate(()=>{
     const bad=[];for(const node of document.querySelectorAll('main *')){
      const values=[...node.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent);
      for(const attr of ['aria-label','title','data-viz-tip'])if(node.hasAttribute(attr))values.push(node.getAttribute(attr));
      for(const v of values)for(const m of v.matchAll(/([−+\-]?)(\d+(?:\.\d{3})*),(\d+)\s*%/g))if(Number(m[2].replaceAll('.',''))>=10||m[3].length!==1)bad.push(m[0]);
     }return [...new Set(bad)];
    });assert.deepEqual(invalid,[],a.code+' percentage formatting');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),a.code+' overflow '+width);
    const renderedMovements=await page.locator('#gov-changes .gov-contribution').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.govProgram,base:n.dataset.movementBase,rate:n.dataset.movementRate,delta:Number(n.dataset.movementDelta)})));
    for(const m of renderedMovements){const p=detail.programs.find(p=>p.id===m.id);assert.equal(m.base,['21','35'].includes(a.code)?'current2026':comparison+'2026');assert.equal(m.delta,p.project2027/reports.deflator.factor-p[m.base]);if(m.rate!=='')assert.equal(Number(m.rate),100*(p.project2027/reports.deflator.factor/p[m.base]-1));}
    const before=await page.locator('.gov-readings>ol').innerText().then(text=>text.replace(/\u00a0/g,' '));if(detail.units.length>8){await page.locator('.gov-ranking-rest>summary').click();assert.equal(await page.locator('.gov-ranking article:visible').count(),detail.units.length);}if(width<=650)await page.locator('.mobile-base>summary').click();await page.locator('#gov-base').selectOption(comparison==='initial'?'current':'initial');await page.locator(`.gov-kpis[data-gov-area="${a.code}"][data-gov-base="${comparison==='initial'?'current':'initial'}"]`).waitFor();
    if(!['21','35'].includes(a.code)&&a.initial2026!==a.current2026&&(a.economic.currentCore||a.economic.investmentCore))assert.notEqual(await page.locator('.gov-readings>ol').innerText().then(text=>text.replace(/\u00a0/g,' ')),before,a.code+' stale readings');
    if(process.env.QA_SCREENSHOTS&&['31','40','21'].includes(a.code)&&comparison==='initial'){
     fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.locator('.gov-readings').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`area-${a.code}-${width}.png`)});
    }
   }
  }
 }
 }
 await page.evaluate(()=>CabaTheme.set('light'));
 console.log('Áreas: 22 fichas × 2 bases × 2 temas × escritorio/375 px (176 fichas); controles, destacados dinámicos, formato y ausencia de desbordamiento verificados.');
};
if(require.main===module)(async()=>{const {chromium}=require('playwright'),browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await module.exports({page,base:process.env.SMOKE_BASE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
