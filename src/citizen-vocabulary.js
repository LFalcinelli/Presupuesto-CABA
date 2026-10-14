'use strict';
// Citizen labels are presentation only. Official names remain in data and sources.
const citizenGlossary={
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
 [/Deuda p[uú]blica\s*[-·:]\s*intereses y (?:otros )?gastos|Deuda: intereses y gastos|Intereses y (?:otros )?(?:costos|gastos) de la deuda/gi,'Intereses y otros gastos de la deuda'],
 [/^Servicio de la deuda$/i,'Intereses y otros gastos de la deuda'],
 [/presupuesto (?:inicial|aprobado|sancionado)/gi,'presupuesto votado'],
 [/presupuesto (?:actualizado|vigente)/gi,'presupuesto ampliado'],
 [/crédito inicial/gi,'presupuesto votado'],[/\bactualizado(?=\s*(?:[·;]|$))/gi,'ampliado'],
 [/crédito vigente/gi,'presupuesto ampliado'],[/\bsancionado\b/gi,'votado'],[/\bsanción\b/gi,'presupuesto votado'],
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
 const walker=document.createTreeWalker(fragment,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){if(node.parentElement?.closest('script,style,.method-section,.gov-source-details,.exact-values,.fiscal-account-detail'))continue;node.nodeValue=citizenVocabularyText(node.nodeValue);}
 // Native accessible tooltips on the first reading, with a stable link to its explanation.
 for(const entry of Object.values(citizenGlossary)){
  const node=nodes.find(n=>n.parentElement&&!n.parentElement.closest('a,button,select,option,summary,svg,details,h1,h2,h3,.method-section,.gov-source-details')&&n.nodeValue.toLowerCase().includes(entry.label.toLowerCase()));
  if(!node||!node.parentNode)continue;
  const start=node.nodeValue.toLowerCase().indexOf(entry.label.toLowerCase()),text=node.nodeValue;
  const link=document.createElement('a');link.className='glossary-term';link.href='#presupuesto-explicado?tema='+entry.question;link.dataset.glossary=entry.question;link.title=entry.official;link.textContent=text.slice(start,start+entry.label.length);
  node.replaceWith(document.createTextNode(text.slice(0,start)),link,document.createTextNode(text.slice(start+entry.label.length)));
 }
 return fragment;
}
