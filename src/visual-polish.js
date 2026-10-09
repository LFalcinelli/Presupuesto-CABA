'use strict';
// Presentation changes; the principal history reads its own documented price adjustment.
const polishedDataLoader=ensureViewData;
ensureViewData=async function(view,period){
 await polishedDataLoader(view,period);
 if(view==='landing'&&state.config.featuredBudgetFile)state.fiscalMap=await dataFile('fiscal-map-2027');
};
const polishedLanding=projectLanding;
projectLanding=function(){
 const template=document.createElement('template');template.innerHTML=polishedLanding();
 const value=template.content.querySelector('.hero-request-value'),approx=value.nextElementSibling;
 const exact=value.textContent;value.textContent=`≈ $ ${fmt(state.project.summary.fiscalExpense.value/1e12,1)} billones de pesos`;
 approx.className='hero-exact-value';approx.textContent=exact;
 template.content.querySelector('.project-hero').insertAdjacentHTML('afterend',fiscalMapMarkup());
 return template.innerHTML;
};
const polishedMapMarkup=fiscalMapMarkup;
fiscalMapMarkup=function(){return polishedMapMarkup().replace('El mapa fiscal de Buenos Aires','De dónde viene y a dónde va el dinero');};
const polishedExplorerShell=explorerShell;
explorerShell=function(){
 polishedExplorerShell();
 const historyView=state.view==='history';
 document.querySelector('.explorer-location')?.remove();
 document.querySelector('.price-label').hidden=historyView||state.view==='project';
};
const polishedSyncRoute=syncRoute;
const polishedReadRoute=readRoute;
readRoute=function(){polishedReadRoute();if(state.view==='history'){const q=new URLSearchParams(location.hash.split('?')[1]||'');state.executionSeries=['currentPrimary','capital'].includes(q.get('serie'))?q.get('serie'):'total';}};
syncRoute=function(){
 polishedSyncRoute();if(state.view==='history'){const q=new URLSearchParams(location.hash.split('?')[1]||'');if(['currentPrimary','capital'].includes(state.executionSeries))q.set('serie',state.executionSeries);else q.delete('serie');history.replaceState(null,'','#evolucion'+(q.size?'?'+q:''));return;}if(state.view!=='landing')return;
 const q=new URLSearchParams();
 if(state.fiscalPerspective&&state.fiscalPerspective!=='purpose')q.set('mapa',state.fiscalPerspective);
 if(state.fiscalSelected)q.set('nodo',state.fiscalSelected);
 if(state.fiscalReading==='hundred')q.set('lectura','hundred');
 if(state.fiscalExpanded?.length)q.set('abiertas',state.fiscalExpanded.join(','));
 history.replaceState(null,'','#inicio'+(q.size?'?'+q:''));
};

