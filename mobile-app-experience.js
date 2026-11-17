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
  const link=document.createElement('link');link.id='himalayan-bottom-navigation-css';link.rel='stylesheet';link.href='/himalayan-bottom-navigation.css?v=3';document.head.appendChild(link);
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
  {
   // Mobile and desktop share an independent body-level popup anchored above the bottom dock.
   const menuPopup=document.createElement('div');
   menuPopup.className='dock-menu-popup';
   menuPopup.setAttribute('role','menu');
   menuPopup.setAttribute('aria-label','Website menu');
   menuPopup.setAttribute('aria-hidden','true');
   menuPopup.innerHTML=
    '<a role="menuitem" href="/destinations/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20 9 4l6 16 6-16M5 15h14M7 9h10"/></svg><span>Destinations</span></a>'+
    '<a role="menuitem" href="/#cabs"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13l2-6h14l2 6v6h-2v-2H5v2H3zM5 13h14M7 16h.01M17 16h.01"/></svg><span>Cabs</span></a>'+
    '<a role="menuitem" href="/#gallery"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20V8l9-5 9 5v12M7 20v-7h10v7M9 9h.01M15 9h.01"/></svg><span>Hotels &amp; Properties</span></a>';
   Object.assign(menuPopup.style,{
    display:'none',position:'fixed',left:'50%',bottom:'calc(98px + env(safe-area-inset-bottom))',
    transform:'translateX(-50%)',width:'min(360px, calc(100vw - 24px))',
    maxHeight:'min(58vh, 460px)',overflowY:'auto',boxSizing:'border-box',
    flexDirection:'column',gap:'5px',padding:'10px',
    border:'1px solid rgba(255,255,255,.28)',borderRadius:'22px',
    background:'rgba(55,59,65,.97)',color:'#fff',
    boxShadow:'0 20px 48px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.16)',
    backdropFilter:'blur(28px) saturate(145%)',WebkitBackdropFilter:'blur(28px) saturate(145%)',
    zIndex:'1901'
   });
   menuPopup.querySelectorAll('a').forEach(a=>{
    Object.assign(a.style,{
     display:'flex',alignItems:'center',gap:'12px',minHeight:'46px',
     padding:'0 14px',boxSizing:'border-box',border:'1px solid transparent',
     borderRadius:'13px',background:'rgba(255,255,255,.055)',color:'#fff',
     textDecoration:'none',fontFamily:'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
     fontSize:'14px',fontWeight:'500'
    });
    const svg=a.querySelector('svg');
    Object.assign(svg.style,{width:'20px',height:'20px',flex:'0 0 20px',fill:'none',stroke:'#aeb7c2',strokeWidth:'1.7',strokeLinecap:'round',strokeLinejoin:'round'});
   });
   document.body.appendChild(menuPopup);
   const positionMenuPopup=()=>{
    const rect=nav.getBoundingClientRect();
    const bottom=Math.max(0,Math.ceil(window.innerHeight-rect.top+10));
    menuPopup.style.setProperty('bottom',bottom+'px','important');
    if(nav.classList.contains('mobile-app-dock')){
     // Keep the mobile popup centered above the dock.
     menuPopup.style.setProperty('left','50%','important');
     menuPopup.style.setProperty('right','auto','important');
     menuPopup.style.setProperty('transform','translateX(-50%)','important');
    }else{
     // Anchor desktop popup to the actual Menu button, not the centered dock container.
     const triggerRect=menuTrigger.getBoundingClientRect();
     const right=Math.max(8,Math.ceil(window.innerWidth-triggerRect.right));
     // A narrow desktop panel stays over the right-hand Menu area instead of
     // extending across the visual center of the centered navigation dock.
     menuPopup.style.setProperty('width','min(260px, calc(100vw - 24px))','important');
     menuPopup.style.setProperty('left','auto','important');
     menuPopup.style.setProperty('right',right+'px','important');
     menuPopup.style.setProperty('transform','none','important');
    }
   };
   const closeDockPopup=()=>{
    menuPopup.style.display='none';
    menuPopup.setAttribute('aria-hidden','true');
    menuTrigger.setAttribute('aria-expanded','false');
    menuTrigger.setAttribute('aria-label','Open navigation menu');
    menuTrigger.classList.remove('is-open');
    nav.classList.remove('menu-open');
   };
   menuTrigger.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    const opening=menuPopup.getAttribute('aria-hidden')!=='false';
    if(opening){
     positionMenuPopup();
     menuPopup.style.display='flex';
     menuPopup.setAttribute('aria-hidden','false');
     menuTrigger.setAttribute('aria-expanded','true');
     menuTrigger.setAttribute('aria-label','Close navigation menu');
     menuTrigger.classList.add('is-open');
     nav.classList.add('menu-open');
    }else closeDockPopup();
   });
   menuPopup.addEventListener('click',event=>{
    if(event.target.closest('a'))closeDockPopup();
   });
   document.addEventListener('click',event=>{
    if(menuPopup.getAttribute('aria-hidden')==='false'&&!menuPopup.contains(event.target)&&!menuTrigger.contains(event.target))closeDockPopup();
   });
   document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menuPopup.getAttribute('aria-hidden')==='false')closeDockPopup();
   });
   window.addEventListener('resize',()=>{
    if(menuPopup.getAttribute('aria-hidden')==='false')positionMenuPopup();
   },{passive:true});
   window.addEventListener('scroll',()=>{
    if(menuPopup.getAttribute('aria-hidden')==='false')positionMenuPopup();
   },{passive:true});
  }
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