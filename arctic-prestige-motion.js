/* Arctic Prestige motion controller — shared public-page motion, including async cards. */
(()=>{"use strict";
 const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(reduce||!("IntersectionObserver"in window))return;
 const selector=[
  "section .section-title","section .intro",".local-intro-copy",".local-intro-panel",
  ".journey-item",".destination-card",".group-departure-card",".package-slide",
  ".itinerary-slide",".cab-card",".hotel-card",".guide-card",".card",
  ".info-box",".review-panel",".review-point",".instagram-content",
  ".faq-list details",".htp-step",".page-heading",".service-card"
 ].join(",");
 const observed=new WeakSet();
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   entry.target.classList.add("arctic-in");
   observer.unobserve(entry.target);
  });
 },{threshold:.1,rootMargin:"0px 0px -24px 0px"});
 const reveal=scope=>{
  if(!scope||scope.nodeType!==1&&scope!==document)return;
  const nodes=[];
  if(scope.matches&&scope.matches(selector))nodes.push(scope);
  if(scope.querySelectorAll)nodes.push(...scope.querySelectorAll(selector));
  nodes.forEach((el,index)=>{
   if(observed.has(el))return;
   observed.add(el);
   el.classList.add("arctic-reveal");
   if(el.matches(".destination-card,.group-departure-card,.package-slide,.itinerary-slide,.cab-card,.hotel-card,.guide-card,.card"))
    el.style.setProperty("--arctic-delay",Math.min(index%4,3)*55+"ms");
   observer.observe(el);
  });
 };
 const start=()=>{
  reveal(document);
  const mutation=new MutationObserver(records=>{
   records.forEach(record=>record.addedNodes.forEach(node=>reveal(node)));
  });
  mutation.observe(document.body,{childList:true,subtree:true});
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();