function historyTwentyYears(){
 const rows=executionRows(),a=rows.find(r=>r.year===2005),b=rows.find(r=>r.year===2025);
 return {a,b,change:(b.real/a.real-1)*100};
}
document.addEventListener('change',e=>{if(e.target.id==='execution-series'){state.executionSeries=['currentPrimary','capital'].includes(e.target.value)?e.target.value:'total';render();}});
executionObservation=function(r){
 const label=r.kind==='legacy'?'Registro histórico · criterio distinto':r.kind==='budget'?'Presupuesto al 30/06/2026':r.kind==='project'?'Proyecto de presupuesto':'Gasto ejecutado'+(r.year===2025?' · cierre provisorio':'');
 return `<strong>${r.year} · ${E(label)}</strong><span>${money(r.real)}</span><small>${r.priceEstimated?'Valor estimado con supuesto de inflación · autorización, no ejecución. ':''}Importe original: ${money(r.nominal)}</small>`;
};
executionHistoryPanel=function(){
 const d=state.executionHistory,rows=executionRows(),{a,b,change}=historyTwentyYears(),current=state.executionSeries==='currentPrimary',capital=state.executionSeries==='capital',seriesLabel=d.series[capital?'capital':current?'currentPrimary':'total'].label;
 const W=1180,H=520,L=54,R=35,T=64,B=68,max=capital?Math.max(5,Math.ceil(Math.max(...rows.map(r=>r.real))/1e12)):20,step=capital?1:5;
 const x=year=>L+(year-1997)/30*(W-L-R),y=value=>H-B-value/1e12/max*(H-T-B);
 const actual=rows.filter(r=>r.kind==='executed'),chosen=rows.find(r=>r.year===Number(state.executionYear))||b;
 const point=r=>[x(r.year),y(r.real)];
 const bridges=[[rows[0],rows[1],'legacy-history-bridge'],[b,rows.find(r=>r.year===2026),'budget-history-bridge'],[rows.find(r=>r.year===2026),rows.find(r=>r.year===2027),'project-history-bridge']].filter(pair=>pair[0]&&pair[1]);
 const tip=r=>[String(r.year),money(r.real),r.kind==='legacy'?'Registro histórico · criterio distinto':r.kind==='budget'?'Presupuesto actualizado a junio':r.kind==='project'?'Proyecto 2027':r.year===2025?'Gasto ejecutado · cierre provisorio':'Gasto ejecutado',...(r.priceEstimated?['Estimado con supuesto de inflación · autorización, no ejecución']:[])];
 return `<section class="chart-panel execution-history history-redesign"><div class="history-series-control"><label for="execution-series">Qué gasto querés ver<select id="execution-series"><option value="total" ${!current&&!capital?'selected':''}>Gasto total</option><option value="currentPrimary" ${current?'selected':''}>Gasto corriente sin intereses</option><option value="capital" ${capital?'selected':''}>Gasto de capital</option></select></label><p>${capital?'Inversión y otros gastos de capital; sin amortización de deuda.':current?'El funcionamiento cotidiano: sin inversión ni intereses de deuda.':'Funcionamiento, inversión e intereses de deuda.'}</p></div><div class="history-impact"><div><p class="eyebrow">2005 → 2025 · VEINTE AÑOS</p><strong>${signedPct(change)}</strong><p>Más gasto ejecutado, descontando la inflación.</p></div><div class="history-impact-values"><span>2005<b>$ ${fmt(a.real/1e12,2)} billones</b></span><i aria-hidden="true">→</i><span>2025<b>$ ${fmt(b.real/1e12,2)} billones</b></span></div></div>
 <p class="history-chart-unit">${E(seriesLabel)} · billones de pesos actualizados por inflación a abril–junio de 2026.</p>
 <div class="comparison-legend history-legend"><span><i style="background:#67339b"></i>Gasto ejecutado</span><span><i style="background:#95839e"></i>Presupuesto 2026*</span><span><i style="background:#371953"></i>Proyecto 2027*</span></div>
 <div class="history-chart-scroll" tabindex="0" role="region" aria-label="Gráfico histórico; podés desplazarlo horizontalmente"><svg class="execution-chart polished-line-chart" viewBox="0 0 ${W} ${H}" role="group" aria-label="${E(seriesLabel)} 1997–2027. Creció ${fmt(change,1)} por ciento entre 2005 y 2025, descontando la inflación. 2026 y 2027 son autorizaciones con ajuste de precios estimado.">
 <defs><marker id="growth-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10" fill="#9665b1"/></marker></defs>
 ${Array.from({length:max/step+1},(_,i)=>i*step).map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v*1e12)}" y2="${y(v*1e12)}" stroke="#e7e1ec"/><text x="${L-12}" y="${y(v*1e12)+5}" text-anchor="end">${v}</text>`).join('')}
 <path class="history-growth-guide" data-start="${point(a).join(',')}" data-end="${point(b).join(',')}" d="M${point(a).join(',')} C${x(a.year)+110},${Math.min(H-B-24,y(a.real)+105)} ${x(b.year)-150},${Math.min(H-B-24,y(b.real)+175)} ${point(b).join(',')}" fill="none" stroke="#9665b1" stroke-width="2.5" marker-end="url(#growth-arrow)"/>
 <text class="history-growth-caption" x="${x(2014)}" y="${Math.min(H-B-15,Math.max(y(a.real),y(b.real))+85)}" text-anchor="middle">${signedPct(change)} · 2005 → 2025</text>
 ${d.events.map((ev,i)=>{const label=ev.label||`${ev.year} · ${ev.name}`,width=i?246:164,top=i?14:Math.max(T,y(rows.find(r=>r.year===ev.year).real)-58);return `<g class="history-event-label"><line x1="${x(ev.year)}" x2="${x(ev.year)}" y1="${top+31}" y2="${H-B}" stroke="#b6a8bf" stroke-dasharray="3 6"/><a href="${E(ev.source)}" target="_blank" rel="noopener"><rect x="${x(ev.year)-(i?34:168)}" y="${top}" width="${width}" height="31" rx="6"/><text x="${x(ev.year)-(i?25:159)}" y="${top+21}">${E(label)}</text><title>${E(ev.description)}</title></a></g>`;}).join('')}
 <path class="history-actual-line" d="${monotonePath(actual.map(point))}" stroke="#67339b" stroke-width="4.5" fill="none"/>
 ${bridges.map(([a,b,cls])=>`<path class="${cls}" d="${monotonePath([point(a),point(b)])}" stroke="#95839e" stroke-width="4" stroke-dasharray="3 5" fill="none"/>`).join('')}
 ${rows.map(r=>`<g role="button" tabindex="0" data-execution-year="${r.year}" ${vizTip(tip(r))} aria-label="${E(tip(r).join(' · '))}">${r.kind==='project'?`<path class="project-history-marker" d="M${x(r.year)},${y(r.real)-8} l8,8 l-8,8 l-8,-8 Z" fill="#371953" stroke="white" stroke-width="2"/>`:`<circle cx="${x(r.year)}" cy="${y(r.real)}" r="${[2005,2025,2026].includes(r.year)?7:4.5}" fill="${r.kind==='budget'?'white':r.kind==='legacy'?'#996815':'#67339b'}" stroke="${r.kind==='budget'?'#95839e':'white'}" stroke-width="2"/>`}</g><text class="history-year-label" x="${x(r.year)}" y="${H-B+24}" transform="rotate(-48 ${x(r.year)} ${H-B+24})" text-anchor="end">${r.year}${r.priceEstimated?'*':''}</text>`).join('')}
 ${[a,b].map(r=>`<text class="history-anchor-label" x="${x(r.year)}" y="${y(r.real)+24}" text-anchor="middle">${fmt(r.real/1e12,2)}</text>`).join('')}</svg></div>
 <p class="history-mobile-hint">Deslizá el gráfico para recorrer los años.</p><p class="history-exception">*2026 y 2027: autorizaciones, no gasto ejecutado. Ajuste de precios estimado con inflación de ${fmt(d.priceAdjustment.assumptions['2026']*100,0)}% en 2026 y ${fmt(d.priceAdjustment.assumptions['2027']*100,0)}% en 2027. Los tramos punteados separan etapas distintas.</p>
 <div class="history-year-reading"><label for="execution-year">Elegí un año<select id="execution-year">${rows.slice().reverse().map(r=>`<option value="${r.year}" ${r.year===chosen.year?'selected':''}>${r.year}</option>`).join('')}</select></label><p class="point-readout" id="execution-point" aria-live="polite">${executionObservation(chosen)}</p></div>
 ${detailLink('historia','Fuentes y cómo se comparan los años')}
 <details class="history-values"><summary>Ver todos los importes y descargar</summary><div class="table-wrap"><table><caption>Valores originales y valores del gráfico</caption><thead><tr><th>Año</th><th>Tipo de dato</th><th>Pesos originales</th><th>Valor del gráfico</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${r.year}</th><td>${E(executionLabel(r))}</td><td class="num">${money(r.nominal)}</td><td class="num">${money(r.real)}</td></tr>`).join('')}</tbody></table></div><p>${E(d.method)}</p><p>${d.notes.map(E).join(' ')}</p><a href="${E(d.source)}" target="_blank" rel="noopener">Serie oficial IDECBA ↗</a> · <a href="${Site.url('sources/serie-aif-idecba.xlsx')}" download>Cuadro consultado</a> · <a href="${Site.url('data/history/execution-history.csv')}" download>Serie CSV</a></details></section>`;
};
const previousUSDHistory=historyUSDPanel;
historyUSDPanel=function(){
 const d=state.historyUSD;if(!d)return '';const a=d.series.find(p=>p.year===d.minYear),b=d.series.at(-1),objects=state.historyUSDDim==='8';
 const selected=objects?null:d.classifications['6'].find(r=>r.id===state.usdHistoryGroup);
 const rows=objects?d.classifications['8']:selected?d.classifications['7'].filter(r=>r.id.startsWith(selected.id+'.')):d.classifications['6'];
 const max=Math.max(...rows.flatMap(r=>[r.pastUSDConstant,r.currentUSD]));
 const legacy=document.createElement('template');legacy.innerHTML=previousUSDHistory();
 const table=legacy.content.querySelector('.table-wrap').outerHTML,method=legacy.content.querySelector('details').outerHTML;
 const title=r=>objects&&r.id==='7'?'Intereses y gastos de la deuda':displayName(r.name);
 return `<section class="chart-panel usd-history usd-redesign" id="contraste-dolares"><p class="eyebrow">EL PRESUPUESTO EN DÓLARES · 2005–2026</p><h2>El presupuesto, visto en dólares.</h2><div class="usd-total-reading"><span>${a.year} · aprobado<strong>USD ${fmt(a.usdConstant/1e9,2)} mil millones</strong></span><span>${b.year} · actualizado a junio<strong>USD ${fmt(b.usdConstant/1e9,2)} mil millones</strong></span><span>Variación<strong>${signedPct((b.usdConstant/a.usdConstant-1)*100)}</strong></span></div><p class="usd-unit">Dólares actualizados por la inflación de EE. UU. a abril–junio de 2026.</p><div class="tools" role="group" aria-label="Clasificación del contraste en dólares"><button class="small-btn" data-usd-history="7" aria-pressed="${!objects}">Finalidad y función</button><button class="small-btn" data-usd-history="8" aria-pressed="${objects}">Objeto del gasto</button>${selected?'<button class="small-btn" data-usd-group="">Volver a todas las finalidades</button>':''}</div>${selected?`<h3>${E(title(selected))}</h3>`:''}<div class="comparison-legend"><span><i style="background:#ac9cba"></i>${a.year}</span><span><i style="background:#67339b"></i>${b.year}</span></div><div class="usd-paired-bars">${rows.map(r=>`<article><div class="usd-category-heading">${!objects&&!selected?`<button class="text-link" data-usd-group="${E(r.id)}">${E(title(r))} · ver funciones ↗</button>`:`<h3>${E(title(r))}</h3>`}<strong>${r.variationPercent===null?'Sin base':signedPct(r.variationPercent)}</strong></div>${/seguridad/i.test(r.name)?'<p class="usd-event-note">Incluye el traspaso de la Policía en 2016–2017.</p>':/transporte/i.test(r.name)?'<p class="usd-event-note">Incluye el traspaso del Subte en 2013.</p>':''}${[[a.year,r.pastUSDConstant,'past'],[b.year,r.currentUSD,'current']].map(([year,value,cls])=>`<div class="usd-bar-row"><span>${year}</span><i><b class="${cls}" style="width:${value/max*100}%"></b></i><strong>USD ${fmt(value/1e6,0)} millones</strong></div>`).join('')}</article>`).join('')}</div><p class="usd-coverage-note">Cambian el tipo de cambio, las responsabilidades y la etapa del presupuesto. ${detailLink('historia','Cómo leer este contraste')}</p><details class="usd-exact-table"><summary>Todos los valores por ${objects?'objeto del gasto':'finalidad y función'}</summary>${table}</details>${method}<a class="text-link" href="${Site.url('data/history/budget-history-usd.csv')}" download>Descargar comparación ↗</a></section>`;
};
extraViews.history=function(){return `<section class="panel history-page"><p class="eyebrow">1997–2027</p><h1>30 años de gasto público.</h1>${executionHistoryPanel()}<details class="dollar-perspective"><summary>Otra mirada: el presupuesto en dólares</summary><p>Compara el aprobado de 2005 con el actualizado a junio de 2026. El tipo de cambio y las nuevas responsabilidades afectan el resultado; no es la misma comparación que la ejecución en pesos.</p>${historyUSDPanel()}</details><details class="historical-extras"><summary>Comparar otros años, habitantes y partidas</summary><p>Estas vistas usan la serie de presupuestos autorizados desde 2005. ${detailLink('historia','Ver sus criterios')}</p>${longBudgetPanel()}${cabaPopulationHistory()}${categoryHistoryPanel()}${historyPairPanel()}</details></section>`;};

