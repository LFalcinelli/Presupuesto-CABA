'use strict';
// Shared citizen-facing views. Accounting totals and stages remain distinct.
const readingDataLoader=ensureViewData;
ensureViewData=async function(view,period){await Promise.all([readingDataLoader(view,period),...(['project','method'].includes(view)?[dataFile('execution-history').then(d=>state.executionHistory=d)]:[]),...(view==='compare'?[dataFile('stages-2027').then(d=>state.projectStages=d)]:[]),...(view==='explained'?[Site.load(state.config.featuredBudgetFile).then(d=>state.project=d)]:[])]);};
function projectFiscalAccount(){
 const s=state.project.summary;
 return {year:2027,quarter:4,project:true,currentIncome:s.currentRevenue.value,capitalIncome:s.capitalRevenue.value,
  currentPrimaryExpense:s.currentExpense.value-s.interest.value,capitalExpense:s.capitalExpense.value,interest:s.interest.value,
  income:s.fiscalRevenue.value,expense:s.fiscalExpense.value,economicPrimaryResult:s.economicPrimaryResult.value,
  economicResult:s.economicResult.value,primaryResult:s.primaryResult.value,financialResult:s.financialResult.value,
  financialSources:s.financialSources.value,financialApplications:s.financialApplications.value};
}
function fiscalAccountRows(d){return [
 ['Ingresos corrientes',d.currentIncome],['Gastos habituales, sin intereses',d.currentPrimaryExpense],
 ['Ahorro corriente, antes de intereses',d.economicPrimaryResult],['Ingresos de capital',d.capitalIncome],
 ['Gastos de capital',d.capitalExpense],['Ingresos totales',d.income],['Gastos antes de intereses',d.currentPrimaryExpense+d.capitalExpense],
 ['Saldo antes de intereses',d.primaryResult],['Intereses de la deuda',d.interest],['Gastos totales',d.expense],
 ['Saldo final',d.financialResult]];}
