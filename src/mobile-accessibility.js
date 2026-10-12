'use strict';
const mobileView=()=>matchMedia('(max-width: 650px)').matches;
const mobileFoldState=new Map();let mobileFoldKey='';
const themedDisplayName=displayName;
displayName=name=>citizenDisplayName(themedDisplayName(name));
governmentTitle=name=>displayName(name);
function nonBreakingMoneyText(text){return text.replace(/(\$|USD)\s+(?=\d)/g,'$1\u00a0').replace(/(\d)\s+(mil millones|millones|billones)/g,'$1\u00a0$2');}
const accessibleLanguage=citizenLanguage;
citizenLanguage=function(html,view){return accessibleLanguage(html,view).split(/(<[^>]*>)/).map(part=>part.startsWith('<')?part:nonBreakingMoneyText(part)).join('');};
const accessibleLoad=ensureViewData;
ensureViewData=async function(view,period){await accessibleLoad(view,period);if(view==='project'&&state.projectTab==='areas')state.governmentSemester=await dataFile('semester-analysis');};
const mobileReadRoute=readRoute;
readRoute=function(){mobileReadRoute();if(state.view==='compare'&&mobileView()&&!state.compareDisplay)state.compareDisplay='ranking';};
const themedComparisonColor=comparisonColor;
comparisonColor=function(value,min,max){
 if(CabaTheme.resolved!=='dark'||!Number.isFinite(value))return themedComparisonColor(value,min,max);
 const c=comparisonState();if(c.ind.id==='balance'){if(Math.abs(value)<1e-10)return '#BDB1D1';const ratio=Math.min(1,Math.abs(value)/Math.max(Math.abs(min),Math.abs(max),.001));return (value<0?['#996D70','#D98F86','#FFC0AD']:['#588D7A','#7BBA9E','#B1EBCF'])[Math.min(2,Math.floor(ratio*3))];}
 const values=c.rows.map(r=>r.indicators[c.ind.id]).sort((a,b)=>a-b),cut=q=>{const x=(values.length-1)*q,lo=Math.floor(x);return values[lo]+(values[Math.ceil(x)]-values[lo])*(x-lo);};return ['#77618F','#937BB0','#AF98CD','#CBB5E7','#E5D6FA'][[.2,.4,.6,.8].filter(q=>value>cut(q)).length];
};
const themedFiscalModel=fiscalModel;
fiscalModel=function(){const m=themedFiscalModel();if(CabaTheme.resolved==='dark')for(const [roots,colors] of [[m.left,['#6FD3A8','#9CD9C5','#89C1D7','#BADDD1','#A6D2DC','#B8CFB5','#C7DCD1']],[m.right,['#C7B3F0','#AE96D4','#D8C6E9','#9FC0D6','#99C8BB','#E0BC86','#C6BACF']]])roots.forEach((n,i)=>{function paint(id){m.by[id].color=colors[i%colors.length];for(const child of m.by[id].children||[])paint(child);}paint(n.id);});return m;};
const compactFiscalMap=fiscalMapMarkup;
fiscalMapMarkup=function(){
 const html=compactFiscalMap().replace('El mapa fiscal de Buenos Aires','De dónde viene y a dónde va el dinero');if(!mobileView())return html;
 const t=document.createElement('template');t.innerHTML=html;const section=t.content.firstElementChild,m=fiscalModel();
 const compact=document.createElement('div');compact.className='fm-mobile-overview';
 compact.innerHTML=[[m.left,m.d.totals.revenue,'De dónde viene'],[m.right,m.d.totals.expense,'Para qué se usa']].map(([roots,total,label])=>{const ordered=roots.map(n=>m.by[n.id]).sort((a,b)=>b.value-a.value),top=ordered.slice(0,4),rest=ordered.slice(4),items=[...top,...(rest.length?[{label:'Otros',value:rest.reduce((s,n)=>s+n.value,0),color:'var(--reference)'}]:[])];return `<figure><figcaption>${label}</figcaption><div class="fm-mobile-stack" role="img" aria-label="${E(items.map(n=>n.label+': '+pct(n.value/total*100)).join('; '))}">${items.map(n=>`<i style="flex:${n.value};background:${n.color}" aria-hidden="true"></i>`).join('')}</div><ul>${items.map(n=>`<li><i style="background:${n.color}"></i><span>${E(displayName(fiscalShortLabels[n.id]||n.label))}</span><strong>${pct(n.value/total*100)}</strong></li>`).join('')}</ul></figure>`;}).join('');
 const fold=document.createElement('details');fold.className='fm-mobile-details';fold.open=mobileFoldState.get('fm-mobile-details')===true;fold.innerHTML='<summary>Ver el detalle <span>Explorá los componentes y sus importes</span></summary>';for(const child of [...section.children])if(!child.classList.contains('fm-heading'))fold.append(child);section.append(compact,fold);return t.innerHTML;
};
const accessibleMapRefresh=refreshFiscalMap;
refreshFiscalMap=function(attribute,value){const fold=document.querySelector('.fm-mobile-details');if(fold)mobileFoldState.set('fm-mobile-details',fold.open);accessibleMapRefresh(attribute,value);accessibleEnhancements();if(attribute)document.querySelector(`[${attribute}="${value}"]`)?.focus({preventScroll:true});};
function foldMobileSection(section,title,summary){
 if(!section||section.closest('.mobile-section'))return;
 if(section.tagName==='DETAILS'){section.classList.add('mobile-section');const s=section.querySelector(':scope>summary');if(s){const label=[...s.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(label)label.textContent=title;}if(s&&!s.querySelector('.mobile-fold-description'))s.insertAdjacentHTML('beforeend',`<span class="mobile-fold-description">${E(summary)}</span>`);return;}
 const inner=section.querySelector(':scope>details');if(inner&&section.children.length===1){inner.querySelector(':scope>summary')?.remove();inner.replaceWith(...inner.childNodes);}
 const fold=document.createElement('details');fold.className='mobile-section';fold.dataset.section=section.id;fold.innerHTML=`<summary>${E(title)}<span class="mobile-fold-description">${E(summary)}</span></summary>`;section.before(fold);fold.append(section);if(section.querySelector('#gov-unit,#gov-program')||['gov-unit','gov-program'].includes(section.id))fold.open=true;
}
function openMobileAncestors(node){for(let p=node?.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}
function accessibleEnhancements(){
 const key=state.view+'/'+(state.governmentArea||'');if(key!==mobileFoldKey){mobileFoldState.clear();mobileFoldKey=key;}
 const theme=document.querySelector('#theme-preference');if(theme)theme.value=CabaTheme.preference;
 const toggle=document.querySelector('#theme-toggle');if(toggle){const labels={auto:'Automático',light:'Claro',dark:'Oscuro'};toggle.setAttribute('aria-label','Tema: '+labels[CabaTheme.preference].toLowerCase()+' (cambiar)');toggle.firstElementChild.innerHTML=themeIcon(CabaTheme.preference);}
 for(const button of document.querySelectorAll('[data-theme-choice]'))button.setAttribute('aria-pressed',String(button.dataset.themeChoice===CabaTheme.preference));
 const nav=document.querySelector('.gov-section-nav');if(nav){const labels={'gov-stages':'Etapas','gov-changes':'Dónde cambia','gov-composition':'En qué se usa','gov-financing':'Financiamiento','gov-ranking':'Unidades','gov-organization':'Organización'};for(const a of nav.querySelectorAll('[data-gov-scroll]'))a.textContent=labels[a.dataset.govScroll]||a.textContent;
  const extras=[[document.querySelector('.gov-positions')?.closest('section'),'gov-positions-section','Cargos y obras'],[document.querySelector('.gov-sources'),'gov-sources-section','Fuentes']];for(const [node,id,label] of extras)if(node){node.id=id;if(!nav.querySelector(`[data-gov-scroll="${id}"]`))nav.insertAdjacentHTML('beforeend',`<a href="#${id}" data-gov-scroll="${id}">${label}</a>`);}
 }
 for(const tile of document.querySelectorAll('.purpose-function-tile,.purpose-rest-tile,.treemap-tile,.point-readout>span')){
  const rgb=getComputedStyle(tile).backgroundColor.match(/[\d.]+/g)?.map(Number);if(!rgb||rgb.length<3||rgb[3]===0)continue;
  const luminance=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);let l=luminance(rgb);const light=luminance([244,239,250]),dark=luminance([18,10,31]);if(Math.max((light+.05)/(l+.05),(l+.05)/(dark+.05))<4.5){const shaded=rgb.slice(0,3).map(v=>Math.round(v*.88));tile.style.backgroundColor='rgb('+shaded.join(',')+')';l=luminance(shaded);}tile.style.setProperty('--tile-ink',(light+.05)/(l+.05)>=(l+.05)/(dark+.05)?'#F4EFFA':'#120A1F');tile.classList.add('contrast-tile');
 }
 if(mobileView()){const tabs=document.querySelector('.mobile-explorer .tabs'),active=tabs?.querySelector('.active,[aria-selected="true"],[aria-pressed="true"]');if(tabs&&active)tabs.scrollLeft=Math.max(0,active.offsetLeft-tabs.offsetLeft-(tabs.clientWidth-active.offsetWidth)/2);}

 const controls=document.querySelector('#explorer-controls>.wrap'),period=controls?.querySelector('.compact-period'),tabs=controls?.querySelector('.controls');
 if(period&&tabs){controls.classList.add('mobile-explorer');period.querySelector('select')?.setAttribute('aria-label','Período de los datos');}
 if(mobileView()){
  for(const button of document.querySelectorAll('.main-nav button')){const names={landing:'Inicio',summary:'Datos',compare:'Comparar',explained:'Guía'};if(names[button.dataset.view]){button.setAttribute('aria-label',button.textContent);button.textContent=names[button.dataset.view];}}
  for(const button of document.querySelectorAll('[data-project-tab="areas"]'))button.textContent='Áreas';
  for(const control of document.querySelectorAll('.review-base-control,.gov-comparison-tools')){if(control.closest('.mobile-base'))continue;const select=control.querySelector('select');if(!select)continue;const fold=document.createElement('details');fold.className='mobile-base';fold.innerHTML=`<summary>Comparando con: ${select.value==='current'?'ampliado':'votado'} 2026 <span aria-hidden="true">⌄</span></summary>`;control.before(fold);fold.append(control);}
  if(document.querySelector('.gov-kpis')){
   const d=state.governmentAreaDetail;
   const share=document.querySelector('[data-gov-share]');if(share){share.setAttribute('aria-label','Copiar enlace de esta ficha');share.textContent='Copiar enlace ↗';}
   const note=document.querySelector('.government-areas>h1+.gov-note');if(note)note.textContent='Proyecto 2027 · pendiente de aprobación.';
   foldMobileSection(document.querySelector('#gov-financing'),'Cómo se financia','Origen de los recursos del área');
   foldMobileSection(document.querySelector('#gov-ranking'),'Unidades y programas',`${d?.units.length||0} unidades · ${d?.programs.length||0} programas para explorar`);
   foldMobileSection(document.querySelector('#gov-organization'),'Organización','Funciones, correspondencias y cambios documentados');
   foldMobileSection(document.querySelector('.gov-positions')?.closest('section'),'Cargos y obras','Dotación prevista y proyectos de inversión');
   foldMobileSection(document.querySelector('.gov-sources'),'Fuentes y descargas','Documentos oficiales, páginas y criterios');
   for(const node of document.querySelectorAll('#gov-unit,#gov-program'))openMobileAncestors(node);
  }
  for(const node of document.querySelectorAll('.reveal-ready'))node.classList.add('reveal-visible');
  for(const fold of document.querySelectorAll('.fm-mobile-details,.mobile-section,.mobile-base')){const id=fold.dataset.section||fold.className;if(mobileFoldState.has(id))fold.open=mobileFoldState.get(id);}
 }
 for(const node of document.querySelectorAll('.gov-kpis,.project-comparison-result')){node.setAttribute('aria-live','polite');node.setAttribute('aria-atomic','true');}
 for(const [i,chart] of [...document.querySelectorAll('.gov-stage-bars,.gov-contributions,.review-bars,.income-composition,.change-chart')].entries()){
  if(chart.hasAttribute('aria-describedby'))continue;
  const rows=[...chart.querySelectorAll('.review-bar,.gov-stage-row,.gov-contribution,.change-row')],table=document.createElement('div');table.className='sr-only';
  table.innerHTML=`<table class="accessible-data-table"><caption id="accessible-chart-${i}">Lectura en tabla del gráfico: categorías y valores</caption><thead><tr><th>Concepto</th><th>Valor mostrado</th></tr></thead><tbody>${rows.map(row=>{const name=row.querySelector('.review-bar-name,:scope>span')?.textContent||'Categoría',value=row.getAttribute('aria-label')||row.textContent;return `<tr><th scope="row">${E(name)}</th><td>${E(value)}</td></tr>`;}).join('')}</tbody></table>`;
  chart.before(table);chart.setAttribute('role','group');chart.setAttribute('aria-describedby','accessible-chart-'+i);
 }
 // Inline source quotations and downloads retain their official spelling.
 const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){if(node.parentElement.closest('script,style,table,.gov-sources,.gov-source-details,.method-source,.source-reference'))continue;const text=citizenDisplayName(node.nodeValue);if(text!==node.nodeValue)node.nodeValue=text;}
 if(CabaTheme.resolved==='dark')for(const node of document.querySelectorAll('.map-help,.map-legend')){for(const text of [...node.childNodes].filter(n=>n.nodeType===3))text.nodeValue=text.nodeValue.replace(/Más oscuro/g,'Más claro').replace(/más oscuro/g,'más claro');}
 const change=document.querySelector('.gov-kpis article:nth-child(2) strong,.project-comparison-result strong,.real-change-reading strong');
 const live=document.querySelector('#view-announcement'),base=document.querySelector('#gov-base,#project-review-base');if(live)live.textContent=(document.querySelector('main h1')?.textContent||'')+(base?' · Comparando con: '+(base.value==='current'?'ampliado':'votado')+' 2026':'')+(change?' · '+change.textContent:'');
}
const mobileEnhance=enhanceVisuals;
enhanceVisuals=function(view){mobileEnhance(view);accessibleEnhancements();};
const accessibleRender=render;
render=function(...args){for(const fold of document.querySelectorAll('.fm-mobile-details,.mobile-section,.mobile-base'))mobileFoldState.set(fold.dataset.section||fold.className,fold.open);return accessibleRender(...args);};
const accessibleShell=explorerShell;
explorerShell=function(){accessibleShell();
 const date=document.querySelector('meta[name="site-reviewed"]')?.content,footer=document.querySelector('#updated-label');if(footer&&date)footer.textContent=footer.textContent.replace(/Sitio revisado: [\d/]+/,'Sitio revisado: '+date);
 if(mobileView()){
  const controls=document.querySelector('#explorer-controls>.wrap');if(controls)controls.classList.add('mobile-explorer');
  for(const b of document.querySelectorAll('.main-nav button')){const names={landing:'Inicio',summary:'Datos',compare:'Comparar',explained:'Guía'};if(names[b.dataset.view])b.textContent=names[b.dataset.view];}
  for(const b of document.querySelectorAll('.tabs [data-project-tab="areas"]'))b.textContent='Áreas';
 }
};
document.addEventListener('change',e=>{if(e.target.id==='theme-preference')CabaTheme.set(e.target.value);});
document.addEventListener('click',e=>{const choice=e.target.closest('[data-theme-choice]');if(choice){CabaTheme.set(choice.dataset.themeChoice);document.querySelector('.theme-menu').open=false;document.querySelector('#theme-toggle').focus();}});
window.addEventListener('caba-theme',()=>{if(state.dataset&&document.querySelector('main').getAttribute('aria-busy')==='false'){state.navigationRequested=false;render();}});
document.addEventListener('click',e=>{const link=e.target.closest('[data-gov-scroll]');if(link)openMobileAncestors(document.getElementById(link.dataset.govScroll));},true);
document.addEventListener('toggle',e=>{const fold=e.target;if(fold.isConnected&&fold.matches('.fm-mobile-details,.mobile-section,.mobile-base'))mobileFoldState.set(fold.dataset.section||fold.className,fold.open);},true);
let previousScroll=0;
window.addEventListener('scroll',()=>{const current=scrollY;if(!mobileView()||current<180||current<previousScroll-3)document.documentElement.classList.remove('nav-hidden');else if(current>previousScroll+3)document.documentElement.classList.add('nav-hidden');previousScroll=current;},{passive:true});
matchMedia('(max-width: 650px)').addEventListener('change',()=>{if(state.dataset){state.navigationRequested=false;render();}});

