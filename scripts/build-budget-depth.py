"""Build source-backed cross-city readings; raw preparation stays outside the repository.

Usage: python scripts/build-budget-depth.py --execution-2026 <official.xlsx>
       --extracted-dir <jurisdiction extractions> --cache-dir <PDF text cache>
"""
import argparse,csv,hashlib,json,re,unicodedata
from collections import defaultdict
from pathlib import Path
from decimal import Decimal
import openpyxl

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--execution-2026',type=Path,required=True)
parser.add_argument('--extracted-dir',type=Path,required=True)
parser.add_argument('--cache-dir',type=Path,required=True)
parser.add_argument('--budget-pdf',type=Path,required=True)
args=parser.parse_args()
ROOT=Path.cwd()
read=lambda p:json.loads((ROOT/p).read_text(encoding='utf8'))
norm=lambda s:re.sub(r'[^a-z0-9]+',' ',unicodedata.normalize('NFD',s).encode('ascii','ignore').decode().lower()).strip()
reports=read('data/budget/2027/area-reports.json');project=read('data/budget/2027/project.json')
details={a['code']:read(a['detailFile']) for a in reports['areas']}
snapshots={str(y)+'-4':read(f'data/budget/{y}/{y}-4.json') for y in range(2013,2026)}
snapshots.update({p:read('data/budget/'+p[:4]+'/'+p+'.json') for p in ['2025-2','2026-2']})
def source(d):return {k:d.get(k) for k in ['sourceFile','sourceUrl','sourceSheet','sha256']}
def aggregate(d):
    groups={}
    for r in d['rows']:
        if not r['fiscal']:continue
        key=r['codes'][1];g=groups.setdefault(key,{'code':key,'name':r['names'][1],**{k:Decimal(0) for k in ['s','v','d']}})
        for k in ['s','v','d']:g[k]+=Decimal(str(r[k]))
    return [{**g,**{k:float(g[k]) for k in ['s','v','d']},'executionPct':float(g['d']/g['v']*100) if g['v']>0 else None} for g in groups.values()]
annual=aggregate(snapshots['2025-4']);sem25={r['code']:r for r in aggregate(snapshots['2025-2'])};sem26=aggregate(snapshots['2026-2'])
semesters=[]
for row in sem26:
    prior=sem25.get(row['code']);detail=details.get(row['code']);area=next((a for a in reports['areas'] if a['code']==row['code']),None)
    compatible=bool(prior and detail and not detail['reorganization2026'] and row['code'] not in ['21','35'] and area['initial2026']>0 and abs(area['current2026']/area['initial2026']-1)<=.25 and (norm(prior['name'])==norm(row['name']) or row['code']=='31'))
    factors={y:snapshots[y+'-2']['factors']['d'] for y in ['2025','2026']}
    semesters.append({'code':row['code'],'name':row['name'],'executed2025':prior['d'] if prior else None,'executed2026':row['d'],
      'initial2025':prior['s'] if prior else None,'current2025':prior['v'] if prior else None,'executionPct2025':prior['executionPct'] if prior else None,
      'initial2026':row['s'],'current2026':row['v'],'executionPct':row['executionPct'],'comparable':compatible,
      'real2025':prior['d']*factors['2025'] if prior else None,'real2026':row['d']*factors['2026'],
      'realVariationPct':(row['d']*factors['2026']/(prior['d']*factors['2025'])-1)*100 if compatible and prior['d']>0 else None,
      'factors':factors,'scopeNote':detail['reorganization2026']['explanation'] if detail and detail['reorganization2026'] else 'Comparación de alcance no confirmada.' if not compatible else None})

structure=[]
for year in range(2013,2026):
    d=snapshots[str(year)+'-4'];rows=[r for r in d['rows'] if r['fiscal']]
    structure.append({'year':year,'kind':'executed','jurisdictions':len({r['codes'][1] for r in rows}),
      'units':len({tuple(r['codes'][:5]) for r in rows}),'programs':len({tuple(r['codes'][:6]) for r in rows}),'source':source(d)})
structure.append({'year':2027,'kind':'project','jurisdictions':len(details),'units':sum(len(d['units']) for d in details.values()),'programs':sum(len(d['programs']) for d in details.values()),
  'source':{'dataset':'data/budget/2027/area-reports.json','documents':'22 documentos jurisdiccionales 2027; archivos y páginas en cada ficha'}})

