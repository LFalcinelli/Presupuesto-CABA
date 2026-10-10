"""Build the 22 jurisdiction fiches from government_documents.py extractions.

Preparation: extract both PDF folders with government_documents.extract and save
extracted-YEAR-CODE.json outside this repository. Pass that directory explicitly.
No PDF, private path or local cache is published. Monetary cells stay unrounded.
"""
import argparse,json,re,importlib.util
from collections import defaultdict
from decimal import Decimal
from difflib import SequenceMatcher
from pathlib import Path
from government_documents import norm,OBJECTS
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text(encoding='utf8'))
def write(p,d):
    p=ROOT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((json.dumps(d,ensure_ascii=False,indent=2) if p.name=='index.json' else json.dumps(d,ensure_ascii=False,separators=(',',':'))).encode('utf8')+b'\n')
def number(v):return int(v) if v==int(v) else float(v)
def serial(v):
    if isinstance(v,Decimal):return number(v)
    if isinstance(v,dict):return {k:serial(x) for k,x in v.items()}
    if isinstance(v,list):return [serial(x) for x in v]
    return v
def current_groups(snapshot):
    groups={}
    for r in snapshot['rows']:
        if not r['fiscal']:continue
        key='-'.join(r['codes'][1:6])
        g=groups.setdefault(key,{'codes':r['codes'][1:6],'name':r['names'][5],
            **{s:Decimal(0) for s in ['initial2026','current2026','executed2026']},
            'objects':{str(i):{'code':str(i),'name':n,**{s:Decimal(0) for s in ['initial2026','current2026','executed2026']}} for i,n in enumerate(OBJECTS,1)}})
        for s,f in [('initial2026','s'),('current2026','v'),('executed2026','d')]:g[s]+=Decimal(str(r[f]));g['objects'][r['codes'][8]][s]+=Decimal(str(r[f]))
    return groups
def similarity(a,b):
    if not a.get('description') or not b.get('description'):return 0
    x,y=[re.findall(r'[a-z0-9]+',re.sub(r'[^\w\s]',' ',s.lower())) for s in [a['description'],b['description']]]
    matcher=SequenceMatcher(None,x,y,autojunk=False)
    ratio=matcher.ratio()
    # A substantially expanded description can retain the entire earlier
    # function. Require a long verbatim passage and most of the shorter text;
    # this confirms the principal function, not identity of every activity.
    blocks=matcher.get_matching_blocks()
    coverage=sum(m.size for m in blocks)/max(1,min(len(x),len(y)))
    return max(ratio,.73 if max((m.size for m in blocks),default=0)>=80 and coverage>=.6 else 0)
def scope_documents(d):
    if d['source']['file'].startswith(('98 ','98 -','99 ','99 -')):
        excluded=[p for p in d['programs'] if re.search(r'amortizaci[oó]n|aplicaciones financieras',p['name'],re.I)]
        d['excludedFinancialPrograms']=[{'id':'-'.join(p['codes']),'name':p['name'],'value':p['value'],'pdfPage':p['financialPage']} for p in excluded]
        d['programs']=[p for p in d['programs'] if p not in excluded]
        for u in d['units']:u['value']=sum(p['value'] for p in d['programs'] if p['codes'][:4]==u['codes'])
        d['documentTotal']=d['total'];d['total']=sum(p['value'] for p in d['programs'])
        d['financing']=[{'code':c,'name':next(f['name'] for p in d['programs'] for f in p['financing'] if f['code']==c),
            'value':sum(f['value'] for p in d['programs'] for f in p['financing'] if f['code']==c),
            'pdfPage':min(n for p in d['programs'] for f in p['financing'] if f['code']==c for n in f['pdfPages'])} for c in sorted({f['code'] for p in d['programs'] for f in p['financing']})]
    return d
def economic(objects,principals):
    vals={o['code']:o.get('project2027',o.get('value',0)) for o in objects}
    transfer={'current':0,'capital':0,'unspecified':0}
    for r in principals:
        if r['objectCode']!='5':continue
        key='current' if 'corrientes' in r['name'].lower() else 'capital' if 'capital' in r['name'].lower() else 'unspecified'
        transfer[key]+=r['value']
    assert sum(transfer.values())==vals.get('5',0),('transfer principal reconciliation',transfer,vals.get('5'))
    return {'currentCore':sum(vals.get(str(i),0) for i in [1,2,3]),'investmentCore':vals.get('4',0),
        'transferCurrent':transfer['current'],'transferCapital':transfer['capital'],'transferUnspecified':transfer['unspecified'],
        'transfers':vals.get('5',0),'other':sum(vals.get(str(i),0) for i in [6,7,8])}
