// Keep the observed September cut and the conditional year-end estimate in sync.
export const advancePath='data/budget/2026/2026-3.json';
export function advanceHomeReading(card,a){
 const f=a.fiscal,incomeFactor=f.income/f.previousIncome,priorQ4=card.annual2025.financialResult-f.previousFinancialResult;
 const result=f.financialResult+priorQ4*incomeFactor,income=card.annual2025.income*incomeFactor;
 card.text='2025 cerró con déficit. A septiembre de 2026 hubo superávit, aunque quedó una parte menor de los ingresos.';
 card.advance2026={...f,period:'2026-3',debt:a.debt.at(-1),source:{
  document:a.sourceFile,url:a.sourceUrl,sha256:a.sha256,date:a.date,dataset:advancePath
 }};
 card.scenarios.closing2026={result,income,ratio:result/income*100,priorQ4,incomeFactor,
  formula:'Saldo enero–septiembre 2026 + saldo octubre–diciembre 2025 × (ingresos enero–septiembre 2026 / 2025)',
  incomeFormula:'Ingresos anuales 2025 × razón de ingresos de enero a septiembre (2026 / 2025)',
  assumption:'Repite el saldo del último trimestre de 2025, escalado por el crecimiento de los ingresos. Estimación del sitio.',
  sources:[advancePath,'data/fiscal-results/caif.json:periods.2025-4']};
}
