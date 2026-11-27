/* Shared premium bottom navigation for mobile and desktop. */
(()=>{'use strict';
 const mobile=()=>window.matchMedia('(max-width:760px)').matches;
 const whatsapp='https://wa.me/919816929669?text='+encodeURIComponent('Hello Himalayan Odyssey Expedition, I would like to plan a Himalayan trip.');
 const icon=(body)=>'<svg class="dock-icon" viewBox="0 0 24 24" aria-hidden="true">'+body+'</svg>';
 const items=[
  {label:'Home',href:'/',path:'home',svg:'<path class="icon-side" d="M3.5 10.3 12 3.5l8.5 6.8v9.2a1 1 0 0 1-1 1h-5.1v-6.4H9.6v6.4H4.5a1 1 0 0 1-1-1z"/><path d="M2.5 10.2 12 2.6l9.5 7.6M9.6 20.5v-6.4h4.8v6.4"/> <path class="icon-detail" d="M12 4.2v1.9M5.3 11.1v7.3"/>'},
  {label:'Explore',href:'/#packages',path:'explore',svg:'<circle cx="12" cy="12" r="9"/><path class="icon-side" d="m15.9 8.1-2.6 5.2-5.2 2.6 2.6-5.2z"/><path d="m15.9 8.1-2.6 5.2-5.2 2.6 2.6-5.2zM12 3v1.2M21 12h-1.2M12 21v-1.2M3 12h1.2"/>'},
  {label:'WhatsApp',href:whatsapp,path:'whatsapp',target:'_blank',svg:'<path d="M20.3 11.6a8.2 8.2 0 0 1-12.1 7.2L3.1 20l1.2-4.8a8.2 8.2 0 1 1 16-3.6Z"/><path class="icon-side" d="M8.4 8.3c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .7.5.8 1.2 1.5 2 2 .3.2.5.2.7 0l.7-.8c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.7 1.6-.5.5-1.2.7-1.9.6-1.1-.2-2.4-.8-3.8-2-1.2-1.1-2.1-2.4-2.4-3.4-.3-1 0-1.9.7-2.6Z"/>'}
 ];
 function loadStyles(){
  if(document.getElementById('himalayan-bottom-navigation-css'))return;
  const link=document.createElement('link');link.id='himalayan-bottom-navigation-css';link.rel='stylesheet';link.href='/himalayan-bottom-navigation-blue-glass.css?v=4';document.head.appendChild(link);
 }
 function removeLegacy(){
  document.querySelectorAll('#footerContactBar,.footer-contact-bar,nav.quick-nav-bar,nav.quick-nav').forEach(el=>el.remove());
 }
 function syncMenuState(nav){
  const trigger=nav&&nav.querySelector('.dock-menu-trigger');
  if(!trigger)return;
  if(mobile())return; // The mobile dock popup owns its own expanded state.
  const headerToggle=document.querySelector('header .header-menu-toggle');
  if(!headerToggle)return;
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
  nav.innerHTML=items.map(x=>'<a href="'+x.href+'"'+(x.target?' target="'+x.target+'" rel="noopener noreferrer"':'')+' data-dock="'+x.path+'" aria-label="'+x.label+'">'+icon(x.svg)+'<span>'+x.label+'</span></a>').join('')+
   '<button type="button" class="dock-menu-trigger" data-dock-menu aria-label="Open navigation menu" aria-expanded="false" aria-controls="dockMenuPopup">'+
   icon(mobile()&&document.documentElement.dataset.hoeTheme!=='home'?'<path d="M12 4v16M4 12h16"/>':'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect class="icon-side" x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect class="icon-side" x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>')+
   '<span>Menu</span></button>';
  document.body.appendChild(nav);
  // iOS Safari can move the fixed-position containing viewport when its toolbar
  // expands/collapses. Anchor the dock to the actual visible viewport instead.
  if(nav.classList.contains('mobile-app-dock')&&document.documentElement.dataset.hoeTheme==='home'){
   const viewport=window.visualViewport;
   let frame=0,previousBottom=-1,previousHeight=-1;
   const updateDockViewport=()=>{
    frame=0;
    if(!nav.isConnected)return;
    const bottom=viewport&&viewport.height>0?viewport.offsetTop+viewport.height:window.innerHeight;
    const height=nav.offsetHeight;
    if(!Number.isFinite(bottom)||bottom<=0||height<=0)return;
    if(bottom!==previousBottom||height!==previousHeight){
     nav.style.setProperty('--hoe-dock-viewport-bottom',bottom+'px');
     nav.style.setProperty('--hoe-dock-measured-height',height+'px');
     previousBottom=bottom;previousHeight=height;
    }
   };
   const queueDockViewport=()=>{
    if(nav.isConnected&&!frame)frame=requestAnimationFrame(updateDockViewport);
   };
   window.addEventListener('scroll',queueDockViewport,{passive:true});
   window.addEventListener('resize',queueDockViewport,{passive:true});
   window.addEventListener('pageshow',queueDockViewport);
   viewport?.addEventListener('resize',queueDockViewport,{passive:true});
   viewport?.addEventListener('scroll',queueDockViewport,{passive:true});
   if('ResizeObserver' in window){
    const observer=new ResizeObserver(()=>{if(nav.isConnected)queueDockViewport();else observer.disconnect()});
    observer.observe(nav);
   }
   queueDockViewport();
  }
  const menuTrigger=nav.querySelector('.dock-menu-trigger');
  {
   // The dock popup is independent of the hidden header menu on mobile.
   const menuPopup=document.createElement('div');
   menuPopup.id='dockMenuPopup';
   menuPopup.className='dock-menu-popup '+(mobile()?'dock-fab-popup':'dock-panel-popup');
   menuPopup.setAttribute('role','menu');
   menuPopup.setAttribute('aria-label','Website menu');
   menuPopup.setAttribute('aria-hidden','true');
   menuPopup.innerHTML=
    '<a role="menuitem" href="/destinations/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20 9 4l6 16 6-16M5 15h14M7 9h10"/></svg><span>Destinations</span></a>'+
    '<a role="menuitem" href="/#cabs"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13l2-6h14l2 6v6h-2v-2H5v2H3zM5 13h14M7 16h.01M17 16h.01"/></svg><span>Cabs</span></a>'+
    '<a role="menuitem" href="/packages/#packageList"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h16v13H4zM8 7.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2.5M4 12h16M9 12v2h6v-2"/></svg><span>Travel Packages</span></a>';
   Object.assign(menuPopup.style,{
    display:'none',position:'fixed',left:'50%',bottom:'calc(98px + env(safe-area-inset-bottom))',
    transform:'translateX(-50%)',width:'min(360px, calc(100vw - 24px))',
    maxHeight:'none',overflow:'visible',boxSizing:'border-box',
    flexDirection:'column',alignItems:'flex-end',gap:'10px',padding:'0',
    border:'0',borderRadius:'0',background:'transparent',color:'#fff',
    boxShadow:'none',backdropFilter:'none',WebkitBackdropFilter:'none',
    zIndex:'2147483001'
   });
   if(!mobile())Object.assign(menuPopup.style,{width:'min(360px, calc(100vw - 24px))',maxHeight:'min(58vh, 460px)',overflowY:'auto',flexDirection:'column',alignItems:'stretch',gap:'5px',padding:'10px',border:'1px solid rgba(255,255,255,.28)',borderRadius:'22px',background:'rgba(55,59,65,.97)',boxShadow:'0 20px 48px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.16)',backdropFilter:'blur(28px) saturate(145%)',WebkitBackdropFilter:'blur(28px) saturate(145%)'});
   menuPopup.querySelectorAll('a').forEach(a=>{
    Object.assign(a.style,{
     display:'flex',position:'relative',alignItems:'center',justifyContent:'center',
     width:'54px',height:'54px',minHeight:'54px',padding:'0',boxSizing:'border-box',
     border:'1px solid rgba(255,255,255,.34)',borderRadius:'50%',
     background:'linear-gradient(145deg,rgba(104,110,118,.98),rgba(39,43,49,.98))',color:'#fff',
     textDecoration:'none',fontFamily:'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
     fontSize:'11px',fontWeight:'600',boxShadow:'0 8px 22px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.32)'
    });
    const svg=a.querySelector('svg');
    Object.assign(svg.style,{width:'23px',height:'23px',flex:'0 0 23px',fill:'none',stroke:'#fff',strokeWidth:'1.7',strokeLinecap:'round',strokeLinejoin:'round'});
    const label=a.querySelector('span');
    Object.assign(label.style,{position:'absolute',right:'64px',top:'50%',transform:'translateY(-50%)',padding:'7px 11px',border:'1px solid rgba(255,255,255,.20)',borderRadius:'999px',background:'rgba(38,42,48,.94)',color:'#fff',whiteSpace:'nowrap',fontSize:'11px',fontWeight:'600',letterSpacing:'.02em',boxShadow:'0 5px 14px rgba(0,0,0,.24)',pointerEvents:'none'});
    if(!mobile()){
     Object.assign(a.style,{position:'static',width:'auto',height:'auto',minHeight:'46px',justifyContent:'flex-start',gap:'12px',padding:'0 14px',border:'1px solid transparent',borderRadius:'13px',background:'rgba(255,255,255,.055)',boxShadow:'none'});
     Object.assign(svg.style,{width:'20px',height:'20px',flex:'0 0 20px',stroke:'#aeb7c2'});
     Object.assign(label.style,{position:'static',right:'auto',top:'auto',transform:'none',padding:'0',border:'0',borderRadius:'0',background:'transparent',fontSize:'14px',boxShadow:'none'});
    }
   });
   document.body.appendChild(menuPopup);
   const positionMenuPopup=()=>{
    const rect=nav.getBoundingClientRect();
    const bottom=Math.max(0,Math.ceil(window.innerHeight-rect.top+10));
    menuPopup.style.setProperty('bottom',bottom+'px','important');
    const triggerRect=menuTrigger.getBoundingClientRect();
    if(nav.classList.contains('mobile-app-dock')){
     const right=Math.max(8,Math.ceil(window.innerWidth-(triggerRect.left+triggerRect.width/2+27)));
     menuPopup.style.setProperty('width','54px','important');
     menuPopup.style.setProperty('left','auto','important');
     menuPopup.style.setProperty('right',right+'px','important');
     menuPopup.style.setProperty('transform','none','important');
    }else{
     const right=Math.max(8,Math.ceil(window.innerWidth-triggerRect.right));
     menuPopup.style.setProperty('width','min(260px, calc(100vw - 24px))','important');
     menuPopup.style.setProperty('left','auto','important');
     menuPopup.style.setProperty('right',right+'px','important');
     menuPopup.style.setProperty('transform','none','important');
    }
   };
   if(nav.classList.contains('mobile-app-dock')&&document.documentElement.dataset.hoeTheme==='home'&&window.visualViewport){
    const queuePopupPosition=()=>{
     if(nav.isConnected&&menuPopup.getAttribute('aria-hidden')==='false')requestAnimationFrame(()=>{if(nav.isConnected&&menuPopup.getAttribute('aria-hidden')==='false')positionMenuPopup()});
    };
    window.visualViewport.addEventListener('resize',queuePopupPosition,{passive:true});
    window.visualViewport.addEventListener('scroll',queuePopupPosition,{passive:true});
   }
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
    if(nav.classList.contains('mobile-app-dock')){
     nav.classList.remove('is-hidden');
    }else{
     nav.classList.toggle('is-hidden',y>last+8&&y>220);
     if(y<100||y<last-10)nav.classList.remove('is-hidden');
    }
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
 function registerPwa(){if('serviceWorker'in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js?build=23',{updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{}),{once:true})}}
 // Keep the mobile Home shortcut independent; Menu taps reach the popup's own click handler.
 document.addEventListener('click',event=>{
  if(!mobile())return;
  const target=event.target instanceof Element?event.target.closest('.mobile-app-dock [data-dock="home"]'):null;
  if(!target)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const path=window.location.pathname.toLowerCase();
  const onHomepage=path==='/'||path.endsWith('/index.html');
  if(!onHomepage){
   window.location.assign('/');
   return;
  }
  if(window.location.hash){
   window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search);
  }
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 },true);
 function init(){loadStyles();removeLegacy();mountDock();reveal();registerPwa()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('resize',()=>{
  const existing=document.querySelector('.mobile-app-dock,.desktop-app-dock');
  const expected=mobile()?'mobile-app-dock':'desktop-app-dock';
  if(!existing||!existing.classList.contains(expected)){existing?.remove();mountDock()}
 },{passive:true});
})();