# Principal-level current/voted cells come from the original official execution workbook.
snapshot=snapshots['2026-2'];assert hashlib.sha256(args.execution_2026.read_bytes()).hexdigest()==snapshot['sha256'],'Execution source hash differs'
sheet=openpyxl.load_workbook(args.execution_2026,read_only=True,data_only=True)[snapshot['sourceSheet']]
iterator=iter(sheet.values);headers=next(iterator);cols={name:i for i,name in enumerate(headers)}
baseline=defaultdict(lambda:{'initial2026':Decimal(0),'current2026':Decimal(0),'areas':defaultdict(lambda:{'initial2026':Decimal(0),'current2026':Decimal(0)})})
services2026={k:Decimal(0) for k in ['initial2026','current2026']}
fiscal_codes={tuple(r['codes']) for r in snapshot['rows'] if r['fiscal']}
for n,row in enumerate(iterator,2):
    if not row[cols['Jur']]:continue
    eco=str(int(row[cols['Eco']]))
    if not eco.startswith(('21','22')):continue
    if str(int(row[cols['Inciso']]))!='3':continue
    name=norm(str(row[cols['Desc_Ppal']]));area=str(int(row[cols['Jur']]))
    for field,column in [('initial2026','Sanción'),('current2026','Vigente_Trim2_CONT')]:
        value=Decimal(str(row[cols[column]] or 0));baseline[name][field]+=value;baseline[name]['areas'][area][field]+=value;services2026[field]+=value
for field in services2026:
    expected=sum(Decimal(str(o[field])) for a in reports['areas'] for o in a['objects'] if o['code']=='3')
    assert abs(services2026[field]-expected)<1,(field,services2026[field],expected)

services={};transfer_types={};recipients=[];support=[];positions=[]
recipient_names={'31-0-0-3126-40':'SBASE','31-0-0-3130-39':'Empresas de colectivos','45-0-0-1009-67':'Organizaciones sociales de grupos comunitarios','45-0-0-1009-41':'Hogares beneficiarios de Ciudadanía Porteña','55-0-0-570-43':'Escuelas de gestión privada','75-0-0-3199-103':'Ente Público no Estatal Parque de la Innovación','75-0-0-3200-16':'Consejo Económico y Social (CESBA)'}
for area in reports['areas']:
    code=area['code'];d=details[code];central=[]
    for p in d['programs']:
        reference={'areaCode':code,'area':area['name'],'programId':p['id'],'program':p['name'],'sourceFile':d['sources']['2027']['file'],'pdfPages':p['financialPages']}
        for r in p['principals']:
            if r['objectCode']=='3':
                key=norm(r['name']);g=services.setdefault(key,{'name':r['name'],'project2027':0,'areas':defaultdict(int),'references':[]});g['project2027']+=r['value'];g['areas'][code]+=r['value'];g['references'].append({**reference,'value':r['value'],'pdfPage':r['pdfPage']})
            if r['objectCode']=='5':
                key=norm(r['name']);g=transfer_types.setdefault(key,{'name':r['name'],'value':0,'references':[]});g['value']+=r['value'];g['references'].append({**reference,'value':r['value'],'pdfPage':r['pdfPage']})
        transfer=p['economic']['transfers']
        if transfer>0:recipients.append({**reference,'recipient':recipient_names.get(p['id']), 'value':transfer,'unspecified':p['economic']['transferUnspecified']})
        if re.match(r'actividades (centrales|comunes)( |$)',norm(p['name'])):central.append({**reference,'value':p['project2027']})
    support.append({'code':code,'name':area['name'],'value':sum(p['value'] for p in central),'total':area['project2027'],'programs':central})
    # Unit rows in the 2026 layout attach the name directly after its code.
    old=json.loads((args.extracted_dir/f'extracted-2026-{code}.json').read_text(encoding='utf8'))
    cache=json.loads((args.cache_dir/(old['source']['sha256']+'.json')).read_text(encoding='utf8'));units={};pages=[];scope_ok=True;scope_seen=False
    for i,text in enumerate(cache['pages'],1):
        if 'Cantidad de Cargos por Unidad Ejecutora' not in text:continue
        if 'El presente cuadro no incluye' in text:
            scope_seen=True
            scope_ok=scope_ok and all(norm(w) in norm(text) for w in ['Autoridades Superiores','Plantas de Gabinete','Carrera Gerencial','Carrera Profesional Hospitalaria','Personal Docente','Plantas Transitorias'])
        for line in text.splitlines():
            m=re.fullmatch(r'(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*(\D.*?)\s+((?:\d+\s+){10}\d+)',line)
            if not m or m[1]!=code:continue
            values=[int(v) for v in m[6].split()];assert sum(values[:-1])==values[-1];units['-'.join(m.group(j) for j in range(1,5))]=values[-1];pages.append(i)
    current=d['positions'];prior=sum(units.values()) if units else None
    comparable=bool(scope_seen and scope_ok and prior is not None and current and not d['reorganization2026'])
    positions.append({'code':code,'name':area['name'],'project2026':prior,'project2027':current['value'] if current else None,
       'change':current['value']-prior if comparable else None,'changePct':(current['value']/prior-1)*100 if comparable and prior else None,
       'comparable':comparable,'source2026':old['source'],'pdfPages2026':sorted(set(pages)),
       'source2027':d['sources']['2027'],'pdfPages2027':current['pdfPages'] if current else [],'units2026':units,
       'scope':current['scope'] if current else None,'exclusions':current['exclusions'] if current else None,
       'scopeNote':d['reorganization2026']['explanation'] if d['reorganization2026'] else None})

