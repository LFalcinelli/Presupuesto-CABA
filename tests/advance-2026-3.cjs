const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
const d=read('data/budget/2026/2026-3.json'),r=read('data/revenue/income-2026-3.json'),t=d.fiscalTotals,f=d.fiscal;
const close=(a,b,tolerance=1)=>assert(Math.abs(a-b)<tolerance,`${a} ≠ ${b}`);
assert.deepEqual([t.s,t.v,t.d],[17344864165159,19878243196345,11686505151496.8]); // Report p. 20.
assert.equal(r.total.r,12670629873225); // Report p. 13.
assert.equal(f.previousIncome,9711037305964.69);
assert.equal(f.previousExpense,8787863141668.80);
close(f.income-f.expense,f.financialResult,.01);
assert(f.financialRatio<f.previousFinancialRatio&&f.financialResult>0);
close(f.currentExpense+f.capitalExpense,f.expense);
close(d.revenueComparison.reduce((s,x)=>s+x.previous,0),f.previousIncome);
close(d.revenueComparison.reduce((s,x)=>s+x.r,0),f.income);
assert.equal(d.groups.jurisdictions.length,22);
assert.equal(d.groups.units.length,394);
assert.equal(d.groups.programs.length,575);
const sum=(rows,k)=>rows.reduce((a,r)=>a+r[k],0);
for(const rows of Object.values(d.groups)){for(const k of ['s','v','d'])close(sum(rows,k),t[k]);}
for(const group of d.groups.jurisdictions){
 const code=group.codes[0];
 for(const k of ['s','v','d'])close(sum(d.groups.programs.filter(x=>x.codes[0]===code),k),group[k]);
}
assert(d.groups.jurisdictions.find(x=>x.codes[0]==='31').comparisonNote.includes('Infraestructura'));
close(d.priceComparison.factor,2432.207777777778/1833.611111111111,.000001);
assert(!('interest' in f)&&!('primaryResult' in f),'the report does not separate interest from code 214');
const config=read('config/site.json');
assert.equal(config.defaultPeriod,'2026-3');assert(config.availablePeriods.includes('2026-2'));
assert.equal(read('data/budget/2026/current.json').budget,t.v);
console.log('3T 2026: totales oficiales, 22 áreas, ingresos, IPCBA y cobertura conciliados.');
