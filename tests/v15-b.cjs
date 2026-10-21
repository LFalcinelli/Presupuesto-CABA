const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',f),'utf8')),d=read('data/budget/2027/area-highlights.json');
assert.equal(d.entries.length,25);assert.deepEqual([...new Set(d.entries.map(r=>r.area))],['40','29','55','45','31']);
for(const input of d.inputs)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',input.file))).digest('hex'),input.sha256);
for(const r of d.entries){
 assert(r.title.split(/\s+/).length>=2&&r.title.split(/\s+/).length<=6);assert(r.text.split(/\s+/).length<=30);assert(!/[¿?]/.test(r.title+r.text));assert.equal(r.comparisonBase,'current2026');
 assert(r.figures.length);for(const f of r.figures){const[file,pointer]=f.path.split('#');let value=read(file);for(const key of pointer.split('/').slice(1))value=value[key.replaceAll('~1','/').replaceAll('~0','~')];if(f.extract){assert(value.includes(f.extract));assert.equal(f.value,Number(f.extract.replaceAll('.','')));}else assert.equal(f.value,value,f.path);}
 for(const c of r.calculations){const v=c.inputs;const expected=c.op==='sum'?v.reduce((a,b)=>a+b,0):c.op==='divide'?v.reduce((a,b)=>a/b):c.op==='rate'?(v[0]/v[1]/v[2]-1)*100:v[0]/v[1]*100;assert.equal(c.value,expected,c.name);}
}
const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/citizen-vocabulary.js'),'utf8'),context);
for(const[a,b]of [['Unidad ejecutora','Oficina'],['Jurisdicción','Área de gobierno'],['Finalidad y función','Para qué se gasta'],['Incisos','Qué se paga'],['Pesos nominales','Pesos de cada año, sin ajustar por inflación'],['Tributos de jurisdicción nacional','Coparticipación federal'],['Formación y Sanción de Leyes','Formación y Sanción de Leyes']])assert.equal(context.citizenVocabularyText(a),b);
console.log('v15 B: 25 destacados, fuentes numéricas y metas verificadas, fórmulas reproducibles y vocabulario ciudadano.');
