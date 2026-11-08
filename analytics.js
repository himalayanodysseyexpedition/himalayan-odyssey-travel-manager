/* Optional GA4 integration.
   Leave analytics-config.json measurementId empty until the GA4 property is ready. */
(() => {
  const track = (eventName, parameters = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, parameters);
    }
  };

  window.HOEAnalytics = { track };

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href*="wa.me"]');
    if (!link) return;
    track("whatsapp_click", {
      link_url: link.href,
      link_text: (link.innerText || "WhatsApp").trim().slice(0, 100),
      page_path: window.location.pathname
    });
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!form.matches("#travelEnquiryForm")) return;

    const phone = form.querySelector("#guestPhone")?.value.trim() || "";
    const persons = Number(form.querySelector("#travellers")?.value);
    const destination = form.querySelector("#destination")?.value.trim() || "";
    const month = form.querySelector("#travelMonth")?.value || "";
    const startDate = form.querySelector("#startDate")?.value || "";
    const endDate = form.querySelector("#endDate")?.value || "";

    if (!form.checkValidity() ||
        !/^[6-9][0-9]{9}$/.test(phone) ||
        !Number.isInteger(persons) || persons < 1 || persons > 100 ||
        !destination || !month || (startDate && endDate && endDate < startDate)) {
      return;
    }

    track("generate_lead", {
      form_name: "travel_enquiry",
      destination,
      travel_month: month,
      travellers: persons,
      page_path: window.location.pathname
    });
  });

  fetch("/analytics-config.json")
    .then((response) => response.ok ? response.json() : null)
    .then((config) => {
      const measurementId = config?.measurementId || "";
      if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;

      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: true });

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
      document.head.appendChild(script);
    })
    .catch(() => {
      // Analytics is optional; the website and enquiry flow work without it.
    });
})();
