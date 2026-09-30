const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'migration-baseline.json')));
for(const f of baseline.files){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f.path))).digest('hex'),f.sha256,'Cambiaron los datos de '+f.path);}
const dist=path.join(root,'dist');assert(fs.existsSync(path.join(dist,'index.html')));
for(const f of baseline.files)assert.equal(fs.readFileSync(path.join(root,f.path)).compare(fs.readFileSync(path.join(dist,f.path))),0);
assert(!fs.existsSync(path.join(dist,'docs')));assert(!fs.existsSync(path.join(dist,'tests')));
console.log(`Migración: ${baseline.files.length} archivos de datos idénticos byte por byte al snapshot.`);
