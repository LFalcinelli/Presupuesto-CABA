'use strict';
// The bootstrap keeps global hooks stable; only view implementations are lazy.
const featureViewData=ensureViewData;
ensureViewData=async function(view,period){
 const features=[];
 if(view==='compare')features.push('comparison');
 if(view==='project'&&(state.projectTab==='areas'||state.areaReportId))features.push('areas');
 if(view==='project'&&(state.projectTab||'summary')==='summary')features.push('investments');
 await Promise.all(features.map(name=>Site.loadFeature(name)));
 return featureViewData(view,period);
};
const searchFeatureData=loadBudgetSearch;
loadBudgetSearch=async function(){await Promise.all([Site.loadFeature('search'),searchFeatureData()]);};

function pageIndexKey(){return [state.view,state.period,state.projectTab,state.governmentArea||''].join('|');}
const indexedReadRoute=readRoute,indexedSyncRoute=syncRoute;
readRoute=function(){indexedReadRoute();state.pageBlock=new URLSearchParams(location.hash.split('?')[1]||'').get('bloque');state.pageBlockRoute=pageIndexKey();state.pageBlockPending=Boolean(state.pageBlock);};
syncRoute=function(){indexedSyncRoute();if(state.pageBlockRoute!==pageIndexKey())state.pageBlock=null;if(state.pageBlock){const [route,query]=location.hash.split('?'),q=new URLSearchParams(query||'');q.set('bloque',state.pageBlock);history.replaceState(null,'',route+'?'+q);}};
function scrollToPageBlock(id){const target=document.getElementById(id);if(!target||!target.closest('main'))return;if(target.tagName==='DETAILS')target.open=true;for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
function mountPageIndex(view){
 if(!(view==='history'||view==='project'&&['areas','revenue'].includes(state.projectTab)||view==='home'&&state.period==='2026-2'))return;
 const root=document.querySelector('main'),heading=root.querySelector('h1');if(!heading||root.querySelector('.page-index'))return;
 const items=[];
 function add(target,label){if(!target||items.some(i=>i.target===target))return;const clean=label.trim().replace(/\s+/g,' ');if(!clean)return;if(!target.id){let id='page-'+clean.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,55);if(document.getElementById(id))id+='-'+items.length;target.id=id;}items.push({target,label:clean});}
 if(view==='history'){add(root.querySelector('.execution-history'),'Serie 1997–2027');add(root.querySelector('.dollar-perspective'),'Presupuesto en dólares');add(root.querySelector('.historical-extras'),'Más comparaciones');}
 else if(state.projectTab==='areas'&&!state.governmentArea){add(root.querySelector('#gov-directory-search')?.closest('label')||root.querySelector('#gov-search')?.closest('label'),'Buscar un área');add(root.querySelector('.gov-cards'),'Áreas de Gobierno');add(root.querySelector('#budget-depth'),'Otras lecturas del presupuesto');}
 else for(const h of root.querySelectorAll('h2')){if(h.closest('article,.gov-card,.metric,.project-reading-cards,.fiscal-result-card,.page-index'))continue;add(h,h.textContent);if(items.length===8)break;}
 if(!items.length)return;
 const index=document.createElement('details');index.className='page-index';index.open=innerWidth>650;index.innerHTML='<summary>En esta página</summary><nav aria-label="Secciones de esta página">'+items.map(({target,label})=>{const [route,query]=location.hash.split('?'),q=new URLSearchParams(query||'');q.set('bloque',target.id);return `<a data-page-anchor="${E(target.id)}" href="${E(route+'?'+q)}">${E(label)}</a>`;}).join('')+'</nav>';heading.after(index);
}
document.addEventListener('click',e=>{const a=e.target.closest('[data-page-anchor]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();state.pageBlock=a.dataset.pageAnchor;state.pageBlockRoute=pageIndexKey();state.pageBlockPending=false;history.replaceState(null,'',a.href);scrollToPageBlock(state.pageBlock);},true);
const indexedEnhance=enhanceVisuals;
enhanceVisuals=function(view){indexedEnhance(view);mountPageIndex(view);};
const indexedRender=render;
render=async function(){await indexedRender();if(state.pageBlockPending){state.pageBlockPending=false;requestAnimationFrame(()=>scrollToPageBlock(state.pageBlock));}};

function publicationLabel(href){
 if(href===publicSourcePages.execution){const p=summaryFor(state.period);return ['home','detail','income','summary','financial'].includes(state.view)?`Contaduría · ${p.quarter===4?'Cierre':'Ejecución del '+p.quarter+'.º trimestre'} ${p.year}`:'Contaduría · Ejecuciones presupuestarias';}
 if(href===publicSourcePages.approved)return 'GCBA · Presupuesto 2026';
 if(href===publicSourcePages.ipcba)return 'IDECBA · Series de precios de la Ciudad';
 if(href===publicSourcePages.idecba)return 'IDECBA · Gastos e ingresos anuales';
 if(href===publicSourcePages.accounts)return 'Contaduría · Cuentas anuales de inversión';
 if(href===publicSourcePages.cifra)return 'CIFRA · Índice de precios de provincias';
 if(href===publicSourcePages.provincial)return 'Economía · Presupuestos provinciales';
 if(href===publicSourcePages.authorities)return 'GCBA · Autoridades superiores';
 if(/bcra.gob.ar.*(?:relevamiento|REM|Expectativas)/i.test(href))return /septiembre.*2026/i.test(href)?'BCRA · REM septiembre 2026':'BCRA · Relevamiento de Expectativas de Mercado';
 if(/bcra.gob.ar.*(?:cambio|com3500)/i.test(href))return 'BCRA · Tipos de cambio';
 if(/indec.gob.ar/i.test(href))return 'INDEC · Publicación estadística';
 if(/ign.gob.ar/i.test(href))return 'IGN · Superficies provinciales';
 return null;
}
const unpolishedSources=cleanCitizenSources;
cleanCitizenSources=function(fragment){
 unpolishedSources(fragment);
 const all=selector=>[...(fragment.matches?.(selector)?[fragment]:[]),...fragment.querySelectorAll(selector)];
 for(const a of all('a[href]')){
  const href=a.getAttribute('href');if(!href||a.closest('.page-index'))continue;
  const url=new URL(href,Site.base),internal=href.startsWith('#')||url.origin===Site.base.origin&&url.pathname.startsWith(Site.base.pathname)&&url.hash;
  const text=a.textContent.trim(),label=publicationLabel(href);
  const guideLabels={'#presupuesto-explicado?tema=inflacion':'Cómo se descuenta la inflación','#presupuesto-explicado?tema=por-habitante':'Cómo se calcula por habitante','#metodologia?seccion=caif':'Fuentes de la cuenta de ingresos y gastos','#metodologia?seccion=presupuesto-2027':'Fuentes del Proyecto 2027'};
  if(guideLabels[href]&&/^(?:Cómo se calcula|Fuente y metodología)\s*[↗→]?$/.test(text))a.textContent=guideLabels[href]+' →';
  if(label&&(/^(?:Consultar|Ver (?:fuente|publicación|presupuesto oficial)|Fuente oficial|Informe oficial|Publicación oficial|GCBA · ejecuciones presupuestarias)/i.test(text)||/Consultar la publicación oficial/i.test(text)))a.textContent=label+' ↗';
  for(const node of a.childNodes)if(node.nodeType===3)node.nodeValue=node.nodeValue.replace(/[↗→](?=\s*$)/,internal?'→':'↗');
 }
 const walker=document.createTreeWalker(fragment,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){if(node.parentElement?.closest('script,style,svg,select,option'))continue;let text=node.nodeValue;
  text=text.replace(/del archivo aportado|del empalme aportado/g,'de la serie histórica empalmada (ver metodología)').replace(/(?:[Ee]mpalme histórico aportado|[Ee]mpalme aportado(?: documentado)?)/g,'serie histórica empalmada (ver metodología)').replace(/del archivo aportado|del empalme aportado/g,'de la serie histórica empalmada (ver metodología)').replace(/archivo aportado/g,'serie histórica empalmada (ver metodología)');
  if(node.parentElement?.closest('button'))text=text.replace(/↗(?=\s*$)/,'→');text=nonBreakingMoneyText(text);if(text!==node.nodeValue)node.nodeValue=text;
 }
};
