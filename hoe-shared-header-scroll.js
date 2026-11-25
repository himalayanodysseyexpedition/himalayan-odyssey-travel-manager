
// Only page displacement moves the flag strip; the SVG's cloth flutter runs independently.
(()=>{
 const mobile=matchMedia('(max-width:760px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const header=document.querySelector('html[data-hoe-theme="page"] body > .hoe-shared-mobile-header');
 if(!header)return;
 let frame=0;
 function update(){
  frame=0;
  if(!mobile.matches||reduce.matches){header.style.removeProperty('--hoe-header-flag-scroll-x');return;}
  const root=document.scrollingElement||document.documentElement;
  const y=Math.max(0,Math.min(window.scrollY,Math.max(0,root.scrollHeight-root.clientHeight)));
  const period=header.clientWidth/2;
  const x=period>0?-((y*.55)%period):0;
  header.style.setProperty('--hoe-header-flag-scroll-x',x.toFixed(2)+'px');
 }
 function queue(){if(!frame)frame=requestAnimationFrame(update);}
 window.addEventListener('scroll',queue,{passive:true});
 window.addEventListener('resize',queue,{passive:true});
 window.addEventListener('pageshow',queue);
 mobile.addEventListener('change',queue);
 reduce.addEventListener('change',queue);
 queue();
})();
