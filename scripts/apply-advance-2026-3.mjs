// Propagate only comparisons supported by the independent September tables.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const compact=new Set(['data/history/execution-history.json','data/provinces/comparisons-argentina.json','data/execution/approved-vs-executed.json']);
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,compact.has(p)?0:2)+'\n');
const Q='data/budget/2026/2026-3.json', R='data/revenue/income-2026-3.json';
const a=read(Q), income=read(R), current=read('data/budget/2026/current.json');
const norm=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const sum=(rows,k)=>rows.reduce((s,r)=>s+r[k],0);
const one=(type,code)=>{const r=a.groups[type].find(r=>r.codes.join('.')===String(code));assert(r,type+': '+code);return r;};
const byName=(type, name)=>{const rows=a.groups[type].filter(r=>norm(r.name)===norm(name));assert.equal(rows.length,1,type+': '+name);return rows[0];};
const receipts=Object.fromEntries(income.rows.map(r=>[r.codes.join('.'),r]));
const economic={current:a.groups.economic.filter(r=>r.codes[0].startsWith('21')),capital:a.groups.economic.filter(r=>r.codes[0].startsWith('22'))};
const reference={document:a.sourceFile,url:a.sourceUrl,sha256:a.sha256,date:a.date,dataset:Q};

const config=read('config/site.json');
config.defaultPeriod=config.currentBudgetPeriod=config.currentExecutionPeriod='2026-3';
config.featuredPeriods=['2026-3','2025-4'];
config.availablePeriods=[...new Set(['2026-3',...config.availablePeriods])];
config.incomePeriods=[...new Set([...config.incomePeriods,'2026-3'])];
config.periodLabels={...config.periodLabels,'2026-3':'Avance 2026','2026-2':'Junio 2026'};
config.lastUpdate=config.lastReviewed='2026-11-17';
write('config/site.json',config);

const path='data/budget/2027/comparison-2026.json', c=read(path), rate=c.deflator.factor;
c.previousReferenceDate='2026-06-30';
c.referenceDate=a.date;
c.referenceStatus='Presupuesto vigente al 30/09/2026';
c.source2026=a.sourceUrl;c.referenceReport=reference;
c.method='Proyecto 2027 comparado con el presupuesto anual 2026 vigente al 30/09. La lectura real conserva el factor promedio anual de Evolución; no se compara con el gasto o los ingresos realizados.';
Object.assign(c.classificationMethod,{referenceStage:c.referenceStatus,referenceIncome:R,referenceExpense:Q});
const lookup={
 purposes:r=>byName('purposes',r.name),objects:(_,i)=>one('objects',i+1),
 functions:r=>byName('functions',r.name),jurisdictions:r=>one('jurisdictions',r.jurisdictionCode),
 economic:r=>({v:sum(economic[r.id],'v'),s:sum(economic[r.id],'s'),page:20}),
 revenue:r=>receipts[r.referenceCode],taxRevenue:r=>receipts[r.referenceCode]
};
for(const [key,rows] of Object.entries(c.groups)){
 for(const [i,r] of rows.entries()){
  const x=lookup[key](r,i);
  assert(x&&Number.isFinite(x.v)&&Number.isFinite(x.s),key+': '+r.name);
  r.reference=x.v;r.initialReference=x.s;r.pdfPage2026=x.page;
  r.difference=r.project-r.reference;r.projectAdjusted=r.project/rate;
  r.realDifference=r.projectAdjusted-r.reference;
  r.nominalVariationPct=r.reference?(r.project/r.reference-1)*100:null;
  r.realVariationPct=r.reference?(r.projectAdjusted/r.reference-1)*100:null;
 }
 if(key!=='taxRevenue')assert(Math.abs(sum(rows,'reference')-(key==='revenue'?income.total.v:a.fiscalTotals.v))<1,key);
}
c.totals.reference=a.fiscalTotals.v;
c.totals.nominalVariationPct=(c.totals.project/c.totals.reference-1)*100;
c.totals.projectAdjusted=c.totals.project/rate;
c.totals.realDifference=c.totals.projectAdjusted-c.totals.reference;
c.totals.realVariationPct=(c.totals.projectAdjusted/c.totals.reference-1)*100;
write(path,c);
const stageFile='data/budget/2027/stages.json', stage=read(stageFile);
stage.source2026=reference;stage.date2026=a.date;stage.totals.current=a.fiscalTotals.v;
for(const [key,rows] of Object.entries(stage.groups))rows.forEach((r,i)=>{r.current=c.groups[key][i].reference;});
write(stageFile,stage);

const rp='data/revenue/increases-2027.json', increase=read(rp);
for(const r of increase.rows){
 const x=receipts[r.code];assert(x,r.code);
 r.current2026=x.v;r.initial2026=x.s;
 r.realDifferenceCurrent=r.project2027/rate-x.v;
 r.realDifferenceInitial=r.project2027/rate-x.s;
 r.realVariationCurrent=x.v?(r.project2027/rate/x.v-1)*100:null;
 r.realVariationInitial=x.s?(r.project2027/rate/x.s-1)*100:null;
 r.source2026=a.sourceFile;r.pdfPage2026=x.page;
}
increase.referenceDate=a.date;write(rp,increase);