services_rows=[]
for key,r in services.items():
    b=baseline.get(key);r['areas']=[{'code':code,'name':next(a['name'] for a in reports['areas'] if a['code']==code),'value':v} for code,v in sorted(r['areas'].items(),key=lambda x:-x[1])]
    for field in ['initial2026','current2026']:
        r[field]=float(b[field]) if b else None;r[field+'RealVariationPct']=(r['project2027']/1.18/float(b[field])-1)*100 if b and b[field]>0 else None
    services_rows.append(r)
unmatched=set(baseline)-set(services)
for key in unmatched:
    b=baseline[key];services_rows.append({'name':key,'project2027':0,'areas':[],'references':[],**{f:float(b[f]) for f in ['initial2026','current2026']},**{f+'RealVariationPct':-100 if b[f]>0 else None for f in ['initial2026','current2026']}})
services_total=sum(r['project2027'] for r in services_rows)
assert services_total==sum(o['project2027'] for a in reports['areas'] for o in a['objects'] if o['code']=='3')
assert all(abs(sum(r[f] or 0 for r in services_rows)-float(services2026[f]))<1 for f in services2026)
transfer_total=sum(r['value'] for r in transfer_types.values());assert transfer_total==sum(d['economic']['transfers'] for d in details.values());assert sum(r['value'] for r in recipients)==transfer_total

fiscal_sheet=openpyxl.load_workbook(ROOT/'public/sources/serie-aif-idecba.xlsx',read_only=True,data_only=True)['SP_Fi_AX01']
debt=[]
for year in range(2013,2026):
    column=year-1995+2;income=float(fiscal_sheet.cell(3,column).value)*1e6;interest=float(fiscal_sheet.cell(27,column).value)*1e6
    debt.append({'year':year,'kind':'executed','interest':interest,'currentIncome':income,'pct':interest/income*100,
     'source':{'file':'serie-aif-idecba.xlsx','sheet':'SP_Fi_AX01','interestCell':fiscal_sheet.cell(27,column).coordinate,'incomeCell':fiscal_sheet.cell(3,column).coordinate}})
income26=read('data/revenue/income-2026-2.json');current_income26=sum(r['v'] for r in income26['rows'] if r['codes']==['1'])
interest26=sum(r['v'] for r in snapshot['rows'] if r['fiscal'] and r['codes'][9]=='21410000')
debt.append({'year':2026,'kind':'budget','interest':interest26,'currentIncome':current_income26,'pct':interest26/current_income26*100,'source':{'expense':source(snapshot),'interestCode':'21410000','incomeFile':income26['sourceFile'],'incomeCodes':'1','period':'2026-2'}})
s=project['summary'];interest=s['interest']['value'];income=s['currentRevenue']['value']
debt.append({'year':2027,'kind':'project','interest':interest,'currentIncome':income,'pct':interest/income*100,'source':{'file':project['source']['document'],'pdfPage':s['interest']['pdfPage'],'table':s['interest']['reference']}})
assert abs(debt[-3]['interest']-read('data/fiscal-results/caif.json')['periods']['2025-4']['interest'])<1

