'use strict';
// Runs before styles: no light flash, and automatic mode follows system changes.
(()=>{
 const media=matchMedia('(prefers-color-scheme: dark)');let preference='auto';
 try{const saved=localStorage.getItem('caba-theme');if(['auto','light','dark'].includes(saved))preference=saved;}catch{}
 function apply(){const theme=preference==='auto'?(media.matches?'dark':'light'):preference;document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#230552':'#371859');document.querySelector('#theme-preference')?.setAttribute('data-resolved',theme);window.dispatchEvent(new CustomEvent('caba-theme',{detail:{preference,theme}}));}
 window.CabaTheme={get preference(){return preference;},get resolved(){return document.documentElement.dataset.theme;},set(value){if(!['auto','light','dark'].includes(value))return;preference=value;try{localStorage.setItem('caba-theme',value);}catch{}apply();}};
 media.addEventListener('change',()=>{if(preference==='auto')apply();});apply();
})();
