(() => {
  "use strict";
  const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
  const PHONE = "919816929669";
  const destinations = [
    "Spiti Valley", "Winter Spiti", "Kinnaur", "Spiti from Chandigarh",
    "Narkanda", "Shimla", "Manali", "Kasol", "Jibhi", "Custom Himachal trip"
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
  function formMarkup() {
    const selected = selectedDestination();
    return `
      <section class="hoe-lead-section" aria-labelledby="hoeLeadTitle">
        <div class="hoe-lead-card">
          <div class="hoe-lead-copy">
            <span class="hoe-lead-eyebrow">PERSONALISED HIMALAYAN TRIP PLANNING</span>
            <h2 id="hoeLeadTitle">Tell us about your trip</h2>
            <p>Share a few details. Our team will review your route and contact you on WhatsApp with the next steps.</p>
          </div>
          <form class="hoe-lead-form" id="hoeWebsiteLeadForm">
            <div class="hoe-lead-grid">
              <label>Your name<input name="name" type="text" autocomplete="name" minlength="2" maxlength="100" required placeholder="Enter your name"></label>
              <label>WhatsApp number<input name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="10" pattern="[6-9][0-9]{9}" required placeholder="10-digit mobile number"></label>
              <label>Destination / package<select name="destination" required>
                <option value="">Select destination</option>
                ${destinations.map(item => `<option value="${esc(item)}" ${selected === item ? "selected" : ""}>${esc(item)}</option>`).join("")}
              </select></label>
              <label>Travel date <span class="hoe-lead-optional">(if decided)</span><input name="travelDate" type="date"></label>
              <label>Number of travellers<input name="persons" type="number" min="1" max="100" value="2" required></label>
              <label>Starting city<input name="startCity" type="text" maxlength="100" required placeholder="e.g. Delhi, Chandigarh, Shimla"></label>
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
      .hoe-lead-submit{width:100%;min-height:49px;padding:12px 16px;border:0;border-radius:7px;background:#173c36;color:#fff;font:800 12px Inter,Arial,sans-serif;letter-spacing:.35px;cursor:pointer}
      .hoe-lead-submit:disabled{opacity:.65;cursor:wait}.hoe-lead-status{margin:10px 0 0;font-size:11px;line-height:1.5;color:#64736b}
      .hoe-lead-status[data-state="error"]{color:#a13b32}.hoe-lead-status[data-state="success"]{color:#24634a}
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
    const formElement = document.getElementById("hoeWebsiteLeadForm");
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
      const acquisition = window.HOEAnalytics?.getAcquisition?.() || { channel: "unknown", landing: "/" };
      const enquiryPath = /^\/[a-z0-9/_.-]{0,99}$/i.test(location.pathname) && !/\d{7,}/.test(location.pathname) ? location.pathname : "/";
      const sourceDetails = "Website lead form · Channel: " + acquisition.channel + " · Landing: " + acquisition.landing + " · Enquiry: " + enquiryPath;
      const notes = "Starting city: " + startCity + "\nEnquiry page: " + location.pathname.slice(0,500);
      const message = [
        "Hello Himalayan Odyssey Expedition,",
        "I have submitted a trip enquiry through your website.",
        "Name: " + name,
        "WhatsApp: +91 " + phone,
        "Destination / package: " + destination,
        "Travel date: " + (travelDate || "Flexible"),
        "Travellers: " + persons,
        "Starting city: " + startCity,
        "Please share the suitable itinerary and quotation."
      ].join("\n");
      const whatsappUrl = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(message);
      const whatsappWindow = window.open("about:blank","_blank");
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
      else window.HOEAnalytics?.track("enquiry_whatsapp_fallback", { page_path: location.pathname });
      status.dataset.state = saved ? "success" : "error";
      status.textContent = saved
        ? "Enquiry saved. Opening WhatsApp to continue…"
        : "The CRM could not confirm the save. Opening WhatsApp so your enquiry can still reach our team.";
      button.textContent = saved ? "Enquiry submitted" : "Continue on WhatsApp";
      window.HOEAnalytics?.track("whatsapp_click", { form_name: "website_enquiry", page_path: location.pathname });
      window.setTimeout(() => {
        if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.location.href = whatsappUrl;
        else window.location.href = whatsappUrl;
      }, 450);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once:true });
  else mount();
})();