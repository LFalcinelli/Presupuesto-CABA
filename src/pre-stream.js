'use strict';
// Small, source-backed additions for the public demonstration.
function themeIcon(theme){
 const paths={light:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12l2 2M4 20l2-2M18 6l2-2"/>',dark:'<path d="M20 15a9 9 0 0 1-11-11A9 9 0 1 0 20 15Z"/>',auto:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"/>'};
 return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">${paths[theme]||paths.auto}</svg>`;
}
const preStreamLoad=ensureViewData;
ensureViewData=async function(view,period){
 const existingViews=['landing','search','project','method'].includes(view);
 await Promise.all([preStreamLoad(view,period),...(existingViews||view==='summary'&&period==='2026-2'?[
 dataFile('tax-reference-2027').then(d=>state.taxReferences=d)]:[]),...(existingViews?[
 dataFile('program-index-2027').then(d=>state.programIndex=d)]:[])]);
};
function amplificationRate(a){return a.initial2026>0?(a.current2026/a.initial2026-1)*100:-Infinity;}
function amplificationLabel(a){const rate=amplificationRate(a),delta=a.current2026-a.initial2026;return Number.isFinite(rate)?`${rate>=0?'Ampliada':'Reducida'} ${pct(Math.abs(rate))} durante 2026 · ${delta<0?'−':'+'}${short(Math.abs(delta))}`:'Sin presupuesto votado comparable';}
function amplificationOverview(){const d=state.taxReferences?.budget2026;if(!d)return '';return `<aside class="amplification-overview"><span>Presupuesto de toda la Ciudad · 2026</span><strong>${short(d.initial)} <span aria-hidden="true">→</span> ${short(d.current)}</strong><p>Votado → ampliado a junio · <b>${signedPct(d.changePct)}</b> (${short(d.change)} más). Modificación nominal dentro del año.</p></aside>`;}
function directoryProgramResults(query){
 const matches=areaSearchResults(query).filter(r=>r.kind!=='area'&&(!state.governmentType||state.areaReports.areas.find(a=>a.code===(r.areaCode||r.codes?.[1]))?.institutionType===state.governmentType));
 return `<section class="directory-program-results"><h2>Unidades y programas</h2><p role="status">${matches.length} coincidencias${matches.length>20?' · se muestran las primeras 20':''}</p><div class="area-search-list">${matches.slice(0,20).map(r=>`<button data-area-report="${E(r.id)}"><span><b>${E(governmentTitle(r.name))}</b><small>${r.kind==='program'?'Programa':'Unidad ejecutora'} · ${E(r.parentName)}</small></span><span aria-hidden="true">↗</span></button>`).join('')}</div></section>`;
}
function feedbackLink(area){
 const destination=state.config.feedback?.destination,label='¿Encontraste un error o falta un dato? Avisanos';
 if(!destination)return `<a class="feedback-link" data-feedback hidden>${label}</a>`;
 const subject='Gasto Público CABA · '+(area||document.querySelector('main h1')?.textContent||state.view),page=state.config.publicUrl+location.hash;
 const href=destination.includes('@')&&!destination.startsWith('https:')?'mailto:'+destination+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent('Página: '+page+'\n\n'):destination;
 return `<a class="feedback-link" data-feedback href="${E(href)}">${label}</a>`;
}
function propertyReference(){
 const d=state.taxReferences;if(!d)return '';
 return `<section class="property-reference"><h2>¿Cuánto corresponde a ABL y cuánto a Inmobiliario?</h2><p>En 2027, «Inmuebles (ABL e Inmobiliario)» reúne ${short(d.taxes.find(r=>r.id==='tax_inmuebles').value)}. La Planilla 11, página 183, no separa sus componentes.</p><h3>Referencia: lo recaudado en 2025</h3><p>Pesos de 2025 · cierre provisorio. No es la apertura del proyecto 2027.</p><div class="property-reference-items">${d.property2025.items.map(r=>`<article><span>${E(r.code.endsWith('.2')?'Alumbrado, Barrido y Limpieza (ABL)':r.name)}</span><strong>${short(r.value)}</strong></article>`).join('')}</div><p>Total Inmuebles 2025: <strong>${short(d.property2025.total)}</strong>.</p><p><a href="${Site.url(d.property2025.localSource)}" target="_blank" rel="noopener">Informe oficial 2025 · página 5 ↗</a> · <a href="${Site.url('data/revenue/tax-reference-2027.csv')}" data-citizen-download download>Descargar cifras y fuentes</a></p></section>`;
}
const preStreamRevenue=projectRevenue;
projectRevenue=function(){return preStreamRevenue()+propertyReference();};
const preStreamMethod=projectMethod;
projectMethod=function(){return preStreamMethod()+`<h3>Impuestos propios por habitante</h3><p>Los tributos propios previstos para 2027 (${short(state.taxReferences?.ownTaxes||0)}) se dividen por los ${fmt(state.project.population.value)} habitantes usados por el sitio. Se excluyen los impuestos nacionales y otros ingresos. Es un promedio de recaudación prevista, no una factura individual. Ingresos Brutos alcanza a personas humanas y jurídicas; su incidencia puede trasladarse a precios.</p><p>Planilla 11, página 183, del proyecto 2027. Apertura de Inmuebles recaudada: informe del cuarto trimestre 2025, página 5. <a href="${Site.url('data/revenue/tax-reference-2027.csv')}" data-citizen-download download>Cifras, cálculo y fuentes (CSV)</a> · <a href="https://www.agip.gob.ar/impuestos/ingresos-brutos" target="_blank" rel="noopener">Ingresos Brutos · AGIP ↗</a></p><h3>Buscar programas</h3><p>El índice reúne las aperturas de los 22 documentos jurisdiccionales 2027. Cada resultado conserva archivo y página y abre la ficha del área con el programa seleccionado.</p><p><a href="${Site.url('data/budget/2027/program-index.csv')}" data-citizen-download download>Programas y fuentes (CSV)</a></p>`;};

Site.markupPasses.push(function preStreamPass(t,view){

 if(view==='summary'&&state.period==='2026-2')t.content.querySelector('.fiscal-summary')?.insertAdjacentHTML('afterbegin',amplificationOverview());
 if(['landing','search'].includes(view)&&state.taxReferences){const d=state.taxReferences,per=t.content.querySelector('.hero-person');if(per){per.insertAdjacentHTML('afterend',`<article class="hero-own-taxes"><h2>Impuestos de la Ciudad por habitante</h2><strong>≈ $ ${fmt(d.ownTaxesPerCapita/1e6,1)} millones</strong><small>Por año · proyecto 2027</small><p>${E(d.note)}</p><a href="#metodologia?seccion=presupuesto-2027">Cálculo y fuentes ↗</a></article>`);}}
 const fiche=t.content.querySelector('.government-areas');if(fiche&&state.governmentArea)fiche.insertAdjacentHTML('beforeend',feedbackLink(state.governmentAreaDetail?.name));
 const program=t.content.querySelector('#gov-program');if(program){program.classList.add('search-selected-program');program.setAttribute('aria-label','Programa seleccionado: '+program.querySelector('h2').textContent);}

});
const preStreamEnhance=enhanceVisuals;
enhanceVisuals=function(view){preStreamEnhance(view);const footer=document.querySelector('footer .wrap');if(footer){footer.querySelector('[data-feedback]')?.remove();footer.insertAdjacentHTML('beforeend',feedbackLink());}};
const preStreamRead=readRoute,preStreamSync=syncRoute;
readRoute=function(){preStreamRead();const order=new URLSearchParams(location.hash.split('?')[1]||'').get('ordenAreas');if(['amount','alphabetic','increase','decrease','amplification'].includes(order))state.governmentDirectorySort=order;};
syncRoute=function(){preStreamSync();if(state.view==='project'&&state.projectTab==='areas'&&!state.governmentArea&&state.governmentDirectorySort){const q=new URLSearchParams(location.hash.split('?')[1]||'');q.set('ordenAreas',state.governmentDirectorySort);history.replaceState(null,'',location.hash.split('?')[0]+'?'+q);}};
const preStreamRender=render;let lastSearchSelection=null;
render=async function(){await preStreamRender();const key=state.governmentProgram&&state.governmentArea+':'+state.governmentProgram;if(key&&key!==lastSearchSelection){const p=document.getElementById('gov-program');if(p){openMobileAncestors(p);p.scrollIntoView({block:'start'});p.focus({preventScroll:true});}}lastSearchSelection=key;};
