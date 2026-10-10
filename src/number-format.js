'use strict';
// Display precision only; never round source data or values used in calculations.
function formatPercent(value,{signed=false,unit=true}={}){
 if(!Number.isFinite(value))return 'Sin dato';
 const magnitude=Math.abs(value),digits=magnitude>=10?0:1;
 let number=new Intl.NumberFormat('es-AR',{minimumFractionDigits:digits,maximumFractionDigits:digits,roundingMode:'halfExpand'}).format(magnitude);
 // A value such as 9.96 rounds to 10; do not display an unnecessary ",0".
 if(number==='10,0')number='10';
 const sign=value<0?'−':signed&&value>0?'+':'';
 return sign+number+(unit?'%':'');
}
function formatPercentText(text){
 return text.replace(/([+−-]?)(\d+(?:\.\d{3})*(?:,\d+)?)\s*%/g,(match,sign,number)=>{
  const value=Number(number.replaceAll('.','').replace(',','.'))*(sign==='−'||sign==='-'?-1:1);
  return formatPercent(value,{signed:sign==='+'});
 });
}
