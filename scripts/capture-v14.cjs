const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const base=process.env.SITE_URL||'http://127.0.0.1:8766/Presupuesto-CABA/',phase=process.env.QA_PHASE||'after',part=process.env.QA_PART||'pbg';
const dir=path.resolve(process.env.QA_DIR||'../outputs/v14/captures',phase);fs.mkdirSync(dir,{recursive:true});
const routes=part==='pbg'?['#evolucion?serie=currentPrimary','#evolucion?serie=currentPrimaryPbg','#metodologia?seccion=historia']:['#inicio','#proyecto-2027?vista=summary','#proyecto-2027?vista=expenses','#proyecto-2027?vista=revenue','#proyecto-2027?vista=areas','#explorar?periodo=2026-2','#gastos?periodo=2026-2','#ingresos?periodo=2026-2','#explorar?periodo=2025-4','#gastos?periodo=2025-4','#ingresos?periodo=2025-4','#evolucion?serie=currentPrimaryPbg','#comparar','#metodologia?seccion=historia'];
(async()=>{const b=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined}),p=await b.newPage(),records=[],errors=[];p.on('pageerror',e=>errors.push(e.message));const ready=()=>p.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');
try{
 await p.emulateMedia({reducedMotion:'reduce'});
 for(const width of [375,1440])for(const theme of ['light','dark'])for(const [i,route] of routes.entries()){
  await p.setViewportSize({width,height:1000});await p.goto(base+route);await ready();await p.evaluate(async t=>{CabaTheme.set(t);await render();},theme);await ready();await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({path:path.join(dir,`${String(i+1).padStart(2,'0')}-${theme}-${width}.png`),fullPage:true,animations:'disabled'});
  const record=await p.evaluate(()=>{const root=document.querySelector('main'),clone=root.cloneNode(true);clone.querySelectorAll('details').forEach(n=>n.open=true);clone.querySelectorAll('.page-index').forEach(n=>n.remove());document.body.append(clone);const text=clone.innerText;clone.remove();return {money:[...(text.replaceAll('\u00a0',' ').matchAll(/(?:≈\s*)?[−-]?\$\s*[\d.,]+(?:\s*(?:billones|millones))?/g))].map(m=>m[0].replace(/\s+/g,' ').trim()).sort(),charts:root.querySelectorAll('svg').length,cards:root.querySelectorAll('article').length,links:[...root.querySelectorAll('a[href]')].filter(a=>!a.closest('.page-index')).map(a=>({text:a.textContent.trim(),href:a.getAttribute('href')}))};});records.push({route,width,theme,...record});
 }
 const timings=[];
 for(const width of [375,1440])for(let repeat=0;repeat<3;repeat++){
  const context=await b.newContext({viewport:{width,height:1000}}),page=await context.newPage();
  for(const route of ['#inicio','#comparar','#metodologia?seccion=historia','#gastos?periodo=2026-2']){const start=performance.now();await page.goto(base+route);await page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');timings.push({width,repeat,route,milliseconds:Math.round(performance.now()-start)});}await context.close();
 }
 fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify({part,phase,records,timings,errors},null,2));if(errors.length)throw Error(errors.join('\n'));
 console.log(JSON.stringify({part,phase,captures:records.length,timings},null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
