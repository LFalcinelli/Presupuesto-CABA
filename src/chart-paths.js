'use strict';
// Shape-preserving Hermite interpolation. It passes through the observations,
// keeps gaps separate and never adds extrema between two adjacent points.
function monotonePath(points){
 if(!points.length)return '';
 if(points.length===1)return `M${points[0][0]},${points[0][1]}`;
 const slopes=points.slice(1).map((p,i)=>(p[1]-points[i][1])/(p[0]-points[i][0]));
 const tangents=points.map((p,i)=>i===0?slopes[0]:i===points.length-1?slopes.at(-1):(slopes[i-1]+slopes[i])/2);
 for(let i=0;i<slopes.length;i++){
  if(slopes[i]===0){tangents[i]=tangents[i+1]=0;continue;}
  let a=tangents[i]/slopes[i],b=tangents[i+1]/slopes[i];
  if(a<0)tangents[i]=0;if(b<0)tangents[i+1]=0;
  a=tangents[i]/slopes[i];b=tangents[i+1]/slopes[i];
  const length=Math.hypot(a,b);if(length>3){tangents[i]=3*a/length*slopes[i];tangents[i+1]=3*b/length*slopes[i];}
 }
 return `M${points[0].join(',')}`+points.slice(1).map((p,i)=>{const a=points[i],h=(p[0]-a[0])/3;return ` C${a[0]+h},${a[1]+h*tangents[i]} ${p[0]-h},${p[1]-h*tangents[i+1]} ${p.join(',')}`;}).join('');
}
