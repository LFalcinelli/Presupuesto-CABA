const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const c=vm.createContext({Intl});vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/number-format.js'),'utf8'),c);
for(const [value,expected] of [[12.5,'13%'],[-42.5,'−43%'],[9.96,'10%'],[9.94,'9,9%'],[10,'10%'],[-9.96,'−10%'],[.04,'0,0%'],[0,'0,0%'],[1.25,'1,3%'],[1000.5,'1.001%']])assert.equal(c.formatPercent(value),expected);
assert.equal(c.formatPercent(12.5,{signed:true}),'+13%');assert.equal(c.formatPercentText('18,0% · −42,5% · +9,96% · $ 24,1 billones'),'18% · −43% · +10% · $ 24,1 billones');
console.log('Porcentajes: precisión por magnitud, empates negativos, umbral de 10 y dinero sin alterar verificados.');
