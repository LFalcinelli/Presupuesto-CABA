"""Read the official 2026Q3 report and the public 2025Q3 detailed CSV.

Usage: python scripts/import-advance-2026-3.py REPORT.pdf DETAIL_2025.csv
Each classification is an independent table. Do not join them to invent cross-tabs.
"""
import csv
import hashlib
import json
import re
import sys
from collections import defaultdict
from decimal import Decimal as D
from pathlib import Path
from statistics import mean

from pypdf import PdfReader

R = Path(__file__).resolve().parents[1]
PDF, CSV = map(Path, sys.argv[1:])
DOC = 'DG Contaduría · Ejecución al 30/09/2026 · Exp. 3561/2026'
PORTAL = 'https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/direccion-general-contaduria/informacion-contable/ejecuciones-presupuestarias'
PDF25 = 'https://buenosaires.gob.ar/sites/default/files/2025-11/3ER_TRIMESTRE_2025.pdf'
CSV25 = 'https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2025-3.csv'
IPC = 'https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2026/10/ir_2026_2064.pdf'
DATE = '2026-11-17'
CUT = '2026-09-30'
P = PdfReader(PDF)
NUMBER = re.compile(r'^-?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{2})?$')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    return json.loads((R / path).read_text(encoding='utf-8'))


def dump(path, data):
    compact = path.endswith(('2026-3.json', 'manifest.json'))
    (R / path).write_text(json.dumps(data, ensure_ascii=False, indent=None if compact else 2,
                                   default=float) + '\n', encoding='utf-8', newline='\n')


def number(s):
    return D(s.replace('.', '').replace(',', '.'))


def scan(first, last, n, names):
    rows, totals = [], []
    for page in range(first, last + 1):
        text = P.pages[page-1].extract_text(extraction_mode='layout')
        for line in text.splitlines():
            # On page 33 the name touches the first amount; page 62 repeats it with spacing.
            if page == 33:
                line = line.replace('Terrorismo De Estado851.973.779,00', 'Terrorismo De Estado  851.973.779,00')
            bits = re.split(r'\s{2,}', line.strip())
            if len(bits) <= n or not all(NUMBER.fullmatch(b) for b in bits[-n:]):
                continue
            labels = bits[:-n]
            split = next((i for i,b in enumerate(labels) if not b.isdigit()), len(labels))
            codes, title = labels[:split], ' '.join(labels[split:])
            row = dict(name=title, page=page, **dict(zip(names, map(number, bits[-n:]))))
            if title.startswith('TOTAL'):
                totals.append(row)
            elif codes and all(c.isdigit() for c in codes):
                rows.append(dict(row, codes=codes))
            else:
                raise ValueError((page, labels))
    return rows, totals


def expense(first, last):
    return scan(first, last, 4, 's v c d'.split())


def reconcile(rows, totals, keys):
    for k in keys:
        assert abs(sum(r[k] for r in rows) - totals[k]) < D('1.00'), (k, totals[k], sum(r[k] for r in rows))


res, rt = scan(5, 13, 3, 's v r'.split())
income = dict(period='2026-3', sourceFile=DOC, sourceUrl=PORTAL, date=CUT, sha256=sha(PDF),
              rows=res, total={k:rt[0][k] for k in 'svr'})
reconcile([r for r in res if len(r['codes']) == 1], income['total'], 'svr')
economic, et = expense(20, 20)
t = {k:et[0][k] for k in 'svcd'}
function, _ = expense(77, 78)
object_, _ = expense(73, 75)
organization, _ = expense(22, 55)
geo, _ = expense(80, 80)
institutions, _ = expense(18, 18)
applications, at = expense(85, 85)
financing, ft = scan(84, 84, 3, 's v r'.split())
stock_page = P.pages[137].extract_text(extraction_mode='layout')
def stock_row(label):
    match = re.search(r'^\s*'+label+r'\s+([\d.]+,\d)\s+([\d.]+,\d)\s*$', stock_page, re.M)
    assert match, label
    return [int(number(s)*1_000_000) for s in match.groups()]

