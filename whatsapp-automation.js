/* =========================================================
   FREE WHATSAPP MESSAGE WORKFLOWS
   Opens WhatsApp with a personalised draft. The admin taps
   Send in WhatsApp. Templates are stored on this device.
========================================================= */
(() => {
  "use strict";

  const STORAGE_KEY = "hoe_whatsapp_templates_v1";
  const defaults = {
    enquiry: "Hello {name}, thank you for contacting Himalayan Odyssey Expedition! We would be happy to help plan your {destination} trip. You mentioned {travellers} traveller(s) and a travel date of {travel_date}. Please share your preferred dates, pickup city and any special requirements so we can prepare the best itinerary for you.",
    confirmation: "Hello {name}, your {destination} booking with Himalayan Odyssey Expedition is confirmed. Travel date: {start_date}. Trip end date: {end_date}. Booking reference: {reference}. Total package amount: {total}. Amount received: {paid}. Balance remaining: {balance}. We look forward to welcoming you to the Himalayas!",
    advance: "Hello {name}, thank you for choosing Himalayan Odyssey Expedition for your {destination} trip. To secure your booking, please complete the advance payment as discussed with our team. Once paid, kindly share the transaction screenshot here so we can update your booking record and confirm the arrangements.",
    payment: "Hello {name}, this is a friendly payment reminder from Himalayan Odyssey Expedition for your {destination} booking. Total amount: {total}. Amount received: {paid}. Pending balance: {balance}. Please let us know when we can expect the remaining payment. Thank you!",
    trip: "Hello {name}, your Himalayan Odyssey Expedition {destination} trip is approaching! Your travel starts on {start_date} and ends on {end_date}. Please keep your ID proof and essential travel items ready. Kindly confirm your pickup coordination with our team before departure. We look forward to seeing you!",
    feedback: "Hello {name}, thank you for travelling with Himalayan Odyssey Expedition to {destination}! We hope you had a wonderful Himalayan experience. We would really appreciate your feedback about the trip, stays, transport and overall arrangements. Your suggestions help us improve. Thank you for travelling with us!"
  };

  const labels = {
    enquiry: "New enquiry reply",
    confirmation: "Booking confirmation",
    advance: "Advance payment request",
    payment: "Payment reminder",
    trip: "Trip reminder",
    feedback: "Post-trip feedback"
  };

  const $ = id => document.getElementById(id);
  const readTemplates = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return Object.fromEntries(Object.keys(defaults).map(key => [
        key, typeof saved[key] === "string" && saved[key].trim() ? saved[key] : defaults[key]
      ]));
    } catch (_) {
      return { ...defaults };
    }
  };

  let templates = readTemplates();

  function setupEditor() {
    Object.keys(defaults).forEach(key => {
      const field = $("wa-template-" + key);
      if (field) field.value = templates[key];
    });

    $("saveWhatsAppTemplates")?.addEventListener("click", () => {
      const next = {};
      Object.keys(defaults).forEach(key => {
        next[key] = $("wa-template-" + key)?.value?.trim() || defaults[key];
      });
      templates = next;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        const status = $("waTemplateStatus");
        if (status) status.textContent = "Templates saved on this device.";
      } catch (_) {
        alert("Your browser could not save these templates. Check available device storage.");
      }
    });

    $("resetWhatsAppTemplates")?.addEventListener("click", () => {
      if (!confirm("Restore all six WhatsApp message templates to their original wording?")) return;
      templates = { ...defaults };
      Object.keys(defaults).forEach(key => {
        const field = $("wa-template-" + key);
        if (field) field.value = templates[key];
      });
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(templates)); } catch (_) {}
      const status = $("waTemplateStatus");
      if (status) status.textContent = "Default templates restored.";
    });
  }

  function addAction(container, key, recordId, label) {
    if (!container || container.querySelector('[data-wa-automation="' + key + '"]')) return;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.waAutomation = key;
    button.dataset.recordId = recordId;
    button.className = "secondary";
    container.appendChild(button);
  }

  function addCardActions() {
    document.querySelectorAll("#leadList article").forEach(article => {
      const record = article.querySelector("[data-confirm]");
      const actions = article.lastElementChild;
      if (record && actions) addAction(actions, "enquiry", record.dataset.confirm, "Enquiry reply");
    });

    document.querySelectorAll("#bookingList article").forEach(article => {
      const record = article.querySelector("[data-confirm-wa]");
      const actions = article.lastElementChild;
      if (!record || !actions) return;
      const id = record.dataset.confirmWa;
      addAction(actions, "advance", id, "Advance request");
      addAction(actions, "trip", id, "Trip reminder");
      addAction(actions, "feedback", id, "Feedback request");
    });
  }

  function indianMoney(value) {
    return "₹" + (Number(value) || 0).toLocaleString("en-IN");
  }

  function openWhatsApp(phone, text) {
    let number = String(phone || "").replace(/\D/g, "");
    if (number.startsWith("0")) number = number.slice(1);
    if (number.length === 10) number = "91" + number;
    if (number.length < 11 || number.length > 13) {
      alert("Please add a valid customer mobile number, including country code if needed.");
      return;
    }
    window.open("https://wa.me/" + number + "?text=" + encodeURIComponent(text), "_blank", "noopener");
  }

  function fill(template, data) {
    return template.replace(/\{([a-z_]+)\}/gi, (_, key) => String(data[key.toLowerCase()] ?? "—"));
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-wa-automation]");
    if (!button) return;

    const key = button.dataset.waAutomation;
    const id = button.dataset.recordId;
    let customer = {};
    let data = {};

    if (key === "enquiry") {
      const lead = (window.D?.leads || []).find(item => String(item.id) === String(id));
      if (!lead) { alert("Lead not found. Refresh the dashboard and try again."); return; }
      customer = (window.D?.customers || []).find(item => String(item.id) === String(lead.customer_id)) || {};
      data = {
        name: customer.name || "there",
        destination: lead.destination || "Himachal",
        travel_date: lead.travel_date || "not yet decided",
        travellers: lead.travellers || 1,
        budget: indianMoney(lead.budget)
      };
    } else {
      const booking = (window.D?.bookings || []).find(item => String(item.id) === String(id));
      if (!booking) { alert("Booking not found. Refresh the dashboard and try again."); return; }
      customer = (window.D?.customers || []).find(item => String(item.id) === String(booking.customer_id)) || {};
      const total = Number(booking.total_amount || 0);
      const paid = Number(booking.amount_paid || 0);
      data = {
        name: customer.name || "there",
        destination: booking.destination || "Himalayan",
        start_date: booking.start_date || "to be confirmed",
        end_date: booking.end_date || "to be confirmed",
        reference: booking.booking_reference || booking.id,
        total: indianMoney(total),
        paid: indianMoney(paid),
        balance: indianMoney(Math.max(0, total - paid))
      };
    }

    openWhatsApp(customer.phone, fill(templates[key] || defaults[key], data));
  });

  setupEditor();
  addCardActions();
  const observer = new MutationObserver(addCardActions);
  ["leadList", "bookingList"].forEach(id => {
    const node = $(id);
    if (node) observer.observe(node, { childList: true, subtree: true });
  });
})();