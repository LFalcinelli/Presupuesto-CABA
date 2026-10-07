const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const h=read('data/history/execution-history.json'),p=h.priceAdjustment,project=read('data/budget/2027/project.json');
const near=(a,b,tolerance=1e-9)=>assert(Math.abs(a-b)<=tolerance,`${a} differs from ${b}`);
const average=values=>values.reduce((a,b)=>a+b,0)/values.length;
assert.equal(h.schemaVersion,2);assert.equal(h.rows.length,31);assert.equal(h.series.currentPrimary.rows.length,31);
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
for(const rows of [h.rows,h.series.currentPrimary.rows])for(const r of rows){
 near(r.factor,p.baseIndex/p.annualAverage[r.year]);near(r.real,r.nominal*r.factor,.01);
 assert.equal(r.priceEstimated,r.year>=2026);assert.equal(r.kind,r.year===1997?'legacy':r.year<=2025?'executed':r.year===2026?'budget':'project');
}
const total=y=>h.rows.find(r=>r.year===y),current=y=>h.series.currentPrimary.rows.find(r=>r.year===y);
assert.equal(total(2005).cell,'L28');assert.equal(current(2005).cell,'L9');
near(total(2005).nominal,5815692930.42,.001);near(total(2025).nominal,13751703241459.578,.01);
assert.equal(total(2026).nominal,19877152039294);assert.equal(total(2027).nominal,project.summary.fiscalExpense.value);
assert.equal(current(2026).nominal,15565399800000);assert.equal(current(2026).nominalPrecisionPesos,100000);
assert.equal(current(2027).nominal,project.summary.currentExpense.value-project.summary.interest.value);
for(const [year,billions] of [[2013,15.53],[2017,19.09],[2023,19.18],[2024,17.35],[2025,17.65],[2026,19.30],[2027,19.27]])near(total(year).real/1e12,billions,.05);
near(current(2023).real/1e12,15.24,.05);near(current(2027).real/1e12,15.34,.05);
assert(total(2027).real<total(2026).real);assert.equal(h.events[1].label,'2016–2017 · Traspaso de la Policía');
assert.equal(p.ipcbaSource.sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'public/sources/IPCBA-serie-empalmada.xlsx'))).digest('hex'));
console.log('Historia: fuentes, dos universos, empalme, factores y objetivos diciembre/diciembre verificados.');
