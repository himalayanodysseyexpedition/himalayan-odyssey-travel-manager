/* Scroll-led storytelling for Himalayan Odyssey Expedition.
   Uses native observers and requestAnimationFrame; no animation dependency. */
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width:761px)");
  // Desktop homepage uses an immediately visible, static rendering path.
  if (desktop.matches) return;
  const hero = document.querySelector(".hero");
  const progress = document.getElementById("scrollProgress");
  const scenes = [...document.querySelectorAll(
    "#our-approach,#upcoming-packages,#destinations,#travel-guides,#packages,#itineraries,#cabs,#gallery,#reviews,#faq,#instagram"
  )];
  const parallaxImages = [...document.querySelectorAll(
    ".destination-card img,.group-departure-photo img,.guide-card img"
  )];

  const visibleParallax = new Set();
  if (!reduceMotion && "IntersectionObserver" in window) {
    const parallaxObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleParallax.add(entry.target);
        else visibleParallax.delete(entry.target);
      }
    }, {rootMargin: "80px 0px"});
    parallaxImages.forEach(img => parallaxObserver.observe(img));
  } else if (!reduceMotion) {
    parallaxImages.forEach(img => visibleParallax.add(img));
  }

  // Small chapter markers make the long homepage feel like a guided journey.
  const marker = document.createElement("div");
  marker.className = "story-progress-label";
  marker.setAttribute("aria-hidden", "true");
  scenes.forEach((scene, index) => {
    scene.classList.add("story-scene");
    const dot = document.createElement("span");
    dot.dataset.chapter = String(index);
    marker.appendChild(dot);
  });
  if (marker.children.length) document.body.appendChild(marker);

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("story-inview");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: "0px 0px -8% 0px" });
    scenes.forEach(scene => revealObserver.observe(scene));

    const chapterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = scenes.indexOf(entry.target);
        marker.querySelectorAll("span").forEach((dot, i) => dot.classList.toggle("active", i === index));
        marker.classList.toggle("active", window.scrollY > window.innerHeight * 0.65);
      });
    }, { threshold: 0.28 });
    scenes.forEach(scene => chapterObserver.observe(scene));
  } else {
    scenes.forEach(scene => scene.classList.add("story-inview"));
  }

  let ticking = false;
  const update = () => {
    const y = window.scrollY || 0;
    if (progress && !desktop.matches) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, y / max * 100) : 0) + "%";
    }
    if (!desktop.matches && !reduceMotion && hero && y < window.innerHeight * 1.2) {
      hero.style.setProperty("--story-hero-shift", (y * 0.16).toFixed(1) + "px");
    }
    if (!desktop.matches && !reduceMotion && window.innerWidth > 700) {
      // Read all geometry before writing styles to avoid repeated forced layout.
      const height = window.innerHeight;
      const updates = [];
      for (const img of visibleParallax) {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > height + 80) continue;
        updates.push([img, ((rect.top + rect.height / 2 - height / 2) * -0.025).toFixed(1) + "px"]);
      }
      for (const [img, value] of updates) if (img.style.getPropertyValue("--story-parallax") !== value) img.style.setProperty("--story-parallax", value);
    }
    ticking = false;
  };
  const requestUpdate = () => {
    if (desktop.matches || ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  desktop.addEventListener("change", () => {
    if (desktop.matches) {
      hero?.style.removeProperty("--story-hero-shift");
      for (const img of parallaxImages) img.style.removeProperty("--story-parallax");
    } else requestUpdate();
  });
  update();

  // Respect hash navigation while the transparent header overlays the hero.
  document.querySelectorAll('header a[href^="#"]').forEach(link => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.classList.add("story-inview");
    });
  });

})();