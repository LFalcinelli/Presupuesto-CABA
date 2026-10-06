const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data/budget/2027',name+'.json'),'utf8'));
const map=read('fiscal-map'),project=read('project'),stages=read('stages'),works=read('investments'),companions=read('companions');
const nodes=new Map(map.nodes.map(n=>[n.id,n]));assert.equal(nodes.size,map.nodes.length);
assert.equal(map.totals.revenue,24095657042129);assert.equal(map.totals.expense,24094340599263);assert.equal(map.totals.revenue-map.totals.expense,map.totals.financialResult);
assert.equal(map.source.fileSha256,project.source.fileSha256);
for(const n of map.nodes){
 assert(Number.isSafeInteger(n.value)&&n.value>=0);assert(n.pdfPage>=1&&n.pdfPage<=297);
 const seen=new Set();let p=n;while(p){assert(!seen.has(p.id),'cycle '+n.id);seen.add(p.id);p=nodes.get(p.parent);}
 if(n.side==='income'||n.side==='spend'){const total=n.side==='income'?map.totals.revenue:map.totals.expense;assert(Math.abs(n.per100-n.value/total*100)<1e-10);}
 const kids=n.children.map(id=>nodes.get(id));assert(kids.every(Boolean));for(const view of new Set(kids.map(k=>k.view)))assert.equal(kids.filter(k=>k.view===view).reduce((s,k)=>s+k.value,0),n.value);
}
for(const view of ['purpose','who','object','economic'])assert.equal(map.nodes.filter(n=>n.parent==='gasto_total'&&n.view===view).reduce((s,n)=>s+n.value,0),map.totals.expense);
assert.equal(nodes.get('tax_iibb').value,13279892329152);assert.equal(Math.round(nodes.get('tax_iibb').per100*10)/10,55.1);
for(const edge of map.workbookEdges){assert(nodes.has(edge.source)&&nodes.has(edge.target));assert(!(nodes.get(edge.source).side==='income'&&nodes.get(edge.target).side==='spend'&&edge.source!=='rec_total'),'No tax-to-function connection');}
assert.equal(stages.totals.initial,17344864165159);assert.equal(stages.totals.current,19877152039294);assert.equal(stages.totals.project,map.totals.expense);
for(const rows of Object.values(stages.groups))for(const key of ['initial','current','project'])assert(Math.abs(rows.reduce((s,r)=>s+r[key],0)-stages.totals[key])<=1);
assert.equal(works.projects.length,309);assert.equal(new Set(works.projects.map(r=>r.id)).size,309);
assert.deepEqual(works.totals,[4170360367357,2907671643815,2733674774519]);
for(let i=0;i<3;i++)assert.equal(works.projects.reduce((s,r)=>s+r.amounts[i],0),works.totals[i]);
for(const r of works.projects){assert(r.name&&r.jurisdiction&&r.program);assert.equal(r.codes.length,6);assert(r.pdfPage>=240&&r.pdfPage<=294);}
assert.equal(works.projects.find(r=>r.id==='31-31-3125-33-0-2').amounts[0],368930498582);
assert.equal(companions.includedInFiscalTotals,false);assert.equal(companions.projects[0].amount,600000000000);assert.equal(companions.projects[1].amount,75000000);assert.equal(companions.projects[1].currency,'USD');assert.equal(companions.projects[2].amount,null);
console.log('Mapa 2027: jerarquías, bases, conexiones fiscales, tres etapas y 309 proyectos conciliados.');