const readingDetails=new Map();let readingDetailId=0;
function readingAction(title,content){const id=++readingDetailId;readingDetails.set(String(id),{title,content});return `data-reading-detail="${id}"`;}
function verticalFiscalFlow(inputs,outputs,scale,d){
 const k=316/scale,path=(a,b,y1,y2,w)=>`M${a},${y1} C${a},${(y1+y2)/2} ${b},${(y1+y2)/2} ${b},${y2} L${b+w},${y2} C${b+w},${(y1+y2)/2} ${a+w},${(y1+y2)/2} ${a+w},${y1} Z`;
 const ribbons=(rows,incoming)=>{let sum=0;return rows.map((r,i)=>{const pool=12+sum*k,node=pool+i*8,w=r.value*k;sum+=r.value;return `<path d="${incoming?path(node,pool,35,120,w):path(pool,node,132,217,w)}" fill="${r.color}" fill-opacity=".34"/><rect x="${node}" y="${incoming?23:217}" width="${w}" height="12" fill="${r.color}"/>`;}).join('');};
 const labels=rows=>rows.map(r=>`<button style="--flow-color:${r.color}" ${readingAction(r.name,`<strong class="reading-amount">${money(r.value)}</strong><p>${E(r.description||r.name)}</p>${detailLink(d.project?'presupuesto-2027':'caif','Fuente y cálculo')}`)}><span>${E(r.name)}</span><strong>${short(r.value)}</strong></button>`).join('');
 return `<div class="fiscal-flow-mobile"><p class="flow-mobile-side">LO QUE ${d.project?'SE PREVÉ QUE INGRESE':'INGRESÓ'}</p><div class="flow-mobile-labels">${labels(inputs)}</div><svg class="fiscal-flow-mobile-svg" viewBox="0 0 360 250" role="img" aria-label="Los ingresos se reúnen y se distribuyen entre gastos habituales, capital, intereses y saldo.">${ribbons(inputs,true)}<rect x="12" y="120" width="316" height="12" fill="#ded3e6"/>${ribbons(outputs,false)}</svg><p class="flow-mobile-side">EN QUÉ ${d.project?'SE PROPONE USAR':'SE USÓ'}</p><div class="flow-mobile-labels">${labels(outputs)}</div></div>`;
}
function fiscalFlow(d){
 const deficit=d.financialResult<0,scale=Math.max(d.income,d.expense),W=1100,H=520,top=46,height=280,k=height/scale;
 const inputs=[{name:'Ingresos corrientes',value:d.currentIncome,color:'#217c66'},{name:'Ingresos de capital',value:d.capitalIncome,color:'#58a48b'},...(deficit?[{name:'Faltante de ingresos',value:-d.financialResult,color:'#bc3551'}]:[])];
 const outputs=[{name:'Gastos habituales',description:'Sin intereses ni gastos de capital',value:d.currentPrimaryExpense,color:'#b43a55'},
  {name:'Gastos de capital',description:'Inversión y otros gastos de capital',value:d.capitalExpense,color:'#cf6573'},
  {name:'Intereses',description:'Intereses de la deuda pública',value:d.interest,color:'#96374f'},
  ...(!deficit?[{name:'Saldo a favor',description:'Después de todos los gastos',value:d.financialResult,color:'#217c66'}]:[])];
 let offset=0;inputs.forEach((r,i)=>{r.poolStart=top+offset*k;r.start=r.poolStart+i*22;r.h=r.value*k;offset+=r.value;});offset=0;
 outputs.forEach((r,i)=>{r.poolStart=top+offset*k;r.start=r.poolStart+i*25;r.h=r.value*k;offset+=r.value;});
 const ribbon=(x1,x2,y1,y2,h)=>`M${x1},${y1} C${(x1+x2)/2},${y1} ${(x1+x2)/2},${y2} ${x2},${y2} L${x2},${y2+h} C${(x1+x2)/2},${y2+h} ${(x1+x2)/2},${y1+h} ${x1},${y1+h} Z`;
 const node=(r,i,left)=>{const x=left?220:830,labelX=left?12:868,labelY=left?[100,367,432][i]:[96,324,387,447][i];
  const action=readingAction(r.name,`<strong class="reading-amount">${money(r.value)}</strong><p>${E(r.description|| (r.name==='Faltante de ingresos'?'Diferencia entre gastos e ingresos. Este gráfico no atribuye el faltante a una fuente de financiamiento.':'Recursos del mismo período que los gastos del gráfico.'))}</p><p>${d.project?'Proyecto 2027, pendiente de aprobación.':d.quarter===4?'Año completo '+d.year+'.':'Enero–junio de '+d.year+'.'}</p>${detailLink(d.project?'presupuesto-2027':'caif','Fuente y cálculo')}`);
  return `<g role="button" tabindex="0" ${action} ${vizTip([r.name,money(r.value)])} aria-label="${E(r.name)}: ${money(r.value)}. Abrir detalle"><rect x="${x}" y="${r.start}" width="18" height="${r.h}" fill="${r.color}"/><path d="M${left?x:x+18},${r.start+r.h/2} L${left?x-18:x+30},${labelY-5}" stroke="${r.color}" fill="none"/><text x="${labelX}" y="${labelY}" class="flow-node-name">${E(r.name)}</text><text x="${labelX}" y="${labelY+25}" class="flow-node-value">${short(r.value)}</text></g>`;};
 const saldos=[['Ahorro corriente',d.economicPrimaryResult,'Ingresos corrientes menos gastos habituales, antes de intereses.'],['Ahorro corriente con intereses',d.economicResult,'También descuenta los intereses.'],['Saldo antes de intereses',d.primaryResult,'Ingresos totales menos gastos habituales y de capital.'],['Saldo final',d.financialResult,'También descuenta los intereses de la deuda.']];
 return `<section class="fiscal-flow-panel" aria-labelledby="fiscal-flow-title"><div class="flow-heading"><div><p class="eyebrow">LA CUENTA COMPLETA · ${d.year}${d.project?' · PROYECTO':d.quarter===2?' · ENERO–JUNIO':' · CIERRE ANUAL'}</p><h2 id="fiscal-flow-title">Así se llega al saldo.</h2></div><p>Ingresos en verde, gastos en rojo.<br>Tocá un concepto para verlo en detalle.</p></div>
 <div class="fiscal-flow-scroll" role="region" tabindex="0" aria-label="Diagrama de ingresos y gastos; desplazamiento horizontal en pantallas pequeñas"><svg class="fiscal-flow-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Ingresos ${money(d.income)}; gastos ${money(d.expense)}; saldo final ${money(d.financialResult)}"><text x="12" y="22" class="flow-side">LO QUE ${d.project?'SE PREVÉ QUE INGRESE':'INGRESÓ'}</text><text x="868" y="22" class="flow-side">EN QUÉ ${d.project?'SE PROPONE USAR':'SE USÓ'}</text>
 ${inputs.map(r=>`<path class="fiscal-ribbon" d="${ribbon(238,530,r.start,r.poolStart,r.h)}" fill="${r.color}" fill-opacity=".34"/>`).join('')}
 <rect x="530" y="${top}" width="15" height="${height}" fill="#eee5f1"/>
 ${outputs.map(r=>`<path class="fiscal-ribbon" d="${ribbon(545,830,r.poolStart,r.start,r.h)}" fill="${r.color}" fill-opacity=".32"/>`).join('')}
 ${inputs.map((r,i)=>node(r,i,true)).join('')}${outputs.map((r,i)=>node(r,i,false)).join('')}
 <text x="538" y="475" text-anchor="middle" class="flow-total">Ingresos totales: ${short(d.income)}</text><text x="538" y="505" text-anchor="middle" class="flow-total">Gastos totales: ${short(d.expense)}</text></svg></div>
 ${verticalFiscalFlow(inputs,outputs,scale,d)}<p class="flow-mobile-hint">Tocá un concepto para ver su importe completo.</p><div class="fiscal-result-steps">${saldos.map(([name,value,description],i)=>`<button class="fiscal-result-card ${value<0?'is-negative':'is-positive'} ${i===3?'is-final':''}" ${readingAction(name,`<p>${description}</p><strong class="reading-amount">${money(value)}</strong>`)}><span>${name}</span><strong>${signedMoney(value)}</strong><small>${i===3?'Incluye intereses':'Ver cómo se calcula ↗'}</small></button>`).join('')}</div>
 <p class="flow-account-note">Los saldos son pasos de una misma cuenta; no se suman entre sí.${!d.project?' El gasto incluye compromisos de pago que pueden seguir pendientes.':''}</p>
 ${Number.isFinite(d.financialSources)?`<section class="flow-financing"><h3>Después del saldo: cómo se cubren los vencimientos.</h3><div><article><span>Dinero obtenido mediante financiamiento</span><strong>${short(d.financialSources)}</strong><small>${money(d.financialSources)}</small></article><article><span>Amortizaciones y otras operaciones financieras</span><strong>${short(d.financialApplications)}</strong><small>${money(d.financialApplications)}</small></article></div><p>El saldo final más las fuentes de financiamiento cubre las aplicaciones financieras. Estas operaciones se muestran aparte del gasto.</p></section>`:''}
 <details class="fiscal-account-detail"><summary>Importes completos y fuente</summary><div class="table-wrap"><table class="fiscal-account"><caption>${d.year} · ${d.project?'proyecto anual':d.quarter===2?'enero–junio':'año completo'}</caption><thead><tr><th>Concepto</th><th>Pesos</th></tr></thead><tbody>${fiscalAccountRows(d).map(([name,value])=>`<tr><th scope="row">${name}</th><td class="num">${money(value)}</td></tr>`).join('')}</tbody></table></div>${detailLink(d.project?'presupuesto-2027':'caif','Fuente y metodología')}${d.localSource?` · <a href="${Site.url(d.localSource.replace(/^\//,''))}" target="_blank" rel="noopener">Informe oficial ↗</a>`:''}</details></section>`;
}
caifPanel=function(){const d=state.caif?.periods?.[state.period];return d?fiscalFlow(d):'';};

