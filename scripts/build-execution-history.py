"""Rebuild only the principal historical chart. Optional ingestion: --cifra XLSX --legacy-prices XLSX.

Maintenance dependency: openpyxl. Raw downloads remain outside the repository.
Without ingestion arguments, reuse the source observations retained in the dataset.
"""
import argparse
import csv
import hashlib
import json
from datetime import datetime
from pathlib import Path
from statistics import mean

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / 'data/history/execution-history.json'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--cifra', type=Path)
parser.add_argument('--legacy-prices', type=Path)
args = parser.parse_args()
assert bool(args.cifra) == bool(args.legacy_prices), 'Supply both source workbooks.'
data = json.loads(FILE.read_text(encoding='utf-8'))
project = json.loads((ROOT / 'data/budget/2027/project.json').read_text(encoding='utf-8'))
income = json.loads((ROOT / 'data/revenue/income-2026-2.json').read_text(encoding='utf-8'))
assert abs(sum(r['v'] for r in income['rows'] if len(r['codes']) == 1) - income['total']['v']) < 1
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

if args.cifra:
    import openpyxl
    sheet = openpyxl.load_workbook(args.cifra, read_only=True, data_only=True)['Hoja1']
    cifra = {dt.strftime('%Y-%m'): value for dt, value in sheet.values
             if isinstance(dt, datetime) and 2007 <= dt.year <= 2013}
    legacy_sheet = openpyxl.load_workbook(args.legacy_prices, read_only=True, data_only=True)['Desde 1989']
    legacy = {}
    for year in range(1997, 2008):
        start = 2 + (year - 1989) * 12
        values = [legacy_sheet.cell(i, 2).value for i in range(start, start + 12)]
        assert all(isinstance(v, (int, float)) and v > 0 for v in values)
        assert all(legacy_sheet.cell(start+i, 1).value.year == year for i in range(12))
        legacy[str(year)] = {'index': mean(values), 'range': f'B{start}:B{start+11}'}
    # Source nominal observations are selected by labels, never by a presumed physical row number.
    fiscal_sheet = openpyxl.load_workbook(ROOT / 'public/sources/serie-aif-idecba.xlsx', read_only=True, data_only=True)['SP_Fi_AX01']
    total_row = next(i for i in range(1, 40) if str(fiscal_sheet.cell(i, 1).value).startswith('10) Gastos totales'))
    current_row = next(i for i in range(1, 40) if str(fiscal_sheet.cell(i, 1).value).startswith('2) Gastos corrientes'))
    originals = []
    for column in range(4, 33):
        year = 1997 + column - 4
        assert str(fiscal_sheet.cell(2, column).value).rstrip('*') == str(year)
        originals.append({'year': year, 'total': fiscal_sheet.cell(total_row, column).value*1e6,
                          'currentPrimary': fiscal_sheet.cell(current_row, column).value*1e6,
                          'cell': fiscal_sheet.cell(total_row, column).coordinate,
                          'currentCell': fiscal_sheet.cell(current_row, column).coordinate})
    inputs = {'cifraMonthly': cifra, 'legacyAnnual': legacy, 'originals': originals,
              'cifraSource': {'url': 'https://centrocifra.org.ar/wp-content/uploads/2023/08/IPC-Provincias-2007-2018.xlsx',
                              'sha256': sha(args.cifra), 'sheet': 'Hoja1', 'range': 'A4:B87', 'indexBase': 'Enero 2014 = 100'},
              'legacySource': {'file': args.legacy_prices.name, 'sha256': sha(args.legacy_prices), 'sheet': 'Desde 1989',
                               'description': 'Empalme aportado: tramo atribuido a INDEC hasta 2006 y enlace 2006–2007 con su tramo provincial.'}}
else:
    inputs = data['priceAdjustment']['inputs']

# Capital is taken from its own official row, not inferred from rounded subtotals.
import openpyxl
fiscal_sheet = openpyxl.load_workbook(ROOT / 'public/sources/serie-aif-idecba.xlsx', read_only=True, data_only=True)['SP_Fi_AX01']
capital_row = next(i for i in range(1, 40) if str(fiscal_sheet.cell(i, 1).value).startswith('5) Gastos de capital'))
revenue_row = next(i for i in range(1, 40) if str(fiscal_sheet.cell(i, 1).value).startswith('6) Recursos totales'))
for original in inputs['originals']:
    cell = fiscal_sheet.cell(capital_row, 4 + original['year'] - 1997)
    original.update(capital=cell.value * 1e6, capitalCell=cell.coordinate)
    cell = fiscal_sheet.cell(revenue_row, 4 + original['year'] - 1997)
    original.update(revenue=cell.value * 1e6, revenueCell=cell.coordinate)

