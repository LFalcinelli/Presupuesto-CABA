"""Offline jurisdiction importer. PDFs stay outside the repository.

python scripts/import-government-areas.py --pdf-2026 FILE --pdf-2027 FILE --code 31
Requires pdfplumber (preparation only; never used by the website or CI build).
Run after build-area-reports-2027.py. Reviewed functional matches are separate
from extraction: unknown continuities remain pending, never automatic deletions.
"""
import argparse
from collections import defaultdict
from decimal import Decimal
from difflib import SequenceMatcher
import hashlib
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
OBJECTS = ['Gastos en personal', 'Bienes de consumo', 'Servicios no personales',
           'Bienes de uso', 'Transferencias', 'Activos financieros',
           'Servicio de la deuda y disminución de otros pasivos', 'Otros gastos']
FINANCING_LABELS = {'11':'Tesoro de la Ciudad', '12':'Recursos propios',
    '13':'Recursos con afectación específica', '14':'Transferencias afectadas',
    '15':'Transferencias internas', '21':'Financiamiento interno', '22':'Financiamiento externo'}
FINANCING_SOURCE = 'https://buenosaires.gob.ar/sites/default/files/2023-11/35.%20Ministerio%20de%20Ambiente%20y%20Espacio%20P.pdf'


def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))


def write(path, data):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')


def norm(value):
    return re.sub('[^a-z0-9]', '', unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower())


def amount(value):
    clean = re.sub(r'\s+', '', value).replace('.', '')
    if not re.fullmatch(r'\d+', clean):
        raise ValueError('Invalid numeric cell: ' + value)
    return int(clean)


