'use strict';
// Display precision only; never round source data or values used in calculations.
const numericFormatters=new Map();
function formatNumber(value,digits=0){if(!numericFormatters.has(digits))numericFormatters.set(digits,new Intl.NumberFormat('es-AR',{minimumFractionDigits:digits,maximumFractionDigits:digits,roundingMode:'halfExpand'}));return numericFormatters.get(digits).format(value);}
function formatPercent(value,{signed=false,unit=true}={}){
 if(!Number.isFinite(value))return 'Sin dato';
 const magnitude=Math.abs(value),digits=magnitude>=10?0:1;
 let number=formatNumber(magnitude,digits);
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

function formatShare(value){
 if(!Number.isFinite(value))return 'Sin dato';
 if(value>0&&value<.05)return 'menos de 0,1%';
 if(value<100&&value>99.49)return 'más del 99%';
 return formatPercent(value);
}

// One money rule. Precision changes presentation only, never the input value.
function formatMoney(value,{style='exact',currency='$'}={}){
 if(!Number.isFinite(value))return 'Sin dato';
 const sign=value<0?'−':'',absolute=Math.abs(value),approx=style==='approx';
 let number=absolute,unit='',digits=0;
 if(style!=='exact'){const big=absolute>=1e12;number=absolute/(big?1e12:1e6);unit=big?'billones':'millones';digits=approx?1:big?2:0;}
 const formatted=formatNumber(number,digits);
 return (approx?'≈ ':'')+sign+currency+'\u00a0'+formatted+(unit?'\u00a0'+unit:'');
}
function formatBillions(value,digits=0){return formatNumber(value/1e12,digits);}
function nonBreakingMoneyText(text){
 return text.replace(/≈\s*([−-]?)\$\s*([\d.,]+)\s*billones/g,(_,sign,number)=>formatMoney(Number(number.replaceAll('.','').replace(',','.'))*1e12*(sign?-1:1),{style:'approx'})).replace(/(\$|USD)\s+(?=\d)/g,'$1\u00a0').replace(/(\d)\s+(mil millones|millones|billones)/g,'$1\u00a0$2');
}
