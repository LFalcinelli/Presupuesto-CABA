"""Read-only extraction of jurisdiction PDFs. Cache is optional and never published.

Financial sheets can split one program by function. Explicit sheets and principal
headings are aggregated, without allocating unexplained differences.
"""
from collections import defaultdict
import hashlib, json, re, unicodedata

OBJECTS = ['Gastos en personal', 'Bienes de consumo', 'Servicios no personales',
           'Bienes de uso', 'Transferencias', 'Activos financieros',
           'Servicio de la deuda y disminución de otros pasivos', 'Otros gastos']
FINANCING = {'11':'Tesoro de la Ciudad','12':'Recursos propios','13':'Recursos con afectación específica',
             '14':'Transferencias afectadas','15':'Transferencias internas','21':'Financiamiento interno','22':'Financiamiento externo'}
def norm(s):
    return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
def money(s): return int(re.sub(r'[.\s]','',s))
def document(path,year,cache=None):
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    if cache and (cache/(digest+'.json')).exists():
        pages=json.loads((cache/(digest+'.json')).read_text(encoding='utf8'))['pages']
    else:
        import pdfplumber
        with pdfplumber.open(path) as pdf: pages=[p.extract_text() or '' for p in pdf.pages]
    return {'file':path.name,'sha256':digest,'year':year,'status':'project','url':None,'pages':len(pages)},pages
def financial_rows(text):
    body=text.split('PRESUPUESTO FINANCIERO',1)[1].split('\nTOTAL',1)[0]
    for line in body.splitlines():
        m=re.fullmatch(r'(.+?)\s+([\d.]+)',line.strip())
        if m: yield m[1].strip(),money(m[2])
def principal_dictionary(documents):
    heads={norm(n):str(i) for i,n in enumerate(OBJECTS,1)}; labels=defaultdict(set)
    for pages in documents:
        for text in pages:
            if 'PRESUPUESTO FINANCIERO' not in text:continue
            current=None
            for label,value in financial_rows(text):
                if norm(label) in heads:current=heads[norm(label)]
                elif current:labels[norm(label)].add(current)
    # Principal mappings are accepted only when consistently attached to an
    # explicit inciso heading in the source documents. Ambiguous labels stay out.
    result={label:next(iter(codes)) for label,codes in labels.items() if len(codes)==1}
    # These explicit classifier labels also appear on sheets whose inciso
    # heading is omitted. Do not inherit the preceding inciso on those sheets.
    for label in ['Servicios Especializados, Comerciales y Financieros','Servicios básicos','Alquileres y derechos','Mantenimiento, reparación y limpieza','Servicios profesionales, técnicos y operativos','Pasajes, viáticos y movilidad','Otros servicios']:
        result[norm(label)]='3'
    for label in ['Productos alimenticios, agropecuarios y forestales','Textiles y vestuario','Pulpa,papel, cartón y sus productos','Productos de cuero y caucho','Productos químicos, combustibles y lubricantes','Productos de minerales no metálicos','Productos metálicos','Otros bienes de consumo']:
        result[norm(label)]='2'
    for label in ['Activos intangibles','Construcciones','Maquinaria y equipo','Bienes preexistentes','Libros, revistas y otros elementos coleccionables']:
        result[norm(label)]='4'
    return result
