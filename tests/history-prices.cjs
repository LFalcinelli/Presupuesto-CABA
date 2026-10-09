const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const h=read('data/history/execution-history.json'),p=h.priceAdjustment,project=read('data/budget/2027/project.json');
const near=(a,b,tolerance=1e-9)=>assert(Math.abs(a-b)<=tolerance,`${a} differs from ${b}`);
const average=values=>values.reduce((a,b)=>a+b,0)/values.length;
assert.equal(h.schemaVersion,2);assert.equal(h.rows.length,31);assert.equal(h.series.currentPrimary.rows.length,31);assert.equal(h.series.capital.rows.length,31);
assert.equal(p.lastObservedMonth,'2026-08');assert.deepEqual(p.assumptions,{'2026':.30,'2027':.18});
const csv=fs.readFileSync(path.join(root,'data/history/ipcba.csv'),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/).slice(1);
for(const line of csv){const [month,value]=line.split(',');if(month>='2013-01')assert.equal(p.observedMonthly[month],Number(value));}
near(p.baseIndex,2434.406666666667);
assert.equal(p.inputs.cifraSource.url,'https://centrocifra.org.ar/wp-content/uploads/2023/08/IPC-Provincias-2007-2018.xlsx');
const cifraMean=y=>average(Array.from({length:12},(_,i)=>p.inputs.cifraMonthly[`${y}-${String(i+1).padStart(2,'0')}`]));
// Values independently checked against the original CIFRA workbook.
near(cifraMean(2007),24.554985217519057);near(cifraMean(2013),85.35149359746651);
for(let y=2007;y<=2012;y++)near(p.annualAverage[y]/p.annualAverage[2013],cifraMean(y)/cifraMean(2013));
near(p.annualAverage[2006]/p.annualAverage[2007],p.inputs.legacyAnnual[2006].index/p.inputs.legacyAnnual[2007].index);
const monthly={...p.observedMonthly,...p.projectedMonthly};
near(monthly['2026-12']/monthly['2025-12'],1.30);near(monthly['2027-12']/monthly['2026-12'],1.18);
assert.deepEqual(Object.keys(p.projectedMonthly),['2026-09','2026-10','2026-11','2026-12',...Array.from({length:12},(_,i)=>`2027-${String(i+1).padStart(2,'0')}`)]);
for(const year of [2026,2027])near(p.annualAverage[year],average(Array.from({length:12},(_,i)=>monthly[`${year}-${String(i+1).padStart(2,'0')}`])),1e-10);
for(const rows of [h.rows,h.series.currentPrimary.rows,h.series.capital.rows])for(const r of rows){
 near(r.factor,p.baseIndex/p.annualAverage[r.year]);near(r.real,r.nominal*r.factor,.01);
 assert.equal(r.priceEstimated,r.year>=2026);assert.equal(r.kind,r.year===1997?'legacy':r.year<=2025?'executed':r.year===2026?'budget':'project');
}
const total=y=>h.rows.find(r=>r.year===y),current=y=>h.series.currentPrimary.rows.find(r=>r.year===y);
assert.equal(total(2005).cell,'L28');assert.equal(current(2005).cell,'L9');
near(total(2005).nominal,5815692930.42,.001);near(total(2025).nominal,13751703241459.578,.01);
assert.equal(total(2026).nominal,19877152039294);assert.equal(total(2027).nominal,project.summary.fiscalExpense.value);
assert.equal(current(2026).nominal,15565399800000);assert.equal(current(2026).nominalPrecisionPesos,100000);
assert.equal(current(2027).nominal,project.summary.currentExpense.value-project.summary.interest.value);
for(const r of [current(2026),current(2027),total(2027)]){assert(r.source);assert.equal(r.sourceSha256,project.source.fileSha256);assert(r.pdfPage);}
for(const [year,billions] of [[2013,15.53],[2017,19.09],[2023,19.18],[2024,17.35],[2025,17.65],[2026,19.30],[2027,19.27]])near(total(year).real/1e12,billions,.05);
near(current(2023).real/1e12,15.24,.05);near(current(2027).real/1e12,15.34,.05);
assert(total(2027).real<total(2026).real);assert.equal(h.events[1].label,'2016–2017 · Traspaso de la Policía');
assert.equal(p.ipcbaSource.sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'public/sources/IPCBA-serie-empalmada.xlsx'))).digest('hex'));
const capital=y=>h.series.capital.rows.find(r=>r.year===y);assert.equal(capital(2005).cell,'L20');assert.equal(capital(2026).nominal,4033207400000);assert.equal(capital(2027).nominal,project.summary.capitalExpense.value);
const revenue=y=>h.series.revenue.rows.find(r=>r.year===y),income=read('data/revenue/income-2026-2.json');
assert.equal(h.series.revenue.rows.length,31);
for(const r of h.series.revenue.rows){
 near(r.factor,total(r.year).factor);near(r.real,r.nominal*r.factor,.01);
 assert.equal(r.priceEstimated,r.year>=2026);assert.equal(r.kind,r.year<=2025?'executed':r.year===2026?'budget':'project');
 if(r.year<=2025){assert.equal(r.cell,p.inputs.originals.find(o=>o.year===r.year).revenueCell);assert.equal(r.nominal,p.inputs.originals.find(o=>o.year===r.year).revenue);}
}
// Independently read from SP_Fi_AX01, concept 6) Recursos totales (1+4), millions converted to pesos.
for(const [year,nominal,cell] of [[1997,2811371939.66,'D24'],[2005,6166999871.57,'L24'],[2025,13470177564055.33,'AF24']]){near(revenue(year).nominal,nominal,.01);assert.equal(revenue(year).cell,cell);}
near(revenue(2025).nominal-total(2025).nominal,-281525677404,1);
assert.equal(revenue(2026).nominal,income.total.v);assert.notEqual(revenue(2026).nominal,income.total.r);
assert.equal(revenue(2027).nominal,project.summary.fiscalRevenue.value);
assert.notEqual(revenue(2026).nominal,total(2026).nominal);assert.notEqual(revenue(2027).nominal,total(2027).nominal);
assert.deepEqual(revenue(2026).pdfPages,[5,9]);assert.equal(revenue(2027).pdfPage,190);
assert.equal(revenue(2026).sourceSha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'public/sources/recursos-2026-2.pdf'))).digest('hex'));
assert.equal(revenue(2027).sourceSha256,project.source.fileSha256);
const revenueCSV=fs.readFileSync(path.join(root,'data/history/execution-history.csv'),'utf8').trim().split('\n').filter(line=>line.startsWith('revenue,'));
assert.equal(revenueCSV.length,31);for(const line of revenueCSV){const [,year,nominal,real]=line.split(',');assert.equal(Number(nominal),revenue(Number(year)).nominal);assert.equal(Number(real),revenue(Number(year)).real);}
console.log('Historia: fuentes, cuatro universos, empalme, factores y objetivos diciembre/diciembre verificados.');
