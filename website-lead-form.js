(() => {
  "use strict";
  if(window.HOELeadCapture)return;
  const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
  const PHONE = "919816929669";
  const destinations = [
    "Spiti Valley", "Winter Spiti", "Kinnaur", "Spiti from Chandigarh",
    "Narkanda", "Shimla", "Manali", "Kasol", "Jibhi", "Custom Himachal trip", "Other / flexible destination"
  ];
  const pageDefaults = {
    "/spiti-valley-tours/": "Spiti Valley",
    "/winter-spiti-tours/": "Winter Spiti",
    "/kinnaur-tours/": "Kinnaur",
    "/spiti-tour-from-chandigarh/": "Spiti from Chandigarh",
    "/narkanda-tours/": "Narkanda"
  };
  const esc = value => String(value || "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[char]));
  function selectedDestination() {
    const params = new URLSearchParams(location.search);
    const raw = params.get("package") || params.get("topic") || pageDefaults[location.pathname] || "";
    const match = destinations.find(item => item.toLowerCase() === raw.toLowerCase());
    if (match) return match;
    const text = raw.toLowerCase();
    if (text.includes("winter spiti")) return "Winter Spiti";
    if (text.includes("spiti")) return location.pathname.includes("chandigarh") ? "Spiti from Chandigarh" : "Spiti Valley";
    if (text.includes("kinnaur")) return "Kinnaur";
    if (text.includes("narkanda")) return "Narkanda";
    return pageDefaults[location.pathname] || "";
  }
  function formMarkup(modal = false) {
    const selected = selectedDestination();
    return `
      <section class="hoe-lead-section" aria-labelledby="${modal ? "hoeLeadModalTitle" : "hoeLeadTitle"}">
        <div class="hoe-lead-card">
          <div class="hoe-lead-copy">
            <span class="hoe-lead-eyebrow">PERSONALISED HIMALAYAN TRIP PLANNING</span>
            <h2 id="${modal ? "hoeLeadModalTitle" : "hoeLeadTitle"}">Tell us about your trip</h2>
            <p>Share a few details. Our team will review your route and contact you on WhatsApp with the next steps.</p>
          </div>
          <form class="hoe-lead-form" id="${modal ? "hoeWhatsAppLeadForm" : "hoeWebsiteLeadForm"}">
            <div class="hoe-lead-grid">
              <label>Your name<input name="name" type="text" autocomplete="name" minlength="2" maxlength="100" required placeholder="Enter your name"></label>
              <label>WhatsApp number<input name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="10" pattern="[6-9][0-9]{9}" required placeholder="10-digit mobile number"></label>
              <label>Destination / package<select name="destination" required>
                <option value="">Select destination</option>
                ${destinations.map(item => `<option value="${esc(item)}" ${selected === item ? "selected" : ""}>${esc(item)}</option>`).join("")}
              </select></label>
              <label>Travel date <span class="hoe-lead-optional">(if decided)</span><input name="travelDate" type="date"></label>
              <label>Number of travellers<input name="persons" type="number" min="1" max="100" value="2" required></label>
              <label>Starting city / pickup<input name="startCity" type="text" maxlength="100" required placeholder="e.g. Delhi, Chandigarh, Shimla"></label>
              <label>Tour duration (days)<input name="tourDays" type="number" min="1" max="60" placeholder="If decided"></label>
              <label>Service required<select name="service" required><option>Not decided</option><option>Group tour</option><option>Private / custom tour</option><option>Cab / sightseeing</option><option>Hotel / homestay</option></select></label>
              <label>Drop location (optional)<input name="dropCity" maxlength="100" placeholder="e.g. Chandigarh"></label>
              <label>Other requirements (optional)<input name="requirements" maxlength="600" placeholder="Places, room, vehicle, budget, etc."></label>
            </div>
            <label class="hoe-lead-consent"><input name="consent" type="checkbox" required><span>I agree that Himalayan Odyssey Expedition may contact me about this travel enquiry.</span></label>
            <label class="hoe-lead-honeypot" aria-hidden="true">Leave this field empty<input name="website" type="text" tabindex="-1" autocomplete="off"></label>
            <button type="submit" class="hoe-lead-submit">Submit enquiry & continue to WhatsApp</button>
            <p class="hoe-lead-status" role="status" aria-live="polite">No payment is required to send an enquiry.</p>
          </form>
        </div>
      </section>`;
  }
  function addStyles() {
    if (document.getElementById("hoe-lead-form-styles")) return;
    const style = document.createElement("style");
    style.id = "hoe-lead-form-styles";
    style.textContent = `
      .hoe-lead-section{margin:28px 0 30px;scroll-margin-top:24px}
      .hoe-lead-card{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:28px;padding:clamp(22px,4vw,38px);background:#fff;border:1px solid #dce3e8;border-radius:16px;box-shadow:0 18px 50px rgba(16,36,59,.08);color:#172536}
      .hoe-lead-copy{align-self:start}.hoe-lead-eyebrow{font-size:10px;font-weight:800;letter-spacing:1.7px;color:#367ba5}
      .hoe-lead-copy h2{font:500 clamp(28px,3.4vw,38px)/1.12 Georgia,serif;margin:12px 0;color:#172536}
      .hoe-lead-copy p{font-size:14px;line-height:1.7;color:#586777}
      .hoe-lead-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px}
      .hoe-lead-form label{display:block;margin:0 0 12px;font-size:12px;font-weight:700;color:#344556}
      .hoe-lead-form input:not([type=checkbox]),.hoe-lead-form select{display:block;width:100%;min-height:46px;margin:6px 0 0;padding:11px 12px;border:1px solid #cfd9e1;border-radius:7px;background:#fbfcfd;color:#172536;font:14px Inter,Arial,sans-serif}
      .hoe-lead-form input:focus,.hoe-lead-form select:focus{outline:2px solid rgba(54,123,165,.25);border-color:#367ba5}
      .hoe-lead-optional{font-weight:400;color:#758391}.hoe-lead-consent{display:flex!important;align-items:flex-start;gap:9px;font-weight:500!important;line-height:1.5}
      .hoe-lead-consent input{width:17px;height:17px;flex:0 0 17px;margin:1px 0 0;accent-color:#173c36}
      .hoe-lead-submit{width:100%;min-height:49px;padding:12px 16px;border:0;border-radius:7px;background:#6536c7;color:#fff;font:800 12px Inter,Arial,sans-serif;letter-spacing:.35px;cursor:pointer}
      .hoe-lead-submit:disabled{opacity:.65;cursor:wait}.hoe-lead-status{margin:10px 0 0;font-size:11px;line-height:1.5;color:#64736b}
      .hoe-lead-status[data-state="error"]{color:#a13b32}.hoe-lead-status[data-state="success"]{color:#24634a}
      .hoe-lead-dialog{width:min(95vw,650px);max-height:90dvh;overflow:auto;border:1px solid #e4e0ea;border-radius:16px;padding:12px;background:white;color:#17111f}
      .hoe-lead-dialog::backdrop{background:#100d16b3}.hoe-lead-dialog .hoe-lead-section{margin:0}.hoe-lead-dialog .hoe-lead-card{display:block;box-shadow:none;padding:16px;border:0}.hoe-lead-dialog .hoe-lead-copy h2{font:700 24px system-ui,sans-serif}.hoe-lead-dialog .hoe-lead-copy p{margin:8px 0 16px}.hoe-lead-dialog .hoe-lead-close{display:block;margin-left:auto;border:0;background:#17111f;color:white;border-radius:8px;padding:8px 14px;cursor:pointer}.hoe-lead-dialog .hoe-lead-grid{grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:480px){.hoe-lead-dialog .hoe-lead-grid{grid-template-columns:1fr}}
      .hoe-lead-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
      @media(max-width:720px){.hoe-lead-card{grid-template-columns:1fr;gap:15px;padding:22px 18px}.hoe-lead-grid{grid-template-columns:1fr;gap:0}.hoe-lead-section{margin:22px 0}}
      @media(prefers-reduced-motion:reduce){.hoe-lead-submit{transition:none!important}}
    `;
    document.head.appendChild(style);
  }
  function mount() {
    if (document.getElementById("hoeWebsiteLeadForm")) return;
    const form = formMarkup();
    if (location.pathname === "/" || location.pathname === "/index.html") {
      const contact = document.getElementById("contact");
      const intro = contact?.querySelector("p");
      if (!contact || !intro) return;
      intro.insertAdjacentHTML("afterend", form);
    } else {
      const cta = document.querySelector(".article .cta");
      if (!cta) return;
      cta.insertAdjacentHTML("beforebegin", form);
    }
    addStyles();
    bind(document.getElementById("hoeWebsiteLeadForm"));
  }
  function bind(formElement) {
    if(!formElement || formElement.dataset.bound)return;
    formElement.dataset.bound="1";
    const dateInput = formElement.querySelector('[name="travelDate"]');
    dateInput.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,10);
    formElement.addEventListener("submit", async event => {
      event.preventDefault();
      const status = formElement.querySelector(".hoe-lead-status");
      const button = formElement.querySelector(".hoe-lead-submit");
      if (button.disabled || !formElement.reportValidity()) return;
      const values = new FormData(formElement);
      const name = String(values.get("name") || "").trim();
      const phone = String(values.get("phone") || "").replace(/\D/g,"");
      const destination = String(values.get("destination") || "").trim();
      const persons = Number(values.get("persons"));
      const travelDate = String(values.get("travelDate") || "");
      const startCity = String(values.get("startCity") || "").trim();
      const tourDays = String(values.get("tourDays") || "").trim();
      const service = String(values.get("service") || "Not decided");
      const dropCity = String(values.get("dropCity") || "").trim();
      const requirements = String(values.get("requirements") || "").trim();
      const context = String(formElement.dataset.enquiryContext || "").slice(0,1500);
      const acquisition = window.HOEAnalytics?.getAcquisition?.() || { channel: "unknown", landing: "/" };
      const enquiryPath = /^\/[a-z0-9/_.-]{0,99}$/i.test(location.pathname) && !/\d{7,}/.test(location.pathname) ? location.pathname : "/";
      const sourceDetails = "Website lead form · Channel: " + acquisition.channel + " · Landing: " + acquisition.landing + " · Enquiry: " + enquiryPath;
      const notes = ["Starting city: "+startCity, "Tour days: "+(tourDays||"Flexible"),"Service: "+service,"Drop: "+(dropCity||"Not decided"),"Requirements: "+(requirements||"Not specified"),"Enquiry page: "+enquiryPath,"Selected enquiry: "+(context||"General website enquiry")].join("\n");
      const message = [
        "Hello Himalayan Odyssey Expedition,",
        "I have submitted a trip enquiry through your website.",
        "Name: " + name,
        "WhatsApp: +91 " + phone,
        "Destination / package: " + destination,
        "Travel date: " + (travelDate || "Flexible"),
        "Travellers: " + persons,
        "Starting city: " + startCity,
        "Tour duration: " + (tourDays ? tourDays + " days" : "Flexible"),
        "Service: " + service,
        "Drop: " + (dropCity || "Not decided"),
        "Requirements: " + (requirements || "Not specified"),
        ...(context ? ["Selected enquiry: " + context] : []),
        "Please share the suitable itinerary and quotation."
      ].join("\n");
      const whatsappUrl = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(message);

      button.disabled = true;
      button.textContent = "Submitting enquiry…";
      status.dataset.state = "";
      status.textContent = "Saving your enquiry securely…";
      let saved = false;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(SUPABASE_URL + "/functions/v1/submit-website-enquiry", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json", "apikey": SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({
            name, phone, destination, persons, travelDate,
            budget: 0, sourceDetails,
            notes, website: String(values.get("website") || "")
          })
        });
        const result = await response.json().catch(() => ({}));
        saved = response.ok && result.saved === true;
      } catch (_) {
        saved = false;
      } finally {
        window.clearTimeout(timeout);
      }
      if (saved && !String(values.get("website") || "").trim()) window.HOEAnalytics?.track("generate_lead", { form_name: "website_enquiry", page_path: enquiryPath, acquisition_channel: acquisition.channel });
      else if (!saved) window.HOEAnalytics?.track("enquiry_whatsapp_fallback", { page_path: location.pathname });
      status.dataset.state = saved ? "success" : "error";
      status.textContent = saved ? "Enquiry saved. Opening WhatsApp to continue…" : "We could not confirm your enquiry was saved. Please retry, or contact us directly on WhatsApp.";
      button.textContent = saved ? "Enquiry submitted" : "Retry enquiry";
      if (!saved) {
        button.disabled = false;
        let fallback=formElement.querySelector(".hoe-lead-fallback");
        if(!fallback){fallback=document.createElement("a");fallback.className="hoe-lead-fallback";fallback.textContent="Open WhatsApp without saving";fallback.dataset.hoeDirect="1";status.after(fallback);}
        fallback.href=whatsappUrl;
        return;
      }
      window.HOEAnalytics?.track("whatsapp_click", { form_name: "website_enquiry", page_path: enquiryPath });
      location.href=whatsappUrl;
    });
  }
  function openEnquiry(rawUrl, options = {}) {
    let url;
    try{url=new URL(rawUrl,location.href)}catch(_){return false}
    if(!((url.hostname==="wa.me"&&url.pathname.replace(/\D/g,"")===PHONE)|| (url.hostname==="api.whatsapp.com"&&url.searchParams.get("phone")?.replace(/\D/g,"")===PHONE)))return false;
    addStyles();
    let dialog=document.getElementById("hoeWhatsAppLeadDialog");
    if(!dialog){dialog=document.createElement("dialog");dialog.id="hoeWhatsAppLeadDialog";dialog.className="hoe-lead-dialog";dialog.setAttribute("aria-labelledby","hoeLeadModalTitle");dialog.innerHTML='<button type="button" class="hoe-lead-close" aria-label="Close enquiry">Close</button>'+formMarkup(true);document.body.appendChild(dialog);dialog.querySelector(".hoe-lead-close").onclick=()=>dialog.close();bind(dialog.querySelector("form"));}
    const f=dialog.querySelector("form");if(f.querySelector("button[type=submit]").disabled)return true;
    f.reset();f.querySelector(".hoe-lead-fallback")?.remove();f.querySelector(".hoe-lead-status").textContent="No payment is required to send an enquiry.";f.querySelector(".hoe-lead-status").dataset.state="";f.querySelector("button[type=submit]").textContent="Submit enquiry & continue to WhatsApp";
    const message=String(url.searchParams.get("text")||"");
    const text=(String(options.context||"")+" "+message+" "+location.pathname).toLowerCase();
    f.dataset.enquiryContext=message.slice(0,1500);
    const d=options.destination||[...destinations].sort((a,b)=>b.length-a.length).find(x=>x!=="Other / flexible destination"&&text.includes(x.toLowerCase()))||(text.includes("spiti")?"Spiti Valley":selectedDestination());
    if(d&&destinations.includes(d))f.elements.destination.value=d;
    if(text.includes("cab")||text.includes("taxi")||text.includes("sightseeing"))f.elements.service.value="Cab / sightseeing";
    else if(text.includes("hotel")||text.includes("homestay")||text.includes("room"))f.elements.service.value="Hotel / homestay";
    else if(text.includes("private")||text.includes("custom")||options.service==="Private / custom tour")f.elements.service.value="Private / custom tour";
    else if(text.includes("group")||text.includes("winter spiti expedition"))f.elements.service.value="Group tour";
    else f.elements.service.value="Not decided";
    const days=options.days||message.match(/(?:Duration:\s*)?(\d{1,2})\s*(?:days?\b|D\b)/i)?.[1];
    if(days&&Number(days)<=60)f.elements.tourDays.value=days;
    const guests=options.persons||message.match(/(?:travellers|guests|persons|passengers):\s*(\d{1,3})/i)?.[1];
    if(guests&&Number(guests)<=100)f.elements.persons.value=guests;
    const date=options.travelDate||message.match(/(?:Dates?|Travel date):\s*(\d{4}-\d{2}-\d{2})/i)?.[1];
    if(date)f.elements.travelDate.value=date;
    if(options.startCity)f.elements.startCity.value=options.startCity;
    if(!dialog.open)dialog.showModal();return true;
  }
  window.HOELeadCapture={open:openEnquiry};
  window.addEventListener("click",event=>{
    const a=event.target instanceof Element?event.target.closest("a[href]"):null;
    if(!a||a.dataset.hoeDirect||event.defaultPrevented)return;
    if(openEnquiry(a.href,{context:a.textContent||""})){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once:true });
  else mount();
})();