const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
const reports=read('data/budget/2027/area-reports.json'),detail=read('data/budget/2027/areas/31.json'),snapshot=read('data/budget/2026/2026-2.json'),padron=read('data/government/government-directory.json');
const close=(a,b,label)=>assert(Math.abs(a-b)<1,label);
assert.equal(detail.stages.project2027,1977474831688);assert.equal(detail.stages.initial2026,1595513484537);assert.equal(detail.stages.current2026,1861607510357);close(detail.stages.executed2026,458798039587.01);
assert.equal(detail.units.length,13);assert.equal(detail.programs.length,27);assert.equal(detail.positions.value,911);assert.equal(detail.positions.pdfPage,15);assert(detail.positions.exclusions.includes('Autoridades')||detail.positions.exclusions.includes('autoridades'));
assert.equal(detail.sources['2027'].sha256,'b672ab5e69430e682a6fef4bfa0f5ac380417f26e203df1f93a0c8613f96510c');
assert.equal(detail.sources['2026'].sha256,'ad5abe23c0bf0a663dc3e51291b1d3f82c00c529bffe71edfa86c047c4cde90f');
assert.equal(detail.deflator.factor,1.18);assert.equal(detail.originalEqualsApproved,true);
close(detail.units.reduce((s,r)=>s+r.project2027,0),detail.stages.project2027);
close(detail.programs.reduce((s,r)=>s+r.project2027,0),detail.stages.project2027);
close(detail.financing.reduce((s,r)=>s+r.value,0),detail.stages.project2027);
assert.equal(detail.financing.find(f=>f.code==='11').value,890684580864);assert.equal(detail.financing.find(f=>f.code==='22').value,699110799657);assert.equal(detail.financing.find(f=>f.code==='14').name,'Transferencias afectadas');
const seen=new Set();
for(const p of detail.programs){
 close(p.objects.reduce((s,o)=>s+o.project2027,0),p.project2027,p.id+' objects');assert(p.description&&p.descriptionPages.length&&p.financialPage);assert.equal(p.pdfPage>=16&&p.pdfPage<=17,true);
 if(p.comparisonStatus==='pending'){assert.equal(p.current2026,null);assert.equal(p.realVariationPct,null);continue;}
 assert(p.antecedents.length);assert.equal(p.previousDescriptions.length,p.antecedents.length);
 const rows=snapshot.rows.filter(r=>r.fiscal&&p.antecedents.includes(r.codes.slice(1,6).join('-'))&&r.codes[0]==='1');
 for(const [stage,field] of [['initial2026','s'],['current2026','v'],['executed2026','d']])close(p[stage],rows.reduce((s,r)=>s+r[field],0),p.id+' '+stage);
 close(p.realChangeAmount,p.project2027/1.18-p.current2026);assert(Math.abs(p.realVariationPct-(p.project2027/p.current2026/1.18-1)*100)<1e-9);
 for(const s of p.antecedents){assert(!seen.has(s),'No predecessor can fund two homologated comparisons');seen.add(s);}
 for(const o of p.objects)close(o.current2026,rows.filter(r=>r.codes[8]===o.code).reduce((s,r)=>s+r.v,0));
}
assert.equal(seen.size,32);assert.equal(detail.programs.filter(p=>p.comparisonStatus==='pending').length,2);assert.deepEqual(detail.unmatchedCurrent2026.map(p=>p.id),['1-31-0-0-3130-28']);
assert.deepEqual(detail.programs.find(p=>p.code==='85').antecedents,['31-0-0-3116-35']);assert.deepEqual(detail.programs.find(p=>p.code==='87').antecedents,['31-0-0-3116-37']);assert.equal(detail.programs.find(p=>p.code==='75').antecedents.length,4);
assert.equal(detail.programs.find(p=>p.code==='60').antecedents.length,4);assert.equal(detail.programs.find(p=>p.code==='63').antecedents.length,2);
for(const u of detail.units){close(detail.programs.filter(p=>p.unitCode===u.code).reduce((s,p)=>s+p.project2027,0),u.project2027);assert.equal(u.comparisonStatus==='continues',!['1057','3130','3638','3640'].includes(u.code));}
const area=reports.areas.find(a=>a.code==='31');
for(const o of area.objects)close(detail.programs.reduce((s,p)=>s+p.objects.find(x=>x.code===o.code).project2027,0),o.project2027,'Planilla 4 '+o.code);
assert.equal(area.officials.value,85);assert.equal(reports.coverage.detailedAreas2027,1);assert.equal(reports.coverage.unitsWithVerifiedDetail2027,13);
const allPeople=new Set(),nodes=new Map(padron.nodes.map(n=>[n.id,n]));
for(const a of reports.areas){
 const rows=snapshot.rows.filter(r=>r.fiscal&&r.codes[1]===a.code);
 for(const [stage,field] of [['initial2026','s'],['current2026','v'],['executed2026','d']])close(a[stage],rows.reduce((s,r)=>s+r[field],0));
 assert.equal(a.officials.cut,null);assert.equal(a.officials.year,2026);assert.equal(a.officials.sourceSha256,padron.sourceSha256);
 if(!a.officials.rootNode){assert.equal(a.officials.value,null);continue;}
 const stack=[a.officials.rootNode],people=new Set();while(stack.length){const n=nodes.get(stack.pop());n.people.forEach(p=>people.add(p));stack.push(...n.children);}
 assert.equal(a.officials.value,people.size);for(const p of people){assert(!allPeople.has(p));allPeople.add(p);}
}
assert.equal(reports.areas.find(a=>a.code==='5').institutionType,'Otros poderes y organismos');
assert.equal(detail.readings.length,6);assert(detail.readings.every(r=>r.references.length));assert(!detail.changes.some(c=>['created','eliminated'].includes(c.status)));
assert(!/\b[A-Z]:[\\/]|Users[\\/]|Downloads[\\/]/i.test(JSON.stringify(detail)),'No local working paths');
console.log('Áreas: 22 jurisdicciones, 13 unidades y 27 programas conciliados; homologaciones, etapas, pendientes y padrón sin duplicaciones verificados.');
