import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'data/budget/2027/comparison-2026.json');
const d=JSON.parse(fs.readFileSync(file,'utf8'));
const rate=d.deflator.percentage/100,factor=1+rate;
if(!Number.isFinite(rate)||factor<=0)throw Error('Deflactor inválido');
d.deflator.rate=rate;d.deflator.factor=factor;
d.inflationAdjusted=true;d.defaultDisplay='real';
d.adjustedUnit='ARS a precios de 2026 · ajuste con inflación proyectada';
d.method='Dos autorizaciones anuales del mismo universo fiscal. Proyecto 2027 frente al presupuesto 2026 actualizado al 30/06. Variación real estimada = (Proyecto 2027 / Presupuesto 2026 / 1,18 − 1) × 100. Se conserva también la lectura nominal. No compara ejecuciones ni utiliza inflación observada.';
d.totals.nominalVariationPct=(d.totals.project/d.totals.reference-1)*100;
d.totals.projectAdjusted=d.totals.project/factor;
d.totals.realDifference=d.totals.projectAdjusted-d.totals.reference;
d.totals.realVariationPct=(d.totals.projectAdjusted/d.totals.reference-1)*100;
for(const rows of Object.values(d.groups))for(const r of rows){
 r.projectAdjusted=r.project/factor;r.realDifference=r.projectAdjusted-r.reference;
 r.realVariationPct=r.reference?(r.projectAdjusted/r.reference-1)*100:null;
}
fs.writeFileSync(file,JSON.stringify(d,null,2)+'\n');
console.log(JSON.stringify({inflation:rate,nominalVariationPct:d.totals.nominalVariationPct,realVariationPct:d.totals.realVariationPct}));
