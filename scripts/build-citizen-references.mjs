import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,d)=>fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
const map=read('data/budget/2027/fiscal-map.json'),project=read('data/budget/2027/project.json');
const income=read('data/revenue/income-2025-4.json'),areas=read('data/budget/2027/area-reports.json');
const own=map.nodes.find(n=>n.id==='rec_tributos_propios'),population=project.population.value;
const property=income.rows.filter(r=>r.codes.slice(0,4).join('.')==='1.11.2.3');
const references={schemaVersion:1,year:2027,status:'project',population,
 ownTaxes:own.value,ownTaxesPerCapita:own.value/population,
 source:{file:project.source.document,pdfPage:183,table:'Planilla 11',dataset:'data/budget/2027/fiscal-map.json'},
 note:'Promedio por habitante. No es lo que paga cada vecino: Ingresos Brutos puede trasladarse a precios y también aportan quienes no viven en la Ciudad.',
 noteSources:['https://www.agip.gob.ar/impuestos/ingresos-brutos','https://www.argentina.gob.ar/normativa/nacional/ley-27743-401268/texto'],
 taxes:map.nodes.filter(n=>n.id.startsWith('tax_')).map(n=>({id:n.id,name:n.label,value:n.value})),
 property2025:{year:2025,status:'collected-provisional',sourceFile:income.sourceFile,localSource:'sources/recursos-2025-4.pdf',pdfPage:5,
 total:property.find(r=>r.codes.length===4).r,items:property.filter(r=>r.codes.length===5).map(r=>({code:r.codes.join('.'),name:r.name,value:r.r}))},
 budget2026:{initial:areas.areas.reduce((s,a)=>s+a.initial2026,0),current:areas.areas.reduce((s,a)=>s+a.current2026,0),period:'2026-2',source:areas.sources['2026-2']}};
references.budget2026.change=references.budget2026.current-references.budget2026.initial;
references.budget2026.changePct=references.budget2026.change/references.budget2026.initial*100;
if(Math.abs(references.taxes.reduce((s,r)=>s+r.value,0)-own.value)>1)throw Error('Tributos propios no concilian');
if(Math.abs(references.property2025.items.reduce((s,r)=>s+r.value,0)-references.property2025.total)>1)throw Error('Inmuebles no concilia');
write('data/revenue/tax-reference-2027.json',references);
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const csv=rows=>rows.map(r=>r.map(quote).join(',')).join('\n')+'\n';
fs.writeFileSync('data/revenue/tax-reference-2027.csv',csv([['year','concept','value','unit','stage','source','pdfPage'],
 [2027,'Tributos propios',own.value,'ARS','proyecto',references.source.file,183],
 [2027,'Impuestos propios por habitante',references.ownTaxesPerCapita,'ARS/habitante','proyecto: tributos propios / '+population+' habitantes',references.source.file,183],
 ...references.taxes.map(r=>[2027,r.name,r.value,'ARS','proyecto',references.source.file,183]),
 ...references.property2025.items.map(r=>[2025,r.name,r.value,'ARS de 2025','recaudado provisorio',income.sourceFile,5]),
 [2026,'Votado',references.budget2026.initial,'ARS','sancionado',references.budget2026.source.sourceFile,''],[2026,'Ampliado a junio',references.budget2026.current,'ARS','vigente',references.budget2026.source.sourceFile,'']]));
const programs=[];
for(const area of areas.areas){const d=read(area.detailFile);for(const p of d.programs)programs.push({id:'program-'+area.code+'-'+p.id,kind:'program',name:p.name,programId:p.id,unitCode:p.unitCode,areaCode:area.code,parentName:area.name,project2027:p.project2027,sourceFile:d.sources['2027'].file,pdfPage:p.financialPage});}
write('data/budget/2027/program-index.json',{schemaVersion:1,year:2027,programs});
fs.writeFileSync('data/budget/2027/program-index.csv',csv([['areaCode','area','unitCode','programId','name','project2027','sourceFile','pdfPage'],...programs.map(p=>[p.areaCode,p.parentName,p.unitCode,p.programId,p.name,p.project2027,p.sourceFile,p.pdfPage])]));
const index=read('data/index.json');
for(const [id,path,name] of [['tax-reference-2027','data/revenue/tax-reference-2027.json','Impuestos por habitante y apertura de Inmuebles'],['program-index-2027','data/budget/2027/program-index.json','Índice de programas 2027']]){
 const entry={id,name,path,period:'2027-project',lastUpdate:'2026-10-12',source:'Documentos oficiales ya cargados; página y archivo en cada registro.',type:'derived',description:name,files:[path,path.replace('.json','.csv')]};
 const existing=index.datasets.findIndex(d=>d.id===id);if(existing<0)index.datasets.push(entry);else index.datasets[existing]=entry;
}
write('data/index.json',index);
console.log(JSON.stringify({ownTaxesPerCapita:references.ownTaxesPerCapita,property2025:references.property2025.total,budget2026:references.budget2026.changePct,programs:programs.length}));
