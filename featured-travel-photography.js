(()=>{"use strict";const section=document.getElementById("featured-travel-photography"),carousel=document.getElementById("featuredTravelCarousel"),track=document.getElementById("featuredTravelTrack"),dots=document.getElementById("featuredTravelDots"),prev=document.getElementById("featuredTravelPrev"),next=document.getElementById("featuredTravelNext");if(!section||!carousel||!track)return;const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));let photos=[],index=0,startX=0,lastX=0,dragging=false,timer=null;const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches,desktopImagesOnly=matchMedia("(min-width: 761px)").matches;
let galleryVisible=typeof IntersectionObserver==="undefined";
const watchGallery=(start,stop)=>{if(typeof IntersectionObserver==="undefined"){start();return;}const observer=new IntersectionObserver(entries=>{galleryVisible=entries.some(entry=>entry.isIntersecting);if(galleryVisible)start();else stop();},{threshold:0});observer.observe(carousel);};
if(desktopImagesOnly){
 let active=0,dragStart=0,dragLast=0,draggingDesktop=false,timerDesktop=null;
 const visibleRange=2;
 const stopDesktop=()=>{clearInterval(timerDesktop);timerDesktop=null;};
 const playDesktop=()=>{stopDesktop();if(galleryVisible&&photos.length>1&&!reduced&&!document.hidden)timerDesktop=setInterval(()=>{if(!draggingDesktop&&!carousel.matches(":hover"))goDesktop(active+1);},3800);};
 const renderDesktop=()=>{
  track.innerHTML=photos.map((p,i)=>'<article class="featured-travel-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+photos.length+'"><img src="'+safe(p.image_url)+'" alt="'+safe(p.alt_text||p.title||"Himalayan travel photograph")+'" loading="lazy" decoding="async" fetchpriority="low"><div class="featured-travel-caption"><strong>'+safe(p.title||"")+'</strong>'+(p.caption?'<span>'+safe(p.caption)+'</span>':'')+'</div></article>').join("");
  positionDesktop();
 };
 const positionDesktop=()=>{
  [...track.children].forEach((item,i)=>{
   let offset=i-active;
   if(offset>photos.length/2)offset-=photos.length;
   if(offset< -photos.length/2)offset+=photos.length;
   const abs=Math.abs(offset);
   item.style.setProperty("--cf-offset",offset);
   item.style.setProperty("--cf-abs",abs);
   item.style.setProperty("--cf-dir",offset===0?0:offset/abs);
   item.classList.toggle("is-active",offset===0);
   item.classList.toggle("is-far",abs>visibleRange);
   if(offset===0)item.removeAttribute("aria-hidden");else item.setAttribute("aria-hidden","true");
  });
 };
 const goDesktop=value=>{if(!photos.length)return;active=(value+photos.length)%photos.length;positionDesktop();};
 [prev,next].forEach((button,i)=>{if(!button)return;button.addEventListener("pointerdown",e=>e.stopPropagation());button.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();goDesktop(active+(i===0?-1:1));playDesktop();});});
 track.addEventListener("click",e=>{const item=e.target.closest(".featured-travel-slide");if(!item)return;const i=[...track.children].indexOf(item);if(i>=0&&i!==active){goDesktop(i);playDesktop();}});
 carousel.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;if(e.pointerType==="mouse"&&e.button!==0)return;dragStart=dragLast=e.clientX;draggingDesktop=true;carousel.classList.add("is-dragging");stopDesktop();});
 carousel.addEventListener("pointermove",e=>{if(draggingDesktop)dragLast=e.clientX;});
 const finishDesktop=()=>{if(!draggingDesktop)return;const delta=dragLast-dragStart;draggingDesktop=false;carousel.classList.remove("is-dragging");if(Math.abs(delta)>55)goDesktop(active+(delta<0?1:-1));playDesktop();};
 ["pointerup","pointercancel","lostpointercapture"].forEach(name=>carousel.addEventListener(name,finishDesktop));
 carousel.addEventListener("mouseenter",stopDesktop);carousel.addEventListener("mouseleave",playDesktop);
 carousel.addEventListener("focusin",stopDesktop);carousel.addEventListener("focusout",playDesktop);
 document.addEventListener("visibilitychange",()=>document.hidden?stopDesktop():playDesktop());
 carousel.addEventListener("keydown",e=>{if(e.key==="ArrowRight"){e.preventDefault();goDesktop(active+1);playDesktop();}else if(e.key==="ArrowLeft"){e.preventDefault();goDesktop(active-1);playDesktop();}});
 (async()=>{try{const client=window.supabase.createClient("https://ynkoiuyjevclypumnyes.supabase.co","sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-");const {data,error}=await client.from("featured_travel_photos").select("title,caption,alt_text,image_url,sort_order").eq("is_active",true).order("sort_order",{ascending:true});if(error)throw error;photos=(data||[]).filter(p=>p.image_url);if(!photos.length)return;active=Math.min(photos.length-1,Math.floor(photos.length/2));section.hidden=false;renderDesktop();watchGallery(playDesktop,stopDesktop);}catch(e){console.info("Featured photography is not configured yet.",e.message);}})();
 return;
} 
// Mobile-only 3D photography carousel. Desktop implementation above is unchanged.
let active=3,swiped=false;
const visibleRange=2;
const stop=()=>{clearInterval(timer);timer=null;};
const play=()=>{stop();if(galleryVisible&&photos.length>1&&!reduced&&!document.hidden)timer=setInterval(()=>{if(!dragging&&!carousel.matches(":hover"))go(active+1);},2000);};
const render=()=>{
  track.innerHTML=photos.map((p,i)=>'<article class="featured-travel-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+photos.length+'" data-title="'+safe(p.title||"")+'"><img data-src="'+safe(p.image_url)+'" alt="'+safe(p.alt_text||p.title||"Himalayan travel photograph")+'" loading="lazy" decoding="async" fetchpriority="low"><div class="featured-travel-caption"><strong>'+safe(p.title||"")+'</strong>'+(p.caption?'<span>'+safe(p.caption)+'</span>':'')+'</div></article>').join("");
  dots.innerHTML=photos.map((p,i)=>'<button class="featured-travel-dot" type="button" data-index="'+i+'" aria-label="Show photo '+(i+1)+' of '+photos.length+'" aria-current="'+(i===active?'true':'false')+'"></button>').join("");
  renderPositions();
};
// Do not assign network image sources to every absolutely-positioned slide at once.
let nearGallery=typeof IntersectionObserver==="undefined";
const loadNearbyPhotos=()=>{
  if(!nearGallery||!photos.length)return;
  [...track.children].forEach((item,i)=>{
    const distance=Math.min(Math.abs(i-active),photos.length-Math.abs(i-active));
    if(distance>visibleRange+1)return;
    const img=item.querySelector("img[data-src]");
    if(img){img.src=img.dataset.src;img.removeAttribute("data-src");}
  });
};
if(typeof IntersectionObserver!=="undefined"){
  const imageObserver=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){
      nearGallery=true;loadNearbyPhotos();imageObserver.disconnect();
    }
  },{rootMargin:"600px 0px"});
  imageObserver.observe(carousel);
}
const renderPositions=()=>{
  [...track.children].forEach((item,i)=>{
    let offset=i-active;
    if(offset>photos.length/2)offset-=photos.length;
    if(offset< -photos.length/2)offset+=photos.length;
    const abs=Math.abs(offset);
    item.style.setProperty("--cf-offset",offset);
    item.style.setProperty("--cf-abs",abs);
    item.style.setProperty("--cf-dir",offset===0?0:offset/abs);
    item.classList.toggle("is-active",offset===0);
    item.classList.toggle("is-far",abs>visibleRange);
    if(offset===0)item.removeAttribute("aria-hidden");else item.setAttribute("aria-hidden","true");
  });
  [...dots.children].forEach((dot,i)=>dot.setAttribute("aria-current",i===active?"true":"false"));
  loadNearbyPhotos();
};
const go=index=>{if(!photos.length)return;active=(index+photos.length)%photos.length;renderPositions();};
dots.addEventListener("click",e=>{const button=e.target.closest("[data-index]");if(button)go(Number(button.dataset.index));});
[prev,next].forEach((button,i)=>{if(!button)return;button.addEventListener("pointerdown",e=>e.stopPropagation());button.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();go(active+(i===0?-1:1));});});
track.addEventListener("click",e=>{if(swiped){swiped=false;return;}const item=e.target.closest(".featured-travel-slide");if(!item)return;const i=[...track.children].indexOf(item);if(i>=0&&i!==active)go(i);});
carousel.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;if(e.pointerType==="mouse"&&e.button!==0)return;startX=lastX=e.clientX;dragging=true;swiped=false;carousel.classList.add("is-dragging");carousel.setPointerCapture?.(e.pointerId);});
carousel.addEventListener("pointermove",e=>{if(dragging)lastX=e.clientX;});
const finish=()=>{if(!dragging)return;const delta=lastX-startX;dragging=false;carousel.classList.remove("is-dragging");if(Math.abs(delta)>40){swiped=true;go(active+(delta<0?1:-1));}};
["pointerup","pointercancel","lostpointercapture"].forEach(name=>carousel.addEventListener(name,finish));
// Touch, swipe, taps and focus do not reset the mobile autoplay interval.
// Preserve the 2-second cadence while the gallery is visible; pause offscreen.
document.addEventListener("visibilitychange",()=>document.hidden?stop():play());
carousel.addEventListener("keydown",e=>{if(e.key==="ArrowRight"){e.preventDefault();go(active+1);play();}else if(e.key==="ArrowLeft"){e.preventDefault();go(active-1);play();}else if(e.key==="Home"){e.preventDefault();go(0);play();}else if(e.key==="End"){e.preventDefault();go(photos.length-1);play();}});
(async()=>{try{const client=window.supabase.createClient("https://ynkoiuyjevclypumnyes.supabase.co","sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-");const {data,error}=await client.from("featured_travel_photos").select("title,caption,alt_text,image_url,sort_order").eq("is_active",true).order("sort_order",{ascending:true});if(error)throw error;photos=(data||[]).filter(p=>p.image_url);if(!photos.length)return;active=Math.min(3,photos.length-1);render();section.hidden=false;watchGallery(play,stop);}catch(e){console.info("Featured photography is not configured yet.",e.message);}finally{document.documentElement.classList.remove("hoe-gallery-pending");}})();
})();