direct = stock_row('TOTAL')
indirect = stock_row('Deuda Indirecta: Aval AUSA')
debt = [{'date':date,'directUSD':d,'ausaGuaranteeUSD':g,'provisional':i==1}
        for i,(date,d,g) in enumerate(zip(('2025-12-31',CUT),direct,indirect))]
groups = dict(
    purposes=[r for r in function if len(r['codes']) == 1],
    functions=[r for r in function if len(r['codes']) == 2],
    jurisdictions=[r for r in organization if len(r['codes']) == 1],
    units=[r for r in organization if len(r['codes']) == 2],
    programs=[r for r in organization if len(r['codes']) == 3],
    objects=[r for r in object_ if len(r['codes']) == 1],
    objectDetails=[r for r in object_ if len(r['codes']) == 2],
    economic=economic, geography=geo, institutions=institutions,
)
for key, rows in groups.items():
    if key != 'geography':
        reconcile(rows, t, 'svd')
reconcile(geo, t, 'svd')

old = defaultdict(lambda: defaultdict(D))
total25, nonfiscal25 = D(0), D(0)
with CSV.open(encoding='cp1252', newline='') as f:
    for row in csv.DictReader(f, delimiter=';'):
        if not row['Eco']:
            continue
        amount = number(row['Devengado_Trim3_CONT'])
        if row['Eco'][:2] not in ('21', '22'):
            nonfiscal25 += amount
            continue
        total25 += amount
        for key, code in [('purposes', row['Fin']), ('functions', row['Fin']+'.'+row['Fun']),
                          ('objects', row['Inciso']), ('jurisdictions', row['Jur']),
                          ('economic', row['Eco'][:3]), ('geography', row['Geo'])]:
            old[key][code] += amount
reported25 = D('8787863141668.80')  # 2025 report, institutional total.
assert abs(total25-reported25) < D('500'), total25  # Public CSV rounds each detail row to pesos.

ipc = dict(line.split(',') for line in (R/'data/history/ipcba.csv').read_text(encoding='utf-8').splitlines()[1:])
ipc['2026-09'] = '2644.33'
prices = {str(y): mean(D(ipc[f'{y}-{m:02d}']) for m in range(1,10)) for y in (2025, 2026)}
factor = prices['2026']/prices['2025']
for key, previous in old.items():
    for row in groups[key]:
        code = '.'.join(row['codes'])
        # A new or missing code is not evidence of a comparable start/stop.
        row['previous'] = previous.get(code)
        if key == 'jurisdictions' and code == '31':
            row['comparisonNote'] = 'Mismo código: Infraestructura en 2025; Movilidad e Infraestructura en 2026.'

res_by = {'.'.join(r['codes']): r for r in res}
# Source: 2025Q3 official report, fiscal income total and economic/rubro table, pp. 5–13.
old_income = D('9711037305964.69')
old_receipts = {'1.11': '8075709198734.11', '1.12': '213267697152.58',
                '1.14': '140850664361.63', '1.16': '325568178134.19',
                '1.17': '943315137848.08', '2': '12326429734.10'}
assert sum(map(D, old_receipts.values())) == old_income
revenue_comparison = [dict(res_by[k], previous=D(v)) for k,v in old_receipts.items()]
current = sum(r['d'] for r in economic if r['codes'][0].startswith('21'))
capital = t['d'] - current
current_income = res_by['1']['r']
fiscal = dict(income=income['total']['r'], expense=t['d'], currentIncome=current_income,
              capitalIncome=income['total']['r']-current_income, currentExpense=current,
              capitalExpense=capital, financialResult=income['total']['r']-t['d'],
              propertyExpense=next(r['d'] for r in economic if r['codes']==['214']),
              previousIncome=old_income, previousExpense=reported25,
              previousFinancialResult=old_income-reported25)
