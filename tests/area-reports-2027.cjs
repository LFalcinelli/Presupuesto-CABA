const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=file=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',file),'utf8'));
const reports=read('data/budget/2027/area-reports.json'),current=read('data/budget/2026/2026-2.json'),project=read('data/budget/2027/project.json');
const norm=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const close=(a,b,label)=>assert(Math.abs(a-b)<1,label);
function aggregate(dataset,dimension){
 const map=new Map();for(const r of dataset.rows){if(!r.fiscal)continue;const key=dimension==='unit'?r.codes.slice(0,5).join('-'):r.codes[1];
 if(!map.has(key))map.set(key,{name:r.names[dimension==='unit'?4:1],parentName:r.names[1],v:0,d:0,objects:Array(8).fill(0)});
 const a=map.get(key);a.v+=r.v;a.d+=r.d;a.objects[Number(r.codes[8])-1]+=r.v;
 }return map;
}
const actualAreas=aggregate(current,'area'),actualUnits=aggregate(current,'unit'),seen=new Set();
assert.equal(reports.source.fileSha256,project.source.fileSha256);assert.equal(reports.deflator.factor,1.18);
assert.equal(reports.areas.length,22);assert.equal(reports.units.length,actualUnits.size);assert.equal(reports.coverage.units2027,0);
close(reports.areas.reduce((s,r)=>s+r.project2027,0),project.summary.fiscalExpense.value,'2027 total');
close(reports.units.reduce((s,r)=>s+r.current2026,0),current.fiscalTotals.v,'2026 unit coverage');
for(const r of [...reports.areas,...reports.units]){
 assert(!seen.has(r.id));seen.add(r.id);const a=r.kind==='area'?actualAreas.get(r.code):actualUnits.get(r.codes.join('-'));
 assert.equal(r.name,a.name);close(r.current2026,a.v,r.id);close(r.objects.reduce((s,o)=>s+o.current2026,0),r.current2026,r.id+' object total');
 assert.equal(r.objects.length,8);for(const o of r.objects)close(o.current2026,a.objects[Number(o.code)-1],r.id+' object '+o.code);
 if(r.kind==='unit'){assert.equal(r.project2027,null);assert(!('realVariationPct' in r));assert(reports.areas.some(p=>p.id===r.parent));assert(r.objects.every(o=>!('project2027' in o)));}
 else{const p=project.breakdowns.jurisdictions.find(p=>norm(p.name)===norm(r.name));assert.equal(r.project2027,p.value);assert.equal(r.pdfPage,173);close(r.objects.reduce((s,o)=>s+o.project2027,0),r.project2027,r.id+' 2027 objects');assert(Math.abs(r.realVariationPct-(r.project2027/1.18/r.current2026-1)*100)<1e-10);for(const o of r.objects)assert.equal(o.realVariationPct===null,o.current2026===0);}
 assert.deepEqual(r.history.map(h=>h.year),Array.from({length:13},(_,i)=>i+2013));
}
for(const year of Array.from({length:13},(_,i)=>i+2013)){
 const d=read(`data/budget/${year}/${year}-4.json`),areas=aggregate(d,'area'),units=aggregate(d,'unit');
 assert.equal(reports.sources[`${year}-4`].sha256,d.sha256);
 for(const r of [...reports.areas,...reports.units]){
  const a=r.kind==='area'?areas.get(r.code):units.get(r.codes.join('-')),h=r.history.find(h=>h.year===year);
  const same=a&&norm(a.name)===norm(r.name)&&norm(a.parentName)===norm(r.kind==='area'?r.name:r.parentName);
  assert.equal(h.nominal!==null,!!same,r.id+' identity '+year);assert.equal(h.factor,d.factors.d);
  if(same){close(h.nominal,a.d,r.id+' executed '+year);close(h.real,h.nominal*h.factor,r.id+' observed factor '+year);}else{assert.equal(h.real,null);assert(h.missingReason);}
 }
}
for(const [i,o] of project.breakdowns.objects.entries())close(reports.areas.reduce((s,r)=>s+r.objects[i].project2027,0),o.value,'official 2027 object '+i);
assert.equal(reports.historyMethod.index,'IPCBA');assert.equal(reports.historyMethod.comparableAcrossReorganizations,false);
console.log('Informes 2027: 22 áreas, 394 unidades; importes y 13 años conciliados, faltantes 2027 conservados.');
