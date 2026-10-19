const fs=require('node:fs'),assert=require('node:assert/strict');
const [beforeFile,afterFile]=process.argv.slice(2),before=JSON.parse(fs.readFileSync(beforeFile)),after=JSON.parse(fs.readFileSync(afterFile));
const key=r=>[r.route,r.width,r.theme].join('|'),old=new Map(before.records.map(r=>[key(r),r])),failures=[];
function canonicalMoney(text){return text.replace(/\s+/g,' ').replace(/^≈\s*/,'').replace(/\$\s*/,'$').trim();}
const sortedMoney=r=>r.money.map(canonicalMoney).sort(),destinations=r=>r.links.filter(a=>!a.href.includes('bloque=')).map(a=>a.href.replace(/^https?:\/\/127\.0\.0\.1:\d+\/Presupuesto-CABA\//,'./')).sort();
for(const r of after.records){const b=old.get(key(r));assert(b,key(r));for(const [field,a,z] of [['amounts',sortedMoney(b),sortedMoney(r)],['charts',b.charts,r.charts],['cards',b.cards,r.cards],['destinations',destinations(b),destinations(r)]]){try{assert.deepEqual(z,a);}catch{failures.push({key:key(r),field,before:a,after:z});}}}
const report={states:after.records.length,failures};if(process.env.EQUALITY_REPORT)fs.writeFileSync(process.env.EQUALITY_REPORT,JSON.stringify(report,null,2));
if(failures.length)console.error(JSON.stringify(report,null,2));assert.equal(failures.length,0,'Visible money, charts, cards or link destinations changed');console.log(`v14: ${report.states} estados con los mismos importes, gráficos, tarjetas y destinos. Solo cambia el índice añadido y los formatos autorizados.`);
