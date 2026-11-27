import assert from 'node:assert/strict';
import fs from 'node:fs';

const path = name => new URL('../data/' + name, import.meta.url);
const read = name => JSON.parse(fs.readFileSync(path(name), 'utf8'));
const september = read('budget/2026/2026-3.json');
const june2026 = read('budget/2026/2026-2.json');
const june2025 = read('budget/2025/2025-2.json');
const incomeSeptember = read('revenue/income-2026-3.json');
const incomeJune = read('revenue/income-2026-2.json');
const juneComparison = read('revenue/income-comparison.json');
const objectDetails = read('execution/2026-partidas-june.json').parts;
const periods = ['2025', '2026'];
const monthIndex = new Map(fs.readFileSync(path('history/ipcba.csv'), 'utf8').trim().split(/\r?\n/).slice(1)
  .map(line => line.split(',')));
const averages = periods.map(year => ['07','08','09'].reduce((sum, month) => sum + Number(monthIndex.get(year+'-'+month)), 0) / 3);
assert(averages.every(value => value > 0));

const selectors = {
  purposes: c => c[6],
  functions: c => [c[6], c[7]].join('.'),
  jurisdictions: c => c[1],
  units: c => [c[1], c[4]].join('.'),
  programs: c => [c[1], c[4], c[5]].join('.'),
  objects: c => c[8],
  economic: c => c[9].slice(0, 3)
};
function groupJune(dataset, getCode) {
  const groups = new Map();
  for (const row of dataset.rows) {
    if (!row.fiscal) continue;
    const code = getCode(row.codes);
    groups.set(code, (groups.get(code) ?? 0) + row.d);
  }
  return groups;
}
const gastos = {};
for (const [group, selector] of Object.entries(selectors)) {
  const current = groupJune(june2026, selector);
  const previous = groupJune(june2025, selector);
  gastos[group] = Object.fromEntries(september.groups[group].map(row => {
    const code = row.codes.join('.');
    const old = row.previous != null ? row.previous - (previous.get(code) ?? 0) : null;
    return [code, [row.d - (current.get(code) ?? 0), old]];
  }));
}
gastos.objectDetails = Object.fromEntries(september.groups.objectDetails.map(row => {
  const code = row.codes.join('.');
  const [juneCurrent, junePrevious, septemberPrevious] = objectDetails[code];
  return [code, [row.d - juneCurrent, septemberPrevious - junePrevious, septemberPrevious]];
}));

const juneIncomeByCode = new Map(incomeJune.rows.map(row => [row.codes.join('.'), row.r]));
const previousSeptember = new Map(september.revenueComparison.map(row => [row.codes.join('.'), row.previous]));
const previousJune = new Map(juneComparison.groups.map(row => [row.id, row.nominal2025]));
const ingresos = Object.fromEntries(incomeSeptember.rows.map(row => {
  const code = row.codes.join('.');
  const old = previousSeptember.has(code) && previousJune.has(code) ? previousSeptember.get(code) - previousJune.get(code) : null;
  return [code, [row.r - (juneIncomeByCode.get(code) ?? 0), old]];
}));
const total = {
  expense: [september.fiscal.expense - june2026.fiscalTotals.d, september.fiscal.previousExpense - june2025.fiscalTotals.d],
  income: [incomeSeptember.total.r - incomeJune.total.r, september.fiscal.previousIncome - juneComparison.total.nominal2025]
};
const same = (a, b) => assert(Math.abs(a - b) < 1, `${a} ≠ ${b}`);
for (const group of ['purposes', 'functions', 'jurisdictions', 'objects', 'objectDetails', 'economic']) {
  same(Object.values(gastos[group]).reduce((sum, row) => sum + row[0], 0), total.expense[0]);
}
same(incomeSeptember.rows.filter(row => row.codes.length===1).reduce((sum,row)=>sum+ingresos[row.codes[0]][0],0),total.income[0]);
const json = JSON.stringify({
  period: '2026-3',
  method: 'Julio–septiembre surge de restar junio a septiembre en pesos del mismo año. Comparación real con IPCBA promedio de julio a septiembre.',
  source: [september.sourceUrl, september.previousSources.income, september.previousSources.expense, june2026.sourceUrl, june2025.sourceUrl],
  factor: averages[1] / averages[0], total, gastos, ingresos
});
const output = path('execution/july-september-2026.json');
if (process.argv.includes('--check')) assert.equal(fs.readFileSync(output, 'utf8'), json+'\n');
else fs.writeFileSync(output, json+'\n');
