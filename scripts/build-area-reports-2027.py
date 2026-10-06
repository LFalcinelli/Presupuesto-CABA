"""Build bounded reports from the supplied PDF and already validated execution datasets.

Usage: python scripts/build-area-reports-2027.py /path/to/official-2027.pdf
pdfplumber is an optional maintenance dependency, not a site/build dependency.
The PDF stays outside the repository. Missing unit-level 2027 amounts stay null.
"""
from pathlib import Path
from decimal import Decimal
from collections import defaultdict
import hashlib, json, re, sys, unicodedata
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
read = lambda path: json.loads((ROOT / path).read_bytes())
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower())
number = lambda value: int(value) if value == int(value) else float(value)
project = read('data/budget/2027/project.json')
pdf = Path(sys.argv[1])
assert hashlib.sha256(pdf.read_bytes()).hexdigest() == project['source']['fileSha256'], 'Different PDF; verify the new document first.'
current = read('data/budget/2026/2026-2.json')
comparison = read('data/budget/2027/comparison-2026.json')
factor = Decimal(str(comparison['deflator']['factor']))

def aggregate(dataset, dimension):
    groups = {}
    for row in dataset['rows']:
        if not row['fiscal']:
            continue
        key = tuple(row['codes'][:5]) if dimension == 'unit' else row['codes'][1]
        label = row['names'][4 if dimension == 'unit' else 1]
        if key not in groups:
            groups[key] = dict(name=label, parentName=row['names'][1], codes=row['codes'][:5],
                               current=Decimal(0), executed=Decimal(0), objects=defaultdict(Decimal))
        g = groups[key]
        assert g['name'] == label, (key, g['name'], label)
        g['current'] += Decimal(str(row['v']))
        g['executed'] += Decimal(str(row['d']))
        g['objects'][row['codes'][8]] += Decimal(str(row['v']))
    return groups

jur = aggregate(current, 'area')
units = aggregate(current, 'unit')
# Explicit official jurisdiction codes, checked against both document names and totals.
codes = ['1','2','3','5','6','7','8','9','20','21','24','29','31','35','40','45','50','55','60','75','98','99']
assert set(codes) == set(jur)
with pdfplumber.open(pdf) as doc:
    text = doc.pages[172].extract_text(x_tolerance=1, y_tolerance=2)
rows = []
pending = ''
for line in text.splitlines():
    match = re.match(r'^(.*?)\s*((?:[\d.]+\s+){8}[\d.]+)$', line)
    if match:
        name = match[1].strip() or pending
        values = [int(v.replace('.', '')) for v in match[2].split()]
        assert sum(values[:8]) == values[8], name
        rows.append((name, values))
        pending = ''
    elif not re.search(r'\d', line):
        pending = line.strip()
assert len(rows) == 23 and rows[-1][0] == 'TOTAL', 'Unexpected Planilla 4 layout'
assert len(project['breakdowns']['jurisdictions']) == 22
objects = project['breakdowns']['objects']
assert len(objects) == 8
sources = {'2026-2': {k: current[k] for k in ['sourceFile','sourceUrl','sha256']}}
history = {}
for year in range(2013, 2026):
    path = f'data/budget/{year}/{year}-4.json'
    dataset = read(path)
    sources[f'{year}-4'] = {k: dataset[k] for k in ['sourceFile','sourceUrl','sha256']}
    history[year] = (aggregate(dataset, 'area'), aggregate(dataset, 'unit'), dataset['factors']['d'])

def series(key, group, kind):
    result = []
    for year, (areas, ue, f) in history.items():
        candidate = (ue if kind == 'unit' else areas).get(key)
        # No fuzzy matches or extrapolation across changes of name, parent or complete path.
        same = candidate and norm(candidate['name']) == norm(group['name']) and norm(candidate['parentName']) == norm(group['parentName'])
        value = candidate['executed'] if same else None
        result.append(dict(year=year, nominal=number(value) if value is not None else None,
                           factor=f, real=float(value * Decimal(str(f))) if value is not None else None,
                           missingReason=None if same else 'No coincide el nombre y código completo con la unidad actual.',
                           period=f'{year}-4'))
    return result

def object_values(group):
    return [{'code': str(i+1), 'name': row['name'], 'current2026': number(group['objects'][str(i+1)])}
            for i, row in enumerate(objects)]

areas = []
for code, official, (name, values) in zip(codes, project['breakdowns']['jurisdictions'], rows[:-1]):
    assert norm(name) == norm(official['name']), (name, official['name'])
    assert values[8] == official['value'], name
    group = jur[code]
    # Names in the consolidated tables and detailed file must identify the same jurisdiction.
    assert norm(group['name']) == norm(name), (code, group['name'], name)
    a, b = group['current'], Decimal(values[8])
    composition = object_values(group)
    for i, row in enumerate(composition):
        row['project2027'] = values[i]
        row['realVariationPct'] = float((Decimal(values[i]) / factor / Decimal(str(row['current2026'])) - 1) * 100) if row['current2026'] else None
    areas.append(dict(id='area-'+code, kind='area', code=code, name=group['name'],
                      current2026=number(a), project2027=number(b),
                      nominalVariationPct=float((b/a-1)*100) if a else None,
                      realVariationPct=float((b/factor/a-1)*100) if a else None,
                      objects=composition, history=series(code, group, 'area'),
                      pdfPage=173, reference='Planilla 4 · jurisdicción y objeto del gasto',
                      unitCount=sum(key[1] == code for key in units)))

unit_reports = []
for key, group in sorted(units.items()):
    unit_reports.append(dict(id='ue-'+'-'.join(key), kind='unit', codes=list(key),
                             name=group['name'], parent='area-'+key[1], parentName=group['parentName'],
                             current2026=number(group['current']), project2027=None,
                             objects=object_values(group), history=series(key, group, 'unit')))
assert sum(a['project2027'] for a in areas) == project['summary']['fiscalExpense']['value']
assert sum(a['current2026'] for a in areas) == current['fiscalTotals']['v']
assert sum(u['current2026'] for u in unit_reports) == current['fiscalTotals']['v']
for i, obj in enumerate(objects):
    assert sum(a['objects'][i]['project2027'] for a in areas) == obj['value']

output = dict(schemaVersion=1, year=2027, status='project', universe=project['universe'],
              source=project['source'], referencePeriod='2026-2', deflator=comparison['deflator'],
              coverage=dict(areas2027=len(areas), units2026=len(unit_reports), units2027=0,
                            missing='Apertura completa del Proyecto 2027 por unidad ejecutora y programa; no está en las planillas agregadas del PDF aportado.'),
              historyMethod=dict(firstYear=2013, lastYear=2025, metric='Gasto devengado anual',
                                 priceBase='Promedio abril–junio 2026', index='IPCBA',
                                 factorOrigin='factors.d de cada dataset de detalle; criterio existente, sin recalcular.',
                                 identity='Código completo, nombre normalizado y misma jurisdicción. No se imputan años ausentes ni continuidades tras reorganizaciones.',
                                 comparableAcrossReorganizations=False),
              sources=sources, areas=areas, units=unit_reports)
target = ROOT/'data/budget/2027/area-reports.json'
target.write_bytes((json.dumps(output, ensure_ascii=False, separators=(',', ':'))+'\n').encode())
print(json.dumps(dict(areas=len(areas), units=len(unit_reports), bytes=target.stat().st_size)))
