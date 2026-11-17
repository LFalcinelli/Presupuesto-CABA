'use strict';
// The September report publishes separate classifications, not a cross-tab.
const advancePeriod='2026-3';
const quarterData=()=>cache[advancePeriod];
const quarterSource=()=>detailLink('avance-2026','Fuente y método');
const quarterRoutes={summary:'explorar',home:'gastos',income:'ingresos'};
function quarterLink(view){return '#'+quarterRoutes[view]+'?periodo='+advancePeriod;}
const quarterName=r=>displayName(r.name);
const quarterDelta=(now,before,factor)=>before>0?(now/(before*factor)-1)*100:null;
const quarterRate=(a,b)=>b>0?pct(a/b*100):'Sin base';
function quarterTable(headers,rows,caption){
 return `<div class="table-wrap"><table><caption>${E(caption)}</caption><thead><tr>${headers.map(h=>`<th scope="col">${E(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(([name,...amounts])=>`<tr><th scope="row">${E(name)}</th>${amounts.map(x=>`<td class="num">${E(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function quarterTotalsTable(rows,caption){
 return quarterTable(['Concepto','Votado','Vigente','Ejecutado','% del vigente'],rows.map(r=>[quarterName(r),money(r.s),money(r.v),money(r.d),quarterRate(r.d,r.v)]),caption);
}
function quarterComparisons(rows,{title,kind='expense',data=quarterData(),total=null}={}){
 const factor=data.priceComparison.factor;
 const values=rows.filter(r=>r.previous>0).map(r=>({name:quarterName(r),a:r.previous*factor,b:r[kind==='expense'?'d':'r']}));
 if(!values.length)return '';
 values.sort((a,b)=>Math.abs(b.b-b.a)-Math.abs(a.b-a.a));
 const rate=total?quarterDelta(total.now,total.before,factor):null;
 return `<section class="chart-panel quarter-comparison"><h2>${E(title)}</h2><p>Enero–septiembre de 2026 frente al mismo período de 2025, descontando la inflación.${rate===null?'':` <strong>${signedPct(rate)} en total.</strong>`}</p>${changeDumbbell(values.slice(0,10),{mode:'percent',reference:'Enero–septiembre 2025',project:'Enero–septiembre 2026'})}<details><summary>Ver todos los cambios</summary>${quarterTable(['Concepto','2025 ajustado','2026','Cambio real'],values.map(r=>[r.name,money(r.a),money(r.b),signedPct((r.b/r.a-1)*100)]),'Enero–septiembre · pesos del período de 2026')}</details>${quarterSource()}</section>`;
}
function quarterSummary(){
 const {fiscal:f,fiscalTotals:t,financing,debt}=quarterData(),previous=f.previousFinancialRatio,current=f.financialRatio;
 const max=Math.max(f.income,f.expense);
 return `<section class="panel fiscal-summary quarter-page"><p class="eyebrow">ENERO–SEPTIEMBRE 2026 · CIFRAS PROVISORIAS</p><h1>¿Qué dejaron los ingresos y los gastos?</h1>
 <div class="fiscal-main-result is-surplus"><div><h2>Superávit a septiembre</h2><strong>${short(f.financialResult)}</strong><p>${pct(current)} de los ingresos</p></div><p>En el mismo período de 2025 quedó el ${pct(previous)} de lo recaudado.</p></div>
 <section class="chart-panel"><h2>Lo que entró y lo que se gastó</h2><div class="fiscal-two-bars">${[['Ingresó',f.income,'income'],['Se gastó',f.expense,'expense']].map(([name,value,cls])=>`<div><span>${name}</span><i aria-hidden="true"><b class="${cls}" style="width:${value/max*100}%"></b></i><strong>${short(value)}</strong></div>`).join('')}</div>
 <details><summary>Cuenta completa y financiamiento</summary>${quarterTable(['Concepto','Pesos'],[['Ingresos corrientes',f.currentIncome],['Ingresos de capital',f.capitalIncome],['Gasto corriente',f.currentExpense],['Gasto de capital',f.capitalExpense],['Saldo financiero',f.financialResult],['Fuentes financieras',financing.totalSources],['Aplicaciones financieras',financing.totalApplications]].map(([n,v])=>[n,money(v)]),'Enero–septiembre 2026')}<p>El saldo incluye los intereses. El informe no los separa del rubro «Rentas de la propiedad» (${short(f.propertyExpense)}): no se calcula un saldo primario con ese rubro.</p></details></section>
 <aside class="amplification-overview"><span>Presupuesto anual 2026</span><strong>${short(t.s)} <span aria-hidden="true">→</span> ${short(t.v)}</strong><p>Votado → vigente al 30/09 · <b>${signedPct((t.v/t.s-1)*100)}</b> · ${quarterRate(t.d,t.v)} ejecutado.</p></aside>
 <details><summary>Deuda de la Ciudad al cierre de septiembre</summary>${quarterTable(['Fecha','Deuda directa','Aval a AUSA'],debt.map(r=>[r.date==='2025-12-31'?'31/12/2025':'30/09/2026',`US$ ${fmt(r.directUSD/1e6,1)} millones`,`US$ ${fmt(r.ausaGuaranteeUSD/1e6,1)} millones`]),'Dólares al tipo de cambio de cada fecha · fuente: informe oficial, p. 138')}</details>
 <div class="fiscal-next"><button class="small-btn" data-view="home">Explorar gastos →</button><button class="small-btn" data-view="income">Explorar ingresos →</button></div>
 <p>${quarterSource()} · <a href="#explorar?periodo=2026-2">Consultar el corte de junio →</a></p></section>`;
}
const quarterDimensions={
 functions:['Finalidad y función','purposes','functions'],
 jurisdictions:['Áreas y programas','jurisdictions','units','programs'],
 objects:['Incisos y partidas','objects','objectDetails'],
 economic:['Gasto corriente y de capital','economic'],
 geography:['Ubicación presupuestaria','geography']
};
function quarterRows(data,key,path){
 const dims=quarterDimensions[key].slice(1),idx=Math.min(path.length,dims.length-1);
 if(key==='economic'){
  const parts=['21','22'].map((code,i)=>{
   const matched=data.groups.economic.filter(r=>r.codes[0].startsWith(code));
   return {...Object.fromEntries(['s','v','d','previous'].map(k=>[k,matched.reduce((s,r)=>s+(r[k]??0),0)])),name:i?'Gasto de capital':'Gasto corriente',codes:[code]};
  });
  return path.length?data.groups.economic.filter(r=>r.codes[0].startsWith(path[0])):parts;
 }
 return data.groups[dims[idx]].filter(r=>r.codes.join('.').startsWith(path.length?path.join('.')+'.':''));
}
function quarterExpenses(){
 const data=quarterData(),t=data.fiscalTotals,key=Object.hasOwn(quarterDimensions,state.spendingComposition)?state.spendingComposition:'functions';
 const path=state.quarterExpensePath||[],k=state.quarterExpenseMeasure==='v'?'v':'d';
 let rows=quarterRows(data,key,path);
 if(!rows.length){state.quarterExpensePath=[];return quarterExpenses();}
 const drill=key==='economic'?path.length===0:path.length<quarterDimensions[key].length-2;
 const root=path.length?quarterRows(data,key,path.slice(0,-1)).find(r=>r.codes.join('.')===path.join('.')):null;
 const label=root?quarterName(root):'Composición del gasto';
 const children=r=>key==='functions'&&!path.length&&r[k]>t[k]/2?quarterRows(data,key,r.codes).map(c=>({name:quarterName(c),value:c[k],action:readingAction(quarterName(c),quarterTotalsTable([c],quarterName(c)))})):null;
 const item=r=>({name:quarterName(r),value:r[k],children:children(r),action:drill?`data-quarter-group="${r.codes.join('.')}"`:readingAction(quarterName(r),quarterTotalsTable([r],quarterName(r)))});
 const treemap=reviewCompositionBars(rows.map(item),{label,shareTotal:root?.[k]??t[k]});
 const compRows=root?rows:key==='functions'?data.groups.functions:rows;
 return `<section class="panel quarter-page"><p class="eyebrow">ENERO–SEPTIEMBRE 2026</p><h1>¿En qué gastó la Ciudad?</h1>
 <div class="metrics"><div class="metric"><label>Gasto ejecutado</label><strong>${short(t.d)}</strong></div><div class="metric"><label>Presupuesto anual vigente</label><strong>${short(t.v)}</strong></div><div class="metric"><label>Parte ejecutada</label><strong>${quarterRate(t.d,t.v)}</strong></div></div>
 <section class="chart-panel"><h2>${E(label)}</h2><div class="tools"><label>Ver por<select id="quarter-dimension">${Object.entries(quarterDimensions).map(([id,[name]])=>`<option value="${id}" ${id===key?'selected':''}>${E(name)}</option>`).join('')}</select></label><label>Mostrar<select id="quarter-measure"><option value="d">Lo gastado</option><option value="v" ${k==='v'?'selected':''}>El presupuesto vigente</option></select></label></div>
 ${root?`<button class="text-link" data-quarter-group="${path.slice(0,-1).join('.')}">← Volver un nivel</button>`:''}${treemap}
 ${key==='geography'?'<p>La ubicación indica dónde se registra el gasto; puede beneficiar a toda la Ciudad.</p>':''}
 <details><summary>Importes y ejecución</summary>${quarterTotalsTable(rows,label)}</details></section>
 ${quarterComparisons(compRows,{title:'¿Qué aumentó y qué bajó?',total:!path.length?{now:t.d,before:data.fiscal.previousExpense}:null})}
 <p><a href="${Site.url('data/budget/2026/2026-3.csv')}" download>Descargar gastos y páginas de origen</a> · <a href="#gastos?periodo=2026-2">Detalle cruzado a junio →</a></p></section>`;
}

function quarterIncomePanel(){
 const data=quarterData(),f=data.fiscal;
 return quarterComparisons(data.revenueComparison,{title:'¿Cómo cambió la recaudación?',kind:'revenue',total:{now:f.income,before:f.previousIncome}});
}

function quarterArea(area){
 const r=quarterData()?.groups.jurisdictions.find(r=>r.codes[0]===area.code);
 return r?{...area,initial2026:r.s,current2026:r.v,executed2026:r.d}:area;
}

function quarterAreaLink(code){
 return quarterLink('home')+'&composicion=jurisdictions&grupo3t='+encodeURIComponent(code);
}

const advanceLoad=ensureViewData;
ensureViewData=async function(view,period){
 const needed=period===advancePeriod&&['summary','home','income','detail','financial','structure'].includes(view)||['project','method'].includes(view);
 return Promise.all([advanceLoad(view,period),...(needed?[dataFile(advancePeriod).then(d=>{cache[advancePeriod]=d;})]:[])]);
};
const advanceRead=readRoute,advanceSync=syncRoute;
readRoute=function(){
 advanceRead();
 if(state.period!==advancePeriod)return;
 const p=new URLSearchParams(location.hash.split('?')[1]||'');
 const grp=p.get('grupo3t');
 const dim=p.get('composicion');state.spendingComposition=Object.hasOwn(quarterDimensions,dim)?dim:'functions';
 state.quarterExpensePath=/^\d+(?:\.\d+){0,1}$/.test(grp||'')?grp.split('.'):[];
 state.quarterExpenseMeasure=p.get('monto')==='vigente'?'v':'d';
};
syncRoute=function(){
 advanceSync();
 if(state.view!=='home'||state.period!==advancePeriod)return;
 const [route,qs]=location.hash.split('?'),p=new URLSearchParams(qs);
 if(state.quarterExpensePath?.length)p.set('grupo3t',state.quarterExpensePath.join('.'));else p.delete('grupo3t');
 if(state.quarterExpenseMeasure==='v')p.set('monto','vigente');else p.delete('monto');
 history.replaceState(null,'',route+'?'+p);
};
document.addEventListener('change',e=>{
 if(e.target.id==='quarter-dimension'){state.spendingComposition=e.target.value;state.quarterExpensePath=[];render();}
 if(e.target.id==='quarter-measure'){state.quarterExpenseMeasure=e.target.value;render();}
});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-quarter-group]');if(!b)return;
 state.quarterExpensePath=b.dataset.quarterGroup.split('.').filter(Boolean);render();
});

const advanceMethod=methodPage;
methodPage=function(html){
 if(state.methodSection==='avance-2026'){
  const d=quarterData();
  return `<section class="panel method-page"><h1>Cómo leemos el avance de 2026</h1>
  <p>Ingresos cobrados y gastos devengados de enero a septiembre. El vigente es el crédito para todo 2026 al 30/09. Cifras provisorias, sin figurativas ni financiamiento.</p>
  <h2>Fuentes</h2><p>Dirección General de Contaduría · Expediente legislativo 3561/2026 (IF-2026-50891199-GCABA-DGCG). Recursos: pp. 5–13; gasto: pp. 18–80; financiamiento: pp. 84–85; deuda: pp. 137–139.</p><p><a href="${E(d.sourceUrl)}">Informes de Contaduría ↗</a> · <a href="${E(d.previousSources.income)}">Enero–septiembre 2025 ↗</a> · <a href="${E(d.previousSources.expense)}">Gasto 2025 por partida (CSV) ↗</a></p>
  <h2>Comparación de los primeros nueve meses</h2><p>Ajustamos los pesos de enero–septiembre de 2025 con el cociente entre los promedios del IPCBA de los mismos meses: ${fmt(d.priceComparison.averageIndex['2026'],2)} ÷ ${fmt(d.priceComparison.averageIndex['2025'],2)}. Esto no cambia el supuesto para el proyecto 2027. <a href="${E(d.priceComparison.source)}">IPCBA · IDECBA ↗</a></p>
  <h2>Hasta dónde llega el detalle</h2><p>El informe separa función, área y partida en cuadros distintos. Los cruces entre esas aperturas y el detalle de intereses mantienen el último corte que los identifica: junio de 2026.</p>
  <p><a href="${Site.url('data/budget/2026/2026-3.csv')}" download>Descargar gastos (CSV)</a> · <a href="${Site.url('data/revenue/income-2026-3.csv')}" download>Descargar ingresos (CSV)</a></p>
  <a class="text-link" href="${quarterLink('summary')}">Volver a Avance 2026 →</a></section>`;
 }
 const t=document.createElement('template');t.innerHTML=advanceMethod(html);
 t.content.querySelector('.method-index')?.insertAdjacentHTML('beforeend','<a href="#metodologia?seccion=avance-2026">Avance a septiembre de 2026</a>');
 return t.innerHTML;
};
