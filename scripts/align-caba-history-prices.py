"""Align CABA budget views to the canonical annual price factors.

Run after build-execution-history.py. Original amounts, stages and sources
remain intact. Provincial comparisons keep their common national index.
"""
import csv
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HISTORY = ROOT / 'data/history'
canonical = json.loads((HISTORY / 'execution-history.json').read_text(encoding='utf-8'))
factors = {row['year']: row['factor'] for row in canonical['rows']}
description = ('Mismos precios promedio anuales que la serie principal de CABA: '
               'IPCBA desde 2013, CIFRA 2007–2012 y empalme histórico anterior. '
               'Base promedio abril–junio 2026. Para 2026 se proyectan los meses '
               'faltantes con inflación diciembre/diciembre de 30%. '
               'Se conservan los presupuestos y las etapas originales.')

def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')

budget_path = HISTORY / 'budget-history-long.json'
budget = json.loads(budget_path.read_text(encoding='utf-8'))
budget['updated'] = '2026-10-07'
budget['deflatorFile'] = 'data/history/execution-history.json'
budget['method'] = description
budget['priceAdjustment'] = {'canonical': 'data/history/execution-history.json',
                             'base': canonical['base'], 'method': description}
budget['notes'] = ['Hasta 2012: presupuesto aprobado. Desde 2013: presupuesto definitivo; '
                   '2026: vigente al 30 de junio. No es una serie de gasto ejecutado.', description]
if 'benchmark2026' in budget:
    budget['benchmark2026']['supersededForPriceAdjustment'] = True
for row in budget['rows']:
    row['factor'] = factors[row['year']]
    row['real'] = row['nominal'] * row['factor']
    row['priceBasis'] = 'Precios promedio anuales · ' + ('estimados' if row['year'] == 2026 else 'observados')
save(budget_path, budget)

category_path = HISTORY / 'category-history.json'
categories = json.loads(category_path.read_text(encoding='utf-8'))
categories['updated'] = '2026-10-07'
categories['method'] = description
categories['priceAdjustment'] = budget['priceAdjustment']
for series in categories['series']:
    for row in series['rows']:
        row['factor'] = factors[row['year']]
        row['real'] = row['nominal'] * row['factor']
save(category_path, categories)

for filename in ['budget-history-long.csv', 'budget-history-categories.csv']:
    path = HISTORY / filename
    reader = csv.DictReader(io.StringIO(path.read_text(encoding='utf-8-sig')))
    fields, rows = reader.fieldnames, list(reader)
    for row in rows:
        factor = factors[int(row['year'])]
        if 'factor' in row:
            row['factor'] = str(factor)
            row['real'] = str(float(row['nominal']) * factor)
            row['price_basis'] = 'Precios promedio anuales · ' + ('estimados' if row['year'] == '2026' else 'observados')
        else:
            for prefix in ['budget', 'execution']:
                if row[prefix + '_nominal']:
                    row[prefix + '_real'] = str(float(row[prefix + '_nominal']) * factor)
    output = io.StringIO(newline='')
    writer = csv.DictWriter(output, fieldnames=fields, lineterminator='\n')
    writer.writeheader()
    writer.writerows(rows)
    path.write_text(output.getvalue(), encoding='utf-8-sig')
print('Precios alineados en presupuestos, partidas y CSV de CABA; nominales y etapas conservados.')
