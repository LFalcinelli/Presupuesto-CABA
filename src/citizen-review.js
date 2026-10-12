'use strict';
// A common comparison base across the 2027 views, without altering datasets.
const reviewLoad=ensureViewData;
const reviewCitizenLanguage=citizenLanguage;
citizenLanguage=function(html,view){const result=reviewCitizenLanguage(html,view);return view==='method'?result:result.split(/(<[^>]*>)/).map(part=>part.startsWith('<')?part:citizenVocabularyText(part)).join('');};
const reviewExplorerShell=explorerShell;
explorerShell=function(){reviewExplorerShell();citizenGlossaryMarkup(document.querySelector('#explorer-controls'));};
ensureViewData=async function(view,period){
 await reviewLoad(view,period);
 if(view==='landing')state.projectStages=await dataFile('stages-2027');
 if(view==='project')await Promise.all([dataFile('2026-2').then(d=>state.reviewBudget=d),dataFile('income-2026-2').then(d=>state.reviewIncome=d)]);
};
const reviewReadRoute=readRoute,reviewSyncRoute=syncRoute;
readRoute=function(){
 reviewReadRoute();const q=new URLSearchParams(location.hash.split('?')[1]||'');
 if(state.view==='project')state.projectBase=state.governmentBase=q.get('base')==='current'?'current':'initial';
 state.compareBudgetBase=q.get('presupuesto')==='ampliado'?'current':q.get('presupuesto')==='inicial'?'initial':state.compareBudgetBase||'initial';
 if(state.view==='compare'&&!q.has('presupuesto'))state.compareBudgetBase='initial';
 state.glossaryTopic=state.view==='explained'?q.get('tema'):null;
};
syncRoute=function(){
 if(state.view==='project')state.governmentBase=state.projectBase||state.governmentBase||'initial';
 reviewSyncRoute();const q=new URLSearchParams(location.hash.split('?')[1]||'');
 if(state.view==='project'){q.set('base',state.projectBase||'initial');history.replaceState(null,'','#proyecto-2027?'+q);}
 if(state.view==='compare'){q.set('presupuesto',state.compareBudgetBase==='current'?'ampliado':'inicial');history.replaceState(null,'','#comparar?'+q);}
 if(state.view==='explained'&&state.glossaryTopic)history.replaceState(null,'','#presupuesto-explicado?tema='+state.glossaryTopic);
};
function citizenBaseControl(id='project-review-base'){
 return `<div class="review-base-control"><label>Comparar con<select id="${id}"><option value="initial" ${state.projectBase!=='current'?'selected':''}>Presupuesto votado 2026</option><option value="current" ${state.projectBase==='current'?'selected':''}>Presupuesto ampliado a junio 2026</option></select></label><p>Variaciones descontando la inflación supuesta del 18%. ${glossaryLink('inflacion','Cómo se calcula')}</p></div>`;
}
function glossaryLink(topic,label){return `<a class="text-link" href="#presupuesto-explicado?tema=${topic}" data-glossary="${topic}">${label} ↗</a>`;}
function reviewReference(key,row){
 if(state.projectBase==='current')return row.reference;
 if(['purposes','objects'].includes(key))return state.projectStages.groups[key].find(r=>classificationName(r.name)===classificationName(row.name))?.initial;
 if(['functions','jurisdictions','economic'].includes(key)){
  const dim={functions:7,jurisdictions:1,economic:9}[key],rows=state.reviewBudget.rows.filter(r=>r.fiscal);
  return rows.filter(r=>key==='economic'?r.codes[9].startsWith(row.id==='current'?'21':'22'):key==='jurisdictions'?r.codes[1]===row.jurisdictionCode:r.codes[7]===row.id).reduce((s,r)=>s+r.s,0);
 }
 if(['revenue','taxRevenue'].includes(key))return state.reviewIncome.rows.find(r=>r.codes.join('.')===row.referenceCode)?.s;
 return null;
}
function reviewComparisonRows(key,selected=null){return (state.projectComparison.groups[key]||[]).filter(r=>!selected||r.purpose===selected).map(r=>({name:displayName(r.name),a:reviewReference(key,r),b:r.project/state.projectComparison.deflator.factor,original:r.project}));}
const reviewOverview=projectOverview;
projectOverview=function(){
 const t=document.createElement('template');t.innerHTML=reviewOverview();
 const totals=state.projectStages.totals,factor=state.projectComparison.deflator.factor,rates=['initial','current'].map(b=>(totals.project/factor/totals[b]-1)*100);
 const cards=t.content.querySelectorAll('.project-reading-cards article');
 cards[0].innerHTML=`<span>Presupuesto solicitado</span><strong>≈ $ ${fmt(totals.project/1e12,1)} billones</strong><details class="review-exact"><summary>Importe exacto</summary>${money(totals.project)}</details>`;
 cards[1].innerHTML=`<span>Frente al presupuesto votado 2026</span><strong class="variation-up">▲ ${signedPct(rates[0])}</strong><small>Descontando la inflación supuesta del 18%; frente al ampliado a junio: <b>${signedPct(rates[1])}</b>.</small>${annualPriceScenario(true)}`;
 cards[2].innerHTML=`<span>Saldo final previsto</span><strong>${short(state.project.summary.financialResult.value)}</strong><small>Casi equilibrio, después de pagar los intereses.</small>`;
 return citizenBaseControl()+t.innerHTML;
};
projectSummary=projectOverview;
const reviewKeyReadings=projectKeyReadings;
projectKeyReadings=function(){
 const t=document.createElement('template');t.innerHTML=reviewKeyReadings();const card=t.content.querySelector('article'),r=reviewComparisonRows('purposes').find(r=>/deuda/i.test(r.name));
 card.querySelector('h3').innerHTML=`${variationLabel((r.b/r.a-1)*100)} frente al ${state.projectBase==='current'?'ampliado':'votado'} 2026`;
 const absorbed=state.project.summary.interest.value/state.project.summary.primaryResult.value*100;
 card.querySelector('p:not(.eyebrow)').innerHTML=`Los intereses se llevarían prácticamente todo (<b data-precise-share="${absorbed}">${fmt(absorbed,1)}%</b>) el saldo previo a pagarlos.`;
 return t.innerHTML;
};
const reviewAnnualScenario=annualPriceScenario;
annualPriceScenario=function(compact=false){const text=reviewAnnualScenario(false).replace('class="annual-price-scenario"','class="annual-price-description"');return text?`<details class="annual-price-scenario"><summary>Por qué cambia la estimación</summary>${text}</details>`:'';};
function variationLabel(value){return Number.isFinite(value)?`<span class="variation-${value<0?'down':'up'}">${value>0?'▲ ':value<0?'▼ ':''}${signedPct(value)}</span>`:'Sin comparación';}
projectCompare=function(){
 const key=state.projectCompareDimension==='objects'?'objects':'purposes',rows=reviewComparisonRows(key),mode=state.projectChangeMode||'amount',nominal=state.projectPrices==='nominal';
 if(nominal)rows.forEach(r=>r.b=r.original);
 rows.sort((a,b)=>Math.abs(b.b-b.a)-Math.abs(a.b-a.a));
 const d=state.projectStages,base=state.projectBase||'initial',rate=(d.totals.project/(nominal?1:state.projectComparison.deflator.factor)/d.totals[base]-1)*100;
 return `${projectStageJourney()}<section class="stage-comparison"><h2>¿Qué destinos suben o bajan?</h2><div class="tools"><label>Comparar con<select id="project-compare-base"><option value="initial" ${base==='initial'?'selected':''}>Presupuesto votado 2026</option><option value="current" ${base==='current'?'selected':''}>Presupuesto ampliado a junio 2026</option></select></label><label>Comparar destinos<select id="project-compare-dimension"><option value="purposes">Para qué se usa</option><option value="objects" ${key==='objects'?'selected':''}>Qué se paga</option></select></label>${comparisonToggle(mode,'data-project-change-mode',nominal)}</div><p class="project-comparison-result">${nominal?'Cambio sin descontar inflación':'Cambio descontando la inflación'}: <strong>${variationLabel(rate)}</strong></p>${changeDumbbell(rows,{mode,nominal,reference:base==='current'?'2026 ampliado':'2026 votado',project:nominal?'2027 propuesto':'2027 ajustado'})}<details class="exact-values"><summary>Importes exactos y otras opciones</summary><label>Mirar los valores<select id="project-compare-prices"><option value="real" ${!nominal?'selected':''}>Descontando inflación supuesta de 18%</option><option value="nominal" ${nominal?'selected':''}>Sin descontar inflación</option></select></label><div class="table-wrap"><table><thead><tr><th>Destino</th><th>2026 votado</th><th>2026 ampliado a junio</th><th>Proyecto 2027</th></tr></thead><tbody>${d.groups[key].map(r=>`<tr><th>${E(r.name)}</th><td>${money(r.initial)}</td><td>${money(r.current)}</td><td>${money(r.project)}</td></tr>`).join('')}</tbody></table></div></details>${detailLink('presupuesto-2027','Fuentes y supuesto de inflación')}</section>`;
};
projectBudgetChanges=function(key,kind='expense'){
 const selected=kind==='expense'?state.projectPurpose:null,rows=reviewComparisonRows(key,selected).sort((a,b)=>Math.abs(b.b-b.a)-Math.abs(a.b-a.a));if(!rows.length)return '';
 const mode=state[kind==='expense'?'expenseChangeMode':'revenueChangeMode']||'percent',a=rows.reduce((s,r)=>s+r.a,0),b=rows.reduce((s,r)=>s+r.b,0);
 return `<section class="budget-real-changes" data-budget-changes="${kind}"><p class="eyebrow">PROYECTO 2027 FRENTE A 2026</p><h2>${kind==='expense'?'Qué destinos suben o bajan, descontando la inflación':'Cómo cambiarían los ingresos, descontando la inflación'}</h2><div class="real-change-reading"><strong>${variationLabel((b/a-1)*100)}</strong><p>${selected?E(displayName(selected)):kind==='expense'?'Gasto de la selección':'Ingresos de la selección'} frente al presupuesto ${state.projectBase==='current'?'ampliado a junio':'votado'} 2026.</p></div><label>Mostrar el cambio<select id="budget-change-mode" data-budget-kind="${kind}"><option value="percent" ${mode==='percent'?'selected':''}>En porcentaje</option><option value="amount" ${mode==='amount'?'selected':''}>En pesos, descontando la inflación</option></select></label>${changeDumbbell(rows,{mode,reference:state.projectBase==='current'?'2026 ampliado':'2026 votado',project:'2027 ajustado por inflación'})}<details class="exact-values"><summary>Ver los presupuestos y el cambio real</summary><div class="table-wrap"><table><thead><tr><th>Destino u origen</th><th>2026</th><th>Proyecto 2027</th><th>Cambio real</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${E(r.name)}</th><td>${money(r.a)}</td><td>${money(r.original)}</td><td>${r.a?variationLabel((r.b/r.a-1)*100):'Sin comparación'}</td></tr>`).join('')}</tbody></table></div></details><p class="note">${key==='jurisdictions'?'Infraestructura y Movilidad e Infraestructura son la misma jurisdicción (31). ':''}Se comparan presupuestos anuales; la ejecución puede ser distinta. ${detailLink('presupuesto-2027','Fuente y método')}</p></section>`;
};
const reviewExpenses=projectExpenses,reviewRevenue=projectRevenue;
projectExpenses=function(){return citizenBaseControl()+reviewExpenses();};
projectRevenue=function(){return citizenBaseControl()+reviewRevenue();};
const reviewDetail=compositionDetail;
compositionDetail=function(row,denominator,options){
 const original=reviewDetail(row,denominator,options);if(state.view!=='project')return original;
 const key=Object.keys(state.projectComparison.groups).find(k=>state.projectComparison.groups[k].some(r=>r.name===row.name));if(!key)return original;
 const r=reviewComparisonRows(key).find(r=>classificationName(r.name)===classificationName(row.name));if(!r||!Number.isFinite(r.a))return original;
 const t=document.createElement('template');t.innerHTML=original;const heading=t.content.querySelector('h3');if(heading){heading.textContent='Frente al presupuesto '+(state.projectBase==='current'?'ampliado a junio':'votado')+' 2026';heading.nextElementSibling.innerHTML=variationLabel((r.b/r.a-1)*100)+' descontando la inflación supuesta del 18%.';t.content.querySelector('.composition-comparison dt').textContent=state.projectBase==='current'?'2026 ampliado a junio':'2026 votado';t.content.querySelector('.composition-comparison dd').textContent=money(r.a);}
 return t.innerHTML;
};
document.addEventListener('change',e=>{
 if(['gov-base','project-compare-base','project-review-base'].includes(e.target.id)){e.stopImmediatePropagation();state.projectBase=state.governmentBase=e.target.value;render();}
},true);
document.addEventListener('click',e=>{const link=e.target.closest('[data-glossary]');if(!link)return;e.preventDefault();e.stopImmediatePropagation();state.view='explained';state.glossaryTopic=link.dataset.glossary;state.perCapitaGuide=state.glossaryTopic==='por-habitante';state.navigationRequested=true;render();},true);

const reviewFiscalFlow=fiscalFlow;
fiscalFlow=function(d){
 const t=document.createElement('template');t.innerHTML=reviewFiscalFlow(d);
 const steps=t.content.querySelector('.fiscal-result-steps'),final=steps.querySelector('.is-final');final.remove();
 const folded=document.createElement('details');folded.className='fiscal-steps-disclosure';folded.innerHTML='<summary>Ver la cuenta paso a paso</summary><p>Estos saldos son pasos de una misma cuenta; no se suman entre sí.</p>';steps.replaceWith(folded);folded.append(steps);
 const visible=document.createElement('div');visible.className='fiscal-result-steps';visible.append(final);folded.before(visible);t.content.querySelector('.flow-account-note')?.remove();
 if(d.project){const f=t.content.querySelector('.flow-financing'),s=state.project.summary;
  f.innerHTML=`<h3>Cómo se cubren los vencimientos y otras operaciones.</h3><p class="fiscal-financing-reading">Se prevén ${short(d.financialSources)} de financiamiento para cubrir ${short(d.financialApplications)} de vencimientos y otras operaciones financieras. El saldo final completa la diferencia.</p><details><summary>Qué incluye este financiamiento</summary><p>${short(s.debtAndOtherLiabilities.value)} de endeudamiento e incremento de otros pasivos y ${short(s.financialInvestmentDecrease.value)} de disminución de inversión financiera.</p><p>Se aplicarían ${short(s.debtAmortizationAndOtherLiabilities.value)} a amortizar deuda y reducir otros pasivos, y ${short(s.financialInvestmentIncrease.value)} a incrementar inversión financiera.</p><p>Estos totales no equivalen íntegramente a deuda nueva ni a vencimientos. Fuente: Planilla 16, página 190 del proyecto general.</p></details>`;
 }
 return t.innerHTML;
};
function reviewCompositionBars(items,{label='Composición del total',shareTotal}={}){
 const rows=items.filter(r=>r.value>0).slice().sort((a,b)=>b.value-a.value),total=shareTotal||rows.reduce((s,r)=>s+r.value,0),major=rows.filter(r=>r.value/total>=.01),minor=rows.filter(r=>r.value/total<.01);
 const row=(r,child=false)=>{
  let action=r.action;
  if(!action){const area=state.view==='project'&&state.projectDimension==='jurisdictions'?state.areaReports?.areas.find(a=>classificationName(a.name)===classificationName(r.name)):null;action=area?`data-area-report="${area.id}"`:readingAction(displayName(r.name),compositionDetail(r,total,{label}));}
  return `<button class="review-bar" ${action} aria-label="${E(displayName(r.name))}: ${governmentShare(r.value,total)} del total, ${money(r.value)}"><span class="review-bar-name">${E(displayName(r.name))}</span><span class="review-bar-value"><b>${governmentShare(r.value,total)}</b><small>${short(r.value)}</small></span><span class="review-bar-track" aria-hidden="true"><i style="width:${r.value/total*100}%;${r.color?'background:'+r.color:''}"></i></span></button>`;
 };
 const paint=r=>`<div class="review-bar-group ${r.children?.length?'production-group':''}">${row(r)}${r.children?.length?`<div class="review-bar-children"><p>Dentro de este grupo, como parte del total:</p>${r.children.filter(c=>c.value/total>=.01).sort((a,b)=>b.value-a.value).map(c=>row(c,true)).join('')}${r.children.some(c=>c.value/total<.01)?`<details><summary>Otros impuestos del grupo · ${governmentShare(r.children.filter(c=>c.value/total<.01).reduce((s,c)=>s+c.value,0),total)}</summary>${r.children.filter(c=>c.value/total<.01).map(c=>row(c,true)).join('')}</details>`:''}</div>`:''}</div>`;
 return `<figure class="review-composition"><figcaption>${E(label)}</figcaption><div class="review-bars">${major.map(paint).join('')}${minor.length?`<details class="review-other"><summary>Otros · ${governmentShare(minor.reduce((s,r)=>s+r.value,0),total)}</summary>${minor.map(paint).join('')}</details>`:''}</div></figure>`;
}
const reviewTreemap=compositionTreemap;
const reviewExecutionObservation=executionObservation;
executionObservation=function(r){return reviewExecutionObservation(r).replace(`<span>${money(r.real)}</span>`,`<span title="${money(r.real)}">${short(r.real)}</span>`).replace(`Importe original: ${money(r.nominal)}`,`Importe original: <span title="${money(r.nominal)}">${short(r.nominal)}</span>`);};
compositionTreemap=function(items,options={}){
 const html=reviewTreemap(items,options);
 if((state.view==='home'||state.view==='project'&&state.projectTab==='expenses')&&html.includes('tile-no-label'))return reviewCompositionBars(items,options);
 return html;
};
const reviewComparisonState=comparisonState;
comparisonState=function(){
 if(['budgetArea','expenseArea'].includes(state.compareIndicator))state.compareIndicator='budgetPc';
 const c=reviewComparisonState();return {...c,d:{...c.d,indicators:c.d.indicators.filter(i=>!['budgetArea','expenseArea'].includes(i.id))}};
};
const comparisonPrimaryGroups={Tamaño:['budgetPc','expensePc'], 'Cómo se financia':['localTax','balance'], 'En qué se gasta':['personnel','capital','healthPc','educationPc'], 'Empleo público':['employeesRate']};
const reviewExplained=extraViews.explained;
const citizenQuestions=[
 ['presupuesto','¿Qué es el presupuesto?','Es la autorización para obtener y usar recursos públicos durante un año. El Ejecutivo presenta un proyecto y la Legislatura lo trata y vota. Durante el año puede modificarse; por eso conviene distinguir la autorización del gasto ejecutado.'],
 ['etapas','¿Qué significan votado, ampliado y ejecutado?','El presupuesto votado es el punto de partida aprobado por la Legislatura. El ampliado incluye las ampliaciones y demás modificaciones registradas al corte; también puede haber reducciones o cambios entre áreas. El gasto ejecutado es lo que ya generó una obligación de pago, aunque todavía no se haya pagado.'],
 ['ejecutado','¿Gasto ejecutado significa dinero ya pagado?','No necesariamente: significa que el Estado reconoció una obligación de pago. Puede incluir pagos pendientes. En junio se muestran seis meses de ejecución y se los distingue del presupuesto autorizado para todo el año.'],
 ['funcionamiento','¿Qué diferencia hay entre funcionamiento e inversión?','El funcionamiento sostiene los servicios cotidianos: sueldos, insumos, servicios contratados y transferencias corrientes. La inversión financia obras, equipos y otros gastos de capital. En las fichas de áreas, el bloque de personal, insumos y servicios se separa de las transferencias; el detalle explica esa apertura.'],
 ['transferencias','¿Qué son las transferencias y por qué a veces no se sabe a quién van?','Son recursos que el Estado entrega a otras entidades o personas. Pueden financiar escuelas privadas, transporte, asistencia u otros destinos. Algunas planillas sólo identifican el programa o una categoría de receptor; cuando no publican un destinatario único, el sitio lo aclara.'],
 ['servicios','¿Qué son los servicios contratados?','Incluyen luz, agua y gas; limpieza y mantenimiento; recolección; alquileres; consultorías; publicidad y otros servicios que el Estado contrata a terceros. El nombre oficial es “servicios no personales”. Un aumento de esta partida no informa por sí solo cuántos contratos o proveedores hay.'],
 ['inflacion','¿Por qué se usa una inflación supuesta del 18%?','La comparación de presupuestos 2027 y 2026 divide el proyecto 2027 por 1,18 para descontar una inflación supuesta del 18%. Es un supuesto para estimar poder de compra, no inflación ya observada ni un dato oficial de precios publicado. La serie histórica usa precios promedio anuales y puede dar otro resultado. <a href="#metodologia?seccion=presupuesto-2027" data-method-section="presupuesto-2027">Ver el cálculo y su alcance ↗</a>'],
 ['coparticipacion','¿Qué es la coparticipación federal?','Es la parte de los impuestos nacionales que se distribuye a las jurisdicciones. Se distingue de los impuestos que recauda la propia Ciudad. Las transferencias nacionales se muestran por separado para no confundir fuentes de recursos.'],
 ['rentas','¿Qué son los intereses y rentas cobrados?','Son ingresos por activos y derechos de propiedad del Estado, como intereses u otras rentas. El clasificador oficial los llama “rentas de la propiedad”. No son los intereses que la Ciudad paga por su deuda, que aparecen entre los gastos.'],
 ['clasificaciones','¿Puedo sumar las distintas clasificaciones del gasto?','No: finalidad, jurisdicción e inciso son distintas miradas sobre el mismo dinero. La finalidad cuenta para qué se usa; la jurisdicción, quién lo administra; el inciso, qué se paga. Sumarlas entre sí duplicaría el presupuesto.'],
 ['saldo','¿Qué es el déficit o el superávit?','Es la diferencia entre los ingresos y los gastos del mismo período. Si los gastos superan los ingresos hay déficit; si queda dinero hay superávit. El saldo final incluye los intereses y mantiene separadas las operaciones de financiamiento.']
];
extraViews.explained=function(){
 if(state.perCapitaGuide)return reviewExplained();
 return `<section class="panel reading-page review-glossary"><p class="eyebrow">PRESUPUESTO EXPLICADO</p><h1>El presupuesto, en palabras simples.</h1><p>Una guía para entender lo que se propone, se vota y se gasta.</p>${glossaryLink('por-habitante','Entender el presupuesto por habitante')}${citizenQuestions.map(([id,title,text],i)=>`<details id="pregunta-${id}" ${state.glossaryTopic===id||!state.glossaryTopic&&i===0?'open':''}><summary>${title}</summary><p>${text}</p></details>`).join('')}<button class="primary-btn" data-view="landing">Volver al inicio ↗</button></section>`;
};
const reviewMarkup=polishMarkup;
polishMarkup=function(html,view){
 const t=document.createElement('template');t.innerHTML=reviewMarkup(html,view);
 for(const node of t.content.querySelectorAll('[data-precise-share]'))node.textContent=fmt(Number(node.dataset.preciseShare),1)+'%';
 if(view==='landing'){
  const c=t.content.querySelector('.hero-current');c.innerHTML=`<p>Presupuesto 2026</p><strong><span class="review-budget-stage">Votado $ ${fmt(state.projectStages.totals.initial/1e12,1)} billones</span><span class="review-budget-stage">Ampliado a junio $ ${fmt(state.projectStages.totals.current/1e12,1)} billones</span></strong><button class="text-link" data-view="home" data-snapshot="2026-2">Ver el presupuesto 2026 ↗</button>`;
  const exact=t.content.querySelector('.hero-exact-value');if(exact){const d=document.createElement('details');d.className='review-exact';d.innerHTML='<summary>Importe exacto</summary>';exact.replaceWith(d);d.append(exact);}
  const per=t.content.querySelector('.hero-person strong');if(per)per.textContent='≈ $ '+fmt(state.project.summary.perCapita.value/1e6,1)+' millones';
  t.content.querySelector('.hero-person small').textContent='Presupuesto anual dividido por habitantes';
 }
 if(view==='compare'){
  const c=comparisonState(),select=t.content.querySelector('#arg-indicator'),primary=Object.values(comparisonPrimaryGroups).flat();
  select.innerHTML=Object.entries({...comparisonPrimaryGroups,'Más indicadores':c.d.indicators.filter(i=>!primary.includes(i.id)).map(i=>i.id)}).map(([group,ids])=>`<optgroup label="${group}">${ids.map(id=>c.d.indicators.find(i=>i.id===id)).filter(Boolean).map(i=>`<option value="${i.id}" ${i.id===c.ind.id?'selected':''}>${E(comparisonLabel(i))}</option>`).join('')}</optgroup>`).join('');
  const base=t.content.querySelector('#comparison-budget-base');if(base)base.innerHTML=`<option value="initial" ${state.compareBudgetBase!=='current'?'selected':''}>Presupuesto votado 2026</option><option value="current" ${state.compareBudgetBase==='current'?'selected':''}>Presupuesto ampliado a junio 2026</option>`;
  const note=t.content.querySelector('.pair-date-heading')?.nextElementSibling;if(note)note.textContent='Primer trimestre: los saldos suelen ser más altos a comienzo de año.';
  if(c.p.quarter===1||c.p.id.endsWith('-1'))t.content.querySelector('.comparison-context')?.insertAdjacentHTML('beforeend',' Primer trimestre: los saldos suelen ser más altos a comienzo de año.');
 }
 if(view!=='method')citizenGlossaryMarkup(t.content);
 for(const node of t.content.querySelectorAll('strong,.point-readout')){
  if(node.closest('details,dialog,.reading-amount')||node.children.length)continue;
  node.textContent=node.textContent.replace(/([−-]?)\$\s*(\d{1,3}(?:\.\d{3}){3,})/g,(text,sign,number)=>{const value=Number(number.replaceAll('.',''));node.title=text;return short(sign?-value:value);});
 }
 for(const node of t.content.querySelectorAll('.gov-exact')){const label=node.previousElementSibling;if(label)label.title=node.textContent;node.remove();}
 const exactArea=t.content.querySelector('.gov-kpis article:first-child small');if(exactArea){exactArea.previousElementSibling.title=money(state.areaReports.areas.find(a=>a.code===state.governmentArea).project2027);exactArea.textContent=exactArea.textContent.replace(/^.*? · /,'');}
 // Directional arrows are reserved for changes, not fiscal balances or composition.
 for(const root of t.content.querySelectorAll('.change-row>strong,.gov-card-change,.gov-kpis article:nth-child(2) strong,.history-impact strong,.history-twenty strong,.semester-summary>div>strong,.real-change-reading>strong,.project-comparison-result strong,.annual-comparison .metric strong,.income-comparison .metric strong,.province-difference')){
  if(root.querySelector('.variation-up,.variation-down'))continue;
  const text=root.textContent.trim(),m=text.match(/^([+−-])([\d.,]+)%/);if(!m)continue;
  root.classList.add(m[1]==='+'?'variation-up':'variation-down');root.prepend(m[1]==='+'?'▲ ':'▼ ');
 }
 return t.innerHTML;
};
const reviewEnhance=enhanceVisuals;
enhanceVisuals=function(view){
 reviewEnhance(view);
 if(view==='project'&&state.projectFocus==='Personal'&&!document.querySelector('.highlight-personal')){
  const row=[...document.querySelectorAll('.project-spending .review-bar')].find(n=>/^(Personal|Sueldos del personal)$/.test(n.querySelector('.review-bar-name')?.textContent));
  if(row){row.classList.add('highlight-personal');document.querySelector('.project-spending h2').insertAdjacentHTML('afterend','<p class="personal-entry">Sueldos del personal: la partida está resaltada en el gráfico. Tocala para ver su importe y comparación con 2026.</p>');}
 }
 if(view==='explained'&&state.glossaryTopic){const node=document.getElementById('pregunta-'+state.glossaryTopic);if(node){node.open=true;node.scrollIntoView({block:'start',behavior:'instant'});}}
};
