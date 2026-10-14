import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(),pr=process.env.PREVIEW_PR||'',trusted=process.env.PREVIEW_TRUSTED==='true';
if(pr&&!trusted){console.log('PR externo: sólo validación, sin publicación.');process.exit(0);}
assert(!pr||/^\d+$/.test(pr),'Número de PR inválido');
const production=path.join(root,pr?'production/dist':'dist'),output=path.join(root,'site-package');
assert(fs.existsSync(path.join(production,'index.html')),'Falta el sitio de producción');
fs.mkdirSync(output,{recursive:true});fs.cpSync(production,output,{recursive:true});
const previous=path.join(root,'previous-site','preview');
if(fs.existsSync(previous))fs.cpSync(previous,path.join(output,'preview'),{recursive:true});
if(pr){
 const preview=path.join(output,'preview','pr-'+pr);
 fs.mkdirSync(preview,{recursive:true});fs.cpSync(path.join(root,'dist'),preview,{recursive:true});
 const configFile=path.join(preview,'config/site.json'),config=JSON.parse(fs.readFileSync(configFile,'utf8'));
 const productionPublicUrl=config.publicUrl,publicUrl=productionPublicUrl+'preview/pr-'+pr+'/';config.publicUrl=publicUrl;
 fs.writeFileSync(configFile,JSON.stringify(config,null,2)+'\n');
 const index=path.join(preview,'index.html');let html=fs.readFileSync(index,'utf8');
 html=html.replace('</head>','<meta name="robots" content="noindex,nofollow"></head>');
 html=html.replaceAll(productionPublicUrl,publicUrl);
 html=html.replace('<body>','<body><aside class="preview-banner" style="padding:8px 16px;background:#371859;color:white;font:14px sans-serif;text-align:center">Vista previa del PR '+pr+' · versión en revisión</aside>');
 fs.writeFileSync(index,html);
 fs.writeFileSync(path.join(preview,'preview.json'),JSON.stringify({pr:Number(pr),sha:process.env.PREVIEW_SHA,url:publicUrl},null,2)+'\n');
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`\nVista previa pública: [PR ${pr}](${publicUrl})\n`);
}
assert.equal(fs.readFileSync(path.join(output,'index.html'),'utf8'),fs.readFileSync(path.join(production,'index.html'),'utf8'),'La portada de producción debe conservarse');
console.log(JSON.stringify({package:'site-package',preview:pr?'preview/pr-'+pr+'/':null,productionPreserved:true}));
