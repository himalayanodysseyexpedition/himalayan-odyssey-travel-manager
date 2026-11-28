/* Optional GA4 integration.
   Leave analytics-config.json measurementId empty until the GA4 property is ready. */
(() => {
  const pendingEvents = [];
  // Tab-scoped first observed acquisition category; no identifiers or raw referrer/query stored.
  function classifyChannel(source,medium,paid,host,campaign){
    const src=String(source||"").trim().toLowerCase();
    const m=String(medium||"").trim().toLowerCase();
    if(paid||/^(cpc|ppc|paid|paidsearch|paid_search|paid_social|display|cpm|ads)$/.test(m))return "paid_campaign";
    if(src==="google" && String(campaign||"").trim().toLowerCase()==="google_business_profile")return "google_business_profile";
    const aliases={google:"google_search",bing:"bing_search",instagram:"instagram",ig:"instagram",facebook:"facebook",fb:"facebook",chatgpt:"chatgpt",openai:"chatgpt",gemini:"gemini",perplexity:"perplexity",tripoto:"tripoto",whatsapp:"whatsapp",wa:"whatsapp",medium:"travel_referral",blogger:"travel_referral",holidify:"travel_referral",pinterest:"pinterest",quora:"quora"};
    if(Object.prototype.hasOwnProperty.call(aliases,src))return aliases[src];
    if(src||m)return "other_campaign";
    if(!host)return "unknown";
    const h=host.toLowerCase();
    const domain=d=>h===d||h.endsWith("."+d);
    if(domain("gemini.google.com"))return "gemini";
    if(domain("google.com")||domain("google.co.in")||domain("google.co.uk"))return "google_search";
    if(domain("bing.com"))return "bing_search";
    if(domain("instagram.com"))return "instagram";
    if(domain("facebook.com")||domain("fb.com"))return "facebook";
    if(domain("chatgpt.com")||domain("chat.openai.com"))return "chatgpt";
    if(domain("perplexity.ai"))return "perplexity";
    if(domain("tripoto.com"))return "tripoto";
    if(domain("wa.me")||domain("whatsapp.com"))return "whatsapp";
    if(domain("pinterest.com")||domain("pinterest.co.in"))return "pinterest";
    if(domain("quora.com"))return "quora";
    if(domain("holidify.com")||domain("medium.com")||domain("blogspot.com"))return "travel_referral";
    return "referral";
  }
  function safeLandingPath(path){return typeof path==="string"&&path.length<=100&&/^\/[a-z0-9/_\-.]*$/i.test(path)&&!/\d{7,}/.test(path)?path:"/";}
  const acquisition = (() => {
    let host = '';
    try { const ref = new URL(document.referrer); if (ref.origin !== location.origin && /^https?:$/.test(ref.protocol)) host = ref.hostname; } catch (_) {}
    const p = new URLSearchParams(location.search);
    const current = {channel: classifyChannel(p.get('utm_source'), p.get('utm_medium'), p.has('gclid') || p.has('msclkid'), host, p.get('utm_campaign')), landing: safeLandingPath(location.pathname)};
    const key = 'hoe-acquisition-v1';
    try {
      const previous = JSON.parse(sessionStorage.getItem(key) || 'null');
      const known = /^(google_business_profile|google_search|bing_search|instagram|facebook|chatgpt|gemini|perplexity|tripoto|whatsapp|travel_referral|pinterest|quora|paid_campaign|other_campaign|referral|unknown)$/;
      if (previous && known.test(previous.channel) && typeof previous.landing === 'string' && safeLandingPath(previous.landing) === previous.landing) return {channel: previous.channel, landing: previous.landing};
      sessionStorage.setItem(key, JSON.stringify(current));
    } catch (_) { /* Storage may be disabled; use current page evidence. */ }
    return current;
  })();

  // Use page intent as a fallback for public landing-page enquiries.
  const pageService = (path) => {
    const slug = String(path || "").replace(/^\/+|\/+$/g, "");
    if (/^blog(?:\/|$)/.test(slug)) return "travel_guide";
    if (/(?:taxi|cab)/.test(slug)) return "cab";
    if (/(?:hotels|homestays)/.test(slug)) return "accommodation";
    if (slug === "himachal-b2b-tour-operator") return "b2b";
    if (/(?:places-to-visit|best-time-to-visit)/.test(slug)) return "destination";
    if (/(?:tour|trip|expedition)/.test(slug)) return "tour_package";
    return "general";
  };

  // Landing-page intent is a proxy, never a declaration of actual party size.
  const audienceIntent = (path) => {
    const slug = String(path || "").replace(/^\/+|\/+$/g, "");
    if (slug === "spiti-valley-solo-trip") return "solo_group_interest";
    if (slug === "spiti-valley-couple-tour") return "two_traveller_interest";
    if (/^(spiti-valley-tours|winter-spiti-tours|summer-spiti-tour|spiti-tour-from-chandigarh|spiti-tour-from-across-india)(?:\/|$)/.test(slug)) return "group_or_private_interest";
    if (/^(kinnaur-tours|narkanda-tours)$/.test(slug)) return "regional_tour_interest";
    if (/taxi|cab/.test(slug)) return "cab_interest";
    if (slug === "blog/spiti-group-tour-booking-checklist-2027") return "group_booking_research";
    return "other";
  };

  const track = (eventName, parameters = {}) => {
    if (["whatsapp_click", "generate_lead", "guide_to_booking_click"].includes(eventName)) {
      parameters = { ...parameters, audience_intent: audienceIntent(acquisition.landing), enquiry_page_intent: audienceIntent(location.pathname) };
    }
    if (eventName === "whatsapp_click") {
      const service = parameters.enquiry_service ||
        (parameters.form_name === "website_enquiry" ? "website_form" :
         parameters.form_name === "trip_calculator" ? "trip_calculator" : pageService(window.location.pathname));
      parameters = { ...parameters, enquiry_service: service, link_url: "https://wa.me/", acquisition_channel: acquisition.channel, acquisition_landing: acquisition.landing };
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, parameters);
    } else if (pendingEvents.length < 50) {
      pendingEvents.push([eventName, parameters]);
    }
  };

  window.HOEAnalytics = { track, getAcquisition: () => ({ ...acquisition }) };

  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link || event.defaultPrevented) return;
    let url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    // Measure guide-to-booking navigation separately from actual WhatsApp enquiries.
    if (url.origin === window.location.origin && /^\/blog\//.test(window.location.pathname)) {
      const commercialPaths = new Set([
        "/spiti-valley-tours/", "/winter-spiti-tours/", "/spiti-tour-from-chandigarh/",
        "/kinnaur-tours/", "/narkanda-tours/", "/summer-spiti-tour/",
        "/chandigarh-to-spiti-valley-taxi/", "/delhi-to-spiti-valley-taxi/",
        "/spiti-valley-hotels-homestays/", "/spiti-valley-taxi-service/",
        "/kinnaur-hotels-homestays/", "/kaza-hotels-homestays/", "/tabo-hotels-homestays/",
        "/spiti-valley-private-tour/", "/spiti-valley-family-tour/", "/spiti-valley-couple-tour/",
        "/spiti-valley-solo-trip/", "/spiti-valley-budget-trip/", "/kaza-sightseeing-taxi/", "/himachal-b2b-tour-operator/"
      ]);
      if (commercialPaths.has(url.pathname)) {
        track("guide_to_booking_click", {
          page_path: window.location.pathname,
          destination_path: url.pathname,
          enquiry_service: pageService(url.pathname),
          acquisition_channel: acquisition.channel,
          acquisition_landing: acquisition.landing
        });
      }
    }
    if (url.protocol !== "https:" || !["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname)) return;
    const service =
      link.closest("#heroPromoCarousel, .mobile-next-departure, .group-departure-card, #fixed-departures") ? "group_tour" :
      link.closest("#packageList, .package-slide:not(.itinerary-slide), #published-tour-options") ? "tour_package" :
      link.closest("#itineraryList, .itinerary-slide") ? "itinerary" :
      link.closest("#cabList, .cab-card, #published-cab-options") ? "cab" :
      link.closest("#galleryList, .hotel-card, #published-stay-options") ? "accommodation" :
      link.closest(".destination-card") ? "destination" : pageService(window.location.pathname);
    track("whatsapp_click", {
      enquiry_service: service,
      enquiry_placement: link.closest(".hoe-floating-whatsapp") ? "floating" : link.closest(".hoe-inventory") ? "catalogue" : link.closest("#fixed-departures") ? "fixed_departure" : "page_link",
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
