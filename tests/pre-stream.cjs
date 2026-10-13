const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p));
const d=read('data/revenue/tax-reference-2027.json'),p=read('data/budget/2027/program-index.json'),a=read('data/budget/2027/area-reports.json');
assert.equal(d.ownTaxes,16868229003433);assert.equal(d.ownTaxesPerCapita,d.ownTaxes/3121707);
assert.equal(d.taxes.reduce((s,r)=>s+r.value,0),d.ownTaxes);
assert(Math.abs(d.property2025.items.reduce((s,r)=>s+r.value,0)-d.property2025.total)<.01);
assert.equal(d.property2025.items.length,4);assert.equal(d.budget2026.initial,17344864165159);assert.equal(d.budget2026.current,19877152039294);
assert.equal(p.programs.length,499);assert.equal(new Set(p.programs.map(r=>r.id)).size,499);
for(const area of a.areas){const detail=read(area.detailFile),rows=p.programs.filter(r=>r.areaCode===area.code);assert.equal(rows.length,detail.programs.length);assert.equal(rows.reduce((s,r)=>s+r.project2027,0),area.project2027);for(const row of rows){assert(row.pdfPage>0);assert.equal(row.sourceFile,detail.sources['2027'].file);}}
assert.equal(read('config/site.json').feedback.destination,null);
console.log('Pre-stream: tributos, Inmuebles, ampliación e índice de 499 programas conciliados.');