function spendingChartMode(){return state.spendingChart||((innerWidth<=650)?'bars':'treemap');}
function spendingChartControls(){const mode=spendingChartMode();return `<div class="spending-chart-choice" role="group" aria-label="Gráfico de composición"><button class="small-btn" data-spending-chart="bars" aria-pressed="${mode==='bars'}">Barras</button><button class="small-btn" data-spending-chart="treemap" aria-pressed="${mode==='treemap'}">Rectángulos</button></div>`;}
const mobileCompositionTreemap=compositionTreemap;
compositionTreemap=function(items,options={}){if(options.badgeContext)return reviewTreemap(items,options);const spending=state.view==='home'||state.view==='project'&&state.projectTab==='expenses';if(!spending)return mobileCompositionTreemap(items,options);return spendingChartControls()+(spendingChartMode()==='bars'?reviewCompositionBars(items,options):mobileCompositionTreemap(items,options));};
const mobilePurposeTree=projectPurposeTree;
projectPurposeTree=function(){if(spendingChartMode()!=='bars')return spendingChartControls()+mobilePurposeTree();const total=state.project.summary.fiscalExpense.value,items=state.project.breakdowns.purposes.map(r=>({...r,action:`data-project-purpose="${E(r.name)}"`,children:r.value/total>.5?state.project.breakdowns.functions.filter(f=>f.purpose===r.name).map(f=>({...f,action:`data-project-function="${E(f.id)}"` })):[]}));return spendingChartControls()+reviewCompositionBars(items,{label:'Destinos del gasto · parte del total',shareTotal:total});};
const spendingReadRoute=readRoute,spendingSyncRoute=syncRoute;
readRoute=function(){spendingReadRoute();const choice=new URLSearchParams(location.hash.split('?')[1]||'').get('grafico');state.spendingChart=['bars','treemap'].includes(choice)?choice:null;};
syncRoute=function(){spendingSyncRoute();if(state.spendingChart&&(state.view==='home'||state.view==='project'&&state.projectTab==='expenses')){const q=new URLSearchParams(location.hash.split('?')[1]||'');q.set('grafico',state.spendingChart);history.replaceState(null,'',location.hash.split('?')[0]+'?'+q);}};
document.addEventListener('click',e=>{const button=e.target.closest('[data-spending-chart]');if(button){state.spendingChart=button.dataset.spendingChart;state.navigationRequested=false;render();}});
