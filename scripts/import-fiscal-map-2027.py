"""Import the supplied map workbook and the official investment plan.

Usage: python scripts/import-fiscal-map-2027.py --workbook <xlsx> --pdf <pdf>
       --pdf-text-dir <directory of p001.txt ... p297.txt extracted with pdftotext -layout>
The source files remain local. Only reconciled data and provenance are published.
"""
import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]


def normal(text):
    return ''.join(c for c in unicodedata.normalize('NFKD', text).upper() if not unicodedata.combining(c) and c.isalnum())


def save(name, data):
    (ROOT / 'data/budget/2027' / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--workbook', required=True)
    parser.add_argument('--pdf', required=True)
    parser.add_argument('--pdf-text-dir', required=True)
    args = parser.parse_args()
    book_path, pdf_path, pages = Path(args.workbook), Path(args.pdf), Path(args.pdf_text_dir)
    project = json.loads((ROOT / 'data/budget/2027/project.json').read_text('utf-8'))
    pdf_hash = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
    assert pdf_hash == project['source']['fileSha256'], 'Primary PDF must match the existing verified project'
    wb = openpyxl.load_workbook(book_path, data_only=True, read_only=True)
    sheets = {s.title: list(s.values) for s in wb}
    assert len(sheets) == 9
    source = {**project['source'], 'workbook': book_path.name,
              'workbookSha256': hashlib.sha256(book_path.read_bytes()).hexdigest()}
    nodes = []
    def node(id, parent, label, official, value, side, view, sheet, row, page, reference):
        return dict(id=id, parent=parent, label=label, officialLabel=official, value=int(value),
                    side=side, view=view, workbookCell=f'{sheet}!F{row}' if sheet != '03_ALTERNATIVAS' else f'{sheet}!E{row}',
                    pdfPage=page, reference=reference)
    for i, r in enumerate(sheets['01_RECURSOS'][1:], 2):
        page = 190 if r[0] == 'rec_total' else 185 if r[0].startswith(('tr_', 'rec_transfer', 'rec_capital', 'rent_titulos', 'rent_dividendos')) else 184 if r[0].startswith(('rent_', 'rec_rentas', 'rec_ventas', 'nt_multas', 'nt_otros')) else 183
        n = node(r[0], r[2], r[3], r[4], r[5], 'income', 'all', '01_RECURSOS', i, page, 'Planilla 11 · recursos por rubro' if page != 190 else 'Planilla 16 · cuenta ahorro-inversión-financiamiento')
        nodes.append(n)
    for i, r in enumerate(sheets['02_GASTO_FUNCION'][1:], 2):
        nodes.append(node(r[0], r[2], r[4], r[4], r[5], 'spend', 'purpose', '02_GASTO_FUNCION', i, 174, 'Planilla 5 · finalidad y función'))
    views = {'Cómo se compone': 'economic', 'Qué compra': 'object', 'Quién ejecuta': 'who'}
    for i, r in enumerate(sheets['03_ALTERNATIVAS'], 1):
        if len(r) < 5 or r[2] not in views or not isinstance(r[4], (int, float)):
            continue
        view = views[r[2]]
        nodes.append(node(r[0], r[1], r[3], r[3], r[4], 'spend', view, '03_ALTERNATIVAS', i,
                          {'economic': 170, 'object': 173, 'who': 175}[view],
                          {'economic': 'Planilla 1 · clasificación económica', 'object': 'Planilla 4 · objeto por jurisdicción', 'who': 'Planilla 6 · jurisdicciones'}[view]))
    by_id = {n['id']: n for n in nodes}
    assert len(by_id) == len(nodes)
    revenue, expense = (project['summary'][k]['value'] for k in ['fiscalRevenue', 'fiscalExpense'])
    assert by_id['rec_total']['value'] == revenue and by_id['gasto_total']['value'] == expense
    for n in nodes:
        kids = [c for c in nodes if c['parent'] == n['id']]
        if kids:
            for view in set(c['view'] for c in kids):
                assert sum(c['value'] for c in kids if c['view'] == view) == n['value'], (n['id'], view)
        n['per100'] = n['value'] / (revenue if n['side'] == 'income' else expense) * 100
        n['children'] = [c['id'] for c in kids]
    # Cross-check classifications against the independent, previously verified PDF importer.
    for view, key in [('purpose', 'purposes'), ('who', 'jurisdictions'), ('object', 'objects')]:
        actual = sorted(n['value'] for n in nodes if n['parent'] == 'gasto_total' and n['view'] == view)
        assert actual == sorted(r['value'] for r in project['breakdowns'][key]), view
    assert sorted(n['value'] for n in nodes if n['view'] == 'purpose' and n['parent'] not in [None, 'gasto_total']) == sorted(r['value'] for r in project['breakdowns']['functions'])
    page_text = '\n'.join((pages / f'p{p:03}.txt').read_text('utf-8') for p in [183, 184, 185])
    derived = {
        'rec_tributos_propios': ('Ingresos tributarios menos coparticipación federal', 19094214003433 - 2225985000000),
        'tax_sellos': ('Sellos más Sellos - Fondo SUBTE', 1210423068392 + 238477957548),
        'tr_nacion_otros': ('Transferencias nacionales menos transferencia del expediente CSJN 1865/2020', 2823610915829 - 2789860504857),
        'nt_otros': ('Alquileres más otros ingresos no tributarios', 1176399880 + 88533371175),
    }
    for n in nodes:
        if n['side'] != 'income' or n['id'] == 'rec_total':
            continue
        if n['id'] in derived:
            method, value = derived[n['id']]
            assert value == n['value'], n['id']
            n['calculation'] = method
        else:
            assert f"{n['value']:,}".replace(',', '.') in page_text, ('Resource absent from PDF', n['id'])
    closing = dict(id='resultado_financiero', parent=None, label='Resultado financiero', officialLabel='Resultado financiero',
                   value=revenue-expense, side='balance', view='all', pdfPage=190, reference='Planilla 16 · CAIF',
                   workbookCell='00_LEEME!B10', children=[], per100=(revenue-expense)/revenue*100)
    nodes.append(closing); by_id[closing['id']] = closing
    # Inspect workbook edges and UX specification; supplement economic children missing from its edge table.
    edges = []
    for r in sheets['04_FLOW_EDGES'][1:]:
        assert r[2] in by_id and r[4] in by_id
        assert int(r[6]) == by_id[r[2] if r[2] != 'rec_total' and by_id[r[2]]['side'] == 'income' else r[4]]['value']
        edges.append(dict(id=r[0], view=r[1], source=r[2], target=r[4], value=int(r[6])))
    for r in sheets['05_NODES_UX'][1:]:
        assert r[0] in by_id
    # Normalized table is an independent check, never a second source of rounded shares.
    for r in sheets['08_CADA_100'][3:]:
        if len(r) >= 4 and r[3] in by_id:
            assert r[1] == by_id[r[3]]['value'] and abs(r[2] - by_id[r[3]]['per100']) < 1e-10
        if len(r) >= 9 and isinstance(r[7], (int, float)):
            assert abs(r[8] - r[7] / expense * 100) < 1e-10
    save('fiscal-map.json', dict(schemaVersion=1, year=2027, status='project', date='2026-09-30',
         unit='ARS nominales de 2027', universe=project['universe'], source=source,
         totals=dict(revenue=revenue, expense=expense, financialResult=revenue-expense), nodes=nodes, workbookEdges=edges,
         viewRoots=dict(purpose='gasto_total', who='gasto_total', object='gasto_total', economic='gasto_total'),
         exclusions=['Figurativas', 'Fuentes financieras', 'Aplicaciones financieras', 'Proyectos complementarios'],
         adaptations=['Las páginas son físicas del PDF completo, corregidas respecto de referencias genéricas del Excel.',
                      'La vista económica incluye los hijos presentes en 03_ALTERNATIVAS aunque no figuren en 04_FLOW_EDGES.',
                      'Cada $100 se calcula sin redondear; la interfaz presenta un decimal y distingue las dos bases.']))
    # The three stages use the same fiscal perimeter and classification codes.
    current = json.loads((ROOT / 'data/budget/2026/2026-2.json').read_text('utf-8'))
    stages = dict(schemaVersion=1, source2026=dict(url=current['sourceUrl'], sha256=current['sha256']), source2027=project['source'],
                  unit='ARS nominales de cada año', date2026='2026-06-30', status2027='project',
                  totals=dict(initial=round(current['fiscalTotals']['s']), current=round(current['fiscalTotals']['v']), project=expense), groups={})
    for key, dim in [('purposes', 6), ('objects', 8)]:
        groups = {}
        for row in current['rows']:
            if not row['fiscal']:
                continue
            name = normal(row['names'][dim]) if key == 'purposes' else row['codes'][dim][0]
            g = groups.setdefault(name, [0, 0])
            g[0] += row['s']; g[1] += row['v']
        stages['groups'][key] = []
        for row in project['breakdowns'][key]:
            name = normal(row['name']) if key == 'purposes' else row['id']
            a, b = groups.pop(name, [0, 0])
            stages['groups'][key].append(dict(name=row['name'], id=row['id'], initial=round(a), current=round(b), project=row['value'], pdfPage=row['pdfPage']))
        assert not any(a or b for a, b in groups.values()), groups
        for stage in stages['totals']:
            assert abs(sum(r[stage] for r in stages['groups'][key]) - stages['totals'][stage]) <= 1
    save('stages.json', stages)
    # Official project rows, by their full six-part code: do not count activity/works rows again.
    fields = ['Jur', 'Og', 'UE', 'Pg.', 'Sg.', 'Py.', 'Ac.', 'Ob.', 'FF']
    context, names, works = [0] * 6, [''] * 6, {}
    for page in range(240, 295):
        lines = (pages / f'p{page:03}.txt').read_text('utf-8').splitlines()
        header = next((l for l in lines if all(f in l for f in fields)), None)
        if not header:
            continue
        positions = [header.index(f) for f in fields]
        for line in lines:
            hit = re.match(r'^(\s*)(\d+)\s+(.+?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*$', line)
            if not hit:
                continue
            leading, code, name, a, b, c = hit.groups()
            level = next((i for i in range(8) if positions[i] <= len(leading) < positions[i+1]), None)
            if level is None or level > 5:
                continue
            context[level] = int(code); names[level] = ' '.join(name.split())
            for i in range(level+1, 6):
                context[i] = 0; names[i] = ''
            if level == 5:
                key = '-'.join(map(str, context))
                row = dict(id=key, codes=context.copy(), name=names[5], jurisdiction=names[0], program=names[3],
                           amounts=[int(v.replace('.', '')) for v in [a,b,c]], pdfPage=page)
                if key in works:
                    assert works[key]['amounts'] == row['amounts']
                works[key] = row
    totals = [sum(r['amounts'][i] for r in works.values()) for i in range(3)]
    assert len(works) == 309 and totals == [4170360367357, 2907671643815, 2733674774519]
    save('investments.json', dict(schemaVersion=1, years=[2027,2028,2029], status='project', source=project['source'],
          reference='Plan Plurianual de Inversiones Públicas 2027–2029 · páginas 240–296', totals=totals, projects=list(works.values()),
          limitations=['Previsiones del plan, no ejecución ni garantía de terminación.', 'Los proyectos se identifican por código oficial; un proyecto puede agrupar varias obras.',
                       'Los montos de distintos años son nominales; no se informa una variación real entre ellos.', 'El plan no equivale al total de gastos de capital de la CAIF.']))
    print(f'Validated: {len(nodes)} nodes, {len(edges)} supplied edges, 4 perspectives, 3 stages, {len(works)} investment projects.')


if __name__ == '__main__':
    main()
