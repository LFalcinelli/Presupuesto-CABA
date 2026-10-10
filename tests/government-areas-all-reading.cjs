const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const reports=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/budget/2027/area-reports.json'),'utf8'));
module.exports=async function({page,base}){
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
    assert.equal(await page.locator('.gov-economic-grid article').count(),3);
    const detail=JSON.parse(fs.readFileSync(path.join(__dirname,'..',a.detailFile),'utf8'));
    assert.equal(await page.locator('.gov-ranking article').count(),detail.units.length);
    assert((await page.locator('.gov-readings>ol>li').count())>=5);assert((await page.locator('.gov-readings>ol>li').count())<=7);
    const invalid=await page.evaluate(()=>{
     const bad=[];for(const node of document.querySelectorAll('main *')){
      const values=[...node.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent);
      for(const attr of ['aria-label','title','data-viz-tip'])if(node.hasAttribute(attr))values.push(node.getAttribute(attr));
      for(const v of values)for(const m of v.matchAll(/([−+\-]?)(\d+(?:\.\d{3})*),(\d+)\s*%/g))if(Number(m[2].replaceAll('.',''))>=10||m[3].length!==1)bad.push(m[0]);
     }return [...new Set(bad)];
    });assert.deepEqual(invalid,[],a.code+' percentage formatting');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),a.code+' overflow '+width);
    const before=await page.locator('.gov-readings>ol').innerText();await page.locator('#gov-base').selectOption(comparison==='initial'?'current':'initial');await page.waitForFunction(v=>document.querySelector('.gov-kpis article:nth-child(2)>span')?.textContent.includes(v),comparison==='initial'?'ampliado':'votado');
    if(a.initial2026!==a.current2026&&(a.economic.currentCore||a.economic.investmentCore))assert.notEqual(await page.locator('.gov-readings>ol').innerText(),before,a.code+' stale readings');
    if(process.env.QA_SCREENSHOTS&&['31','40','21'].includes(a.code)&&comparison==='initial'){
     fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.locator('.gov-readings').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`area-${a.code}-${width}.png`)});
    }
   }
  }
 }
 console.log('Áreas: 22 fichas × 2 bases × escritorio/375 px; controles, destacados dinámicos, formato y ausencia de desbordamiento verificados.');
};
if(require.main===module)(async()=>{const {chromium}=require('playwright'),browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await module.exports({page,base:process.env.SMOKE_BASE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
