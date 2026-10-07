"""Add readable labels and verified child works without changing official project totals.

Usage: python scripts/enrich-investment-names.py path/to/official-budget.pdf
The input document is not copied or published. Requires pypdf.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
from pypdf import PdfReader

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('pdf', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
file = root / 'data/budget/2027/investments.json'
data = json.loads(file.read_text(encoding='utf-8'))
assert hashlib.sha256(args.pdf.read_bytes()).hexdigest() == data['source']['fileSha256']
pdf = PdfReader(args.pdf)
projects = {r['id']: r for r in data['projects']}
context = [0] * 6
current = None
children = {}
matched = set()
for page in range(240, 296):
    text = pdf.pages[page-1].extract_text(extraction_mode='layout').replace('\xa0', ' ')
    lines = text.splitlines()
    header = next((line for line in lines if all(s in line for s in ['Jur', 'Og', 'UE', 'Pg.', 'Sg.', 'Py.', 'Ac.', 'Ob.', 'FF'])), None)
    if not header:
        continue
    positions = [header.index(s) for s in ['Jur', 'Og', 'UE', 'Pg.', 'Sg.', 'Py.', 'Ac.', 'Ob.', 'FF']]
    for line in lines:
        match = re.match(r'^(.*?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*$', line)
        if not match:
            continue
        left, *amounts = match.groups()
        name_start = re.search(r'[A-Za-zÀ-ÿ]', left)
        if not name_start:
            continue
        prefix, name = left[:name_start.start()], left[name_start.start():].strip()
        numbers = re.findall(r'\d+', prefix)
        if not numbers:
            continue
        amounts = [int(a.replace('.', '')) for a in amounts]
        if len(numbers) == 1:
            column = len(prefix) - len(prefix.lstrip())
            level = next((i for i in range(8) if positions[i] <= column < positions[i+1]), None)
            if level is None:
                continue
            if level <= 5:
                context[level] = int(numbers[0])
                for i in range(level+1, 6):
                    context[i] = 0
                current = '-'.join(map(str, context)) if level == 5 else None
                if current in projects:
                    assert projects[current]['amounts'] == amounts, current
                    matched.add(current)
        elif current in projects and len(numbers) >= 3:
            rows = children.setdefault(current, {})
            row = rows.setdefault(name, {'name': name, 'amounts': [0, 0, 0], 'pdfPages': []})
            row['amounts'] = [a+b for a, b in zip(row['amounts'], amounts)]
            if page not in row['pdfPages']:
                row['pdfPages'].append(page)

# Expansions are editorial labels. The original name remains unchanged and visible in sources.
labels = {
 'CONST.AMPL.Y.MODERNIZ.RED.SUBT': 'Construcción, ampliación y modernización de la red de Subte',
 'P.E ING.-ARQUIT.LINEA F SUBTE': 'Plan de Ingeniería y Arquitectura de la Línea F de Subte',
 'FUELLE - PREVIAL I': 'Recuperación y mejora de las calles · programa Fuelle–Previal',
 'ADECUACION INTEGRAL': 'Adecuación integral de edificios escolares',
 'DISPOSICION FINAL RESIDUOS SOL': 'Disposición final de residuos sólidos',
 'MEJORAMIENTO DEL SISTEMA PLUVI': 'Mejoramiento del sistema pluvial',
 'EQUIP. JEFAT CENTRAL POL. METR': 'Equipamiento de la Jefatura Central de la Policía Metropolitana',
 'OBRAS EN HOSPIT GRAL DE AGUDOS': 'Obras en hospitales generales de agudos',
 'MANTENIMIENTO Y OPTIMIZACIÓN D': 'Mantenimiento y optimización del alumbrado público',
 'PUESTA VALOR Y REFORMAS INTG': 'Puesta en valor y reformas integrales de espacios verdes',
 'MANTENIMIENTO FLOTA POLICIA': 'Mantenimiento de la flota de la Policía de la Ciudad',
 'MANTENIM. CAMARAS DE SEGURIDAD': 'Mantenimiento de cámaras de seguridad',
 'CONST Y REM, COMIS, DEST Y DEP': 'Construcción y remodelación de comisarías, destacamentos y dependencias',
 'ALCAIDIA PEN 27 DE FEB': 'Alcaidía penitenciaria 27 de Febrero',
 'CENTRO CONTROL CENT. TRANSITO': 'Centro de control centralizado del tránsito',
 'OBRAS NUEVAS AMP Y RELOC 5': 'Obras nuevas, ampliaciones y relocalizaciones de edificios escolares · proyecto 5',
 'MANT. INT. METROBUS': 'Mantenimiento integral del Metrobús',
 'A.CU.MAR - MEJ.SIST.PLUVIAL': 'Mejoramiento del sistema pluvial · ACUMAR',
 'OBRAS EN CONSEJO DE LA MAG': 'Obras en el Consejo de la Magistratura',
 'MANTENIMIENTO Y OBRAS CEMENT': 'Mantenimiento y obras en cementerios',
 'READ. Y P. VALOR.AUTODROMO': 'Readecuación y puesta en valor del Autódromo',
 'MANT. PRE Y POST COLONIAS': 'Mantenimiento antes y después de las colonias deportivas',
}
labels.update({'REP Y PUESTA EN VALOR LEGISLAT': 'Puesta en valor y mejora del Palacio Legislativo', 'MANT. DE ESPACIOS VERDES': 'Mantenimiento de espacios verdes', 'COMPLEJOS HABITACIONALES MANT': 'Mantenimiento de espacios verdes en complejos habitacionales', 'SERVICIO MANTENIMIENTO INTEG': 'Servicio de mantenimiento integral de espacios verdes', 'SIST.ATENCIÓN.CIUDADANA': 'Sistema de atención ciudadana', 'MANT. FIRMA DIGITAL': 'Mantenimiento de la firma digital', 'ACTAS DIGIT., SIFER Y ARCHIVO': 'Actas digitales, sistema SIFER y archivo', 'SEÑALAM. VIAL POR DEMARC.HORIZ': 'Señalamiento vial mediante demarcación horizontal', 'OBRAS RECUP.TRAZA EX AU3': 'Obras de recuperación de la traza de la ex Autopista 3', 'MANT.Y MEJORAS EN CONJ.URBANOS': 'Mantenimiento y mejoras en conjuntos urbanos', 'OBRAS CIV ALBÑ FACHA CUBIE PIN': 'Obras civiles: albañilería, fachadas, cubiertas y pintura', 'ADEC. INSTALACIONES 5': 'Adecuación de instalaciones escolares · proyecto 5'})
expanded = 0
for project in data['projects']:
    project['displayName'] = labels.get(project['name'], project['name'].capitalize())
    if project['name'] in labels:
        expanded += 1
    parts = list(children.get(project['id'], {}).values())
    if parts and all(sum(r['amounts'][i] for r in parts) == project['amounts'][i] for i in range(3)):
        project['components'] = parts
    else:
        project.pop('components', None)
    if project['name'] in labels:
        project['displayNameMethod'] = 'Expansión editorial de abreviaturas, con el programa y las obras hijas de la planilla oficial; no cambia códigos ni importes.'
    elif len(parts) == 1 and (len(parts[0]['name']) >= len(project['name']) or len(project['name']) >= 27):
        project['displayName'] = parts[0]['name'].capitalize().replace('Arqutectura', 'Arquitectura')
        project['displayNameMethod'] = 'Etiqueta completa de la obra hija publicada en la misma planilla; importes conciliados.'
data['readableLabels'] = {'updated': '2026-10-07', 'method': 'Los nombres completos son etiquetas de lectura. La denominación oficial corta se conserva en name y se muestra en el detalle. Sólo se publican obras hijas si sus importes concilian exactamente con el proyecto en los tres años.'}
file.write_bytes((json.dumps(data, ensure_ascii=False, indent=2)+'\n').encode('utf-8'))
print(json.dumps({'matchedProjects': len(matched), 'readableExpansions': expanded, 'projectsWithReconciledComponents': sum(bool(p.get('components')) for p in data['projects'])}))
