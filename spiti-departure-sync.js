/* Public departure data: same source as homepage promotions; no writes. */
(() => {
  "use strict";
  const main = document.querySelector("#fixed-departures");
  const winter = document.querySelector("[data-spiti-winter-departures]");
  if (!main && !winter) return;
  const api = "https://ynkoiuyjevclypumnyes.supabase.co/rest/v1/site_hero_promotions";
  const key = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const today = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).filter(p=>p.type!=="literal").reduce((a,p)=>(a[p.type]=p.value,a),{});
  const current = today.year+"-"+today.month+"-"+today.day;
  function dateKey(value) {
    const m = String(value||"").toUpperCase().match(/^(\d{1,2})\s+([A-Z]{3,9})\s+(\d{4})/);
    if (!m) return null;
    const month = months.indexOf(m[2].slice(0,3))+1, day = Number(m[1]), year = Number(m[3]);
    if (!month || day<1 || day>31 || year<2020 || year>2100) return null;
    const d = new Date(Date.UTC(year,month-1,day));
    if (d.getUTCMonth()!==month-1 || d.getUTCDate()!==day) return null;
    return d.toISOString().slice(0,10);
  }
  function normalize(row) {
    const name = [row.title_line1,row.title_emphasis,row.title_line2].filter(Boolean).join(" ").trim();
    if (!/\bspiti\b/i.test(name)) return null;
    const dates = String(row.date_label||"").trim(), start = dateKey(dates);
    const price = Number(row.price_per_person);
    if (!name || !start || start<current || !Number.isFinite(price) || price<=0) return null;
    const facts = Array.isArray(row.facts)?row.facts.filter(x=>typeof x==="string"&&x.trim()).slice(0,4):[];
    return {name,dates,start,price,facts};
  }
  function el(tag,cls,text) {
    const node = document.createElement(tag);
    if (cls) node.className=cls;
    if (text!==undefined) node.textContent=text;
    return node;
  }
  const currency = new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2,minimumFractionDigits:0});
  const priceLabel = n=>currency.format(n);
  function whatsapp(item) {
    return "https://wa.me/919816929669?text="+encodeURIComponent("Hello Himalayan Odyssey Expedition, please share current availability, itinerary, inclusions and final price for "+item.name+" ("+item.dates+").");
  }
  function card(item) {
    const node=el("article","spiti-book-card"), img=el("img"), kinnaur=/kinnaur/i.test(item.name);
    img.src=kinnaur?"/kinnaur.jpg":"/spiti.jpg";
    img.alt=kinnaur?"Kinnaur village and Himalayan mountains":"Spiti Valley mountain landscape";
    img.width=kinnaur?1200:1350;img.height=kinnaur?1600:1800;img.loading="lazy";img.decoding="async";
    node.append(img,el("h3","",item.name));
    const info=el("p");info.append(el("strong","",item.dates));item.facts.forEach(f=>info.append(el("br"),document.createTextNode(f)));node.append(info);
    const price=el("p","spiti-book-price");price.append(el("strong","",priceLabel(item.price)),document.createTextNode(" per person (advertised)"));node.append(price);
    const sample=el("p"), itinerary=el("a","","View sample itinerary");itinerary.href="#eight-day-itinerary";sample.append(itinerary);node.append(sample);
    const a=el("a","spiti-book-link","Enquire on WhatsApp");a.href=whatsapp(item);node.append(a);return node;
  }
  function syncSchema(items) {
    if (!main) return;
    const script=document.querySelector('script[type="application/ld+json"]');
    try {
      const data=JSON.parse(script.textContent), service=data["@graph"].find(n=>n["@type"]==="Service");
      if(!service)return;
      if(!items.length)delete service.hasOfferCatalog;
      else service.hasOfferCatalog={"@type":"OfferCatalog",name:"Upcoming advertised Spiti group tours",itemListElement:items.map((item,i)=>({"@type":"Offer","@id":location.origin+"/spiti-valley-tours/#departure-"+(i+1),name:item.name+" — "+item.dates,price:String(item.price),priceCurrency:"INR",priceValidUntil:item.start,url:location.origin+"/spiti-valley-tours/#fixed-departures",description:"Advertised per-person price; confirm availability and final inclusions.",itemOffered:{"@type":"TouristTrip",name:item.name,description:[item.dates,...item.facts].join(". "),provider:{"@id":location.origin+"/#travelagency"}}}))};
      script.textContent=JSON.stringify(data);
    } catch(_) { /* Keep valid static structured data on unexpected markup. */ }
  }
  async function sync() {
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),5000);
    try {
      const params=new URLSearchParams({select:"title_line1,title_emphasis,title_line2,date_label,price_per_person,facts",is_active:"eq.true",order:"sort_order.asc,created_at.asc"});
      const response=await fetch(api+"?"+params,{headers:{apikey:key},signal:controller.signal,cache:"no-store"});
      if(!response.ok)throw Error("Departure feed unavailable");
      const data=await response.json();
      if(!Array.isArray(data))throw Error("Invalid departure feed");
      const items=data.map(normalize).filter(Boolean).sort((a,b)=>a.start.localeCompare(b.start));
      if(main) {
        const grid=main.querySelector(".spiti-book-grid"), heading=main.querySelector("h2"), notice=main.querySelector("p");
        if(grid&&heading&&notice){
          heading.textContent="Spiti Valley group tour packages: upcoming departures";
          notice.textContent=items.length?"Current advertised departures from our booking team. Confirm final prices, seats, pickup, itinerary and inclusions before booking.":"No dated upcoming group departures are currently listed. Enquire about a future group or private tour.";
          grid.replaceChildren(...items.map(card));
          const end=main.querySelector("[data-spiti-departure-note]");if(end)end.textContent="For other dates, request a fresh group or private tour quotation.";
          syncSchema(items);
        }
      }
      if(winter) {
        const matches=items.filter(item=>/winter|december|\bdec\b|january|\bjan\b|february|\bfeb\b/i.test(item.name+" "+item.dates));
        const heading=winter.querySelector("h3"), notice=winter.querySelector("p"), list=winter.querySelector("ul");
        if(heading&&notice&&list){
          heading.textContent="Upcoming Winter Spiti group departure prices and dates";
          notice.textContent=matches.length?"Current advertised winter group rates. Confirm availability, pickup, return, inclusions and final quotation.":"No dated upcoming winter group departures are currently listed. Ask for a fresh quotation.";
          list.replaceChildren(...matches.map(item=>{const li=el("li");li.append(el("strong","",item.name+" — "+item.dates+": "),document.createTextNode(priceLabel(item.price)+" per person. "+item.facts.join("; ")));return li;}));
          const note=winter.querySelector("[data-spiti-winter-note]");if(note)note.textContent="For other dates, request a fresh quotation. Road and weather conditions may change the itinerary.";
        }
      }
    } catch (_) { /* The server-rendered, explicitly dated snapshot remains readable. */ }
    finally { clearTimeout(timer); }
  }
  sync();
})();