with (ROOT / 'data/history/ipcba.csv').open(encoding='utf-8-sig') as f:
    observed = {r['mes']: float(r['IPCBA_base2021_100']) for r in csv.DictReader(f) if r['mes'] >= '2013-01'}
last_observed = max(observed)
assert last_observed.startswith('2026-'), 'Review forecast logic after 2026.'
assumptions = data.get('priceAdjustment', {}).get('assumptions', {'2026': .30, '2027': .18})
months = dict(observed)
last_month = int(last_observed[-2:])
target_2026 = observed['2025-12'] * (1 + assumptions['2026'])
remaining = 12 - last_month
rate_2026 = (target_2026 / observed[last_observed])**(1/remaining) if remaining else 1
assert rate_2026 >= 1, 'Inflation target contradicts observed accumulation: revise the assumption.'
for month in range(last_month+1, 13):
    months[f'2026-{month:02}'] = observed[last_observed] * rate_2026**(month-last_month)
for month in range(1, 13):
    months[f'2027-{month:02}'] = months['2026-12'] * (1+assumptions['2027'])**(month/12)
base = mean(observed[f'2026-{m:02}'] for m in [4, 5, 6])
annual = {str(y): mean(months[f'{y}-{m:02}'] for m in range(1, 13)) for y in range(2013, 2028)}
cifra_annual = {str(y): mean(inputs['cifraMonthly'][f'{y}-{m:02}'] for m in range(1, 13)) for y in range(2007, 2014)}
for year in range(2012, 2006, -1):
    annual[str(year)] = annual[str(year+1)] * cifra_annual[str(year)] / cifra_annual[str(year+1)]
# CIFRA starts in January 2007: it cannot supply an annual 2006–2007 bridge.
# Preserve the documented ratio of the supplied historical chain for this boundary only.
legacy = inputs['legacyAnnual']
for year in range(2006, 1996, -1):
    annual[str(year)] = annual[str(year+1)] * legacy[str(year)]['index'] / legacy[str(year+1)]['index']

budget_source = next(r['source'] for r in data['rows'] if r['year'] == 2026)
rows, current_rows, capital_rows, revenue_rows = [], [], [], []
for original in inputs['originals']:
    y = original['year']
    common = {'year': y, 'factor': base/annual[str(y)], 'priceIndexAnnual': annual[str(y)],
              'priceEstimated': False, 'kind': 'legacy' if y == 1997 else 'executed',
              'status': 'Registro histórico · criterio distinto' if y == 1997 else 'Gasto ejecutado' + (' · provisorio' if y == 2025 else '')}
    for out, key, cell in [(rows, 'total', 'cell'), (current_rows, 'currentPrimary', 'currentCell'), (capital_rows, 'capital', 'capitalCell')]:
        nominal = original[key]
        out.append({**common, 'nominal': nominal, 'real': nominal*common['factor'], 'cell': original[cell]})
    # The pre-1998 stage caveat in the official workbook refers to spending only.
    nominal = original['revenue']
    revenue_rows.append({**common, 'kind': 'executed',
                         'status': 'Recaudación efectiva' + (' · provisorio' if y == 2025 else ''),
                         'nominal': nominal, 'real': nominal*common['factor'], 'cell': original['revenueCell']})
