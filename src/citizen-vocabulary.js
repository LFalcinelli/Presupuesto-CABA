'use strict';
// Citizen labels are presentation only. Official names remain in data and sources.
const citizenGlossary={
 deflator:{label:"Deflactor",official:"Índice que permite expresar los importes de distintos años con el mismo nivel de precios y descontar la inflación.",question:"inflacion"},
figurative:{"label":"Gastos figurativos","aliases":["figurativos","figurativas","gasto figurativo"],"official":"Transferencias entre entidades del propio sector público. Se excluyen de los totales para no contar dos veces el mismo dinero.","question":"clasificaciones"},
applications:{"label":"Aplicaciones financieras","official":"Pagos de capital de deuda y otras operaciones financieras; se muestran separados de los gastos corrientes y de capital.","question":"saldo"},
ipc:{"label":"IPCBA","official":"Índice de Precios al Consumidor de la Ciudad. Permite comparar importes descontando la inflación.","question":"inflacion"},
rem:{"label":"REM","official":"Relevamiento de Expectativas de Mercado del Banco Central. Reúne pronósticos sobre precios y actividad; no son datos observados.","question":"inflacion"},
object:{"label":"Qué se paga","aliases":["Inciso","incisos"],"official":"Una agrupación según qué se paga: personal, insumos, servicios, obras y equipamiento, entre otros.","question":"clasificaciones"},
unit:{"label":"Oficina","aliases":["Oficinas","Unidad ejecutora","unidades ejecutoras"],"official":"Unidad ejecutora: dependencia responsable de administrar programas y su presupuesto.","question":"clasificaciones"},
linked:{"label":"Empalme","aliases":["empalmado","empalmada","empalmados","empalmadas"],"official":"Unión de series estadísticas de distintas bases o fuentes, usando los períodos en que se superponen.","question":"inflacion"},
dnap:{"label":"DNAP","official":"Dirección Nacional de Asuntos Provinciales: organismo nacional que reúne información fiscal de las provincias.","question":"clasificaciones"},
 pbg:{label:"PBG",official:"Producto Bruto Geográfico: el valor que produce la economía de la Ciudad durante un año. A precios básicos, excluye los impuestos sobre los productos y suma las subvenciones.",question:"clasificaciones"},
 voted:{label:'Presupuesto votado',official:'Sanción / presupuesto inicial',question:'etapas'},
 expanded:{label:'Presupuesto ampliado',official:'Crédito vigente: incluye ampliaciones y demás modificaciones al corte',question:'etapas'},
 executed:{label:'Gasto ejecutado',official:'Gasto devengado: obligación de pago reconocida',question:'ejecutado'},
 personnel:{label:'Sueldos del personal',official:'Personal · inciso 1; incluye remuneraciones y contribuciones',question:'funcionamiento'},
 supplies:{label:'Insumos',official:'Bienes de consumo · inciso 2',question:'funcionamiento'},
 services:{label:'Servicios contratados',official:'Servicios no personales · inciso 3. Luz, agua y gas; limpieza y mantenimiento; recolección; alquileres; consultorías; publicidad y otros servicios que el Estado contrata a terceros.',question:'servicios'},
 equipment:{label:'Obras y equipamiento',official:'Bienes de uso · inciso 4',question:'funcionamiento'},
 transfers:{label:'Transferencias',official:'Transferencias · inciso 5',question:'transferencias'},
 operation:{label:'Gasto corriente (sin intereses)',official:'Incluye sueldos, insumos, servicios contratados y transferencias corrientes; excluye inversión e intereses de la deuda',question:'funcionamiento'},
 investment:{label:'Inversión',official:'Gastos de capital',question:'funcionamiento'},
 federal:{label:'Coparticipación federal',official:'Tributos de jurisdicción nacional',question:'coparticipacion'},
 property:{label:'Intereses y rentas cobrados',official:'Rentas de la propiedad',question:'rentas'}
};
const citizenVocabularyRules=[
 [/tributos de jurisdicción nacional/gi,'coparticipación federal'],
 [/\bunidades ejecutoras\b/gi,'oficinas'],[/\bunidad ejecutora\b/gi,'oficina'],
 [/\bjurisdicciones\b/gi,'áreas de gobierno'],[/\bjurisdicción\b/gi,'área de gobierno'],
 [/presupuesto por finalidad y función/gi,'destinos del presupuesto'],[/por finalidad y función/gi,'según para qué se gasta'],[/\bfinalidad y función\b/gi,'para qué se gasta'],[/^incisos?$/gi,'qué se paga'],[/\bpor incisos?\b/gi,'según qué se paga'],
 [/\bincisos? (?=\d)/gi,'tipo de gasto '],[/\baperturas\b/gi,'detalles'],[/\bapertura\b/gi,'detalle'],
 [/\bhomologados\b/gi,'comparados'],[/\bhomologado\b/gi,'comparado'],[/\bhomologadas\b/gi,'comparadas'],[/\bhomologada\b/gi,'comparada'],
 [/pesos nominales(?: de cada (?:año|período))?/gi,'pesos de cada año, sin ajustar por inflación'],[/\bnominales?\b/gi,'sin ajustar por inflación'],
 [/^funcionamiento$/gi,'sueldos, insumos y servicios'],

 [/Deuda p[uú]blica\s*[-·:]\s*intereses y (?:otros )?gastos|Deuda: intereses y gastos|Intereses y (?:otros )?(?:costos|gastos) de la deuda/gi,'Intereses y otros gastos de la deuda'],
 [/^Servicio de la deuda$/i,'Intereses y otros gastos de la deuda'],
 [/presupuesto (?:inicial|aprobado|sancionado)/gi,'presupuesto votado'],
 [/presupuesto (?:actualizado|vigente)/gi,'presupuesto ampliado'],
 [/crédito inicial/gi,'presupuesto votado'],[/\bactualizado(?=\s*(?:[·;]|$))/gi,'ampliado'],
 [/crédito vigente/gi,'presupuesto ampliado'],[/\bsancionado\b/gi,'votado'],[/\bsanción\b(?! de leyes)/gi,'presupuesto votado'],
 [/gastos? devengados?/gi,'gasto ejecutado'],[/gastos? habituales(?:,? sin intereses)?/gi,'gasto corriente (sin intereses)'],
 [/gastos? corrientes? sin intereses/gi,'gasto corriente (sin intereses)'],[/gastos? de capital/gi,'inversión'],
 [/servicios no personales/gi,'servicios contratados'],[/bienes de consumo/gi,'insumos'],[/bienes de uso/gi,'obras y equipamiento'],
 [/gastos en personal/gi,'sueldos del personal'],[/tributos de jurisdicción nacional/gi,'coparticipación federal'],[/rentas de la propiedad/gi,'intereses y rentas cobrados'],
 [/\bvigente\b/gi,'ampliado'],[/\bvigentes\b/gi,'ampliados'],[/\bactualizado(?= (?:a junio|al (?:30|31)))/gi,'ampliado'],
 [/Qué destinos ganan o pierden frente a la inflación/g,'Qué destinos suben o bajan, descontando la inflación']
];
function fiscalDebtLabel(name){return /^(?:servicio de la deuda|deuda p[uú]blica\s*[-·:]\s*intereses y (?:otros )?gastos|deuda: intereses y gastos|intereses y (?:otros )?(?:gastos|costos) de la deuda)$/i.test(name.trim())?'Intereses y otros gastos de la deuda':name;}
function citizenVocabularyText(text){
 let result=text;
 for(const [pattern,value] of citizenVocabularyRules)result=result.replace(pattern,match=>/^[A-ZÁÉÍÓÚ]/.test(match)?value[0].toUpperCase()+value.slice(1):value);
 return result.replace(/^(Personal|Gastos de personal)$/i,'Sueldos del personal').replace(/^Actualizado$/i,'Ampliado').replace(/^Inicial$/i,'Votado').replace(/^Aprobado inicialmente$/i,'Presupuesto votado');
}
function citizenGlossaryMarkup(fragment){
 const terms=typeof readingTerms==='undefined'?citizenGlossary:readingTerms,seen=new Set([...fragment.querySelectorAll('[data-term]')].map(n=>n.dataset.term));
 const patterns=Object.entries(terms).map(([id,g])=>({id,g,regex:new RegExp('(?<![A-Za-zÁÉÍÓÚÜÑáéíóúüñ])('+[g.label,...(g.aliases||[])].map(s=>s.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length).join('|')+')(?![A-Za-zÁÉÍÓÚÜÑáéíóúüñ])','iu')}));
 const walker=document.createTreeWalker(fragment,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){if(!node.parentNode||node.parentElement?.closest('script,style,svg,a,button,select,option,[data-term-popup]'))continue;
  let text=node.nodeValue;if(!node.parentElement?.closest('.method-section,.gov-source-details,.exact-values,.fiscal-account-detail,#home-highlight-title,[data-highlight-card="1"] h2,[data-highlight-card="1"] .highlight-row-copy>span'))text=citizenVocabularyText(text);text=text.replace(/\bCAIF\b/g,'Cuenta de ingresos, gastos y financiamiento');
  if(node.parentElement?.closest('h1')){if(text!==node.nodeValue)node.nodeValue=text;continue;}
  const matches=patterns.filter(p=>!seen.has(p.id)).map(p=>({...p,match:p.regex.exec(text)})).filter(p=>p.match).sort((a,b)=>a.match.index-b.match.index||b.match[0].length-a.match[0].length);
  if(!matches.length){if(text!==node.nodeValue)node.nodeValue=text;continue;}
  const out=document.createDocumentFragment();let end=0;
  for(const {id,match} of matches){if(match.index<end)continue;out.append(document.createTextNode(text.slice(end,match.index)));const button=document.createElement('button');button.type='button';button.className='glossary-term';button.dataset.term=id;button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');button.textContent=match[0];out.append(button);seen.add(id);end=match.index+match[0].length;}
  out.append(document.createTextNode(text.slice(end)));node.replaceWith(out);
 }
 return fragment;
}

// Expand only the first occurrence in a reading. Leave chart labels and native controls compact.
const citizenAcronyms={SBASE:'Subterráneos de Buenos Aires',IVC:'Instituto de la Vivienda',FACOEP:'Facturación y Cobranza de Efectores Públicos',BID:'Banco Interamericano de Desarrollo',CeSAC:'Centro de Salud y Acción Comunitaria',SAME:'Sistema de Atención Médica de Emergencias',PBG:'producto bruto de la Ciudad',REM:'Relevamiento de Expectativas de Mercado',IPCBA:'Índice de Precios al Consumidor de la Ciudad'};
function expandCitizenAcronyms(root){
 const seen=new Set(),walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){if(node.parentElement?.closest('script,style,svg,select,option,input,[data-term-popup],.gov-source-details,.exact-values'))continue;
  let text=node.nodeValue;
  for(const [abbr,full] of Object.entries(citizenAcronyms)){
   if(seen.has(abbr))continue;const re=new RegExp('\\b'+abbr+'s?\\b','i'),match=re.exec(text);if(!match)continue;
   const preceding=node.previousSibling?.textContent||node.parentElement?.previousSibling?.textContent||'';
   if(text.slice(0,match.index).trimEnd().endsWith('(')||text.toLowerCase().includes(full.toLowerCase())||preceding.trimEnd().endsWith('(')&&preceding.toLowerCase().includes(full.toLowerCase())){seen.add(abbr);continue;}
   const plural=abbr==='CeSAC'&&match[0].toLowerCase().endsWith('s'),expanded=plural?'Centros de Salud y Acción Comunitaria':full;
   text=text.slice(0,match.index)+expanded+' ('+abbr+(plural?'s':'')+')'+text.slice(match.index+match[0].length);seen.add(abbr);
  }
  if(text!==node.nodeValue)node.nodeValue=text;
 }
}
