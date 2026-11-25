/* Mobile-only hero photos and scroll parallax; no changes to admin data. */
(() => {
  "use strict";
  const mobile = window.matchMedia("(max-width: 760px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.getElementById("home");
  const track = document.getElementById("heroPromoTrack");
  if (!hero || !track) return;
  const photo = hero.querySelector("img.hero-ken-burns-photo");
  const pick = title => {
    const name = title.toLowerCase();
    // Real Sangla snowfall photograph by UnpetitproleX, CC0 1.0 (Wikimedia Commons).
    if (name.includes("kinnaur") && name.includes("spiti")) return ["https://upload.wikimedia.org/wikipedia/commons/0/02/Apple_and_walnut_orchards_after_a_night_of_snowfall_in_Sangla_in_the_Kinnaur_district_of_the_northern_Indian_state_of_Himachal_Pradesh.webp","Snow-covered orchards and Himalayan mountains in Sangla, Kinnaur",960,640];
    if (name.includes("kinnaur") || name.includes("kalpa") || name.includes("sangla")) return ["/kinnaur.jpg","Kinnaur village and Himalayan mountains",1200,1600];
    if (name.includes("spiti") || name.includes("kaza")) return ["/spiti.jpg","Snow-covered Key Monastery in Spiti Valley",1350,1800];
    if (name.includes("narkanda")) return ["/narkanda.jpg","Snow-covered forest in Narkanda",1013,1800];
    if (name.includes("manali")) return ["/manali.jpg","Himalayan mountains near Manali",1440,1800];
    return ["/kinnaur.jpg","Himalayan mountains in Kinnaur",1200,1600];
  };
  function refreshCards() {
    for (const card of track.querySelectorAll("section.mobile-next-departure")) {
      const title = card.querySelector("h2")?.textContent || card.getAttribute("aria-label") || "";
      const [src,alt,width,height] = pick(title);
      let img = card.querySelector("img.hoe-promo-thumb");
      if (!img) {
        img = document.createElement("img");
        img.className = "hoe-promo-thumb";
        img.decoding = "async";
        img.loading = "eager";
        card.prepend(img);
      }
      if (img.dataset.hoePhotoSource !== src) {
        img.dataset.hoePhotoSource = src;
        img.onerror = src.startsWith("https://upload.wikimedia.org/") ? () => {
          img.onerror = null;
          img.src = "/kinnaur.jpg";
          img.alt = "Kinnaur village and Himalayan mountains";
          img.width = 1200;
          img.height = 1600;
        } : null;
        img.alt = alt;
        img.width = width;
        img.height = height;
        if (img.getAttribute("src") !== src) img.src = src;
      }
    }
  }
  let pending = false;
  function update() {
    pending = false;
    if (!photo) return;
    if (reduced.matches) {
      photo.style.removeProperty("--hoe-hero-offset");
      return;
    }
    const rect = hero.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    const offset = Math.min(56, Math.max(0, -rect.top * 0.14));
    photo.style.setProperty("--hoe-hero-offset", offset.toFixed(1) + "px");
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }
  function resize() { refreshCards(); schedule(); }
  if ("MutationObserver" in window) new MutationObserver(refreshCards).observe(track,{childList:true});
  refreshCards();
  update();
  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",resize,{passive:true});
  if (mobile.addEventListener) mobile.addEventListener("change",resize);
  if (reduced.addEventListener) reduced.addEventListener("change",schedule);
})();