for y, total, current, kind, status, source in [
    (2026, 19877152039294, 15565399800000, 'budget', 'Presupuesto vigente — 30/06/2026', budget_source),
    (2027, project['summary']['fiscalExpense']['value'], project['summary']['currentExpense']['value']-project['summary']['interest']['value'],
     'project', 'Proyecto de presupuesto 2027', project['source']['url'] or project['source']['document'])]:
    common = {'year': y, 'factor': base/annual[str(y)], 'priceIndexAnnual': annual[str(y)], 'priceEstimated': True,
              'kind': kind, 'status': status, 'source': source}
    rows.append({**common, 'nominal': total, 'real': total*common['factor'],
                 **({'sourceSha256': project['source']['fileSha256'], 'pdfPage': 3, 'reference': 'Artículo 1'} if y == 2027 else {})})
    current_rows.append({**common, 'nominal': current, 'real': current*common['factor'],
                         'source': project['source']['document'], 'sourceSha256': project['source']['fileSha256'],
                         'pdfPage': 157 if y == 2026 else 190,
                         'reference': 'Mensaje 2027, cuadro 5.1, PDF página 157; millones con un decimal' if y == 2026
                         else 'Planilla 16: gastos corrientes sin intereses; conciliado con corrientes del artículo 1 menos intereses de planilla 7',
                         'nominalPrecisionPesos': 100000 if y == 2026 else 1})
    capital = 4033207400000 if y == 2026 else project['summary']['capitalExpense']['value']
    capital_rows.append({**common, 'nominal': capital, 'real': capital * common['factor'],
                         'source': project['source']['document'], 'sourceSha256': project['source']['fileSha256'],
                         'pdfPage': 157 if y == 2026 else 3,
                         'reference': 'Mensaje 2027, cuadro 5.1, gastos de capital; millones con un decimal' if y == 2026 else 'Artículo 1: gastos de capital',
                         'nominalPrecisionPesos': 100000 if y == 2026 else 1})
    revenue = income['total']['v'] if y == 2026 else project['summary']['fiscalRevenue']['value']
    revenue_rows.append({**common, 'nominal': revenue, 'real': revenue*common['factor'],
                         'status': 'Ingresos previstos · vigente al 30/06/2026' if y == 2026 else 'Ingresos previstos · Proyecto 2027',
                         'source': income['sourceFile'] if y == 2026 else project['source']['document'],
                         'sourceSha256': sha(ROOT/'public/sources/recursos-2026-2.pdf') if y == 2026 else project['source']['fileSha256'],
                         'sourceDataset': 'data/revenue/income-2026-2.json' if y == 2026 else 'data/budget/2027/project.json',
                         **({'pdfPages': [5, 9], 'reference': 'Recursos corrientes y de capital, columna vigente; sin fuentes financieras'} if y == 2026
                            else {'pdfPage': project['summary']['fiscalRevenue']['pdfPage'], 'reference': project['summary']['fiscalRevenue']['reference']})})