fiscal['financialRatio'] = 100*fiscal['financialResult']/fiscal['income']
fiscal['previousFinancialRatio'] = 100*fiscal['previousFinancialResult']/old_income
data = dict(schemaVersion=1, year=2026, quarter=3, date=CUT, sourceFile=DOC, sourceUrl=PORTAL,
            sha256=sha(PDF), sourceReport={'document':DOC,'expediente':'3561/2026',
              'governmentReference':'EX-2026-50728393-GCABA-DGCG','pages':{'income':[5,13],
               'economic':20,'programs':[22,55],'objects':[73,75],'functions':[77,78],
               'geography':80,'financing':[84,85],'stockUSD':138},
              'reportId':'IF-2026-50891199-GCABA-DGCG'}, fiscalTotals=t, groups=groups, debt=debt,
            fiscal=fiscal, revenueComparison=revenue_comparison,
            financing={'sources':financing, 'applications':applications,
                       'totalSources':ft[0]['r'], 'totalApplications':at[0]['d']},
            priceComparison={'reference':'Promedios de enero a septiembre · IPCBA',
               'averageIndex':prices,'factor':factor,'source':IPC},
            previousSources={'income':PDF25,'expense':CSV25,'expenseHash':sha(CSV)},
            notes=['Cifras provisorias. Flujos acumulados de enero a septiembre.',
              'Sin figurativas ni financiamiento en el saldo fiscal.',
              'Las aperturas del PDF son independientes: no se cruzan partidas con áreas o funciones.',
              'El código 214 del informe agrupa rentas de la propiedad; no identifica por separado el código 21410000.'])
dump('data/budget/2026/2026-3.json', data)
dump('data/revenue/income-2026-3.json', income)
with (R/'data/budget/2026/2026-3.csv').open('w', encoding='utf-8', newline='') as f:
    writer=csv.writer(f,lineterminator='\n')
    writer.writerow(['apertura','códigos','nombre','página','votado','vigente','comprometido','devengado','devengado_ene_sep_2025'])
    for key, rows in groups.items():
        for r in rows:
            writer.writerow([key,'.'.join(r['codes']),r['name'],r['page'],r['s'],r['v'],r['c'],r['d'],r.get('previous')])
with (R/'data/revenue/income-2026-3.csv').open('w', encoding='utf-8', newline='') as f:
    writer=csv.writer(f,lineterminator='\n')
    writer.writerow(['códigos','rubro','página','votado','vigente','realizado'])
    for r in res:
        writer.writerow(['.'.join(r['codes']),r['name'],r['page'],r['s'],r['v'],r['r']])

catalog = read('data/index.json')
for key, path, label in [('2026-3','data/budget/2026/2026-3','Gastos · enero a septiembre 2026'),
                         ('income-2026-3','data/revenue/income-2026-3','Ingresos · enero a septiembre 2026')]:
    catalog['datasets'] = [d for d in catalog['datasets'] if d['id'] != key]
    catalog['datasets'].append(dict(id=key, name=label, path=path+'.json', period='2026-3',
                                   lastUpdate=DATE, source=PORTAL, type='official',
                                   description=DOC, files=[path+'.json',path+'.csv']))
dump('data/index.json',catalog)
manifest = read('data/budget/manifest.json')
manifest['periods'] = [p for p in manifest['periods'] if (p['year'],p['quarter']) != (2026,3)]
manifest['periods'].append({k:data[k] for k in ['schemaVersion','year','quarter','sourceFile','sourceUrl','sha256','fiscalTotals']} |
    {'aggregateOnly':True, 'factors':{'s':1,'v':1,'d':1}})
manifest['updated']=DATE
dump('data/budget/manifest.json', manifest)
now=read('data/budget/2026/current.json')
now.update(budget=t['v'],executed=t['d'],date=CUT,source=PORTAL,quarter=3,period='2026-3',
           perCapita=t['v']/D(now['population']),sourceReference=DOC)
dump('data/budget/2026/current.json',now)
print('2026Q3: fiscal',fiscal,'IPCBA',prices, 'files/groups', {k:len(v) for k,v in groups.items()})
