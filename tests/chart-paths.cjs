const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={Math};vm.createContext(context);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../src/chart-paths.js'),'utf8'),context);
for(const points of [[[0,0],[1,7],[2,2],[3,6]],[[0,10],[1,10],[2,1]],[[0,1],[2,5],[3,6]],[[0,5],[1,-8],[2,7],[3,7]]]){
 const d=context.monotonePath(points),segments=[...d.matchAll(/C([^C]+)/g)];assert.equal(segments.length,points.length-1);
 segments.forEach((s,i)=>{const v=s[1].match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number);assert.equal(v[4],points[i+1][0]);assert.equal(v[5],points[i+1][1]);for(let k=0;k<=100;k++){const t=k/100,u=1-t,y=u**3*points[i][1]+3*u*u*t*v[1]+3*u*t*t*v[3]+t**3*v[5];assert(y>=Math.min(points[i][1],points[i+1][1])-1e-9&&y<=Math.max(points[i][1],points[i+1][1])+1e-9,'No invented extrema');}});
}
assert.equal(context.monotonePath([]),'');assert.equal(context.monotonePath([[1,2]]),'M1,2');
console.log('Curvas: pasan por los datos sin agregar máximos ni mínimos.');
