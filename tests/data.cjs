const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'data/index.json')));
const read=id=>JSON.parse(fs.readFileSync(path.join(root,catalog.datasets.find(d=>d.id===id).path),'utf8'));
const ids=new Set();for(const d of catalog.datasets){assert(!ids.has(d.id));ids.add(d.id);assert(d.name&&d.path&&d.period&&d.source&&d.type&&d.description);for(const file of d.files)assert(fs.existsSync(path.join(root,file)));}
const config=JSON.parse(fs.readFileSync(path.join(root,'config/site.json'))),home=JSON.parse(fs.readFileSync(path.join(root,'content/home.json')));
assert(config.currentBudgetYear&&config.currentBudgetPeriod&&config.currentExecutionPeriod&&config.currentBudgetFile&&config.lastUpdate&&config.availablePeriods);assert(home.hero.title&&home.questions.items.length);
const current=JSON.parse(fs.readFileSync(path.join(root,config.currentBudgetFile)));assert.equal(current.perCapita,current.budget/current.population);
const government=read('government-directory'),history=read('execution-history'),caif=read('caif');
assert.equal(government.people.length,government.count);assert.equal(government.nodes[0].count,government.count);
for(const n of government.nodes){assert.equal(n.count,n.people.length+n.children.reduce((sum,i)=>sum+government.nodes[i].count,0));for(const i of n.children)assert.equal(government.nodes[i].parent,n.id);}
assert(!JSON.stringify(government).match(/"(?:cuil|edad|sexo|mail_laboral)"/i));
for(const row of history.rows)assert(Math.abs(row.nominal*row.factor-row.real)<.01);
assert.equal(history.rows[0].kind,'legacy');assert(history.rows.slice(1,-1).every(r=>r.kind==='executed'));assert.equal(history.rows.at(-1).kind,'budget');
for(const period of Object.values(caif.periods)){assert(Math.abs(period.income-period.expense-period.financialResult)<1);}
for(const p of read('approved-vs-executed').periods){const d=read(p.period);assert.equal(p.initial,d.fiscalTotals.s);assert.equal(p.executed,d.fiscalTotals.d);assert(Math.abs(p.groups.reduce((v,g)=>v+g.executed,0)-p.executed)<1);}
const counts=read('conduction-counts');assert.deepEqual(counts.levels.map(l=>l.count),[10,18,82,344,932,855]);assert(!/salary|salario|sueldo|cuil/i.test(JSON.stringify(counts)));assert.equal(config.flags.salaries,false);assert.equal(config.flags.world,false);
console.log(`Datos: ${ids.size} datasets; conciliaciones fiscales y jerarquía correctas.`);
require('./project-2027.cjs');
