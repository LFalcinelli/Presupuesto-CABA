"""Build a compact search and principal index; never change verified input datasets.

Usage: python scripts/build-search-budget.py --execution-2026 official.xlsx
"""
import argparse,json,re,hashlib,unicodedata
from collections import defaultdict
from decimal import Decimal
from pathlib import Path
import openpyxl

arg=argparse.ArgumentParser(description=__doc__);arg.add_argument('--execution-2026',type=Path,required=True);args=arg.parse_args()
read=lambda p:json.loads(Path(p).read_text(encoding='utf8'))
norm=lambda s:re.sub('[^a-z0-9]+',' ',unicodedata.normalize('NFD',str(s)).encode('ascii','ignore').decode().lower()).strip()
reports=read('data/budget/2027/area-reports.json');snapshot=read('data/budget/2026/2026-2.json');details={a['code']:read(a['detailFile']) for a in reports['areas']}
assert hashlib.sha256(args.execution_2026.read_bytes()).hexdigest()==snapshot['sha256']
baseprograms={};principals={};fields=['initial2026','current2026','executed2026']
def principal(inc,name):
 key=inc+'-'+norm(name).replace(' ','-')
 return principals.setdefault(key,{'id':'principal-'+key,'kind':'principal','objectCode':inc,'name':name,'project2027':0,**{f:0 for f in fields},'areas':{},'programs':[],'components2026':[]})
sheet=openpyxl.load_workbook(args.execution_2026,read_only=True,data_only=True)[snapshot['sourceSheet']]
it=iter(sheet.values);columns={v:i for i,v in enumerate(next(it))}
for rownum,row in enumerate(it,2):
 if not row[columns['Jur']] or not str(int(row[columns['Eco']])).startswith(('21','22')):continue
 codes=[str(int(row[columns[k]] or 0)) for k in ['Jur','Sjur','Ent','UE','Prog']];key='-'.join(codes);inc=str(int(row[columns['Inciso']]));name=str(row[columns['Desc_Ppal']])
 values={f:Decimal(str(row[columns[c]] or 0)) for f,c in zip(fields,['Sanción','Vigente_Trim2_CONT','Devengado_Trim2_CONT'])}
 p=baseprograms.setdefault(key,{'id':key,'codes':codes,'name':row[columns['Desc_Prog']],'unitName':row[columns['Desc_UE']],'areaName':row[columns['Desc_Jur']],**{f:Decimal(0) for f in fields},'firstRow':rownum,'lastRow':rownum})
 for f in fields:p[f]+=values[f]
 p['lastRow']=rownum
 r=principal(inc,name);component=str(row[columns['Desc_Parc']]);r['components2026'].append(component) if component not in r['components2026'] else None
 area=r['areas'].setdefault(codes[0],{'code':codes[0],'name':p['areaName'],'project2027':0,**{f:Decimal(0) for f in fields}})
 for f in fields:r[f]+=values[f];area[f]+=values[f]
for p in baseprograms.values():
 for f in fields:p[f]=float(p[f])
for r in principals.values():
 for f in fields:r[f]=float(r[f])
 for a in r['areas'].values():
  for f in fields:a[f]=float(a[f])
entries=[];used=set();unit_aliases=defaultdict(list)
for a in reports['areas']:
 d=details[a['code']];code=a['code'];source=d['sources']['2027']['file']
 entries.append({'id':a['id'],'kind':'area','areaCode':code,'name':a['name'],'areaName':a['name'],'project2027':a['project2027'],**{f:a[f] for f in fields},'comparisonStatus':'reorganized' if d['reorganization2026'] else 'continues','scopeNote':(d['reorganization2026'] or {}).get('explanation'),'source':source,'pages':sorted({p['pdfPage'] for p in d['units']})})
 for p in d['programs']:
  exact=baseprograms.get(p['id']);aliases=[]
  for old in set(p['antecedents']+[p['id']]):
   if old in baseprograms:
    used.add(old);aliases.append(baseprograms[old]['name']);unit_aliases['-'.join(p['codes'][:4])].append(baseprograms[old]['unitName'])
  u=next(u for u in d['units'] if u['code']==p['unitCode'])
  entry={'id':'program-'+p['id'],'kind':'program','areaCode':code,'unitCode':p['unitCode'],'programId':p['id'],'codes':p['codes'],'name':p['name'],'unitName':u['name'],'areaName':a['name'],'project2027':p['project2027'],**{f:p.get(f) if p.get(f) is not None else (exact or {}).get(f) for f in fields},'comparisonStatus':p['comparisonStatus'],'scopeNote':p['comparisonEvidence'],'aliases':sorted(set(aliases)),'description':p['description'],'targets':p['targets'],'source':source,'pages':p['financialPages'],'principals':[{'id':principal(r['objectCode'],r['name'])['id'],'name':r['name'],'value':r['value'],'page':r['pdfPage']} for r in p['principals']]}
  entries.append(entry)
  for r in p['principals']:
   g=principal(r['objectCode'],r['name']);g['project2027']+=r['value'];ar=g['areas'].setdefault(code,{'code':code,'name':a['name'],'project2027':0,**{f:0 for f in fields}});ar['project2027']+=r['value']
   g['programs'].append({'id':entry['id'],'areaCode':code,'areaName':a['name'],'unitName':u['name'],'name':p['name'],'value':r['value'],'source':source,'page':r['pdfPage']})
 for u in d['units']:
  entries.append({'id':'unit-'+u['id'],'kind':'unit','codes':u['codes'],'areaCode':code,'unitCode':u['code'],'name':u['name'],'areaName':a['name'],'project2027':u['project2027'],**{f:u.get(f) for f in fields},'comparisonStatus':u['comparisonStatus'],'scopeNote':u['comparisonEvidence'],'source':source,'pages':[u['pdfPage']],'aliases':sorted(set(unit_aliases[u['id']]))})
