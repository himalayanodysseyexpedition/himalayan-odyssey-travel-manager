"use strict";
window.heroPromotionsReady=(async()=>{
 const db=window.HOEPublicCatalogue;if(!db)return;
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const{data,error}=await db.from("site_hero_promotions").select("*").eq("is_active",true).order("sort_order").order("created_at");
 if(error||!data?.length)return;
 const carousel=document.getElementById("heroPromoCarousel"),track=document.getElementById("heroPromoTrack");if(!carousel||!track)return;
 const cards=data;
 window.heroPromoRecords=cards;
 const markup=cards.map((c,i)=>{
  const pct=c.total_seats?Math.min(100,Math.round(c.booked_count/c.total_seats*100)):0;
  const facts=(c.facts||[]).map(x=>'<span>'+esc(x)+'</span>').join("");
  const seats=c.total_seats?'<div class="mobile-departure-seats"><strong>'+esc(c.booked_count)+' of '+esc(c.total_seats)+' people booked</strong><span>Only '+esc(Math.max(0,c.total_seats-c.booked_count))+' seats left</span></div>':'';
  const progress=c.total_seats?'<div class="mobile-departure-track" role="progressbar" aria-label="Tour seats booked" aria-valuemin="0" aria-valuemax="'+Number(c.total_seats)+'" aria-valuenow="'+Number(c.booked_count)+'"><span style="width:'+pct+'% !important"></span></div>':'';
  const itinerary='<a class="mobile-departure-cta mobile-departure-itinerary" href="'+esc(c.itinerary_url)+'" data-itinerary-promo="'+esc(c.id)+'">'+esc(c.itinerary_label)+' <span aria-hidden="true">→</span></a>';
  const seatsArea=seats?'price seats':'price price';
  return '<div class="hero-promo-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+cards.length+'"><section class="mobile-next-departure'+(i>0?' mobile-departure-secondary':'')+'" aria-label="'+esc(c.title_line1+' '+c.title_emphasis+' '+c.title_line2)+'" data-promo-id="'+esc(c.id)+'"><div class="mobile-departure-topline"><span class="mobile-departure-live-dot" aria-hidden="true"></span> '+esc(c.top_label)+' <span class="mobile-departure-season">'+esc(c.season_label)+'</span></div><p class="mobile-departure-kicker">'+esc(c.kicker)+'</p><h2>'+esc(c.title_line1)+' '+(c.title_emphasis?'<em>'+esc(c.title_emphasis)+'</em>':'')+(c.title_line2?'<br>'+esc(c.title_line2):'')+'</h2><div class="mobile-departure-date">'+esc(c.date_label)+'</div><div class="mobile-departure-facts">'+facts+'</div><div class="mobile-departure-price">₹'+Number(c.price_per_person).toLocaleString("en-IN")+' <small>/ person</small></div>'+seats+progress+itinerary+'<a class="mobile-departure-cta" href="'+esc(c.cta_url)+'" target="_blank" rel="noopener noreferrer">'+esc(c.cta_label)+' <span aria-hidden="true">↗</span></a></section></div>';
 }).join("");
 // Mobile: preserve the already-painted poster photo while live data refreshes.
 // Build the replacement off-DOM, then publish the complete cards together.
 if (window.matchMedia("(max-width:760px)").matches) {
   const key = card => (card.querySelector("h2")?.textContent || "").toLowerCase().replace(/\s+/g,"").replace(/&/g,"and");
   const existing = Array.from(track.querySelectorAll(".hero-promo-slide > .mobile-next-departure"));
   const template = document.createElement("template");
   template.innerHTML = markup;
   for (const card of template.content.querySelectorAll(".mobile-next-departure")) {
     const previous = existing.find(old => key(old) === key(card));
     const title = key(card);
     const photo = previous?.querySelector("img.hoe-promo-thumb");
     if (photo) {
       // Reuse the image resource, including an already-decoded poster.
       card.prepend(photo.cloneNode(true));
     } else {
       const img = document.createElement("img");
       img.className = "hoe-promo-thumb";
       img.alt = "Himalayan mountain landscape";
       img.loading = "eager";
       img.decoding = "async";
       const spiti = title.includes("spiti") && !title.includes("kinnaur");
       img.src = spiti ? "/spiti.jpg" : "/kinnaur.jpg";
       img.width = spiti ? 1350 : 1200;
       img.height = spiti ? 1800 : 1600;
       card.prepend(img);
     }
     const route = previous?.querySelector(".hoe-ticket-route");
     if (route) card.append(route.cloneNode(true));
     card.classList.add("hoe-cinematic-ticket");
   }
   const next = Array.from(template.content.children);
   const current = Array.from(track.children);
   // Keep the scroll anchor and poster nodes in place for the common unchanged order.
   if (next.length === current.length && next.every((slide,i) => key(slide) === key(current[i]))) {
     next.forEach((slide,i) => {
       const oldCard = current[i].querySelector(".mobile-next-departure");
       const newCard = slide.querySelector(".mobile-next-departure");
       const oldPhoto = oldCard.querySelector("img.hoe-promo-thumb");
       const oldHeading = oldCard.querySelector("h2");
       const newPhoto = newCard.querySelector("img.hoe-promo-thumb");
       const newHeading = newCard.querySelector("h2");
       if (oldPhoto && newPhoto) newPhoto.replaceWith(oldPhoto);
       if (oldHeading && newHeading && oldHeading.innerHTML === newHeading.innerHTML) {
         oldHeading.classList.remove("hoe-promo-heading-reveal");
         newHeading.replaceWith(oldHeading);
       }
       current[i].setAttribute("aria-label",slide.getAttribute("aria-label"));
       oldCard.className = newCard.className;
       oldCard.setAttribute("aria-label",newCard.getAttribute("aria-label"));
       oldCard.dataset.promoId = newCard.dataset.promoId;
       oldCard.replaceChildren(...newCard.childNodes);
     });
     // Notify existing direct-child observers without disturbing the card order.
     track.dispatchEvent(new Event("hoe:promotions-refreshed"));
   } else {
     track.replaceChildren(template.content);
   }
 } else {
   track.innerHTML = markup;
 }
 const dots=cards.map((c,i)=>'<button type="button" '+(i===0?'class="is-active" aria-current="true"':'')+' aria-label="Show '+esc(c.title_line1+' '+c.title_emphasis+' '+c.title_line2)+'"></button>').join("");
 let pagination=carousel.querySelector(".hero-promo-pagination");if(!pagination){pagination=document.createElement("div");pagination.className="hero-promo-pagination";pagination.setAttribute("aria-label","Choose a group departure");carousel.appendChild(pagination);}pagination.innerHTML=dots;
})();