function projectOverview(){
 const s=state.project.summary,d=state.projectComparison,rate=d.totals.realVariationPct;
 return `<section class="project-overview"><p class="project-intro">Qué se propone gastar, cómo cambia frente a 2026 y qué saldo dejaría.</p><div class="project-reading-cards"><article><span>Presupuesto solicitado</span><strong>≈ $ ${fmt(s.fiscalExpense.value/1e12,1)} billones</strong><small>${money(s.fiscalExpense.value)}</small></article><article><span>Frente a 2026, descontando la inflación</span><strong>${signedPct(rate)}</strong><small>Presupuesto actualizado al 30 de junio · supuesto: 18% de inflación</small>${annualPriceScenario(true)}</article><article><span>Después de los gastos e intereses</span><strong>${short(s.financialResult.value)}</strong><small>$ ${fmt(s.financialResult.value/s.fiscalRevenue.value*100000,2)} por cada $100.000 de ingresos previstos</small></article></div></section>
 ${areaSearchMarkup()}${projectKeyReadings()}${fiscalFlow(projectFiscalAccount())}<section class="project-comparison-inline" id="cambios-2027"><p class="eyebrow">2027 FRENTE A 2026</p>${projectCompare()}</section>${investmentExplorer()}${companionProjects()}${areaDialogMarkup()}<dialog class="project-dialog" id="project-detail-dialog" aria-labelledby="project-dialog-title"><button class="dialog-close" data-project-dialog-close aria-label="Cerrar detalle">×</button><div id="project-dialog-body"></div></dialog>`;
}
projectSummary=projectOverview;
const readingReadRoute=readRoute,readingSyncRoute=syncRoute;
readRoute=function(){readingReadRoute();const q=new URLSearchParams(location.hash.split('?')[1]||'');if(state.view==='project'){if(q.get('vista')==='compare')state.projectTab='summary';state.projectBase=q.get('base')==='initial'?'initial':'current';}state.compareBudgetBase=q.get('presupuesto')==='inicial'?'initial':'current';state.perCapitaGuide=state.view==='explained'&&q.get('tema')==='por-habitante';};
syncRoute=function(){readingSyncRoute();if(state.view==='project'&&state.projectTab==='summary'){const q=new URLSearchParams(location.hash.split('?')[1]||'');q.set('vista','summary');if(state.projectBase==='initial')q.set('base','initial');else q.delete('base');if(state.projectPrices==='nominal')q.set('precios','nominal');else q.delete('precios');if(state.projectCompareDimension==='objects')q.set('apertura','objects');else q.delete('apertura');if(state.projectChangeMode==='amount')q.set('cambio','amount');else q.delete('cambio');history.replaceState(null,'','#proyecto-2027?'+q);}if(state.view==='compare'&&state.compareBudgetBase==='initial'){const q=new URLSearchParams(location.hash.split('?')[1]||'');q.set('presupuesto','inicial');history.replaceState(null,'','#comparar?'+q);}if(state.view==='explained'&&state.perCapitaGuide)history.replaceState(null,'','#presupuesto-explicado?tema=por-habitante');};
document.addEventListener('click',e=>{if(e.target.closest('[data-view="explained"]'))state.perCapitaGuide=false;const b=e.target.closest('[data-project-tab="compare"],[data-per-capita-guide]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();state.view=b.hasAttribute('data-per-capita-guide')?'explained':'project';state.perCapitaGuide=b.hasAttribute('data-per-capita-guide');state.projectTab='summary';state.navigationRequested=true;render();},true);

function provincialPairBlock(id,c=comparisonState()){
 const target=id==='02'?'06':id,r=c.p.rows.find(r=>r.id===target);if(!r)return '';
 const get=p=>({p,caba:p.rows.find(x=>x.id==='02'),other:p.rows.find(x=>x.id===target)});
 const current=c.d.periods.find(p=>p.id==='2026-1'),employment=c.d.periods.find(p=>p.id==='2024-4');
 const available=c.d.indicators.filter(i=>i.availablePeriods?.includes(c.p.id)),budget=c.p.kind==='budget';
 const main=budget?available:available.filter(i=>['expensePc','revenuePc','localTax','capital','balance'].includes(i.id));
 const extra=current&&get(current),jobs=employment&&get(employment);
 const friendly={localTax:'De cada $100 que ingresan, cuánto proviene de tributos propios',capital:'De cada $100 gastados, cuánto va a gastos de capital',balance:'Saldo después de gastos e intereses, por cada $100 de ingresos',employeesRate:'Puestos públicos cada 1.000 habitantes'};
 const paint=(context,other,list)=>provincePairRows(context,other,list.map(i=>({...i,citizenName:friendly[i.id]||i.name})));
 return `<section class="pair-panel"><h2>CABA frente a otra provincia</h2><label class="pair-picker">Comparar CABA con<select id="pair-province">${c.p.rows.filter(x=>x.id!=='02').sort((a,b)=>a.name.localeCompare(b.name,'es')).map(x=>`<option value="${x.id}" ${x.id===target?'selected':''}>${E(x.name)}</option>`).join('')}</select></label><div class="pair-sheet"><div class="pair-identities">${[c.caba,r].map(x=>`<div>${provinceSilhouette(x.id)}<h3>${E(x.name)}</h3><p>${fmt(x.population)} habitantes</p></div>`).join('')}</div><p class="pair-period">${E(c.p.label)}${budget?` · ${state.compareBudgetBase==='initial'?'CABA aprobado inicialmente':'CABA actualizado a junio'}; la otra provincia, aprobado o prorrogado.`:''}</p>${paint(c,r,main)}
 ${budget&&extra?.other?`<h3 class="pair-date-heading">Lo que ocurrió de enero a marzo de 2026</h3><p class="pair-period">Resultados del mismo trimestre para las dos jurisdicciones.</p>${paint({...c,p:extra.p,caba:extra.caba},extra.other,c.d.indicators.filter(i=>['localTax','capital','balance'].includes(i.id)))}`:''}
 ${jobs?.other?`<h3 class="pair-date-heading">Empleo público · último dato disponible: 2024</h3>${paint({...c,p:jobs.p,caba:jobs.caba},jobs.other,c.d.indicators.filter(i=>i.id==='employeesRate'))}<p class="pair-period">Puestos ocupados en el sector público; incluye personal que presta servicios, no sólo cargos políticos.</p>`:''}
 <details class="pair-additional"><summary>Otros indicadores y fuentes</summary>${paint(c,r,available.filter(i=>!main.includes(i)))}<p>Población: Censo 2022 definitivo. Siluetas del IGN, ampliadas para identificarlas; no están a la misma escala.</p>${detailLink('provincias','Fuentes y diferencias de alcance')}</details></div></section>`;
}
provincePair=provincialPairBlock;

nationalRealState=function(){
 const data=state.nationalSpending;if(!data)return null;
 const ids=[{id:'02',name:'CABA',color:'#67339b'},{id:'14',name:'Córdoba',color:'#1b8079'},{id:'06',name:'Buenos Aires',color:'#bd6d30'},{id:'82',name:'Santa Fe',color:'#386ab0'},{id:'50',name:'Mendoza',color:'#97547e'}],basis=state.realHistoryBasis||'index';
 const rows=data.rows.map(p=>({year:p.year,values:ids.map(s=>{const v=p.rows.find(r=>r.id===s.id)?.real,first=data.rows[0].rows.find(r=>r.id===s.id)?.real,den=annualPopulation(s.id,p.year,p.coverage);return Number.isFinite(v)?basis==='index'?v/first*100:basis==='perCapita'?den?v/den:null:v:null;})}));return {data,ids,basis,rows};
};
const readingNationalChart=readableLineChart;
readableLineChart=function(rows,series,options={}){
 if(!(options.index&&series.length===5&&series[0].id==='02'))return readingNationalChart(rows,series,options);
 const W=chartWidth(),H=390,L=55,R=18,T=28,B=44,x=i=>L+i/(rows.length-1)*(W-L-R),y=v=>H-B-v/250*(H-T-B);
 return `<svg class="trend-svg province-history-chart" viewBox="0 0 ${W} ${H}" role="group" aria-label="Gasto ejecutado, descontando inflación. 2005 igual a 100; techo 250.">${[0,50,100,150,200,250].map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="#e6e2e9"/><text x="${L-8}" y="${y(v)+5}" text-anchor="end">${v}</text>`).join('')}${series.map((s,j)=>`<path d="${monotonePath(rows.map((r,i)=>[x(i),y(r.values[j])]))}" fill="none" stroke="${s.color}" stroke-width="${j?3:4.5}"/>`).join('')}${rows.map((r,i)=>`${annualTick(i,rows.length,W,r.year)?`<text x="${x(i)}" y="${H-12}" text-anchor="middle">${r.year}</text>`:''}${r.values.map((v,j)=>`<circle role="button" tabindex="0" ${vizTip([series[j].name,String(r.year),fmt(v,1)+' · 2005 = 100'])} cx="${x(i)}" cy="${y(v)}" r="${j?3.5:5}" fill="${series[j].color}" aria-label="${E(series[j].name)} ${r.year}: ${fmt(v,1)}"/>`).join('')}`).join('')}</svg>`;
};
const readingNationalHistory=nationalRealHistory;
nationalRealHistory=function(){return readingNationalHistory().replace('La comparación descuenta la inflación. Elegí una provincia arriba para sumar su recorrido.','CABA, Córdoba, Buenos Aires, Santa Fe y Mendoza. El punto de partida de cada provincia es 100 en 2005.').replace('La línea del conjunto suma las jurisdicciones disponibles; en 2025 excluye La Pampa. ','');};

function perCapitaGuide(){
 const budget=state.project.summary.fiscalExpense.value,pop=state.currentBudget.population||3121707;
 return `<section class="per-capita-guide" id="presupuesto-por-habitante"><p class="eyebrow">UNA CUENTA SENCILLA</p><h1>¿Qué significa presupuesto por porteño?</h1><p>Es una forma de dimensionar el dinero que el Gobierno propone gastar durante un año.</p><div class="per-capita-calculation"><article><span>Presupuesto propuesto para 2027</span><strong>${money(budget)}</strong></article><span aria-hidden="true">÷</span><article><span>Habitantes de la Ciudad</span><strong>${fmt(pop)}</strong></article><span aria-hidden="true">=</span><article><span>Presupuesto por habitante, por año</span><strong>${money(budget/pop)}</strong></article></div><p>El total se divide por la población del Censo 2022, el último censo completo disponible. El presupuesto 2027 todavía es un proyecto pendiente de aprobación.</p><p>No es una factura de impuestos para cada persona ni dinero que se entrega a cada vecino. Incluye servicios y gastos del Gobierno que también utilizan personas que viven fuera de la Ciudad.</p><div class="guide-actions"><button class="small-btn" data-view="landing">Volver al inicio</button>${projectButton('summary','Explorar el proyecto 2027')}${detailLink('presupuesto-2027','Ver el documento y los cálculos')}</div></section>`;
}
const readingExplained=extraViews.explained;
extraViews.explained=function(){if(state.perCapitaGuide)return `<section class="panel">${perCapitaGuide()}</section>`;const t=document.createElement('template');t.innerHTML=readingExplained();t.content.querySelector('.panel').insertAdjacentHTML('afterbegin',`<div class="explanation-entry"><h1>El presupuesto, en palabras simples.</h1><p>Propuesto, aprobado y gastado son tres momentos distintos.</p><a class="text-link" href="#presupuesto-explicado?tema=por-habitante" data-per-capita-guide>Entender el presupuesto por habitante ↗</a></div>`);return t.innerHTML;};
const readingMethodPage=methodPage;
methodPage=function(){
 const topics=[
 ['presupuesto-2027','Proyecto 2027','Es lo que el Ejecutivo propone gastar. Todavía requiere aprobación. Los bonos para proveedores, el Belgrano Sur y la emergencia climática son proyectos separados: no se suman al presupuesto.',`La comparación principal descuenta un supuesto de inflación de 18% para 2027. No es inflación observada. ${annualPriceScenario()} Los intereses y otros costos de la deuda son partidas distintas.`,[[publicSourcePages.legislature,'Legislatura · proyectos de ley']]],
 ['presupuesto-2026','Presupuesto 2026','Aprobado es lo que votó la Legislatura; actualizado agrega las modificaciones registradas durante el año.','El presupuesto actualizado al 30 de junio autoriza gasto para todo 2026. No es lo que ya se gastó.',[[publicSourcePages.execution,'Contaduría · presupuesto y ejecución']]],
 ['ejecucion','Gasto ejecutado','Es el gasto que generó una obligación de pago. Puede seguir pendiente de pago.','Mostramos gastos habituales y de capital. Las amortizaciones de deuda y otras operaciones financieras se cuentan aparte para evitar sumarlas dos veces.',[[publicSourcePages.execution,'Contaduría · ejecuciones trimestrales'],[publicSourcePages.accounts,'Contaduría · cuentas anuales']]],
 ['ingresos','Ingresos','Es el dinero que ingresó a la Ciudad, separado del financiamiento.','Un semestre se compara con el mismo semestre de otro año. Para descontar inflación se usan precios promedio de cada período, no el precio de un solo mes.',[[publicSourcePages.execution,'Contaduría · ingresos realizados']]],
 ['caif','Ingresos, gastos y saldo','El saldo final es lo que ingresó menos lo que se gastó, incluidos los intereses.','Antes de pagar intereses se obtiene otro saldo. Son pasos de una misma cuenta; no se suman entre sí. Un resultado semestral no anticipa necesariamente cómo cerrará el año.',[[publicSourcePages.execution,'Contaduría · cuenta ahorro, inversión y financiamiento']]],
 ['historia','Comparar distintos años','Descontar la inflación permite comparar cuánto se podía comprar con el dinero de cada año.','Esta vista estima precios promedio anuales: IPC de la Ciudad desde 2013; índice de provincias de CIFRA entre 2007 y 2012; índice histórico anterior encadenado. Los montos equivalen a precios promedio de abril–junio de 2026. La serie anual IDECBA y las publicaciones trimestrales pueden contener distintas revisiones y coberturas; no se fuerzan coincidencias en sus originales. Para los meses futuros se usan supuestos: 30% en 2026 y 18% en 2027, de diciembre a diciembre. 2026 y 2027 son presupuestos; los años anteriores muestran gasto ejecutado, con una diferencia de cobertura en 1997. El contraste en dólares usa otro método y otra etapa del presupuesto.',[[publicSourcePages.idecba,'IDECBA · gastos anuales'],[publicSourcePages.ipcba,'IDECBA · inflación'],[publicSourcePages.cifra,'CIFRA · índice de provincias']]],
 ['provincias','CABA y las provincias','La fecha y lo que se mide importan tanto como el número.',`En presupuestos 2026 podés elegir CABA actualizado a junio o el aprobado inicialmente. Las otras provincias conservan su aprobado o prorrogado verificado; Tierra del Fuego es un presupuesto prorrogado. Los puestos públicos son de 2024. La evolución provincial utiliza el mismo índice nacional para todas: por eso CABA puede diferir de su serie propia. ${justiceNote(true)}`,[[publicSourcePages.provincial,'Economía · presupuestos provinciales']]],
 ['funcionarios','Estructura del Gobierno','El padrón permite recorrer cargos, personas y áreas. No mide todo el empleo público.','Distinguimos dependencias, cargos y personas; los rangos no equivalen automáticamente a ministerios o secretarías. Se conserva la fecha de cada publicación.',[[publicSourcePages.authorities,'Buenos Aires Data · autoridades y funcionarios']]]
 ];
 return `<section class="panel method-page"><div class="method-welcome"><p class="eyebrow">LOS DATOS TIENEN RESPALDO</p><h1>De dónde salen las cifras.</h1><p>Información pública, explicaciones breves y enlaces a las publicaciones oficiales.</p><div class="guide-actions"><button class="small-btn" data-view="landing">Volver al inicio</button><button class="text-link" data-view="explained">Entender el presupuesto ↗</button></div></div><nav class="method-index" aria-label="Temas de fuentes y metodología">${topics.map(([id,title])=>`<a href="#metodologia?seccion=${id}" data-method-section="${id}">${title}</a>`).join('')}</nav>${topics.map(([id,title,intro,explanation,sources])=>`<section class="method-section" id="metodo-${id}"><h2>${title}</h2><p class="method-topic-intro">${intro}</p><details class="method-technical" ${state.methodSection===id?'open':''}><summary>Cómo se calcula y dónde comprobarlo</summary><div class="method-explanation">${explanation}</div><div class="official-source-links">${sources.map(([url,label])=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</div></details></section>`).join('')}<p class="method-audit-link">Para una revisión técnica completa: <a href="https://github.com/LFalcinelli/Presupuesto-CABA/tree/main/docs" target="_blank" rel="noopener">métodos y cálculos documentados ↗</a>.</p></section>`;
};

function compositionChildren(row){
 if(row.children?.length)return row.children;
 const income=row.action?.match(/data-income="([\d.]+)"/);
 if(income){const path=income[1].split('.'),data=state.incomes?.[state.period];return (data?.rows||[]).filter(r=>r.codes.length===path.length+1&&r.codes.slice(0,-1).join('.')===income[1]).map(r=>({name:displayName(r.name),value:r.r,action:`data-income="${r.codes.join('.')}"`}));}
 if(state.view==='project'){
  if(row.name==='Ingresos Tributarios'){return state.fiscalMap.nodes.filter(r=>r.parent==='rec_tributos_propios'||r.id==='rec_copart').map(r=>({name:r.label,value:r.value,description:'Recurso previsto en la Planilla 11 del proyecto 2027.'}));}
  if(row.name==='Gastos corrientes'){const s=state.project.summary;return [{name:'Personal',value:9950480728332},{name:'Bienes y servicios',value:6428377453576},{name:'Transferencias corrientes',value:2797877991872},{name:'Intereses de la deuda',value:s.interest.value}];}
 }
 return [];
}
const readingFlatTreemap=compositionTreemap;
function compositionDetail(row,denominator,options){
 const compared=state.view==='project'?Object.values(state.projectComparison.groups).flat().find(r=>r.name===row.name):null;
 const change=compared?`<h3>Frente al presupuesto actualizado de 2026</h3><p><strong>${signedPct(compared.realVariationPct)}</strong> después de descontar la inflación supuesta de 18%.</p><dl class="composition-comparison"><div><dt>2026, actualizado a junio</dt><dd>${money(compared.reference)}</dd></div><div><dt>2027, valor propuesto</dt><dd>${money(compared.project)}</dd></div></dl>`:'';
 return `<strong class="reading-amount">${money(row.value)}</strong><p>${pct(row.value/denominator*100)} del total de este gráfico.</p>${row.description?`<p>${E(row.description)}</p>`:''}${change}<p>${E(options.label||'Composición del gasto')}. ${state.view==='project'?'Importe solicitado para 2027; todavía no es gasto ejecutado.':'Conserva el período y la medida de la vista.'}</p>${detailLink(state.view==='project'?'presupuesto-2027':state.view==='income'?'ingresos':'ejecucion','Fuente y alcance')}`;
}
compositionTreemap=function(items,options={}){
 const sum=items.reduce((s,r)=>s+(r.value>0?r.value:0),0),denominator=options.shareTotal||sum,branches=[],badgeContext=options.badgeContext||{next:0};
 const rows=items.map((row,index)=>{
  const children=compositionChildren(row),valid=children.length>1&&Math.abs(children.reduce((s,r)=>s+r.value,0)-row.value)<=Math.max(1,row.value*1e-9),expand=row.value/sum>.5&&valid;
  let action=row.action;
  if(!action){const area=state.view==='project'&&state.projectDimension==='jurisdictions'?state.areaReports.areas.find(r=>r.code===row.id):null;
   action=area?`data-area-report="${area.id}"`:readingAction(displayName(row.name),compositionDetail(row,denominator,options));
  }
  if(expand)branches.push({index,row,children,action});return {...row,badge:expand?null:++badgeContext.next,action:action+(expand?` data-treemap-branch="${index}"`:'')};
 });
 const html=readingFlatTreemap(rows,options);if(!branches.length)return html;
 const t=document.createElement('template');t.innerHTML=html;const root=t.content.querySelector('.treemap-figure'),view=treemapViews.get(Number(root.dataset.treemapView));
 const pw=Math.max(248,Math.min(1120,window.innerWidth-100)),ph=options.height||(innerWidth<600?620:560);
 for(const branch of branches){const tile=root.querySelector(`[data-treemap-branch="${branch.index}"]`);if(!tile)continue;
  const block=document.createElement('div');block.className='treemap-branch';block.style.cssText=tile.style.cssText;
  block.innerHTML=`<button class="treemap-branch-title" ${branch.action}>${E(displayName(branch.row.name))} <strong>${pct(branch.row.value/denominator*100)}</strong> <span aria-hidden="true">↗</span></button><div class="treemap-branch-interior"></div>`;
  const w=pw*parseFloat(tile.style.width)/100,h=ph*parseFloat(tile.style.height)/100-44;
  const child=document.createElement('template');child.innerHTML=compositionTreemap(branch.children,{...options,badgeContext,showKey:false,shareTotal:denominator,width:w,height:h,label:branch.row.name});
  block.querySelector('.treemap-branch-interior').append(child.content.querySelector('.rect-treemap'));
  const labels=child.content.querySelector('.treemap-labels');if(labels){labels.classList.add('nested-treemap-labels');root.append(labels);}
  tile.replaceWith(block);
 }
 root.querySelector('figcaption span').textContent='· porcentajes del total';const result=t.innerHTML;if(view)view.html=result;return result;
};
const readingEnhance=enhanceVisuals;
enhanceVisuals=function(view){document.querySelector('#reading-detail-dialog[open]')?.close();readingEnhance(view);document.querySelector('.explorer-location')?.remove();if(!document.getElementById('reading-detail-dialog'))document.body.insertAdjacentHTML('beforeend','<dialog id="reading-detail-dialog" class="project-dialog reading-dialog" aria-labelledby="reading-detail-title"><button class="dialog-close" data-reading-close aria-label="Cerrar detalle">×</button><div id="reading-detail-body"></div></dialog>');};
document.addEventListener('click',e=>{const b=e.target.closest('[data-reading-detail],[data-reading-close]');if(!b)return;const dialog=document.getElementById('reading-detail-dialog');if(b.hasAttribute('data-reading-close')){dialog.close();return;}const d=readingDetails.get(b.dataset.readingDetail);if(!d)return;document.getElementById('reading-detail-body').innerHTML=`<h2 id="reading-detail-title">${E(d.title)}</h2>${d.content}`;dialog._origin=b;dialog.showModal();});
document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('[data-reading-detail]')&&e.target.tagName!=='BUTTON'){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
document.addEventListener('close',e=>{if(e.target.id==='reading-detail-dialog')e.target._origin?.focus({preventScroll:true});},true);

// Source pages are the citizen entry point; precise files remain in the repository.
const publicSourcePages={
 execution:'https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/direccion-general-contaduria/informacion-contable/ejecuciones-presupuestarias',
 accounts:'https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/direccion-general-contaduria/informacion-contable/cuentas-anuales-de-inversion',
 idecba:'https://www.estadisticaciudad.gob.ar/eyc/categoria-banco-datos/egresos-publicos/',
 ipcba:'https://www.estadisticaciudad.gob.ar/eyc/categoria-banco-datos/series-empalmadas/',
 cifra:'https://centrocifra.org.ar/estadisticas/ipc-provincias/',
 provincial:'https://www.argentina.gob.ar/economia/sechacienda/coordinacion-fiscal-provincial/ejecucion-presupuestaria-provincial/presupuestos',
 authorities:'https://data.buenosaires.gob.ar/dataset/autoridades-superiores-funcionarios',
 legislature:'https://www.legislatura.gob.ar/',
 approved:'https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/presupuesto-2026'
};
function annualPriceScenario(compact=false){
 const rows=state.executionHistory?.rows,a=rows?.find(r=>r.year===2026),b=rows?.find(r=>r.year===2027);
 if(!a||!b)return '';
 const change=(b.real/a.real-1)*100,priceChange=(a.factor/b.factor-1)*100;
 if(compact)return `<p class="annual-price-scenario">Otra estimación, con precios promedio anuales: <b>${change<0?'−':'+'}${fmt(Math.abs(change),2)}%</b>. Es el criterio de Evolución. ${detailLink('historia','Por qué cambia la estimación')}</p>`;
 return `<p class="annual-price-scenario">Con precios promedio anuales, como en Evolución: <b>${change<0?'−':'+'}${fmt(Math.abs(change),2)}%</b>. Ese cálculo estima una inflación entre promedios de ${fmt(priceChange,1)}%, con supuestos de 30% en 2026 y 18% en 2027. ${detailLink('historia','Por qué cambia la estimación')}</p>`;
}
function projectKeyReadings(){
 const s=state.project.summary,debt=state.projectStages.groups.purposes.find(r=>/deuda/i.test(r.name)),factor=state.projectComparison.deflator.factor,
 absorbed=s.interest.value/s.primaryResult.value*100,nodes=state.fiscalMap.nodes,
 national=nodes.find(n=>n.id==='rec_copart').value+nodes.find(n=>n.id==='tr_nacion').value;
 return `<section class="project-key-readings"><h2>Dos puntos para mirar de cerca.</h2><div><article><p class="eyebrow">INTERESES Y OTROS COSTOS DE LA DEUDA</p><h3>${signedPct((debt.project/factor/debt.current-1)*100)} frente a 2026</h3><p>Después de descontar el supuesto de inflación de 18%. Los intereses consumirían el <b>${fmt(absorbed,1)}%</b> del saldo previo a pagarlos.</p><small>La partida incluye ${short(debt.project-s.interest.value)} de otros costos además de los intereses.</small></article><article><p class="eyebrow">RECURSOS DE ORIGEN NACIONAL PREVISTOS</p><h3>${short(national)} · ${pct(national/s.fiscalRevenue.value*100)}</h3><p>Coparticipación federal y transferencias nacionales. Dentro de estas últimas, ${short(nodes.find(n=>n.id==='tr_csjn').value)} corresponden al acuerdo por la causa de coparticipación.</p><small>Son recursos previstos; no ingresos ya cobrados.</small></article></div>${detailLink('presupuesto-2027','Fuente y alcance de estas cifras')}</section>`;
}
const readingComparisonState=comparisonState;
comparisonState=function(){
 const original=state.comparisons;
 if(state.compareBudgetBase!=='initial'||!state.projectStages)return readingComparisonState();
 const periods=original.periods.map(p=>p.kind!=='budget'?p:{...p,rows:p.rows.map(r=>{
  if(r.id!=='02')return r;
  const value=state.projectStages.totals.initial;
  return {...r,values:{...r.values,budget:value},indicators:{...r.indicators,budgetPc:value/r.population,budgetArea:value/r.areaKm2},budget:{...r.budget,value,status:'Presupuesto aprobado 2026',technicalMetric:'Presupuesto aprobado inicialmente',stage:'approved',cutDate:null,source:publicSourcePages.approved,reference:'Presupuesto 2026',method:'Autorización inicial votada por la Legislatura, antes de las modificaciones de 2026.'}};
 })});
 state.comparisons={...original,periods};
 try{return readingComparisonState();}finally{state.comparisons=original;}
};
document.addEventListener('change',e=>{if(e.target.id==='comparison-budget-base'){state.compareBudgetBase=e.target.value;render();}});
const auditBudgetBenchmark=budgetBenchmarkNote;
budgetBenchmarkNote=function(){return state.view==='history'?'':auditBudgetBenchmark();};
const auditInflationNote=longInflationNote;
longInflationNote=function(){return state.view==='history'?`<p class="note">Estas vistas de CABA usan los mismos precios que el gráfico principal. ${detailLink('historia','Ver el ajuste por inflación')}</p>`:`<p class="note">Todas las provincias usan el mismo índice empalmado provincial y nacional. Por eso CABA puede diferir de su serie propia en Evolución. ${detailLink('provincias','Fuente y criterio común')}</p>`;};
const auditSemesterPanel=semesterAnalysisPanel;
semesterAnalysisPanel=function(){const t=document.createElement('template');t.innerHTML=auditSemesterPanel();const heading=t.content.querySelector('.semester-summary');if(heading){const amount=summaryFor('2026-2').fiscalTotals.d;heading.insertAdjacentHTML('beforebegin',`<p class="period-price-reading">En enero–junio de 2026 se ejecutaron <b>${short(amount)}</b> en los precios del período. Equivalen a <b>${short(state.semesterAnalysis.fiscal.b)}</b> al actualizar por inflación a los precios promedio de abril–junio de 2026.</p>`);}return t.innerHTML;};
const auditIncomePanel=incomeComparisonPanel;
incomeComparisonPanel=function(){const t=document.createElement('template');t.innerHTML=auditIncomePanel();const metrics=t.content.querySelector('.metrics');if(metrics){const amount=state.incomes['2026-2'].total.r;metrics.insertAdjacentHTML('beforebegin',`<p class="period-price-reading">Ingresaron <b>${short(amount)}</b> en enero–junio de 2026, en los precios del período. Equivalen a <b>${short(state.incomeComparison.total.b)}</b> al actualizar por inflación a los precios promedio de abril–junio de 2026.</p>`);}return t.innerHTML;};
function sourcePageFor(href){
 if(/IPCBA|serie-empalmada/i.test(href))return publicSourcePages.ipcba;
 if(/CIFRA|IPC-Provincias/i.test(href))return publicSourcePages.cifra;
 if(/SP_Fi_AX01|serie-aif-idecba/i.test(href))return publicSourcePages.idecba;
 if(/presupuesto-sancionado/i.test(href))return publicSourcePages.approved;
 if(/argentina.gob.ar.*presupuesto|presupuestos.*\.xls/i.test(href))return publicSourcePages.provincial;
 if(/cifra/i.test(href))return publicSourcePages.cifra;
 if(/com3500/i.test(href))return 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Tipos_de_cambios.asp';
 if(/rem.*\.(xlsx|xls)|relevamiento.*expectativas/i.test(href))return 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Relevamiento_Expectativas_de_Mercado.asp';
 if(/indec.*\.(csv|xls|xlsx)/i.test(href))return 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31';
 if(/presupuesto-ejecutado|recursos-\d|caif-context/i.test(href))return publicSourcePages.execution;
 if(/autoridades|funcionarios/i.test(href))return publicSourcePages.authorities;
 return state.view==='compare'?publicSourcePages.provincial:state.view==='history'?publicSourcePages.accounts:publicSourcePages.execution;
}
function cleanCitizenSources(fragment){
 for(const a of [...fragment.querySelectorAll('a[href]')]){
  const href=a.getAttribute('href');if(href.startsWith('#'))continue;
  if(/\.(?:json|csv)(?:[?#]|$)/i.test(href)||a.hasAttribute('download')&&!/\.(?:pdf|xlsx?|zip)(?:[?#]|$)/i.test(href)){a.remove();continue;}
  if(/\.(?:xlsx?|zip|pdf)(?:[?#]|$)/i.test(href)){
   // Keep the official organigram's document link: it has a direct visual purpose.
   if(/organigrama/i.test(href))continue;
   a.href=sourcePageFor(href);a.removeAttribute('download');a.textContent='Consultar la publicación oficial ↗';
  }
 }
 for(const p of fragment.querySelectorAll('p')){
  if(!/\.xlsx|\.csv|solapa.*Análisis|Hoja.*celdas|archivo aportado|aportado por el usuario|benchmark ex ante/.test(p.textContent))continue;
  const link=p.querySelector('[data-method-section],[data-view="method"]')?.outerHTML||detailLink(state.view==='project'?'presupuesto-2027':state.view==='compare'?'provincias':state.view==='history'?'historia':'ejecucion','Fuente y método');
  p.innerHTML=`${state.view==='project'?'Gobierno de la Ciudad · Proyecto de Presupuesto 2027.':state.view==='compare'?'Publicación oficial de la jurisdicción; fechas y alcance identificados en cada ficha.':state.view==='history'?'Cuentas anuales y publicaciones oficiales de presupuesto.':'Dirección General de Contaduría · ejecución presupuestaria del período.'} ${link}`;
 }
 for(const node of fragment.querySelectorAll('p,small,span,strong,summary,th,td,h3,h4,.tile-name,.change-name')){
  if(node.children.length)continue;
  let text=node.textContent;
  if(/Fuente:.*\.xlsx|GCBA.*\.xlsx|solapa.*(?:Análisis|filas)|Hoja.*celdas|archivo aportado|PDF aportado|aportado por el usuario|benchmark ex ante/i.test(text)){
   text=/inflaci[oó]n|IPC|REM/i.test(text)?'El ajuste por inflación y sus fuentes se explican en Metodología.':state.view==='project'?'Gobierno de la Ciudad · Proyecto de Presupuesto 2027.':state.view==='compare'?'Publicación oficial de la jurisdicción; consultá su fecha y alcance.':'Dirección General de Contaduría · publicación presupuestaria del período.';
  }
  if(/^Sin base$/.test(text)){node.title='No hay una partida equivalente en el año de referencia para calcular la variación.';text='Sin comparación';}
  text=text.replace(/\b(?:2026\.02 - Ejecución Presupuestaria\.xlsx|BASE 2T Gestion 2026)\b/g,'Ejecución presupuestaria al segundo trimestre de 2026').replace(/ y descargar| y descargas| y la descarga/g,'').replace(/Otras formas de explorar y descargar/g,'Otras formas de explorar').replace(/datos descargables/g,'datos documentados').replace(/Deuda Pública - Intereses y Gastos|Deuda: intereses y gastos/g,'Deuda pública · intereses y otros gastos').replace(/PDF aportado/g,'documento oficial');
  if(/^(?:Ministerio|Servicios|Ingresos|Recursos|Gastos|Administracion|Jurisdiccion|Sobre la produccion)/.test(text)||node.matches('.tile-name,.change-name'))text=displayName(text);
  if(/^[\s·]*$/.test(text)){node.remove();continue;}node.textContent=text;
 }
 for(const p of fragment.querySelectorAll('p')){
  const hasText=[...p.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim().replace(/[·\s]/g,''));
  if(!p.children.length&&!hasText)p.remove();
 }
}
const auditPolishMarkup=polishMarkup;
polishMarkup=function(html,view){
 const t=document.createElement('template');t.innerHTML=auditPolishMarkup(html,view);
 cleanCitizenSources(t.content);
 if(view==='landing')t.content.querySelector('.fm-method')?.insertAdjacentHTML('afterbegin','<p class="fm-debt-note">La partida de deuda incluye intereses y otros costos; por eso supera el importe de intereses de la cuenta fiscal.</p>');
 if(view==='compare'){
  const c=comparisonState();if(c.p.kind==='budget'){
   t.content.querySelector('.compare-controls')?.insertAdjacentHTML('beforeend',`<label>Presupuesto de CABA<select id="comparison-budget-base"><option value="current" ${state.compareBudgetBase!=='initial'?'selected':''}>Actualizado a junio 2026</option><option value="initial" ${state.compareBudgetBase==='initial'?'selected':''}>Aprobado inicialmente</option></select></label>`);
   const note=t.content.querySelector('.comparison-context');if(note)note.textContent=state.compareBudgetBase==='initial'?'CABA aprobado inicialmente; las provincias muestran su aprobado o prorrogado verificado. Tierra del Fuego: prorrogado.':'CABA incluye modificaciones al 30/06/2026; las provincias muestran su aprobado o prorrogado verificado. Tierra del Fuego: prorrogado.';
  }
 }
 return t.innerHTML;
};
const auditEnhance=enhanceVisuals;
enhanceVisuals=function(view){
 auditEnhance(view);
 if(view==='project'&&state.projectFocus==='Personal'){
  const tile=[...document.querySelectorAll('.project-spending .treemap-tile')].find(n=>/^Personal:/.test(n.dataset.treemapInfo||''));
  if(tile){tile.classList.add('highlight-personal');const heading=document.querySelector('.project-spending h2');heading.insertAdjacentHTML('afterend','<p class="personal-entry">Personal: la partida está resaltada en el gráfico. Tocala para ver su importe y la comparación con 2026.</p>');}
 }
};
