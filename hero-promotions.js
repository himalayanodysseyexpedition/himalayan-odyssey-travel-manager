"use strict";
window.heroPromotionsReady=(async()=>{
 const db=window.supabase.createClient("https://ynkoiuyjevclypumnyes.supabase.co","sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-");
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const{data,error}=await db.from("site_hero_promotions").select("*").eq("is_active",true).order("sort_order").order("created_at");
 if(error||!data?.length)return;
 const carousel=document.getElementById("heroPromoCarousel"),track=document.getElementById("heroPromoTrack");if(!carousel||!track)return;
 const cards=data;
 track.innerHTML=cards.map((c,i)=>{
  const pct=c.total_seats?Math.min(100,Math.round(c.booked_count/c.total_seats*100)):0;
  const facts=(c.facts||[]).map(x=>'<span>'+esc(x)+'</span>').join("");
  const seats=c.total_seats?'<div class="mobile-departure-seats"><strong>'+esc(c.booked_count)+' of '+esc(c.total_seats)+' people booked</strong><span>Only '+esc(Math.max(0,c.total_seats-c.booked_count))+' seats left</span></div>':'';
  const progress=c.total_seats?'<div class="mobile-departure-track" role="progressbar" aria-label="Tour seats booked" aria-valuemin="0" aria-valuemax="'+Number(c.total_seats)+'" aria-valuenow="'+Number(c.booked_count)+'"><span style="width:'+pct+'% !important"></span></div>':'';
  const itinerary='<button class="mobile-departure-cta mobile-departure-itinerary" type="button" data-itinerary-index="'+i+'" aria-haspopup="dialog">VIEW ITINERARY <span aria-hidden="true">＋</span></button>';
  const cta='<a class="mobile-departure-cta" href="'+esc(c.cta_url)+'" target="_blank" rel="noopener noreferrer">ENQUIRE ON WHATSAPP <span aria-hidden="true">↗</span></a>';
  return '<div class="hero-promo-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+cards.length+'"><section class="mobile-next-departure'+(i>0?' mobile-departure-secondary':'')+'" aria-label="'+esc(c.title_line1+' '+c.title_emphasis+' '+c.title_line2)+'"><div class="mobile-departure-topline"><span class="mobile-departure-live-dot" aria-hidden="true"></span> '+esc(c.top_label)+' <span class="mobile-departure-season">'+esc(c.season_label)+'</span></div><p class="mobile-departure-kicker">'+esc(c.kicker)+'</p><h2>'+esc(c.title_line1)+' '+(c.title_emphasis?'<em>'+esc(c.title_emphasis)+'</em>':'')+(c.title_line2?'<br>'+esc(c.title_line2):'')+'</h2><div class="mobile-departure-date">'+esc(c.date_label)+'</div><div class="mobile-departure-facts">'+facts+'</div><div class="mobile-departure-price">₹'+Number(c.price_per_person).toLocaleString("en-IN")+' <small>/ person</small></div>'+seats+progress+itinerary+cta+'</section></div>';
 }).join("");
 const dots=cards.map((c,i)=>'<button type="button" '+(i===0?'class="is-active" aria-current="true"':'')+' aria-label="Show '+esc(c.title_line1+' '+c.title_emphasis+' '+c.title_line2)+'"></button>').join("");
 let pagination=carousel.querySelector(".hero-promo-pagination");if(!pagination){pagination=document.createElement("div");pagination.className="hero-promo-pagination";pagination.setAttribute("aria-label","Choose a group departure");carousel.appendChild(pagination);}pagination.innerHTML=dots;

 const dialog=document.createElement("dialog");
 dialog.className="hero-itinerary-dialog";
 dialog.setAttribute("aria-labelledby","heroItineraryTitle");
 dialog.innerHTML='<div class="hero-itinerary-popup"><div class="hero-itinerary-popup-head"><div><p class="hero-itinerary-eyebrow">HIMALAYAN ODYSSEY EXPEDITION</p><h2 id="heroItineraryTitle">Tour Itinerary</h2><p class="hero-itinerary-date"></p></div><button type="button" class="hero-itinerary-close" aria-label="Close itinerary popup">×</button></div><div class="hero-itinerary-popup-content" aria-live="polite"></div></div>';
 document.body.appendChild(dialog);
 const title=dialog.querySelector("#heroItineraryTitle"),date=dialog.querySelector(".hero-itinerary-date"),content=dialog.querySelector(".hero-itinerary-popup-content");
 const openItinerary=index=>{
  const c=cards[index];if(!c)return;
  title.textContent=[c.title_line1,c.title_emphasis,c.title_line2].filter(Boolean).join(" ");
  date.textContent=c.date_label||"";
  const items=Array.isArray(c.itinerary_items)?c.itinerary_items.filter(x=>String(x??"").trim()):[];
  content.innerHTML=items.length?'<div class="hero-itinerary-day-list">'+items.map((item,i)=>{
    const value=String(item).trim();
    const match=value.match(/^\s*DAY\s*(\d+)\s*(?:[·:–—-]\s*)?(.*)$/i);
    const day=match?"DAY "+match[1]:"DAY "+(i+1);
    const description=match?match[2]:value;
    return '<article class="hero-itinerary-day"><span>'+esc(day)+'</span><p>'+esc(description)+'</p></article>';
  }).join("")+'</div>':'<p class="hero-itinerary-empty">Day-wise itinerary will be added here. Open Admin Panel → Hero Promotional Cards → Edit to add each day.</p>';
  if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
 };
 track.addEventListener("click",event=>{
  const button=event.target.closest("[data-itinerary-index]");
  if(button)openItinerary(Number(button.dataset.itineraryIndex));
 });
 dialog.querySelector(".hero-itinerary-close").addEventListener("click",()=>dialog.close?dialog.close():dialog.removeAttribute("open"));
 dialog.addEventListener("click",event=>{if(event.target===dialog)(dialog.close?dialog.close():dialog.removeAttribute("open"));});
})();