"use strict";
const SUPABASE_URL="https://ynkoiuyjevclypumnyes.supabase.co";
const SUPABASE_KEY="sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
const WHATSAPP_NUMBER="919816929669";
const REST_HEADERS={apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY};
async function apiRequest(path,options={}){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),options.timeout||15000);
 try{
  const method=options.method||"GET";
  const response=await fetch(SUPABASE_URL+"/rest/v1/"+path,{method,headers:{...REST_HEADERS,"Content-Type":"application/json",...(method==="POST"?{Prefer:"return=minimal"}:{})},body:options.body===undefined?undefined:JSON.stringify(options.body),signal:controller.signal});
  const raw=await response.text();
  if(!response.ok)throw new Error("Supabase API "+response.status+": "+(raw||response.statusText).slice(0,260));
  return raw?JSON.parse(raw):null;
 }catch(error){if(error.name==="AbortError")throw new Error("The catalogue request timed out. Please retry.");throw error;}
 finally{clearTimeout(timer);}
}
const $=id=>document.getElementById(id);
const money=value=>"₹"+(Number(value)||0).toLocaleString("en-IN",{maximumFractionDigits:0});
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let services=[],cart=[],category="all",serviceDays={};
const unitLabel={per_vehicle_day:"per vehicle / day",per_person_night:"per person / night",per_person:"per person"};
const categoryLabel={cab:"Cab",hotel:"Hotel / Homestay",package:"Tour Package"};
function priceFor(service,line){
 const price=Number(service.price)||0;
 if(service.category==="cab")return price*line.days*line.quantity;
 if(service.category==="hotel")return price*line.nights*line.people;
 return price*line.people;
}
function serviceCard(x){
 const available=Number(x.inventory)||0;
 const soldOut=available<1;
 const specs=[x.destination,x.capacity?x.capacity+" seats":null].filter(Boolean).join(" · ");
 return '<article class="service">'+(x.image_url?'<img src="'+esc(x.image_url)+'" alt="'+esc(x.title)+'" loading="lazy">':'<div style="height:190px;display:grid;place-items:center;background:#e9eee8;color:#718078">Himalayan Odyssey Expedition</div>')+
 '<div class="service-body"><div class="tag">'+esc(categoryLabel[x.category])+'</div><h3>'+esc(x.title)+'</h3><div class="muted">'+esc(specs)+'</div><p class="desc">'+esc(x.description||"A curated Himalayan travel service.")+'</p><div class="price">'+money(x.price)+' <span class="muted">'+esc(unitLabel[x.price_unit]||"")+'</span></div><p class="muted">'+(soldOut?"Currently unavailable":(x.category==="cab"?"Vehicle quantity can be requested (final availability confirmed)":"Group size: up to "+(x.capacity||available)+" guests"))+'</p><div class="card-actions"><div class="duration-control"><span>'+(x.category==="hotel"?"Nights":"Days")+'</span><div class="stepper"><button type="button" data-day-step="'+x.id+'" data-dir="-1" disabled>−</button><output data-day-value="'+x.id+'">1</output><button type="button" data-day-step="'+x.id+'" data-dir="1">＋</button></div></div><button data-add="'+x.id+'" data-days="1" '+(soldOut?"disabled":"")+'>Add to trip</button></div></div></article>';
}
function renderServices(){
 const query=$("search").value.trim().toLowerCase();
 const filtered=services.filter(x=>(category==="all"||x.category===category)&&(!query||(x.title+" "+x.destination+" "+x.description).toLowerCase().includes(query)));
 $("serviceCards").innerHTML=filtered.length?filtered.map(serviceCard).join(""):'<div class="empty">No services match this search yet. Try another category or destination.</div>';
}
function addToCart(id){
 const service=services.find(x=>x.id===id);if(!service)return;
 const days=Math.max(1,Math.min(100,Number(serviceDays[id])||1));cart.push({key:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()),id:service.id,days,nights:days,people:1,quantity:1});
 renderCart();
}
function changeLine(key,field,value){
 const line=cart.find(x=>x.key===key);if(!line)return;
 const number=Math.max(1,Math.min(100,Number(value)||1));
 line[field]=number;renderCart();
}
function renderCart(){
 if(!cart.length){$("cartItems").innerHTML='<div class="cart-empty">Your cart is empty. Add a service to get started.</div>';$("grandTotal").textContent=money(0);return;}
 let total=0;
 $("cartItems").innerHTML=cart.map(line=>{
  const s=services.find(x=>x.id===line.id);if(!s)return "";
  const amount=priceFor(s,line);total+=amount;
  let fields="";
  if(s.category==="cab")fields='<div class="controls"><label>Days<input type="number" min="1" max="100" value="'+line.days+'" data-line="'+line.key+'" data-field="days"></label><label>Vehicles<input type="number" min="1" max="10" value="'+line.quantity+'" data-line="'+line.key+'" data-field="quantity"></label></div>';
  if(s.category==="hotel")fields='<div class="controls"><label>Nights<input type="number" min="1" max="100" value="'+line.nights+'" data-line="'+line.key+'" data-field="nights"></label><label>Guests<input type="number" min="1" max="100" value="'+line.people+'" data-line="'+line.key+'" data-field="people"></label></div>';
  if(s.category==="package")fields='<div class="controls"><label>Guests<input type="number" min="1" max="'+Math.max(1,Number(s.inventory)||1)+'" value="'+line.people+'" data-line="'+line.key+'" data-field="people"></label></div>';
  return '<div class="cart-line"><div class="line-head"><b>'+esc(s.title)+'</b><button type="button" class="remove" data-remove="'+line.key+'">Remove</button></div><div class="muted">'+esc(s.destination||categoryLabel[s.category])+' · '+money(s.price)+' '+esc(unitLabel[s.price_unit])+'</div>'+fields+'<div class="line-total">'+money(amount)+'</div></div>';
 }).join("");
 $("grandTotal").textContent=money(total);
}
function currentTotal(){return cart.reduce((sum,line)=>{const s=services.find(x=>x.id===line.id);return sum+(s?priceFor(s,line):0);},0);}
function enquiryText(name,phone,date,total){
 const lines=cart.map((line,i)=>{const s=services.find(x=>x.id===line.id);if(!s)return "";let detail=s.category==="cab"?line.days+" day(s), "+line.quantity+" vehicle(s)":s.category==="hotel"?line.nights+" night(s), "+line.people+" guest(s)":line.people+" guest(s)";return (i+1)+". "+s.title+" ("+s.destination+") — "+detail+" — "+money(priceFor(s,line));});
 return ["Hello Himalayan Odyssey Expedition!","I would like to enquire about these selected services.","","Name: "+name,"Phone: "+phone,"Preferred travel date: "+(date||"Not specified"),"","SELECTED SERVICES",...lines,"","ESTIMATED TOTAL: "+money(total),"Please confirm availability, inclusions and final booking details."].join("\n");
}
async function load(){
 const container=$("serviceCards");
 container.innerHTML='<div class="empty" role="status">Loading available services…</div>';
 try{
  const rows=await apiRequest("marketplace_services?select=id,category,title,destination,description,price,price_unit,inventory,capacity,image_url,sort_order,created_at&is_active=eq.true&order=sort_order.asc,created_at.desc");
  services=Array.isArray(rows)?rows:[];
  renderServices();
  if(!services.length)container.innerHTML='<div class="empty">No services are published yet. Please contact us on WhatsApp and we will help plan your trip.</div>';
 }catch(error){
  console.error("Build Your Trip catalogue failed:",error);
  container.innerHTML='<div class="empty"><strong>We could not load the service catalogue.</strong><p>'+esc(error.message||"Please try again.")+'</p><button type="button" class="primary" data-retry-catalogue>Retry loading services</button><p><a href="https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent("Hello Himalayan Odyssey Expedition, please share your available cabs and tour packages.")+'" target="_blank" rel="noopener">Or enquire on WhatsApp</a></p></div>';
 }
}
$("serviceCards").addEventListener("click",e=>{if(e.target.closest("[data-retry-catalogue]"))load();});
$("tabs").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;category=b.dataset.category;$("tabs").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderServices();});
$("search").addEventListener("input",renderServices);
$("serviceCards").addEventListener("click",e=>{const step=e.target.closest("[data-day-step]");if(step){const id=step.dataset.dayStep;const next=Math.max(1,Math.min(100,(Number(serviceDays[id])||1)+Number(step.dataset.dir)));serviceDays[id]=next;const card=step.closest(".service");card.querySelector("[data-day-value]").textContent=next;card.querySelectorAll("[data-day-step]").forEach(x=>{if(x.dataset.dir==="-1")x.disabled=next===1;});card.querySelector("[data-add]").dataset.days=next;return;}const b=e.target.closest("[data-add]");if(b){serviceDays[b.dataset.add]=Number(b.dataset.days)||1;addToCart(b.dataset.add);}});
$("cartItems").addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(b){cart=cart.filter(x=>x.key!==b.dataset.remove);renderCart();}});
$("cartItems").addEventListener("change",e=>{const input=e.target.closest("[data-line][data-field]");if(input)changeLine(input.dataset.line,input.dataset.field,input.value);});
$("guestForm").addEventListener("submit",async e=>{
 e.preventDefault();const button=$("submitEnquiry"),status=$("status");
 if(!cart.length){status.textContent="Please add at least one service to your trip.";return;}
 const name=$("guestName").value.trim(),phone=$("guestPhone").value.trim(),date=$("travelDate").value,total=currentTotal();
 if(!/^[+0-9 ()-]{10,18}$/.test(phone)){status.textContent="Please enter a valid mobile number.";return;}
 const selections=cart.map(line=>{const s=services.find(x=>x.id===line.id);return {service_id:s.id,category:s.category,title:s.title,destination:s.destination,unit_price:Number(s.price),price_unit:s.price_unit,days:line.days,nights:line.nights,people:line.people,vehicles:line.quantity,line_total:priceFor(s,line)};});
 button.disabled=true;status.textContent="Saving your enquiry…";
 try{
  await apiRequest("marketplace_enquiries",{method:"POST",body:{guest_name:name,guest_phone:phone,travel_date:date||null,guest_count:Math.max(1,...selections.map(x=>x.people||1)),selections,estimated_total:total,source:"build-your-trip"}});
  status.textContent="Enquiry saved. Opening WhatsApp…";
  const url="https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(enquiryText(name,phone,date,total));
  window.location.href=url;
 }catch(error){
  console.error("Enquiry save failed; handing off to WhatsApp:",error);
  status.textContent="Online saving is temporarily unavailable. Opening WhatsApp so you can still send your enquiry.";
  const fallbackUrl="https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(enquiryText(name,phone,date,total));
  window.location.href=fallbackUrl;
 }
 finally{button.disabled=false;}
});
load();