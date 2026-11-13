/* Arctic Prestige motion controller — native APIs only, with a no-JS-safe default. */
(()=>{"use strict";
 const root=document.documentElement;
 const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(reduce||!("IntersectionObserver"in window))return;
 const start=()=>{
  const targets=[...document.querySelectorAll(
   "main section .section-title,main section .intro,.local-intro-copy,.local-intro-panel,.journey-item,.destination-card,.group-departure-card,.package-slide,.itinerary-slide,.cab-card,.hotel-card,.instagram-content,.review-panel,.faq-list details"
  )];
  if(!targets.length)return;
  root.classList.add("arctic-motion-ready");
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add("arctic-in");
    observer.unobserve(entry.target);
   });
  },{threshold:.12,rootMargin:"0px 0px -28px 0px"});
  targets.forEach((el,index)=>{
   el.classList.add("arctic-reveal");
   if(el.matches(".destination-card,.group-departure-card,.package-slide,.itinerary-slide,.cab-card,.hotel-card"))el.style.setProperty("--arctic-delay",Math.min(index%4,3)*65+"ms");
   observer.observe(el);
  });
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();