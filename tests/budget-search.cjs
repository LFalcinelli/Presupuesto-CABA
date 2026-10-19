const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>JSON.parse(fs.readFileSync(p)),index=read('data/budget/2027/search-index.json'),principals=read('data/budget/2027/principals.json'),areas=read('data/budget/2027/area-reports.json');
const context=vm.createContext({Site:{featureFunctions:{}},state:{budgetSearchIndex:index,searchTopics:read('content/search-topics.json')},citizenGlossary:{}});
vm.runInContext(fs.readFileSync('src/budget-search.js','utf8').split('let budgetSearchPromise;')[0],context);
vm.runInContext(fs.readFileSync('src/lazy-search.js','utf8'),context);
const search=q=>context.budgetSearch(q),norm=context.searchNorm;
for(const q of ['pauta','publicidad','propaganda']){const rows=search(q);assert(rows.some(r=>r.kind==='principal'&&norm(r.name)==='publicidad y propaganda'));assert(rows.filter(r=>['unit','program'].includes(r.kind)&&r.related.some(t=>t.id==='communication')).length>=10,q);}
assert(search('ambiente').filter(r=>r.kind==='unit'&&r.related.some(t=>t.id==='green')).length>=8);
assert(search('género').some(r=>norm(r.name+' '+(r.aliases||[]).join(' ')).includes('mujer')));
assert(!search('género').some(r=>r.kind==='unit'&&norm(r.name)==='direccion general contaduria'),'Género must not match General');
for(const q of ['eventos','ferias'])assert(search(q).some(r=>r.related.some(t=>t.id==='events')));
const central=index.entries.filter(r=>r.kind==='program'&&/actividades (centrales|comunes)/.test(norm(r.name))),bureaucracy=search('burocracia');for(const r of central)assert(bureaucracy.some(e=>e.id===r.id));
assert.equal(new Set(index.entries.map(e=>e.id)).size,index.entries.length);
for(const kind of ['unit','program']){const entries=index.entries.filter(e=>e.kind===kind);assert.equal(new Set(entries.map(e=>e.codes.join('-'))).size,entries.length,kind+' deduplicated across years');}
const cultural=search('Transformación Cultural').filter(r=>norm(r.name)==='transformacion cultural');assert.equal(cultural.length,1);assert.equal(cultural[0].project2027,null);
assert(search('publicidd').some(r=>r.kind==='principal'&&norm(r.name)==='publicidad y propaganda'));
for(const inc of ['1','3'])for(const key of ['project2027','initial2026','current2026'])assert(Math.abs(principals.rows.filter(r=>r.objectCode===inc).reduce((s,r)=>s+r[key],0)-areas.areas.reduce((s,a)=>s+a.objects.find(o=>o.code===inc)[key],0))<2);
const ad=principals.rows.find(r=>norm(r.name)==='publicidad y propaganda');assert.equal(ad.project2027,133915908563);assert.equal(ad.programs.length,26);assert.equal(ad.areas.reduce((s,a)=>s+a.project2027,0),ad.project2027);
const income=read('data/revenue/increases-2027.json');for(const r of income.rows){assert(Math.abs(r.realDifferenceInitial-(r.project2027/1.18-r.initial2026))<.01);assert(Math.abs(r.realDifferenceCurrent-(r.project2027/1.18-r.current2026))<.01);}
assert.equal(index.structure.officials,2595);assert.equal(index.structure.programs,499);
console.log('Buscador: temas, raíces, errores de tipeo, unicidad por códigos y continuidad; publicidad/personal e ingresos conciliados.');

for(const q of ['pauta','publicidad','propaganda'])assert(!search(q).some(r=>/senalizaci|se\u00f1alizaci|iluminaci|alumbrado|posicionamiento.*educ/i.test(r.name)),'Sin asociaciones incidentales: '+q);
