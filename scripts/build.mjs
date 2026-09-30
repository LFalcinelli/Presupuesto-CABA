import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist');
if(path.dirname(output)!==root||path.basename(output)!=='dist')throw Error('Destino inválido');
if(fs.existsSync(output)&&fs.lstatSync(output).isSymbolicLink())throw Error('dist no puede ser un enlace');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output);
for(const file of fs.readdirSync(path.join(root,'src'))){
 if(!/\.(js|css|html)$/.test(file))throw Error('Archivo de interfaz inesperado: '+file);
 fs.copyFileSync(path.join(root,'src',file),path.join(output,file));
}
for(const folder of ['public','config','content','data']){
 const destination=folder==='public'?output:path.join(output,folder);
 fs.cpSync(path.join(root,folder),destination,{recursive:true,filter:source=>!source.split(path.sep).includes('raw')});
}
const files=fs.readdirSync(output,{recursive:true}).filter(f=>fs.statSync(path.join(output,f)).isFile()).sort();
const hash=crypto.createHash('sha256');
for(const file of files){if(file==='index.html')continue;hash.update(file.replaceAll('\\','/')).update(fs.readFileSync(path.join(output,file)));}
const build=hash.digest('hex').slice(0,12);
const config=JSON.parse(fs.readFileSync(path.join(root,'config/site.json'),'utf8'));
const resources=JSON.parse(fs.readFileSync(path.join(root,'data/index.json'),'utf8')).resources;
const index=path.join(output,'index.html');let html=fs.readFileSync(index,'utf8');
html=html.replace(/<meta name="site-build"[^>]*>/,`<meta name="site-build" content="${build}">`);
html=html.replace(/((?:src|href)="\.\/[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"/g,`$1?v=${build}"`);
html=html.replace(/https:\/\/lfalcinelli\.github\.io\/Presupuesto-CABA\//g,config.publicUrl);
html=html.replace(/\b(href|src)="\.\/(data\/[^"?]+)"/g,(_,attr,file)=>`${attr}="./${resources[file]||file}"`);
// CSS files remain at the public root, with all local URLs relative to that root.
for(const file of files.filter(f=>f.endsWith('.css'))){const p=path.join(output,file);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(/url\((['"]?)\/(?!\/)/g,'url($1./'));}
fs.writeFileSync(index,html);fs.writeFileSync(path.join(output,'.nojekyll'),'');
for(const file of files.filter(f=>f.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(output,file),'utf8'),{filename:file});
for(const folder of ['docs','tests','scripts','.github','.git','.openai','src'])if(fs.existsSync(path.join(output,folder)))throw Error('Archivo interno en el artefacto: '+folder);
console.log(JSON.stringify({build,files:files.length+1,output:'dist',dataChanged:false}));
