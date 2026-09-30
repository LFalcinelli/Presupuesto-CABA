// Import a reviewed structured dataset without reading other domains or downloading sources.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [id,input]=process.argv.slice(2);
if(!id||!input){console.error('Uso: node scripts/update-dataset.mjs <id del catálogo> <archivo revisado>');process.exit(1);}
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/index.json'),'utf8'));
const entry=catalog.datasets.find(d=>d.id===id);if(!entry)throw Error('Dataset no registrado: '+id);
const destination=path.resolve(root,entry.path);
if(!destination.startsWith(path.join(root,'data')+path.sep)||entry.path.includes('/raw/'))throw Error('Destino inválido');
const bytes=fs.readFileSync(path.resolve(input));
if(destination.endsWith('.json'))JSON.parse(bytes.toString('utf8'));
const temp=destination+'.tmp';fs.writeFileSync(temp,bytes);fs.renameSync(temp,destination);
console.log('Importado '+entry.path+'. Revisar metadata, fuentes y tests del dominio antes de publicar.');
