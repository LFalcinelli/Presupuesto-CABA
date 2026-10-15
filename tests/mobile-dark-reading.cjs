const assert=require('node:assert/strict');
const routes=['#inicio','#proyecto-2027?vista=summary','#proyecto-2027?vista=areas&area=31','#proyecto-2027?vista=revenue','#evolucion','#comparar'];
async function contrastProblems(page){return page.evaluate(()=>{
 const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number),l=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0),bad=[];
 for(const node of document.querySelectorAll('main *,footer *,nav.main-nav *')){
  if(![...node.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||!node.getClientRects().length||node.closest('svg,.treemap-tile,.purpose-function-tile,.purpose-rest-tile,[hidden]'))continue;
  const s=getComputedStyle(node);if(s.visibility==='hidden')continue;let bg=[255,255,255],opacity=1;
  for(let p=node;p;p=p.parentElement){const ps=getComputedStyle(p);opacity*=Number(ps.opacity);const c=rgb(ps.backgroundColor);if(c.length===3||c[3]===1){bg=c;break;}}
  if(opacity<.99)continue;const color=rgb(s.color);if(color.length<3)continue;const a=l(color),b=l(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&parseInt(s.fontWeight)>=700),min=large?3:4.5;
  if(ratio<min-.05)bad.push({tag:node.tagName,class:node.className,parent:node.parentElement.className,grandparent:node.parentElement.parentElement?.className,text:node.textContent.trim().slice(0,44),color:s.color,bg:bg.slice(0,3),ratio:+ratio.toFixed(2)});
 }return bad.filter((r,i,a)=>a.findIndex(s=>s.class===r.class&&s.color===r.color&&String(s.bg)===String(r.bg))===i);
});}
module.exports=async function({page,base}){
 const go=async route=>{await page.goto(base+route);await page.evaluate(()=>{readRoute();return render();});const slug=route.slice(1).split('?')[0];await page.waitForFunction(expected=>routeNames[state.view]===expected&&document.querySelector('main')?.getAttribute('aria-busy')==='false',slug);};
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto(base);await page.waitForFunction(()=>document.querySelector("main")?.getAttribute("aria-busy")==="false");
 for(const theme of ['light','dark']){
  await page.evaluate(t=>CabaTheme.set(t),theme);
  for(const route of routes){
   await page.setViewportSize({width:375,height:1000});await go(route);
   assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
   assert.deepEqual(await contrastProblems(page),[],theme+' '+route+' AA contrast');
   const small=await page.locator('button:visible,select:visible,input:visible,.gov-section-nav a:visible').evaluateAll(nodes=>nodes.filter(n=>!n.closest('svg,.treemap-tile,.purpose-function-tile,.purpose-rest-tile')).map(n=>({label:n.getAttribute('aria-label')||n.textContent.trim().slice(0,40),r:n.getBoundingClientRect()})).filter(n=>n.r.width>0&&n.r.height>0&&(n.r.width<24||n.r.height<24)).map(n=>({label:n.label,w:n.r.width,h:n.r.height})));assert.deepEqual(small,[],route+' touch targets');
   if(route==='#inicio'){await page.evaluate(()=>scrollTo({top:700,behavior:'instant'}));await page.waitForFunction(()=>document.documentElement.classList.contains('nav-hidden'));await page.evaluate(()=>scrollTo({top:250,behavior:'instant'}));await page.waitForFunction(()=>!document.documentElement.classList.contains('nav-hidden'));await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));assert.equal(await page.locator('.fm-mobile-stack').count(),2);assert.equal(await page.locator('.fm-mobile-details').evaluate(n=>n.open),false);assert((await page.locator('#updated-label').innerText().then(text=>text.replace(/\u00a0/g,' '))).includes(await page.locator('meta[name="site-reviewed"]').getAttribute('content')));}
   if(route.includes('area=31')){assert((await page.locator('.gov-kpis article').first().boundingBox()).y<850);assert.equal(await page.locator('.mobile-section[data-section="gov-ranking"]').evaluate(n=>n.open),false);assert(await page.locator('.gov-kpis').getAttribute('aria-live'));assert.deepEqual(await page.locator('.gov-section-nav a').evaluateAll(ns=>ns.map(n=>n.textContent.replace(/\s*[\u2192\u2197]$/,'').trim())),['Etapas','Dónde cambia','En qué se usa','Financiamiento','Unidades','Organización','Cargos y obras','Fuentes']);assert.equal(await page.locator('.gov-kpis article').last().evaluate(n=>getComputedStyle(n).gridColumn),'1 / -1');assert.equal(await page.locator('.mobile-section[data-section="gov-ranking"]>summary').evaluate(n=>getComputedStyle(n).display),'block');}
   if(route==='#evolucion'){assert((await page.locator('.execution-chart').boundingBox()).width<=375);assert((await page.locator('.history-year-label').count())<=9);assert((await page.locator('.history-axis-unit').textContent()).includes('2026'));}
   if(route==='#comparar')assert.equal(await page.locator('[data-compare-display="ranking"]').getAttribute('aria-pressed'),'true');
   await page.setViewportSize({width:320,height:1000});const zoomStyle=await page.addStyleTag({content:'html{font-size:200%!important}'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' text 200% overflow');await zoomStyle.evaluate(n=>n.remove());
  }
 }
 await go('#inicio');assert.equal((await page.locator('#theme-toggle').boundingBox()).width,44);await page.locator('#theme-toggle').click();await page.locator('[data-theme-choice="auto"]').click();await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'),'#230552');await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 await page.locator('#theme-toggle').click();await page.locator('[data-theme-choice="dark"]').click();await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');await page.evaluate(()=>CabaTheme.set('light'));
 await page.setViewportSize({width:375,height:1000});await go('#proyecto-2027?vista=expenses');await page.waitForFunction(()=>document.querySelector('.spending-chart-choice'));assert.equal(await page.locator('[data-spending-chart="bars"]').getAttribute('aria-pressed'),'true');assert(await page.locator('.review-bars').count());await page.locator('[data-spending-chart="treemap"]').click();await page.waitForFunction(()=>document.querySelector('.purpose-tree-frame'));assert(page.url().includes('grafico=treemap'));await page.reload();await page.waitForFunction(()=>document.querySelector('[data-spending-chart="treemap"]')?.getAttribute('aria-pressed')==='true');
 await go('#estructura?periodo=2026-2');await page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false'&&document.querySelector('.mobile-explorer .tabs button.active')?.dataset.view==='structure');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert(await page.locator('.mobile-explorer .tabs button.active').evaluate(n=>{const a=n.getBoundingClientRect(),b=n.parentElement.getBoundingClientRect();return a.left>=b.left-1&&a.right<=b.right+1;}));
 console.log('Móvil y temas: seis vistas, AA claro/oscuro, controles ≥24 px, texto 200% a 320 px, preferencias y tema automático verificados.');
};
module.exports.contrastProblems=contrastProblems;
if(require.main===module)(async()=>{const{chromium}=require('playwright'),browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await module.exports({page,base:process.env.SMOKE_BASE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});


