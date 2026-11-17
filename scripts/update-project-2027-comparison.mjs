import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'data/budget/2027/comparison-2026.json');
const d=JSON.parse(fs.readFileSync(file,'utf8'));
// Fuente única: la inflación promedio anual 2027/2026 de la serie histórica (pedido del dueño del 17/11/2026).
const prices=JSON.parse(fs.readFileSync(path.join(root,'data/history/execution-history.json'),'utf8')).priceAdjustment;
if(prices.assumptionType!=='annualAverage')throw Error('La serie histórica no usa inflación promedio anual');
const rate=prices.assumptions['2027'],factor=1+rate;
if(!Number.isFinite(rate)||factor<=0)throw Error('Deflactor inválido');
if(Math.abs(prices.annualAverage['2027']/prices.annualAverage['2026']-factor)>1e-12)throw Error('El factor no coincide con la serie histórica');
d.deflator={indicator:'Inflación promedio anual (IPCBA, promedio 2027 contra promedio 2026)',year:2027,percentage:Math.round(rate*1000)/10,rate,factor,
 basis:'annual-average',source:'Inflación promedio anual estimada fijada por el dueño el 17/11/2026: 32,3% en 2026 (IPCBA observado hasta octubre) y 21,3% en 2027',
 sourceType:'owner-estimate',verificationStatus:'scenario',reference:'Inflación promedio anual 2027: 21,3%',pdfPage:null,
 formula:'(Proyecto 2027 / Presupuesto 2026 / 1,213 − 1) × 100',
 historySource:'data/history/execution-history.json · priceAdjustment.annualAverage 2027/2026',
 limitation:'Estimación de inflación promedio anual, no inflación observada. Es el mismo ajuste que usa la serie de Evolución.'};
d.inflationAdjusted=true;d.defaultDisplay='real';
d.adjustedUnit='ARS a precios de 2026 · ajuste con inflación promedio anual estimada';
d.method='Dos autorizaciones anuales del mismo universo fiscal. Proyecto 2027 frente al presupuesto 2026 actualizado al 30/06. Variación real estimada = (Proyecto 2027 / Presupuesto 2026 / 1,213 − 1) × 100, con inflación promedio anual estimada de 21,3% para 2027. Se conserva también la lectura nominal. No compara ejecuciones ni utiliza inflación observada.';
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