stock=None
if args.budget_pdf:
    import pypdfium2 as pdf
    assert hashlib.sha256(args.budget_pdf.read_bytes()).hexdigest()==project['source']['fileSha256']
    document=pdf.PdfDocument(args.budget_pdf);text=document[67].get_textpage().get_text_range()
    numeric=lambda label:[Decimal(v.replace('.','').replace(',','.')) for v in re.findall(r'\d[\d.]*,\d+',re.search(r'^'+label+r'[^\r\n]*',text,re.M)[0])]
    total=numeric('TOTAL')[-1]*1000000;direct=numeric('SUBTOTAL')[-1]*1000000;indirect=numeric('Deuda Indirec')[-1]*1000000
    assert abs(total-direct-indirect)<=Decimal(150000)
    assert '2026' in text and 'Prov.' in text
    stock={'date':'2026-09-30','status':'provisional','value':float(total),'direct':float(direct),'indirectAUSA':float(indirect),'unit':'USD','conversion':'Dólares estadounidenses al tipo de cambio del cierre del período; no se recalcula a pesos.','roundingDifference':float(total-direct-indirect),'source':{'file':project['source']['document'],'sha256':project['source']['fileSha256'],'pdfPage':68,'printedPage':57,'table':'Cuadro 2.7'}}
output={'schemaVersion' :1,'updated':'2026-10-12','fiscalScope':'Gastos fiscales; sin aplicaciones financieras ni partidas figurativas.',
 'execution':{'annual2025':annual,'semesters':semesters,'sources':{p:source(snapshots[p]) for p in ['2025-4','2025-2','2026-2']},'totals2025':snapshots['2025-4']['fiscalTotals'],'semesterFactors':factors},
 'structure':{'rows':structure,'note':'Un cambio de código o de nombre puede contar como unidad nueva; mide cantidad de aperturas presupuestarias, no personas.'},
 'services':{'total':services_total,'initial2026':float(services2026['initial2026']),'current2026':float(services2026['current2026']),'rows':sorted(services_rows,key=lambda r:-r['project2027']),'source2026':source(snapshot),'sourceColumns':['Inciso','Ppal','Desc_Ppal','Eco','Sanción','Vigente_Trim2_CONT'],'factor':1.18,'note':'El presupuesto no informa la cantidad de contratos ni de proveedores.'},
 'transfers':{'total':transfer_total,'types':sorted(transfer_types.values(),key=lambda r:-r['value']),'recipients':sorted(recipients,key=lambda r:-r['value']),'unspecified':sum(d['economic']['transferUnspecified'] for d in details.values()),'note':'Sin desagregación corriente/capital no significa sin receptor: son dos aperturas distintas.'},
 'debt':{'rows':debt,'stock':stock,'note':'Intereses divididos por ingresos corrientes del mismo año. 2026: autorizado a junio; 2027: proyecto. No incluye las autorizaciones de los proyectos complementarios.'},
 'support':{'total':sum(r['value'] for r in support),'rows':support,'note':'Agrupa los programas que el presupuesto clasifica como de conducción y apoyo. No mide eficiencia ni indica qué gasto es prescindible.'},
 'positions':{'rows':positions,'cityTotal':None,'note':'Cargos de los cuadros presupuestarios: no equivalen al total de empleados ni al padrón de funcionarios. 2026 corresponde al proyecto original. Los cambios de dependencia se identifican y no se comparan como el mismo alcance.'},
 'comparablePerimeter':{'available':False,'rows':[],'reason':'No hay una apertura anual verificada que aísle exclusivamente Policía y Subte en todos los años. Transporte y Seguridad Interior abarcan otros servicios. No se resta la función completa ni se imputan valores.'},
 'pending':['Serie histórica sin Subte ni Policía: falta aislar ambas funciones por año con un perímetro verificado.','Cargos: no se publica total de la Ciudad porque los cuadros disponibles tienen cobertura parcial.','Padrón de funcionarios histórico: no se estima sin cortes oficiales anteriores.']}
