// Reproduce editorial readings from existing, unchanged datasets. No downloads.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['data/budget/2027/principals.json','data/budget/2027/area-reports.json',...['40','29','55','45','31'].map(c=>'data/budget/2027/areas/'+c+'.json')];
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')),principals=read(files[0]),reports=read(files[1]),entries=[];
const number=(v,n=0)=>new Intl.NumberFormat('es-AR',{minimumFractionDigits:n,maximumFractionDigits:n}).format(v);
const money=v=>Math.abs(v)>=1e12?'$'+number(v/1e12,2)+' billones':'$'+number(v/1e6)+' millones';
const percent=v=>(v<0?'−':'+')+number(Math.abs(v),Math.abs(v)>=10?0:1)+'%';
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function area(code){
 const file='data/budget/2027/areas/'+code+'.json',d=read(file),a=reports.areas.find(a=>a.code===code);
 const p=name=>{const result=d.programs.find(p=>norm(p.name).includes(norm(name)));assert(result,code+' '+name);return result;};
 const build=(title,kind,render)=>{
  const figures=[],calculations=[];
  const ref=(value,pointer,extra={})=>{assert(Number.isFinite(value),pointer);figures.push({value,path:pointer,...extra});return value;};
  const amount=(r,key='project2027')=>ref(r[key],file+'#/programs/'+d.programs.indexOf(r)+'/'+key);
  const principal=(r,name)=>{const index=r.principals.findIndex(x=>norm(x.name).includes(norm(name)));assert(index>=0,name);return ref(r.principals[index].value,file+'#/programs/'+d.programs.indexOf(r)+'/principals/'+index+'/value');};
  const category=name=>{const index=principals.rows.findIndex(r=>norm(r.name).includes(norm(name)));assert(index>=0,name);const r=principals.rows[index],i=r.areas.findIndex(x=>x.code===code);assert(i>=0,code);return {r:r.areas[i],base:files[0]+'#/rows/'+index+'/areas/'+i};};
  const value=(c,key)=>ref(c.r[key],c.base+'/'+key);
  const calc=(name,op,values)=>{const value=op==='sum'?values.reduce((a,b)=>a+b,0):op==='divide'?values.reduce((a,b)=>a/b):op==='rate'?(values[0]/values[1]/values[2]-1)*100:op==='share'?values[0]/values[1]*100:null;assert(Number.isFinite(value),name);calculations.push({name,op,inputs:values,value});return value;};
  const rate=r=>{assert(['continues','recoded'].includes(r.comparisonStatus)&&r.current2026>0,r.id+' continuity');return calc('Cambio real','rate',[amount(r),ref(d.deflator.factor,file+'#/deflator/factor'),amount(r,'current2026')]);};
  const target=(r,match)=>{const i=r.targets.findIndex(t=>t.officialText.includes(match));assert(i>=0,r.id+' target '+match);return ref(Number(match.replaceAll('.','')),file+'#/programs/'+d.programs.indexOf(r)+'/targets/'+i+'/officialText',{extract:match});};
  const text=render({d,a,p,amount,principal,category,value,ref,calc,rate,target});
  assert(text.split(/\s+/).length<=30,title+' word count: '+text);
  entries.push({area:code,order:entries.filter(r=>r.area===code).length+1,title,text,kind,figures,calculations,comparisonBase:'current2026',references:[d.sources['2027'].file+' · cuadros de programas y partidas.',d.sources.current2026?.file||'Ejecución oficial al 30/06/2026.',...figures.map(f=>f.path)],movements:[]});
 };
 return {p,build};
}
{
 const{build}=area('40');
 build('Hospitales de atención general','largest',({d,amount,calc})=>{const ps=d.programs.filter(p=>/Hospital General de Agudos/i.test(p.name));return `Los ${ps.length} hospitales de agudos suman ${money(calc('Hospitales de agudos','sum',ps.map(p=>amount(p))))} en 2027; su comparación funcional sigue por confirmar.`;});
 build('Compras y servicios centrales','central',({p,amount,principal})=>{const r=p('Actividades Centrales Ministerio');return `Actividades Centrales recibe ${money(amount(r))}; incluye ${money(principal(r,'productos quimicos'))} en productos químicos y medicinales, sin equivaler a toda la compra de medicamentos.`;});
 build('Químicos con baja ejecución','execution',({category,value,calc,ref,d})=>{const c=category('Productos Químicos'),rate=calc('Cambio real','rate',[value(c,'project2027'),ref(d.deflator.factor,'data/budget/2027/areas/40.json#/deflator/factor'),value(c,'current2026')]),execution=calc('Ejecución 2026','share',[value(c,'executed2026'),value(c,'current2026')]);return `Productos químicos, combustibles y lubricantes: ${money(value(c,'project2027'))} (${percent(rate)} real); a junio de 2026 se usó el ${number(execution,1)}% del ampliado.`;});
 build('Obras y su ejecución','works',({category,value,calc,ref,d})=>{const c=category('Construcciones'),rate=calc('Variación real','rate',[value(c,'project2027'),ref(d.deflator.factor,'data/budget/2027/areas/40.json#/deflator/factor'),value(c,'current2026')]),execution=calc('Ejecución 2026','share',[value(c,'executed2026'),value(c,'current2026')]);return `Construcciones: ${money(value(c,'project2027'))} (${percent(rate)} real); a junio de 2026 se ejecutó el ${number(execution,1)}% del ampliado.`;});
 build('La planta está incompleta','coverage',({d,ref})=>`El cuadro de ${number(ref(d.positions.value,'data/budget/2027/areas/40.json#/positions/value'))} cargos excluye la carrera profesional hospitalaria; no permite contar todos los médicos.`);
}
{
 const{build}=area('29');
 build('La Policía concentra el gasto','largest',({p,amount,ref,calc,a})=>{const r=p('Policía de la Ciudad');return `La Policía recibe ${money(amount(r))}, el ${number(calc('Participación','share',[amount(r),ref(a.project2027,'data/budget/2027/areas/29.json#/stages/project2027')]))}% del área; su continuidad presupuestaria está pendiente de verificar.`;});
 build('Vestuario en emergencias urbanas','program',({p,amount,principal,calc})=>{const r=p('Intervenciones en Emergencias');return `Guardia de Auxilio: ${money(amount(r))}; textiles y vestuario suman ${money(principal(r,'Textiles'))}, el ${number(calc('Vestuario','share',[principal(r,'Textiles'),amount(r)]))}% del programa.`;});
 build('Servicios en capital humano','program',({p,principal,rate})=>{const r=p('Capital Humano');return `Servicios profesionales, técnicos y operativos: ${money(principal(r,'profesionales'))}; el programa completo aumenta ${percent(rate(r))} real, sin probar que sean contratados fuera de planta.`;});
 build('Menos para equipamiento','execution',({category,value,ref,d,calc})=>{const c=category('Maquinaria y equipo'),rate=calc('Variación real','rate',[value(c,'project2027'),ref(d.deflator.factor,'data/budget/2027/areas/29.json#/deflator/factor'),value(c,'current2026')]),execution=calc('Ejecución 2026','share',[value(c,'executed2026'),value(c,'current2026')]);return `Maquinaria y equipos: ${money(value(c,'project2027'))} (${percent(rate)} real); a junio de 2026 se usó el ${number(execution,1)}% del ampliado.`;});
 build('Fondos al sector privado','transfers',({p,principal})=>`La Policía prevé entregar ${money(principal(p('Policía de la Ciudad'),'sector privado'))} al sector privado en 2027; la clasificación no identifica un destinatario.`);
}
{
 const{build}=area('55');
 build('Primaria casi sin cambio','largest',({p,amount,rate})=>{const r=p('Educacion Primaria');return `Primaria recibe ${money(amount(r))} (${percent(rate(r))} real); Inicial cambia ${percent(rate(p('Educacion Inicial')))} real frente al ampliado 2026.`;});
 build('Fondos para escuelas privadas','transfers',({p,principal})=>`Se prevén ${money(principal(p('Gestion Privada'),'sector privado'))} para escuelas privadas; es el aporte a esas instituciones, separado de los gastos administrativos del programa.`);
 build('Comedores y servicios escolares','program',({p,amount,rate,target})=>{const r=p('Asistencia Alimentaria');return `Asistencia Alimentaria: ${money(amount(r))} (${percent(rate(r))} real), con ${number(target(r,'270.509'))} becas; Servicios a las Escuelas suma ${money(amount(p('Servicios a las Escuelas')))}, sin continuidad confirmada.`;});
 build('Presupuesto para edificios escolares','works',({p,amount})=>`Mejora y Cuidado de Edificios Escolares recibe ${money(amount(p('Mejora y Cuidado')))} en 2027; su comparación funcional con 2026 sigue por verificar.`);
 build('Los cargos docentes quedan fuera','coverage',({d,ref})=>`El cuadro de ${number(ref(d.positions.value,'data/budget/2027/areas/55.json#/positions/value'))} cargos excluye al personal docente; no representa la planta completa de las escuelas.`);
}
{
 const{build}=area('45');
 build('Comedores comunitarios en baja','largest',({p,amount,rate,target,calc})=>{const r=p('Fortalecimiento a Grupos'),cost=calc('Presupuesto por persona y día','divide',[amount(r),target(r,'125.000'),365]);return `Grupos comunitarios: ${money(amount(r))} (${percent(rate(r))} real); presupuesto dividido por la meta diaria y 365 días: ≈ $${number(cost,-0)} por persona, sin ser un beneficio individual.`;});
 build('Aumenta la atención en calle','program',({p,amount,rate,target,calc})=>{const r=p('Sin Techo'),cost=calc('Presupuesto por plaza y mes','divide',[amount(r),target(r,'5.900'),12]);return `Asistencia Integral a los Sin Techo: ${money(amount(r))} (${percent(rate(r))} real); ≈ $${number(cost/1e6,1)} millones por persona prevista al mes; no es un pago individual.`;});
 build('Ciudadanía Porteña recibe más','program',({p,amount,rate,target,calc})=>{const r=p('Ciudadanía Porteña'),cost=calc('Presupuesto por hogar y mes','divide',[amount(r),target(r,'54.500'),12]);return `Ciudadanía Porteña: ${money(amount(r))} (${percent(rate(r))} real); presupuesto dividido por ${number(target(r,'54.500'))} hogares y 12 meses: ≈ $${number(cost)} mensuales, sin equivaler al beneficio cobrado.`;});
 build('Obras con una baja real','works',({p,amount,rate})=>{const r=p('Infraestructura Social');return `Infraestructura Social propone ${money(amount(r))}, ${percent(rate(r))} real frente al ampliado 2026 para intervenciones en edificios del Ministerio.`;});
 build('Programas laborales, por separado','program',({p,amount})=>`Economía Social propone ${money(amount(p('Economía Social')))} e Intermediación Laboral ${money(amount(p('Intermediación Laboral')))}; los nombres no prueban un traspaso de recursos entre ambos.`);
}
{
 const{build}=area('31');
 build('El Subte reúne casi la mitad','largest',({p,amount,rate,ref,calc,a})=>{const r=p('Subterráneos');return `Subterráneos de Buenos Aires (SBASE) recibe ${money(amount(r))} (${percent(rate(r))} real), el ${number(calc('Participación','share',[amount(r),ref(a.project2027,'data/budget/2027/areas/31.json#/stages/project2027')]))}% del área.`;});
 build('La Línea F baja','program',({p,amount,rate})=>{const r=p('Desarrollos y Proyectos');return `Desarrollos y Proyectos, que incluye la Línea F, propone ${money(amount(r))}: ${percent(rate(r))} real frente al ampliado 2026.`;});
 build('Menos para riesgo hídrico','program',({p,amount,rate})=>{const r=p('Riesgo Hidrico');return `Riesgo hídrico propone ${money(amount(r))}, ${percent(rate(r))} real; la emergencia hídrica se tramita en un proyecto separado.`;});
 build('Subsidios para el transporte','transfers',({p,amount,rate})=>{const r=p('Convenio Subsidio de Transporte');return `El convenio de subsidios al transporte recibe ${money(amount(r))}, ${percent(rate(r))} real frente al presupuesto ampliado 2026.`;});
 build('Parte se financiaría con deuda','financing',({d,ref,calc,a})=>{const i=d.financing.findIndex(f=>f.code==='22'),v=ref(d.financing[i].value,'data/budget/2027/areas/31.json#/financing/'+i+'/value');return `El ${number(calc('Financiación externa','share',[v,ref(a.project2027,'data/budget/2027/areas/31.json#/stages/project2027')]))}% del área, ${money(v)}, se cubriría con financiamiento externo; no es gasto adicional.`;});
}
const output={schemaVersion:1,comparisonBase:'current2026',inflationFactor:reports.deflator.factor,entries,inputs:files.map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')}))};
fs.writeFileSync(path.join(root,'data/budget/2027/area-highlights.json'),JSON.stringify(output,null,2)+'\n');
const catalog=read('data/index.json');if(!catalog.datasets.some(d=>d.id==='area-highlights-2027')){catalog.datasets.push({id:'area-highlights-2027',name:'Destacados verificados de cinco áreas 2027',path:'data/budget/2027/area-highlights.json',period:'2027-project',type:'derived',description:'Textos con cifras, rutas de origen y fórmulas reproducibles; una sola base ampliada 2026.',source:'Documentos jurisdiccionales y ejecución 2026 ya conciliados; referencias por lectura.',files:['data/budget/2027/area-highlights.json']});fs.writeFileSync(path.join(root,'data/index.json'),JSON.stringify(catalog,null,2)+'\n');}
console.log(JSON.stringify({areas:5,readings:entries.length,originalAmountsChanged:false}));
