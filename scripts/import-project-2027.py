"""Import the supplied official PDF; raw document stays outside the repository.
Usage: python scripts/import-project-2027.py /path/to/official.pdf
Optional maintenance dependency: pdfplumber (not needed to build the site).
"""
from pathlib import Path
import sys,re,json,hashlib,csv
from decimal import Decimal
import pdfplumber

ROOT=Path(__file__).resolve().parents[1]
PDF=Path(sys.argv[1])
DOC='3083 - PDLEY 36 - MJE 42 (Presupuesto 2027).pdf'
UNIVERSE='Administración Gubernamental: Administración Central, organismos descentralizados, entes autárquicos y órganos de control. Gastos corrientes y de capital; sin figurativas ni aplicaciones financieras.'
source={'document':DOC,'documentId':'PDLEY-2026-36-GCABA-AJG','messageId':'MJE-2026-42-GCABA-AJG','fileSha256':hashlib.sha256(PDF.read_bytes()).hexdigest(),'date':'2026-09-30','url':None,'origin':'Documento oficial aportado por el usuario','annexId':'IF-2026-43938160-GCABA-SSHA'}
pdf=pdfplumber.open(PDF)
texts={}
def text(page):
    if page not in texts: texts[page]=pdf.pages[page-1].extract_text(x_tolerance=1,y_tolerance=2) or ''
    return texts[page]
def integer(s): return int(s.replace('.',''))
def metric(value,page,reference,kind='official',method=None):
    return {'value':value,'unit':'ARS nominales de 2027','status':'project','type':kind,'universe':UNIVERSE,'source':DOC,'pdfPage':page,'reference':reference,**({'method':method} if method else {})}
def amount(label,page=190,occurrence=None):
    lines=[l for l in text(page).splitlines() if l.startswith(label+' ')]
    assert len(lines)==1 if occurrence is None else len(lines)>occurrence,(label,lines)
    return integer(re.search(r'([\d.]+)$',lines[occurrence or 0]).group(1))
def m(label,page=190,ref='Planilla 16 · artículo 5'): return metric(amount(label,page),page,ref)
summary={
 'currentExpense':metric(19768623479401,3,'Artículo 1'),
 'capitalExpense':m('V) Gastos de Capital'),
 'fiscalExpense':m('X) Gastos Totales (VII+IX)'),
 'legalHeadline':metric(24094340599263,3,'Artículo 1'),
 'currentRevenue':m('I) Ingresos Corrientes'),
 'capitalRevenue':m('IV) Recursos de Capital'),
 'fiscalRevenue':m('VI) Recursos Totales (I+IV)'),
 'economicPrimaryResult':m('III) Resultado Económico Primario (I-II)'),
 'primaryExpense':m('VII) Gasto Primario (II+V)'),
 'primaryResult':m('VIII) Resultado Primario (VI - VII)'),
 'interest':m('IX) Intereses de la Deuda Pública'),
 'financialResult':m('XI) Resultado Financiero (VI - X)'),
 'figurativeExpense':metric(1728685077476,3,'Artículo 3'),
 'figurativeRevenue':metric(1728685077476,3,'Artículo 3'),
 'financialSources':m('XII) Fuentes Financieras'),
 'financialApplications':m('XIII) Aplicaciones Financieras'),
 'debtAmortizationAndOtherLiabilities':m('Amortización de la Deuda y Disminución de Otros Pasivos'),
 'debtAndOtherLiabilities':m('Endeudamiento Público e Incremento de Otros Pasivos'),
 'financialInvestmentIncrease':m('Incremento de la Inversión Financiera'),
 'financialInvestmentDecrease':metric(162781198566,4,'Artículo 4'),
}
for key in ['currentExpense','legalHeadline','figurativeExpense']:
    assert f"{summary[key]['value']:,}".replace(',','.') in text(summary[key]['pdfPage'])
v=lambda key:summary[key]['value']
summary['economicResult']=metric(v('currentRevenue')-v('currentExpense'),190,'Planilla 16 · artículo 5','calculation','Ingresos corrientes − gastos corrientes, incluidos intereses.')
summary['perCapita']=metric(v('fiscalExpense')/3121707,3,'Artículo 1 y población definitiva Censo 2022','calculation','Gasto fiscal solicitado / 3.121.707 habitantes. Mismo denominador que 2026.')
summary['perCapita']['unit']='ARS nominales de 2027 por habitante censado en 2022'
def three_columns(page):
    out=[]
    for line in text(page).splitlines():
        hit=re.match(r'^(.+?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)$',line)
        if hit:
            name,a,b,total=hit.groups();a,b,total=map(integer,[a,b,total]);assert a+b==total,(name,a,b,total)
            out.append((name,total,a,b))
    return out
purposes=[];functions=[];parent=None
purpose_names=['Administración Gubernamental','Servicios de Seguridad','Servicios Sociales','Servicios Económicos','Deuda Pública - Intereses y Gastos']
for name,total,a,b in three_columns(174):
    if name=='TOTAL': assert total==v('fiscalExpense');continue
    row={'id':str(len(functions)+len(purposes)+1),'name':name,**metric(total,174,'Planilla 5 · artículo 1'),'central':a,'decentralized':b}
    if name in purpose_names and not (parent==name and name.startswith('Deuda')):
        parent=name;purposes.append(row)
    else: row['purpose']=parent;functions.append(row)
