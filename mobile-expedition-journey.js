(() => {
  "use strict";
  const hero=document.getElementById("home"),panel=document.getElementById("hoeExpeditionJourney"),track=document.getElementById("heroPromoTrack");
  if(!hero||!panel||!track)return;
  const mobile=matchMedia("(max-width:760px)"),reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const road=panel.querySelector(".journey-route"),vehicle=panel.querySelector(".journey-vehicle");
  const markers=Array.from(panel.querySelectorAll(".journey-marker"));
  const stamp=panel.querySelector(".journey-stamp"),stampText=stamp.querySelector("text");
  if(!road||!vehicle||!markers.length)return;
  // Schematic destination highlights, not a navigation map or a promise of included stops.
  const circuit=["Chandigarh","Shimla","Narkanda","Kalpa","Tabo","Kaza"];
  const themes={
    winter:{label:"WINTER SPITI",stops:circuit},
    kinnaur:{label:"KINNAUR & SPITI",stops:circuit},
    newyear:{label:"NEW YEAR SPITI",stops:circuit},
    narkanda:{label:"NARKANDA",stops:["","","Narkanda","","",""]},
    generic:{label:"HIMALAYAN JOURNEY",stops:["","","","","",""]}
  };
  function classify(title){
    const n=String(title||"").toLowerCase();
    if(n.includes("new year")&&n.includes("spiti"))return "newyear";
    if(n.includes("kinnaur")&&n.includes("spiti"))return "kinnaur";
    if(n.includes("spiti"))return "winter";
    if(n.includes("narkanda"))return "narkanda";
    return "generic";
  }
  let activeTheme="",current=-1,frame=0,elapsed=0,last=0,visible=true,scrollPending=false,depthPending=false;
  let resumeTimer = 0;
  const stops = markers.map(marker => {
    const circle = marker.querySelector("circle");
    return {x: Number(circle.getAttribute("cx")), y: Number(circle.getAttribute("cy"))};
  });
  const total=road.getTotalLength();
  function activeCard(){
    const cards=Array.from(track.querySelectorAll(".hero-promo-slide"));
    if(!cards.length)return null;
    const bounds=track.getBoundingClientRect(),center=bounds.left+bounds.width/2;
    let best=cards[0],distance=Infinity;
    for(const card of cards){const r=card.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-center);if(d<distance){distance=d;best=card;}}
    return best.querySelector("h2");
  }
  function sync(){
    scrollPending=false;if(!mobile.matches)return;
    const next=classify(activeCard()?.textContent);
    if(next===activeTheme)return;
    activeTheme=next;panel.dataset.theme=next;
    markers.forEach((m,i)=>{m.querySelector("text").textContent=themes[next].stops[i];m.style.display=themes[next].stops[i]?"":"none";});
    current=-1;draw(elapsed);
  }
  function scheduleSync(){if(!scrollPending&&mobile.matches){scrollPending=true;requestAnimationFrame(sync);}}
  // Illustrative weather follows vehicle position in both directions, not a forecast.
  function weatherAt(x,theme){
    if(theme==="narkanda"||theme==="generic")return x<=62?"sunny":"clear";
    if(x>152.05)return "snow";
    return x<=62?"sunny":"clear";
  }
  function draw(time){
    const t=(time%14000)/14000;
    const progress=t<.5?t*2:(1-t)*2;
    const p=road.getPointAtLength(progress*total);
    const weather=weatherAt(p.x,activeTheme);
    if(panel.dataset.weather!==weather)panel.dataset.weather=weather;
    vehicle.setAttribute("transform","translate("+p.x.toFixed(2)+" "+p.y.toFixed(2)+") scale("+(t<.5?1:-1)+" 1)");
    let nearest=-1,best=Infinity;
    stops.forEach((stop, i) => {
      if (!themes[activeTheme].stops[i]) return;
      const distance = (p.x - stop.x) ** 2 + (p.y - stop.y) ** 2;
      if (distance < best) { nearest = i; best = distance; }
    });
    if(nearest!==current){current=nearest;markers.forEach((m,i)=>m.classList.toggle("is-current",i===nearest));stampText.textContent=nearest>=0?themes[activeTheme].stops[nearest].toUpperCase():"EXPLORE";stamp.classList.toggle("is-stamped",nearest>=0);}
  }
  function canRun(){return mobile.matches&&!reduced.matches&&!resumeTimer&&visible&&!document.hidden&&!document.body.classList.contains("promo-itinerary-modal-open");}
  function tick(now) {
    frame = 0;
    if (!canRun()) { last = 0; panel.dataset.running = "false"; return; }
    if (!last || now - last >= 1000 / 30 - 1) {
      if (last) elapsed += Math.min(now - last, 100);
      last = now;
      draw(elapsed);
    }
    frame = requestAnimationFrame(tick);
  }
  function refresh(){const run=canRun();panel.dataset.running=String(run);if(run&&!frame){last=0;frame=requestAnimationFrame(tick);}else if(!run&&frame){cancelAnimationFrame(frame);frame=0;last=0;}if(mobile.matches){sync();if(reduced.matches){elapsed=0;draw(0);panel.style.setProperty("--journey-depth","0px");}}}
  function parallax(){depthPending=false;if(!mobile.matches||reduced.matches||!visible)return;const y=Math.max(-8,Math.min(8,(panel.getBoundingClientRect().top-innerHeight*.6)*.035));panel.style.setProperty("--journey-depth",y.toFixed(1)+"px");}
  function scheduleDepth(){if(!depthPending&&mobile.matches&&!reduced.matches&&visible){depthPending=true;requestAnimationFrame(parallax);}}
  track.addEventListener("scroll",scheduleSync,{passive:true});
  function onPageScroll() {
    if (!mobile.matches || reduced.matches || !visible) return;
    if (!resumeTimer) {
      cancelAnimationFrame(frame);
      frame = last = 0;
      panel.dataset.running = "false";
    }
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      resumeTimer = 0;
      refresh();
      scheduleDepth();
    }, 150);
  }
  addEventListener("scroll",onPageScroll,{passive:true});
  addEventListener("resize",()=>{refresh();scheduleDepth();},{passive:true});
  document.addEventListener("visibilitychange",refresh);
  if("MutationObserver"in window){
    new MutationObserver(scheduleSync).observe(track,{childList:true});
    new MutationObserver(refresh).observe(document.body,{attributes:true,attributeFilter:["class"]});
  }
  if("IntersectionObserver"in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();},{threshold:0}).observe(panel);
  [mobile,reduced].forEach(q=>{if(q.addEventListener)q.addEventListener("change",refresh);else if(q.addListener)q.addListener(refresh);});
  if(window.heroPromotionsReady)Promise.resolve(window.heroPromotionsReady).then(scheduleSync,scheduleSync);
  refresh();
})();
