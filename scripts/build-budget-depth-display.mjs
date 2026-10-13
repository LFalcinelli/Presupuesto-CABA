import fs from 'node:fs';
import vm from 'node:vm';
// Presentation export only: the verified source CSV and JSON remain unchanged.
const context=vm.createContext({});
vm.runInContext(fs.readFileSync('src/display-names.js','utf8'),context);
const display=context.budgetDepthDisplayName;
function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(cell);cell='';}
  else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(cell||row.length){row.push(cell);rows.push(row);}return rows;
}
const rows=parseCSV(fs.readFileSync('data/budget/2027/budget-depth.csv','utf8'));
const headers=rows[0],area=headers.indexOf('area'),concept=headers.indexOf('concept');
for(const row of rows.slice(1)){row[area]=display(row[area]);row[concept]=display(row[concept]);}
const data=JSON.parse(fs.readFileSync('data/budget/2027/budget-depth.json','utf8'));
for(const row of data.execution.annual2025)rows.push(['execution-voted-ratio','2025',display(row.name),'Ejecutado frente a lo votado',row.s>0?String(row.d/row.s*100):'','%','cierre anual',data.execution.sources['2025-4'].sourceFile,'Jur '+row.code+' / devengado dividido por sanción']);
const quote=value=>/[",\r\n]/.test(value)?'"'+value.replaceAll('"','""')+'"':value;
fs.writeFileSync('data/budget/2027/budget-depth-display.csv',rows.map(row=>row.map(quote).join(',')).join('\n')+'\n');
console.log('CSV de lectura generado; fuentes y cifras originales intactas.');
