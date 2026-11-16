/* Shared premium bottom navigation for mobile and desktop. */
(()=>{'use strict';
 const mobile=()=>window.matchMedia('(max-width:760px)').matches;
 const whatsapp='https://wa.me/919816929669?text='+encodeURIComponent('Hello Himalayan Odyssey Expedition, I would like to plan a Himalayan trip.');
 const icon=(body)=>'<svg class="dock-icon" viewBox="0 0 24 24" aria-hidden="true">'+body+'</svg>';
 const items=[
  {label:'Home',href:'/#home-promo',path:'home',svg:'<path class="icon-side" d="M3.5 10.3 12 3.5l8.5 6.8v9.2a1 1 0 0 1-1 1h-5.1v-6.4H9.6v6.4H4.5a1 1 0 0 1-1-1z"/><path d="M2.5 10.2 12 2.6l9.5 7.6M9.6 20.5v-6.4h4.8v6.4"/> <path class="icon-detail" d="M12 4.2v1.9M5.3 11.1v7.3"/>'},
  {label:'Explore',href:'/#packages',path:'explore',svg:'<circle cx="12" cy="12" r="9"/><path class="icon-side" d="m15.9 8.1-2.6 5.2-5.2 2.6 2.6-5.2z"/><path d="m15.9 8.1-2.6 5.2-5.2 2.6 2.6-5.2zM12 3v1.2M21 12h-1.2M12 21v-1.2M3 12h1.2"/>'},
  {label:'WhatsApp',href:whatsapp,path:'whatsapp',svg:'<path d="M20.3 11.6a8.2 8.2 0 0 1-12.1 7.2L3.1 20l1.2-4.8a8.2 8.2 0 1 1 16-3.6Z"/><path class="icon-side" d="M8.4 8.3c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .7.5.8 1.2 1.5 2 2 .3.2.5.2.7 0l.7-.8c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.7 1.6-.5.5-1.2.7-1.9.6-1.1-.2-2.4-.8-3.8-2-1.2-1.1-2.1-2.4-2.4-3.4-.3-1 0-1.9.7-2.6Z"/>'}
 ];
 function loadStyles(){
  if(document.getElementById('himalayan-bottom-navigation-css'))return;
  const link=document.createElement('link');link.id='himalayan-bottom-navigation-css';link.rel='stylesheet';link.href='/himalayan-bottom-navigation.css?v=1';document.head.appendChild(link);
 }
 function removeLegacy(){
  document.querySelectorAll('#footerContactBar,.footer-contact-bar,nav.quick-nav-bar,nav.quick-nav').forEach(el=>el.remove());
 }
 function syncMenuState(nav){
  const trigger=nav&&nav.querySelector('.dock-menu-trigger');
  const headerToggle=document.querySelector('header .header-menu-toggle');
  if(!trigger||!headerToggle)return;
  const opened=headerToggle.getAttribute('aria-expanded')==='true';
  trigger.setAttribute('aria-expanded',String(opened));
  trigger.setAttribute('aria-label',opened?'Close navigation menu':'Open navigation menu');
  trigger.classList.toggle('is-open',opened);
  nav.classList.toggle('menu-open',opened);
 }
 function mountDock(){
  removeLegacy();
  const expected=mobile()?'mobile-app-dock':'desktop-app-dock';
  document.querySelectorAll('.mobile-app-dock,.desktop-app-dock').forEach(existing=>{
   if(existing.classList.contains(expected))existing.remove();
   else existing.remove();
  });
  const nav=document.createElement('nav');
  nav.className=expected;
  nav.setAttribute('aria-label','Bottom navigation');
  nav.innerHTML=items.map(x=>'<a href="'+x.href+'" data-dock="'+x.path+'" aria-label="'+x.label+'">'+icon(x.svg)+'<span>'+x.label+'</span></a>').join('')+
   '<button type="button" class="dock-menu-trigger" data-dock-menu aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobileMainNavigation">'+
   icon('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect class="icon-side" x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect class="icon-side" x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>')+
   '<span>Menu</span></button>';
  document.body.appendChild(nav);
  const menuTrigger=nav.querySelector('.dock-menu-trigger');
  menuTrigger.addEventListener('click',event=>{
   event.preventDefault();event.stopPropagation();
   const headerToggle=document.querySelector('header .header-menu-toggle');
   if(!headerToggle)return;
   headerToggle.dataset.openedFromDock='true';
   headerToggle.click();
   syncMenuState(nav);
  });
  const targets=['home-promo','home','packages','upcoming-packages'].map(id=>document.getElementById(id)).filter(Boolean);
  if('IntersectionObserver'in window&&targets.length){
   const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    nav.querySelectorAll('a[data-dock]').forEach(a=>a.removeAttribute('aria-current'));
    const key=['home-promo','home'].includes(visible.target.id)?'home':visible.target.id==='packages'||visible.target.id==='upcoming-packages'?'explore':null;
    if(key){const active=nav.querySelector('[data-dock="'+key+'"]');if(active)active.setAttribute('aria-current','page')}
   },{rootMargin:'-35% 0px -55% 0px',threshold:[0,.2,.5]});
   targets.forEach(t=>observer.observe(t));
  }
  let last=window.scrollY,raf=false;
  window.addEventListener('scroll',()=>{
   if(raf)return;raf=true;
   requestAnimationFrame(()=>{
    const y=window.scrollY;
    nav.classList.toggle('is-hidden',y>last+8&&y>220);
    if(y<100||y<last-10)nav.classList.remove('is-hidden');
    last=y;raf=false;
   });
  },{passive:true});
  document.addEventListener('click',()=>requestAnimationFrame(()=>syncMenuState(nav)));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')requestAnimationFrame(()=>syncMenuState(nav))});
  syncMenuState(nav);
 }
 function reveal(){
  if(!mobile()||!('IntersectionObserver'in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const candidates=document.querySelectorAll('.section-title,.intro,.group-departures-rail,.packages-carousel,.destination-grid,.cta,.review-panel');
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('app-reveal','is-visible');io.unobserve(e.target)}}),{threshold:.08});
  candidates.forEach(el=>{if(!el.classList.contains('app-reveal')){el.classList.add('app-reveal');io.observe(el)}});
 }
 function registerPwa(){if('serviceWorker'in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}),{once:true})}}
 function init(){loadStyles();removeLegacy();mountDock();reveal();registerPwa()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('resize',()=>{
  const existing=document.querySelector('.mobile-app-dock,.desktop-app-dock');
  const expected=mobile()?'mobile-app-dock':'desktop-app-dock';
  if(!existing||!existing.classList.contains(expected)){existing?.remove();mountDock()}
 },{passive:true});
})();