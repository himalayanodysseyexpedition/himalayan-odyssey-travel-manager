
"use strict";
(()=>{
 const root=document.getElementById("plan-your-trip")||document.getElementById("homeTripPlanner");
 if(!root)return;
 const API="https://ynkoiuyjevclypumnyes.supabase.co/rest/v1/marketplace_services?select=id,title,price,price_unit,capacity,inventory,destination&category=eq.cab&is_active=eq.true&order=sort_order.asc,created_at.desc";
 const KEY="sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
 const WHATSAPP="919816929669";
 const rates={"Narkanda":1300,"Shimla":1300,"Kufri":1300,"Sangla":1600,"Kalpa":1500,"Tabo":1600,"Kaza":1500,"Manali":1300,"Jibhi":1400,"Kasol":1300};
 const names=Object.keys(rates);
 const nights=Object.fromEntries(names.map(n=>[n,0]));
 const $=id=>root.querySelector("#"+id);
 const money=n=>"₹"+Math.round(Number(n)||0).toLocaleString("en-IN");
 let vehicles=[];
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const dateInput=$("htpStart");
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
 dateInput.min=today();
 function renderLocationOptions(){
  const select=$("htpLocationSelect"),added=names.filter(n=>Object.prototype.hasOwnProperty.call(nights,n)&&nights[n]>=0&&root.querySelector('[data-destination="'+n+'"]'));
  const current=select.value;
  select.innerHTML='<option value="">Choose a destination</option>'+names.filter(n=>!root.querySelector('[data-destination="'+n+'"]')).map(n=>'<option value="'+n+'">'+n+'</option>').join("");
  if(current&&!root.querySelector('[data-destination="'+current+'"]'))select.value=current;
 }
 function renderDestinations(){
  $("htpDestinations").innerHTML=names.filter(n=>root.querySelector('[data-destination="'+n+'"]')).map(n=>'<div class="htp-destination" data-destination="'+n+'"><div><strong>'+n+'</strong><span class="htp-rate">'+money(rates[n])+' / person / night</span></div><div class="htp-stepper"><button type="button" data-place="'+n+'" data-delta="-1" aria-label="Remove one night in '+n+'" '+(nights[n]===1?'disabled':'')+'>−</button><output id="htpNight-'+n+'">'+nights[n]+'</output><button type="button" data-place="'+n+'" data-delta="1" aria-label="Add one night in '+n+'">+</button><button type="button" class="htp-remove" data-remove-place="'+n+'" aria-label="Remove '+n+' from trip">×</button></div></div>').join("");
 }
 $("htpLocationSelect").addEventListener("change",()=>{
  const n=$("htpLocationSelect").value;if(!n)return;
  nights[n]=1;
  renderDestinations();renderLocationOptions();$("htpLocationSelect").value="";
  calculate();
 });
 $("htpTravellers").innerHTML=Array.from({length:30},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+' '+(i===0?"traveller":"travellers")+'</option>').join("");
 function dayCount(){const start=$("htpStart").value,end=$("htpEnd").value;if(start&&end&&end>start){const a=new Date(start+"T00:00:00"),b=new Date(end+"T00:00:00");return Math.max(1,Math.round((b-a)/86400000));}return Math.max(1,totalNights()+1);}
 function totalNights(){return Object.values(nights).reduce((a,b)=>a+b,0);}
 function selectedPlaces(){return names.filter(n=>nights[n]>0);}
 function selectedVehicle(){return vehicles.find(v=>v.id===$("htpVehicle").value)||null;}
 function calculate(){
  const people=Number($("htpTravellers").value)||1,nn=totalNights(),days=dayCount(),stay=names.reduce((sum,n)=>sum+nights[n]*rates[n]*people,0),v=selectedVehicle();
  const capacity=Math.max(1,Number(v?.capacity)||1),count=v?Math.ceil(people/capacity):0,cab=v&&v.price_unit==="per_vehicle_day"?Number(v.price)*days*count:0;
  const total=stay+cab;
  $("htpTotalNights").textContent=nn+" nights";
  $("htpTripDays").textContent=days+" days";
  $("htpStayTotal").textContent=money(stay);
  $("htpCabTotal").textContent=v?money(cab):"Not selected";
  $("htpVehicleCount").textContent=v?count+" × "+v.title:"Select a vehicle";
  $("htpGrandTotal").textContent=v?money(total):money(stay)+" + cab quote";
  $("htpPerPerson").textContent=people+" travellers · "+money((v?total:stay)/people)+" per person"+(v?"":" (cab excluded)");
  $("htpCalculate").disabled=nn===0||!$("htpStart").value||!$("htpEnd").value||$("htpEnd").value<=$("htpStart").value;
  $("htpCalculate").dataset.total=String(total);
  $("htpCalculate").dataset.stay=String(stay);
  $("htpCalculate").dataset.cab=String(cab);
  $("htpCalculate").dataset.days=String(days);
 }
 function renderVehicleOptions(){
  const select=$("htpVehicle"),old=select.value;
  select.innerHTML='<option value="">Choose a vehicle</option>'+vehicles.map(v=>'<option value="'+esc(v.id)+'">'+esc(v.title)+' · '+(Number(v.capacity)||"—")+' seats · '+money(v.price)+' / vehicle / day</option>').join("");
  if(vehicles.some(v=>v.id===old))select.value=old;
  $("htpVehicleHint").textContent=vehicles.length?"Vehicle count is suggested from passenger count and listed seat capacity.":"No published cab rates are available right now. You can still calculate your stay estimate and request a cab quote.";
  calculate();
 }
 root.addEventListener("click",e=>{
  const remove=e.target.closest("[data-remove-place]");
  if(remove){delete nights[remove.dataset.removePlace];renderDestinations();renderLocationOptions();calculate();return;}
  const b=e.target.closest("[data-place][data-delta]");if(!b)return;
  const n=b.dataset.place;nights[n]=Math.max(1,nights[n]+Number(b.dataset.delta));
  $("htpNight-"+n).textContent=String(nights[n]);
  root.querySelectorAll('[data-place="'+n+'"]').forEach(x=>{if(x.dataset.delta==="-1")x.disabled=nights[n]===1;});
  calculate();
 });
 ["htpTravellers","htpVehicle","htpStart","htpEnd"].forEach(id=>$(id).addEventListener("change",calculate));
 $("htpCalculate").addEventListener("click",()=>{
  const people=Number($("htpTravellers").value)||1,v=selectedVehicle(),places=selectedPlaces();
  if(!places.length){$("htpStatus").textContent="Please add at least one night to a destination.";return;}
  if(!$("htpStart").value||!$("htpEnd").value||$("htpEnd").value<=$("htpStart").value){$("htpStatus").textContent="Please select a valid departure and return date.";return;}
  const summary=["Hello Himalayan Odyssey Expedition! I would like a trip estimate.","Destinations: "+places.map(n=>n+" ("+nights[n]+" nights)").join(", "),"Travel dates: "+$("htpStart").value+" to "+$("htpEnd").value,"Duration: "+dayCount()+" days / "+totalNights()+" selected stay nights","Travellers: "+people,"Vehicle: "+(v?v.title+" × "+Math.ceil(people/Math.max(1,Number(v.capacity)||1)):"Please suggest a suitable vehicle"),"Stay estimate: "+money(Number($("htpCalculate").dataset.stay)),"Cab estimate: "+(v?money(Number($("htpCalculate").dataset.cab)):"To be quoted"),"Estimated total: "+$("htpGrandTotal").textContent,"Per person: "+$("htpPerPerson").textContent,"Please confirm availability, route feasibility and final inclusions."].join("\n");
  window.open("https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(summary),"_blank","noopener");
  $("htpStatus").textContent="Your trip summary has been prepared for WhatsApp.";
 });
 async function loadVehicles(){
  try{
   const r=await fetch(API,{headers:{apikey:KEY,Authorization:"Bearer "+KEY}});
   if(!r.ok)throw new Error("Cab catalogue unavailable");
   const rows=await r.json();
   vehicles=Array.isArray(rows)?rows.filter(v=>Number(v.price)>0&&v.price_unit==="per_vehicle_day"&&Number(v.capacity)>0):[];
   renderVehicleOptions();
  }catch(error){console.warn("Homepage trip planner cab catalogue:",error);vehicles=[];renderVehicleOptions();}
 }
 renderLocationOptions();calculate();loadVehicles();
})();
