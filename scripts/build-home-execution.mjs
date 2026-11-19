import assert from 'node:assert/strict';
import fs from 'node:fs';

const file = path => new URL('../' + path, import.meta.url);
const read = path => fs.readFileSync(file(path), 'utf8');
const json = path => JSON.parse(read(path));
const raw = json('data/fiscal-results/quarterly-balances.json');
const caif = json('data/fiscal-results/caif.json');
const advance = json('data/budget/2026/2026-3.json');
const monthlyIndex = new Map(read('data/history/ipcba.csv').trim().split(/\r?\n/).slice(1).map(line => {
  const [month, value] = line.split(',');
  return [month, Number(value)];
}));
const averageIndex = (year, quarter) => {
  const months = [quarter * 3 - 2, quarter * 3 - 1, quarter * 3];
  const values = months.map(month => monthlyIndex.get(year + '-' + String(month).padStart(2, '0')));
  assert(values.every(value => value > 0), 'Falta IPCBA de ' + year + '-' + quarter);
  return values.reduce((a, b) => a + b, 0) / 3;
};
const baseIndex = averageIndex(advance.year, advance.quarter);
const years = [...new Set(raw.observations.map(row => row.period.slice(0, 4)))].map(Number);
const series = years.map(year => {
  let previousNominal = 0;
  let real = 0;
  const values = raw.observations.filter(row => row.period.startsWith(year + '-'));
  const points = values.map((row, index) => {
    const quarter = index + 1;
    assert.equal(row.period, year + '-' + quarter);
    const nominal = row.nominal ?? (row.advance ? advance.fiscal[row.advance] :
      row.caif === 'period' ? caif.periods[row.period].financialResult :
      caif.context.semesters.find(semester => semester.year === year).financialResult);
    assert(Number.isFinite(nominal), 'Falta saldo nominal de ' + row.period);
    const ipc = averageIndex(year, quarter);
    real += (nominal - previousNominal) * baseIndex / ipc;
    previousNominal = nominal;
    return {quarter, nominal, real: Number(real.toFixed(2)), ipc, source: row.source, url: row.url ?? raw.source};
  });
  assert.equal(points.length, year === advance.year ? advance.quarter : 4);
  return {year, points};
});

const fiscal = advance.fiscal;
const factor = advance.priceComparison.factor;
const september2024 = raw.observations.find(row => row.period === '2024-3');
const samePeriod = [
  {year: 2024, income: september2024.income, financialResult: september2024.nominal, source: september2024.url},
  {year: 2025, income: fiscal.previousIncome, financialResult: fiscal.previousFinancialResult, source: advance.previousSources.income},
  {year: 2026, income: fiscal.income, financialResult: fiscal.financialResult, source: advance.sourceUrl}
].map(row => ({...row, financialRatio: row.financialResult / row.income * 100}));
const closed = caif.periods['2025-4'];
const components = {
  income: advance.revenueComparison.map(row => ({name: row.name, codes: row.codes, current: row.r, previous: row.previous, page: row.page})),
  expense: advance.groups.objects.map(row => ({name: row.name, codes: row.codes, current: row.d, previous: row.previous, page: row.page}))
};
for (const [key, total] of [['income', fiscal.income], ['expense', fiscal.expense]]) {
  assert(Math.abs(components[key].reduce((sum, row) => sum + row.current, 0) - total) < 1, 'Los componentes deben conciliar con el total de ' + key);
  components[key].sort((a, b) => b.current - a.current);
}
const output = {
  year: advance.year,
  quarter: advance.quarter,
  date: advance.date,
  source: raw.source,
  ipcSource: raw.ipcSource,
  scope: raw.scope,
  baseIndex,
  series,
  samePeriod,
  annualClosing: {year: closed.year, income: closed.income, expense: closed.expense, financialResult: closed.financialResult, financialRatio: closed.financialRatio},
  components,
  comparison: {
    factor,
    income: {previous: fiscal.previousIncome, current: fiscal.income},
    expense: {previous: fiscal.previousExpense, current: fiscal.expense},
    balance: {previous: fiscal.previousFinancialResult, current: fiscal.financialResult}
  }
};
const target = file('data/fiscal-results/home-execution.json');
const serialized = JSON.stringify(output, null, 2) + '\n';
if (process.argv.includes('--check')) assert.equal(fs.readFileSync(target, 'utf8'), serialized, 'Regenerar la serie de portada con node scripts/build-home-execution.mjs');
else fs.writeFileSync(target, serialized);
