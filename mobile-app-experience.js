/* Progressive mobile app shell. Existing site routes and enquiry handlers remain authoritative. */
(()=>{'use strict';
 const mobile=()=>window.matchMedia('(max-width:760px)').matches;
 const icon=(body)=>'<svg class="dock-icon" viewBox="0 0 24 24" aria-hidden="true">'+body+'</svg>';
 const items=[
  {label:'Home',href:'/#home',path:'home',svg:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'},
  {label:'Explore',href:'/#packages',path:'packages',svg:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5M10.8 7.5v6.6M7.5 10.8h6.6"/>'},
  {label:'Plan trip',href:'/build-your-trip/',path:'plan',cls:'dock-plan',svg:'<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/>'},
  {label:'WhatsApp',href:'https://wa.me/919816929669?text='+encodeURIComponent('Hello Himalayan Odyssey Expedition, I would like to plan a Himalayan trip.'),path:'whatsapp',svg:'<path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3 20l1.2-4.8a8.2 8.2 0 1 1 16-3.5Z"/><path d="M8.5 8.2c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .7.5.8 1.2 1.5 2 2 .3.2.5.2.7 0l.7-.8c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.7 1.6-.5.5-1.2.7-1.9.6-1.1-.2-2.4-.8-3.8-2-1.2-1.1-2.1-2.4-2.4-3.4-.3-1 0-1.9.7-2.6Z"/>'}
 ];
 function mountDock(){
  if(!mobile()||document.querySelector('.mobile-app-dock'))return;
  const nav=document.createElement('nav');nav.className='mobile-app-dock';nav.setAttribute('aria-label','Quick travel navigation');
  const onBuilder=location.pathname.startsWith('/build-your-trip');
  const navItems=items.map(x=>x.path==='plan'&&onBuilder?{...x,label:'Enquire',href:'#guestForm'}:x);
  nav.innerHTML=navItems.map(x=>'<a '+(x.cls?'class="'+x.cls+'" ':'')+'href="'+x.href+'" data-dock="'+x.path+'">'+icon(x.svg)+'<span>'+x.label+'</span></a>').join('');
  document.body.appendChild(nav);
  if(onBuilder){const plan=nav.querySelector('[data-dock="plan"]');if(plan)plan.setAttribute('aria-current','page');}
  const anchors=[...document.querySelectorAll('a[href^="#"],a[href^="/#"]')];
  const targets=['home','packages','upcoming-packages','itineraries','contact'].map(id=>document.getElementById(id)).filter(Boolean);
  if('IntersectionObserver'in window&&targets.length){
   const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;nav.querySelectorAll('a').forEach(a=>a.removeAttribute('aria-current'));const key=visible.target.id==='home'?'home':visible.target.id==='packages'||visible.target.id==='upcoming-packages'?'packages':null;if(key){const active=nav.querySelector('[data-dock="'+key+'"]');if(active)active.setAttribute('aria-current','page')}},{rootMargin:'-35% 0px -55% 0px',threshold:[0,.2,.5]});
   targets.forEach(t=>observer.observe(t));
  }
  let last=window.scrollY,raf=false;
  window.addEventListener('scroll',()=>{if(raf)return;raf=true;requestAnimationFrame(()=>{const y=window.scrollY;nav.classList.toggle('is-hidden',y>last+8&&y>220);if(y<100||y<last-10)nav.classList.remove('is-hidden');last=y;raf=false})},{passive:true});
 }
 function reveal(){
  if(!mobile()||!('IntersectionObserver'in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const candidates=document.querySelectorAll('.section-title,.intro,.group-departures-rail,.packages-carousel,.destination-grid,.cta,.review-panel');
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('app-reveal','is-visible');io.unobserve(e.target)}}),{threshold:.08});
  candidates.forEach(el=>{if(!el.classList.contains('app-reveal')){el.classList.add('app-reveal');io.observe(el)}});
 }
 function registerPwa(){if('serviceWorker'in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}),{once:true})}}
 function init(){mountDock();reveal();registerPwa()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('resize',()=>{if(!mobile()){document.querySelector('.mobile-app-dock')?.remove()}else mountDock()},{passive:true});
})();
