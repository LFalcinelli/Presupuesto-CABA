'use strict';
// The September report publishes separate classifications, not a cross-tab.
const advancePeriod='2026-3';
const quarterData=()=>cache[advancePeriod];
const quarterSource=()=>detailLink('avance-2026','Fuente y método');
const quarterRoutes={summary:'explorar',home:'gastos',income:'ingresos'};
function quarterLink(view){return '#'+quarterRoutes[view]+'?periodo='+advancePeriod;}
const quarterName=r=>displayName(r.name);
const quarterDelta=(now,before,factor)=>Number.isFinite(now)&&before>0?(now/(before*factor)-1)*100:null;
const quarterRate=(a,b)=>b>0?pct(a/b*100):'Sin base';
function quarterTable(headers,rows,caption){
 return `<div class="table-wrap"><table><caption>${E(caption)}</caption><thead><tr>${headers.map(h=>`<th scope="col">${E(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(([name,...amounts])=>`<tr><th scope="row">${E(name)}</th>${amounts.map(x=>`<td class="num">${E(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function quarterTotalsTable(rows,caption){
 return quarterTable(['Concepto','Votado','Vigente','Ejecutado','% del vigente'],rows.map(r=>[quarterName(r),money(r.s),money(r.v),money(r.d),quarterRate(r.d,r.v)]),caption);
}
function quarterCut() {
 return state.quarterWindow==='quarter'
  ? {label:'Julio–septiembre',factor:state.isolatedQuarter.factor}
  : {label:'Enero–septiembre',factor:quarterData().priceComparison.factor};
}
function quarterWindowPicker(){
 const isolated=state.quarterWindow==='quarter';
 return `<div class="tools quarter-window"><label>Período de ejecución<select id="quarter-window"><option value="acc">Enero–septiembre · acumulado</option><option value="quarter" ${isolated?'selected':''}>Julio–septiembre · trimestre</option></select></label></div>`;
}
function quarterAmounts(group,row){
 const code=row.codes.join('.');
 const amounts=group==='income'?state.isolatedQuarter.ingresos[code]:state.isolatedQuarter.gastos[group]?.[code];
 if(state.quarterWindow==='quarter')return amounts??[null,null];
 return [group==='income'?row.r:row.d,row.previous??(group==='objects'||group==='income'?null:amounts?.[2])??null];
}
function quarterChangeDetail(name,now,previous,factor,note=''){
 const rate=quarterDelta(now,previous,factor);
 return `<p>${E(quarterCut().label)} · comparación real con el mismo período de 2025.</p>${quarterTable(['Concepto','Importe'],[
  ['2025 ajustado',previous===null?'Sin dato comparable':money(previous*factor)],
  ['2026',money(now)],['Cambio real',rate===null?'Sin base comparable':signedPct(rate)]
 ],name)}${note?`<p>${E(note)}</p>`:''}${quarterSource()}`;
}
function quarterMap(items,label,options={}){
 const positives=items.filter(row=>row.value>0);
 const negatives=items.filter(row=>row.value<-.01);
 return reviewTreemap(positives,{label,limit:8,height:innerWidth<600?375:440,...options})+
  (negatives.length?`<p class="note">Los rectángulos se calculan sobre importes positivos. Ajustes negativos:</p><ul>${negatives.map(row=>`<li><button class="text-link" ${row.action}>${E(row.name)} · ${money(row.value)}</button></li>`).join('')}</ul>`:'');
}
function quarterComparisons(rows,{title,group,total=null}){
 const {label,factor}=quarterCut();
 const values=rows.flatMap(row=>{
  const [now,previous]=quarterAmounts(group,row);
  if(now===null||!Number.isFinite(previous)||previous<0)return [];
  const difference=now-previous*factor;
  return [{name:quarterName(row),now,previous,difference,note:row.comparisonNote}];
 }).sort((a,b)=>Math.abs(b.difference)-Math.abs(a.difference));
 if(!values.length)return '';
 const rate=total?quarterDelta(...total,factor):null;
 const maps=[['Subas',1],['Bajas',-1]].map(([title,sign])=>{
  const items=values.filter(r=>r.difference*sign>=1).map(r=>({
   name:r.name,value:Math.abs(r.difference),
   action:readingAction(r.name,quarterChangeDetail(r.name,r.now,r.previous,factor,r.note))
  }));
  return items.length?`<div><h3>${title} · ${short(items.reduce((sum,r)=>sum+r.value,0))}</h3>${quarterMap(items,title+' en pesos reales',{height:260})}</div>`:'';
 }).join('');
 return `<section class="chart-panel quarter-comparison"><h2>${E(title)}</h2><p>${label} de 2026 frente al mismo período de 2025.${rate===null?'':` <strong>${signedPct(rate)} real en total.</strong>`} El área representa el cambio en pesos, dentro de las subas o de las bajas comparables.</p>
 <details${rows.length<=8?' open':''}><summary>Explorar las subas y bajas</summary><div class="quarter-map-columns">${maps}</div></details>
 <details><summary>Tabla de cambios reales</summary>${quarterTable(['Concepto','2025 ajustado','2026','Cambio real'],values.map(r=>[r.name,money(r.previous*factor),money(r.now),signedPct(quarterDelta(r.now,r.previous,factor))]),label+' · pesos del período de 2026')}</details>${quarterSource()}</section>`;
}
function quarterTotals(group){
 const f=quarterData().fiscal;
 if(state.quarterWindow==='quarter')return state.isolatedQuarter.total[group];
 return group==='income'?[f.income,f.previousIncome]:[f.expense,f.previousExpense];
}
function quarterBudgetDetail(row,group){
 const [now,previous]=quarterAmounts(group,row);
 const current=group==='income'?row.r:row.d;
 return `${quarterTable(['Concepto','Votado anual','Vigente anual','Acumulado a septiembre','% del vigente'],[[quarterName(row),money(row.s),money(row.v),money(current),quarterRate(current,row.v)]],'Enero–septiembre 2026')}
 ${quarterChangeDetail(quarterName(row),now??current,previous,quarterCut().factor,row.comparisonNote)}<p>Expediente 3561/2026 · p. ${row.page}.</p>`;
}
function quarterCredit(row,name){
 return readingAction(name,quarterTable(['Concepto','Importe'],[
  ['Votado para 2026',money(row.s)],['Vigente al 30/09',money(row.v)],['Gastado a septiembre',money(row.d)],['Parte ejecutada',quarterRate(row.d,row.v)]
 ],name)+quarterSource());
}
function quarterFinancing(financing){
 const amountMap=(rows,key,label)=>quarterMap(rows.map(row=>({
  name:quarterName(row),value:row[key],
  action:readingAction(quarterName(row),quarterTable(['Concepto','Importe'],[
   ['Votado anual',money(row.s)],['Vigente anual',money(row.v)],['Enero–septiembre 2026',money(row[key])]
  ],quarterName(row))+`<p>Expediente 3561/2026 · p. ${row.page}.</p>`+quarterSource())
 })),label,{height:230,width:innerWidth<790?null:Math.min(510,innerWidth/2-100)});
 return `<details><summary>Cómo se financió la Ciudad</summary><p>Estas operaciones se registran por separado de los ingresos y los gastos fiscales.</p><div class="quarter-map-columns">
 <div><h3>Fuentes · ${short(financing.totalSources)}</h3>${amountMap(financing.sources.filter(r=>r.codes.length===1),'r','Fuentes financieras')}</div>
 <div><h3>Aplicaciones · ${short(financing.totalApplications)}</h3>${amountMap(financing.applications,'d','Aplicaciones financieras')}</div>
 </div></details>`;
}
function quarterSummary(){
 const {fiscal:f,fiscalTotals:t,financing,debt}=quarterData();
 const historical=state.homeExecution.samePeriod;
 const balanceSeries=state.homeExecution.series.map(r=>({year:r.year,real:r.points.find(p=>p.quarter===3).real}));
 const real2026=balanceSeries.at(-1).real,real2025=balanceSeries.at(-2).real;
 const [expense,previousExpense]=state.isolatedQuarter.total.expense;
 const [income,previousIncome]=state.isolatedQuarter.total.income;
 const factor=state.isolatedQuarter.factor;
 const budgetParts=quarterRows(quarterData(),'economic',[]);
 const current=budgetParts[0],capital=budgetParts[1];
 const balanceDetail=readingAction('Saldo financiero a septiembre',
  quarterTable(['Año','Saldo por cada $100 ingresados','Saldo real'],historical.map((r,i)=>[String(r.year),pct(r.financialRatio),short(balanceSeries[i+1].real)]),'Enero–septiembre de cada año')+
  '<p>Saldo después de los intereses. Importes reales a precios de julio–septiembre de 2026.</p>'+quarterSource());
 const pending=readingAction('Crédito disponible a septiembre',
  quarterTable(['Clase de gasto','Vigente','Gastado','Disponible'],budgetParts.map(r=>[r.name,money(r.v),money(r.d),money(r.v-r.d)]),'Crédito anual vigente al 30/09/2026')+quarterSource());
 const resultMap=quarterMap([
  {name:'Gasto corriente',value:f.currentExpense,action:quarterCredit(current,'Gasto corriente')},
  {name:'Gasto de capital',value:f.capitalExpense,action:quarterCredit(capital,'Gasto de capital')},
  {name:'Saldo financiero',value:f.financialResult,action:balanceDetail}
 ],'De cada $100 que ingresaron',{height:280});
 const creditMap=quarterMap([
  ...budgetParts.map(r=>({name:r.name+' ejecutado',value:r.d,action:quarterCredit(r,r.name)})),
  {name:'Crédito aún disponible',value:t.v-t.d,action:pending}
 ],'Composición del crédito anual vigente',{height:260});
 return `<section class="panel fiscal-summary quarter-page"><p class="eyebrow">ENERO–SEPTIEMBRE 2026 · CIFRAS PROVISORIAS</p><h1>¿Qué dejaron los ingresos y los gastos?</h1>
 <div class="fiscal-main-result is-surplus"><div><h2>Superávit a septiembre</h2><strong>${short(f.financialResult)}</strong><p>${pct(f.financialRatio)} de los ingresos</p></div><p>El saldo real cayó ${pct(Math.abs((real2026/real2025-1)*100))} frente a 2025 y fue el menor a septiembre en la serie 2023–2026.</p></div>
 <section class="chart-panel quarter-account"><h2>Lo que entró y lo que se gastó</h2><p>Ingresaron <strong>${short(f.income)}</strong> y se gastaron <strong>${short(f.expense)}</strong> en los primeros nueve meses. Abrí los rectángulos para ver el detalle de cada parte.</p>${resultMap}
 <details><summary>Ver la cuenta completa</summary>${quarterTable(['Concepto','Pesos'],[['Ingresos corrientes',f.currentIncome],['Ingresos de capital',f.capitalIncome],['Gasto corriente',f.currentExpense],['Gasto de capital',f.capitalExpense],['Saldo financiero',f.financialResult]].map(([n,v])=>[n,money(v)]),'Enero–septiembre 2026')}<p>El saldo incluye intereses. El expediente agrupa los intereses con otras rentas de la propiedad, por lo que la cuenta de septiembre llega hasta el saldo financiero.</p></details>
 ${quarterFinancing(financing)}</section>
 <section class="chart-panel quarter-credit"><h2>Cuánto del presupuesto se usó</h2><p>Se ejecutó el <strong>${quarterRate(t.d,t.v)}</strong> del crédito anual vigente. Corriente <strong>${quarterRate(current.d,current.v)}</strong> y capital <strong>${quarterRate(capital.d,capital.v)}</strong>.</p>${creditMap}<p>El crédito pasó de ${short(t.s)} votados a ${short(t.v)} al 30 de septiembre.</p></section>
 <section class="chart-panel quarter-pulse"><h2>Qué cambió en el tercer trimestre</h2><div class="quarter-map-columns">
 <article><h3>Ingresos ${signedPct(quarterDelta(income,previousIncome,factor))} real</h3><p>Repuntaron entre julio y septiembre. A lo largo de los primeros nueve meses, cayeron ${pct(Math.abs(quarterDelta(f.income,f.previousIncome,quarterData().priceComparison.factor)))} real.</p><a href="${quarterLink('income')}&lapso=trimestre">Ver ingresos del trimestre →</a></article>
 <article><h3>Gastos ${signedPct(quarterDelta(expense,previousExpense,factor))} real</h3><p>Se devengaron ${short(expense)} en el trimestre. En los primeros nueve meses, el gasto varió ${signedPct(quarterDelta(f.expense,f.previousExpense,quarterData().priceComparison.factor))} real.</p><a href="${quarterLink('home')}&lapso=trimestre">Ver gastos del trimestre →</a></article>
 </div></section>
 <details><summary>Deuda de la Ciudad al cierre de septiembre</summary>${quarterTable(['Fecha','Deuda directa','Aval a AUSA'],debt.map(r=>[r.date==='2025-12-31'?'31/12/2025':'30/09/2026',`US$ ${fmt(r.directUSD/1e6,1)} millones`,`US$ ${fmt(r.ausaGuaranteeUSD/1e6,1)} millones`]),'Dólares al tipo de cambio de cada fecha · informe oficial, p. 138')}</details>
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
function quarterExpenseReading(key,root){
 if(root)return '';
 const data=quarterData(),{factor}=quarterCut();
 const groups=state.isolatedQuarter.gastos;
 const real=(group,code)=>{
  const [now,previous]=groups[group][code];
  return signedPct(quarterDelta(now,previous,state.isolatedQuarter.factor));
 };
 if(key==='functions'&&state.quarterWindow==='quarter'){
  return `<p class="quarter-reading"><strong>Servicios Urbanos ${real('functions','3.9')} y Transporte ${real('functions','4.3')}.</strong> Variación real frente a julio–septiembre de 2025.</p>`;
 }
 if(key==='objects'&&state.quarterWindow==='quarter'){
  const total=quarterTotals('expense')[0];
  const share=(groups.objects['1'][0]+groups.objects['3'][0])/total*100;
  return `<p class="quarter-reading">Personal y servicios contratados concentraron el <strong>${pct(share)}</strong> del gasto desde julio. <strong>Construcciones ${real('objectDetails','4.2')} y Publicidad ${real('objectDetails','3.6')}.</strong> Mantenimiento, reparación y limpieza creció ${real('objectDetails','3.3')} real.</p>`;
 }
 if(key==='jurisdictions'&&state.quarterWindow!=='quarter'){
  const selected=['21','35'].map(code=>data.groups.jurisdictions.find(r=>r.codes[0]===code));
  const combined=field=>selected.reduce((sum,row)=>sum+row[field],0);
  const security=data.groups.jurisdictions.find(r=>r.codes[0]==='29');
  const mobility=data.groups.jurisdictions.find(r=>r.codes[0]==='31');
  return `<p class="quarter-reading">Seguridad ejecutó el <strong>${quarterRate(security.d,security.v)}</strong> de su crédito anual y Movilidad e Infraestructura el <strong>${quarterRate(mobility.d,mobility.v)}</strong>.</p><p class="quarter-reading"><strong>Jefatura de Gabinete y Espacio Público, juntas, ${signedPct(quarterDelta(combined('d'),combined('previous'),factor))} real.</strong> Se leen en conjunto por el cambio en la asignación de programas de higiene.</p>`;
 }
 if(key==='economic'){
  const [current,capital]=quarterRows(data,key,[]);
  return `<p class="quarter-reading">A septiembre, se ejecutó el <strong>${quarterRate(capital.d,capital.v)} del crédito anual de capital</strong> y el <strong>${quarterRate(current.d,current.v)} del corriente</strong>.</p>`;
 }
 return '';
}
function quarterExpenses(){
 const data=quarterData(),t=data.fiscalTotals,key=Object.hasOwn(quarterDimensions,state.spendingComposition)?state.spendingComposition:'functions';
 const path=state.quarterExpensePath||[];
 const root=path.length?quarterRows(data,key,path.slice(0,-1)).find(r=>r.codes.join('.')===path.join('.')):null;
 const rows=quarterRows(data,key,root?path:[]);
 const isolated=state.quarterWindow==='quarter';
 if(path.length&&(!root||!rows.length)){state.quarterExpensePath=[];return quarterExpenses();}
 const measure=state.quarterExpenseMeasure==='v'?'v':'d';
 const group=quarterDimensions[key][Math.min(path.length+1,quarterDimensions[key].length-1)];
 const amount=r=>key==='economic'&&r.codes[0].length===2
  ? data.groups.economic.filter(x=>x.codes[0].startsWith(r.codes[0])).map(x=>quarterAmounts('economic',x)[0]).reduce((sum,n)=>sum+n,0)
  : quarterAmounts(group,r)[0];
 const label=root?quarterName(root):'Composición del gasto';
 const axis=measure==='v'?'Crédito anual vigente al 30/09':quarterCut().label+' · gasto devengado';
 const items=rows.map(r=>{
  const code=r.codes.join('.');
  const drill=key==='economic'?path.length===0:path.length<quarterDimensions[key].length-2;
  return {name:quarterName(r),value:measure==='v'?r.v:amount(r),
   action:drill?`data-quarter-group="${code}"`:readingAction(quarterName(r),quarterBudgetDetail(r,group))};
 });
 const displayed=root?measure==='v'?root.v:items.reduce((sum,item)=>sum+(item.value??0),0):measure==='v'?t.v:quarterTotals('expense')[0];
 const comparisonRows=root?rows:key==='functions'?data.groups.functions:key==='economic'?data.groups.economic:rows;
 const comparisonGroup=!root&&key==='functions'?'functions':group;
 const hasIsolated=key!=='geography';
 const comparison=quarterComparisons(comparisonRows,{title:'¿Qué aumentó y qué bajó?',group:comparisonGroup,total:!root?quarterTotals('expense'):null});
 return `<section class="panel quarter-page"><p class="eyebrow">EJECUCIÓN 2026</p><h1>¿En qué gastó la Ciudad?</h1>
 <section class="chart-panel quarter-expense-map"><h2 id="quarter-expense-heading" tabindex="-1">${E(label)}</h2><div class="tools">
  <label>Ver por<select id="quarter-dimension">${Object.entries(quarterDimensions).map(([id,[name]])=>`<option value="${id}" ${id===key?'selected':''}>${E(name)}</option>`).join('')}</select></label>
  <label>Mostrar<select id="quarter-measure"><option value="d">Lo gastado</option><option value="v" ${measure==='v'?'selected':''}>Presupuesto vigente</option></select></label>
 </div>${hasIsolated?quarterWindowPicker():''}
 <p class="quarter-reading"><strong>${short(displayed)}</strong> · ${E(axis)}.${measure==='d'&&!isolated&&!root?` Se ejecutó el ${quarterRate(t.d,t.v)} del crédito anual vigente.`:''}</p>
 ${root?`<button class="text-link" data-quarter-group="${path.slice(0,-1).join('.')}">← Volver un nivel</button>`:''}
 ${quarterExpenseReading(key,root)}
 ${quarterMap(items,label)}
 ${key==='geography'?'<p>La ubicación indica dónde se registra el gasto y puede beneficiar a toda la Ciudad. La apertura muestra el acumulado a septiembre.</p>':''}
 <details><summary>Importes y ejecución a septiembre</summary>${quarterTotalsTable(rows,label)}</details></section>
 ${comparison}
 <p><a href="${Site.url('data/budget/2026/2026-3.csv')}" download>Descargar gastos y páginas de origen</a> · <a href="#gastos?periodo=2026-2">Detalle cruzado a junio →</a></p></section>`;
}
function quarterIncome(){
 const data=state.incomes[advancePeriod],quarter=quarterData(),path=state.incomePath||[],code=path.join('.');
 const parent=data.rows.find(row=>row.codes.join('.')===code);
 const directChildren=id=>data.rows.filter(row=>row.codes.slice(0,-1).join('.')===id);
 const rows=parent?directChildren(code):[...directChildren('1'),data.rows.find(row=>row.codes.join('.')==='2')];
 const {label,factor}=quarterCut();
 const name=parent?quarterName(parent):'Composición de los ingresos';
 const total=parent?quarterAmounts('income',parent)[0]:quarterTotals('income')[0];
 const items=rows.map(r=>{
  const code=r.codes.join('.');
  return {name:quarterName(r),value:quarterAmounts('income',r)[0],
   action:directChildren(code).length?`data-income="${code}"`:readingAction(quarterName(r),quarterBudgetDetail(r,'income'))};
 });
 const insight=state.quarterWindow==='quarter'
  ? `Entre julio y septiembre, Ingresos Brutos aportó <strong>${pct(quarterAmounts('income',data.rows.find(r=>r.codes.join('.')==='1.11.3.6'))[0]/total*100)}</strong> de los ingresos. El rubro Diferencia de Cambio registró <strong>${short(state.isolatedQuarter.ingresos['1.12.9.1.11'][0])}</strong>.`
  : `Los ingresos representaron el <strong>${quarterRate(data.total.r,data.total.v)}</strong> del cálculo anual vigente. La recaudación tributaria cayó ${pct(Math.abs(quarterDelta(...quarterAmounts('income',quarter.revenueComparison[0]),factor)))} real frente a 2025.`;
 return `<section class="panel quarter-page"><p class="eyebrow">EJECUCIÓN 2026</p><h1 id="quarter-income-heading" tabindex="-1">${parent?E(name):'¿De dónde vienen los ingresos?'}</h1>
 <section class="chart-panel quarter-income-map"><h2>${parent?'Dentro de este rubro':name}</h2>${quarterWindowPicker()}
 <p class="quarter-reading"><strong>${short(total)}</strong> · ${label} de 2026.</p>
 ${parent?`<button class="text-link" data-income="${path.length===2&&path[0]==='1'?'':path.slice(0,-1).join('.')}">← Volver un nivel</button>`:
 `<p class="quarter-reading">${insight}</p><div class="quarter-shortcuts"><button class="text-link" data-income="1.11.3.6">Ingresos Brutos →</button><button class="text-link" data-income="1.12.9.1.11">Diferencia de Cambio →</button></div>`}
 ${rows.length?quarterMap(items,name):parent?quarterBudgetDetail(parent,'income'):''}
 ${rows.length?`<details><summary>Importes del período elegido</summary>${quarterTable(['Rubro','Importe'],rows.map(r=>[quarterName(r),money(quarterAmounts('income',r)[0])]),label+' de 2026')}</details>`:''}</section>
 ${!parent?quarterComparisons(quarter.revenueComparison,{title:'¿Cómo cambió la recaudación?',group:'income',total:quarterTotals('income')}):''}
 <p><a href="${Site.url('data/revenue/income-2026-3.csv')}" download>Descargar ingresos y páginas de origen</a> · ${quarterSource()}</p></section>`;
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
 const execution=period===advancePeriod&&['summary','home','income','detail','financial'].includes(view);
 return Promise.all([
  advanceLoad(view,period),
  ...(needed?[dataFile(advancePeriod).then(d=>{cache[advancePeriod]=d;})]:[]),
  ...(execution?[dataFile('execution/july-september-2026').then(d=>{state.isolatedQuarter=d;})]:[]),
  ...(execution&&['summary','financial'].includes(view)?[dataFile('home-execution').then(d=>{state.homeExecution=d;})]:[])
 ]);
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
 state.quarterWindow=p.get('lapso')==='trimestre'&&dim!=='geography'?'quarter':'acc';
};
syncRoute=function(){
 advanceSync();
 if(!['home','income'].includes(state.view)||state.period!==advancePeriod)return;
 const [route,qs]=location.hash.split('?'),p=new URLSearchParams(qs);
 if(state.view==='home'){
  if(state.quarterExpensePath?.length)p.set('grupo3t',state.quarterExpensePath.join('.'));else p.delete('grupo3t');
  if(state.quarterExpenseMeasure==='v')p.set('monto','vigente');else p.delete('monto');
 }
 if(state.quarterWindow==='quarter')p.set('lapso','trimestre');else p.delete('lapso');
 history.replaceState(null,'',route+'?'+p);
};
document.addEventListener('change',e=>{
 if(e.target.id==='quarter-dimension'){
  state.spendingComposition=e.target.value;state.quarterExpensePath=[];
  if(e.target.value==='geography')state.quarterWindow='acc';
  render();
 }
 if(e.target.id==='quarter-window'){state.quarterWindow=e.target.value;render();}
 if(e.target.id==='quarter-measure'){state.quarterExpenseMeasure=e.target.value;render();}
});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-quarter-group]');if(!b)return;
 state.quarterExpensePath=b.dataset.quarterGroup.split('.').filter(Boolean);
 render().then(()=>{
  const title=document.getElementById('quarter-expense-heading');
  title?.focus({preventScroll:true});
  title?.scrollIntoView({block:'start'});
 });
});

const advanceMethod=methodPage;
methodPage=function(html){
 if(state.methodSection==='avance-2026'){
  const d=quarterData();
  return `<section class="panel method-page"><h1>Cómo leemos el avance de 2026</h1>
  <p>Ingresos cobrados y gastos devengados de enero a septiembre. El vigente es el crédito para todo 2026 al 30/09. Cifras provisorias, sin figurativas ni financiamiento.</p>
  <h2>Fuentes</h2><p>Dirección General de Contaduría · Expediente legislativo 3561/2026 (IF-2026-50891199-GCABA-DGCG). Recursos: pp. 5–13; gasto: pp. 18–80; financiamiento: pp. 84–85; deuda: pp. 137–139.</p><p><a href="${E(d.sourceUrl)}">Informes de Contaduría ↗</a> · <a href="${E(d.previousSources.income)}">Enero–septiembre 2025 ↗</a> · <a href="${E(d.previousSources.expense)}">Gasto 2025 por partida (CSV) ↗</a></p>
  <h2>Cómo comparamos los períodos</h2><p>Para obtener julio–septiembre restamos el acumulado a junio del de septiembre para cada año. Ajustamos los importes de 2025 con el cociente de los promedios mensuales del IPCBA de cada período elegido. En el saldo acumulado ajustamos cada trimestre a los precios promedio de julio–septiembre de 2026 antes de sumarlos. <a href="${E(d.priceComparison.source)}">IPCBA · IDECBA ↗</a></p>
  <h2>Hasta dónde llega el detalle</h2><p>El informe separa función, área y partida en cuadros distintos. Los cruces entre esas aperturas y el detalle de intereses mantienen el último corte que los identifica: junio de 2026.</p>
  <p><a href="${Site.url('data/budget/2026/2026-3.csv')}" download>Descargar gastos (CSV)</a> · <a href="${Site.url('data/revenue/income-2026-3.csv')}" download>Descargar ingresos (CSV)</a></p>
  <a class="text-link" href="${quarterLink('summary')}">Volver a Avance 2026 →</a></section>`;
 }
 const t=document.createElement('template');t.innerHTML=advanceMethod(html);
 t.content.querySelector('.method-index')?.insertAdjacentHTML('beforeend','<a href="#metodologia?seccion=avance-2026">Avance a septiembre de 2026</a>');
 return t.innerHTML;
};
