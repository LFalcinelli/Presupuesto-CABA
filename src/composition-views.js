'use strict';
// Shared classifications and comparisons; budgets and execution keep their stages.
const spendingCompositionLabels={functions:'Finalidad y función',jurisdictions:'Jurisdicciones',objects:'Incisos · qué se paga',economic:'Gasto corriente y de capital'};
const classificationName=name=>String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();

function spendingComposition(rows,k){
 const key=spendingCompositionLabels[state.spendingComposition]?state.spendingComposition:'functions',dim={functions:7,jurisdictions:1,objects:8,economic:9}[key];
 let groups;
 if(key==='economic')groups=[['21','Gasto corriente'],['22','Gasto de capital']].map(([code,name])=>{const list=rows.filter(r=>r.codes[9].startsWith(code)),codes=[...(list[0]?.codes||[])];codes[9]=code;return {name,rows:list,codes};});
 else groups=group(rows,dim);
 const items=groups.map(g=>({name:displayName(g.name),value:total(g.rows,k),description:key==='functions'?displayName(g.rows[0].names[6]):'',action:`data-select-dim="${dim}" data-codes='${E(JSON.stringify(g.codes))}'`}));
 return `<div class="composition-controls"><label>Ver la composición por<select id="spending-composition">${Object.entries(spendingCompositionLabels).map(([id,label])=>`<option value="${id}" ${key===id?'selected':''}>${label}</option>`).join('')}</select></label><span>Tocá un rectángulo para explorar su detalle.</span></div>${compositionTreemap(items,{label:(k==='d'?'Gasto ejecutado':'Presupuesto vigente')+' · '+spendingCompositionLabels[key],limit:26})}<details class="exact-values"><summary>Ver importes y participaciones</summary><div class="table-wrap"><table><thead><tr>${key==='functions'?'<th>Finalidad</th>':''}<th>${E(spendingCompositionLabels[key])}</th><th>Importe</th><th>Parte del total</th></tr></thead><tbody>${items.map(r=>`<tr>${key==='functions'?`<td>${E(r.description)}</td>`:''}<th><button class="cell-link" ${r.action}>${E(r.name)}</button></th><td class="num">${money(r.value)}</td><td class="num">${pct(r.value/total(rows,k)*100)}</td></tr>`).join('')}</tbody></table></div></details>`;
}

