"""Recalcular sólo los campos derivados del factor 2027/2026, sin los PDF ni la planilla oficial.

Usage: python scripts/reprice-2027-comparisons.py
Run after build-execution-history.py and update-project-2027-comparison.mjs.

build-area-reports-2027.py, import-government-areas.py, build-budget-depth.py y
build-search-budget.py necesitan documentos que quedan fuera del repositorio. Este
script reutiliza los importes ya guardados y aplica exactamente sus mismas fórmulas
con el factor vigente de comparison-2026.json. No cambia importes, bases ni etapas.
"""
import json
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))


def write(path, data):
    (ROOT / path).write_bytes((json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n').encode('utf-8'))


comparison = read('data/budget/2027/comparison-2026.json')
deflator = comparison['deflator']
factor = deflator['factor']
assert deflator['basis'] == 'annual-average', 'Ejecutar antes update-project-2027-comparison.mjs.'

# Áreas: misma fórmula decimal que build-area-reports-2027.py.
reports = read('data/budget/2027/area-reports.json')
decimal_factor = Decimal(str(factor))
reports['deflator'] = deflator
for area in reports['areas']:
    for row in area['objects']:
        row['realVariationPct'] = float((Decimal(row['project2027']) / decimal_factor / Decimal(str(row['current2026'])) - 1) * 100) if row['current2026'] else None
    a, b = Decimal(str(area['current2026'])), Decimal(area['project2027'])
    area['realVariationPct'] = float((b / decimal_factor / a - 1) * 100) if a else None
write('data/budget/2027/area-reports.json', reports)

# Fichas jurisdiccionales: comparten el deflactor de area-reports (import-government-areas.py).
for area in reports['areas']:
    path = area.get('detailFile')
    if not path:
        continue
    detail = read(path)
    detail['deflator'] = deflator
    write(path, detail)

# Servicios: misma fórmula que build-budget-depth.py; las filas sin proyecto conservan −100%.
depth = read('data/budget/2027/budget-depth.json')
services = depth['services']
services['factor'] = factor
for row in services['rows']:
    for field in ['initial2026', 'current2026']:
        base = row.get(field)
        if row['project2027'] == 0 and row['areas'] == []:
            continue
        row[field + 'RealVariationPct'] = (row['project2027'] / factor / float(base) - 1) * 100 if base and base > 0 else None
write('data/budget/2027/budget-depth.json', depth)

# Buscador: el índice guarda el factor que usa la interfaz.
search = read('data/budget/2027/search-index.json')
search['deflator'] = factor
write('data/budget/2027/search-index.json', search)
print(json.dumps({'factor': factor, 'areas': len(reports['areas']), 'services': len(services['rows'])}))
