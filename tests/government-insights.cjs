const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')),reports=read('data/budget/2027/area-reports.json');
const fmt=(n,d=0)=>new Intl.NumberFormat('es-AR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const context=vm.createContext({Intl,state:{areaReports:reports,areaHighlights:read('data/budget/2027/area-highlights.json')},fmt,short:n=>(n<0?'−':'')+(Math.abs(n)>=1e12?'$ '+fmt(Math.abs(n)/1e12,2)+' billones':'$ '+fmt(Math.abs(n)/1e6)+' millones'),signedPct:n=>(n<0?'−':'+')+fmt(Math.abs(n),Math.abs(n)<10?1:0)+'%',governmentTitle:name=>name.replace(/\b(De|La|Del|E|Y)\b/g,s=>s.toLowerCase())});
for(const f of ['number-format.js','government-insights.js','government-readings.js'])vm.runInContext(fs.readFileSync(path.join(root,'src',f),'utf8'),context);
const editorial=[];
for(const area of reports.areas){
 const detail=read(area.detailFile),a=context.governmentReadingItems(area,detail,'initial2026'),b=context.governmentReadingItems(area,detail,'current2026');
 assert.deepEqual(a,b,area.code+' highlights use one base');assert(a.length>=3&&a.length<=5,area.code+' core count '+a.length);
 for(const r of a){const label=area.code+' '+r.kind;
  assert(r.title.split(/\s+/).length>=2&&r.title.split(/\s+/).length<=6,label+' title');assert(!/[¿?]/.test(r.title+r.text));
  assert(r.text.split(/\s+/).length<=30,label+' exceeds 30 words: '+r.text);assert(!/votado/i.test(r.text),label+' mixed bases');assert.equal(r.comparisonBase,'current2026');assert(r.references.length>=2);
  for(const m of r.movements){const p=detail.programs.find(p=>p.id===m.id);assert.equal(m.base,'current2026');assert.equal(m.delta,p.project2027/reports.deflator.factor-p.current2026);assert.equal(m.rate,100*(p.project2027/reports.deflator.factor/p.current2026-1));assert.notEqual(p.comparisonStatus,'pending');if(m.rate>100||m.rate< -50)assert(context.governmentFunctionalVerified(p));}
 }
 editorial.push(area.code+' · '+area.name+'\n'+a.map(r=>r.title+'. '+r.text).join('\n'));
}
if(process.env.EDITORIAL_REPORT)fs.writeFileSync(process.env.EDITORIAL_REPORT,editorial.join('\n\n'));
console.log('Destacados: 22 áreas, una sola base ampliada, 3–5 lecturas principales con titular y referencias.');
