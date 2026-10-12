const assert=require('node:assert/strict'),fs=require('node:fs');
const {allRoutes}=require('./theme-route-cases.cjs');
async function auditTheme(page){return page.evaluate(()=>{
 const parse=s=>{if(!s||s==='none')return [0,0,0,0];return (s.match(/[\d.]+/g)||[]).map(Number)},lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),blend=(a,b)=>a.slice(0,3).map((v,i)=>v*(a[3]??1)+b[i]*(1-(a[3]??1))),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 const visible=n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden'&&!n.closest('.sr-only,[hidden],[aria-hidden="true"]');
 const background=n=>{const layers=[];for(let p=n;p;p=p.parentElement)layers.push(parse(getComputedStyle(p).backgroundColor));return layers.reverse().reduce((bg,c)=>blend(c,bg),[255,255,255]);};
 const bad=[],bright=[];
 for(const n of document.querySelectorAll('body *')){
  if(!visible(n))continue;const s=getComputedStyle(n),box=n.getBoundingClientRect(),own=parse(s.backgroundColor);
  if(document.documentElement.dataset.theme==='dark'&&box.width>100&&box.height>10&&(own[3]??1)>.95&&lum(own)>.6)bright.push({tag:n.tagName,class:n.className?.baseVal??n.className,bg:s.backgroundColor,w:Math.round(box.width),h:Math.round(box.height)});
  if(![...n.childNodes].some(t=>t.nodeType===3&&t.textContent.trim()))continue;
  let bg=background(n),fg=parse(s.color);
  if(n instanceof SVGElement){fg=parse(s.fill);const svg=n.ownerSVGElement;if(svg){const point=new DOMPoint(box.x+box.width/2,box.y+box.height/2);for(const mark of svg.querySelectorAll('rect,path,circle,polygon')){if(mark.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_PRECEDING)continue;const ms=getComputedStyle(mark),fill=parse(ms.fill);if(fill.length<3||(fill[3]??1)===0||ms.fill==='none')continue;try{if(mark.isPointInFill(point.matrixTransform(mark.getScreenCTM().inverse())))bg=blend(fill,bg);}catch{}}}}
  if(fg.length<3||(fg[3]??1)===0)continue;fg=blend(fg,bg);const large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&parseInt(s.fontWeight)>=700),r=ratio(fg,bg);
  if(r<(large?3:4.5)-.03)bad.push({tag:n.tagName,class:n.className?.baseVal??n.className,parent:n.parentElement.className?.baseVal??n.parentElement.className,text:n.textContent.trim().slice(0,65),fg:s.color,bg:bg.map(Math.round),ratio:+r.toFixed(2)});
 }
 const unique=a=>a.filter((r,i)=>a.findIndex(x=>x.class===r.class&&x.fg===r.fg&&String(x.bg)===String(r.bg)&&x.tag===r.tag)===i);return {text:unique(bad),surfaces:unique(bright)};
});}
module.exports=async function({page,base}){
 await page.emulateMedia({reducedMotion:'reduce'});const failures=[],quick=process.env.THEME_AUDIT_QUICK==='1',routes=quick?['#inicio','#explorar?periodo=2025-4','#explorar?periodo=2026-2','#proyecto-2027?vista=expenses&grafico=treemap','#proyecto-2027?vista=expenses','#evolucion','#proyecto-2027?vista=areas&area=31']:allRoutes;
 let checks=0;for(const theme of quick?['dark']:['light','dark'])for(const width of quick?[375]:[375,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#inicio');await page.waitForFunction(()=>window.CabaTheme);await page.evaluate(t=>CabaTheme.set(t),theme);
  for(const route of routes){
   await page.goto(base+route);await page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');await page.evaluate(()=>render());await page.evaluate(()=>document.fonts.ready);
   for(const expanded of [false,true]){if(expanded)await page.evaluate(()=>{for(const d of document.querySelectorAll('details'))d.open=true;});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const found=await auditTheme(page);if(found.text.length||found.surfaces.length)failures.push({theme,width,route,expanded,...found});checks++;}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),theme+' '+width+' '+route+' overflow');
  }
 }
 if(process.env.CONTRAST_REPORT)fs.writeFileSync(process.env.CONTRAST_REPORT,JSON.stringify({checks,failures},null,2));
 if(failures.length){const text=[...new Map(failures.flatMap(f=>f.text.map(t=>[t.class+' '+t.fg+' '+t.bg,t]))).values()],surfaces=[...new Map(failures.flatMap(f=>f.surfaces.map(t=>[t.class+' '+t.bg,t]))).values()];console.log(JSON.stringify({checks,failedStates:failures.length,text,surfaces},null,2));}
 assert.equal(failures.length,0,'Theme contrast or bright dark-theme surfaces');console.log(`Temas: ${routes.length} rutas × dos temas × 375/1440 px, desplegables cerrados/abiertos; ${checks} estados sin contraste insuficiente ni superficies claras en oscuro.`);
};
module.exports.auditTheme=auditTheme;
if(require.main===module)(async()=>{const{chromium}=require('playwright'),b=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined}),page=await b.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await module.exports({page,base:process.env.SITE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/'});assert.deepEqual(errors,[]);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
