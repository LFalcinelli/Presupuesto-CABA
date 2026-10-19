const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const pbg=JSON.parse(fs.readFileSync('data/history/pbg-caba.json')),h=JSON.parse(fs.readFileSync('data/history/execution-history.json'));
assert.equal(pbg.rows.length,31);assert(pbg.rows.every(r=>r.pbgNominal>0&&!('nominal'in r)&&!('numerator'in r)));
assert(Math.abs(pbg.link.anchorLegacy*pbg.link.ratio2004-pbg.link.anchorPublished)<1);
assert.equal(pbg.link.exceedsThreePercent,pbg.link.relativeRange>.03);
assert(Math.abs(pbg.rows.find(r=>r.year===2025).pbgNominal-pbg.quarterlyControl.quarterly2025.reduce((a,b)=>a+b,0)*pbg.quarterlyControl.scale)<1);
assert.equal(pbg.assumptions.growth['2027'],2.474341479389266/100);
assert.equal(pbg.assumptions.realGrowth2027Source.remMonth,'2026-09');
for(const r of pbg.rows){assert(['observado','empalmado','provisorio','estimado'].includes(r.status));assert(/^[a-f0-9]{64}$/.test(r.sourceSha256));assert(r.source.page.startsWith('https://'));assert(r.cell&&r.formula);}
for(const y of [2026,2027]){const row=pbg.rows.find(r=>r.year===y),previous=pbg.rows.find(r=>r.year===y-1),prices=pbg.assumptions.priceIndexAnnual;assert.equal(row.status,'estimado');assert.equal(prices[y],h.rows.find(r=>r.year===y).priceIndexAnnual);assert(Math.abs(row.pbgNominal-previous.pbgNominal*(1+pbg.assumptions.growth[y])*prices[y]/prices[y-1])<1);}
const ctx={state:{pbg,executionHistory:h,executionSeries:'currentPrimaryPbg'},ensureViewData:async()=>{},executionRows:()=>[],executionObservation:()=>'',executionHistoryPanel:()=>'',methodPage:()=>''};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/pbg-history.js','utf8'),ctx);
const rows=vm.runInContext('executionRows()',ctx);
for(const row of rows){const original=h.series.currentPrimary.rows.find(r=>r.year===row.year);assert.equal(row.nominal,original.nominal);assert(Math.abs(row.real-original.nominal/row.pbg.pbgNominal*100)<1e-9);}
console.log('PBG: denominador trazable, enlace y conciliación trimestral, REM, precios heredados y 31 cocientes nominales correctos.');
