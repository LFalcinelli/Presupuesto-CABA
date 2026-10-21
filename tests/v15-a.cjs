const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
const d=read('data/home-highlights-2027.json'),c=d.cards[1],caif=read('data/fiscal-results/caif.json'),approved=read('data/execution/approved-vs-executed.json').periods.find(r=>r.period==='2025-4');
const a=caif.periods['2025-4'],h=caif.periods['2026-2'],p=caif.context.semesters.find(r=>r.year===2025),s=c.scenarios;
assert.equal(s.closing2026.result,h.financialResult+(a.financialResult-p.financialResult)*h.income/p.income);
assert.equal(s.closing2026.income,a.income*h.income/p.income);
assert.equal(s.spending2027.result,c.financialResult2027-c.expense2027*(approved.executed/approved.initial-1));
assert(Math.abs(s.closing2026.result/1e6+588821)<1);
assert(Math.abs(s.closing2026.ratio+3.4094260733)<1e-8);
assert(Math.abs(s.spending2027.result/1e6+268478)<1);
assert.equal(c.annual2025.primaryResult,-173902620554.91);
assert(c.annual2025.economicResult>0&&c.financialResult2027>0);
for(const scenario of Object.values(s)){assert(scenario.sources.length>=2);assert(scenario.formula);assert(scenario.assumption);}
const flags=read('config/site.json').flags;
assert.equal(flags.homeProjectHero,false);assert.equal(flags.homeOwnTaxes,false);assert.equal(flags.homeClosing2026Projection,true);
console.log('v15 A: estimaciones reproducibles, sin alterar resultados oficiales ni montos anteriores.');
