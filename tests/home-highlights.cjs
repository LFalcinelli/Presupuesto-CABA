const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f))),d=read('data/home-highlights-2027.json');
const index=read('data/budget/2027/search-index.json'),hist=read('data/history/execution-history.json');
assert.deepEqual(d.cards.map(c=>c.id),[1,2,3,4]);
for(const input of d.inputs)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,input.file))).digest('hex'),input.sha256,input.file);
const sum=rows=>rows.reduce((s,r)=>s+r.amount,0),card=n=>d.cards[n-1];
for(const c of d.cards.filter(c=>c.groups)){
 assert.equal(sum(c.groups),c.amount);
 const ledger=new Set();for(const g of c.groups){assert.equal(sum(g.components),g.amount);for(const r of g.components){assert(Math.abs(sum(r.ledger)-r.amount)<.01);for(const l of r.ledger){assert(!ledger.has(l.key),l.key);ledger.add(l.key);}if(r.programIds.length)assert.equal(new Set(r.programIds).size,r.programIds.length);}}
}
const fourthIds=card(4).groups.flatMap(g=>g.components.flatMap(c=>c.programIds));assert.equal(new Set(fourthIds).size,fourthIds.length,'no program repeats across green/housing/support');
const green=card(4).groups.find(g=>g.id==='green');assert.equal(green.components[0].id,'program-21-0-0-2701-24');assert.equal(green.amount,489472307922);assert.equal(card(4).amount,2113625644182);
const publicity=card(3).groups.find(g=>g.id==='publicity'),events=card(3).groups.find(g=>g.id==='events'),paso=card(3).groups.find(g=>g.id==='paso');
assert.equal(publicity.amount,233014989972);assert.equal(events.amount,110658651557);assert.equal(Math.round(card(3).amount/1e6),372519);
assert.equal(events.components.filter(c=>c.programIds.includes('program-50-0-0-3190-81')).length,1,'Usina counted once');
assert.equal(paso.amount,paso.estimate.electoralTotal*.35);assert.equal(Math.round(paso.amount/1e6),28845);assert.equal(paso.estimate.electoralTotal,82414878498);assert.match(paso.method,/no separa PASO/);
assert.equal(card(1).amount,hist.series.currentPrimary.rows.at(-1).nominal);assert.equal(card(1).perCapita,card(1).amount/card(1).population.value);assert(card(1).abovePreviousRecord>0&&card(1).abovePreviousRecord<1);
const currentRows=hist.series.currentPrimary.rows,realAt=y=>currentRows.find(r=>r.year===y).real;assert.equal(card(1).realGrowth2025,(realAt(2027)/realAt(2025)-1)*100);assert.equal(card(1).realGrowth2025.toFixed(1),'8.3');
assert.equal(card(2).providers.amount,600000000000);assert(card(2).financialResult2027>0);assert(card(2).semesters.every(r=>r.financialResult>0));assert.equal(card(2).interest2027+card(2).financialResult2027,card(2).primaryResult2027);
for(const c of [card(3),card(4)])for(const g of c.groups)for(const r of g.components){if(r.realVariationInitial!==null&&r.realVariationInitial!==undefined)assert(Math.abs(r.realVariationInitial-(r.grossAmount??r.amount)/r.initial2026/1.18*100+100)<1e-10);for(const id of r.programIds)assert(index.entries.some(e=>e.id===id));}
console.log('Viñetas: fuentes, sumas exactas, PASO estimada, récord real y programas sin doble conteo verificados.');
