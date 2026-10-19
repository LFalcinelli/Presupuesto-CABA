'use strict';
function governmentRealChange(row,base=governmentBasis()){
 return row[base]>0?100*(row.project2027/state.areaReports.deflator.factor/row[base]-1):null;
}
function governmentBaseName(){return state.governmentBase==='current'?'ampliado':'votado';}
function governmentObjectGroup(area,codes){
 const rows=area.objects.filter(o=>codes.includes(o.code));
 return Object.fromEntries(['project2027','initial2026','current2026','executed2026'].map(s=>[s,rows.reduce((n,o)=>n+(o[s]||0),0)]));
}
function governmentEconomic(...args){return Site.featureFunctions.governmentEconomic.apply(this,args);}
function governmentFinancing(...args){return Site.featureFunctions.governmentFinancing.apply(this,args);}
function governmentReadings(...args){return Site.featureFunctions.governmentReadings.apply(this,args);}
function governmentReorganization(...args){return Site.featureFunctions.governmentReorganization.apply(this,args);}
function governmentProgramOpenings(...args){return Site.featureFunctions.governmentProgramOpenings.apply(this,args);}
