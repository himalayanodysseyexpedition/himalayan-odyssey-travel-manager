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
 let vehicles=[],vehicleDays=1;
 const hasPlace=n=>Object.prototype.hasOwnProperty.call(nights,n);
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
 $("htpStart").min=today();
 function renderLocationOptions(){
  const select=$("htpLocationSelect"),available=names.filter(n=>!hasPlace(n));
  select.innerHTML='<option value="">Select a destination</option>'+available.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");
  select.disabled=available.length===0;
  select.value="";
 }
 function renderDestinations(){
  $("htpDestinations").innerHTML=names.filter(n=>hasPlace(n)).map(n=>'<div class="htp-destination" data-destination="'+n+'"><div><strong>'+n+'</strong><span class="htp-rate"><strong>'+money(rates[n])+'</strong><small>stay + food · per person / night</small></span></div><div class="htp-stepper"><span class="htp-night-label">Nights</span><button type="button" data-place="'+n+'" data-delta="-1" aria-label="Remove one night in '+n+'">−</button><output id="htpNight-'+n+'">'+nights[n]+'</output><button type="button" data-place="'+n+'" data-delta="1" aria-label="Add one night in '+n+'">+</button><button type="button" class="htp-remove" data-remove-place="'+n+'" aria-label="Delete '+n+'">×</button></div></div>').join("");
  $("htpSelectedWrap").hidden=Object.keys(nights).length===0;
  renderLocationOptions();
 }
 function setTravellers(value){const count=Math.min(30,Math.max(1,Number(value)||1));$("htpTravellers").value=String(count);$("htpTravellersOutput").textContent=String(count);}
 setTravellers(1);
 root.addEventListener("click",e=>{const b=e.target.closest("[data-travellers-delta]");if(!b)return;setTravellers(Number($("htpTravellers").value)+Number(b.dataset.travellersDelta));calculate();});
 function totalNights(){return Object.values(nights).reduce((a,b)=>a+b,0)}
 function tripDays(){const a=$("htpStart").value,b=$("htpEnd").value;if(!a||!b||b<=a)return 0;return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/86400000)}
 function selectedVehicle(){return vehicles.find(v=>String(v.id)===$("htpVehicle").value)||null}
 function calculate(){
  const people=Number($("htpTravellers").value)||1,nn=totalNights(),days=tripDays();
  const stay=names.reduce((sum,n)=>sum+(nights[n]||0)*rates[n]*people,0),v=selectedVehicle();
  const capacity=Math.max(1,Number(v?.capacity)||1),count=v?Math.ceil(people/capacity):0;
  const cab=v?Number(v.price)*vehicleDays*count:0;
  const validDates=days>0,valid=nn>0&&validDates;
  $("htpTotalNights").textContent=nn+" nights";
  $("htpTripDays").textContent=days?days+" days":"Select dates";
  $("htpStayTotal").textContent=money(stay);
  $("htpCabTotal").textContent=v?(cab?money(cab):"Confirm rate"):"Not selected";
  $("htpVehicleCount").textContent=v?count+" × "+v.title+" · "+vehicleDays+" days":"Select a vehicle";
  renderVehicleSelection();
  $("htpGrandTotal").textContent=v&&cab?money(stay+cab):money(stay);
  $("htpPerPerson").textContent=people+" travellers · "+money((stay+cab)/people)+" per person"+(!v||!cab?" (cab not included)":"");
  $("htpCalculate").disabled=!valid;
  $("htpCalculate").dataset.stay=String(stay);$("htpCalculate").dataset.cab=String(cab);
  $("htpCalculate").dataset.total=String(stay+cab);$("htpCalculate").dataset.days=String(days);
 }
 $("htpLocationSelect").addEventListener("change",e=>{
  const n=e.target.value;
  if(!names.includes(n)||hasPlace(n))return;
  nights[n]=1;
  renderDestinations();
  calculate();
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
 ["htpStart","htpEnd"].forEach(id=>$(id).addEventListener("change",calculate));
 $("htpVehicle").addEventListener("change",()=>{vehicleDays=tripDays()||1;renderVehicleSelection();calculate()});
 $("htpVehicleDays").addEventListener("input",e=>{vehicleDays=Math.min(30,Math.max(1,Number(e.target.value)||1));renderVehicleSelection();calculate()});
 root.addEventListener("click",e=>{const b=e.target.closest("[data-vehicle-days]");if(!b)return;vehicleDays=Math.min(30,Math.max(1,vehicleDays+Number(b.dataset.vehicleDays)));renderVehicleSelection();calculate()});
 $("htpCalculate").addEventListener("click",()=>{
  const places=names.filter(n=>nights[n]>0),people=Number($("htpTravellers").value)||1,v=selectedVehicle(),days=tripDays();
  if(!places.length||!days){$("htpStatus").textContent="Add a destination and select valid travel dates.";return}
  const stay=Number($("htpCalculate").dataset.stay),cab=Number($("htpCalculate").dataset.cab);
  const lines=["Hello Himalayan Odyssey Expedition! Please prepare my trip quotation.","Destinations: "+places.map(n=>n+" ("+nights[n]+" nights)").join(", "),"Dates: "+$("htpStart").value+" to "+$("htpEnd").value,"Duration: "+days+" days; selected stay: "+totalNights()+" nights","Travellers: "+people,"Stay estimate: "+money(stay),"Vehicle: "+(v?v.title+" × "+Math.ceil(people/Math.max(1,Number(v.capacity)||1)):"Please suggest a suitable vehicle"),"Vehicle rental days: "+(v?vehicleDays:"Not selected"),"Daily vehicle rate: "+(v?money(v.price):"Please quote"),"Cab estimate: "+(v&&cab?money(cab):"Please quote"),"Estimated total: "+(v&&cab?money(stay+cab):money(stay)+" + cab quote"),"Please confirm availability, route feasibility and final inclusions."];
  const url="https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(lines.join("\n"));
  const w=window.open(url,"_blank");if(!w)window.location.href=url;
  $("htpStatus").textContent="Trip estimate prepared. Confirm final cab and stay rates with our team.";
 });
 function renderVehicleSelection(){
  const card=$("htpVehicleSelection"),v=selectedVehicle();
  if(!card)return;
  card.hidden=!v;
  if(!v)return;
  $("htpSelectedVehicleName").textContent=v.title;
  $("htpSelectedVehicleRate").textContent=money(v.price)+" / day";
  $("htpVehicleDays").value=String(vehicleDays);
  $("htpVehicleDaysOutput").textContent=String(vehicleDays);
 }
 function renderVehicles(){
  const s=$("htpVehicle"),old=s.value;
  s.innerHTML='<option value="">Choose a vehicle</option>'+vehicles.map(v=>'<option value="'+esc(v.id)+'">'+esc(v.title)+'</option>').join("");
  if(vehicles.some(v=>String(v.id)===old))s.value=old;
  $("htpVehicleHint").textContent=vehicles.length?"Choose a vehicle and set how many days you need it.":"No active cab rates loaded. Stay estimate is available; request a cab quote on WhatsApp.";
  renderVehicleSelection();
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