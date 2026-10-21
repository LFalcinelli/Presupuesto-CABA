'use strict';
// Shared by the movement chart and editorial selection. No source amounts are rounded.
function governmentProgramMovements(detail,base,factor){
 return detail.programs.filter(p=>p.comparisonStatus!=='pending'&&p[base]!==null&&Number.isFinite(p[base])).map(p=>({...p,delta:p.project2027/factor-p[base],rate:p[base]>0?100*(p.project2027/factor/p[base]-1):null})).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));
}
function governmentMaterialMovement(p,area,base,factor){
 const minimum=Math.min(.02*area.project2027/factor,5e9);
 return Math.abs(p.delta)>=minimum&&(p.project2027/area.project2027>=.01||p[base]/area[base]>=.01);
}
function governmentShare(value,total){
 const share=total>0?100*value/total:0;
 if(share===0)return '0%';
 if(share<100&&formatPercent(share)==='100%')return 'más del 99%';
 if(formatPercent(share)==='0,0%')return 'menos de 0,1%';
 return formatPercent(share);
}
function governmentVerb(rate){
 if(!Number.isFinite(rate))return 'no tiene una variación comparable';
 if(Math.abs(rate)<1)return 'se mantiene';
 return (rate>0?'aumenta ':'baja ')+formatPercent(Math.abs(rate));
}
function governmentScopeChange(code,detail){
 if(detail&&detail.reorganization2026?.status!=='documented-transfer')return null;
 return ({'21':{label:'Concentración de funciones',note:'Sumó funciones de higiene urbana, recolección, reciclado y control de plagas desde Espacio Público.'},'35':{label:'Traspaso de funciones',note:'Funciones de higiene urbana, recolección, reciclado y control de plagas pasaron a Gabinete.'}})[code]||null;
}
function governmentTransferRecipient(p){
 // Named recipients are limited to descriptions already reviewed, with their pages retained.
 const names={'31-0-0-3126-40':'SBASE','31-0-0-3130-39':'Empresas de colectivos','45-0-0-1009-67':'Organizaciones sociales de grupos comunitarios','45-0-0-1009-41':'Hogares beneficiarios de Ciudadanía Porteña','55-0-0-570-43':'Escuelas de gestión privada','75-0-0-3199-103':'Ente Público no Estatal Parque de la Innovación','75-0-0-3200-16':'Consejo Económico y Social (CESBA)'};
 return names[p.id]||null;
}
function governmentTransferPrograms(detail){
 return detail.programs.map(p=>({...p,transfer:p.objects.find(o=>o.code==='5')?.project2027||0})).filter(p=>p.transfer>0).sort((a,b)=>b.transfer-a.transfer);
}
function governmentFunctionalVerified(p){return ['continues','recoded'].includes(p.comparisonStatus)&&/Contraste textual|funciones.*contrastad|Se conserva la continuidad funcional/i.test(p.comparisonEvidence||'');}
// Do not infer an annual execution change across a changed institutional perimeter.
function governmentExecutionComparable(area,detail){
 return !['21','35'].includes(area.code)&&!detail.reorganization2026&&area.initial2026>0&&Math.abs(area.current2026/area.initial2026-1)<=.25;
}
function governmentReadingItems(area,detail){
 const base='current2026',factor=state.areaReports.deflator.factor;
 const curated=state.areaHighlights?.entries.filter(r=>r.area===area.code);
 if(curated?.length)return curated.map(r=>({...r,movements:r.movements||[],comparisonBase:base}));
 const readings=[],source=detail.sources['2027'].file,common='Ampliado al 30/06/2026; proyecto dividido por '+factor+' para comparar, con inflación supuesta del 18%.';
 const add=(kind,title,text,rows=[],movements=[])=>readings.push({kind,title,text,references:[source,...rows.map(r=>'Programa '+r.id+'; pp. '+r.financialPages.join(', ')+'. '+r.comparisonEvidence),common],movements,comparisonBase:base});
 const name=p=>governmentTitle(p.name).replace(/Subterráneos de Buenos Aires/gi,'Subterráneos de Buenos Aires (SBASE)').replace(/Desarrollos y Proyectos/gi,'Desarrollos y Proyectos (Línea F)');
 const rate=p=>p[base]>0&&['continues','recoded'].includes(p.comparisonStatus)?100*(p.project2027/factor/p[base]-1):null;
 const programs=[...detail.programs].sort((a,b)=>b.project2027-a.project2027),largest=programs[0],chosen=new Set();
 if(largest&&largest.project2027<area.project2027){
  const change=rate(largest);add('largest','El principal destino del área',`${name(largest)} recibe ${short(largest.project2027)}${change===null?' en 2027; su comparación funcional sigue por confirmar.':` (${signedPct(change)} real frente al ampliado 2026).`}`,[largest]);chosen.add(largest.id);
 }else{
  if(largest)chosen.add(largest.id);
  const object=[...area.objects].sort((a,b)=>b.project2027-a.project2027)[0];
  add('largest','El principal tipo de gasto',`${governmentTitle(object.name)} concentra el ${governmentShare(object.project2027,area.project2027)} del área en 2027.`,[],[]);
 }
 const movements=governmentProgramMovements(detail,base,factor).filter(p=>Number.isFinite(p.rate)&&governmentMaterialMovement(p,area,base,factor)&&(!(p.rate>100||p.rate< -50)||governmentFunctionalVerified(p)));
 for(const sign of [1,-1]){
  const p=movements.find(p=>Math.sign(p.delta)===sign&&!chosen.has(p.id));if(!p)continue;
  add('program',sign===1?'La mayor suba en pesos':'La mayor baja en pesos',`${name(p)} propone ${short(p.project2027)} (${signedPct(p.rate)} real): ${short(Math.abs(p.delta))} ${sign===1?'más':'menos'} en pesos de 2026.`,[p],[{id:p.id,base,delta:p.delta,rate:p.rate}]);chosen.add(p.id);
 }
 const execution=detail.programs.filter(p=>p.current2026>=1e10&&p.executed2026!==null&&p.executed2026/p.current2026<.3).sort((a,b)=>b.current2026-a.current2026)[0];
 if(execution&&readings.length<5)add('execution','Presupuesto con baja ejecución',`${name(execution)} usó el ${governmentShare(execution.executed2026,execution.current2026)} del ampliado a junio 2026; el proyecto 2027 propone ${short(execution.project2027)}.`,[execution]);
 const external=detail.financing.find(f=>f.code==='22');
 if(external?.value>0&&readings.length<5)add('financing','Una parte con financiamiento externo',`${short(external.value)} se cubrirían con préstamos y deuda externa en 2027, el ${governmentShare(external.value,area.project2027)} del área.`);
 if(detail.validation.pending2027Programs>0&&readings.length<5)add('coverage','Comparaciones todavía por confirmar',`${detail.validation.pending2027Programs} de ${detail.programs.length} programas tienen su continuidad por verificar; no se interpretan como servicios nuevos o eliminados.`);
 if(readings.length<3)add('execution-general','El avance a junio 2026',`A junio de 2026 se había usado el ${governmentShare(area.executed2026,area.current2026)} del presupuesto ampliado del área; no es un cierre anual.`);
 if(readings.length<3){const f=detail.financing.find(f=>f.value>0);if(f)add('financing','Origen de los recursos',`El ${governmentShare(f.value,area.project2027)} del presupuesto 2027 se financiaría con ${f.name.toLowerCase()}.`);else add('coverage','Programas de esta área',`La ficha reúne ${detail.programs.length} programas para 2027; sus partidas se pueden explorar en el detalle.`);}
 const scope=governmentScopeChange(area.code,detail);
 if(scope&&readings.length<5)add('scope','Cambió la dependencia de servicios',scope.note+' La comparación usa el ampliado 2026, que ya incorpora el traspaso.');
 return readings.slice(0,5);
}
