'use strict';
function comparisonContext(...args){return Site.featureFunctions.comparisonContext.apply(this,args);}
function provinceSource(...args){return Site.featureFunctions.provinceSource.apply(this,args);}

function nationalRealState(){const data=state.nationalSpending,province=state.comparisons.periods[0].rows.find(r=>r.id===state.selectedProvince),ids=[{id:'02',name:'CABA',color:'#67339b'},...(province&&province.id!=='02'?[{id:province.id,name:province.name,color:'#147a80'}]:[]),{id:'aggregate',name:'Conjunto de provincias y CABA',color:'#75717b'}],basis=state.realHistoryBasis||'index';if(!data)return null;const rows=data.rows.map(p=>({year:p.year,values:ids.map(s=>{const v=p.rows.find(r=>r.id===s.id)?.real,first=data.rows[0].rows.find(r=>r.id===s.id)?.real;return Number.isFinite(v)?basis==='index'?v/first*100:v:null})}));return {data,ids,basis,rows}}
function nationalRealPoint(r,h){return `<strong>${r.year}</strong> · ${h.ids.map((s,i)=>`${E(s.name)}: ${Number.isFinite(r.values[i])?h.basis==='index'?fmt(r.values[i],1):money(r.values[i]):'Sin dato'}`).join(' · ')}`}
function nationalRealHistory(...args){return Site.featureFunctions.nationalRealHistory.apply(this,args);}
document.addEventListener('change',e=>{if(e.target.id==='real-history-basis'){state.realHistoryBasis=e.target.value;render()}if(e.target.id==='real-history-year'){state.realHistoryYear=Number(e.target.value);const h=nationalRealState(),r=h.rows.find(r=>r.year===state.realHistoryYear);if(r)$('#real-history-point').innerHTML=nationalRealPoint(r,h)}});
function comparisonState(){
 const d=state.comparisons,ind=d.indicators.find(i=>i.id===state.compareIndicator)||d.indicators.find(i=>i.id===d.defaultIndicator),available=d.periods.filter(p=>ind.availablePeriods?.includes(p.id)||(!ind.availablePeriods&&p.rows.some(r=>Number.isFinite(r.indicators[ind.id])))),p=available.find(p=>p.id===state.comparePeriod)||available.find(p=>p.id===d.defaultPeriod)||available[0];
 const rows=p.rows.filter(r=>Number.isFinite(r.indicators[ind.id])).sort((a,b)=>b.indicators[ind.id]-a.indicators[ind.id]),values=rows.map(r=>r.indicators[ind.id]).sort((a,b)=>a-b),middle=Math.floor(values.length/2),median=values.length%2?values[middle]:(values[middle-1]+values[middle])/2;
 state.comparePeriod=p.id;state.compareIndicator=ind.id;
 return {d,p,ind,available,rows,median,source:ind.sourceFamily==='functions'?p.functionSource:ind.sourceFamily==='employment'?d.employment.source:ind.sourceFamily==='vab'?d.vab.source:p.source,min:values[0]??0,max:values.at(-1)??0,caba:p.rows.find(r=>r.id==='02')};
}
const comparisonValue=(n,ind)=>n===null||!Number.isFinite(n)?'Sin dato':ind.unit==='%'?pct(n):['employeesRate','vabPcIndex'].includes(ind.id)?fmt(n,1):'$ '+fmt(n);
function difference(a,b,ind){if(!Number.isFinite(a)||!Number.isFinite(b))return 'Sin dato';return ind.unit==='%'?`${a-b>0?'+':''}${formatPercent(a-b,{unit:false})} puntos porcentuales`:b?`${signedPct((a/b-1)*100)}`:'Sin base'}
function comparisonColor(value,min,max){if(!Number.isFinite(value))return 'url(#no-comparison-data)';const c=comparisonState();if(c.ind.id==='balance'){if(Math.abs(value)<1e-10)return '#f1f0eb';const scale=Math.max(Math.abs(min),Math.abs(max),.001),ratio=Math.min(1,Math.abs(value)/scale),colors=value<0?['#f7d9d8','#e59694','#b23c42']:['#d7ebe1','#82b89d','#287752'];return colors[Math.min(2,Math.floor(ratio*3))]}const palette=['#eee6f5','#d7c2e6','#b495cc','#8c62ae','#62358a'],values=c.rows.map(r=>r.indicators[c.ind.id]).sort((a,b)=>a-b);const cut=q=>{const x=(values.length-1)*q,lo=Math.floor(x);return values[lo]+(values[Math.ceil(x)]-values[lo])*(x-lo)};return palette[[.2,.4,.6,.8].filter(q=>value>cut(q)).length]}
function compare(...args){return Site.featureFunctions.compare.apply(this,args);}

