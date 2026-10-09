'use strict';
// A unit's missing 2027 budget must never be replaced with its ministry's budget.
const areaDataLoader=ensureViewData;
ensureViewData=async function(view,period){
 const needs=view==='project'||view==='method'&&state.methodSection==='presupuesto-2027';
 await Promise.all([areaDataLoader(view,period),needs?dataFile('area-reports-2027').then(d=>state.areaReports=d):Promise.resolve()]);
};
function areaReportName(name){return name.replace(/^Htal\.\s*/i,'Hospital ');}
function areaSearchNorm(text){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function areaReportFind(id){return [...(state.areaReports?.areas||[]),...(state.areaReports?.units||[])].find(r=>r.id===id);}
function areaSearchResults(query){
 const words=areaSearchNorm(query).split(' ').filter(Boolean),all=[...state.areaReports.areas,...state.areaReports.units];
 return all.filter(r=>words.every(w=>areaSearchNorm(areaReportName(r.name)+' '+(r.parentName||'')).includes(w))).sort((a,b)=>{
  const exact=r=>areaSearchNorm(areaReportName(r.name)).includes(areaSearchNorm(query));
  return Number(exact(b))-Number(exact(a))||Number(a.kind==='unit')-Number(b.kind==='unit')||a.name.localeCompare(b.name,'es');
 });
}
function areaResultMarkup(query){
 if(areaSearchNorm(query).length<2)return '<p class="area-search-hint">Podés buscar un ministerio, un hospital o el nombre de otra unidad ejecutora.</p>';
 const results=areaSearchResults(query),shown=results.slice(0,12);
 return `<p class="area-search-count" role="status">${results.length?`${results.length} coincidencias${results.length>12?' · se muestran las primeras 12; precisá el nombre para encontrar más':''}`:'No encontramos ese nombre. Probá con otra palabra.'}</p><div class="area-search-list">${shown.map(r=>`<button data-area-report="${E(r.id)}"><span><b>${E(areaReportName(r.name))}</b><small>${r.kind==='area'?'Área · presupuesto 2027 disponible':`Unidad ejecutora · ${E(r.parentName)} · ${r.detail2027?'detalle 2027 disponible':'base 2026'}`}</small></span><span aria-hidden="true">↗</span></button>`).join('')}</div>`;
}
function areaSearchMarkup(){
 return `<section class="area-search" aria-labelledby="area-search-title"><div><p class="eyebrow">INFORME POR ÁREA</p><h2 id="area-search-title">¿Qué cambia en el área que te interesa?</h2><p>Buscá su presupuesto, en qué se usaría y su gasto de años anteriores.</p></div><label for="area-report-search">Nombre del área o unidad ejecutora</label><div class="area-input-row"><input id="area-report-search" type="search" placeholder="Por ejemplo: Salud, Educación o Ramos Mejía" autocomplete="off" aria-controls="area-report-results"><button id="area-search-clear" aria-label="Borrar búsqueda" hidden>×</button></div><div class="area-search-examples" aria-label="Ejemplos"><button data-area-report="area-40">Salud ↗</button><button data-area-report="area-55">Educación ↗</button><button data-area-report="area-29">Seguridad ↗</button></div><div id="area-report-results">${areaResultMarkup('')}</div></section>`;
}
function areaDirection(rate){
 if(rate===null)return 'Sin una base comparable en 2026';
 if(Math.abs(rate)<.05)return 'Prácticamente al ritmo de la inflación';
 return `${fmt(Math.abs(rate),1)}% ${rate>0?'por encima':'por debajo'} de la inflación proyectada`;
}
function areaComposition(report){
 const key=report.kind==='area'?'project2027':'current2026',rows=report.objects.filter(r=>r[key]>0),total=report[key];
 if(total<=0)return '<p>La base registra presupuesto cero para esta unidad. No se dibuja una composición porcentual.</p>';
 const colors=['#67339b','#a28cbe','#347f70','#e3b451','#c97986','#7097b6','#b5aa94','#918796'];
 const share=r=>r[key]/total*100<.05?'menos de 0,1%':pct(r[key]/total*100);
 return `<section class="area-composition"><h3>${report.kind==='area'?'¿En qué se usaría en 2027?':'¿Cómo se distribuye su presupuesto 2026?'}</h3><div class="area-composition-strip" role="img" aria-label="Composición del presupuesto: ${E(rows.map(r=>r.name+' '+share(r)).join('; '))}">${rows.map(r=>`<i style="flex:${r[key]/total};background:${colors[Number(r.code)-1]}"></i>`).join('')}</div><ul>${rows.map(r=>`<li><i style="background:${colors[Number(r.code)-1]}"></i><span>${E(r.name)}</span><strong>${share(r)}</strong></li>`).join('')}</ul></section>`;
}
function areaHistoryChart(report){
 const rows=report.history,available=rows.filter(r=>r.real!==null);if(!available.length)return '<p>No hay una serie histórica que coincida con el nombre y los códigos actuales.</p>';
 const width=620,height=200,left=18,right=18,top=30,bottom=35,max=Math.max(...available.map(r=>r.real),1),x=i=>left+i/(rows.length-1)*(width-left-right),y=value=>top+(1-value/max)*(height-top-bottom);
 const segments=[];let segment=[];for(const [i,r] of rows.entries()){if(r.real===null){if(segment.length)segments.push(segment);segment=[];}else segment.push([x(i),y(r.real)]);}if(segment.length)segments.push(segment);
 return `<section class="area-history"><h3>Su gasto de años anteriores</h3><p>Gasto ejecutado anual · valores actualizados por inflación a abril–junio de 2026.</p><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gasto anual actualizado por inflación, ${available[0].year} a ${available.at(-1).year}. Los años sin dato quedan separados. Escala de cero a ${money(max)}."><text x="${left}" y="16">${money(max)}</text><text x="${left}" y="${height-bottom-8}">$0</text><path d="M${left} ${height-bottom}H${width-right}" class="area-history-axis"/>${segments.map(s=>`<polyline points="${s.map(p=>p.join(',')).join(' ')}"/>`).join('')}${rows.map((r,i)=>r.real===null?'':`<circle cx="${x(i)}" cy="${y(r.real)}" r="4"><title>${r.year}: ${money(r.real)}</title></circle>`).join('')}${rows.map((r,i)=>i%3===0||i===rows.length-1?`<text x="${x(i)}" y="${height-10}" text-anchor="${i===0?'start':i===rows.length-1?'end':'middle'}">${r.year}</text>`:'').join('')}</svg><label class="area-history-picker" for="area-history-year">Consultar un año<select id="area-history-year">${rows.map(r=>`<option value="${r.year}" ${r.year===available.at(-1).year?'selected':''}>${r.year}${r.real===null?' · sin dato comparable':''}</option>`).join('')}</select></label><div id="area-history-value" aria-live="polite">${areaHistoryValue(report,available.at(-1).year)}</div><p class="area-history-note">La línea deja huecos si cambian el nombre o los códigos del área. Una reorganización puede cambiar qué gastos abarca.</p></section>`;
}
function areaHistoryValue(report,year){const row=report.history.find(r=>r.year===Number(year));return !row||row.real===null?'<p>Sin dato con el mismo nombre y código. No se estimó un importe.</p>':`<strong>${money(row.real)}</strong><span>${year} · gasto ejecutado actualizado por inflación</span>`;}
function areaObjectChanges(report){
 if(report.kind!=='area')return '';
 return `<details class="area-more"><summary>Ver qué partidas cambian</summary><p>Comparación con el presupuesto al 30/06/2026, usando la inflación proyectada del 18,0%.</p><div class="area-object-changes">${report.objects.filter(r=>r.current2026||r.project2027).map(r=>`<div><span>${E(r.name)}</span><strong>${r.realVariationPct===null?'Sin base en 2026':signedPct(r.realVariationPct)}</strong></div>`).join('')}</div><p>El gasto en personal no informa la cantidad de empleados. Servicios no personales reúne distintas contrataciones y servicios; no informa cuántos contratos hay.</p></details>`;
}
function areaReportMarkup(report){
 const area=report.kind==='area',parent=!area?areaReportFind(report.parent):null;
 const lead=area?`<div class="area-change ${report.realVariationPct<-.05?'below':'above'}"><span>Proyecto 2027 frente al presupuesto 2026</span><strong>${areaDirection(report.realVariationPct)}</strong><p>Se usa una inflación proyectada del 18,0%. Es una estimación y el presupuesto 2026 todavía puede cambiar.</p></div><div class="area-amounts"><div><span>Presupuesto 2026 · al 30/06</span><strong>${money(report.current2026)}</strong></div><div><span>Proyecto 2027 · propuesta</span><strong>${money(report.project2027)}</strong></div></div>`:`<div class="area-missing"><strong>2027: falta el detalle de esta unidad</strong><p>El documento disponible muestra presupuestos por área, pero no el de esta unidad. Estas cifras corresponden a su presupuesto 2026 y a su gasto de años anteriores.</p>${parent?`<button class="text-link" data-area-report="${E(parent.id)}">Ver el proyecto 2027 de ${E(parent.name)} ↗</button>`:''}</div><div class="area-amounts single"><div><span>Presupuesto de esta unidad · 30/06/2026</span><strong>${money(report.current2026)}</strong></div></div>`;
 return `<p class="eyebrow">${area?'ÁREA · PROYECTO 2027':'UNIDAD EJECUTORA · BASE 2026'}</p><h2 id="area-report-title">${E(areaReportName(report.name))}</h2>${!area?`<p class="area-parent">${E(report.parentName)}</p>`:''}${lead}${areaComposition(report)}${areaObjectChanges(report)}${areaHistoryChart(report)}<details class="area-more"><summary>Fuentes y alcance de este informe</summary><p>${area?'Proyecto 2027: '+E(state.areaReports.source.document)+' · Planilla 4, página 173 del PDF. ':''}2026: presupuesto actualizado al 30/06, gastos corrientes y de capital. Los importes de cada presupuesto se conservan en pesos nominales.</p><p>Historia: ejecución anual del mismo nombre y códigos entre 2013 y 2025. Se conservan los factores IPCBA del detalle histórico del sitio; el 18,0% proyectado se usa solamente para comparar presupuestos 2027 y 2026. No se une la ejecución con una autorización futura. El cierre 2025 es provisorio.</p><p><a href="${E(state.areaReports.sources['2026-2'].sourceUrl)}" target="_blank" rel="noopener">Fuente oficial 2026 ↗</a> · <a href="${Site.url('data/budget/2027/area-reports.json')}" download>Descargar informes y trazabilidad</a> · ${detailLink('presupuesto-2027','Ver metodología')}</p></details><button class="text-link area-share" data-area-share>Copiar enlace del informe ↗</button>`;
}
function areaDialogMarkup(){return '<dialog class="project-dialog area-report-dialog" id="area-report-dialog" aria-labelledby="area-report-title"><button class="dialog-close" data-area-close aria-label="Cerrar informe">×</button><div id="area-report-body"></div></dialog>';}
const areaSummaryBase=projectSummary,areaExpensesBase=projectExpenses;
projectSummary=function(){return areaSummaryBase().replace('</p>','</p>'+areaSearchMarkup())+areaDialogMarkup();};
projectExpenses=function(){return areaSearchMarkup()+areaExpensesBase()+areaDialogMarkup();};
const areaTableBase=projectTable;
projectTable=function(rows,total,showShare=true){
 if(!state.areaReports||!rows.every(r=>r.dimension==='jurisdictions'))return areaTableBase(rows,total,showShare);
 return `<div class="table-wrap"><table class="project-values"><caption>Proyecto 2027 · pesos nominales · ${rows.length} áreas</caption><thead><tr><th>Área</th><th>Importe solicitado</th><th>Participación</th><th>Informe</th></tr></thead><tbody>${rows.map(r=>{const area=state.areaReports.areas.find(a=>areaSearchNorm(a.name)===areaSearchNorm(r.name));return `<tr><th scope="row">${E(r.name)}</th><td class="num">${money(r.value)}</td><td class="num">${pct(r.value/total*100)}</td><td>${area?`<button class="text-link" data-area-report="${E(area.id)}">Ver informe ↗</button>`:detailLink()}</td></tr>`;}).join('')}</tbody></table></div>`;
};
const areaMethodBase=projectMethod;
projectMethod=function(){return areaMethodBase()+`<h3>Informes por área y unidad ejecutora</h3><p>La Planilla 4 del PDF (página 173) permite comparar 22 jurisdicciones y ocho objetos con 2026. Se concilian por código oficial, nombre y total. El cambio ajustado usa el factor 1,18 ya documentado. El buscador también incluye las 394 unidades de la ejecución del segundo trimestre de 2026. No hay apertura presupuestaria completa por unidad ejecutora en el PDF 2027 aportado: sus importes 2027 permanecen vacíos y el informe del ministerio se ofrece como una vista distinta.</p><p>Historial 2013–2025: se suma exclusivamente el gasto fiscal devengado del mismo nombre normalizado, jurisdicción y código completo. Se conservan los factores IPCBA de los datasets de detalle. No se imputan valores, no se unen huecos y no se interpreta una reorganización como aumento o caída del gasto del mismo servicio. No se infieren cantidad de empleados ni número de contratos a partir de importes.</p><p><a href="${Site.url('data/budget/2027/area-reports.json')}" download>Informes: cifras, factores y fuentes por período</a></p>`;};
function showAreaReport(id,origin){
 const report=areaReportFind(id),dialog=document.querySelector('#area-report-dialog');if(!report||!dialog)return;
 document.querySelector('#area-report-body').innerHTML=areaReportMarkup(report);dialog._origin=origin||dialog._origin;state.areaReportId=id;if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.querySelector('[data-area-close]').focus({preventScroll:true});syncRoute();
}
const areaReadRoute=readRoute,areaSyncRoute=syncRoute;
readRoute=function(){areaReadRoute();const q=new URLSearchParams(location.hash.split('?')[1]||'');state.areaReportId=state.view==='project'&&/^(area-\d+|ue-\d+(?:-\d+){4})$/.test(q.get('informe')||'')?q.get('informe'):null;};
syncRoute=function(){areaSyncRoute();if(state.view!=='project'||!state.areaReportId)return;const q=new URLSearchParams(location.hash.split('?')[1]||'');q.set('informe',state.areaReportId);history.replaceState(null,'','#proyecto-2027?'+q);};
const areaEnhanceBase=enhanceVisuals;
enhanceVisuals=function(view){areaEnhanceBase(view);if(view==='project'&&state.areaReportId){if(areaReportFind(state.areaReportId)&&['summary','expenses'].includes(state.projectTab||'summary'))showAreaReport(state.areaReportId);else state.areaReportId=null;}};
document.addEventListener('input',e=>{if(e.target.id!=='area-report-search')return;document.querySelector('#area-report-results').innerHTML=areaResultMarkup(e.target.value);document.querySelector('#area-search-clear').hidden=!e.target.value;});
document.addEventListener('change',e=>{if(e.target.id==='area-history-year'){const report=areaReportFind(state.areaReportId);if(report)document.querySelector('#area-history-value').innerHTML=areaHistoryValue(report,e.target.value);}});
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-area-report],[data-area-close],[data-area-share],#area-search-clear');if(!b)return;e.preventDefault();
 if(b.dataset.areaReport){showAreaReport(b.dataset.areaReport,b.closest('#area-report-dialog')?null:b);return;}
 if(b.hasAttribute('data-area-close')){document.querySelector('#area-report-dialog').close();return;}
 if(b.id==='area-search-clear'){const input=document.querySelector('#area-report-search');input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();return;}
 try{await navigator.clipboard.writeText(state.config.publicUrl+location.hash);b.textContent='Enlace copiado ✓';}catch{b.textContent='Podés copiar la dirección de esta vista';}
});
document.addEventListener('keydown',e=>{if(e.target.id==='area-report-search'&&e.key==='Enter'){const first=document.querySelector('#area-report-results [data-area-report]');if(first){e.preventDefault();showAreaReport(first.dataset.areaReport,first);}}});
document.addEventListener('close',e=>{if(e.target.id!=='area-report-dialog')return;state.areaReportId=null;syncRoute();(e.target._origin?.isConnected?e.target._origin:document.querySelector('#area-report-search'))?.focus({preventScroll:true});},true);