function projectBudgetChanges(key,kind='expense'){
 const groups=state.projectComparison.groups,source=groups[key];if(!source)return '';
 const selected=kind==='expense'?state.projectPurpose:null;
 let rows=source.filter(r=>!selected||r.purpose===selected).map(r=>({name:displayName(r.name),a:r.reference,b:r.projectAdjusted,original:r.project}));
 rows.sort((a,b)=>Math.abs(b.b-b.a)-Math.abs(a.b-a.a));
 const mode=state[kind==='expense'?'expenseChangeMode':'revenueChangeMode']||'percent',a=rows.reduce((s,r)=>s+r.a,0),b=rows.reduce((s,r)=>s+r.b,0),rate=(b/a-1)*100;
 const label=kind==='expense'?'el gasto finalmente realizado puede ser distinto':'los ingresos finalmente recaudados pueden ser distintos';
 return `<section class="budget-real-changes" data-budget-changes="${kind}"><p class="eyebrow">PROYECTO 2027 FRENTE A 2026 AMPLIADO</p><h2>${kind==='expense'?'Qué destinos ganan o pierden frente a la inflación':'Cómo cambiarían los ingresos, descontando la inflación'}</h2><div class="real-change-reading"><strong>${signedPct(rate)}</strong><p>${selected?E(displayName(selected)):key==='taxRevenue'?'Ingresos tributarios':kind==='expense'?'Gasto total':'Ingresos totales'} frente al presupuesto vigente al 30 de junio de 2026.<small>Con el supuesto de inflación del 18%.</small></p></div><div class="tools"><label>Mostrar el cambio<select id="budget-change-mode" data-budget-kind="${kind}"><option value="percent" ${mode==='percent'?'selected':''}>En porcentaje</option><option value="amount" ${mode==='amount'?'selected':''}>En pesos, descontando la inflación</option></select></label></div>${changeDumbbell(rows,{mode,reference:'2026 ampliado',project:'2027 ajustado por inflación'})}<details class="exact-values"><summary>Ver los presupuestos y el cambio real</summary><div class="table-wrap"><table><caption>${kind==='expense'?'Gastos':'Ingresos'} · presupuestos anuales</caption><thead><tr><th>Destino u origen</th><th>2026 vigente</th><th>Proyecto 2027</th><th>Cambio real</th></tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${E(r.name)}</th><td class="num">${money(r.a)}</td><td class="num">${money(r.original)}</td><td class="num">${r.a?signedPct((r.b/r.a-1)*100):'Sin comparación'}</td></tr>`).join('')}</tbody></table></div></details><p class="note">${kind==='expense'&&key==='jurisdictions'?'Infraestructura y Movilidad e Infraestructura se comparan como la misma jurisdicción (código 31). ':''}Son presupuestos anuales; ${label}. ${detailLink('presupuesto-2027','Cómo se compara')}</p></section>`;
}

function incomeComposition(rows,{project=false,label='Composición de los ingresos'}={}){
 const data=state.incomes?.[state.period],sum=rows.reduce((s,r)=>s+(project?r.value:r.r),0);
 const greens=['#185d51','#287a69','#459481','#76b5a0'];
 const projectProduction=['tax_iibb','tax_sellos','tax_electricidad','tax_ferroviaria'];
 const rowItem=(row,color)=>({name:displayName(row.name),value:project?row.value:row.r,color,action:project?readingAction(displayName(row.name),compositionDetail(row,sum,{label})): `data-income="${row.codes.join('.')}"`});
 const makeItem=row=>{
  const production=project?classificationName(row.name).includes('sobre la produccion'):row.codes.join('.')==='1.11.3';
  const item=rowItem(row,production||(!project&&row.codes.slice(0,3).join('.')==='1.11.3')?'#185d51':'#70508b');
  if(production){
   item.name='Impuestos a la producción, el consumo y las transacciones';
   item.children=project?projectProduction.map((id,i)=>{const n=state.fiscalMap.nodes.find(r=>r.id===id);return rowItem({name:n.label,value:n.value},greens[i]);}):data.rows.filter(r=>r.codes.length===4&&r.codes.slice(0,3).join('.')==='1.11.3').map((r,i)=>rowItem(r,greens[i%greens.length]));
  }
  return item;
 };
 const items=rows.flatMap(row=>{
  const tributary=project?classificationName(row.name)==='ingresos tributarios':row.codes.join('.')==='1.11';
  if(tributary)return (project?state.project.breakdowns.taxRevenue:data.rows.filter(r=>r.codes.length===3&&r.codes.slice(0,2).join('.')==='1.11')).map(makeItem);
  return [makeItem(row)];
 });
 const hasProduction=items.some(r=>r.children?.length||r.color==='#185d51');
 return `<div class="income-composition"><p class="composition-hint">${hasProduction?'<span class="production-key"></span>En verde: impuestos a la producción, el consumo y las transacciones. ':''}Cada porcentaje se refiere al total que estás mirando.</p>${compositionTreemap(items,{label,limit:26,showKey:false,incomeLayout:true})}</div>`;
}

document.addEventListener('change',e=>{
 if(e.target.id==='spending-composition'){state.spendingComposition=e.target.value;render();}
 if(e.target.id==='budget-change-mode'){state[e.target.dataset.budgetKind==='expense'?'expenseChangeMode':'revenueChangeMode']=e.target.value;render();}
});
const compositionReadRoute=readRoute,compositionSyncRoute=syncRoute;
readRoute=function(){compositionReadRoute();const q=new URLSearchParams(location.hash.split('?')[1]||'');state.spendingComposition=spendingCompositionLabels[q.get('composicion')]?q.get('composicion'):'functions';};
syncRoute=function(){compositionSyncRoute();if(state.view!=='home')return;const q=new URLSearchParams(location.hash.split('?')[1]||'');if(state.spendingComposition&&state.spendingComposition!=='functions')q.set('composicion',state.spendingComposition);history.replaceState(null,'','#gastos?'+q);};
