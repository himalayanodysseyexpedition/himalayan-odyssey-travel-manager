"use strict";
(() => {
  const modal = document.getElementById("promo-itinerary-modal");
  const track = document.getElementById("heroPromoTrack");
  if (!modal || !track) return;

  const closeButton = modal.querySelector(".promo-itinerary-close");
  const title = modal.querySelector("#promo-itinerary-title");
  const eyebrow = modal.querySelector(".promo-itinerary-head small");
  const content = modal.querySelector("#promo-itinerary-text");
  let lastFocus = null;

  const addText = (tag, text, className) => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    content.appendChild(node);
    return node;
  };

  const renderRecord = record => {
    content.replaceChildren();
    addText("p", [record.date_label, ...(record.facts || [])].filter(Boolean).join(" · "), "promo-itinerary-intro");
    if (Number(record.price_per_person) > 0) {
      addText("p", "Price: ₹" + Number(record.price_per_person).toLocaleString("en-IN") + " per person");
    }
    addText("h3", "Day-wise itinerary");
    const items = Array.isArray(record.itinerary_items) ? record.itinerary_items : [];
    if (!items.length) {
      addText("p", "The detailed itinerary is being updated. Please contact our team for the latest day-wise plan.", "promo-itinerary-empty");
      if (record.itinerary_url) {
        const link = document.createElement("a");
        link.href = record.itinerary_url;
        link.textContent = "Open itinerary page";
        link.className = "promo-itinerary-page-link";
        content.appendChild(link);
      }
    } else {
      const list = document.createElement("ol");
      items.forEach((item, index) => {
        const li = document.createElement("li");
        const raw = String(item || "").trim();
        const split = raw.match(/^(DAY\\s*\\d+\\s*[·—:-]?)\\s*(.*)$/i);
        const strong = document.createElement("strong");
        strong.textContent = split ? split[1].replace(/[·—:-]$/, "").trim() : "Day " + (index + 1);
        li.appendChild(strong);
        const detail = document.createElement("span");
        detail.textContent = split ? split[2] : raw;
        li.appendChild(detail);
        list.appendChild(li);
      });
      content.appendChild(list);
    }
    addText("p", "The itinerary may be adjusted according to weather, road and safety conditions.", "promo-itinerary-note");
  };

  const open = record => {
    lastFocus = document.activeElement;
    if (record) {
      title.textContent = (record.title_line1 + " " + (record.title_emphasis || "") + " " + (record.title_line2 || "")).replace(/\\s+/g, " ").trim() + " — Itinerary";
      eyebrow.textContent = record.kicker || "HIMALAYAN ODYSSEY EXPEDITION";
      renderRecord(record);
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("promo-itinerary-modal-open");
    closeButton.focus();
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("promo-itinerary-modal-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  };

  track.addEventListener("click", event => {
    const trigger = event.target.closest(".mobile-departure-itinerary");
    if (!trigger || !window.matchMedia("(max-width: 760px)").matches) return;
    event.preventDefault();
    const card = trigger.closest(".mobile-next-departure");
    const id = card && card.dataset.promoId;
    const records = Array.isArray(window.heroPromoRecords) ? window.heroPromoRecords : [];
    const record = records.find(item => String(item.id) === String(id || trigger.dataset.itineraryPromo));
    open(record || null);
  });

  closeButton.addEventListener("click", close);
  modal.addEventListener("click", event => {
    if (event.target === modal) close();
  });
  document.addEventListener("keydown", event => {
    if (modal.classList.contains("is-open") && event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });
})();