const hp='data/history/execution-history.json', h=read(hp);
function historicalPoint(rows, nominal, extra){
 const r=rows.find(r=>r.year===2026);
 Object.assign(r,{nominal,real:nominal*r.factor,source:a.sourceFile,sourceSha256:a.sha256,
  status:'Presupuesto vigente — 30/09/2026',sourceDataset:Q,...extra});
}
historicalPoint(h.rows,a.fiscalTotals.v,{reference:'Gastos fiscales, columna vigente, PDF p. 20',pdfPage:20});
historicalPoint(h.series.capital.rows,sum(economic.capital,'v'),{reference:'Códigos 221 a 224, columna vigente',pdfPage:20,nominalPrecisionPesos:1});
historicalPoint(h.series.revenue.rows,income.total.v,{status:'Ingresos previstos · vigente al 30/09/2026',sourceDataset:R,pdfPages:[5,13]});
h.series.revenue.method=h.series.revenue.method.replace('vigentes al 30/06 de income-2026-2, no la recaudación parcial del semestre','vigentes al 30/09 de income-2026-3, no la recaudación parcial');
h.notes=h.notes.map(s=>s.startsWith('2026 es presupuesto anual actualizado al 30/06')?'Los valores de 2026 y 2027 son presupuestos anuales. Total, capital e ingresos vigentes a septiembre de 2026; corriente sin intereses vigente a junio (último detalle verificable). Para ambos años el ajuste por inflación se estima.':s);
write(hp,h);
const hcsv='data/history/execution-history.csv';
fs.writeFileSync(hcsv,fs.readFileSync(hcsv,'utf8').replace(/^(total|capital|revenue),2026,.*$/gm,(_,id)=>{
 const r=(id==='total'?h.rows:h.series[id].rows).find(r=>r.year===2026);
 return [id,r.year,r.nominal,r.real,r.factor,r.priceIndexAnnual,'True',r.kind,r.status].join(',');
}));

const pp='data/provinces/comparisons-argentina.json', p=read(pp);
const b=p.periods.find(r=>r.kind==='budget').rows.find(r=>r.id==='02');
b.budget.value=b.values.budget=current.budget;
b.status=b.budget.status='Presupuesto — 30/09/2026';
Object.assign(b.budget,{technicalMetric:'Presupuesto vigente — 30/09/2026',cutDate:a.date,
 source:a.sourceUrl,reference:a.sourceFile,method:'Presupuesto anual con los cambios al 30/09/2026.',checkedAt:'2026-11-17'});
b.indicators.budgetPc=current.perCapita;b.indicators.budgetArea=current.budget/b.areaKm2;
p.updated='2026-11-17';write(pp,p);

const ap='data/execution/approved-vs-executed.json', approved=read(ap);
approved.periods=approved.periods.filter(r=>r.period!=='2026-3');
const groups=a.groups.jurisdictions.map(r=>({name:r.name,initial:r.s,executed:r.d,updatedBudget:r.v,difference:r.d-r.s,ratio:r.s?r.d/r.s*100:null})).sort((a,b)=>b.difference-a.difference);
approved.periods.unshift({period:'2026-3',year:2026,quarter:3,initial:a.fiscalTotals.s,
 executed:a.fiscalTotals.d,updatedBudget:a.fiscalTotals.v,source:a.sourceUrl,sourceReport:reference,groups});
write(ap,approved);

// A comparable 4th quarter scenario using the same method as the former H2 estimate.
const home='data/home-highlights-2027.json', cards=read(home), k=cards.cards[1], f=a.fiscal;
const incomeFactor=f.income/f.previousIncome, priorQ4=k.annual2025.financialResult-f.previousFinancialResult;
const result=f.financialResult+priorQ4*incomeFactor;
const annualIncome=k.annual2025.income*incomeFactor;
k.text='2025 cerró con déficit. A septiembre de 2026 hubo superávit, aunque quedó una parte menor de los ingresos.';
k.advance2026={...f,period:'2026-3',source:reference};
k.scenarios.closing2026={result,income:annualIncome,ratio:result/annualIncome*100,
 priorQ4,incomeFactor,formula:'Saldo enero–septiembre 2026 + saldo octubre–diciembre 2025 × (ingresos enero–septiembre 2026 / 2025)',
 incomeFormula:'Ingresos anuales 2025 × razón de ingresos de enero a septiembre (2026 / 2025)',
 assumption:'Repite el saldo del último trimestre de 2025, escalado por el crecimiento de los ingresos. Estimación del sitio.',
 sources:[Q,'data/fiscal-results/caif.json:periods.2025-4']};
const capital=c.groups.economic.find(r=>r.id==='capital'), hcap=h.series.capital.rows.find(r=>r.year===2026);
cards.cards[0].text=cards.cards[0].text.replace(/La inversión baja [\d,]+% real frente al (?:ampliado|vigente) 2026\./,
 'La inversión baja '+new Intl.NumberFormat('es-AR',{maximumFractionDigits:1}).format(Math.abs(capital.realVariationPct))+'% real frente al vigente 2026.');
cards.cards[0].capitalComparisons.current=capital.realVariationPct;
cards.cards[0].realCapitalChange2026=capital.realVariationPct;
cards.cards[0].capital[0]=hcap;
if(!cards.inputs.some(r=>r.file===Q))cards.inputs.push({file:Q});
for(const input of cards.inputs)input.sha256=createHash('sha256').update(fs.readFileSync(input.file)).digest('hex');
fs.writeFileSync(home,JSON.stringify(cards)+'\n');
