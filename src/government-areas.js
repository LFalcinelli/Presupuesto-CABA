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
 state.governmentPrices='real';state.governmentBase=q.get('base')==='initial'?'initial':'current';
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
 if(report?.kind==='program'){governmentOpen(report.areaCode,null,report.programId);return;}
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
function governmentAreaCards(...args){return Site.featureFunctions.governmentAreaCards.apply(this,args);}
function governmentAreaDirectory(...args){return Site.featureFunctions.governmentAreaDirectory.apply(this,args);}
function governmentBasis(){return state.governmentBase==='initial'?'initial2026':'current2026';}
function governmentFactor(){return state.areaReports.deflator.factor;}
function governmentChange(row){const base=row[governmentBasis()];return base>0?(row.project2027/governmentFactor()/base-1)*100:null;}
function governmentComparisonControls(...args){return Site.featureFunctions.governmentComparisonControls.apply(this,args);}
function governmentBars(...args){return Site.featureFunctions.governmentBars.apply(this,args);}
function governmentDataTable(...args){return Site.featureFunctions.governmentDataTable.apply(this,args);}
function governmentStages(...args){return Site.featureFunctions.governmentStages.apply(this,args);}
function governmentStatus(row){return ({continues:'Funciones contrastadas',recoded:'Código homologado',reorganized:'Funciones agrupadas',pending:'Antecedente pendiente'})[row.comparisonStatus]||'Perímetro distinto';}
function governmentRankingRows(...args){return Site.featureFunctions.governmentRankingRows.apply(this,args);}
function governmentRankTable(...args){return Site.featureFunctions.governmentRankTable.apply(this,args);}
function governmentRanking(...args){return Site.featureFunctions.governmentRanking.apply(this,args);}
function governmentUnit(...args){return Site.featureFunctions.governmentUnit.apply(this,args);}
function governmentProgram(...args){return Site.featureFunctions.governmentProgram.apply(this,args);}
function governmentContributions(...args){return Site.featureFunctions.governmentContributions.apply(this,args);}
function governmentChanges(...args){return Site.featureFunctions.governmentChanges.apply(this,args);}
function governmentComplements(...args){return Site.featureFunctions.governmentComplements.apply(this,args);}
function governmentSources(...args){return Site.featureFunctions.governmentSources.apply(this,args);}
function governmentAreaPage(...args){return Site.featureFunctions.governmentAreaPage.apply(this,args);}
document.addEventListener('input',e=>{if(e.target.id==='gov-directory-search'){state.governmentQuery=e.target.value;document.querySelector('#gov-directory-results').innerHTML=governmentAreaCards();}});
document.addEventListener('change',e=>{
 if(e.target.id==='area-history-year'&&state.view==='project'&&state.projectTab==='areas'){const area=state.areaReports.areas.find(a=>a.code===state.governmentArea);if(area)document.querySelector('#area-history-value').innerHTML=areaHistoryValue(area,e.target.value);return;}
 const directory={'gov-directory-sort':'governmentDirectorySort','gov-directory-type':'governmentType'};
 if(directory[e.target.id]){state[directory[e.target.id]]=e.target.value;document.querySelector('#gov-directory-results').innerHTML=governmentAreaCards();syncRoute();return;}
 const keys={'gov-base':'governmentBase','gov-rank-group':'governmentRanking','gov-ranking-sort':'governmentSort'};
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