jurisdictions=[{'id':str(i+1),'name':name,**metric(total,175,'Planilla 6 · artículo 1'),'central':a,'decentralized':b} for i,(name,total,a,b) in enumerate(three_columns(175)) if name!='TOTAL']
object_names=['Personal','Bienes de consumo','Servicios no personales','Bienes de uso','Transferencias','Activos financieros','Servicio de la deuda','Otros gastos']
objects=[]
for line in text(173).splitlines():
    hit=re.match(r'^(.+?)\s+((?:[\d.]+\s+){8}[\d.]+)$',line)
    if not hit: continue
    name,nums=hit.groups()
    if name!='TOTAL': continue
    nums=list(map(integer,nums.split()));assert sum(nums[:-1])==nums[-1],name
    objects.extend({'id':str(i+1),'name':n,**metric(val,173,'Planilla 4 · artículo 1')} for i,(n,val) in enumerate(zip(object_names,nums[:-1])))
revenue=[{'id':str(i+1),'name':label,**(metric(amount(label,occurrence=0),190,'Planilla 16 · artículo 5 · ingresos corrientes') if label=='Transferencias Corrientes' else m(label))} for i,label in enumerate(['Ingresos Tributarios','Ingresos No Tributarios','Ventas de Bienes y Servicios de la Administración Pública','Rentas de la Propiedad','Transferencias Corrientes','IV) Recursos de Capital'])]
revenue[-1]['name']='Recursos de capital'
taxes=[]
taxnames=['Sobre el Patrimonio','Sobre la Producción, el Consumo y las Transacciones','Otros tributos locales','Tributos de Jurisdicción Nacional']
for name in taxnames:
    hit=re.search(r'^'+re.escape(name)+r'\s+([\d.]+)\s+[\d,]+$',text(183),re.M);assert hit,name
    taxes.append({'id':str(len(taxes)+1),'name':name,**metric(integer(hit.group(1)),183,'Planilla 11 · artículo 2')})
authorizations=[]
for name,value,term in [('Subte Línea D',36840981552,1),('Subte Línea B',313796652511,4),('Agenda digital y equipamiento de salud · Ley 6.758',56465559240,4),('Subte Línea F · Ley 6.960',348473165594,5)]:
    assert f'{value:,}'.replace(',','.') in text(237)
    authorizations.append({'name':name,**metric(value,237,'Planilla 43 · artículo 11'),'minimumAmortizationYears':term,'note':'Autorización propia del documento. No se suma al gasto fiscal ni a las fuentes como una partida adicional.'})
assert v('currentExpense')+v('capitalExpense')==v('fiscalExpense')==v('legalHeadline')
assert v('currentRevenue')+v('capitalRevenue')==v('fiscalRevenue')
assert v('fiscalRevenue')-v('fiscalExpense')==v('financialResult')
assert v('primaryResult')-v('interest')==v('financialResult')
assert v('financialSources')+v('financialResult')==v('financialApplications')
for rows in [purposes,functions,jurisdictions,objects]: assert sum(r['value'] for r in rows)==v('fiscalExpense')
assert sum(r['value'] for r in revenue)==v('fiscalRevenue')
assert sum(r['value'] for r in taxes)==revenue[0]['value']
for purpose in purposes: assert sum(r['value'] for r in functions if r['purpose']==purpose['name'])==purpose['value']
assert len(jurisdictions)==22
project={'schemaVersion':1,'year':2027,'status':'project','documentDate':source['date'],'source':source,'currency':'ARS','priceBasis':'nominal','universe':UNIVERSE,'population':{'value':3121707,'year':2022,'kind':'definitive-census','source':'GCBA / INDEC · Censo 2022, resultados definitivos'},'summary':summary,'breakdowns':{'purposes':purposes,'functions':functions,'jurisdictions':jurisdictions,'objects':objects,'economic':[{'id':'current','name':'Gastos corrientes',**summary['currentExpense']},{'id':'capital','name':'Gastos de capital',**summary['capitalExpense']}],'revenue':revenue,'taxRevenue':taxes},'creditAuthorizations':authorizations,'macroAssumptions':{'quantitative':[],'qualitative':'El mensaje toma como referencia el marco nacional y describe menor inflación y variación pautada del tipo de cambio. No se incorpora un deflactor anual 2027 no cuantificado en esas páginas.','pdfPages':[31,32]},'limitations':['No contiene una apertura completa de programas que permita reproducir el explorador de ejecución.','El artículo 28 y otras remisiones normativas no se analizan como cambios tributarios en esta iteración.','Código Fiscal, Impositiva, Arancelaria, Bono Proveedores, Belgrano Sur y Emergencia Hídrica quedan fuera del alcance. No se suman autorizaciones de proyectos separados.','No se publica el PDF aportado; la trazabilidad conserva documento, hash, página física del PDF y planilla/artículo. La URL pública exacta del archivo está pendiente.'],'reconciliation':{'status':'verified','legalHeadlineEqualsFiscalExpense':True,'figurativesSeparate':True,'financialApplicationsSeparate':True,'breakdownsReconciled':['purposes','functions','jurisdictions','objects','revenue','taxRevenue']}}
dest=ROOT/'data/budget/2027';dest.mkdir(parents=True,exist_ok=True)
(dest/'project.json').write_text(json.dumps(project,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
with (dest/'project.csv').open('w',encoding='utf8',newline='') as f:
    w=csv.writer(f);w.writerow(['dimension','id','name','value','unit','status','pdfPage','reference'])
    for dimension,rows in project['breakdowns'].items():
        for row in rows:w.writerow([dimension,row['id'],row['name'],row['value'],row['unit'],row['status'],row['pdfPage'],row['reference']])
print(json.dumps({'fiscalExpense':v('fiscalExpense'),'revenue':v('fiscalRevenue'),'financialResult':v('financialResult'),'perCapita':summary['perCapita']['value'],'purposes':len(purposes),'functions':len(functions),'jurisdictions':len(jurisdictions),'objects':len(objects),'reconciled':True}))