function projectPurposeTree(){
 const total=state.project.summary.fiscalExpense.value,purposes=state.project.breakdowns.purposes.slice().sort((a,b)=>b.value-a.value),social=purposes.find(r=>r.name==='Servicios Sociales'),rest=purposes.filter(r=>r!==social);
 const shades=['#59317f','#68408d','#77529a','#8863a6','#997ab2','#a38abb','#b5a1c9','#c3b1d2'];
 const colors={'Administración Gubernamental':'#7a6394','Servicios de Seguridad':'#315f79','Servicios Económicos':'#296d62','Deuda Pública - Intereses y Gastos':'#77541f'};
 const functions=state.project.breakdowns.functions.filter(r=>r.purpose===social.name).sort((a,b)=>b.value-a.value);
 let cursor=0;
 const frameWidth=Math.min(innerWidth-40,1200),physicalWidth=innerWidth<=650?frameWidth:frameWidth*social.value/total;
 const physicalHeight=innerWidth<=650?1100*social.value/total-50:innerWidth<=850?633:563;
 // A binary partition gives every function its actual area; no minimum-area padding.
 function partition(rows,x=0,y=0,w=100,h=100){
  if(rows.length===1)return [{...rows[0],x,y,w,h}];
  const sum=rows.reduce((n,r)=>n+r.value,0);let i=1,partial=rows[0].value;while(i<rows.length-1&&Math.abs(partial+rows[i].value-sum/2)<Math.abs(partial-sum/2)){partial+=rows[i++].value;}
  const split=partial/sum;return w*physicalWidth>=h*physicalHeight?[...partition(rows.slice(0,i),x,y,w*split,h),...partition(rows.slice(i),x+w*split,y,w*(1-split),h)]:[...partition(rows.slice(0,i),x,y,w,h*split),...partition(rows.slice(i),x,y+h*split,w,h*(1-split))];
 }
 const tiles=partition(functions).map((r,i)=>`<button class="purpose-function-tile ${r.value/total<.02?'function-small':''}" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%;background:${shades[i]};color:${i>3?'#271a36':'white'}" data-project-function="${E(r.id)}" data-value="${r.value}" aria-label="${E(r.name)}, ${pct(r.value/total*100)} del total, ${money(r.value)}"><span>${E(r.name==='Agua potable y alcantarillado'?'Agua':r.name==='Vivienda y Urbanismo'?'Vivienda':r.name)}</span><strong>${pct(r.value/total*100)}</strong>${r.value/total>=.04?`<small>${short(r.value)}</small>`:''}</button>`).join('');
 return `<figure class="treemap-figure project-purpose-tree"><figcaption>Destinos del gasto · cada rectángulo representa su parte del total</figcaption><div class="purpose-tree-frame"><section class="purpose-social" style="--purpose-share:${social.value/total*100}%"><h3>Servicios sociales <span>${pct(social.value/total*100)} del total</span><button data-project-purpose="${E(social.name)}" aria-label="Ver todas las funciones de Servicios Sociales">Ver detalle ↗</button></h3><div class="purpose-function-grid">${tiles}</div></section><div class="purpose-rest">${rest.map(r=>{const height=r.value/(total-social.value)*100,top=cursor;cursor+=height;return `<button class="purpose-rest-tile" style="top:${top}%;height:${height}%;background:${colors[r.name]||'#67339b'}" data-project-purpose="${E(r.name)}" ${r.name.startsWith('Deuda')?'data-project-debt':''} aria-label="${E(r.name)}, ${pct(r.value/total*100)} del total"><span>${r.name.startsWith('Deuda')?'Deuda pública · intereses y gastos':E(displayName(r.name))}</span><strong>${pct(r.value/total*100)}<small>${short(r.value)}</small></strong></button>`;}).join('')}</div></div><button class="text-link purpose-debt-detail" data-project-function="25">Deuda pública: ver importe y detalle ↗</button></figure>`;
}
projectExpenses=function(){
 const key=projectDimensions[state.projectDimension]?state.projectDimension:'purposes',selected=state.projectPurpose;
 let rows=state.project.breakdowns[key].map(r=>({...r,dimension:key})),total=state.project.summary.fiscalExpense.value;
 if(selected){rows=state.project.breakdowns.functions.filter(r=>r.purpose===selected);total=rows.reduce((v,r)=>v+r.value,0);}rows.sort((a,b)=>b.value-a.value);
 const chart=key==='purposes'&&!selected?projectPurposeTree():compositionTreemap(rows.map(r=>({...r,action:key==='functions'?`data-project-function="${E(r.id)}"`:''})),{label:selected?'Funciones de '+selected:'Gasto por '+projectDimensions[key].toLowerCase(),limit:22});
 return `<section class="project-spending"><h2>${selected?E(displayName(selected)):'¿En qué se propone gastar?'}</h2><p class="chart-unit">${money(total)}${selected?' · funciones de esta finalidad':''}</p><div class="tools project-controls"><label>Mirar por<select id="project-dimension">${Object.entries(projectDimensions).map(([k,name])=>`<option value="${k}" ${k===key?'selected':''}>${name}</option>`).join('')}</select></label>${selected?'<button class="small-btn" data-project-reset>Volver al total</button>':''}</div>${chart}<details class="exact-values"><summary>Ver tabla completa</summary>${projectTable(rows,total)}</details>${detailLink()}</section>${projectBudgetChanges(selected?'functions':key)}${areaSearchMarkup()}<details class="project-financing"><summary>Operaciones separadas del gasto</summary><p>Estas operaciones no integran el gasto solicitado que se muestra arriba.</p>${projectTable(['figurativeExpense','financialApplications','debtAmortizationAndOtherLiabilities'].map(k=>({name:projectMetricLabels[k],...state.project.summary[k]})),total,false)}${detailLink()}</details>${areaDialogMarkup()}<dialog class="project-dialog" id="project-detail-dialog" aria-labelledby="project-dialog-title"><button class="dialog-close" data-project-dialog-close aria-label="Cerrar detalle">×</button><div id="project-dialog-body"></div></dialog>`;
};
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-project-function],[data-usd-group]');if(!button)return;
 if(button.hasAttribute('data-usd-group')){state.usdHistoryGroup=button.dataset.usdGroup||null;render();return;}
 const row=state.project.breakdowns.functions.find(r=>r.id===button.dataset.projectFunction);if(!row)return;
 const total=state.project.summary.fiscalExpense.value;
 openProjectDialog(`<p class="eyebrow">PROYECTO 2027 · ${E(displayName(row.purpose))}</p><h2 id="project-dialog-title">${E(row.name)}</h2><strong class="purpose-dialog-value">${money(row.value)}</strong><p>${pct(row.value/total*100)} de todo el gasto propuesto para 2027.</p>${detailLink('presupuesto-2027','Fuente y clasificación')}`,button);
});

