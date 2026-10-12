const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'caba-preview-')),script=path.resolve(__dirname,'../scripts/package-pages.mjs');
try{
 for(const dir of ['production/dist','dist/config','previous-site/preview/pr-4'])fs.mkdirSync(path.join(tmp,dir),{recursive:true});
 fs.writeFileSync(path.join(tmp,'production/dist/index.html'),'PRODUCCIÓN PUBLICADA');
 fs.writeFileSync(path.join(tmp,'dist/index.html'),'<html><head><link rel="canonical" href="https://example.com/site/"></head><body>EN REVISIÓN</body></html>');
 fs.writeFileSync(path.join(tmp,'dist/config/site.json'),JSON.stringify({publicUrl:'https://example.com/site/'}));
 fs.writeFileSync(path.join(tmp,'previous-site/preview/pr-4/index.html'),'PREVIEW ANTERIOR');
 const run=trusted=>execFileSync(process.execPath,[script],{cwd:tmp,env:{...process.env,PREVIEW_PR:'18',PREVIEW_SHA:'abc',PREVIEW_TRUSTED:String(trusted),GITHUB_STEP_SUMMARY:''},encoding:'utf8'});
 run(false);assert(!fs.existsSync(path.join(tmp,'site-package')));
 run(true);const output=path.join(tmp,'site-package');
 assert.equal(fs.readFileSync(path.join(output,'index.html'),'utf8'),'PRODUCCIÓN PUBLICADA');
 assert.equal(fs.readFileSync(path.join(output,'preview/pr-4/index.html'),'utf8'),'PREVIEW ANTERIOR');
 const preview=path.join(output,'preview/pr-18');
 assert.equal(JSON.parse(fs.readFileSync(path.join(preview,'config/site.json'))).publicUrl,'https://example.com/site/preview/pr-18/');
 assert(fs.readFileSync(path.join(preview,'index.html'),'utf8').includes('noindex,nofollow'));
 assert.equal(JSON.parse(fs.readFileSync(path.join(preview,'preview.json'))).sha,'abc');
 console.log('Preview: producción intacta, PR separado, versiones anteriores conservadas y PR externo sin permisos de publicación.');
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
