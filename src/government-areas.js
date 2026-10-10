'use strict';
// Dedicated, shareable jurisdiction fiches. Monetary data stays in the existing
// reports dataset; the optional PDF detail is loaded only for the selected area.
projectTabs.areas='Áreas de Gobierno';
const governmentAreaLoad=ensureViewData;
const governmentAreaCache=new Map();
ensureViewData=async function(view,period){
 await governmentAreaLoad(view,period);
 const legacy=state.areaReportId,report=areaReportFind(legacy);
 if(view==='project'&&legacy?.startsWith('ue-')&&report?.detail2027){state.governmentArea=report.codes[1];state.governmentUnit=report.codes[4];state.projectTab='areas';state.areaReportId=null;}
 if(view==='project'&&state.projectTab==='areas'&&state.governmentArea){
  const area=state.areaReports.areas.find(a=>a.code===state.governmentArea);
  if(area?.detailFile){if(!governmentAreaCache.has(area.detailFile))governmentAreaCache.set(area.detailFile,Site.load(area.detailFile).catch(e=>{governmentAreaCache.delete(area.detailFile);throw e;}));state.governmentAreaDetail=await governmentAreaCache.get(area.detailFile);}else state.governmentAreaDetail=null;
 }
};
const governmentAreaRead=readRoute,governmentAreaSync=syncRoute;
readRoute=function(){
 governmentAreaRead();const q=new URLSearchParams(location.hash.split('?')[1]||'');
 state.governmentArea=state.view==='project'&&/^\d{1,2}$/.test(q.get('area')||'')?String(Number(q.get('area'))):null;
 state.governmentUnit=q.get('unidad')||null;state.governmentProgram=q.get('programa')||null;
 state.governmentPrices=q.get('valores')==='nominal'?'nominal':'real';state.governmentBase=q.get('base')==='current'?'current':'initial';
 state.governmentRanking=q.get('ranking')==='programs'?'programs':'units';
 state.governmentSort=['increase','decrease'].includes(q.get('orden'))?q.get('orden'):'amount';
 const legacy=state.areaReportId;
 if(legacy?.startsWith('area-')){state.governmentArea=legacy.slice(5);state.projectTab='areas';state.areaReportId=null;}
};
syncRoute=function(){
 if(state.view!=='project'||state.projectTab!=='areas'){governmentAreaSync();return;}
 const q=new URLSearchParams({vista:'areas'});
 if(state.governmentArea)q.set('area',state.governmentArea);
 if(state.governmentUnit)q.set('unidad',state.governmentUnit);
 if(state.governmentProgram)q.set('programa',state.governmentProgram);
 if(state.governmentPrices==='nominal')q.set('valores','nominal');
 q.set('base',state.governmentBase);
 if(state.governmentRanking==='programs')q.set('ranking','programs');
 if(state.governmentSort&&state.governmentSort!=='amount')q.set('orden',state.governmentSort);
 const hash='#proyecto-2027?'+q;if(location.hash!==hash)history.pushState(null,'',hash);
};
function governmentOpen(code,unit=null,program=null){
 const dialog=document.querySelector('#area-report-dialog[open]');if(dialog)dialog.close();
 state.view='project';state.projectTab='areas';state.governmentArea=code;state.governmentUnit=unit;
 state.governmentProgram=program;state.areaReportId=null;state.navigationRequested=true;render();
}
const governmentOldReport=showAreaReport;
showAreaReport=function(id,origin){
 const report=areaReportFind(id);
 if(report?.kind==='area'){governmentOpen(report.code);return;}
 if(report?.detail2027){governmentOpen(report.codes[1],report.codes[4]);return;}
 governmentOldReport(id,origin);
};
window.addEventListener('click',e=>{if(e.target.closest('[data-project-tab="areas"]')){state.governmentArea=null;state.governmentUnit=null;state.governmentProgram=null;state.areaReportId=null;}},true);
const governmentProjectView=extraViews.project;
extraViews.project=function(){
 if(state.projectTab!=='areas')return governmentProjectView();
 return `<section class="panel project-page government-areas"><p class="eyebrow">PROYECTO DE PRESUPUESTO 2027</p>${state.governmentArea?governmentAreaPage():governmentAreaDirectory()}<dialog class="project-dialog" id="project-detail-dialog" aria-labelledby="project-dialog-title"><button class="dialog-close" data-project-dialog-close aria-label="Cerrar detalle">×</button><div id="project-dialog-body"></div></dialog></section>`;
};
function governmentTitle(name){return name.replace(/\bDe\b/g,'de').replace(/\bLa\b/g,'la').replace(/\bDel\b/g,'del').replace(/\bE\b/g,'e').replace(/\bY\b/g,'y');}
function governmentPeople(area,compact=false){
 const n=area.officials?.value;
 return `<span>${n===null||n===undefined?'Sin dato verificable':`<b>${fmt(n)}</b> funcionarios relevados`}</span><small>Padrón 2026 · corte exacto no publicado${compact?'':'; no es dotación de 2027.'}</small>`;
}
function governmentAreaCards(){
 const words=areaSearchNorm(state.governmentQuery||'').split(' ').filter(Boolean);
 let areas=state.areaReports.areas.filter(a=>words.every(w=>areaSearchNorm(a.name).includes(w))&&(!state.governmentType||a.institutionType===state.governmentType));
 areas.sort((a,b)=>{const sort=state.governmentDirectorySort;if(sort==='alphabetic')return a.name.localeCompare(b.name,'es');if(['increase','decrease'].includes(sort)){const av=governmentRealChange(a),bv=governmentRealChange(b);return av===null||bv===null?Number(av===null)-Number(bv===null):(sort==='increase'?bv-av:av-bv);}return b.project2027-a.project2027;});
 const total=state.project.summary.fiscalExpense.value;
 return `<p class="gov-result-count" role="status">${areas.length} de 22 jurisdicciones${areas.length<22?` · ${short(areas.reduce((s,a)=>s+a.project2027,0))} en la selección`:''}</p><div class="gov-cards">${areas.map(a=>`<a class="gov-card" href="#proyecto-2027?vista=areas&area=${a.code}&base=${state.governmentBase}${state.governmentPrices==='nominal'?'&valores=nominal':''}"><span class="eyebrow">${E(a.institutionType)} · ${a.code}</span><h2>${E(governmentTitle(a.name))}</h2><strong class="gov-card-value">${short(a.project2027)}</strong><span class="gov-exact">${money(a.project2027)}</span><span class="gov-share">${pct(a.project2027/total*100)} del presupuesto de la Ciudad</span><span class="gov-card-change ${governmentRealChange(a)<0?'negative':'positive'}">${governmentRealChange(a)===null?'Sin base':signedPct(governmentRealChange(a))+' real frente al '+governmentBaseName()+' 2026'}</span>${governmentMiniComposition(a)}<div class="gov-card-people">${governmentPeople(a,true)}</div><span class="gov-card-enter">Explorar el área <span aria-hidden="true">→</span></span></a>`).join('')}</div>${areas.length?'':'<p>No encontramos esa área. Probá con otra palabra o quitá el filtro.</p>'}`;
}
function governmentAreaDirectory(){
 return `<h1>Áreas de Gobierno</h1><p class="gov-lead">Quién administra el presupuesto y para qué lo usaría.</p><div class="gov-directory-total"><strong>22 jurisdicciones</strong><span>${short(state.project.summary.fiscalExpense.value)} solicitados para 2027</span></div><p class="gov-note">Cada presupuesto se cuenta una sola vez. El padrón de funcionarios cubre parte del Ejecutivo; otros poderes y partidas transversales quedan sin una cifra verificable.</p>${governmentComparisonControls(true)}${governmentCitySummary()}<div class="gov-directory-tools"><label>Buscar un área<input id="gov-directory-search" type="search" value="${E(state.governmentQuery||'')}" placeholder="Por ejemplo: Salud o Infraestructura" aria-controls="gov-directory-results"></label><label>Ordenar<select id="gov-directory-sort"><option value="amount">Mayor presupuesto</option><option value="alphabetic" ${state.governmentDirectorySort==='alphabetic'?'selected':''}>Nombre del área</option><option value="increase" ${state.governmentDirectorySort==='increase'?'selected':''}>Mayor aumento real</option><option value="decrease" ${state.governmentDirectorySort==='decrease'?'selected':''}>Mayor reducción real</option></select></label><label>Tipo de área<select id="gov-directory-type"><option value="">Todas</option>${[...new Set(state.areaReports.areas.map(a=>a.institutionType))].map(type=>`<option ${state.governmentType===type?'selected':''}>${E(type)}</option>`).join('')}</select></label></div><div id="gov-directory-results">${governmentAreaCards()}</div><p class="gov-note">Las 22 áreas cuentan con aperturas por unidades y programas. Las continuidades que aún no pueden confirmarse se identifican en cada ficha.</p>${detailLink('presupuesto-2027','Fuentes y método de comparación')}`;
}
function governmentBasis(){return state.governmentBase==='initial'?'initial2026':'current2026';}
function governmentFactor(){return state.governmentPrices==='nominal'?1:state.areaReports.deflator.factor;}
function governmentChange(row){const base=row[governmentBasis()];return base>0?(row.project2027/governmentFactor()/base-1)*100:null;}
function governmentComparisonControls(directory=false){
 return `<div class="gov-comparison-tools"><label>Comparar con<select id="gov-base"><option value="initial" ${state.governmentBase==='initial'?'selected':''}>Presupuesto votado 2026</option><option value="current" ${state.governmentBase==='current'?'selected':''}>Presupuesto ampliado 2026</option></select><small>${state.governmentBase==='initial'?'El que aprobó la Legislatura.':'Vigente a junio, con las modificaciones del año.'}</small></label>${directory?'':`<label>Cómo ver los valores<select id="gov-prices"><option value="real">Ajustados por inflación</option><option value="nominal" ${state.governmentPrices==='nominal'?'selected':''}>Pesos de cada presupuesto</option></select></label>`}<p class="gov-note">${!directory&&state.governmentPrices==='nominal'?'Los importes conservan los pesos de cada año.':'Variaciones reales estimadas con inflación supuesta del 18%.'}</p></div>`;
}
function governmentCitySummary(){
 const areas=state.areaReports.areas,total=areas.reduce((s,a)=>s+a.project2027,0);
 const objects=Array.from({length:8},(_,i)=>Object.fromEntries(['project2027','initial2026','current2026','executed2026'].map(k=>[k,areas.reduce((s,a)=>s+(a.objects[i][k]||0),0)])));
 const core=Object.fromEntries(['project2027','initial2026','current2026'].map(k=>[k,objects.slice(0,3).reduce((s,o)=>s+o[k],0)])),investment=objects[3];
 return `<div class="gov-city-summary"><h2>¿Qué cambia en el conjunto de la Ciudad?</h2><p class="gov-city-reading">El funcionamiento cambia ${signedPct(governmentRealChange(core))} real y la inversión directa ${signedPct(governmentRealChange(investment))}, frente al presupuesto ${governmentBaseName()} 2026.</p>${governmentBars([{name:'Personal',i:0},{name:'Servicios no personales',i:2},{name:'Inversión directa',i:3},{name:'Intereses y otros gastos de deuda',i:6}].map(g=>({...g,name:g.name+' · '+signedPct(governmentRealChange(objects[g.i]))+' real',value:objects[g.i].project2027})),total,'Tipos de gasto del proyecto 2027')}<small>Las barras muestran su peso en el proyecto; las variaciones descuentan el 18% supuesto. Fuente: Planilla 4, p. 173 y ejecución 2026 al segundo trimestre.</small></div>`;
}
function governmentBars(rows,total,label){
 const colors=['#69309a','#8e6bad','#30796b','#a689bf','#687eab','#b48d47','#746a7f','#8b788c'];
 return `<div class="gov-bars" role="group" aria-label="${E(label)}">${rows.filter(r=>r.value>0).map((r,i)=>`<div class="gov-bar-row"><span>${E(r.name)}</span><strong>${short(r.value)}</strong><div class="gov-bar-track"><i style="width:${r.value/total*100}%;background:${colors[i%colors.length]}"></i></div><small>${pct(r.value/total*100)}</small></div>`).join('')}</div>`;
}
function governmentDataTable(rows,caption){
 return `<details class="gov-source-details"><summary>Consultar los importes exactos</summary><div class="table-wrap"><table><caption>${E(caption)}</caption><thead><tr><th>Concepto</th><th>Importe</th></tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${E(r.name)}</th><td class="num">${money(r.value)}</td></tr>`).join('')}</tbody></table></div></details>`;
}
function governmentComposition(area,detail){
 const objects=area.objects.map(o=>({...o,value:o.project2027/governmentFactor()}));
 const total=area.project2027/governmentFactor();
 return `<section class="gov-section" id="gov-composition"><h2>¿En qué se usaría?</h2><p>Por tipo de gasto · ${state.governmentPrices==='nominal'?'proyecto 2027':'2027 ajustado con el supuesto del 18%'}</p>${governmentBars(objects,total,'Composición por objeto del gasto')}${governmentDataTable(objects,'Objeto del gasto · '+(state.governmentPrices==='nominal'?'pesos 2027':'2027 dividido por 1,18'))}${detail?`<details class="gov-source-details"><summary>Cómo se financiaría este presupuesto</summary><p>Es el origen del mismo dinero, no un gasto adicional.</p>${governmentBars(detail.financing.map(f=>({...f,name:f.name+' · código '+f.code,value:f.value})),area.project2027,'Fuentes de financiamiento')}${governmentDataTable(detail.financing,'Fuentes de financiamiento · importes nominales 2027')}<a href="${E(detail.financingLabelSource)}" target="_blank" rel="noopener">Clasificador oficial de fuentes ↗</a></details>`:''}</section>`;
}
function governmentStages(area){
 const rows=[{name:'Votado 2026',value:area.initial2026},{name:'Ampliado · junio 2026',value:area.current2026},{name:'Proyecto 2027',value:area.project2027/governmentFactor()}];
 const max=Math.max(...rows.map(r=>r.value));
 return `<section class="gov-section" id="gov-stages"><h2>De lo aprobado a lo propuesto</h2><p>Tres autorizaciones para años completos. ${state.governmentPrices==='nominal'?'Sin ajuste de precios.':'El punto de 2027 se ajusta por el 18% supuesto.'}</p><div class="gov-stage-bars">${rows.map((r,i)=>`<div class="gov-stage-row ${i===2?'project':''}"><span>${r.name}</span><div><i style="width:${r.value/max*100}%"></i></div><strong>${short(r.value)}</strong></div>`).join('')}</div>${governmentDataTable(rows,'Autorizaciones · comparación por etapa')}<p class="gov-ampliation"><b>Cambio durante 2026:</b> ${area.current2026-area.initial2026<0?'−':'+'}${short(Math.abs(area.current2026-area.initial2026))} (${signedPct(100*(area.current2026/area.initial2026-1))}) entre lo votado y lo ampliado a junio.</p><div class="gov-execution"><div><span>Gasto devengado · enero–junio 2026</span><strong>${short(area.executed2026)}</strong></div><div><span>Del crédito vigente a junio</span><strong>${pct(area.executed2026/area.current2026*100)}</strong></div><p>Obligaciones reconocidas en el primer semestre. Es una ejecución parcial, separada de las autorizaciones anuales.</p></div></section>`;
}
function governmentStatus(row){return ({continues:'Funciones contrastadas',recoded:'Código homologado',reorganized:'Funciones agrupadas',pending:'Antecedente pendiente'})[row.comparisonStatus]||'Perímetro distinto';}
function governmentRankingRows(detail){
 const programs=state.governmentRanking==='programs',key=programs?'programs':'units';
 let rows=[...detail[key]];
 if(state.governmentUnit&&programs)rows=rows.filter(r=>r.unitCode===state.governmentUnit);
 const rankChange=r=>(programs?r.comparisonStatus!=='pending':r.comparisonStatus==='continues')?governmentChange(r):null;
 rows.sort((a,b)=>{if(!['increase','decrease'].includes(state.governmentSort))return b.project2027-a.project2027;const av=rankChange(a),bv=rankChange(b);if(av===null||bv===null)return Number(av===null)-Number(bv===null)||b.project2027-a.project2027;return (state.governmentSort==='increase'?bv-av:av-bv)||b.project2027-a.project2027;});
 const max=Math.max(...rows.map(r=>r.project2027),1),total=detail.stages.project2027;
 return `<div class="gov-ranking">${rows.map(r=>{
  const rate=governmentChange(r),same=programs?r.comparisonStatus!=='pending':r.comparisonStatus==='continues';
  return `<article><button ${programs?`data-gov-program="${r.id}"`:`data-gov-unit="${r.code}"`} aria-label="Explorar ${E(r.name)}"><span><small>${programs?'Programa':'Unidad ejecutora'} ${r.code}</small><b>${E(governmentTitle(r.name))}</b></span><strong>${short(r.project2027/governmentFactor())} <span aria-hidden="true">↗</span></strong></button><div class="gov-rank-track"><i style="width:${r.project2027/max*100}%"></i></div><div class="gov-rank-context"><span>${pct(r.project2027/total*100)} del área</span><span>${state.governmentBase==='initial'?'Votado':'Ampliado'} 2026: ${r[governmentBasis()]===null?'sin base homologada':short(r[governmentBasis()])}</span><span>${same&&rate!==null?`${signedPct(rate)} ${state.governmentPrices==='nominal'?'nominal':'real estimado'}`:'Cambio de alcance / por verificar'}</span></div><small class="gov-status">${E(governmentStatus(r))}${same?'':' · no se interpreta como cambio del mismo servicio'}</small></article>`;
 }).join('')}</div>`;
}
function governmentRankTable(detail){
 const programs=state.governmentRanking==='programs',rows=detail[programs?'programs':'units'].filter(r=>!programs||!state.governmentUnit||r.unitCode===state.governmentUnit);
 return `<details class="gov-source-details"><summary>Comparar importes y variaciones nominales y reales</summary><div class="table-wrap"><table><caption>Proyecto 2027 frente al ${state.governmentBase==='initial'?'votado':'ampliado'} 2026 · pesos originales</caption><thead><tr><th>${programs?'Programa':'Unidad'}</th><th>2027</th><th>2026</th><th>Nominal</th><th>Real estimada</th><th>Comparabilidad</th></tr></thead><tbody>${rows.map(r=>{const b=r[governmentBasis()],n=b?100*(r.project2027/b-1):null,v=b?100*(r.project2027/b/1.18-1):null;return `<tr><th scope="row">${E(r.name)} · ${r.code}</th><td class="num">${money(r.project2027)}</td><td class="num">${b===null?'Sin base':money(b)}</td><td>${n===null?'—':signedPct(n)}</td><td>${v===null?'—':signedPct(v)}</td><td>${E(governmentStatus(r))}${r.comparisonStatus==='reorganized'?' · diferencias entre perímetros, no mismo servicio':''}</td></tr>`;}).join('')}</tbody></table></div></details>`;
}
function governmentRanking(detail){
 return `<section class="gov-section" id="gov-ranking"><h2>Seguí el dinero dentro del área</h2><div class="gov-ranking-tools"><label>Agrupar por<select id="gov-rank-group"><option value="units">Unidades ejecutoras</option><option value="programs" ${state.governmentRanking==='programs'?'selected':''}>Programas</option></select></label><label>Ordenar por<select id="gov-ranking-sort"><option value="amount">Mayor presupuesto</option><option value="increase" ${state.governmentSort==='increase'?'selected':''}>Mayor aumento porcentual</option><option value="decrease" ${state.governmentSort==='decrease'?'selected':''}>Mayor reducción porcentual</option></select></label></div><p class="gov-note">Las unidades administran programas: son dos formas de abrir el mismo presupuesto. Las variaciones de perímetros reorganizados se consultan en la tabla, con su advertencia.</p>${governmentRankingRows(detail)}${governmentRankTable(detail)}</section>`;
}
function governmentUnit(detail){
 const unit=detail.units.find(u=>u.code===state.governmentUnit);if(!unit)return '';
 const programs=detail.programs.filter(p=>p.unitCode===unit.code),objects=unit.objects.map(o=>({...o,value:o.project2027/governmentFactor()}));
 return `<section class="gov-unit-detail gov-section" id="gov-unit" tabindex="-1"><button class="text-link" data-gov-clear-unit>← Ver todas las unidades</button><p class="eyebrow">UNIDAD EJECUTORA ${unit.code}</p><h2>${E(governmentTitle(unit.name))}</h2><strong class="gov-unit-value">${short(unit.project2027/governmentFactor())}</strong><p>${pct(unit.project2027/detail.stages.project2027*100)} del presupuesto del área · ${programs.length} programas</p>${governmentBars(objects,unit.project2027/governmentFactor(),'Gastos de la unidad ejecutora')}<div class="gov-program-links">${programs.map(p=>`<button data-gov-program="${p.id}"><span>${E(governmentTitle(p.name))}<small>Programa ${p.code}</small></span><strong>${short(p.project2027/governmentFactor())} ↗</strong></button>`).join('')}</div></section>`;
}
function governmentProgram(detail){
 const p=detail.programs.find(r=>r.id===state.governmentProgram);if(!p)return '';
 return `<section class="gov-program-detail gov-section" id="gov-program" tabindex="-1"><button class="text-link" data-gov-clear-program>← Cerrar detalle del programa</button><p class="eyebrow">PROGRAMA ${p.code} · UNIDAD ${p.unitCode}</p><h2>${E(governmentTitle(p.name))}</h2><strong class="gov-unit-value">${short(p.project2027/governmentFactor())}</strong><p>${E(p.comparisonEvidence)}</p>${governmentBars(p.objects.map(o=>({...o,value:o.project2027/governmentFactor()})),p.project2027/governmentFactor(),'Gastos del programa')}${governmentProgramOpenings(p)}<details class="gov-source-details"><summary>Objetivos, metas y evidencia de la comparación</summary><p>${E(p.description)}</p><p>Descripción 2027: páginas ${p.descriptionPages.join(', ')}. Presupuesto: página ${p.financialPage}.</p>${p.classificationNote?`<p>${E(p.classificationNote)}</p>`:''}${p.targets.length?`<h3>Metas físicas del programa</h3><ul>${p.targets.map(t=>`<li>${E(t.officialText)} · p. ${t.pdfPage}</li>`).join('')}</ul><p>Se conserva la unidad oficial. No se atribuye todo el presupuesto a una única meta u obra.</p>`:''}${p.previousDescriptions.map(r=>`<h3>Antecedente 2026 · ${E(r.id)}</h3><p>${E(r.text)}</p><p>Páginas ${r.pages.join(', ')} del documento jurisdiccional 2026.</p>`).join('')}</details></section>`;
}
function governmentContributions(detail){
 const base=governmentBasis(),factor=governmentFactor();
 const rows=detail.programs.filter(r=>r[base]!==null).map(r=>({...r,delta:r.project2027/factor-r[base]}));
 const positive=rows.filter(r=>r.delta>0).sort((a,b)=>b.delta-a.delta).slice(0,5),negative=rows.filter(r=>r.delta<0).sort((a,b)=>a.delta-b.delta).slice(0,5);
 const max=Math.max(...rows.map(r=>Math.abs(r.delta)),1),total=detail.stages.project2027;
 const list=(items,label)=>`<div><h3>${label}</h3>${items.map(r=>`<button class="gov-contribution" data-gov-program="${r.id}"><span>${E(governmentTitle(r.name))}</span><strong class="${r.delta>0?'positive':'negative'}">${r.delta>0?'+':'−'}${short(Math.abs(r.delta))}</strong><div class="gov-change-track"><i style="width:${Math.abs(r.delta)/max*100}%;background:${r.delta>0?'#287d67':'#b63050'}"></i></div><small>${signedPct(governmentChange(r))} · ${pct(r.project2027/total*100)} del área</small></button>`).join('')}</div>`;
 const matchedChange=rows.reduce((s,r)=>s+r.delta,0),totalChange=detail.stages.project2027/factor-detail.stages[base],pending=totalChange-matchedChange;
 return `<section class="gov-section" id="gov-changes"><h2>¿Dónde cambia el presupuesto?</h2><p>Los cinco mayores movimientos en ${state.governmentPrices==='nominal'?'pesos de cada presupuesto':'pesos comparables, con el supuesto del 18%'}. Una suba porcentual grande puede representar poco dinero.</p><div class="gov-contributions">${list(positive,'Aumentos que más pesan')}${list(negative,'Mayores reducciones')}</div><div class="gov-contribution-total"><span>Cambio de los programas homologados <b>${matchedChange>=0?'+':'−'}${short(Math.abs(matchedChange))}</b></span><span>Cambios de alcance y antecedentes pendientes <b>${pending>=0?'+':'−'}${short(Math.abs(pending))}</b></span><span>Cambio total del área <b>${totalChange>=0?'+':'−'}${short(Math.abs(totalChange))}</b></span></div><p class="gov-note">El saldo separa los cambios de dependencia y las aperturas sin antecedente funcional confirmado. Se conserva para conciliar el total y no se presenta como ahorro ni como creación de gasto.</p></section>`;
}
function governmentChanges(detail){
 return `<section class="gov-section" id="gov-organization"><h2>Qué cambia en la organización</h2><p>Cambiar un código o agrupar partidas no significa que una función desaparezca.</p><div class="gov-organization">${governmentReorganization(detail)}${detail.changes.length?'':'<p>No se documenta aquí una reorganización adicional. Las correspondencias pendientes figuran en los programas.</p>'}${detail.changes.map(c=>`<details><summary><span class="gov-change-kind">${({recoded:'Recodificación',reorganized:'Reorganización',pending:'Por verificar'})[c.status]||'Continuidad'}</span><b>${E(c.title)}</b></summary><p>${E(c.explanation)}</p><p class="gov-note">${c.pages2026.length?'2026: pp. '+c.pages2026.join(', ')+' · ':''}2027: pp. ${c.pages2027.join(', ')} ${c.sources2026?' · 2026: '+E([...new Set(c.sources2026)].join('; ')):' del PDF jurisdiccional'}.</p><button class="text-link" data-gov-program="${c.target}">Ver presupuesto y antecedentes ↗</button></details>`).join('')}</div></section>`;
}
function governmentReadings(area,detail){
 const readings=detail.readings||[];if(!readings.length)return '';
 return `<section class="gov-readings"><h2>Lo más destacado del presupuesto de esta área</h2><ol>${readings.map(r=>`<li>${E(r.text)}</li>`).join('')}</ol><details class="gov-source-details"><summary>De dónde salen estas lecturas</summary><ul>${readings.map(r=>`<li>${E(r.kind==='calculation'?'Cálculo':'Dato del documento')}: ${E(r.references.join(' · '))}</li>`).join('')}</ul></details></section>`;
}
function governmentComplements(area,detail){
 const works=(state.projectInvestments?.projects||state.investments2027?.projects||[]).filter(p=>String(p.codes[1])===area.code);
 return `<section class="gov-section"><h2>Cargos, metas y obras</h2>${detail.positions?`<div class="gov-positions"><strong>${fmt(detail.positions.value)} cargos presupuestados</strong><p>${E(detail.positions.scope)} ${E(detail.positions.exclusions)}</p><small>Proyecto 2027 · cuadro de cargos, ${detail.positions.pdfPages.length===1?'página':'páginas'} ${detail.positions.pdfPages.join(', ')}. ${area.officials.value===null?'No equivale al padrón de funcionarios.':'Es una medida distinta de los '+fmt(area.officials.value)+' funcionarios del padrón 2026.'}</small></div>`:''}<p>Las metas físicas están en el detalle de cada programa. Sus unidades pueden ser metros, viajes o porcentajes; no deben sumarse entre sí.</p>${works.length?`<details class="gov-source-details"><summary>Inversiones previstas para 2027–2029 · ${works.length} proyectos</summary><ul class="gov-works">${works.sort((a,b)=>b.amounts[0]-a.amounts[0]).map(w=>`<li><button class="text-link" data-investment="${w.id}">${E(w.displayName||w.name)} ↗</button><strong>${short(w.amounts[0])} en 2027</strong></li>`).join('')}</ul></details>`:`<button class="text-link" data-project-tab="summary">Ver las obras previstas en el resumen 2027 ↗</button>`}</section>`;
}
function governmentSources(area,detail){
 return `<details class="gov-source-details gov-sources"><summary>Fuentes, alcance y datos para descargar</summary><p>Agregados 2027: Planilla 4, página 173 del proyecto de presupuesto. Votado, ampliado (vigente a junio) y gasto ejecutado 2026: archivo oficial del segundo trimestre.</p>${detail?`<p>Detalle 2027: ${E(detail.sources['2027'].file)}, planillas por unidad en pp. ${[...new Set(detail.units.map(r=>r.pdfPage))].join(', ')} y financiamiento en p. ${detail.financing[0].pdfPage}. Antecedentes: ${E(detail.sources['2026'].file)}. Se guardan las páginas de descripción y presupuesto de cada programa.</p><p>${detail.originalEqualsApproved?'El total del proyecto original 2026 coincide con el sancionado del archivo de ejecución. Se mantienen identificados como fuentes distintas.':'El proyecto original 2026 no sustituye el sancionado ni el vigente del archivo de ejecución.'}</p><p>Las correspondencias se sustentan en descripciones concordantes y homologaciones documentadas; no garantizan que cada actividad tenga idéntico alcance. ${detail.validation.pending2027Programs} programas de 2027 permanecen sin antecedente funcional confirmado; no se clasifican automáticamente como creaciones.</p><p><a href="${Site.url(area.detailFile)}" download>Descargar ficha, cálculos y trazabilidad</a></p>`:''}<p>Funcionarios: ${E(area.officials?.scope||'Sin dato asignable')}. Padrón 2026, revisado el 22/09/2026; corte único no publicado. Se cuentan personas una sola vez por dependencia y sus descendientes, sin sumar nuevamente cada nivel.</p><p><a href="${E(area.officials.sourceUrl)}" target="_blank" rel="noopener">Padrón oficial ↗</a> · <a href="${E(state.areaReports.sources['2026-2'].sourceUrl)}" target="_blank" rel="noopener">Ejecución oficial 2026 ↗</a> · <a href="${Site.url('data/budget/2027/area-reports.json')}" download>Descargar las 22 áreas</a></p>${detailLink('presupuesto-2027','Metodología de estas comparaciones')}</details>`;
}
function governmentAreaPage(){
 const area=state.areaReports.areas.find(a=>a.code===state.governmentArea),detail=state.governmentAreaDetail;
 if(!area)return `<h1>Área no encontrada</h1><p>Ese código no integra las 22 jurisdicciones del proyecto.</p><button class="text-link" data-gov-directory>Volver a Áreas de Gobierno</button>`;
 const rate=governmentChange(area);
 return `<div class="gov-fiche-nav"><button class="text-link" data-gov-directory>← Todas las áreas</button><button class="text-link" data-gov-share>Copiar enlace de esta ficha ↗</button></div><p class="eyebrow">JURISDICCIÓN ${area.code} · ${E(area.institutionType)} · PROYECTO 2027</p><h1>${E(governmentTitle(area.name))}</h1><p class="gov-note">Fuente: proyecto oficial de presupuesto · Planilla 4${detail?' y documento jurisdiccional':''} · pendiente de aprobación.</p>${governmentComparisonControls()}<div class="gov-kpis" data-gov-area="${area.code}" data-gov-base="${state.governmentBase}"><article><span>Presupuesto solicitado 2027</span><strong>${short(area.project2027/governmentFactor())}</strong><small>${state.governmentPrices==='nominal'?'Importe nominal':'Ajustado con el supuesto del 18%'} · original: ${money(area.project2027)}</small></article><article><span>Frente al ${state.governmentBase==='initial'?'votado':'ampliado a junio'} 2026</span><strong class="${rate<0?'negative':'positive'}">${rate===null?'Sin base':signedPct(rate)}</strong><small>${state.governmentPrices==='nominal'?'Cambio nominal':'Variación real estimada'}</small></article><article><span>Del presupuesto de la Ciudad</span><strong>${pct(area.project2027/state.project.summary.fiscalExpense.value*100)}</strong><small>Participación en el proyecto 2027</small></article><article><span>Funcionarios relevados</span><strong>${area.officials.value===null?'Sin dato verificable':fmt(area.officials.value)}</strong><small>Padrón 2026 · corte exacto no publicado</small></article></div><nav class="gov-section-nav" aria-label="Secciones de esta ficha"><a href="#gov-composition" data-gov-scroll="gov-composition">Composición</a><a href="#gov-stages" data-gov-scroll="gov-stages">Comparación</a>${detail?'<a href="#gov-ranking" data-gov-scroll="gov-ranking">Unidades y programas</a><a href="#gov-organization" data-gov-scroll="gov-organization">Reorganizaciones</a>':''}</nav>${!detail?'<p class="gov-coverage">Ficha agregada verificada. La apertura por unidades y los cambios organizativos se incorporarán después de importar y revisar sus documentos.</p>':''}${detail?governmentReadings(area,detail):''}${governmentStages(area)}${detail?governmentEconomic(area,detail):''}${governmentComposition(area,detail)}${detail?governmentUnit(detail)+governmentProgram(detail)+governmentRanking(detail)+governmentContributions(detail)+governmentChanges(detail)+governmentComplements(area,detail):''}${`<details class="gov-source-details"><summary>Su gasto ejecutado de años anteriores</summary>${areaHistoryChart(area)}</details>`}${governmentSources(area,detail)}`;
}
document.addEventListener('input',e=>{if(e.target.id==='gov-directory-search'){state.governmentQuery=e.target.value;document.querySelector('#gov-directory-results').innerHTML=governmentAreaCards();}});
document.addEventListener('change',e=>{
 if(e.target.id==='area-history-year'&&state.view==='project'&&state.projectTab==='areas'){const area=state.areaReports.areas.find(a=>a.code===state.governmentArea);if(area)document.querySelector('#area-history-value').innerHTML=areaHistoryValue(area,e.target.value);return;}
 const directory={'gov-directory-sort':'governmentDirectorySort','gov-directory-type':'governmentType'};
 if(directory[e.target.id]){state[directory[e.target.id]]=e.target.value;document.querySelector('#gov-directory-results').innerHTML=governmentAreaCards();return;}
 const keys={'gov-base':'governmentBase','gov-prices':'governmentPrices','gov-rank-group':'governmentRanking','gov-ranking-sort':'governmentSort'};
 if(keys[e.target.id]){state[keys[e.target.id]]=e.target.value;state.navigationRequested=false;render();}
});
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-gov-directory],[data-gov-unit],[data-gov-program],[data-gov-clear-unit],[data-gov-clear-program],[data-gov-share],[data-gov-scroll]');if(!b)return;e.preventDefault();
 if(b.dataset.govScroll){document.getElementById(b.dataset.govScroll)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
 if(b.hasAttribute('data-gov-share')){try{await navigator.clipboard.writeText(state.config.publicUrl+location.hash);b.textContent='Enlace copiado ✓';}catch{b.textContent='Copiá la dirección de esta ficha';}return;}
 if(b.hasAttribute('data-gov-directory')){governmentOpen(null);return;}
 if(b.dataset.govUnit){state.governmentUnit=b.dataset.govUnit;state.governmentProgram=null;state.governmentRanking='programs';}
 if(b.dataset.govProgram)state.governmentProgram=b.dataset.govProgram;
 if(b.hasAttribute('data-gov-clear-unit')){state.governmentUnit=null;state.governmentProgram=null;state.governmentRanking='units';}
 if(b.hasAttribute('data-gov-clear-program'))state.governmentProgram=null;
 state.navigationRequested=false;await render();
 const target=state.governmentProgram?'gov-program':state.governmentUnit?'gov-unit':'gov-ranking';
 document.getElementById(target)?.scrollIntoView({block:'start'});document.getElementById(target)?.focus({preventScroll:true});
});
const governmentMethodBase=projectMethod;
projectMethod=function(){
 const html=governmentMethodBase();
 return html.replace(/No hay apertura presupuestaria completa por unidad ejecutora en el PDF 2027 aportado: sus importes 2027 permanecen vacíos y el informe del ministerio se ofrece como una vista distinta\./,'El documento general no abre todas las unidades. Los documentos jurisdiccionales se incorporan progresivamente: las 22 jurisdicciones disponen de fichas financieras por unidad y programa conciliadas con el proyecto. Las continuidades sin evidencia suficiente quedan pendientes.')+`<h3>Áreas de Gobierno</h3><p>Las 22 jurisdicciones concilian con el gasto del proyecto. El sancionado, el vigente al 30/06 y el devengado 2026 se toman del mismo archivo de ejecución. Los PDF del proyecto original se usan para contrastar funciones y partidas, sin sustituir el vigente. La comparación real usa 1,18 y no modifica la serie histórica.</p><p>Las correspondencias agrupan programas cuando las descripciones sustentan continuidad. Los cambios sin evidencia suficiente quedan pendientes; no se infieren eliminaciones. Las fuentes de financiamiento son otro desglose del mismo presupuesto. El cuadro de cargos excluye varios escalafones: no equivale al total de empleados ni al padrón de funcionarios.</p>`;
};
