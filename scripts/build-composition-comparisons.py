"""Derive comparable budget classifications from the verified public snapshots.

Run from the repository root. No downloads or spreadsheet reinterpretation.
"""
import csv
import json
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(name):
    return json.loads((ROOT / name).read_text(encoding='utf-8'))


def save(name, value):
    (ROOT / name).write_text(json.dumps(value, ensure_ascii=False, indent=None if name.startswith('data/execution/') else 2) + '\n', encoding='utf-8', newline='\n')


def norm(name):
    return ' '.join(''.join(c for c in unicodedata.normalize('NFD', name.lower()) if not unicodedata.combining(c)).split())


project = read('data/budget/2027/project.json')
snapshot = read('data/budget/2026/2026-2.json')
income = read('data/revenue/income-2026-2.json')
comparison = read('data/budget/2027/comparison-2026.json')
factor = comparison['deflator']['factor']


def pair(row, reference, **extra):
    proposed = row['value']
    adjusted = proposed / factor
    return dict(name=row['name'], reference=reference, project=proposed,
                difference=proposed-reference, projectAdjusted=adjusted,
                realDifference=adjusted-reference,
                nominalVariationPct=(proposed/reference-1)*100 if reference else None,
                realVariationPct=(adjusted/reference-1)*100 if reference else None,
                pdfPage=row['pdfPage'], reference2027=row['reference'], **extra)


fiscal = [r for r in snapshot['rows'] if r['fiscal']]
functions = {}
jurisdictions = {}
for r in fiscal:
    key = norm(r['names'][7])
    functions[key] = functions.get(key, 0) + r['v']
    jurisdictions[r['codes'][1]] = jurisdictions.get(r['codes'][1], 0) + r['v']
comparison['groups']['functions'] = [pair(r, functions[norm(r['name'])], id=r['id'], purpose=r['purpose']) for r in project['breakdowns']['functions']]
area_codes = {norm(r['name']): r['code'] for r in read('data/budget/2027/area-reports.json')['areas']}
comparison['groups']['jurisdictions'] = [pair(r, jurisdictions[area_codes[norm(r['name'])]], id=r['id'], jurisdictionCode=area_codes[norm(r['name'])]) for r in project['breakdowns']['jurisdictions']]
comparison['groups']['economic'] = [pair(r, sum(x['v'] for x in fiscal if x['codes'][9].startswith('21' if r['id']=='current' else '22')), id=r['id']) for r in project['breakdowns']['economic']]

# Planilla 11 and the official 2026 income report use these equivalent classes.
income_by_code = {'.'.join(r['codes']): r for r in income['rows']}
revenue_codes = ['1.11', '1.12', '1.14', '1.16', '1.17', '2']
tax_codes = ['1.11.2', '1.11.3', '1.11.5', '1.11.7']
for dimension, codes in [('revenue', revenue_codes), ('taxRevenue', tax_codes)]:
    comparison['groups'][dimension] = [pair(r, income_by_code[code]['v'], referenceCode=code, referenceName=income_by_code[code]['name']) for r, code in zip(project['breakdowns'][dimension], codes)]

comparison['classificationMethod'] = {
    'referenceStage': 'Presupuesto vigente al 30/06/2026; columna v, no ingresos percibidos ni gasto ejecutado.',
    'functions': 'Equivalencia por denominación oficial de la función (normalizando mayúsculas y acentos); los identificadores 2027 son de la planilla y no códigos 2026.',
    'jurisdictions': 'Equivalencia por código de jurisdicción. Código 31: Min.Infraestructura (2025) / Ministerio de Movilidad e Infraestructura (2026–2027). El cambio de nombre no se interpreta como desaparición.',
    'economic': 'Códigos económicos 21 y 22, sólo filas fiscales.',
    'income': 'Clases verificadas de Planilla 11/16 y del informe oficial 2026; se conserva el presupuesto de cada clase y se excluyen fuentes financieras y figurativas.',
    'referenceIncome': 'data/revenue/income-2026-2.json',
    'referenceExpense': 'data/budget/2026/2026-2.json',
}
for dimension in ['functions', 'jurisdictions', 'economic']:
    rows = comparison['groups'][dimension]
    assert abs(sum(r['reference'] for r in rows)-snapshot['fiscalTotals']['v']) < 10
    assert sum(r['project'] for r in rows) == project['summary']['fiscalExpense']['value']
assert abs(sum(r['reference'] for r in comparison['groups']['revenue'])-income['total']['v']) < 2
assert sum(r['project'] for r in comparison['groups']['revenue']) == project['summary']['fiscalRevenue']['value']
save('data/budget/2027/comparison-2026.json', comparison)

# Correct the derived semester table without changing its original IPCBA factors.
semester = read('data/execution/semester-analysis.json')
old = next((r for r in semester['jurisdictions'] if norm(r['name']) == 'min.infraestructura'), None)
new = next(r for r in semester['jurisdictions'] if norm(r['name']) == 'ministerio de movilidad e infraestructura')
if old:
    for key in ['a', 'b', 'nominal2025', 'nominal2026']:
        new[key] = new.get(key, 0) + old.get(key, 0)
    new['aliases'] = [old['name'], new['name']]
    new['jurisdictionCode'] = '31'
    new['sourceRows'] = [old.get('sourceRow'), new.get('sourceRow')]
    semester['jurisdictions'].remove(old)
semester['jurisdictionMatching'] = comparison['classificationMethod']['jurisdictions']
save('data/execution/semester-analysis.json', semester)
with (ROOT / 'data/execution/semester-analysis.csv').open('w', encoding='utf-8', newline='') as handle:
    writer = csv.writer(handle, lineterminator='\n')
    writer.writerow(['clasificacion', 'concepto', 'fila_Analisis', 'devengado_nominal_1S2025', 'devengado_nominal_1S2026', 'devengado_1S2025_precios_2T2026', 'devengado_1S2026_precios_2T2026', 'variacion_real_pct'])
    for dimension, label in [('functions', 'Funciones'), ('incisos', 'Incisos'), ('jurisdictions', 'Jurisdicciones'), ('communes', 'Comunas')]:
        for row in semester[dimension]:
            source_rows = ';'.join(str(x) for x in row['sourceRows']) if row.get('sourceRows') else row.get('sourceRow', '')
            writer.writerow([label, row['name'], source_rows, row.get('nominal2025', 0), row.get('nominal2026', 0), row['a'], row['b'], (row['b']/row['a']-1)*100 if row['a'] else ''])

# Annual comparisons retain the existing observed annual IPCBA factors.
annual = read('data/execution/annual-comparison.json')
grouped = {}
for year, measure in [(2024, 'a'), (2025, 'b')]:
    data = read(f'data/budget/{year}/{year}-4.json')
    inflation = annual['expense']['total'][measure] / annual['expense']['total'][f'nominal{year}']
    for row in data['rows']:
        if not row['fiscal']:
            continue
        code = row['codes'][1]
        target = grouped.setdefault(code, dict(id=code, name=row['names'][1], a=0, b=0, nominal2024=0, nominal2025=0))
        target['name'] = row['names'][1]  # newest official name
        target[measure] += row['d'] * inflation
        target[f'nominal{year}'] += row['d']
annual['expense']['groups']['1'] = list(grouped.values())
save('data/execution/annual-comparison.json', annual)
print('Verified: 2027 expense/income classifications; jurisdiction 31; annual jurisdictions.')