def extract(path,year,code,cache=None,principals=None,external_codes=None):
    source,pages=document(path,year,cache);heads={norm(n):str(i) for i,n in enumerate(OBJECTS,1)}
    principal_map=principals or principal_dictionary([pages]); units={};programs={};descs=defaultdict(lambda:{'pages':[],'text':''});sheets=defaultdict(list)
    result={'source':source,'financing':[],'positions':None,'issues':[]};subprograms={};funding={};unit_names={}
    for n,text in enumerate(pages,1):
        if 'PROGRAMA POR UNIDAD EJECUTORA' in text:
            assert f'PROYECTO DE PRESUPUESTO {year}' in text,(source['file'],n,'year')
            for line in text.splitlines():
                m=re.fullmatch(r'((?:\d+\s+){1,6})(.+?)\s+([\d.]+)',line)
                if not m:continue
                codes=m[1].split();assert codes[0]==code,(source['file'],n,codes)
                row={'codes':codes,'name':m[2].strip(),'value':money(m[3]),'pdfPage':n}
                if len(codes)==1:result['total']=row['value']
                elif len(codes)==6:
                    key='-'.join(codes)
                    if key in subprograms and subprograms[key]['value']!=row['value']:
                        result['issues'].append({'program':'-'.join(codes[:5]),'pdfPage':n,'reason':'Importes duplicados distintos en la planilla por unidad; se contrasta con la ficha financiera y la tabla de financiación.','values':[subprograms[key]['value'],row['value']]})
                    subprograms[key]=row
                elif len(codes)==4:unit_names['-'.join(codes)]=row['name']
        if 'PROGRAMA POR FUENTE DE FINANCIAMIENTO' in text:
            header=next((l for l in text.splitlines() if l.startswith('Jur') and 'Fte' in l),'')
            sources=re.findall(r'Fte\s*(\d+)',header)
            for line in text.splitlines():
                m=re.fullmatch(r'((?:\d+\s+){1,6})([^\d].*?)\s+((?:[\d.]+\s+){'+str(len(sources))+r'}[\d.]+)',line)
                if not m or m[1].split()[0]!=code:continue
                codes=m[1].split()
                values=[money(v) for v in m[3].split()]
                if sum(values[:-1])!=values[-1]:continue
                rows=[{'code':c,'name':FINANCING.get(c,'Fuente '+c),'value':v,'pdfPage':n} for c,v in zip(sources,values[:-1])]
                if len(codes)==1:result['financing']=rows
                elif len(codes)==6:
                    funding['-'.join(codes)]=rows
                    if '-'.join(codes) not in subprograms:
                        subprograms['-'.join(codes)]={'codes':codes,'name':m[2].strip(),'value':values[-1],'pdfPage':n}
                elif len(codes)==4:unit_names['-'.join(codes)]=m[2].strip()
        if 'DESCRIPCIÓN DEL PROGRAMA' in text:
            m=re.search(r'Programa N[°º]\s*(\d+)\.(.*?)\nUNIDAD RESPONSABLE:\s*(.*?)\nDESCRIPCIÓN:\s*(.*)',text,re.S)
            if m:
                d=descs[(m[1],norm(m[3]))];d['pages'].append(n);d['text']+=' '+re.sub(r'\s+',' ',m[4]).strip()
        if 'PRESUPUESTO FINANCIERO' in text:
            m=re.search(r'Programa:\s*(\d+) (.*?)\nUnidad Ejecutora:\s*(.*?)\nJurisdicción:',text,re.S)
            if not m:result['issues'].append({'pdfPage':n,'reason':'Encabezado financiero por verificar'});continue
            explicit={};details=[];current=None;notes=[]
            for label,value in financial_rows(text):
                key=norm(label)
                if key in heads:
                    current=heads[key];explicit[current]=value
                else:
                    object_code=principal_map.get(key,current)
                    if object_code:details.append({'objectCode':object_code,'name':label,'value':value,'pdfPage':n})
                    else:result['issues'].append({'pdfPage':n,'reason':'Principal sin inciso verificable: '+label})
            objects=[]
            for i,name in enumerate(OBJECTS,1):
                k=str(i);value=explicit.get(k,sum(r['value'] for r in details if r['objectCode']==k))
                if k not in explicit and value:notes.append('Inciso '+k+': se suman principales explícitos; el título no está impreso.')
                objects.append({'code':k,'name':name,'value':value})
            total=re.search(r'^TOTAL\s+([\d.]+)',text,re.M)
            assert total and sum(o['value'] for o in objects)==money(total[1]),(source['file'],n,'financial sum',sum(o['value'] for o in objects),total[1] if total else None)
            targets=[]
            for line in text.split('PRESUPUESTO FÍSICO',1)[-1].splitlines() if 'PRESUPUESTO FÍSICO' in text else []:
                if line.startswith(('META ','PRODUCCION ','PRODUCCIÓN ')):targets.append({'officialText':line,'pdfPage':n})
                elif targets and line.strip():targets[-1]['officialText']+=' '+line.strip()
            function=re.search(r'^Función:\s*(.*)',text,re.M)
            sheets[(m[1],norm(m[3]))].append({'name':m[2],'objects':objects,'principals':details,'financialPage':n,
                'classificationNote':' '.join(notes) or None,'targets':targets,'total':money(total[1]),'function':function[1].strip() if function else None})
        if 'Cantidad de Cargos por Unidad Ejecutora' in text:
            # Total jurisdiction row; number of escalafón columns varies by year.
            for line in text.splitlines():
                m=re.match(r'^'+code+r'\s+\d+\s+'+code+r'\s+[^\d]+((?:\d+\s+){3,}\d+)$',line)
                if m:
                    values=[int(v) for v in m[1].split()]
                    if sum(values[:-1])==values[-1]:result['positions']={'value':values[-1],'pdfPage':n,
                        'scope':'Cargos de los escalafones incluidos en el cuadro; no es la dotación total.',
                        'exclusions':'No incluye autoridades superiores, plantas de gabinete, carrera gerencial, carrera profesional hospitalaria, personal docente ni plantas transitorias.'}
    if external_codes:
        for key,ss in sheets.items():
            if any(s['total'] for s in ss) and not any(p['codes'][4]==key[0] and norm(unit_names.get('-'.join(p['codes'][:4]),''))==key[1] for p in subprograms.values()):
                candidates=[r for r in external_codes if r['codes'][4]==key[0] and norm(r['unitName'])==key[1]]
                if len(candidates)==1:
                    r=candidates[0];codes=r['codes']+['0'];total=sum(s['total'] for s in ss)
                    subprograms['-'.join(codes)]={'codes':codes,'name':ss[0]['name'],'value':total,'pdfPage':ss[0]['financialPage']}
                    unit_names['-'.join(codes[:4])]=r['unitName']
                    result['issues'].append({'program':'-'.join(codes[:5]),'pdfPage':ss[0]['financialPage'],'reason':'La planilla por unidad no incluye esta ficha. El importe procede de la ficha financiera y el código de la ejecución 2026.'})
    # Full subprogram rows carry every code even where a parent row omits a
    # zero in the printed table. Aggregate each leaf once; never add parents.
    for s in subprograms.values():
        key='-'.join(s['codes'][:5]);p=programs.setdefault(key,{'codes':s['codes'][:5],'name':s['name'],'value':0,'pdfPage':s['pdfPage']})
        p['value']+=s['value']
    if year==2026:
        for p in list(programs.values()):
            key=(p['codes'][4],norm(unit_names.get('-'.join(p['codes'][:4]),'')));ss=sheets.get(key,[])
            if code=='20' and not ss:
                result['issues'].append({'program':'-'.join(p['codes']),'pdfPage':p['pdfPage'],'value':p['value'],
                    'reason':'Fila de la planilla sin ficha financiera y fuera de la suma conciliada de la jurisdicción; se deja pendiente, no se utiliza como antecedente.'})
                del programs['-'.join(p['codes'])]
                continue
            # Conflicting printed duplicates: the unique detailed financial
            # sheet is the amount source. Keep the discrepancy in issues.
            if code=='20' and ss and sum(s['total'] for s in ss)!=p['value']:
                result['issues'].append({'program':'-'.join(p['codes']),'pdfPage':p['pdfPage'],'financialPages':[s['financialPage'] for s in ss],
                    'reason':'Diferencia entre la planilla por unidad y las fichas financieras. Se conserva el importe de las fichas explícitas, cuya suma concilia con la jurisdicción.',
                    'listingValue':p['value'],'financialValue':sum(s['total'] for s in ss)})
                p['value']=sum(s['total'] for s in ss)
    for p in programs.values():
        key='-'.join(p['codes'][:4]);u=units.setdefault(key,{'codes':p['codes'][:4],'name':unit_names.get(key,'Unidad '+p['codes'][3]),'value':0,'pdfPage':p['pdfPage']})
        u['value']+=p['value']
    result['units']=list(units.values());result['programs']=list(programs.values())
    assert result.get('total') is not None and units and programs,(source['file'],'missing listing')
    assert sum(u['value'] for u in units.values())==result['total'],(source['file'],'units sum',sum(u['value'] for u in units.values()),result['total'])
    assert sum(p['value'] for p in programs.values())==result['total'],(source['file'],'programs sum')
    for p in programs.values():
        u=units['-'.join(p['codes'][:4])];key=(p['codes'][4],norm(u['name']));matches=sheets.get(key,[]);desc=descs.get(key)
        if not matches:
            candidates=[(k,v) for k,v in sheets.items() if k[0]==p['codes'][4] and any(norm(s['name'])==norm(p['name']) for s in v)]
            if len(candidates)==1:key,matches=candidates[0];desc=descs.get(key)
        assert matches,(source['file'],p['codes'],'missing finance')
        if sum(s['total'] for s in matches)!=p['value']:
            # Salud prints a consolidated parent sheet plus separate hospital
            # subprogram sheets. Recover its own opening by subtracting those
            # explicit children, only if all eight incisos and total reconcile.
            children=[s for k,ss in sheets.items() if k[0]==p['codes'][4] and k!=key for s in ss]
            if len(matches)==1 and children and matches[0]['total']-sum(s['total'] for s in children)==p['value']:
                parent=matches[0];own={**parent,'objects':[dict(o,value=o['value']-sum(s['objects'][i]['value'] for s in children)) for i,o in enumerate(parent['objects'])],
                    'principals':[],'total':p['value'],'classificationNote':'Apertura propia: cuadro consolidado menos las fichas explícitas de subprogramas. No se reparte ningún residuo.',
                    'derivedFromPages':[parent['financialPage']]+[s['financialPage'] for s in children]}
                for principal in parent['principals']:
                    value=principal['value']-sum(r['value'] for s in children for r in s['principals'] if r['objectCode']==principal['objectCode'] and norm(r['name'])==norm(principal['name']))
                    assert value>=0
                    if value:own['principals'].append(dict(principal,value=value,derivedFromPages=own['derivedFromPages']))
                assert all(o['value']>=0 for o in own['objects'])
                matches=[own]
            else:raise AssertionError((source['file'],p['codes'],'finance vs program',sum(s['total'] for s in matches),p['value']))
        p.update(objects=[{'code':str(i),'name':name,'value':sum(s['objects'][i-1]['value'] for s in matches)} for i,name in enumerate(OBJECTS,1)],
            principals=[r for s in matches for r in s['principals']],financialPage=matches[0]['financialPage'],financialPages=[s['financialPage'] for s in matches],
            functions=sorted(set(s['function'] for s in matches if s['function'])),targets=[t for s in matches for t in s['targets']],
            classificationNote=' '.join(s['classificationNote'] for s in matches if s['classificationNote']) or None,
            description=desc['text'].strip() if desc else '',descriptionPages=desc['pages'] if desc else [])
        if any(s.get('derivedFromPages') for s in matches):p['derivedFromPages']=sorted(set(n for s in matches for n in s.get('derivedFromPages',[])))
        ff=[rows for k,rows in funding.items() if k.split('-')[:5]==p['codes']]
        p['financing']=[{'code':c,'name':FINANCING.get(c,'Fuente '+c),'value':sum(r['value'] for rows in ff for r in rows if r['code']==c),
                         'pdfPages':sorted(set(r['pdfPage'] for rows in ff for r in rows if r['code']==c))} for c in sorted(set(r['code'] for rows in ff for r in rows))]
        if year==2027:assert sum(f['value'] for f in p['financing'])==p['value'],(source['file'],p['codes'],'program financing')
        if not desc:result['issues'].append({'program':'-'.join(p['codes']),'pdfPage':p['pdfPage'],'reason':'Descripción funcional por verificar'})
    assert sum(f['value'] for f in result['financing'])==result['total'],(source['file'],'financing sum')
    cargo_rows={};cargo_pages=[]
    for n,text in enumerate(pages,1):
        if 'Cantidad de Cargos por Unidad Ejecutora' not in text:continue
        for line in text.splitlines():
            m=re.fullmatch(r'((?:\d+\s+){4})([^\d].*?)\s+((?:\d+\s+){10}\d+)',line)
            if not m or m[1].split()[0]!=code:continue
            values=[int(v) for v in m[3].split()]
            if sum(values[:-1])==values[-1]:cargo_rows['-'.join(m[1].split())]=values[-1];cargo_pages.append(n)
    if cargo_rows:
        result['positions']={'value':sum(cargo_rows.values()),'pdfPage':min(cargo_pages),'pdfPages':sorted(set(cargo_pages)),
            'scope':'Cargos de los escalafones incluidos en el cuadro; no es la dotación total.',
            'exclusions':'No incluye autoridades superiores, plantas de gabinete, carrera gerencial, carrera profesional hospitalaria, personal docente ni plantas transitorias.'}
    return result

