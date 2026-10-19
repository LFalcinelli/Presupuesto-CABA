'use strict';
// Static editorial text and accessible chart descriptions follow the same rule
// as computed labels. Layout percentages and dataset precision stay untouched.

Site.markupPasses.push(function percentagePresentationPass(t,view){

 const walker=document.createTreeWalker(t.content,NodeFilter.SHOW_TEXT);
 while(walker.nextNode())walker.currentNode.nodeValue=formatPercentText(walker.currentNode.nodeValue);
 for(const node of t.content.querySelectorAll('[aria-label],[title],[data-viz-tip]'))for(const attr of ['aria-label','title','data-viz-tip']){
  if(node.hasAttribute(attr))node.setAttribute(attr,formatPercentText(node.getAttribute(attr)));
 }

});
