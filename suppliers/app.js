"use strict";
const SUPABASE_URL="https://ynkoiuyjevclypumnyes.supabase.co";
const SUPABASE_KEY="sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
const csv=v=>v.split(",").map(x=>x.trim()).filter(Boolean);
const status=(id,msg)=>{$(id).textContent=msg;};
const phoneValue=v=>v.trim().replace(/[()\s.-]/g,"");
function toggleListingFields(){
 const cab=$("listingType").value==="cab";
 $("cabFields").classList.toggle("hidden",!cab);
 $("propertyFields").classList.toggle("hidden",cab);
}
async function submitSupplier(e){
 e.preventDefault();
 const btn=$("submitSupplier");
 btn.disabled=true;
 status("submissionStatus","Submitting your details securely...");
 try{
  const phone=phoneValue($("phone").value);
  const whatsapp=phoneValue($("whatsapp").value);
  const validPhone=v=>/^\+?[0-9]{10,15}$/.test(v);
  if(!validPhone(phone)||!validPhone(whatsapp))throw new Error("Enter valid mobile and WhatsApp numbers, including country code where needed.");
  const type=$("listingType").value;
  const price=$("listingPrice").value.trim();
  const payload={
   contact_person:$("contactPerson").value.trim(),
   business_name:$("businessName").value.trim(),
   phone,whatsapp,
   email:$("supplierEmail").value.trim()||null,
   supplier_type:$("supplierType").value,
   city:$("supplierCity").value.trim()||null,
   state:$("supplierState").value.trim()||"Himachal Pradesh",
   business_address:$("supplierAddress").value.trim()||null,
   gst_number:$("supplierGst").value.trim()||null,
   listing_type:type,
   title:$("listingTitle").value.trim(),
   destination:$("listingDestination").value.trim(),
   location:$("listingLocation").value.trim(),
   description:$("listingDescription").value.trim()||null,
   price:price===""?null:Number(price),
   price_unit:$("priceUnit").value,
   vehicle_model:type==="cab"?$("vehicleModel").value.trim()||null:null,
   seating_capacity:type==="cab"&&$("seats").value?Number($("seats").value):null,
   vehicle_features:type==="cab"?csv($("vehicleFeatures").value):[],
   property_type:type==="property"?$("propertyType").value:null,
   room_types:type==="property"?csv($("roomTypes").value):[],
   amenities:type==="property"?csv($("amenities").value):[]
  };
  if(price!==""&&(!Number.isFinite(payload.price)||payload.price<0))throw new Error("Enter a valid non-negative price.");
  const {error}=await db.from("supplier_submissions").insert(payload);
  if(error)throw error;
  $("supplierSubmissionForm").reset();
  $("supplierState").value="Himachal Pradesh";
  toggleListingFields();
  $("formPanel").classList.add("hidden");
  $("successPanel").classList.remove("hidden");
 }catch(err){
  console.error("Supplier submission failed:",err);
  status("submissionStatus","Could not submit your details: "+err.message);
 }finally{btn.disabled=false;}
}
$("listingType").addEventListener("change",toggleListingFields);
$("supplierSubmissionForm").addEventListener("submit",submitSupplier);
toggleListingFields();