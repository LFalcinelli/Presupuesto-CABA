/* Portability only: canonical resource catalog, editorial content and base URL. */
window.Site={
 base:new URL('.',document.currentScript.src),resources:{},config:null,content:{},
 url(input){const [file,...query]=input.replace(/^\/+/, '').split('?');const target=this.resources[file]||file;const url=new URL(target,this.base);if(query.length)url.search=query.join('?');return url.href;},
 async load(input){const request=new URL(this.url(input));if(request.origin===this.base.origin)request.searchParams.set('v',document.querySelector('meta[name="site-build"]')?.content||'local');const r=await fetch(request);if(!r.ok)throw Error('No se pudo cargar '+input);return r.json();},
 markup(html){return html.replace(/\b(href|src)="(\/[^"<>]*)"/g,(_,attr,url)=>attr+'="'+this.url(url).replaceAll('&','&amp;')+'"');},
 text(text,values){return text.replace(/\{\{(\w+)\}\}/g,(_,key)=>values[key]??'');}
};
Site.ready=Promise.all([Site.load('config/site.json'),Site.load('data/index.json'),Site.load('content/home.json')]).then(([config,index,home])=>{Site.config=config;Site.resources={...index.resources};for(const d of index.datasets){Site.resources['data/'+d.id+'.json']=d.path;}Site.content.home=home;return Site;});
// Some legacy controls replace a small fragment without going through the main render.
// Normalize their links centrally as well; no change to labels, routing or calculations.
Site.ready.then(()=>{
 const normalize=node=>{if(node.nodeType!==1)return;for(const el of [node,...node.querySelectorAll('[href],[src]')])for(const attr of ['href','src']){const value=el.getAttribute(attr);if(value?.startsWith('/')&&!value.startsWith('//'))el.setAttribute(attr,Site.url(value));}};
 normalize(document.body);
 new MutationObserver(records=>{for(const record of records){if(record.type==='attributes')normalize(record.target);else for(const node of record.addedNodes)normalize(node);}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href','src']});
});
