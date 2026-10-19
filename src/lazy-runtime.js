'use strict';
// Lightweight bootstrap functions keep the original global wrapper order.
// Heavy view functions are fetched only before their view or search is used.
Site.markupPasses=[];
Site.featureFunctions=Object.create(null);
const featureRequests=new Map();
Site.loadFeature=function(name){
 if(!featureRequests.has(name))featureRequests.set(name,new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=Site.url('lazy-'+name+'.js');script.src+=(script.src.includes('?')?'&':'?')+'v='+(document.querySelector('meta[name="site-build"]')?.content||'local');
  script.onload=()=>resolve();script.onerror=()=>{script.remove();featureRequests.delete(name);reject(Error('No se pudo cargar esta vista. Reintentá la carga.'));};document.head.append(script);
 }));
 return featureRequests.get(name);
};
