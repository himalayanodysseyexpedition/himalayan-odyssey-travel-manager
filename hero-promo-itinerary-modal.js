"use strict";
(() => {
  const modal = document.getElementById("promo-itinerary-modal");
  const track = document.getElementById("heroPromoTrack");
  if (!modal || !track) return;

  const closeButton = modal.querySelector(".promo-itinerary-close");
  const title = modal.querySelector("#promo-itinerary-title");
  const eyebrow = modal.querySelector(".promo-itinerary-head small");
  const content = modal.querySelector("#promo-itinerary-text");
  let lastFocus = null;

  const scroll = modal.querySelector(".promo-itinerary-scroll");
  const head = modal.querySelector(".promo-itinerary-head");
  const dialog = modal.querySelector(".promo-itinerary-dialog");
  const fallback = content.innerHTML, fallbackTitle = title.textContent, fallbackEyebrow = eyebrow.textContent;
  const style = document.createElement("style");
  style.textContent = `
@media(max-width:760px), (min-width:761px){
#promo-itinerary-modal{padding:12px!important;align-items:center!important;background:rgba(6,4,10,.79)!important}
#promo-itinerary-modal .promo-itinerary-dialog{width:100%!important;max-height:91vh!important;max-height:91dvh!important;min-height:0!important;background:#101014!important;color:#fff!important;border:1px solid #b681ef!important;border-radius:23px!important;box-shadow:0 0 22px #8b38cc55,inset 0 0 16px #a257db22,0 24px 70px #000a!important}
#promo-itinerary-modal .promo-itinerary-head{min-height:108px;padding:20px 15px!important;gap:10px!important;background:linear-gradient(90deg,#0b0b12f5,#11101bd0 58%,#0d0d1555),var(--journey-cover,url('/spiti.jpg')) center 44%/cover!important;border-bottom:1px solid #b681ef44!important;align-items:flex-start!important}
#promo-itinerary-modal .promo-itinerary-head small{color:#d9b9fc!important;font:700 9px/1.4 Inter,Arial,sans-serif!important;letter-spacing:.13em!important}
#promo-itinerary-modal .promo-itinerary-head h2{font-family:Boska,"Bodoni Moda",Georgia,serif!important;font-size:clamp(23px,6vw,32px)!important;line-height:1.05!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
#promo-itinerary-modal .promo-itinerary-close{flex:0 0 36px!important;width:36px!important;height:36px!important;padding:0!important;display:grid!important;place-items:center!important;border:1px solid #d9b3ff!important;background:#fff!important;color:#000!important;-webkit-text-fill-color:#000!important;box-shadow:0 0 12px #a952f980,inset 0 1px 3px #ffffff44!important;font-size:23px!important}
#promo-itinerary-modal .journey-scroll-wrap{position:relative;display:flex;flex:1 1 auto;min-height:0;overflow:hidden}
#promo-itinerary-modal .promo-itinerary-scroll{flex:1;min-width:0;min-height:0!important;padding:13px 43px 18px 12px!important;scrollbar-gutter:auto!important;scrollbar-width:none!important;overscroll-behavior:contain}
#promo-itinerary-modal .promo-itinerary-scroll::-webkit-scrollbar{display:none}
#promo-itinerary-modal .promo-itinerary-text{color:#e9e4ee!important;font:400 13px/1.55 Inter,Arial,sans-serif!important}
#promo-itinerary-modal .promo-itinerary-text p{color:#e9e4ee!important;-webkit-text-fill-color:#e9e4ee!important}
#promo-itinerary-modal .promo-itinerary-text .promo-itinerary-intro{font-size:12px!important;line-height:1.6!important;font-weight:650!important;padding:11px 12px!important;border:1px solid #ae77e45c;border-radius:12px;background:linear-gradient(125deg,#2e2041,#17151c);margin-bottom:7px!important}
#promo-itinerary-modal .promo-itinerary-text h3{font:700 22px/1.15 Boska,"Bodoni Moda",Georgia,serif!important;color:#fff!important;-webkit-text-fill-color:#fff!important;margin:15px 0 12px!important}
#promo-itinerary-modal .promo-day-list{gap:10px!important}
#promo-itinerary-modal .promo-day-card{display:grid;grid-template-columns:62px minmax(0,1fr);gap:6px 10px;padding:12px!important;background:linear-gradient(145deg,#27242e,#18171c 70%)!important;border:1px solid #55505d!important;border-radius:13px!important;box-shadow:inset 0 1px 0 #ffffff12,0 4px 12px #0004!important;min-width:0}
#promo-itinerary-modal .promo-day-card .journey-thumb{width:62px;height:68px;object-fit:cover;border-radius:8px;grid-row:1/3;grid-column:1;display:block}
#promo-itinerary-modal .promo-day-card:not(:has(.journey-thumb)){grid-template-columns:minmax(0,1fr)}
#promo-itinerary-modal .promo-day-card h4{margin:0!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font:700 17px/1.18 Boska,"Bodoni Moda",Georgia,serif!important;overflow-wrap:anywhere}
#promo-itinerary-modal .promo-day-card .journey-day-number{display:block;font:750 10px/1.3 Inter,Arial,sans-serif;color:#d7a9ff;letter-spacing:.09em;margin-bottom:4px}
#promo-itinerary-modal .promo-day-card .promo-day-stay{align-self:start;justify-self:start;max-width:100%;margin:0!important;padding:4px 7px!important;border-radius:7px!important;background:#342448!important;border:1px solid #b581e555!important;color:#e5caff!important;-webkit-text-fill-color:#e5caff!important;font:600 10px/1.4 Inter,Arial,sans-serif!important;letter-spacing:0!important}
#promo-itinerary-modal .promo-day-card .promo-day-description{grid-column:1/-1;margin:4px 0 0!important;font:400 12.5px/1.55 Inter,Arial,sans-serif!important;color:#dfdce4!important;-webkit-text-fill-color:#dfdce4!important}
#promo-itinerary-modal .promo-itinerary-text .promo-itinerary-note{color:#c4bdca!important;-webkit-text-fill-color:#c4bdca!important;border-color:#ffffff25!important;font-size:11px!important}
#promo-itinerary-modal .journey-rail{position:absolute;right:4px;top:12px;bottom:12px;width:34px;pointer-events:none;z-index:2}
#promo-itinerary-modal .journey-rail::before{content:"";position:absolute;top:18px;bottom:18px;left:16px;width:2px;border-radius:2px;background:linear-gradient(#b580ed,#563175,#b580ed);box-shadow:0 0 6px #9656cf80}
#promo-itinerary-modal .journey-marker{position:absolute;top:0;left:0;width:34px;height:48px;transform:translateY(var(--journey-y,0px));will-change:transform;filter:drop-shadow(0 2px 3px #000);display:grid;place-items:center}
#promo-itinerary-modal .journey-marker svg{width:34px;height:40px;overflow:visible}
#promo-itinerary-modal .journey-marker .van,#promo-itinerary-modal .journey-marker .person,#promo-itinerary-modal .journey-marker .party{opacity:0;transition:opacity .16s}
#promo-itinerary-modal .journey-marker[data-stage="walk"] .person,#promo-itinerary-modal .journey-marker[data-stage="drop"] .person,#promo-itinerary-modal .journey-marker[data-stage="board"] .person,#promo-itinerary-modal .journey-marker[data-stage="alight"] .person,#promo-itinerary-modal .journey-marker[data-stage="board"] .van,#promo-itinerary-modal .journey-marker[data-stage="alight"] .van,#promo-itinerary-modal .journey-marker[data-stage="drive"] .van,#promo-itinerary-modal .journey-marker[data-stage="party"] .party{opacity:1}
#promo-itinerary-modal .journey-marker .person{transform:translate(var(--person-x,0px),var(--person-y,0px)) scale(var(--person-scale,1));transform-origin:17px 19px}
#promo-itinerary-modal .journey-marker .wheel{transform-box:fill-box;transform-origin:center;transform:rotate(var(--wheel-angle,0deg))}
#promo-itinerary-modal .journey-marker .leg{transform-box:fill-box;transform-origin:top center}
#promo-itinerary-modal .journey-marker[data-stage="walk"] .leg,#promo-itinerary-modal .journey-marker[data-stage="drop"] .leg{animation:hoeWalk .55s infinite alternate ease-in-out}
#promo-itinerary-modal .journey-marker .leg:nth-child(even){animation-direction:alternate-reverse!important}
#promo-itinerary-modal .journey-marker .dancer{transform-origin:17px 23px;animation:hoeDance .55s infinite alternate ease-in-out}
#promo-itinerary-modal .journey-marker .spark{animation:hoeSpark .7s infinite alternate}
@keyframes hoeWalk{from{transform:rotate(-18deg)}to{transform:rotate(18deg)}}
@keyframes hoeDance{from{transform:rotate(-12deg)}to{transform:rotate(12deg) translateY(-2px)}}
@keyframes hoeSpark{from{opacity:.35}to{opacity:1}}
#promo-itinerary-modal .journey-footer{flex:0 0 auto;display:flex;padding:10px 12px 12px;background:#101014;border-top:1px solid #ae77e444}
#promo-itinerary-modal .journey-footer a{display:block;text-align:center;width:100%;border:1px solid #c092f4;border-radius:22px;padding:10px;background:linear-gradient(180deg,#a365df,#6030a2);color:white!important;-webkit-text-fill-color:white!important;font:750 12px/1.3 Inter,Arial,sans-serif!important;text-decoration:none!important}
#promo-itinerary-modal .journey-footer[hidden]{display:none!important}
@media(prefers-reduced-motion:reduce){#promo-itinerary-modal .journey-rail{display:none}#promo-itinerary-modal .promo-itinerary-scroll{padding-right:12px!important;scrollbar-width:thin!important}#promo-itinerary-modal .promo-itinerary-scroll::-webkit-scrollbar{display:block;width:4px}}
}
@media(min-width:761px){
#promo-itinerary-modal .promo-itinerary-dialog{width:min(720px,100%)!important;max-height:min(88dvh,850px)!important}
#promo-itinerary-modal .promo-itinerary-head{padding:24px 24px!important;min-height:118px}
#promo-itinerary-modal .promo-itinerary-head h2{font-size:32px!important}
#promo-itinerary-modal .promo-itinerary-scroll{padding:18px 56px 24px 24px!important}
#promo-itinerary-modal .promo-day-card{grid-template-columns:82px minmax(0,1fr);padding:16px!important;gap:8px 14px}
#promo-itinerary-modal .promo-day-card .journey-thumb{width:82px;height:78px}
#promo-itinerary-modal .promo-day-card h4{font-size:21px!important}
#promo-itinerary-modal .promo-day-card .promo-day-description{font-size:14px!important}
#promo-itinerary-modal .journey-rail{right:12px}
#promo-itinerary-modal .journey-footer{padding:14px 24px}
#promo-itinerary-modal .journey-footer a{font-size:13px!important}
#promo-itinerary-modal .promo-itinerary-text ol li strong,#promo-itinerary-modal .promo-itinerary-text ol li span{color:#e9e4ee!important;-webkit-text-fill-color:#e9e4ee!important}
#promo-itinerary-modal .journey-rail[hidden]{display:none!important}
@media(prefers-reduced-motion:reduce){#promo-itinerary-modal .promo-itinerary-scroll{padding-right:24px!important}}
}
`;
  document.head.appendChild(style);
  const wrap = document.createElement("div");
  wrap.className = "journey-scroll-wrap";
  scroll.before(wrap); wrap.appendChild(scroll);
  const rail = document.createElement("div");
  rail.className = "journey-rail"; rail.setAttribute("aria-hidden","true");
  rail.innerHTML = '<div class="journey-marker" data-stage="walk"><svg viewBox="0 0 34 40" xmlns="http://www.w3.org/2000/svg"><g class="van"><rect x="1.5" y="10" width="31" height="21" rx="5" fill="#e9e5f2" stroke="#a570db" stroke-width="1.2"/><path d="M3 13h24l4 8H3z" fill="#51356e"/><path d="M9 13v8m7-8v8m7-8v8" stroke="#e9e5f2" stroke-width="1"/><path d="M3 25h27" stroke="#9257d0" stroke-width="2"/><g class="wheel"><circle cx="8" cy="31" r="4" fill="#17121e" stroke="#d9b8fa"/><path d="M6 31h4m-2-2v4" stroke="#fff" stroke-width=".8"/></g><g class="wheel"><circle cx="26" cy="31" r="4" fill="#17121e" stroke="#d9b8fa"/><path d="M24 31h4m-2-2v4" stroke="#fff" stroke-width=".8"/></g></g><g class="person" stroke-linecap="round" stroke-linejoin="round"><circle cx="17" cy="7" r="4" fill="#edc7a8" stroke="#1b1424"/><path d="M13 12q4-3 8 0l1 11h-10z" fill="#a86de4" stroke="#e9d3ff"/><rect x="10" y="13" width="4" height="9" rx="2" fill="#4c3169"/><path d="M21 14l4 7" stroke="#edc7a8" stroke-width="2.5"/><path class="leg" d="M15 24l-3 10" stroke="#d8d4e3" stroke-width="3"/><path class="leg" d="M19 24l4 10" stroke="#d8d4e3" stroke-width="3"/></g><g class="party"><path d="M1 36h32" stroke="#a56ae6" stroke-width="1"/><path d="M4 35l3-9 3 9z" fill="#ef9950"/><path d="M5 34l2-5 2 5z" fill="#ffe3a2"/><g class="dancer" stroke-linecap="round"><circle cx="18" cy="9" r="3.5" fill="#edc7a8"/><path d="M18 14v12" stroke="#bd87ff" stroke-width="6"/><path d="M17 16l-8-7m10 7 8-9" stroke="#edc7a8" stroke-width="2.5"/><path d="M17 26l-5 8m7-8 6 7" stroke="#e8d7fa" stroke-width="3"/></g><path class="spark" d="M4 7h4m-2-2v4M28 18h4m-2-2v4" stroke="#edc5ff" stroke-width="1.5"/><path class="spark" d="M26 1v6l4-2V0z" fill="#e8a8ff"/></g></svg></div>';
  wrap.appendChild(rail); const marker = rail.firstElementChild;
  const footer = document.createElement("div"); footer.className = "journey-footer"; footer.hidden = true; dialog.appendChild(footer);
  const photoFor = value => {
    const name = String(value || "").toLowerCase();
    if (/narkanda/.test(name)) return "/narkanda.jpg";
    if (/sangla|kalpa|kinnaur|chitkul/.test(name)) return "/kinnaur.jpg";
    if (/spiti|tabo|kaza/.test(name)) return "/spiti.jpg";
    if (/manali/.test(name)) return "/manali.jpg";
    return "";
  };
  let frame = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const updateJourney = () => {
    frame = 0;
    if (!modal.classList.contains("is-open") || reduced.matches) return;
    const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
    const top = Math.max(0, scroll.scrollTop);
    const progress = max ? Math.min(1, top / max) : 0;
    const cards = Array.from(content.querySelectorAll(".promo-day-card, ol > li"));
    const partyCard = cards.find(card => /narkanda/i.test(card.textContent) && /party|bonfire/i.test(card.textContent));
    const rect = scroll.getBoundingClientRect();
    const partyAt = partyCard ? Math.max(35, partyCard.getBoundingClientRect().top - rect.top + top) : -1;
    const partyEnd = partyCard ? Math.max(partyAt + 28, partyAt + partyCard.offsetHeight * .72) : -1;
    const boardEnd = Math.min(42, max * .12);
    const dropStart = Math.max(boardEnd + 1, max - Math.min(100,max * .12));
    let stage = "drive", x = 0, y = 0, scale = 1;
    if (top <= 2 || !max) stage = "walk";
    else if (top < boardEnd) {
      stage = "board"; const t = Math.min(1,top / Math.max(1,boardEnd));
      x = -11 * (1-t); y = 4 * (1-t); scale = 1 - .8*t;
    } else if (progress >= .995) stage = "drop";
    else if (top >= dropStart) {
      stage = "alight"; const t = (top-dropStart)/Math.max(1,max-dropStart);
      x = 10*t; y = 4*t; scale = .2+.8*t;
    } else if (partyCard && top >= partyAt && top <= partyEnd) stage = "party";
    marker.dataset.stage = stage;
    marker.style.setProperty("--journey-y", (progress * Math.max(0,rail.clientHeight-marker.offsetHeight)).toFixed(1)+"px");
    marker.style.setProperty("--person-x",x+"px"); marker.style.setProperty("--person-y",y+"px");
    marker.style.setProperty("--person-scale",String(scale)); marker.style.setProperty("--wheel-angle", (top*4)+"deg");
  };
  const scheduleJourney = () => { if (!frame) frame = requestAnimationFrame(updateJourney); };
  scroll.addEventListener("scroll",scheduleJourney,{passive:true});
  window.addEventListener("resize",scheduleJourney,{passive:true});


  const addText = (tag, text, className) => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    content.appendChild(node);
    return node;
  };

  const renderRecord = record => {
    content.replaceChildren();
    const intro = [record.date_label, ...(record.facts || [])].filter(Boolean).join(" · ");
    if (intro) addText("p", intro, "promo-itinerary-intro");
    if (Number(record.price_per_person) > 0) {
      addText("p", "Price: ₹" + Number(record.price_per_person).toLocaleString("en-IN") + " per person");
    }
    addText("h3", "Day-wise itinerary");
    const items = Array.isArray(record.itinerary_items) ? record.itinerary_items : [];
    const days = items.map((item, index) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return {day_number: Number(item.day_number) || index + 1, heading: String(item.heading || ""), overnight_stay: String(item.overnight_stay || ""), description: String(item.description || "")};
      }
      return {day_number: index + 1, heading: "", overnight_stay: "", description: String(item || "")};
    }).filter(day => day.heading || day.overnight_stay || day.description);
    if (days.length) {
      const dayList = document.createElement("div");
      dayList.className = "promo-day-list";
      days.forEach((day, index) => {
        const card = document.createElement("section");
        card.className = "promo-day-card";
        const heading = document.createElement("h4");
        heading.textContent = "DAY " + (day.day_number || index + 1) + (day.heading ? " · " + day.heading : "");
        {
          const route = day.heading.split(/→| to |—/i).pop() || day.heading;
          const src = photoFor(day.overnight_stay || route);
          if (src) {
            const thumb = document.createElement("img");
            thumb.className = "journey-thumb";
            thumb.src = src; thumb.alt = ""; thumb.loading = "lazy"; thumb.decoding = "async";
            thumb.width = 62; thumb.height = 68;
            thumb.addEventListener("error", () => thumb.remove(), {once:true});
            card.appendChild(thumb);
          }
          const label = document.createElement("span");
          label.className = "journey-day-number";
          label.textContent = "DAY " + (day.day_number || index + 1);
          heading.textContent = day.heading || "";
          heading.prepend(label);
        }
        card.appendChild(heading);
        if (day.overnight_stay) {
          const stay = document.createElement("p");
          stay.className = "promo-day-stay";
          stay.textContent = "OVERNIGHT STAY · " + day.overnight_stay;
          card.appendChild(stay);
        }
        if (day.description) {
          const description = document.createElement("p");
          description.className = "promo-day-description";
          description.textContent = day.description;
          card.appendChild(description);
        }
        dayList.appendChild(card);
      });
      content.appendChild(dayList);
    } else {
      addText("p", "The detailed itinerary is being updated. Please contact our team for the latest plan.", "promo-itinerary-empty");
      if (record.itinerary_url) {
        const link = document.createElement("a");
        link.href = record.itinerary_url;
        link.textContent = "Open itinerary page";
        link.className = "promo-itinerary-page-link";
        content.appendChild(link);
      }
    }
    addText("p", "The itinerary may be adjusted according to weather, road and safety conditions.", "promo-itinerary-note");
  };

  const open = (record, trigger) => {
    lastFocus = trigger || document.activeElement;
    if (record) {
      title.textContent = (record.title_line1 + " " + (record.title_emphasis || "") + " " + (record.title_line2 || "")).replace(/\s+/g, " ").trim() + " — Itinerary";
      eyebrow.textContent = record.kicker || "HIMALAYAN ODYSSEY EXPEDITION";
      renderRecord(record);
    } else {
      title.textContent = fallbackTitle;
      eyebrow.textContent = fallbackEyebrow;
      content.innerHTML = fallback;
    }
    let cover = photoFor(record ? [record.title_line1, record.title_line2, record.title_emphasis].join(" ") : "spiti") || "/spiti.jpg";
    if (record?.cover_image) {
      try { const url = new URL(record.cover_image,location.href); if (url.protocol==="https:" || url.origin===location.origin) cover=url.href; } catch (_) {}
    }
    head.style.setProperty("--journey-cover", "url("+JSON.stringify(cover)+")");
    rail.hidden = !content.querySelector(".promo-day-card, ol > li");
    footer.replaceChildren(); footer.hidden = true;
    if (record && record.cta_url) {
      try {
        const url = new URL(record.cta_url, location.href);
        if (url.protocol === "https:" && ["wa.me","api.whatsapp.com","web.whatsapp.com"].includes(url.hostname)) {
          const cta = document.createElement("a");
          cta.href = url.href; cta.target = "_blank"; cta.rel = "noopener noreferrer";
          cta.textContent = "ENQUIRE ON WHATSAPP";
          footer.appendChild(cta); footer.hidden = false;
        }
      } catch (_) {}
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("promo-itinerary-modal-open");
    scroll.scrollTop = 0;
    closeButton.focus({preventScroll:true});
    scheduleJourney();
  };

  const close = () => {
    requestVersion++;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("promo-itinerary-modal-open");
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus({preventScroll:true});
  };


  // Reuse one mobile itinerary renderer for all existing itinerary card actions.
  const parsePackageDays = value => {
    const raw = String(value || "").replace(/\r\n?/g,"\n").trim();
    if (!raw) return [];
    const blocks = /^Day\s*\d+/im.test(raw) ? raw.split(/\n(?=\s*Day\s*\d+\b)/i) : raw.split(/\n\s*\n/);
    return blocks.map((block,index) => {
      const lines = block.trim().split("\n");
      const first = (lines.shift() || "").trim();
      const match = first.match(/^Day\s*(\d+)\s*[-–—·:.)]?\s*(.*)$/i);
      const stayIndex = lines.findIndex(line => /^Stay:/i.test(line.trim()));
      const descriptionIndex = lines.findIndex(line => /^Description:/i.test(line.trim()));
      const stay = stayIndex < 0 ? "" : lines[stayIndex].trim().replace(/^Stay:\s*/i,"");
      const description = (descriptionIndex >= 0
        ? [lines[descriptionIndex].trim().replace(/^Description:\s*/i,""),...lines.slice(descriptionIndex+1).filter((_,i)=>i+descriptionIndex+1!==stayIndex)]
        : [...(match ? [] : [first]),...lines.filter((_,i)=>i!==stayIndex)]).join("\n").trim();
      return {day_number:match ? Number(match[1]) : index+1, heading:match ? match[2] : "", overnight_stay:stay, description};
    }).filter(day=>day.heading || day.overnight_stay || day.description);
  };
  const enquiry = name => "https://wa.me/919816929669?text="+encodeURIComponent("Hello Himalayan Odyssey Expedition, I am interested in "+name+". Please share dates, availability and booking details.");
  const packageToPromo = (record, label) => ({
    title_line1:record?.name || record?.destination || label, kicker:"HIMALAYAN ODYSSEY EXPEDITION",
    facts:[], itinerary_items:parsePackageDays(record?.itinerary),
    cover_image:record?.image_url || record?.cover_image || "", cta_url:enquiry(record?.name || label)
  });
  const itineraryToPromo = (record, days, label) => ({
    title_line1:record?.title || label, kicker:"HIMALAYAN ODYSSEY EXPEDITION", facts:[],
    cover_image:record?.cover_image || "",
    itinerary_items:(days || []).map(day=>({day_number:day.day_number,heading:day.title,overnight_stay:day.overnight_location,description:day.description})),
    cta_url:enquiry(record?.title || label)
  });
  const loadPublishedDays = async id => {
    if (!id || typeof db === "undefined" || !db) return null;
    const result = await db.from("itineraries").select("id,title,cover_image").eq("id",id).eq("published",true).maybeSingle();
    if (result.error || !result.data) return null;
    const days = await db.from("itinerary_days").select("day_number,title,description,overnight_location").eq("itinerary_id",id).order("day_number",{ascending:true});
    if (days.error) return null;
    return {record:result.data, days:days.data || []};
  };
  let requestVersion = 0;
  document.addEventListener("click", async event => {
    if (!window.matchMedia("(max-width:760px)").matches || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a.package-itinerary-link, #itineraryList .itinerary-card-actions a.btn");
    if (!link) return;
    const card = link.closest("#packageList .package-slide[data-package-id], #itineraryList .itinerary-slide");
    if (!card || !/^(view itinerary|explore full itinerary)\b/i.test(link.textContent.trim())) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const version = ++requestVersion;
    const label = card.querySelector("h3")?.textContent.trim() || "Travel Itinerary";
    const packageId = card.dataset.packageId;
    let record = packageId ? (window.hoePackageRecords || []).find(row=>String(row.id)===String(packageId)) : null;
    let adapted = packageId ? packageToPromo(record,label) : itineraryToPromo(null,[],label);
    open(adapted,link);
    if (adapted.itinerary_items.length) return;
    const empty = content.querySelector(".promo-itinerary-empty");
    if (empty) empty.textContent = "Loading itinerary…";
    try {
      if (packageId && !record && typeof db !== "undefined" && db) {
        const fetched = await db.from("packages").select("*").eq("id",packageId).maybeSingle();
        if (!fetched.error && fetched.data) {
          record=fetched.data; adapted=packageToPromo(record,label);
        }
      }
      if (!adapted.itinerary_items.length) {
        const url = new URL(link.href,location.href);
        if (url.origin===location.origin && url.pathname==="/itinerary.html") {
          const published = await loadPublishedDays(url.searchParams.get("id"));
          if (published) {
            const linked = itineraryToPromo(published.record,published.days,label);
            adapted = packageId ? {...adapted,itinerary_items:linked.itinerary_items,cover_image:adapted.cover_image||linked.cover_image} : linked;
          }
        }
      }
    } catch (error) { console.warn("Itinerary could not be loaded",error); }
    if (version===requestVersion && modal.classList.contains("is-open")) open(adapted,link);
  },true);

  track.addEventListener("click", event => {
    const trigger = event.target.closest(".mobile-departure-itinerary");
    if (!trigger) return;
    event.preventDefault();
    const card = trigger.closest(".mobile-next-departure");
    const id = card && card.dataset.promoId;
    const records = Array.isArray(window.heroPromoRecords) ? window.heroPromoRecords : [];
    const record = records.find(item => String(item.id) === String(id || trigger.dataset.itineraryPromo));
    requestVersion++;
    // The database-backed record is preferred. On desktop, preserve the
    // second card's own static itinerary if promotions have not loaded yet.
    let selected = record || null;
    if (!selected && window.matchMedia("(min-width:761px)").matches && card) {
      const rows = Array.from(card.querySelectorAll(".mobile-departure-itinerary-list > p"));
      if (rows.length) {
        const items = rows.map((row,index) => {
          const day = row.querySelector("strong");
          const description = row.textContent.slice(day ? day.textContent.length : 0).trim();
          return {day_number:index+1,heading:description,description:""};
        });
        selected = {
          title_line1:card.querySelector("h2")?.innerText.replace(/\s+/g," ").trim() || "Group Tour",
          date_label:card.querySelector(".mobile-departure-date")?.textContent.trim(),
          facts:Array.from(card.querySelectorAll(".mobile-departure-facts span"),item=>item.textContent.trim()),
          itinerary_items:items,
          cover_image:card.querySelector("img.hoe-promo-thumb")?.getAttribute("src"),
          cta_url:card.querySelector('a[href*="wa.me/"]')?.href
        };
      }
    }
    open(selected, trigger);
  });

  closeButton.addEventListener("click", close);
  modal.addEventListener("click", event => {
    if (event.target === modal) close();
  });
  document.addEventListener("keydown", event => {
    if (modal.classList.contains("is-open") && event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });
})();