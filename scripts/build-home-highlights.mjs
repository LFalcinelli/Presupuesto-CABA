// Rebuild with: node scripts/build-home-highlights.mjs. No local downloads required.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const files=['content/home-highlights.json','data/budget/2027/search-index.json','data/budget/2027/principals.json','data/budget/2027/budget-depth.json','data/budget/2027/project.json','data/budget/2027/companions.json','data/history/execution-history.json','data/fiscal-results/caif.json','data/budget/2026/2026-2.json','data/budget/2027/fiscal-map.json'];
const [copy,index,principals,depth,project,companions,hist,caif,execution,fiscalMap]=files.map(read);
const entries=new Map(index.entries.map(r=>[r.id,r]));
const programs=index.entries.filter(r=>r.kind==='program'&&r.project2027!==null);
const sum=rows=>rows.reduce((s,r)=>s+r.amount,0);
const add=rows=>rows.reduce((s,r)=>s+r.project2027,0);
const roundM=v=>Math.round(v/1e6);
const million=v=>'$'+new Intl.NumberFormat('es-AR').format(roundM(v))+' millones';
const trillion=v=>'$'+new Intl.NumberFormat('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v/1e12)+' billones';
const unit=(area,n)=>{const found=index.entries.filter(r=>r.kind==='unit'&&r.project2027!==null&&r.areaCode===area&&r.unitCode===String(n));assert.equal(found.length,1);return found[0].id;};
const units=(area,nums)=>nums.map(n=>unit(area,n));
function children(id){const r=entries.get(id);assert(r,id);return r.kind==='unit'?programs.filter(p=>p.codes.slice(0,4).join('-')===r.codes.join('-')):[r];}
const ad=principals.rows.find(r=>r.id==='principal-3-publicidad-y-propaganda');assert(ad);
const adByProgram=new Map(ad.programs.map(p=>[p.id,p.value]));
function component(id,{netAdvertising=false,label}={}){
 const r=entries.get(id),ps=children(id),removed=netAdvertising?ps.reduce((s,p)=>s+(adByProgram.get(p.id)||0),0):0;
 assert.equal(add(ps),r.project2027,id+' children');
 const comparable=!['pending','continuity-pending','reorganized'].includes(r.comparisonStatus)&&!netAdvertising;
 return {id,name:label||r.name,areaCode:r.areaCode,areaName:r.areaName,amount:r.project2027-removed,grossAmount:r.project2027,removedAdvertising:removed,
  initial2026:r.initial2026,realVariationInitial:comparable&&r.initial2026>0?(r.project2027/r.initial2026/1.18-1)*100:null,
  comparisonNote:netAdvertising?'Importe neto de publicidad. La ficha permite comparar el presupuesto completo de la unidad.':comparable?(r.initial2026>0?'':'Sin base votada comparable.'):'Continuidad o cambio de dependencia por verificar; no se atribuye la diferencia a crecimiento.',
  source:r.source,pages:r.pages,programIds:ps.map(p=>p.id),ledger:ps.map(p=>({key:p.id+(netAdvertising?':excluding-advertising':':whole-program'),amount:p.project2027-(netAdvertising?(adByProgram.get(p.id)||0):0)})),
  link:'#proyecto-2027?vista=areas&area='+r.areaCode+'&unidad='+r.unitCode+(r.programId?'&programa='+r.programId:'')+'&base=initial'};
}
function group(id,label,components,method){const amount=sum(components);return {id,label,amount,display:amount>=1e12?trillion(amount):million(amount),components,method};}
const communicationIds=units('20',[3400,2512,246,3410,3409,214,2505,2500,2501,1041,3414]);
const adComponent={id:ad.id,name:'Publicidad y propaganda de toda la Ciudad',amount:ad.project2027,initial2026:ad.initial2026,realVariationInitial:(ad.project2027/ad.initial2026/1.18-1)*100,areaName:'Todas las áreas',source:'Partidas principales de las fichas jurisdiccionales 2027',pages:[],
 programIds:ad.programs.map(p=>p.id),ledger:ad.programs.map(p=>({key:p.id+':advertising',amount:p.value})),link:'#buscar?q=publicidad&detalle='+ad.id,allocations:ad.programs.map(p=>({id:p.id,name:p.name,areaName:p.areaName,amount:p.value,source:p.source,pages:[p.page]}))};
assert.equal(sum(adComponent.ledger),adComponent.amount);
const publicity=group('publicity','PUBLICIDAD, COMUNICACIÓN Y PAUTA EN MEDIOS',[adComponent,...communicationIds.map(id=>component(id,{netAdvertising:true}))],
 'La partida Publicidad y propaganda de toda la Ciudad, más once unidades de comunicación y medios. Se resta de esas unidades la publicidad ya contada. No equivale solo a pauta en medios.');
// Usina belongs to Festivales: split the two programs instead of adding unit + child.
const eventIds=[...units('20',[2508]),...units('21',[9765]),'program-50-0-0-3190-82','program-50-0-0-3190-81',...units('75',[3201]),'program-75-0-0-3192-91',...units('29',[1047,1048])];
const events=group('events','EVENTOS Y ENTRETENIMIENTO',eventIds.map(id=>component(id,{netAdvertising:id===unit('75',3201)})),
 'Se suman las unidades y programas listados. Usina del Arte y Festivales de la Ciudad son los dos programas de la misma dirección: se cuenta cada uno una vez. Turismo excluye la publicidad ya contada arriba. Incluye seguridad de eventos; no todo es entretenimiento.');
const electoralIds=units('24',[3187,3118]),electoral=electoralIds.map(id=>component(id));
const electoralTotal=sum(electoral),pasoRate=.35,pasoAmount=electoralTotal*pasoRate;
const paso=group('paso','ELECCIONES PASO',[{id:'paso-estimate',name:'Estimación propia: 35% del presupuesto electoral',amount:pasoAmount,estimated:true,programIds:[],ledger:[{key:'paso-estimate',amount:pasoAmount}],link:'#buscar?q=electoral',source:'Cálculo propio sobre las unidades electorales del proyecto',pages:[]}],
 'Estimación propia, no una partida oficial ni un ahorro garantizado. Se aplica un supuesto del 35% al Instituto de Gestión Electoral y la Unidad de Enlace Electoral. El presupuesto no separa PASO de elecciones generales.');
paso.estimate={rate:pasoRate,electoralTotal,components:electoral,formula:'0,35 × (Instituto de Gestión Electoral + Unidad de Enlace Electoral)',assumption:'El 35% es un supuesto de esta simulación. No se dispone de una desagregación oficial de costos PASO/generales ni de una fuente histórica verificada para ese porcentaje.'};
const greenIds=[...units('20',[3270,3161,3162,3269,3164,3163,3159,3165,3160,3170]),'program-21-0-0-2700-23','program-31-0-0-3638-74','program-21-0-0-2701-24'];
const green=group('green','AGENDA VERDE',greenIds.map(id=>component(id)).sort((a,b)=>b.amount-a.amount),'Selección temática de las unidades y programas enumerados. Incluye Operación del Reciclado, sin duplicarla con Reciclado y Economía Circular: tienen códigos y presupuestos distintos. La agrupación no demuestra por sí sola una duplicación de tareas.');
assert.equal(green.components[0].id,'program-21-0-0-2701-24');
const housingIds=[...units('45',[7327]),'program-45-0-0-1028-75'];
const housing=group('housing','PROGRAMAS DE VIVIENDA',housingIds.map(id=>component(id)),'Instituto de la Vivienda y programa Infraestructura y Vivienda de Desarrollo Humano. Son dos aperturas distintas; no se infiere que presten el mismo servicio.');
const extraIds=[...units('20',[9611,3244,3242,3245,3267,1054,1044]),...units('21',[9766])];
const covered=new Set([...extraIds,...housingIds,...greenIds].flatMap(id=>children(id).map(p=>p.id)));
const supportPrograms=depth.support.rows.flatMap(r=>r.programs).map(p=>entries.get('program-'+p.programId));assert(supportPrograms.every(Boolean));
assert.equal(add(supportPrograms),depth.support.total);
const excluded=supportPrograms.filter(p=>covered.has(p.id)),remaining=supportPrograms.filter(p=>!covered.has(p.id));
const support=group('support','CONDUCCIÓN Y BUROCRACIA',[...remaining.map(p=>component(p.id)),...extraIds.map(id=>component(id))],
 'Actividades Centrales y Comunes, excluyendo programas ya comprendidos en vivienda, agenda verde o las ocho unidades adicionales de esta misma viñeta; luego se añaden esas ocho unidades completas. Incluye administración de Salud y Educación. Estos montos no equivalen a un ahorro posible demostrado.');
support.calculation={allCentralAndCommon:depth.support.total,excluded:excluded.map(p=>({id:p.id,name:p.name,unitName:p.unitName,amount:p.project2027})),excludedTotal:add(excluded),additionalTotal:sum(extraIds.map(id=>component(id))),formula:'Actividades Centrales/Comunes − programas comprendidos en otras filas o en unidades adicionales + ocho unidades completas'};
support.byArea=[...new Set(support.components.map(c=>c.areaCode))].map(code=>({code,name:entries.get('area-'+code).name,amount:sum(support.components.filter(c=>c.areaCode===code))})).sort((a,b)=>b.amount-a.amount);
// Whole programs must be disjoint within card 4, including operation of recycling.
const counted=new Set();for(const g of [support,housing,green])for(const c of g.components)for(const p of c.programIds){assert(!counted.has(p),'Duplicate card 4: '+p);counted.add(p);}
// Card 3 counts advertising and the rest of each selected program separately.
const ledger3=new Set();for(const g of [publicity,events,paso])for(const c of g.components)for(const item of c.ledger){assert(!ledger3.has(item.key),'Duplicate card 3: '+item.key);assert(item.amount>=0);ledger3.add(item.key);}
const current=hist.series.currentPrimary.rows,capital=hist.series.capital.rows,at=(rows,y)=>rows.find(r=>r.year===y),cur27=at(current,2027),cur25=at(current,2025),previousRecord=current.filter(r=>r.year<2027).reduce((a,b)=>a.real>b.real?a:b);
assert.equal(previousRecord.year,2023);assert(cur27.real>previousRecord.real);
const currentComponents=fiscalMap.nodes.filter(r=>r.parent==='econ_corrientes').map(r=>({id:r.id,name:({econ_remun:'Personal',econ_consumo:'Bienes y servicios',econ_transfer:'Transferencias corrientes',econ_otroscorr:'Otros gastos corrientes'})[r.id],amount:r.value,pages:[r.pdfPage],source:r.reference,link:'#proyecto-2027?vista=summary&mapa=economic&nodo='+r.id+'&abiertas=econ_corrientes'})).sort((a,b)=>b.amount-a.amount);assert.equal(sum(currentComponents),cur27.nominal);
const s=project.summary,provider=companions.projects.find(r=>r.id==='providers'),belgrano=companions.projects.find(r=>r.id==='belgrano');
const interestInitial=execution.rows.filter(r=>r.fiscal&&r.codes.at(-1)==='21410000').reduce((s,r)=>s+r.s,0);
const cards=copy.cards.map(c=>({...c}));
Object.assign(cards[0],{components:currentComponents,amount:cur27.nominal,display:'$'+new Intl.NumberFormat('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(cur27.nominal/1e12)+' billones',perCapita:cur27.nominal/project.population.value,perCapitaLabel:'GASTO CORRIENTE POR PORTEÑO',realGrowth2025:(cur27.real/cur25.real-1)*100,realCapitalChange2026:(at(capital,2027).real/at(capital,2026).real-1)*100,previousRecordYear:previousRecord.year,abovePreviousRecord:(cur27.real/previousRecord.real-1)*100,
 history:current.filter(r=>[2005,2023,2025,2026,2027].includes(r.year)),capital:capital.filter(r=>[2026,2027].includes(r.year)),population:project.population,definition:'Gasto corriente sin intereses: sueldos, insumos, servicios contratados y transferencias corrientes. En esta viñeta se abrevia como gasto corriente; no es solo el funcionamiento que excluye transferencias.',method:'Importes históricos a precios de abril–junio de 2026, con los índices y supuestos de la serie histórica. 2026 y 2027 son autorizaciones, no ejecución. No se usa el factor 1,18 de la comparación de presupuestos anuales.',source:hist.source,priceAdjustment:hist.priceAdjustment});
Object.assign(cards[1],{closing2026Review:copy.closing2026Review,annual2025:caif.periods['2025-4'],semesters:caif.context.semesters,financialResult2027:s.financialResult.value,primaryResult2027:s.primaryResult.value,interest2027:s.interest.value,interestInitial2026:interestInitial,interestRealChangeInitial:(s.interest.value/interestInitial/1.18-1)*100,interestSharePrimary:s.interest.value/s.primaryResult.value*100,expense2027:s.fiscalExpense.value,providers:provider,belgrano,stock:depth.debt.stock,source:project.source});
cards[1].text=cards[1].text.replace('{bonds}',million(provider.amount));
Object.assign(cards[2],{groups:[publicity,events,paso],amount:sum([publicity,events,paso]),method:'Selección editorial, no clasificación oficial. Incluye una estimación PASO y costos de servicios. No demuestra que el total pueda eliminarse sin efectos.'});
cards[2].display=million(cards[2].amount);cards[2].text=cards[2].text.replace('{total}',cards[2].display);
Object.assign(cards[3],{groups:[support,housing,green],amount:sum([support,housing,green]),method:'Agrupación editorial para examinar funciones. No prueba que toda la estructura sea redundante. No se suman las viñetas 3 y 4: algunas partidas de publicidad están dentro de programas de conducción.'});
cards[3].display=trillion(cards[3].amount);cards[3].text=cards[3].text.replace('{total}',cards[3].display);
const discrepancies=[['Publicidad, comunicación y pauta',232784e6,publicity.amount,'Partida global + unidades de comunicación − publicidad ya incluida.'],['Eventos, turismo y entretenimiento',112060e6,events.amount,'Usina ya estaba dentro de la dirección de Festivales. Se cuenta una sola vez.'],['Total viñeta 3',373689e6,cards[2].amount,'Suma corregida de publicidad, eventos y estimación PASO.'],['Agenda verde',489473e6,green.amount,'Sumar importes exactos da 489.472 M al redondear el total; sumar las filas redondeadas da 489.473 M.'],['Total viñeta 4',2113626e6,cards[3].amount,'Coincide al redondear a millones.']].map(([name,requested,verified,reason])=>({name,requested,verified,verifiedRoundedMillions:roundM(verified),reason}));
const result={schemaVersion:1,year:2027,title:copy.title,subtitle:copy.subtitle,subtext:copy.subtext,unit:'ARS nominales de 2027, salvo los valores históricos expresamente ajustados a abril–junio de 2026',inflationForBudgetComparisons:.18,rounding:'Se calcula con pesos exactos y se redondea solo la cifra mostrada. La suma de componentes redondeados puede diferir del total redondeado. Las viñetas 1 y 2 contienen hechos de distintos períodos y no se suman.',cards,discrepancies,metricDiscrepancies:[{name:'Variación real de intereses frente al votado 2026',requested:93,verified:cards[1].interestRealChangeInitial,unit:'%',reason:'El 93% corresponde al inciso 7 completo (intereses y otros gastos de deuda). Para intereses solos se usa el código económico 21410000 en 2026 y la Planilla 16 en 2027.'}],inputs:files.map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')}))};
fs.writeFileSync(path.join(root,'data/home-highlights-2027.json'),JSON.stringify(result)+'\n');
const catalog=read('data/index.json');const id='home-highlights-2027';if(!catalog.datasets.some(d=>d.id===id)){catalog.datasets.push({id,name:'Lecturas de Inicio 2027',path:'data/home-highlights-2027.json',period:'2027',type:'derived',source:'Proyecto 2027 y fichas jurisdiccionales; ejecución GCBA 2025/2026; serie oficial IDECBA. Referencias completas en inputs y componentes.',description:'Viñetas: componentes, fórmulas, exclusiones, estimación PASO y fuentes conciliadas.',files:['data/home-highlights-2027.json']});fs.writeFileSync(path.join(root,'data/index.json'),JSON.stringify(catalog,null,2)+'\n');}
console.log(JSON.stringify({cards:cards.map(c=>({id:c.id,amount:c.amount})),discrepancies},null,2));
