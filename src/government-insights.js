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
function governmentReadingItems(area,detail,base='initial2026'){
 const readings=[],factor=state.areaReports.deflator.factor,scope=governmentScopeChange(area.code,detail);
 const calculation='Variaciones reales: proyecto dividido por '+factor+'; inflación supuesta, no observada. Montos del proyecto: pesos nominales de 2027.';
 const source='Planilla 4 del proyecto general 2027, p. 173; ejecución oficial 2026-2: votado, ampliado y devengado.';
 const add=(kind,text,references=[],movements=[],comparisonBase=null)=>readings.push({kind,text,references:[...references,kind==='execution'?'Comparación de ejecución del mismo semestre: importes ajustados con la inflación observada de cada período.':calculation],movements,comparisonBase});
 const rate=(row,b=base)=>row[b]>0?100*(row.project2027/factor/row[b]-1):null;
 const name=base==='initial2026'?'votado':'ampliado';
 const amplification=area.current2026-area.initial2026,amplificationRate=100*(area.current2026/area.initial2026-1);
 if(scope){
  const action=area.code==='21'?'Tras sumar':'Tras ceder',origin=area.code==='21'?'desde Espacio Público':'a Gabinete';
  add('scope',`${governmentVerb(rate(area,'initial2026'))} real frente al votado, tras ${action.toLowerCase().replace('tras ','')} higiene urbana, recolección, reciclado y plagas ${origin}. Frente al ampliado, que incorpora el traspaso, ${governmentVerb(rate(area,'current2026'))}.`,[source,...detail.reorganization2026.references.map(r=>r.file+', pp. '+r.pages.join(', '))]);
 }else{
  add('overview',`El proyecto asigna ${short(area.project2027)}: ${governmentVerb(rate(area,'initial2026'))} frente al votado 2026; ${governmentVerb(rate(area,'current2026'))} frente al ampliado.${detail.reorganization2026?.status==='pending-cause'?'':` Durante 2026 ${amplification<0?'se redujo':'se amplió'} ${short(Math.abs(amplification))} (${formatPercent(Math.abs(amplificationRate))}).`}`,[source,'La ampliación es nominal y corresponde al cambio entre el votado y junio de 2026.']);
 }
 if(detail.reorganization2026?.status==='pending-cause'){
  add('pending-cause',`Durante 2026 el presupuesto ${amplification<0?'se redujo':'se amplió'} ${formatPercent(Math.abs(amplificationRate))} (${short(Math.abs(amplification))}). Los documentos no permiten atribuir toda esa variación a una causa confirmada.`,[source,...detail.reorganization2026.references.map(r=>r.file+', pp. '+r.pages.join(', '))]);
 }
 const componentBase=scope?'current2026':base,componentName=scope?'ampliado':name;
 const groups=[{label:'Funcionamiento',codes:['1','2','3']},{label:'Inversión directa',codes:['4']},{label:'Transferencias',codes:['5']},{label:'Otras partidas',codes:['6','7','8']}].map(g=>({...g,row:governmentObjectGroup(area,g.codes)})).filter(g=>g.row.project2027>0);
 if(groups.length>1&&!['98','99'].includes(area.code)){
  const shown=groups.filter(g=>g.label==='Funcionamiento'||g.label==='Inversión directa'||g.label==='Transferencias'&&g.row.project2027/area.project2027>=.1).slice(0,2);
  const clauses=shown.map(g=>`${governmentShare(g.row.project2027,area.project2027).startsWith('más')||governmentShare(g.row.project2027,area.project2027).startsWith('menos')?'':'El '}${governmentShare(g.row.project2027,area.project2027)} ${g.label==='Funcionamiento'?'es funcionamiento (personal, insumos y servicios contratados)':g.label==='Inversión directa'?'se destina a obras y equipos':'son transferencias'}${rate(g.row,componentBase)===null?'':` y ${governmentVerb(rate(g.row,componentBase))}`}`);
  add('composition',clauses.join('. ')+'.',[source,'Funcionamiento: incisos 1–3; inversión directa: 4; transferencias: 5; otras partidas: 6–8.'],[],componentBase);
 }
 if(area.code==='99')add('treasury','Las partidas no asignables a programas cubren compromisos del Tesoro, incluidos subsidios al agua, energía y guarderías para el personal.',[`${detail.sources['2027'].file}, p. 6; descripción del programa 16.`]);
 const transfers=governmentTransferPrograms(detail),largestTransfer=transfers[0];
 const external=detail.financing.find(f=>f.code==='22'&&f.value/area.project2027>=.1);
 const candidates=governmentProgramMovements(detail,componentBase,factor).filter(p=>Number.isFinite(p.rate)&&Math.abs(p.rate)>=1&&governmentMaterialMovement(p,area,componentBase,factor)&&p.project2027/area.project2027<=.9&&(!(p.rate>100||p.rate< -50)||governmentFunctionalVerified(p))&&!(largestTransfer&&detail.economic.transfers/area.project2027>=.1&&p.id===largestTransfer.id));
 // Reserve room for substantial financing and transfers before adding program detail.
 const reserved=Number(Boolean(external))+Number(detail.economic.transfers/area.project2027>=.1);
 if(readings.length+reserved<5&&candidates.length){
  const p=candidates[0],same=candidates.filter(r=>Math.sign(r.delta)===Math.sign(p.delta)).slice(0,2);
  const sentence=items=>items.map(r=>r.id==='21-0-0-9765-88'?`Autódromo: de ${short(r[componentBase])} del ampliado 2026 a ${short(r.project2027)} del proyecto 2027 (${governmentVerb(r.rate)}); programa 88 identificado en el PDF original 2026, página 18.`:r.rate>100||r.rate< -50?`${governmentTitle(r.name)} pasa de ${short(r[componentBase])} en 2026 a ${short(r.project2027)} en 2027 (${governmentVerb(r.rate)}).`:`${governmentTitle(r.name)} ${governmentVerb(r.rate)}.`).join(' ');
  const chosen=sentence(same).split(/\s+/).length<=35?same:[p];
  add('program',sentence(chosen),chosen.flatMap(r=>[`${detail.sources['2027'].file}, pp. ${r.financialPages.join(', ')}.`,r.comparisonEvidence,'Base 2026: '+r.baselineKeys.join(', ')+'.',...(r.id==='21-0-0-9765-88'?['PDF original 2026, p. 18: programa 88, $137.533.970.848. Ampliado al 30/06: ejecución 2026-2, $160.688.057.950; no suma otras obras.']:[])]),chosen.map(r=>({id:r.id,base:componentBase,delta:r.delta,rate:r.rate})),componentBase);
 }
 if(external){
  const programs=detail.programs.filter(p=>p.financing.some(f=>f.code==='22'&&f.value>0)).sort((a,b)=>b.financing.find(f=>f.code==='22').value-a.financing.find(f=>f.code==='22').value);
  // This is a financing composition, not a claim about a program's movement.
  const leading=programs.slice(0,2).map(p=>governmentTitle(p.name)).join(' y ');
  add('financing',`El ${governmentShare(external.value,area.project2027)} (${short(external.value)}) se cubriría con financiamiento externo (préstamos y deuda). Se concentra en ${leading}.`,[`${detail.sources['2027'].file}, financiación, p. ${external.pdfPage}; código 22.`,...programs.map(p=>`${p.name}: pp. ${p.financing.find(f=>f.code==='22').pdfPages.join(', ')}.`)]);
 }
 if(largestTransfer&&detail.economic.transfers/area.project2027>=.1){
  const recipient=governmentTransferRecipient(largestTransfer);
  let text=`El ${governmentShare(detail.economic.transfers,area.project2027)} son transferencias (${short(detail.economic.transfers)}). `;
  text+=recipient?`${short(largestTransfer.transfer)} van a ${recipient}.`:'No se identifica un receptor único en la apertura publicada.';
  if(largestTransfer.id==='31-0-0-3126-40')text=`El ${governmentShare(detail.economic.transfers,area.project2027)} son transferencias; ${short(largestTransfer.transfer)} van a SBASE. Reúne operación y obras, sin separación de sus importes en la ficha publicada.`;
  if(area.code==='24'){const electoral=detail.programs.find(p=>p.name==='Gestión Electoral');if(electoral)text=`El ${governmentShare(detail.economic.transfers,area.project2027)} son transferencias (${short(detail.economic.transfers)}); ${short(electoral.objects.find(o=>o.code==='5')?.project2027||0)} corresponden a Gestión Electoral (PDF, p. 195).`;}
  add('transfers',text,[`${detail.sources['2027'].file}, inciso 5, pp. ${largestTransfer.financialPages.join(', ')}; descripción, pp. ${largestTransfer.descriptionPages.join(', ')}.`, 'No se equiparan las transferencias a empresas con inversión directa.']);
 }
 if(readings.length<5&&area.executed2026/area.current2026<.3&&!['98','99'].includes(area.code)){
  const prior=state.governmentSemester?.jurisdictions.find(r=>r.name===area.name);
  if(prior&&Math.abs(prior.nominal2026-area.executed2026)<1){const change=100*(prior.b/prior.a-1);add('execution',`En enero–junio de 2026 el gasto ejecutado ${governmentVerb(change)} frente al mismo semestre de 2025, descontando la inflación observada del período.`,['Ejecución oficial: mismo semestre y jurisdicción; IPC de cada período, no el supuesto 2027.','Importes comparables: '+prior.a+' y '+prior.b+'.'],[],'semester2025');}
 }
 return readings.slice(0,5).map(r=>({...r,text:r.text[0].toUpperCase()+r.text.slice(1)}));
}