def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--extracted-dir',type=Path,required=True);args=parser.parse_args()
    reports=read('data/budget/2027/area-reports.json');snapshot=read('data/budget/2026/2026-2.json');current=current_groups(snapshot)
    docs={(year,a['code']):scope_documents(json.loads((args.extracted_dir/f'extracted-{year}-{a["code"]}.json').read_text(encoding='utf8'))) for year in [2026,2027] for a in reports['areas']}
    old={'-'.join(p['codes']):p for (year,code),d in docs.items() if year==2026 for p in d['programs']}
    old_sources={k:docs[2026,p['codes'][0]]['source'] for k,p in old.items()}
    reviews={a['code']:read(f'data/budget/2027/area-reviews/{a["code"]}.json') if (ROOT/f'data/budget/2027/area-reviews/{a["code"]}.json').exists() else {'matches':[],'changes':[]} for a in reports['areas']}
    manual={m['target']:m for r in reviews.values() for m in r['matches']}
    # Explicit functional transfers: descriptions in the two jurisdiction PDFs
    # name the same service. The June file identifies both old and new codes.
    transfers={'21-0-0-2700-23':['35-0-0-3154-93'],'21-0-0-2701-24':['35-0-0-3138-97'],
        '21-0-0-2702-25':['35-0-0-8737-52'],'21-0-0-2702-26':['35-0-0-8737-57'],
        '21-0-275-2707-85':['35-0-352-8736-85']}
    matches={};used=set()
    for a in reports['areas']:
        code=a['code']
        for p in docs[2027,code]['programs']:
            key='-'.join(p['codes']);m=manual.get(key);sources=[];status='pending';evidence='Funciones por verificar; no se infiere creación ni desaparición.'
            if m:sources=m['sources'];status=m['status'];evidence=m['evidence']
            elif key in transfers:
                sources=transfers[key];status='reorganized';evidence='La descripción de 2027 en Gabinete y la de 2026 en Espacio Público identifican el mismo servicio; cambia la dependencia y la codificación.'
            elif key in old and norm(p['name'])==norm(old[key]['name']) and similarity(p,old[key])>=.72:
                sources=[key];status='continues';evidence='Mismo programa y funciones descritas concordantes en ambos documentos. Contraste textual de las descripciones, no sólo del código.'
            else:
                candidates=[(k,o) for k,o in old.items() if o['codes'][0]==code and k not in used and norm(o['name'])==norm(p['name']) and similarity(p,o)>=.86]
                if len(candidates)==1:sources=[candidates[0][0]];status='recoded';evidence='Cambia la codificación; las descripciones del programa conservan funciones concordantes.'
            if sources and (used.intersection(sources) or any(s not in old for s in sources)):
                raise ValueError('Repeated or unknown source '+key)
            # Missing descriptions never become a match through code alone.
            baseline=list(dict.fromkeys([s for s in sources if s in current]+([key] if key in current else []))) if sources else []
            if sources and not baseline:sources=[];status='pending';evidence='Antecedente documental sin una base verificable en la ejecución 2026.'
            used.update(sources);matches[key]={'sources':sources,'baselineKeys':baseline,'status':status,'evidence':evidence}
    all_baselines=set()
    for a in reports['areas']:
        code=a['code'];prev=docs[2026,code];prop=docs[2027,code];assert prop['total']==a['project2027'],(code,'Planilla 4 total')
        rows=[g for g in current.values() if g['codes'][0]==code]
        for s in ['initial2026','current2026','executed2026']:a[s]=sum((r[s] for r in rows),Decimal(0))
        for o in a['objects']:
            for s in ['initial2026','current2026','executed2026']:o[s]=sum((r['objects'][o['code']][s] for r in rows),Decimal(0))
        programs=[];changes=list(reviews[code]['changes'])
        for p in prop['programs']:
            key='-'.join(p['codes']);match=matches[key];baseline=match['baselineKeys']
            assert not all_baselines.intersection(baseline),(key,'Repeated baseline in program matches')
            all_baselines.update(baseline)
            row={**p,'id':key,'unitCode':p['codes'][3],'code':p['codes'][4],'project2027':p['value'],
                'comparisonStatus':match['status'],'comparisonEvidence':match['evidence'],'antecedents':match['sources'],'baselineKeys':baseline,
                'previousDescriptions':[{'id':s,'pages':old[s]['descriptionPages'],'text':old[s]['description'],'source':old_sources[s]} for s in match['sources']]}
            for s in ['initial2026','current2026','executed2026']:row[s]=sum((current[k][s] for k in baseline),Decimal(0)) if baseline else None
            for o in row['objects']:
                o['project2027']=o.pop('value')
                for s in ['initial2026','current2026','executed2026']:o[s]=sum((current[k]['objects'][o['code']][s] for k in baseline),Decimal(0)) if baseline else None
            row['economic']=economic(row['objects'],row['principals']);programs.append(row)
            if match['status'] in ['recoded','reorganized'] and not any(c['target']==key for c in changes):
                changes.append({'target':key,'status':match['status'],'title':p['name'],'explanation':match['evidence'],
                    'pages2026':sorted({n for s in match['sources'] for n in old[s]['descriptionPages']}),'pages2027':p['descriptionPages'],
                    'sources2026':[old_sources[s]['file'] for s in match['sources']]})
        units=[]
        for u in prop['units']:
            children=[p for p in programs if p['codes'][:4]==u['codes']];oldrows=[r for r in rows if r['codes'][:4]==u['codes']]
            previous_ids={'-'.join(r['codes']) for r in oldrows};baselines={k for p in children for k in p['baselineKeys']}
            same=previous_ids==baselines and bool(previous_ids) and all(p['comparisonStatus'] in ['continues','recoded'] for p in children)
            row={**u,'id':'-'.join(u['codes']),'code':u['codes'][3],'project2027':u['value'],'comparisonStatus':'continues' if same else 'reorganized' if any(p['comparisonStatus'] in ['reorganized','recoded'] for p in children) else 'pending',
                'comparisonEvidence':'Funciones contrastadas en los programas de ambos documentos.' if same else 'La continuidad de todos los programas no está confirmada; no se compara como un mismo servicio.',
                'objects':[{'code':str(i),'name':name,'project2027':sum(p['objects'][i-1]['project2027'] for p in children)} for i,name in enumerate(OBJECTS,1)]}
            for s in ['initial2026','current2026','executed2026']:row[s]=sum((r[s] for r in oldrows),Decimal(0)) if oldrows else None
            units.append(row)
            for legacy in reports['units']:
                if legacy['codes'][1:5]==u['codes']:legacy['detail2027']={'path':f'data/budget/2027/areas/{code}.json','unitId':row['id'],'project2027':row['project2027']}
        assert sum(p['project2027'] for p in programs)==a['project2027']
        for i,o in enumerate(a['objects']):assert sum(p['objects'][i]['project2027'] for p in programs)==o['project2027'],(code,'object',o['code'])
        a['economic']=economic(a['objects'],[r for p in programs for r in p['principals']])
        a['detailFile']=f'data/budget/2027/areas/{code}.json'
        pending=[{'id':k,'name':p['name'],'pages':p['descriptionPages'],'status':'pending','reason':'Sin correspondencia funcional confirmada; no se interpreta como eliminación.'} for k,p in old.items() if p['codes'][0]==code and k not in used]
        large=abs(float(a['current2026']/a['initial2026']-1))>.25
        reorg=None
        if large:
            reorg={'initial2026':a['initial2026'],'current2026':a['current2026'],'source':'Ejecución 2026-2, sancionado y vigente, por programa.',
                'status':'documented-transfer' if code in ['21','35'] else 'pending-cause',
                'explanation':('Higiene urbana, reciclado, control de plagas y recolección aparecen en Espacio Público en el proyecto 2026 y en Gabinete en el proyecto 2027. El archivo de junio registra partidas en ambos códigos; la variación de la jurisdicción incluye un cambio de dependencia.' if code in ['21','35'] else
                    'El archivo de junio registra nuevas partidas del servicio penitenciario. Las fichas 2027 abren tres programas; no permite atribuir toda la ampliación de 2026 a un único movimiento.' if code=='24' else
                    'El aumento se distribuye entre Turismo, industrias creativas, actividades centrales y Parque de la Innovación, entre otras partidas. Los documentos no identifican una reorganización que explique por sí sola la ampliación.'),
                'references':[{'file':docs[2026,'35']['source']['file'],'pages':[36,37,53,54,78,79,80,81,82,84,85,86,109,110]},{'file':docs[2027,'21']['source']['file'],'pages':[73,74,76,77,79,80,81,82,83,85,86,87,160,161]}] if code in ['21','35'] else [{'file':prop['source']['file'],'pages':[183,185,187,188] if code=='24' else [14,15,16,17,18,32,33,66,78,79,80,81,82,83,84,85]}]}
        detail={'schemaVersion':2,'jurisdictionCode':code,'name':a['name'],'year':2027,'status':'project','referencePeriod':'2026-2','deflator':reports['deflator'],
            'sources':{'2027':prop['source'],'2026':prev['source'],'current2026':reports['sources']['2026-2']},
            'stages':{s:a[s] for s in ['initial2026','current2026','executed2026','project2027']},'originalEqualsApproved':prev['total']==a['initial2026'],
            'financing':prop['financing'],'financingLabelSource':'https://buenosaires.gob.ar/sites/default/files/2023-11/35.%20Ministerio%20de%20Ambiente%20y%20Espacio%20P.pdf',
            'positions':prop['positions'],'economic':a['economic'],'units':units,'programs':programs,'changes':changes,
            'reorganization2026':reorg,'unmatched2026':pending,
            'unmatchedCurrent2026':[dict(r,id=k,status='pending') for k,r in current.items() if r['codes'][0]==code and k not in all_baselines],
            'excludedFinancialPrograms':prop.get('excludedFinancialPrograms',[]),
            'sourceIssues':[dict(i,year=y,file=docs[y,code]['source']['file']) for y in [2026,2027] for i in docs[y,code]['issues']],
            'validation':{'status':'reconciled','unitTotal':sum(u['project2027'] for u in units),'programTotal':sum(p['project2027'] for p in programs),
                'objectTotalsReconciled':True,'matched2026Programs':sum(len(p['antecedents']) for p in programs),
                'pending2027Programs':sum(p['comparisonStatus']=='pending' for p in programs),'pending2026Programs':len(pending),
                'reviewedAt':'2026-10-10','method':'Descripciones concordantes y correspondencias documentadas; código o nombre solos no confirman continuidad.'}}
        detail['stages']['originalProject2026']=prev['total']
        write(a['detailFile'],serial(detail));print(code,len(units),len(programs),'pending',detail['validation']['pending2027Programs'])
    spec=importlib.util.spec_from_file_location('pilot',ROOT/'scripts/import-government-areas.py');pilot=importlib.util.module_from_spec(spec);spec.loader.exec_module(pilot);pilot.people_metadata(reports)
    reports['coverage'].update(detailedAreas2027=22,unitsWithVerifiedDetail2027=sum('detail2027' in u for u in reports['units']),
        missing='Las 22 jurisdicciones cuentan con detalle financiero. Las continuidades y descripciones pendientes se identifican en cada ficha; no se infieren creaciones ni eliminaciones.')
    reports['economicMethod']={'source':'Incisos y principales explícitos de las fichas jurisdiccionales 2027; ejecución oficial 2026 por inciso.',
        'currentCore':'Personal + bienes de consumo + servicios no personales (incisos 1–3).','investmentCore':'Bienes de uso (inciso 4).',
        'transfers':'Se separan corrientes y de capital sólo si el principal lo indica; las transferencias empresariales sin ese desglose quedan sin destino desagregado.',
        'comparison':'Las variaciones de funcionamiento e inversión comparan los núcleos por inciso; las transferencias se comparan por su total, sin repartir el ampliado con proporciones del proyecto original.'}
    write('data/budget/2027/area-reports.json',serial(reports))
    catalog=read('data/index.json')
    for a in reports['areas']:
        entry={'id':f'government-area-{a["code"]}-2027','name':'Áreas de Gobierno · '+a['name'],'path':a['detailFile'],'period':'2027-project','lastUpdate':'2026-10-10',
            'source':'PDF jurisdiccionales oficiales 2026 y 2027 y ejecución al segundo trimestre 2026.','type':'derived',
            'description':'Unidades, programas, incisos, principales, financiación, cargos y trazabilidad; continuidades sin confirmar identificadas.','files':[a['detailFile']]}
        existing=next((d for d in catalog['datasets'] if d['id']==entry['id']),None)
        if existing:existing.update(entry)
        else:catalog['datasets'].append(entry)
    write('data/index.json',catalog)
if __name__=='__main__':main()