const comparisonLabel=ind=>({expensePc:'Gasto por habitante',revenuePc:'Ingresos por habitante',localTax:'Impuestos propios dentro de los ingresos corrientes',employeesRate:'Puestos públicos cada 1.000 habitantes',personnel:'Cuánto del gasto se destina al personal',capital:'Cuánto del gasto se destina a inversión',balance:'Superávit o déficit sobre los ingresos',healthPc:'Gasto en salud por habitante',educationPc:'Gasto en educación y cultura por habitante',securityPc:'Gasto en seguridad por habitante',ownTaxPc:'Impuestos propios por habitante',nationalTax:'Impuestos nacionales dentro de los ingresos corrientes',health:'Cuánto del gasto se destina a salud',education:'Cuánto del gasto se destina a educación y cultura',vabPcIndex:'Producción por habitante · país = 100',personnelCurrent:'Personal dentro del gasto corriente',personnelRevenue:'Gasto en personal sobre ingresos totales',servicesCurrent:'Servicios dentro del gasto corriente',servicesRevenue:'Gasto en servicios sobre ingresos totales'}[ind.id]||ind.name);
function provincialHistory(){return nationalRealHistory()+`<details class="comparison-extra"><summary>Cómo se distribuye el gasto y de dónde vienen los ingresos</summary>${nationalHistory()}</details>`;}
function nationalMap(...args){return Site.featureFunctions.nationalMap.apply(this,args);}

function argentinaComparison(...args){return Site.featureFunctions.argentinaComparison.apply(this,args);}

function nationalRanking(...args){return Site.featureFunctions.nationalRanking.apply(this,args);}
function provinceDetail(...args){return Site.featureFunctions.provinceDetail.apply(this,args);}

function provincePair(id,c=comparisonState()){if(id==='02')return '';const r=c.p.rows.find(x=>x.id===id);if(!r)return '';const ids=[...new Set([c.ind.id,...(c.p.kind==='budget'?['budgetPc','budgetArea']:['expensePc','healthPc','educationPc','securityPc','employeesRate'])])].filter(id=>c.d.indicators.find(i=>i.id===id)?.availablePeriods?.includes(c.p.id)).slice(0,5),indicators=ids.map(id=>c.d.indicators.find(i=>i.id===id));return `<details class="pair-panel"><summary>Más datos: CABA y ${E(r.name)}</summary><p>${c.p.label} · ${c.p.kind==='budget'?'cada presupuesto conserva el alcance explicado en su ficha':'cada fila identifica su unidad'}.</p><div class="table-wrap"><table><thead><tr><th>Qué se compara</th><th>CABA</th><th>${E(r.name)}</th></tr></thead><tbody>${indicators.map(i=>`<tr><td>${E(comparisonLabel(i))}<small class="office">${E(i.unit)}</small></td><td class="num">${comparisonValue(c.caba.indicators[i.id],i)}</td><td class="num">${comparisonValue(r.indicators[i.id],i)}</td></tr>`).join('')}</tbody></table></div></details>`;}

function selectProvince(...args){return Site.featureFunctions.selectProvince.apply(this,args);}
document.addEventListener('click',e=>{const b=e.target.closest('[data-universe],[data-compare-display],[data-province]');if(!b)return;if(b.dataset.universe){state.compareUniverse=b.dataset.universe;render()}if(b.dataset.compareDisplay){state.compareDisplay=b.dataset.compareDisplay;render()}if(b.dataset.province)selectProvince(b.dataset.province,b.hasAttribute('data-compare-pair'),true)});
document.addEventListener('focusin',e=>{const b=e.target.closest('.province,.caba-inset');if(b)selectProvince(b.dataset.province)});
document.addEventListener('keydown',e=>{const b=e.target.closest('.province,.caba-inset');if(b&&['Enter',' '].includes(e.key)){e.preventDefault();selectProvince(b.dataset.province)}});
document.addEventListener('change',e=>{if(e.target.id==='arg-indicator'){state.compareIndicator=e.target.value;state.argHistoryIndicator=undefined;render()}if(e.target.id==='arg-period'){state.comparePeriod=e.target.value;render()}if(e.target.id==='province-select')selectProvince(e.target.value)});
extraViews.compare=compare;

function nationalHistoryState(){
 const c=comparisonState(),ind=c.d.indicators.find(i=>i.id===state.argHistoryIndicator&&i.unit==='%')||(c.ind.unit==='%'?c.ind:c.d.indicators.find(i=>i.id==='localTax'));
 const periods=c.d.periods.filter(p=>p.quarter===4&&p.aggregate).slice().sort((a,b)=>a.year-b.year),province=c.p.rows.find(r=>r.id===state.selectedProvince)||c.caba;
 const series=[{id:'02',name:'CABA',color:'#67339b'},...(province.id==='02'?[]:[{id:province.id,name:province.name,color:'#147a80'}]),{id:'aggregate',name:'Conjunto de provincias y CABA',color:'#6a727d'}];
 const observations=periods.map(p=>({year:p.year,values:series.map(s=>(s.id==='aggregate'?p.aggregate:p.rows.find(r=>r.id===s.id))?.indicators[ind.id]??null)}));
 return {ind,periods,series,observations};
}
function nationalHistory(...args){return Site.featureFunctions.nationalHistory.apply(this,args);}
function nationalHistoryPoint(row,h=nationalHistoryState()){return `<b>${row.year}</b> · ${h.series.map((s,i)=>`${E(s.name)}: <b>${Number.isFinite(row.values[i])?pct(row.values[i]):'Sin dato'}</b>`).join(' · ')}`}
document.addEventListener('change',e=>{if(e.target.id==='arg-history-indicator'){state.argHistoryIndicator=e.target.value;render()}if(e.target.id==='arg-history-year'){state.argHistoryYear=Number(e.target.value);const h=nationalHistoryState(),row=h.observations.find(r=>r.year===state.argHistoryYear);if(row)$('#national-history-point').innerHTML=nationalHistoryPoint(row,h)}});