def extract(path, year, code):
    import pdfplumber
    result = {'source': {'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                         'year': year, 'status': 'project', 'url': None},
              'units': [], 'programs': [], 'financing': [], 'positions': None}
    descriptions = defaultdict(lambda: {'pages': [], 'text': ''})
    financial = {}
    with pdfplumber.open(path) as pdf:
        result['source']['pages'] = len(pdf.pages)
        for page_number, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ''
            if 'PROGRAMA POR UNIDAD EJECUTORA' in text:
                if f'PROYECTO DE PRESUPUESTO {year}' not in text:
                    raise ValueError('Unexpected budget year')
                for line in text.splitlines():
                    match = re.fullmatch(r'((?:\d+\s+){1,6})(.+?)\s+([\d.]+)', line)
                    if not match:
                        continue
                    codes = match[1].split()
                    if codes[0] != code:
                        raise ValueError('Unexpected jurisdiction')
                    row = {'codes': codes, 'name': match[2], 'value': amount(match[3]), 'pdfPage': page_number}
                    if len(codes) == 1:
                        result['total'] = row['value']
                    elif len(codes) == 4:
                        result['units'].append(row)
                    elif len(codes) == 5:
                        result['programs'].append(row)
                    # Subprograms and repeated parent totals are not additive.
            if 'PROGRAMA POR FUENTE DE FINANCIAMIENTO' in text:
                header = next(l for l in text.splitlines() if l.startswith('Jur') and 'Fte' in l)
                sources = re.findall(r'Fte(\d+)', header)
                for line in text.splitlines():
                    m = re.fullmatch(r'(\d+)\s+([^\d]+?)\s+((?:[\d.]+\s+){' + str(len(sources)) + r'}[\d.]+)', line)
                    if not m:
                        continue
                    values = [amount(v) for v in m[3].split()]
                    assert sum(values[:-1]) == values[-1]
                    result['financing'] = [{'code': c, 'name': FINANCING_LABELS.get(c, 'Fuente '+c), 'value': v, 'pdfPage': page_number}
                                           for c, v in zip(sources, values[:-1])]
            if 'DESCRIPCIÓN DEL PROGRAMA' in text:
                m = re.search(r'Programa N°\s*(\d+)\.(.*?)\nUNIDAD RESPONSABLE:\s*(.*?)\nDESCRIPCIÓN:\s*(.*)', text, re.S)
                if m:
                    key = (m[1], norm(m[3]))
                    descriptions[key]['pages'].append(page_number)
                    descriptions[key]['text'] += ' ' + re.sub(r'\s+', ' ', m[4]).strip()
            if 'PRESUPUESTO FINANCIERO' in text:
                m = re.search(r'Programa:\s*(\d+) (.*?)\nUnidad Ejecutora:\s*(.*?)\nJurisdicción:', text, re.S)
                if not m:
                    continue
                objects = []
                for i, name in enumerate(OBJECTS, 1):
                    cell = re.search(r'^' + re.escape(name) + r'\s+([\d.]+)\s*$', text, re.M)
                    objects.append({'code': str(i), 'name': name, 'value': amount(cell[1]) if cell else 0})
                classification_note = None
                # The Subterráneos fiche omits the inciso-3 heading. Its only
                # services principal is printed with its amount. Classify that
                # named principal in inciso 3 (also used in the official 2026
                # classifier); subsequently reconcile all eight incisos with
                # Planilla 4. No residual is allocated by subtraction.
                if not objects[2]['value']:
                    principal = re.search(r'^Servicios Especializados, Comerciales y Financieros\s+([\d.]+)\s*$', text, re.M)
                    if principal:
                        objects[2]['value'] = amount(principal[1])
                        classification_note = 'La ficha omite el título del inciso 3; el principal Servicios Especializados, Comerciales y Financieros se clasifica como servicios no personales. Importe explícito; conciliado con Planilla 4.'
                if not objects[1]['value']:
                    consumption = ['Productos alimenticios, agropecuarios y forestales', 'Textiles y vestuario',
                        'Pulpa,papel, cartón y sus productos', 'Productos de cuero y caucho',
                        'Productos químicos, combustibles y lubricantes', 'Otros bienes de consumo']
                    for principal_name in consumption:
                        cell = re.search(r'^' + re.escape(principal_name) + r'\s+([\d.]+)\s*$', text, re.M)
                        if cell:
                            objects[1]['value'] += amount(cell[1])
                    if objects[1]['value']:
                        classification_note = (classification_note or '') + ' La ficha omite el título del inciso 2; se suman los principales de bienes de consumo explícitos, sin asignar residuos.'
                total = re.search(r'^TOTAL\s+([\d.]+)', text, re.M)
                if not total or sum(o['value'] for o in objects) != amount(total[1]):
                    raise ValueError(f'Unreconciled financial detail, page {page_number}')
                targets = []
                for line in text.splitlines():
                    if line.startswith(('META ', 'PRODUCCION ', 'PRODUCCIÓN ')):
                        targets.append({'officialText': line, 'pdfPage': page_number})
                financial[(m[1], norm(m[3]))] = {'objects': objects, 'financialPage': page_number, 'classificationNote': classification_note,
                                                 'targets': targets, 'total': amount(total[1])}
            if 'Cantidad de Cargos por Unidad Ejecutora' in text:
                for line in text.splitlines():
                    m = re.match(r'^' + code + r'\s+\d+\s+' + code + r'\s+[^\d]+((?:\d+\s+){10}\d+)$', line)
                    if m:
                        values = [int(v) for v in m[1].split()]
                        assert sum(values[:-1]) == values[-1]
                        result['positions'] = {'value': values[-1], 'pdfPage': page_number,
                            'scope': 'Cargos de los escalafones incluidos en el cuadro; no es la dotación total.',
                            'exclusions': 'No incluye autoridades superiores, plantas de gabinete, carrera gerencial, carrera profesional hospitalaria, personal docente ni plantas transitorias.'}
    assert result.get('total') is not None and result['units'] and result['programs']
    assert sum(u['value'] for u in result['units']) == result['total']
    assert sum(p['value'] for p in result['programs']) == result['total']
    for unit in result['units']:
        assert sum(p['value'] for p in result['programs'] if p['codes'][:4] == unit['codes']) == unit['value']
    for program in result['programs']:
        unit = next(u for u in result['units'] if u['codes'] == program['codes'][:4])
        key = (program['codes'][4], norm(unit['name']))
        desc = descriptions.get(key)
        detail = financial.get(key)
        if not desc or not detail or detail['total'] != program['value']:
            raise ValueError('Missing or ambiguous program detail: ' + str(program['codes']))
        program.update(detail)
        program['description'] = desc['text'].strip()
        program['descriptionPages'] = desc['pages']
    assert sum(f['value'] for f in result['financing']) == result['total']
    return result


def aggregate_current(snapshot, code, depth):
    groups = {}
    for row in snapshot['rows']:
        if not row['fiscal'] or row['codes'][1] != code:
            continue
        key = '-'.join(row['codes'][:depth])
        item = groups.setdefault(key, {'codes': row['codes'][:depth], 'name': row['names'][depth-1],
            'initial2026': Decimal(0), 'current2026': Decimal(0), 'executed2026': Decimal(0),
            'objects': {str(i): {'code': str(i), 'name': name, 'initial2026': Decimal(0),
                         'current2026': Decimal(0), 'executed2026': Decimal(0)} for i, name in enumerate(OBJECTS, 1)}})
        for stage, field in [('initial2026', 's'), ('current2026', 'v'), ('executed2026', 'd')]:
            value = Decimal(str(row[field]))
            item[stage] += value
            item['objects'][row['codes'][8]][stage] += value
    return groups


def serial(value):
    if isinstance(value, Decimal):
        return int(value) if value == value.to_integral_value() else float(value)
    if isinstance(value, dict):
        return {k: serial(v) for k, v in value.items()}
    if isinstance(value, list):
        return [serial(v) for v in value]
    return value


def rates(row):
    base = row.get('current2026')
    row['nominalVariationPct'] = (row['project2027']/float(base)-1)*100 if base else None
    row['realVariationPct'] = (row['project2027']/1.18/float(base)-1)*100 if base else None
    row['realChangeAmount'] = row['project2027']/1.18-float(base) if base is not None else None


def people_metadata(reports):
    directory = read('data/government/government-directory.json')
    nodes = {n['id']: n for n in directory['nodes']}
    # Exact ministry roots only. Jefatura/vicejefatura and other powers are not
    # assigned without a verified budget-to-directory boundary.
    mapping = {'8': 1, '9': 38, '21': 654, '24': 1053, '29': 916, '31': 2237,
               '35': 1304, '40': 1425, '45': 1707, '50': 1806, '55': 1945, '60': 2044, '75': 2322}
    assigned = set()
    for area in reports['areas']:
        root = mapping.get(area['code'])
        indices = set()
        pending = [root] if root else []
        while pending:
            node = nodes[pending.pop()]
            indices.update(node['people'])
            pending.extend(node['children'])
        assert not assigned.intersection(indices), 'Duplicate people across ministries'
        assigned.update(indices)
        area['officials'] = {'value': len(indices) if root else None, 'year': 2026, 'rootNode': root,
            'scope': 'Personas del padrón oficial: autoridades superiores, carrera gerencial y otras autoridades, dentro de esta dependencia y sus descendientes.',
            'cut': None, 'checkedAt': directory['checkedAt'], 'cutNote': 'Padrón 2026; el catálogo no publica un corte único. No es una dotación de 2027.',
            'sourceUrl': directory['source'], 'sourceSha256': directory['sourceSha256']}
        area['institutionType'] = ('Ministerio' if area['code'] in ['24','29','31','35','40','45','50','55','60','75'] else
                                   'Conducción del Ejecutivo' if area['code'] in ['20','21'] else
                                   'Partida transversal' if area['code'] in ['98','99'] else 'Otros poderes y organismos')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf-2026', type=Path, required=True)
    parser.add_argument('--pdf-2027', type=Path, required=True)
    parser.add_argument('--code', required=True)
    args = parser.parse_args()
    code = str(int(args.code))
    reports = read('data/budget/2027/area-reports.json')
    snapshot = read('data/budget/2026/2026-2.json')
    previous, proposed = extract(args.pdf_2026, 2026, code), extract(args.pdf_2027, 2027, code)
    area = next(a for a in reports['areas'] if a['code'] == code)
    assert proposed['total'] == area['project2027'], 'Jurisdiction total differs from Planilla 4'
    current_units = aggregate_current(snapshot, code, 5)
    current_programs = aggregate_current(snapshot, code, 6)
    review_file = ROOT / f'data/budget/2027/area-reviews/{code}.json'
    review = json.loads(review_file.read_text(encoding='utf-8')) if review_file.exists() else {'matches': [], 'changes': []}
    overrides = {m['target']: m for m in review['matches']}
    old_by_key = {'-'.join(p['codes']): p for p in previous['programs']}
    used = set()
    programs = []
    for p in proposed['programs']:
        key = '-'.join(p['codes'])
        match = overrides.get(key)
        if match:
            antecedents = match['sources']
            evidence = match['evidence']
            status = match['status']
        elif key in old_by_key and norm(p['name']) == norm(old_by_key[key]['name']):
            # A coincident label is a candidate, not a reviewed functional match.
            antecedents, evidence, status = [], 'Coincidencia de código y nombre; requiere revisar funciones.', 'pending'
        else:
            antecedents, evidence, status = [], 'Sin correspondencia funcional revisada.', 'pending'
        current = [current_programs.get('1-' + source) for source in antecedents]
        assert not used.intersection(antecedents), 'Repeated 2026 program in functional matches'
        assert all(source in old_by_key for source in antecedents), 'Unknown 2026 source program'
        if antecedents and not all(current):
            raise ValueError('Reviewed predecessor absent from June 2026 snapshot')
        used.update(antecedents)
        row = {**p, 'id': key, 'unitCode': p['codes'][3], 'code': p['codes'][4], 'project2027': p['value'],
               'comparisonStatus': status, 'comparisonEvidence': evidence, 'antecedents': antecedents,
               'previousDescriptions': [{'id': s, 'pages': old_by_key[s]['descriptionPages'],
                   'text': old_by_key[s]['description']} for s in antecedents]}
        if not antecedents:
            candidates = sorted(old_by_key.items(), key=lambda item:SequenceMatcher(None,
                norm(p['name']+' '+p['description']), norm(item[1]['name']+' '+item[1]['description'])).ratio(), reverse=True)[:3]
            row['candidates2026'] = [{'id':k, 'name':v['name'], 'pages':v['descriptionPages'],
                'status':'candidate-only', 'reason':'Sugerencia por similitud textual para revisión; no prueba continuidad ni se usa en los cálculos.'} for k,v in candidates]
        for stage in ['initial2026','current2026','executed2026']:
            row[stage] = sum((r[stage] for r in current), Decimal(0)) if current else None
        for o in row['objects']:
            o['project2027'] = o.pop('value')
            for stage in ['initial2026','current2026','executed2026']:
                o[stage] = sum((r['objects'][o['code']][stage] for r in current), Decimal(0)) if current else None
        rates(row)
        programs.append(row)
    units = []
    for p in proposed['units']:
        old = current_units.get('1-' + '-'.join(p['codes']))
        children = [r for r in programs if r['codes'][:4] == p['codes']]
        old_children = {k for k, v in current_programs.items() if v['codes'][:5] == (old or {}).get('codes')}
        matched_children = {'1-' + a for r in children for a in r['antecedents']}
        same_scope = old is not None and matched_children == old_children and all(r['comparisonStatus'] in ['continues','recoded'] for r in children)
        row = {'id': '-'.join(p['codes']), 'codes': p['codes'], 'code': p['codes'][3], 'name': p['name'],
               'project2027': p['value'], 'pdfPage': p['pdfPage'],
               'comparisonStatus': 'continues' if same_scope else 'reorganized',
               'comparisonEvidence': 'Misma unidad y programas; funciones contrastadas en ambos documentos.' if same_scope else 'El perímetro de programas cambia; la diferencia de la unidad no equivale al cambio del mismo servicio.',
               'objects': [{'code': str(i), 'name': name, 'project2027': sum(r['objects'][i-1]['project2027'] for r in children)} for i,name in enumerate(OBJECTS,1)]}
        for stage in ['initial2026','current2026','executed2026']:
            row[stage] = old[stage] if old else None
        rates(row)
        units.append(row)
        legacy = next((r for r in reports['units'] if r['codes'] == ['1'] + p['codes']), None)
        if legacy:
            legacy['detail2027'] = {'path': f'data/budget/2027/areas/{code}.json', 'unitId': row['id'], 'project2027': row['project2027']}
            # Keep legacy fields as a base-2026 view; the dedicated detail owns the
            # verified 2027 opening. No inferred ministry budget is assigned here.
    fiscal_rows = [r for r in snapshot['rows'] if r['fiscal'] and r['codes'][1] == code]
    stages = {stage: sum((Decimal(str(r[field])) for r in fiscal_rows), Decimal(0))
              for stage, field in [('initial2026','s'),('current2026','v'),('executed2026','d')]}
    for stage, value in stages.items():
        area[stage] = serial(value)
    area['detailFile'] = f'data/budget/2027/areas/{code}.json'
    assert sum(p['project2027'] for p in programs) == area['project2027']
    for i, o in enumerate(area['objects']):
        assert sum(p['objects'][i]['project2027'] for p in programs) == o['project2027']
    unmatched = [{'id': k, 'name': p['name'], 'pages': p['descriptionPages'], 'status':'pending',
                  'reason': 'No tiene una correspondencia revisada. No se interpreta como eliminación.'}
                 for k,p in old_by_key.items() if k not in used]
    detail = {'schemaVersion':1, 'jurisdictionCode':code, 'name':area['name'], 'year':2027,
              'status':'project', 'referencePeriod':'2026-2', 'deflator':reports['deflator'],
              'sources':{'2027':proposed['source'], '2026':previous['source'], 'current2026':reports['sources']['2026-2']},
              'stages':{**stages, 'originalProject2026':previous['total'], 'project2027':area['project2027']},
              'originalEqualsApproved':previous['total']==stages['initial2026'],
              'financing':proposed['financing'], 'financingLabelSource':FINANCING_SOURCE, 'positions':proposed['positions'],
              'units':units, 'programs':programs, 'changes':review['changes'], 'unmatched2026':unmatched,
              'unmatchedCurrent2026':[{'id':k, 'name':p['name'], 'initial2026':p['initial2026'],
                  'current2026':p['current2026'], 'executed2026':p['executed2026'], 'status':'pending'}
                  for k,p in current_programs.items() if k[2:] not in used],
              'validation':{'status':'reconciled', 'unitTotal':sum(r['project2027'] for r in units),
                 'programTotal':sum(r['project2027'] for r in programs), 'objectTotalsReconciled':True,
                 'matched2026Programs':len(used), 'pending2027Programs':len([p for p in programs if p['comparisonStatus']=='pending']),
                 'pending2026Programs':len(unmatched), 'reviewedAt':review.get('reviewedAt'),
                 'notes':['El índice del PDF no define dependencias presupuestarias: se usan las planillas por unidad y las fichas financieras.',
                          'Las correspondencias funcionales no prueban identidad de cada actividad ni de sus costos.']}}
    def percent(value):
        return f'{abs(value):.1f}'.replace('.', ',') + '%'
    largest_unit = max(units, key=lambda u:u['project2027'])
    largest_object = max(area['objects'], key=lambda o:o['project2027'])
    detail['readings'] = [
        {'kind':'calculation', 'text':f'El proyecto queda {percent(area["realVariationPct"])} por {"debajo" if area["realVariationPct"]<0 else "encima"} de la inflación supuesta frente al vigente de junio de 2026.',
         'references':['Planilla 4 del documento general, p. 173', 'Ejecución 2026-2; factor 1,18']},
        {'kind':'calculation', 'text':f'{largest_unit["name"]} concentra {percent(largest_unit["project2027"]/area["project2027"]*100)} del presupuesto del área.',
         'references':[f'Planilla por unidad, p. {largest_unit["pdfPage"]}']},
        {'kind':'calculation', 'text':f'La categoría {largest_object["name"]} representa {percent(largest_object["project2027"]/area["project2027"]*100)} del presupuesto. La clasificación describe el destino del dinero; no informa por sí sola cantidad de empleados ni de contratos.',
         'references':['Planilla 4 del documento general, p. 173']},
        *review.get('readings', [])]
    write(area['detailFile'], serial(detail))
    # Sancionado/current/executed for all cards, from the same existing snapshot.
    for a in reports['areas']:
        rows = [r for r in snapshot['rows'] if r['fiscal'] and r['codes'][1]==a['code']]
        for stage, field in [('initial2026','s'),('current2026','v'),('executed2026','d')]:
            a[stage] = serial(sum((Decimal(str(r[field])) for r in rows),Decimal(0)))
    people_metadata(reports)
    reports['coverage']['detailedAreas2027'] = sum('detailFile' in a for a in reports['areas'])
    reports['coverage']['unitsWithVerifiedDetail2027'] = sum('detail2027' in u for u in reports['units'])
    reports['coverage']['missing'] = 'Detalle jurisdiccional importado progresivamente; las áreas sin detailFile conservan su apertura agregada. Las unidades sin detail2027 mantienen sólo su base 2026.'
    write('data/budget/2027/area-reports.json', reports)
    catalog = read('data/index.json')
    dataset_id = f'government-area-{code}-2027'
    entry = {'id':dataset_id, 'name':'Áreas de Gobierno · '+area['name'], 'path':area['detailFile'],
        'period':'2027-project', 'lastUpdate':review.get('reviewedAt'),
        'source':'PDF jurisdiccionales oficiales de 2026 y 2027; sin publicar documentos de trabajo.',
        'type':'derived', 'description':f'Detalle conciliado de {len(units)} unidades y {len(programs)} programas; funciones revisadas y antecedentes pendientes diferenciados.',
        'files':[area['detailFile']] + ([review_file.relative_to(ROOT).as_posix()] if review_file.exists() else [])}
    existing = next((d for d in catalog['datasets'] if d['id']==dataset_id),None)
    if existing:
        existing.update(entry)
    else:
        catalog['datasets'].append(entry)
    (ROOT/'data/index.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(serial(detail['validation']),ensure_ascii=False))


if __name__ == '__main__':
    main()
