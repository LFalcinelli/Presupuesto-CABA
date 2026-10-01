const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p))),p=read('data/budget/2027/project.json'),s=p.summary,v=k=>s[k].value;
assert.equal(p.status,'project');assert.equal(p.year,2027);assert.equal(p.population.value,3121707);
assert.equal(v('fiscalExpense'),24094340599263);assert.equal(v('legalHeadline'),v('fiscalExpense'));
assert.equal(v('currentExpense')+v('capitalExpense'),v('fiscalExpense'));
assert.equal(v('currentRevenue')+v('capitalRevenue'),v('fiscalRevenue'));
assert.equal(v('fiscalRevenue')-v('fiscalExpense'),v('financialResult'));
assert.equal(v('primaryResult')-v('interest'),v('financialResult'));
assert.equal(v('financialSources')+v('financialResult'),v('financialApplications'));
assert.equal(v('economicPrimaryResult')-v('interest'),v('economicResult'));
assert.equal(v('perCapita'),v('fiscalExpense')/p.population.value);
for(const k of ['purposes','functions','jurisdictions','objects','economic'])assert.equal(p.breakdowns[k].reduce((a,r)=>a+r.value,0),v('fiscalExpense'),k);
assert.equal(p.breakdowns.revenue.reduce((a,r)=>a+r.value,0),v('fiscalRevenue'));
for(const purpose of p.breakdowns.purposes)assert.equal(p.breakdowns.functions.filter(f=>f.purpose===purpose.name).reduce((a,r)=>a+r.value,0),purpose.value);
for(const m of [...Object.values(s),...Object.values(p.breakdowns).flat(),...p.creditAuthorizations]){assert(m.pdfPage>=1&&m.pdfPage<=297&&m.reference&&m.source);assert.equal(m.status,'project');assert(m.unit&&m.universe&&Number.isFinite(m.value));}
const c=read('data/budget/2027/comparison-2026.json');assert.equal(c.inflationAdjusted,true);assert.equal(c.totals.reference,19877152039294);
assert.equal(c.deflator.percentage,18);assert.equal(c.deflator.factor,1.18);assert.equal(c.deflator.basis,'projection');assert.equal(c.deflator.sourceType,'user-provided');
assert.equal(c.totals.project,v('fiscalExpense'));assert(Math.abs(c.totals.realVariationPct-2.725645358423656)<1e-9);
assert(c.totals.nominalVariationPct>21&&c.totals.nominalVariationPct<22);assert(c.totals.realVariationPct>2&&c.totals.realVariationPct<3);
for(const rows of Object.values(c.groups)){assert(Math.abs(rows.reduce((sum,r)=>sum+r.projectAdjusted,0)-c.totals.projectAdjusted)<.01);for(const r of rows){if(r.reference)assert(Math.abs(r.realVariationPct-(r.project/r.reference/c.deflator.factor-1)*100)<1e-9);else assert.equal(r.realVariationPct,null);}}
for(const rows of Object.values(c.groups)){assert(Math.abs(rows.reduce((a,r)=>a+r.reference,0)-c.totals.reference)<1);assert.equal(rows.reduce((a,r)=>a+r.project,0),c.totals.project);}
const config=read('config/site.json');assert.equal(config.featuredBudgetStatus,'project');assert.equal(config.currentExecutionPeriod,'2026-2');assert.equal(config.currentBudgetYear,2026);assert.deepEqual(config.projectViews,['summary','expenses','revenue','compare']);
assert(!fs.existsSync(path.resolve(__dirname,'../data/revenue/2027/tax-changes.json')));
const salary=read('data/salaries/latest-reference.json');assert.equal(salary.latest.value,12474468.49);assert.equal(salary.ratio,salary.latest.value/salary.president.value);
console.log('Proyecto 2027: universo, resultados, clasificaciones, comparación nominal/real estimada, trazabilidad y separación de ejecución verificados.');
