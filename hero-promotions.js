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
  const progress=c.total_seats?'<div class="mobile-departure-track" role="progressbar" aria-label="Tour seats booked" aria-valuemin="0" aria-valuemax="'+Number(c.total_seats)+'" aria-valuenow="'+Number(c.booked_count)+'"><span style="width:'+pct+'%"></span></div>':'';
  const itinerary=(c.itinerary_items||[]).length?'<details class="mobile-departure-itinerary-details"><summary class="mobile-departure-cta mobile-departure-itinerary">'+esc(c.itinerary_label)+' <span aria-hidden="true">＋</span></summary><div class="mobile-departure-itinerary-list" aria-label="Tour itinerary">'+c.itinerary_items.map(x=>'<p>'+esc(x)+'</p>').join("")+'</div></details>':'<a class="mobile-departure-cta mobile-departure-itinerary" href="'+esc(c.itinerary_url)+'">'+esc(c.itinerary_label)+' <span aria-hidden="true">→</span></a>';
  const seatsArea=seats?'price seats':'price price';
  return '<div class="hero-promo-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+cards.length+'"><section class="mobile-next-departure'+(i>0?' mobile-departure-secondary':'')+'" aria-label="'+esc(c.title_line1+' '+c.title_emphasis+' '+c.title_line2)+'"><div class="mobile-departure-topline"><span class="mobile-departure-live-dot" aria-hidden="true"></span> '+esc(c.top_label)+' <span class="mobile-departure-season">'+esc(c.season_label)+'</span></div><p class="mobile-departure-kicker">'+esc(c.kicker)+'</p><h2>'+esc(c.title_line1)+' '+(c.title_emphasis?'<em>'+esc(c.title_emphasis)+'</em>':'')+(c.title_line2?'<br>'+esc(c.title_line2):'')+'</h2><div class="mobile-departure-date">'+esc(c.date_label)+'</div><div class="mobile-departure-facts">'+facts+'</div><div class="mobile-departure-price">₹'+Number(c.price_per_person).toLocaleString("en-IN")+' <small>/ person</small></div>'+seats+progress+itinerary+'<a class="mobile-departure-cta" href="'+esc(c.cta_url)+'" target="_blank" rel="noopener noreferrer">'+esc(c.cta_label)+' <span aria-hidden="true">↗</span></a></section></div>';
 }).join("");
 const dots=cards.map((c,i)=>'<button type="button" '+(i===0?'class="is-active" aria-current="true"':'')+' aria-label="Show '+esc(c.title_line1+' '+c.title_emphasis+' '+c.title_line2)+'"></button>').join("");
 let pagination=carousel.querySelector(".hero-promo-pagination");if(!pagination){pagination=document.createElement("div");pagination.className="hero-promo-pagination";pagination.setAttribute("aria-label","Choose a group departure");carousel.appendChild(pagination);}pagination.innerHTML=dots;
})();