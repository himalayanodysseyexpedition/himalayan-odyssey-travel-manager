/* Optional GA4 integration.
   Leave analytics-config.json measurementId empty until the GA4 property is ready. */
(() => {
  const pendingEvents = [];
  const track = (eventName, parameters = {}) => {
    if (eventName === "whatsapp_click") {
      const service = parameters.enquiry_service ||
        (parameters.form_name === "website_enquiry" ? "website_form" :
         parameters.form_name === "trip_calculator" ? "trip_calculator" : "general");
      parameters = { ...parameters, enquiry_service: service, link_url: "https://wa.me/" };
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, parameters);
    } else if (pendingEvents.length < 50) {
      pendingEvents.push([eventName, parameters]);
    }
  };

  window.HOEAnalytics = { track };

  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link || event.defaultPrevented) return;
    let url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    if (url.protocol !== "https:" || !["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname)) return;
    const service =
      link.closest("#heroPromoCarousel, .mobile-next-departure, .group-departure-card") ? "group_tour" :
      link.closest("#packageList, .package-slide:not(.itinerary-slide)") ? "tour_package" :
      link.closest("#itineraryList, .itinerary-slide") ? "itinerary" :
      link.closest("#cabList, .cab-card") ? "cab" :
      link.closest("#galleryList, .hotel-card") ? "accommodation" :
      link.closest(".destination-card") ? "destination" : "general";
    track("whatsapp_click", {
      enquiry_service: service,
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

    track("enquiry_form_intent", {
      form_name: "travel_enquiry",
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
      window.gtag("config", measurementId, { send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: window.location.origin + window.location.pathname });

      for (const [name, parameters] of pendingEvents.splice(0)) window.gtag("event", name, parameters);

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
      document.head.appendChild(script);
    })
    .catch(() => {
      // Analytics is optional; the website and enquiry flow work without it.
    });
})();