if __name__=='__main__':
    import argparse
    from pathlib import Path
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf-2026-dir',type=Path,required=True);parser.add_argument('--pdf-2027-dir',type=Path,required=True)
    parser.add_argument('--output-dir',type=Path,required=True);parser.add_argument('--cache-dir',type=Path)
    parser.add_argument('--snapshot',type=Path,default=Path(__file__).resolve().parents[1]/'data/budget/2026/2026-2.json')
    args=parser.parse_args();args.output_dir.mkdir(parents=True,exist_ok=True)
    snapshot=json.loads(args.snapshot.read_text(encoding='utf8'));documents=[]
    for year,folder in [(2026,args.pdf_2026_dir),(2027,args.pdf_2027_dir)]:
        for path in sorted(folder.glob('*.pdf')):
            source,pages=document(path,year,args.cache_dir)
            header=next((t for t in pages if 'PROGRAMA POR UNIDAD EJECUTORA' in t),None)
            if not header:continue
            code=re.search(r'\n(\d+)\s+[^\d]',header)[1];documents.append((path,year,code,pages))
            if args.cache_dir:
                args.cache_dir.mkdir(parents=True,exist_ok=True)
                (args.cache_dir/(source['sha256']+'.json')).write_bytes(json.dumps({'pages':pages},ensure_ascii=False).encode('utf8'))
    principals=principal_dictionary([d[3] for d in documents])
    for path,year,code,pages in documents:
        rows={'-'.join(r['codes'][1:6]):{'codes':r['codes'][1:6],'unitName':r['names'][4]} for r in snapshot['rows'] if r['fiscal'] and r['codes'][1]==code}
        result=extract(path,year,code,args.cache_dir,principals,list(rows.values()) if year==2026 else None)
        (args.output_dir/f'extracted-{year}-{code}.json').write_bytes((json.dumps(result,ensure_ascii=False)+'\n').encode('utf8'))
        print(year,code,len(result['units']),len(result['programs']),len(result['issues']))