let revealObserver;
function polishChartLines(root=document){
 for(const svg of root.querySelectorAll('.line-chart svg')){
  const lines=[...svg.querySelectorAll('[data-budget-series]')],numbers=s=>(s.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number);
  const coords=lines.map(p=>numbers(p.getAttribute('d')));if(coords.some(p=>p.length!==4))continue;
  const points=coords.length?[[coords[0][0],coords[0][1]],...coords.map(p=>[p[2],p[3]])]:[];
  const curves=monotonePath(points).match(/C[^C]+/g)||[];
  lines.forEach((p,i)=>{p.setAttribute('d',`M${points[i].join(',')} ${curves[i]}`);p.classList.add('polished-line');});
 }
 const selector='.trend-svg path[fill="none"][stroke-width], .evolution-chart path[fill="none"][stroke-width]';
 for(const path of root.querySelectorAll(selector)){
  const d=path.getAttribute('d');if(!d||/[CQAZHV]/i.test(d))continue;
  const segments=d.match(/M[^M]+/g)||[],numeric=/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi;
  path.setAttribute('d',segments.map(segment=>{const v=(segment.match(numeric)||[]).map(Number),points=[];for(let i=0;i<v.length;i+=2)points.push([v[i],v[i+1]]);return points.every((p,i)=>p.every(Number.isFinite)&&(!i||p[0]>points[i-1][0]))?monotonePath(points):segment;}).join(' '));path.classList.add('polished-line');
 }
 for(const line of root.querySelectorAll('.area-history polyline')){
  const points=line.getAttribute('points').trim().split(/\s+/).map(p=>p.split(',').map(Number)),path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',monotonePath(points));path.classList.add('polished-line','area-history-line');line.replaceWith(path);
 }
 for(const circle of root.querySelectorAll('.trend-svg circle,.area-history circle,.line-chart [data-budget-point]'))circle.setAttribute('r',Math.max(4.5,Number(circle.getAttribute('r')||0)));
}
const polishedEnhance=enhanceVisuals;
enhanceVisuals=function(view){
 polishedEnhance(view);if(view==='landing')mountFiscalMap();polishChartLines();
 revealObserver?.disconnect();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window))return;
 revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('reveal-visible');revealObserver.unobserve(entry.target);}},{threshold:.06});
 for(const element of document.querySelectorAll('.citizen-home > section,.history-page > .chart-panel,.project-spending > .treemap-figure')){
  if(element.getBoundingClientRect().top>innerHeight){element.classList.add('reveal-ready');revealObserver.observe(element);}
 }
};
// A report is inserted after render; smooth its lines when its native dialog opens.
document.addEventListener('click',e=>{if(e.target.closest('[data-area-report]'))requestAnimationFrame(()=>polishChartLines(document.querySelector('#area-report-dialog')||document));});
document.addEventListener('change',e=>{
 if(e.target.id!=='execution-year')return;
 const chart=document.querySelector('.history-chart-scroll'),point=document.querySelector(`[data-execution-year="${e.target.value}"]`);if(!chart||!point)return;
 const box=point.getBoundingClientRect(),frame=chart.getBoundingClientRect();
 chart.scrollTo({left:chart.scrollLeft+box.left-frame.left-chart.clientWidth/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
