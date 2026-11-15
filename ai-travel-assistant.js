(() => {
  "use strict";
  if (window.__HOE_AI_ASSISTANT_LOADED__) return;
  window.__HOE_AI_ASSISTANT_LOADED__ = true;

  const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
  const FUNCTION_URL = SUPABASE_URL + "/functions/v1/ai-travel-assistant";
  const WA_URL = "https://wa.me/919816929669";
  const history = [];
  let bootstrapped = false;
  let cabs = [];
  let isSending = false;

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  async function callFunction(payload) {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "The assistant is temporarily unavailable.");
    return result;
  }

  function addMessage(role, text) {
    const list = document.getElementById("hoe-ai-messages");
    if (!list) return;
    const item = document.createElement("div");
    item.className = "hoe-ai-message " + (role === "assistant" ? "is-assistant" : "is-user");
    item.setAttribute("role", "listitem");
    const label = document.createElement("span");
    label.className = "hoe-ai-message-label";
    label.textContent = role === "assistant" ? "TRAVEL ASSISTANT" : "YOU";
    const body = document.createElement("p");
    body.textContent = text;
    item.append(label, body);
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
    return item;
  }

  function setTyping(active) {
    const old = document.getElementById("hoe-ai-typing");
    if (old) old.remove();
    if (!active) return;
    const list = document.getElementById("hoe-ai-messages");
    const node = document.createElement("div");
    node.id = "hoe-ai-typing";
    node.className = "hoe-ai-typing";
    node.textContent = "Planning your answer…";
    list.appendChild(node);
    list.scrollTop = list.scrollHeight;
  }

  async function sendMessage(text) {
    const clean = String(text || "").trim().slice(0, 1000);
    if (!clean || isSending) return;
    isSending = true;
    const input = document.getElementById("hoe-ai-input");
    const send = document.getElementById("hoe-ai-send");
    if (input) input.value = "";
    if (send) send.disabled = true;
    addMessage("user", clean);
    history.push({ role: "user", content: clean });
    setTyping(true);
    try {
      const result = await callFunction({ action: "chat", messages: history.slice(-12), page: location.pathname });
      const reply = String(result.reply || "I couldn't prepare an answer. Please contact our team.");
      setTyping(false);
      addMessage("assistant", reply);
      history.push({ role: "assistant", content: reply });
      while (history.length > 12) history.shift();
    } catch (error) {
      setTyping(false);
      addMessage("assistant", error.message + " You can contact our team directly on WhatsApp.");
    } finally {
      isSending = false;
      if (send) send.disabled = false;
      if (input) input.focus();
    }
  }

  function toggleForm(id) {
    const form = document.getElementById(id);
    if (!form) return;
    form.hidden = !form.hidden;
    if (!form.hidden) form.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  async function loadBootstrap() {
    if (bootstrapped) return;
    try {
      const result = await callFunction({ action: "bootstrap" });
      cabs = Array.isArray(result.cabs) ? result.cabs : [];
      const select = document.getElementById("hoe-ai-cab");
      if (select) {
        select.innerHTML = '<option value="">Select a vehicle</option>' + cabs.map(cab =>
          '<option value="' + escapeHTML(cab.name) + '">' +
          escapeHTML([cab.name, cab.model, cab.daily_price ? "₹" + Number(cab.daily_price).toLocaleString("en-IN") + "/day" : ""].filter(Boolean).join(" · ")) +
          '</option>'
        ).join("");
      }
      bootstrapped = true;
    } catch { /* The chat remains usable if the estimate catalogue is unavailable. */ }
  }

  function mount() {
    if (document.getElementById("hoe-ai-launcher")) return;
    const launcher = document.createElement("button");
    launcher.id = "hoe-ai-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open AI Travel Assistant");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML = '<span class="hoe-ai-launcher-icon" aria-hidden="true">✦</span><span class="hoe-ai-launcher-copy"><b>Plan with AI</b><small>Travel assistant</small></span>';

    const panel = document.createElement("section");
    panel.id = "hoe-ai-panel";
    panel.className = "hoe-ai-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "hoe-ai-title");
    panel.innerHTML = [
      '<header class="hoe-ai-header">',
      '<div class="hoe-ai-brand-mark" aria-hidden="true">H</div>',
      '<div class="hoe-ai-heading"><strong id="hoe-ai-title">Himalayan Odyssey</strong><span>AI Travel Assistant · Narkanda, Himachal Pradesh</span></div>',
      '<button class="hoe-ai-close" id="hoe-ai-close" type="button" aria-label="Close chat">×</button></header>',
      '<div class="hoe-ai-intro"><span class="hoe-ai-eyebrow">YOUR HIMALAYAN JOURNEY</span>',
      '<h2>Where would you like to go?</h2><p>Ask about destinations, packages or a custom trip. I can help you plan the details.</p>',
      '<div class="hoe-ai-quick-actions">',
      '<button type="button" data-prompt="Recommend a Spiti Valley trip for me.">Explore Spiti</button>',
      '<button type="button" data-prompt="Show me available tour packages and their listed prices.">View packages</button>',
      '<button type="button" data-prompt="Help me plan a customized Himachal trip.">Custom trip</button></div></div>',
      '<div class="hoe-ai-messages" id="hoe-ai-messages" role="list" aria-live="polite">',
      '<div class="hoe-ai-message is-assistant" role="listitem"><span class="hoe-ai-message-label">TRAVEL ASSISTANT</span>',
      '<p>Namaste! I can help with Spiti, Kinnaur and other Himalayan destinations. Tell me your destination, travel dates or what kind of trip you have in mind.</p></div></div>',
      '<div class="hoe-ai-tools"><button type="button" id="hoe-ai-estimate-toggle">Estimate trip cost</button><button type="button" id="hoe-ai-lead-toggle">Send trip enquiry</button></div>',
      '<form class="hoe-ai-estimate" id="hoe-ai-estimate-form" hidden><b>Quick trip estimate</b>',
      '<label>Route and nights <input id="hoe-ai-route" required maxlength="240" placeholder="Narkanda:1, Sangla:1, Kaza:2"></label>',
      '<div class="hoe-ai-form-grid"><label>Trip days <input id="hoe-ai-days" type="number" min="1" max="30" value="5" required></label>',
      '<label>Travellers <input id="hoe-ai-travellers" type="number" min="1" max="30" value="2" required></label></div>',
      '<label>Vehicle <select id="hoe-ai-cab" required><option value="">Loading vehicles…</option></select></label>',
      '<p class="hoe-ai-note">Indicative stay + meals and published cab-rate estimate. Final rates and inclusions require team confirmation.</p>',
      '<button class="hoe-ai-primary" type="submit">Calculate estimate</button><p class="hoe-ai-status" id="hoe-ai-estimate-status" aria-live="polite"></p></form>',
      '<form class="hoe-ai-lead-form" id="hoe-ai-lead-form" hidden><b>Share your trip requirements</b>',
      '<label>Your name <input id="hoe-ai-name" required maxlength="100" autocomplete="name"></label>',
      '<label>Mobile number <input id="hoe-ai-phone" required inputmode="tel" maxlength="15" placeholder="10-digit mobile number" autocomplete="tel"></label>',
      '<label>Email (optional) <input id="hoe-ai-email" type="email" maxlength="150" autocomplete="email"></label>',
      '<label>Destination <input id="hoe-ai-destination" required maxlength="120" placeholder="Spiti Valley, Kinnaur…"></label>',
      '<div class="hoe-ai-form-grid"><label>Travel date <input id="hoe-ai-date" type="date"></label><label>Travellers <input id="hoe-ai-party" type="number" min="1" max="100" value="2" required></label></div>',
      '<label>Approx. total budget (₹) <input id="hoe-ai-budget" type="number" min="0" max="50000000" placeholder="Optional"></label>',
      '<label>Trip requirements <textarea id="hoe-ai-notes" rows="3" maxlength="1200" placeholder="Duration, pickup point, hotel preference, route…"></textarea></label>',
      '<label class="hoe-ai-consent"><input id="hoe-ai-consent" type="checkbox" required> I agree that Himalayan Odyssey Expedition may contact me about this enquiry.</label>',
      '<input id="hoe-ai-website" class="hoe-ai-honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">',
      '<button class="hoe-ai-primary" type="submit">Submit trip enquiry</button><p class="hoe-ai-status" id="hoe-ai-lead-status" aria-live="polite"></p></form>',
      '<form class="hoe-ai-compose" id="hoe-ai-compose"><input id="hoe-ai-input" type="text" maxlength="1000" placeholder="Ask about your Himalayan trip…" autocomplete="off" aria-label="Your message">',
      '<button id="hoe-ai-send" type="submit" aria-label="Send message">➤</button></form>',
      '<footer class="hoe-ai-footer">AI-generated guidance · Final prices and availability confirmed by our team</footer>'
    ].join("");

    document.body.append(launcher, panel);
    const open = async () => {
      panel.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      launcher.classList.add("is-open");
      await loadBootstrap();
      document.getElementById("hoe-ai-input")?.focus();
    };
    const close = () => {
      panel.hidden = true;
      launcher.setAttribute("aria-expanded", "false");
      launcher.classList.remove("is-open");
      launcher.focus();
    };
    launcher.addEventListener("click", () => panel.hidden ? open() : close());
    document.getElementById("hoe-ai-close").addEventListener("click", close);
    document.getElementById("hoe-ai-compose").addEventListener("submit", event => {
      event.preventDefault();
      sendMessage(document.getElementById("hoe-ai-input").value);
    });
    panel.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => sendMessage(button.dataset.prompt)));
    document.getElementById("hoe-ai-estimate-toggle").addEventListener("click", () => toggleForm("hoe-ai-estimate-form"));
    document.getElementById("hoe-ai-lead-toggle").addEventListener("click", () => toggleForm("hoe-ai-lead-form"));

    document.getElementById("hoe-ai-estimate-form").addEventListener("submit", async event => {
      event.preventDefault();
      const status = document.getElementById("hoe-ai-estimate-status");
      status.textContent = "Calculating your indicative estimate…";
      try {
        const result = await callFunction({
          action: "estimate",
          route: document.getElementById("hoe-ai-route").value,
          days: Number(document.getElementById("hoe-ai-days").value),
          travellers: Number(document.getElementById("hoe-ai-travellers").value),
          cabName: document.getElementById("hoe-ai-cab").value
        });
        status.textContent = "";
        addMessage("assistant", result.summary);
      } catch (error) {
        status.textContent = error.message;
      }
    });

    document.getElementById("hoe-ai-lead-form").addEventListener("submit", async event => {
      event.preventDefault();
      const status = document.getElementById("hoe-ai-lead-status");
      const submit = event.submitter;
      if (submit) submit.disabled = true;
      status.textContent = "Sending your enquiry securely…";
      try {
        const payload = {
          action: "lead",
          name: document.getElementById("hoe-ai-name").value,
          phone: document.getElementById("hoe-ai-phone").value,
          email: document.getElementById("hoe-ai-email").value,
          destination: document.getElementById("hoe-ai-destination").value,
          travelDate: document.getElementById("hoe-ai-date").value,
          persons: Number(document.getElementById("hoe-ai-party").value),
          budget: Number(document.getElementById("hoe-ai-budget").value || 0),
          notes: document.getElementById("hoe-ai-notes").value,
          website: document.getElementById("hoe-ai-website").value,
          sourceDetails: "AI Travel Assistant"
        };
        await callFunction(payload);
        status.textContent = "Your enquiry has been sent to our team.";
        addMessage("assistant", "Thank you. Your trip enquiry has been received by Himalayan Odyssey Expedition. Our team will review your requirements and contact you.");
        const waText = "Hello Himalayan Odyssey Expedition, I submitted a trip enquiry through your AI Travel Assistant. Destination: " +
          payload.destination + ". Travel date: " + (payload.travelDate || "Flexible") +
          ". Travellers: " + payload.persons + ". Please help me with the next steps.";
        const link = document.createElement("a");
        link.className = "hoe-ai-whatsapp-link";
        link.href = WA_URL + "?text=" + encodeURIComponent(waText);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Continue on WhatsApp";
        status.appendChild(document.createElement("br"));
        status.appendChild(link);
        document.getElementById("hoe-ai-lead-form").reset();
      } catch (error) {
        status.textContent = error.message;
      } finally {
        if (submit) submit.disabled = false;
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !panel.hidden) close();
    });
  }

  function start() {
    const path = location.pathname.toLowerCase();
    if (/\/(admin|dashboard|login)(\/|\.|$)/.test(path) || /(^|\/)(admin|dashboard|login)\.html$/.test(path)) return;
    mount();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();