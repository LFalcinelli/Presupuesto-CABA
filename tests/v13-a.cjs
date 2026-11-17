const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>JSON.parse(fs.readFileSync(p)),h=read('data/home-highlights-2027.json'),c=read('data/budget/2027/comparison-2026.json'),history=read('data/history/execution-history.json'),stages=read('data/budget/2027/stages.json');
assert.equal(c.deflator.factor,1.213);assert.equal(c.deflator.sourceType,'owner-estimate');assert(!/usuario|aportad/.test(JSON.stringify(c.deflator)));
const src=fs.readFileSync('src/citizen-review.js','utf8'),context=vm.createContext({state:{projectComparison:c,projectStages:stages}});vm.runInContext(src.split('\n').find(s=>s.startsWith('function budgetPriceScenarios()')),context);
const scenarios=context.budgetPriceScenarios();assert.equal(scenarios.find(r=>r.base==='initial').real.toFixed(1),'14.5');assert.equal(scenarios.find(r=>r.base==='current').real.toFixed(1),'-0.1');assert(scenarios.every(r=>!('annual' in r)),'Sin una segunda cifra para lo mismo');
// La inflación promedio anual coincide con la serie histórica: no hay escenario alternativo.
const a=history.rows.find(r=>r.year===2026),b=history.rows.find(r=>r.year===2027);assert(Math.abs(a.factor/b.factor-c.deflator.factor)<1e-12);
assert.equal(h.cards[0].realCapitalChange2026,c.groups.economic.find(r=>r.id==='capital').realVariationPct);assert.equal(h.cards[0].realCapitalChange2026.toFixed(1),'-12.9');
const paso=h.cards[2].groups.find(g=>g.id==='paso'),ad=read('data/budget/2027/principals.json').rows.find(r=>r.id==='principal-3-publicidad-y-propaganda'),electoralPrograms=new Set(paso.estimate.components.flatMap(r=>r.programIds)),advertising=ad.programs.filter(r=>electoralPrograms.has(r.id)).reduce((s,r)=>s+r.value,0);
assert.equal(paso.estimate.removedAdvertising,advertising);assert.equal(paso.amount,(paso.estimate.electoralTotal-advertising)*.35);assert.equal(Math.round(paso.amount/1e6),28765);
const events=h.cards[2].groups.find(g=>g.id==='events');assert(!events.components.some(r=>/Turismo|Seguridad En Eventos/i.test(r.name)));assert.equal(h.cards[2].ownTaxShare,h.cards[2].amount/read('data/revenue/tax-reference-2027.json').ownTaxes*100);
const support=h.cards[3].groups.find(g=>g.id==='support');for(const id of ['program-40-0-0-401-1','program-29-0-0-1050-8'])assert(!support.components.some(r=>r.programIds.includes(id)));
for(const portrait of ['mauricio-macri','horacio-larreta','jorge-macri'])assert(!fs.existsSync('public/assets/'+portrait+'.png'));
console.log('v13 A: dos bases con inflación promedio anual, capital −12,9%, PASO neta sin publicidad duplicada, exclusiones y retratos fuera del artefacto.');
