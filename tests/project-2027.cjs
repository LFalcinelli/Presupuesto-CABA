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
const investments=read('data/budget/2027/investments.json');
assert.equal(investments.projects.length,309);
for(const project of investments.projects){
 assert(project.displayName&&project.name);
 assert(project.components.length&&project.components.every(c=>c.name&&c.pdfPages.length));
 for(let year=0;year<3;year++)assert.equal(project.components.reduce((sum,c)=>sum+c.amounts[year],0),project.amounts[year],project.name);
}
for(const k of ['purposes','functions','jurisdictions','objects','economic'])assert.equal(p.breakdowns[k].reduce((a,r)=>a+r.value,0),v('fiscalExpense'),k);
assert.equal(p.breakdowns.revenue.reduce((a,r)=>a+r.value,0),v('fiscalRevenue'));
for(const purpose of p.breakdowns.purposes)assert.equal(p.breakdowns.functions.filter(f=>f.purpose===purpose.name).reduce((a,r)=>a+r.value,0),purpose.value);
for(const m of [...Object.values(s),...Object.values(p.breakdowns).flat(),...p.creditAuthorizations]){assert(m.pdfPage>=1&&m.pdfPage<=297&&m.reference&&m.source);assert.equal(m.status,'project');assert(m.unit&&m.universe&&Number.isFinite(m.value));}
const c=read('data/budget/2027/comparison-2026.json');assert.equal(c.inflationAdjusted,true);assert.equal(c.totals.reference,19877152039294);
assert.equal(c.deflator.percentage,18);assert.equal(c.deflator.factor,1.18);assert.equal(c.deflator.basis,'projection');assert.equal(c.deflator.sourceType,'user-provided');
assert.equal(c.totals.project,v('fiscalExpense'));assert(Math.abs(c.totals.realVariationPct-2.725645358423656)<1e-9);
assert(c.totals.nominalVariationPct>21&&c.totals.nominalVariationPct<22);assert(c.totals.realVariationPct>2&&c.totals.realVariationPct<3);
const income2026=read('data/revenue/income-2026-2.json');
for(const [key,rows] of Object.entries(c.groups)){
 const expected=key==='revenue'?v('fiscalRevenue'):key==='taxRevenue'?p.breakdowns.taxRevenue.reduce((sum,r)=>sum+r.value,0):c.totals.project;
 const reference=key==='revenue'?income2026.total.v:key==='taxRevenue'?income2026.rows.find(r=>r.codes.join('.')==='1.11').v:c.totals.reference;
 assert(Math.abs(rows.reduce((sum,r)=>sum+r.projectAdjusted,0)-expected/1.18)<.02,key);
 assert(Math.abs(rows.reduce((sum,r)=>sum+r.reference,0)-reference)<2,key);
 assert.equal(rows.reduce((sum,r)=>sum+r.project,0),expected,key);
 for(const r of rows){if(r.reference)assert(Math.abs(r.realVariationPct-(r.project/r.reference/1.18-1)*100)<1e-9);else assert.equal(r.realVariationPct,null);}
}
const semester=read('data/execution/semester-analysis.json'),infrastructure=semester.jurisdictions.filter(r=>r.jurisdictionCode==='31');
assert.equal(infrastructure.length,1);assert(infrastructure[0].a>0&&infrastructure[0].b>0);assert.equal(semester.jurisdictions.filter(r=>r.name.includes('Infraestructura')).length,1);
assert(Math.abs((infrastructure[0].b/infrastructure[0].a-1)*100-1.259216)<.0001);
assert(c.groups.jurisdictions.find(r=>r.jurisdictionCode==='31').reference>1.8e12);
assert.equal(c.groups.functions.length,20);assert.equal(c.groups.jurisdictions.length,22);
const config=read('config/site.json');assert.equal(config.featuredBudgetStatus,'project');assert.equal(config.currentExecutionPeriod,'2026-2');assert.equal(config.currentBudgetYear,2026);assert.deepEqual(config.projectViews,['summary','expenses','revenue']);
assert(!fs.existsSync(path.resolve(__dirname,'../data/revenue/2027/tax-changes.json')));
const salary=read('data/salaries/latest-reference.json');assert.equal(salary.latest.value,12474468.49);assert.equal(salary.ratio,salary.latest.value/salary.president.value);
console.log('Proyecto 2027: universo, resultados, clasificaciones, comparación nominal/real estimada, trazabilidad y separación de ejecución verificados.');