target=ROOT/'data/budget/2027/budget-depth.json';target.write_text(json.dumps(output,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
with target.with_suffix('.csv').open('w',encoding='utf8',newline='') as f:
    w=csv.writer(f);w.writerow(['section','year','area','concept','value','unit','stage','source','location'])
    for r in annual:
        for key,label in [('s','Votado'),('v','Ampliado al cierre'),('d','Ejecutado')]:w.writerow(['execution',2025,r['name'],label,r[key],'ARS',label,snapshots['2025-4']['sourceFile'],'Jur '+r['code']])
    for r in semesters:
        for y in ['2025','2026']:
            for field,label in [('initial','Votado'),('current','Ampliado a junio'),('executed','Ejecutado enero–junio'),('real','Ejecutado actualizado por inflación')]:
                w.writerow(['semester',y,r['name'],label,r[field+y],'ARS de abril–junio 2026' if field=='real' else 'ARS',label,snapshots[y+'-2']['sourceFile'],'Jur '+r['code']+' / factor observado '+str(r['factors'][y])])
        w.writerow(['semester',2026,r['name'],'Cambio real enero–junio vs 2025',r['realVariationPct'],'%','sólo alcance confirmado',json.dumps(output['execution']['sources'],ensure_ascii=False),r['scopeNote'] or 'mismo semestre'])
    for r in structure:
        for key in ['jurisdictions','units','programs']:w.writerow(['structure',r['year'],'Ciudad',key,r[key],'aperturas',r['kind'],json.dumps(r['source'],ensure_ascii=False),'códigos completos, sólo fiscal'])
    for r in services_rows:
        for field in ['project2027','initial2026','current2026']:w.writerow(['services',2027 if field=='project2027' else 2026,'Ciudad',r['name'],r[field],'ARS',field,json.dumps(r['references'] if field=='project2027' else source(snapshot),ensure_ascii=False),'Inciso 3 / principal / economía 21 o 22'])
    for r in transfer_types.values():w.writerow(['transfer-types',2027,'Ciudad',r['name'],r['value'],'ARS','proyecto',json.dumps(r['references'],ensure_ascii=False),'Inciso 5 / principal'])
    for r in recipients:
        for key,label in [('value','Transferencia total'),('unspecified','Sin apertura corriente/capital')]:
            w.writerow(['transfers',2027,r['area'],label+' / '+(r['recipient'] or r['program']),r[key],'ARS','proyecto',r['sourceFile'],','.join(map(str,r['pdfPages']))])
    if stock:
        for key,label in [('value','Stock total'),('direct','Deuda directa'),('indirectAUSA','Deuda indirecta AUSA')]:
            w.writerow(['debt-stock',2026,'Ciudad',label+' al 30/09 (provisorio)',stock[key],'USD','stock provisorio',stock['source']['file'],'Cuadro 2.7 / PDF p. 68 / diferencia de redondeo US$100000'])
    for r in debt:
        for key,label,unit in [('interest','Intereses','ARS'),('currentIncome','Ingresos corrientes','ARS'),('pct','Intereses / ingresos corrientes','%')]:
            w.writerow(['debt',r['year'],'Ciudad',label,r[key],unit,r['kind'],json.dumps(r['source'],ensure_ascii=False),'mismo año'])
    for a in support:
        for r in a['programs']:w.writerow(['support',2027,a['name'],r['program'],r['value'],'ARS','proyecto',r['sourceFile'],','.join(map(str,r['pdfPages']))])
    for r in positions:
        for y in ['2026','2027']:w.writerow(['positions',y,r['name'],'Cargos presupuestados (cuadro parcial)',r['project'+y],'cargos','proyecto original' if y=='2026' else 'proyecto',r['source'+y]['file'],','.join(map(str,r['pdfPages'+y]))+' / '+(r['exclusions'] or 'Sin cuadro extraído')+' / '+(r['scopeNote'] or 'Sin cambio de dependencia documentado')])
print(json.dumps({'services':services_total,'transfers':transfer_total,'support':output['support']['total'],'positions2026':sum(r['project2026'] is not None for r in positions)},ensure_ascii=False))
