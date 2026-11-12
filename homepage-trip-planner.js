"use strict";
(()=>{
 const root=document.getElementById("plan-your-trip")||document.getElementById("homeTripPlanner");
 if(!root)return;
 const API="https://ynkoiuyjevclypumnyes.supabase.co/rest/v1/marketplace_services?select=id,title,price,price_unit,capacity,inventory,destination&category=eq.cab&is_active=eq.true&order=sort_order.asc,created_at.desc";
 const KEY="sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
 const WHATSAPP="919816929669";
 const rates={"Narkanda":1300,"Shimla":1300,"Kufri":1300,"Sangla":1600,"Kalpa":1500,"Tabo":1600,"Kaza":1500,"Manali":1300,"Jibhi":1400,"Kasol":1300};
 const names=Object.keys(rates),nights={};
 const $=id=>root.querySelector("#"+id);
 const money=n=>"₹"+Math.round(Number(n)||0).toLocaleString("en-IN");
 let vehicles=[];
 const hasPlace=n=>Object.prototype.hasOwnProperty.call(nights,n);
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
 $("htpStart").min=today();
 function closeLocationMenu(){
  const menu=$("htpLocationMenu"),toggle=$("htpLocationToggle");
  menu.hidden=true;menu.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");
 }
 function renderLocationOptions(){
  const menu=$("htpLocationMenu"),available=names.filter(n=>!hasPlace(n));
  menu.innerHTML=available.length?available.map(n=>'<button type="button" class="htp-location-option" role="option" aria-label="Add '+esc(n)+'" data-add-destination="'+esc(n)+'"><span>'+esc(n)+'</span><span class="htp-option-arrow" aria-hidden="true">↗</span></button>').join(""):'<p class="htp-location-empty">All destinations added</p>';
  if(!available.length)closeLocationMenu();
 }
 function renderDestinations(){
  $("htpDestinations").innerHTML=names.filter(n=>hasPlace(n)).map(n=>'<div class="htp-destination" data-destination="'+n+'"><div><strong>'+n+'</strong><span class="htp-rate"><strong>'+money(rates[n])+'</strong><small>stay + food · per person / night</small></span></div><div class="htp-stepper"><span class="htp-night-label">Nights</span><button type="button" data-place="'+n+'" data-delta="-1" aria-label="Remove one night in '+n+'">−</button><output id="htpNight-'+n+'">'+nights[n]+'</output><button type="button" data-place="'+n+'" data-delta="1" aria-label="Add one night in '+n+'">+</button><button type="button" class="htp-remove" data-remove-place="'+n+'" aria-label="Delete '+n+'">×</button></div></div>').join("");
  $("htpSelectedWrap").hidden=Object.keys(nights).length===0;
  renderLocationOptions();
 }
 $("htpTravellers").innerHTML=Array.from({length:30},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+' '+(i===0?"traveller":"travellers")+'</option>').join("");
 function totalNights(){return Object.values(nights).reduce((a,b)=>a+b,0)}
 function tripDays(){const a=$("htpStart").value,b=$("htpEnd").value;if(!a||!b||b<=a)return 0;return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/86400000)}
 function selectedVehicle(){return vehicles.find(v=>String(v.id)===$("htpVehicle").value)||null}
 function calculate(){
  const people=Number($("htpTravellers").value)||1,nn=totalNights(),days=tripDays();
  const stay=names.reduce((sum,n)=>sum+(nights[n]||0)*rates[n]*people,0),v=selectedVehicle();
  const capacity=Math.max(1,Number(v?.capacity)||1),count=v?Math.ceil(people/capacity):0;
  const unit=String(v?.price_unit||"").toLowerCase();
  const cab=v&&["per_vehicle_day","vehicle_day","per_day","day"].includes(unit)?Number(v.price)*days*count:0;
  const validDates=days>0,valid=nn>0&&validDates;
  $("htpTotalNights").textContent=nn+" nights";
  $("htpTripDays").textContent=days?days+" days":"Select dates";
  $("htpStayTotal").textContent=money(stay);
  $("htpCabTotal").textContent=v?(cab?money(cab):"Confirm rate"):"Not selected";
  $("htpVehicleCount").textContent=v?count+" × "+v.title:"Select a vehicle";
  $("htpGrandTotal").textContent=v&&cab?money(stay+cab):money(stay);
  $("htpPerPerson").textContent=people+" travellers · "+money((stay+cab)/people)+" per person"+(!v||!cab?" (cab not included)":"");
  $("htpCalculate").disabled=!valid;
  $("htpCalculate").dataset.stay=String(stay);$("htpCalculate").dataset.cab=String(cab);
  $("htpCalculate").dataset.total=String(stay+cab);$("htpCalculate").dataset.days=String(days);
 }
 $("htpLocationToggle").addEventListener("click",()=>{
  const menu=$("htpLocationMenu"),open=$("htpLocationToggle").getAttribute("aria-expanded")==="true";
  if(open){closeLocationMenu();return}
  renderLocationOptions();menu.hidden=false;menu.classList.remove("is-open");
  requestAnimationFrame(()=>menu.classList.add("is-open"));
  $("htpLocationToggle").setAttribute("aria-expanded","true");
 });
 $("htpLocationMenu").addEventListener("click",e=>{
  const option=e.target.closest("[data-add-destination]");if(!option)return;
  const n=option.dataset.addDestination;if(!names.includes(n)||hasPlace(n))return;
  nights[n]=1;closeLocationMenu();renderDestinations();calculate();
 });
 document.addEventListener("click",e=>{
  if(!root.contains(e.target))closeLocationMenu();
 });
 root.addEventListener("keydown",e=>{if(e.key==="Escape")closeLocationMenu()});
 root.addEventListener("click",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  const remove=t.closest("[data-remove-place]");
  if(remove){delete nights[remove.dataset.removePlace];renderDestinations();calculate();return}
  const b=t.closest("[data-place][data-delta]");if(!b)return;
  const n=b.dataset.place,delta=Number(b.dataset.delta);
  nights[n]=Math.max(1,(nights[n]||1)+delta);
  renderDestinations();calculate();
 });
 ["htpTravellers","htpVehicle","htpStart","htpEnd"].forEach(id=>$(id).addEventListener("change",calculate));
 $("htpCalculate").addEventListener("click",()=>{
  const places=names.filter(n=>nights[n]>0),people=Number($("htpTravellers").value)||1,v=selectedVehicle(),days=tripDays();
  if(!places.length||!days){$("htpStatus").textContent="Add a destination and select valid travel dates.";return}
  const stay=Number($("htpCalculate").dataset.stay),cab=Number($("htpCalculate").dataset.cab);
  const lines=["Hello Himalayan Odyssey Expedition! Please prepare my trip quotation.","Destinations: "+places.map(n=>n+" ("+nights[n]+" nights)").join(", "),"Dates: "+$("htpStart").value+" to "+$("htpEnd").value,"Duration: "+days+" days; selected stay: "+totalNights()+" nights","Travellers: "+people,"Stay estimate: "+money(stay),"Vehicle: "+(v?v.title+" × "+Math.ceil(people/Math.max(1,Number(v.capacity)||1)):"Please suggest a suitable vehicle"),"Cab estimate: "+(v&&cab?money(cab):"Please quote"),"Estimated total: "+(v&&cab?money(stay+cab):money(stay)+" + cab quote"),"Please confirm availability, route feasibility and final inclusions."];
  const url="https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(lines.join("\n"));
  const w=window.open(url,"_blank");if(!w)window.location.href=url;
  $("htpStatus").textContent="Trip estimate prepared. Confirm final cab and stay rates with our team.";
 });
 function renderVehicles(){
  const s=$("htpVehicle"),old=s.value;
  s.innerHTML='<option value="">Choose a vehicle</option>'+vehicles.map(v=>'<option value="'+esc(v.id)+'">'+esc(v.title)+" · "+(Number(v.capacity)||"—")+" seats · "+money(v.price)+" / vehicle / day</option>").join("");
  if(vehicles.some(v=>String(v.id)===old))s.value=old;
  $("htpVehicleHint").textContent=vehicles.length?"Vehicle count is calculated using passenger count and seat capacity.":"No active cab rates loaded. Stay estimate is available; request a cab quote on WhatsApp.";
  calculate();
 }
 async function loadVehicles(){
  try{
   const response=await fetch(API,{headers:{apikey:KEY,Authorization:"Bearer "+KEY}});
   if(!response.ok)throw new Error("Cab catalogue HTTP "+response.status);
   const rows=await response.json();
   vehicles=Array.isArray(rows)?rows.filter(v=>Number(v.price)>0&&Number(v.capacity)>0):[];
  }catch(err){console.warn("Trip planner cab rates:",err);vehicles=[]}
  renderVehicles();
 }
 renderDestinations();calculate();loadVehicles();
})();