(()=>{"use strict";const section=document.getElementById("featured-travel-photography"),carousel=document.getElementById("featuredTravelCarousel"),track=document.getElementById("featuredTravelTrack"),dots=document.getElementById("featuredTravelDots"),prev=document.getElementById("featuredTravelPrev"),next=document.getElementById("featuredTravelNext");if(!section||!carousel||!track)return;const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));let photos=[],index=0,startX=0,lastX=0,dragging=false,timer=null;const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches,desktopImagesOnly=matchMedia("(min-width: 761px)").matches;
if(desktopImagesOnly){
 let position=3,dragStart=0,dragLast=0,dragging=false,timer=null,transitioning=false;
 const visible=3,step=100/9;
 const stop=()=>{clearInterval(timer);timer=null;};
 const offset=animate=>{track.style.transition=animate&&!reduced?"transform .95s cubic-bezier(.22,.75,.22,1)":"none";track.style.transform="translate3d(-"+(position*step)+"%,0,0)";};
 const go=(delta,animate=true)=>{if(transitioning||photos.length<2)return;position+=delta;transitioning=true;offset(animate);};
 const play=()=>{stop();if(photos.length>3&&!reduced&&!document.hidden)timer=setInterval(()=>{if(!dragging&&!carousel.matches(":hover")&&!transitioning)go(1);},3800);};
 const render=()=>{
  const head=photos.slice(-visible),tail=photos.slice(0,visible);
  const all=[...head,...photos,...tail];
  track.innerHTML=all.map((p,i)=>'<article class="featured-travel-slide'+(i>=visible&&i<visible+3?' is-active':'')+'"><img src="'+safe(p.image_url)+'" alt="'+safe(p.alt_text||p.title||"Himalayan travel photograph")+'" loading="'+(i<4?'eager':'lazy')+'" decoding="async"></article>').join("");
  offset(false);
 };
 track.addEventListener("transitionend",e=>{if(e.target!==track||e.propertyName!=="transform")return;transitioning=false;if(position>=photos.length+3)position=3;else if(position<3)position=photos.length+2;offset(false);});
 [prev,next].forEach((button,i)=>{if(!button)return;button.addEventListener("pointerdown",e=>e.stopPropagation());button.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();stop();go(i===0?-1:1);play();});});
 carousel.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;dragStart=dragLast=e.clientX;dragging=true;carousel.classList.add("is-dragging");track.style.transition="none";stop();});
 carousel.addEventListener("pointermove",e=>{if(!dragging)return;dragLast=e.clientX;const width=carousel.clientWidth||1;track.style.transform="translate3d(calc(-"+(position*step)+"% + "+(dragLast-dragStart)+"px),0,0)";});
 const finish=()=>{if(!dragging)return;const distance=dragLast-dragStart;dragging=false;carousel.classList.remove("is-dragging");if(Math.abs(distance)>45)go(distance<0?1:-1);else offset(true);play();};
 ["pointerup","pointercancel","lostpointercapture"].forEach(name=>carousel.addEventListener(name,finish));
 carousel.addEventListener("mouseenter",stop);carousel.addEventListener("mouseleave",play);
 carousel.addEventListener("focusin",stop);carousel.addEventListener("focusout",play);
 document.addEventListener("visibilitychange",()=>document.hidden?stop():play());
 carousel.addEventListener("keydown",e=>{if(e.key==="ArrowRight"){e.preventDefault();stop();go(1);play();}if(e.key==="ArrowLeft"){e.preventDefault();stop();go(-1);play();}});
 (async()=>{try{const client=window.supabase.createClient("https://ynkoiuyjevclypumnyes.supabase.co","sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-");const {data,error}=await client.from("featured_travel_photos").select("title,caption,alt_text,image_url,sort_order").eq("is_active",true).order("sort_order",{ascending:true});if(error)throw error;photos=(data||[]).filter(p=>p.image_url);if(!photos.length)return;section.hidden=false;render();play();}catch(e){console.info("Featured photography is not configured yet.",e.message);}})();
 return;
} 
// Mobile-only 3D photography carousel. Desktop implementation above is unchanged.
let photos=[],active=3,startX=null,lastX=null,dragging=false,swiped=false,timer=null;
const visibleRange=2;
const stop=()=>{clearInterval(timer);timer=null;};
const play=()=>{stop();if(photos.length>1&&!reduced&&!document.hidden)timer=setInterval(()=>{if(!dragging&&!carousel.matches(":hover"))go(active+1);},2000);};
const render=()=>{
  track.innerHTML=photos.map((p,i)=>'<article class="featured-travel-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+photos.length+'" data-title="'+safe(p.title||"")+'"><img src="'+safe(p.image_url)+'" alt="'+safe(p.alt_text||p.title||"Himalayan travel photograph")+'" loading="'+(i===active?"eager":"lazy")+'" decoding="async"><div class="featured-travel-caption"><strong>'+safe(p.title||"")+'</strong>'+(p.caption?'<span>'+safe(p.caption)+'</span>':'')+'</div></article>').join("");
  dots.innerHTML=photos.map((p,i)=>'<button class="featured-travel-dot" type="button" data-index="'+i+'" aria-label="Show photo '+(i+1)+' of '+photos.length+'" aria-current="'+(i===active?'true':'false')+'"></button>').join("");
  renderPositions();
};
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
};
const go=index=>{if(!photos.length)return;active=(index+photos.length)%photos.length;renderPositions();};
dots.addEventListener("click",e=>{const button=e.target.closest("[data-index]");if(button){go(Number(button.dataset.index));play();}});
[prev,next].forEach((button,i)=>{if(!button)return;button.addEventListener("pointerdown",e=>e.stopPropagation());button.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();go(active+(i===0?-1:1));play();});});
track.addEventListener("click",e=>{if(swiped){swiped=false;return;}const item=e.target.closest(".featured-travel-slide");if(!item)return;const i=[...track.children].indexOf(item);if(i>=0&&i!==active){go(i);play();}});
carousel.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;if(e.pointerType==="mouse"&&e.button!==0)return;startX=lastX=e.clientX;dragging=true;swiped=false;carousel.classList.add("is-dragging");stop();});
carousel.addEventListener("pointermove",e=>{if(dragging)lastX=e.clientX;});
const finish=()=>{if(!dragging)return;const delta=lastX-startX;dragging=false;carousel.classList.remove("is-dragging");if(Math.abs(delta)>40){swiped=true;go(active+(delta<0?1:-1));}play();};
["pointerup","pointercancel","lostpointercapture"].forEach(name=>carousel.addEventListener(name,finish));
carousel.addEventListener("mouseenter",stop);carousel.addEventListener("mouseleave",play);
carousel.addEventListener("focusin",stop);carousel.addEventListener("focusout",play);
document.addEventListener("visibilitychange",()=>document.hidden?stop():play());
carousel.addEventListener("keydown",e=>{if(e.key==="ArrowRight"){e.preventDefault();go(active+1);play();}else if(e.key==="ArrowLeft"){e.preventDefault();go(active-1);play();}else if(e.key==="Home"){e.preventDefault();go(0);play();}else if(e.key==="End"){e.preventDefault();go(photos.length-1);play();}});
(async()=>{try{const client=window.supabase.createClient("https://ynkoiuyjevclypumnyes.supabase.co","sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-");const {data,error}=await client.from("featured_travel_photos").select("title,caption,alt_text,image_url,sort_order").eq("is_active",true).order("sort_order",{ascending:true});if(error)throw error;photos=(data||[]).filter(p=>p.image_url);if(!photos.length)return;active=Math.min(3,photos.length-1);section.hidden=false;render();play();}catch(e){console.info("Featured photography is not configured yet.",e.message);}})();
})();