# A 2026 programme is represented by its 2027 successor or the same full key,
# never by name alone. Pending continuity blocks percentage comparisons.
for p in baseprograms.values():
 if p['id'] in used or not any(p[f] for f in fields):continue
 entries.append({'id':'program-2026-'+p['id'],'kind':'program','areaCode':p['codes'][0],'unitCode':p['codes'][3],'programId':None,'codes':p['codes'],'name':p['name'],'unitName':p['unitName'],'areaName':p['areaName'],'project2027':None,**{f:p[f] for f in fields},'comparisonStatus':'continuity-pending','source':snapshot['sourceFile'],'pages':[],'sheetRows':[p['firstRow'],p['lastRow']]})
currentunits=defaultdict(list)
for p in baseprograms.values():currentunits['-'.join(p['codes'][:4])].append(p)
knownunits={e['id'][5:] for e in entries if e['kind']=='unit'}
# Verified programme recodes attach the former unit name to its successor.
mappedunits={old.rsplit('-',1)[0] for d in details.values() for p in d['programs'] for old in p['antecedents'] if old.rsplit('-',1)[0] not in knownunits}
for key,ps in currentunits.items():
 if key in knownunits or key in mappedunits:continue
 entries.append({'id':'unit-2026-'+key,'kind':'unit','codes':ps[0]['codes'][:4],'areaCode':ps[0]['codes'][0],'unitCode':ps[0]['codes'][3],'name':ps[0]['unitName'],'areaName':ps[0]['areaName'],'project2027':None,**{f:sum(p[f] for p in ps) for f in fields},'comparisonStatus':'continuity-pending','source':snapshot['sourceFile'],'pages':[],'sheetRows':[min(p['firstRow'] for p in ps),max(p['lastRow'] for p in ps)]})
for r in principals.values():
 r['areas']=sorted(r['areas'].values(),key=lambda a:a['project2027'],reverse=True);r['programs'].sort(key=lambda p:p['value'],reverse=True)
 r['comparisonStatus']='continues';r['areas']=[dict(a,scopeNote=(details.get(a['code'],{}).get('reorganization2026') or {}).get('explanation')) for a in r['areas']]
 entries.append({k:r[k] for k in ['id','kind','name','objectCode','project2027',*fields,'comparisonStatus']})
for inc in ['1','3']:
 for f in ['project2027',*fields[:2]]:
  expected=sum(o[f] for a in reports['areas'] for o in a['objects'] if o['code']==inc)
  assert abs(sum(r[f] for r in principals.values() if r['objectCode']==inc)-expected)<2,(inc,f)
assert len({e['id'] for e in entries})==len(entries)
depth=read('data/budget/2027/budget-depth.json');conduction=read('data/government/conduction-counts.json');directory=read('data/government/government-directory.json')
out={'schemaVersion':1,'year':2027,'deflator':1.18,'structure':{'jurisdictions':len(details),'units':sum(len(d['units']) for d in details.values()),'programs':sum(len(d['programs']) for d in details.values()),'officials':directory['count'],'conduction':conduction},'support':{'value':depth['support']['total'],'share':depth['support']['total']/sum(a['project2027'] for a in reports['areas'])*100},'source2026':{k:snapshot[k] for k in ['sourceFile','sourceUrl','sourceSheet','sha256']},'sources2027':{c:d['sources']['2027'] for c,d in details.items()},'entries':entries}
Path('data/budget/2027/search-index.json').write_bytes((json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n').encode())
Path('data/budget/2027/principals.json').write_bytes((json.dumps({'schemaVersion':1,'source2026':out['source2026'],'sources2027':out['sources2027'],'rows':list(principals.values())},ensure_ascii=False,separators=(',',':'))+'\n').encode())
catalog=read('data/index.json')
for id,file,label in [('search-index-2027','search-index','Buscador integrado 2026–2027'),('principals-2027','principals','Partidas principales de gastos 2026–2027')]:
 catalog['datasets']=[d for d in catalog['datasets'] if d['id']!=id];path=f'data/budget/2027/{file}.json';catalog['datasets'].append({'id':id,'name':label,'path':path,'period':'2026-2027','lastUpdate':'2026-10-13','source':'Ejecución oficial 2026 y documentos jurisdiccionales 2027; referencias en cada registro.','type':'derived','description':label,'files':[path]})
Path('data/index.json').write_bytes((json.dumps(catalog,ensure_ascii=False,indent=2)+'\n').encode())
print('Entries',dict((k,sum(e['kind']==k for e in entries)) for k in ['area','unit','program','principal']))
print('Advertising',[(r['name'],r['project2027'],len(r['programs'])) for r in principals.values() if 'publicidad' in norm(r['name'])])
