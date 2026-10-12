const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),reports=JSON.parse(fs.readFileSync(path.join(root,'data/budget/2027/area-reports.json'),'utf8'));
const fmt=(n,d=0)=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:d,minimumFractionDigits:d}).format(n);
const short=n=>(n<0?'−':'')+(Math.abs(n)>=1e12?'$ '+fmt(Math.abs(n)/1e12,2)+' billones':'$ '+fmt(Math.abs(n)/1e6,0)+' millones');
const context=vm.createContext({Intl,state:{areaReports:reports,governmentSemester:JSON.parse(fs.readFileSync(path.join(root,'data/execution/semester-analysis.json'),'utf8'))},short,governmentTitle:name=>name.replace(/\b(De|La|Del|E|Y)\b/g,s=>s.toLowerCase())});
for(const file of ['number-format.js','government-insights.js','government-readings.js'])vm.runInContext(fs.readFileSync(path.join(root,'src',file),'utf8'),context);
const editorial=[];
for(const area of reports.areas){
 const detail=JSON.parse(fs.readFileSync(path.join(root,area.detailFile),'utf8'));
 for(const base of ['initial2026','current2026']){
  const readings=context.governmentReadingItems(area,detail,base);
  assert(readings.length>0&&readings.length<=5,area.code+' count');
  const signs=new Map();
  for(const r of readings){
   const label=area.code+' '+base+' '+r.kind;
   assert(r.text.split(/\s+/).length<=35,label+' exceeds 35 words: '+r.text);
   assert((r.text.match(/[.!?](?:\s|$)/g)||[]).length<=2,label+' exceeds two sentences');
   assert(!/0,0%|cambia \+|cambió \+|sin base/i.test(r.text),label+' forbidden text');
   assert(r.references.length>=2&&r.references.every(Boolean),label+' missing source');
   const headerBase=['21','35'].includes(area.code)?'current2026':base;if(r.comparisonBase&&r.comparisonBase!==headerBase)assert(/mismo semestre de 2025|frente al ampliado|frente al votado/.test(r.text),label+' unexplained base');assert(!/El (más del|menos de)/i.test(r.text));
   if(r.text.includes('100%')){
    const groups=[['1','2','3'],['4'],['5'],['6','7','8']];
    assert(groups.some(codes=>area.objects.filter(o=>codes.includes(o.code)).reduce((s,o)=>s+o.project2027,0)===area.project2027),label+' inexact 100%');
   }
   for(const m of r.movements){
    const p=detail.programs.find(p=>p.id===m.id),factor=reports.deflator.factor;
    const delta=p.project2027/factor-p[m.base],rate=100*(p.project2027/factor/p[m.base]-1);
    assert.equal(p.comparisonStatus==='pending',false,label+' pending program');
    assert(Math.abs(delta)>=Math.min(.02*area.project2027/factor,5e9),label+' immaterial movement');
    assert(p.project2027/area.project2027>=.01||p[m.base]/area[m.base]>=.01,label+' immaterial program');
    assert.equal(m.delta,delta);assert.equal(m.rate,rate);
    assert(!signs.has(m.id)||signs.get(m.id)===Math.sign(delta),label+' contradictory sign');signs.set(m.id,Math.sign(delta));
    const chart=context.governmentProgramMovements(detail,m.base,factor).find(r=>r.id===m.id);
    assert.equal(chart.rate,m.rate,label+' chart disagrees');assert.equal(chart.delta,m.delta);
   }
   if(r.kind==='financing')assert(detail.financing.find(f=>f.code==='22').value/area.project2027>=.1);
   if(r.kind==='transfers')assert(detail.economic.transfers/area.project2027>=.1);
   if(r.kind==='execution'){assert(!['98','99'].includes(area.code));assert(area.executed2026/area.current2026<.3);assert(r.text.includes('mismo semestre de 2025'));assert(!r.references.join(' ').includes('proyecto dividido'));const prior=context.state.governmentSemester.jurisdictions.find(r=>r.name===area.name);assert(Math.abs(prior.nominal2026-area.executed2026)<1);assert(r.text.includes(context.governmentVerb(100*(prior.b/prior.a-1))));}
  }
  if(['21','35'].includes(area.code)){assert.equal(readings[0].kind,'scope');assert(readings.find(r=>r.kind==='composition'));for(const r of readings)for(const m of r.movements)assert.equal(m.base,'current2026');}
  if(['24','75'].includes(area.code))assert(readings.some(r=>r.kind==='pending-cause'));
  editorial.push(`${area.code} · ${area.name} · BASE ${base==='initial2026'?'VOTADO':'AMPLIADO'} 2026\n`+readings.map((r,i)=>`${i+1}. ${r.text}`).join('\n'));
 }
}
assert.equal(context.governmentShare(999,1000),'más del 99%');assert.equal(context.governmentShare(1,10000),'menos de 0,1%');assert.equal(context.governmentShare(100,100),'100%');
// These nominal amounts must match the official document, irrespective of the comparison base.
const mobility=reports.areas.find(a=>a.code==='31'),detail=JSON.parse(fs.readFileSync(path.join(root,mobility.detailFile),'utf8'));
const text=context.governmentReadingItems(mobility,detail).map(r=>r.text).join('\n');
assert(text.includes('$ 1,98 billones'));assert(text.includes('$ 699.111 millones'));assert(text.includes('$ 933.486 millones'));
assert(text.includes('Desarrollos y Proyectos baja 17%'));
const works=detail.programs.find(p=>p.name==='Obras de Ingeniería y Arquitectura');assert(context.governmentFunctionalVerified(works));
assert(!context.governmentFunctionalVerified({...works,comparisonStatus:'pending'}));
for(const a of reports.areas)for(const b of ['initial2026','current2026']){
 const d=JSON.parse(fs.readFileSync(path.join(root,a.detailFile),'utf8'));
 for(const r of context.governmentReadingItems(a,d,b))for(const m of r.movements){
  const p=d.programs.find(p=>p.id===m.id);
  if(m.rate>100||m.rate< -50){assert(context.governmentFunctionalVerified(p));assert(r.text.includes(short(p[m.base])));assert(r.text.includes(short(p.project2027)));}
 }
 if(['98','99'].includes(a.code))assert(!context.governmentReadingItems(a,d,b).some(r=>r.kind==='composition'));
}
// AA contrast on the actual light panels and dark institutional surfaces.
const luminance=hex=>{const c=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
for(const [fg,bg] of [['5f2b8a','ffffff'],['43586f','ffffff'],['5f2b8a','f7f3fb'],['43586f','f7f3fb'],['e2c9fb','291240'],['d3e0f0','371953']]){const a=luminance(fg),b=luminance(bg);assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,fg+' AA contrast');}
if(process.env.EDITORIAL_REPORT)fs.writeFileSync(process.env.EDITORIAL_REPORT,'DESTACADOS PARA REVISIÓN EDITORIAL · ÁREAS DE GOBIERNO 2027\n44 variantes · montos nominales y variaciones reales · inflación supuesta 18%\n\n'+editorial.join('\n\n')+'\n','utf8');
console.log('Destacados: 22 áreas × 2 bases; materialidad, coherencia de signos, límites editoriales, montos nominales y contraste AA correctos.');