data.update(schemaVersion=2, updated='2026-10-09', rows=rows,
            series={'total': {'label': 'Gasto total', 'definition': data['metric']},
                    'currentPrimary': {'label': 'Gasto corriente sin intereses', 'definition': 'Gasto corriente, sin intereses ni gasto de capital', 'rows': current_rows},
                    'capital': {'label': 'Gasto de capital', 'definition': 'Gasto de capital según el clasificador oficial: inversión real, transferencias de capital e inversión financiera; sin amortización de deuda', 'rows': capital_rows},
                    'revenue': {'label': 'Recaudación total', 'definition': 'Ingresos corrientes y recursos de capital, sin contribuciones figurativas ni fuentes financieras', 'rows': revenue_rows,
                                'method': '1997–2025: concepto 6) Recursos totales (1+4), cuadro IDECBA SP_Fi_AX01, fila física 24; millones convertidos a pesos. 2026: recursos vigentes al 30/06 de income-2026-2, no la recaudación parcial del semestre. 2027: recursos previstos, Planilla 16 del proyecto. Toda la serie usa el mismo ajuste por inflación que el gasto: IPCBA desde 2013, CIFRA 2007–2012 y empalme documentado anterior; base abril–junio 2026 y promedio anual de precios. Los promedios de 2026 y 2027 se estiman con inflación diciembre/diciembre de 30% y 18%.',
                                'notes': ['Recaudación total comprende recursos corrientes y de capital; no sólo impuestos. Excluye endeudamiento y otras fuentes financieras.',
                                          '2025 es provisorio. 2026 y 2027 son ingresos presupuestados, no recaudación efectiva. Sus importes reales dependen de los supuestos de inflación.',
                                          'La salvedad de etapa definitiva en 1997 corresponde al gasto, no a los recursos. Los hitos de traspaso de funciones del gasto no se trasladan a esta serie.']}},
            priceAdjustment={'name': 'IPCBA / IPC-Provincias CIFRA / empalme histórico aportado', 'baseIndex': base,
                'base': data['base'], 'annualAverage': annual, 'lastObservedMonth': last_observed,
                'observedMonthly': observed, 'projectedMonthly': {k:v for k,v in months.items() if k > last_observed},
                'assumptions': assumptions, 'assumptionStatus': 'Supuestos de escenario autorizados por el usuario; no inflación observada ni pronóstico propio de IDECBA',
                'projectionMethod': 'Conservar meses observados; llevar diciembre 2026 a diciembre 2025 × 1,30 con tasa mensual constante en el tramo restante. Diciembre 2027 = diciembre 2026 × 1,18 con tasa mensual constante en los doce meses. Usar promedio enero–diciembre para los presupuestos anuales.',
                'linkMethod': 'IPCBA promedio anual desde 2013. CIFRA 2007–2012 por cocientes de promedios anuales, anclado en IPCBA 2013. Para 1997–2006 conservar cocientes del empalme aportado; el enlace 2006–2007 usa el promedio 2007 de ese archivo, porque CIFRA no contiene 2006.',
                'ipcbaSource': {'url': 'https://www.estadisticaciudad.gob.ar/eyc/categoria-banco-datos/series-empalmadas/',
                               'file': 'sources/IPCBA-serie-empalmada.xlsx', 'sha256': sha(ROOT/'public/sources/IPCBA-serie-empalmada.xlsx'),
                               'sheet': 'Nivel_general_empalme', 'csvSha256': sha(ROOT/'data/history/ipcba.csv')},
                'inputs': inputs},
            method='1997–2025: cuadro IDECBA SP_Fi_AX01, conceptos 10) Gastos totales 2) Gastos corrientes (que excluye intereses) y 5) Gastos de capital; millones convertidos a pesos. Toda la serie: nominal × IPCBA promedio abril–junio 2026 / índice promedio anual empalmado. Desde 2013, IPCBA; 2007–2012, IPC-Provincias CIFRA; tramo anterior y enlace 2006–2007, empalme aportado documentado. Los presupuestos 2026 y 2027 se ajustan por un promedio anual estimado con inflación diciembre/diciembre de 30% y 18%, respectivamente.',
            notes=['1997 conserva la etapa definitiva de la convención antigua; desde 1998 se informa devengado. La conexión 1997–1998 permanece punteada.',
                   '2025 es provisorio en el cuadro oficial. Los hitos de nuevas responsabilidades no explican por sí solos toda la variación del gasto.',
                   '2026 es presupuesto anual actualizado al 30/06 y 2027 es proyecto: autorizaciones, no ejecución. Sus valores reales dependen de los supuestos de precios, conservan marcador distinto y conexión punteada.',
                   'El gasto corriente sin intereses excluye la inversión y los intereses; no equivale al gasto primario total, que también incluye capital.',
                   'CIFRA no tiene dato de 2006. Ese enlace conserva el cociente 2006–2007 del archivo aportado; no se atribuye a CIFRA ni se presenta toda la serie como un IPCBA oficial observado.',
                   'El dato corriente 2026 del mensaje está publicado en millones con un decimal. El dato 2027 se calcula con los importes exactos de la planilla, sin añadir proyectos separados.'])
data['events'][1].update(name='Traspaso de la Policía', label='2016–2017 · Traspaso de la Policía',
                        operationSource='https://buenosaires.gob.ar/gcaba_historico/noticias/asi-funciona-el-sistema-integral-de-seguridad-publica')
FILE.write_bytes((json.dumps(data, ensure_ascii=False, separators=(',', ':'))+'\n').encode('utf8'))
with FILE.with_suffix('.csv').open('w', encoding='utf-8', newline='') as f:
    columns=['serie','year','nominal','real','factor','priceIndexAnnual','priceEstimated','kind','status']
    writer=csv.DictWriter(f, fieldnames=columns, lineterminator='\n');writer.writeheader()
    for name, records in [('total',rows),('currentPrimary',current_rows),('capital',capital_rows),('revenue',revenue_rows)]:
        writer.writerows({'serie': name, **{k:r[k] for k in columns if k!='serie'}} for r in records)
print(json.dumps({'baseIndex':base,'lastObserved':last_observed,'total2026':rows[-2]['real'], 'total2027':rows[-1]['real'],
                  'growth2005_2025':(rows[28]['real']/rows[8]['real']-1)*100},ensure_ascii=False))
