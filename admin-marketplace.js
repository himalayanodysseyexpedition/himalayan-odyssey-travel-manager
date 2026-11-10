"use strict";
const SUPABASE_URL="https://ynkoiuyjevclypumnyes.supabase.co",SUPABASE_KEY="sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
const ADMIN_ID="79482db3-a3f7-4773-bb8d-5a79c9d10237",BUCKET="marketplace-service-photos",db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY),$=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=v=>"₹"+(Number(v)||0).toLocaleString("en-IN");
const units={cab:"per_vehicle_day",hotel:"per_person_night",package:"per_person"};
const labels={cab:"₹ per vehicle / day",hotel:"₹ per person / night",package:"₹ per person"};
const invLabels={cab:"Vehicles available",hotel:"Rooms / units available",package:"Seats available"};
let services=[],filter="all",editing=null;
function showApp(){ $("loginPanel").classList.add("hidden");$("app").classList.remove("hidden");loadAll();}
function setUnit(){const c=$("category").value;$("unit").value=labels[c];$("inventoryLabel").textContent=invLabels[c];}
async function loadAll(){await loadServices();await loadEnquiries();}
async function loadServices(){
 const {data,error}=await db.from("marketplace_services").select("*").order("sort_order").order("created_at",{ascending:false});
 if(error){$("serviceList").textContent="Could not load services: "+error.message;return;}
 services=data||[];renderServices();
}
function renderServices(){
 const items=services.filter(x=>filter==="all"||x.category===filter);
 $("serviceList").innerHTML=items.length?items.map(x=>'<article class="item">'+(x.image_url?'<img src="'+esc(x.image_url)+'" alt="">':'<div style="background:#e9eee8;border-radius:5px;display:grid;place-items:center">No photo</div>')+'<div><h3>'+esc(x.title)+'</h3><div class="muted">'+esc(x.category)+' · '+esc(x.destination)+'</div><b>'+money(x.price)+' '+esc(x.price_unit==='per_vehicle_day'?'per vehicle/day':x.price_unit==='per_person_night'?'per person/night':'per person')+'</b><div class="muted">Inventory: '+x.inventory+' · '+(x.is_active?'Published':'Hidden')+'</div><div class="actions"><button data-edit="'+x.id+'">Edit</button><button class="secondary" data-toggle="'+x.id+'">'+(x.is_active?'Unpublish':'Publish')+'</button><button class="danger" data-delete="'+x.id+'">Delete</button></div></div></article>').join(""):'<p class="muted">No services in this category yet.</p>';
}
function resetForm(){editing=null;$("serviceForm").reset();$("serviceId").value="";$("active").checked=true;$("inventory").value=1;$("sortOrder").value=0;$("dialogTitle").textContent="Add service";$("saveService").textContent="Save service";$("photoPreview").textContent="";$("formStatus").textContent="";setUnit();}
function openNew(){resetForm();$("serviceDialog").showModal();}
function openEdit(id){
 const x=services.find(v=>v.id===id);if(!x)return;resetForm();editing=x.id;
 $("serviceId").value=x.id;$("category").value=x.category;$("title").value=x.title;$("destination").value=x.destination||"";$("price").value=x.price;$("inventory").value=x.inventory;$("capacity").value=x.capacity||"";$("sortOrder").value=x.sort_order||0;$("description").value=x.description||"";$("active").checked=x.is_active;$("photoPreview").innerHTML=x.image_url?'<img src="'+esc(x.image_url)+'" alt="Current photo" style="max-width:180px;max-height:110px;object-fit:cover;border-radius:5px"><small> Current photo</small>':"No photo uploaded";
 $("dialogTitle").textContent="Edit service";$("saveService").textContent="Update service";setUnit();$("serviceDialog").showModal();
}
async function uploadPhoto(id,file){
 if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Choose a JPG, PNG or WebP image.");
 if(file.size>5*1024*1024)throw new Error("Photo must be smaller than 5 MB.");
 const path=id+"/"+Date.now()+"-"+file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g,"-").slice(-90);
 const {error}=await db.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;
 return {storage_path:path,image_url:db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl};
}
async function saveService(e){
 e.preventDefault();const button=$("saveService");button.disabled=true;$("formStatus").textContent="Saving…";
 let uploaded=null;
 try{
  const {data:userData,error:userError}=await db.auth.getUser();if(userError||userData.user?.id!==ADMIN_ID)throw new Error("Only the authorised admin account can manage this catalogue.");
  const c=$("category").value,title=$("title").value.trim();if(!title)throw new Error("Enter a service name.");
  const payload={category:c,title,destination:$("destination").value.trim(),description:$("description").value.trim(),price:Number($("price").value),price_unit:units[c],inventory:Number($("inventory").value),capacity:$("capacity").value?Number($("capacity").value):null,sort_order:Number($("sortOrder").value)||0,is_active:$("active").checked,owner_id:ADMIN_ID,updated_at:new Date().toISOString()};
  if(!Number.isFinite(payload.price)||payload.price<0||!Number.isInteger(payload.inventory)||payload.inventory<0)throw new Error("Check the price and available inventory.");
  let id=editing;
  if(editing){const {error}=await db.from("marketplace_services").update(payload).eq("id",editing);if(error)throw error;}
  else{const {data,error}=await db.from("marketplace_services").insert(payload).select("id").single();if(error)throw error;id=data.id;}
  const file=$("photo").files[0];
  if(file){
   uploaded=await uploadPhoto(id,file);
   const {error}=await db.from("marketplace_services").update(uploaded).eq("id",id);if(error){await db.storage.from(BUCKET).remove([uploaded.storage_path]);throw error;}
   const old=services.find(x=>x.id===id);if(old?.storage_path)await db.storage.from(BUCKET).remove([old.storage_path]);
  }
  $("serviceDialog").close();await loadServices();
 }catch(error){console.error(error);$("formStatus").textContent="Could not save: "+error.message;}
 finally{button.disabled=false;}
}
async function toggleService(id){const x=services.find(v=>v.id===id);if(!x)return;const {error}=await db.from("marketplace_services").update({is_active:!x.is_active,updated_at:new Date().toISOString()}).eq("id",id);if(error)alert(error.message);else loadServices();}
async function deleteService(id){const x=services.find(v=>v.id===id);if(!x||!confirm("Delete "+x.title+" from the guest catalogue?"))return;const {error}=await db.from("marketplace_services").delete().eq("id",id);if(error){alert(error.message);return;}if(x.storage_path)await db.storage.from(BUCKET).remove([x.storage_path]);loadServices();}
async function loadEnquiries(){
 const {data,error}=await db.from("marketplace_enquiries").select("*").order("created_at",{ascending:false}).limit(100);
 if(error){$("enquiryList").textContent="Could not load enquiries: "+error.message;return;}
 $("enquiryList").innerHTML=(data||[]).length?(data||[]).map(x=>'<article class="enquiry"><div class="actions" style="justify-content:space-between"><b>'+esc(x.guest_name)+' · '+esc(x.guest_phone)+'</b><b>'+money(x.estimated_total)+'</b></div><div class="muted">'+new Date(x.created_at).toLocaleString("en-IN")+' · '+esc(x.status)+' · '+(x.travel_date||"Date not specified")+'</div><pre>'+esc((x.selections||[]).map((s,i)=>(i+1)+'. '+s.title+' — '+(s.category==='cab'?s.days+' day(s), '+s.vehicles+' vehicle(s)':s.category==='hotel'?s.nights+' night(s), '+s.people+' guest(s)':s.people+' guest(s)')+' — '+money(s.line_total)).join("\n"))+'</pre><div class="actions"><a href="https://wa.me/'+esc(x.guest_phone.replace(/\D/g,""))+'" target="_blank" rel="noopener"><button type="button">WhatsApp guest</button></a><select data-status="'+x.id+'" style="width:auto"><option value="new" '+(x.status==="new"?"selected":"")+'>New</option><option value="contacted" '+(x.status==="contacted"?"selected":"")+'>Contacted</option><option value="confirmed" '+(x.status==="confirmed"?"selected":"")+'>Confirmed</option><option value="closed" '+(x.status==="closed"?"selected":"")+'>Closed</option></select></div></article>').join(""):'<p class="muted">No guest enquiries yet.</p>';
}
$("login").addEventListener("click",async()=>{const {data,error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){$("loginStatus").textContent=error.message;return;}if(data.user.id!==ADMIN_ID){await db.auth.signOut();$("loginStatus").textContent="This account is not authorised to manage the marketplace.";return;}showApp();});
$("logout").addEventListener("click",async()=>{await db.auth.signOut();$("app").classList.add("hidden");$("loginPanel").classList.remove("hidden");});
$("newService").addEventListener("click",openNew);$("refresh").addEventListener("click",loadAll);$("category").addEventListener("change",setUnit);$("serviceForm").addEventListener("submit",saveService);$("cancel").addEventListener("click",()=>$("serviceDialog").close());
$("photo").addEventListener("change",()=>{const f=$("photo").files[0];$("photoPreview").textContent=f?f.name+" · "+(f.size/1024/1024).toFixed(2)+" MB":"";});
$("filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;filter=b.dataset.filter;$("filters").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderServices();});
$("serviceList").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.edit)openEdit(b.dataset.edit);if(b.dataset.toggle)toggleService(b.dataset.toggle);if(b.dataset.delete)deleteService(b.dataset.delete);});
$("enquiryList").addEventListener("change",async e=>{const s=e.target.closest("[data-status]");if(!s)return;const {error}=await db.from("marketplace_enquiries").update({status:s.value}).eq("id",s.dataset.status);if(error)alert(error.message);});
document.querySelector(".tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(!b)return;document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));$("cataloguePanel").classList.toggle("hidden",b.dataset.tab!=="catalogue");$("enquiriesPanel").classList.toggle("hidden",b.dataset.tab!=="enquiries");if(b.dataset.tab==="enquiries")loadEnquiries();});
(async()=>{const {data}=await db.auth.getSession();if(data.session?.user?.id===ADMIN_ID)showApp();})();