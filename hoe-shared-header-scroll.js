// Load the common desktop-only visual layer on all existing public secondary pages.
(()=>{
 if(document.documentElement.dataset.hoeTheme!=='page')return;
 if(document.querySelector('link[data-hoe-desktop-theme]'))return;
 const link=document.createElement('link');
 link.rel='stylesheet';link.href='/hoe-desktop-theme.css?v=1';
 link.media='(min-width: 761px)';link.dataset.hoeDesktopTheme='true';
 document.head.appendChild(link);
})();

// Only page displacement moves the flag strip; the SVG's cloth flutter runs independently.
(()=>{
 const mobile=matchMedia('(max-width:760px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const header=document.querySelector('html[data-hoe-theme="page"] body > .hoe-shared-mobile-header');
 if(!header)return;
 let frame=0;
 function update(){
  frame=0;
  if(reduce.matches){header.style.removeProperty('--hoe-header-flag-scroll-x');return;}
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

// All public secondary pages use the same consent-based WhatsApp enquiry capture.
(()=>{if(!document.querySelector('script[src*="website-lead-form.js"]')){const s=document.createElement('script');s.src='/website-lead-form.js?v=2';document.head.appendChild(s)}})();
