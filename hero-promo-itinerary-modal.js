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
    addText("h3", "Itinerary");
    const items = Array.isArray(record.itinerary_items) ? record.itinerary_items : [];
    const days = items.map((item, index) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return {day_number: Number(item.day_number) || index + 1, heading: String(item.heading || ""), overnight_stay: String(item.overnight_stay || ""), description: String(item.description || "")};
      }
      return {day_number: index + 1, heading: "", overnight_stay: "", description: String(item || "")};
    }).filter(day => day.heading || day.overnight_stay || day.description);
    if (days.length) {
      const dayList = document.createElement("div");
      dayList.className = "promo-day-list";
      days.forEach((day, index) => {
        const card = document.createElement("section");
        card.className = "promo-day-card";
        const heading = document.createElement("h4");
        heading.textContent = "DAY " + (day.day_number || index + 1) + (day.heading ? " · " + day.heading : "");
        card.appendChild(heading);
        if (day.overnight_stay) {
          const stay = document.createElement("p");
          stay.className = "promo-day-stay";
          stay.textContent = "OVERNIGHT STAY · " + day.overnight_stay;
          card.appendChild(stay);
        }
        if (day.description) {
          const description = document.createElement("p");
          description.className = "promo-day-description";
          description.textContent = day.description;
          card.appendChild(description);
        }
        dayList.appendChild(card);
      });
      content.appendChild(dayList);
    } else {
      addText("p", "The detailed itinerary is being updated. Please contact our team for the latest plan.", "promo-itinerary-empty");
      if (record.itinerary_url) {
        const link = document.createElement("a");
        link.href = record.itinerary_url;
        link.textContent = "Open itinerary page";
        link.className = "promo-itinerary-page-link";
        content.appendChild(link);
      }
    }
    addText("p", "The itinerary may be adjusted according to weather, road and safety conditions.", "promo-itinerary-note");
  };

  const open = record => {
    lastFocus = document.activeElement;
    if (record) {
      title.textContent = (record.title_line1 + " " + (record.title_emphasis || "") + " " + (record.title_line2 || "")).replace(/\s+/g, " ").trim() + " — Itinerary";
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