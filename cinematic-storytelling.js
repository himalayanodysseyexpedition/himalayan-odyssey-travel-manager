/* Scroll-led storytelling for Himalayan Odyssey Expedition.
   Uses native observers and requestAnimationFrame; no animation dependency. */
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("body > header");
  const hero = document.querySelector(".hero");
  const progress = document.getElementById("scrollProgress");
  const scenes = [...document.querySelectorAll(
    "#our-approach,#upcoming-packages,#destinations,#travel-guides,#packages,#itineraries,#cabs,#gallery,#reviews,#faq,#instagram"
  )];
  const parallaxImages = [...document.querySelectorAll(
    ".destination-card img,.group-departure-photo img,.guide-card img"
  )];

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
    if (header) header.classList.toggle("is-scrolled", y > 70);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, y / max * 100) : 0) + "%";
    }
    if (!reduceMotion && hero && y < window.innerHeight * 1.2) {
      hero.style.setProperty("--story-hero-shift", (y * 0.16).toFixed(1) + "px");
    }
    if (!reduceMotion && window.innerWidth > 700) {
      parallaxImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > window.innerHeight + 80) return;
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        img.style.setProperty("--story-parallax", (center * -0.025).toFixed(1) + "px");
      });
    }
    ticking = false;
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();

  // Respect hash navigation while the transparent header overlays the hero.
  document.querySelectorAll('header a[href^="#"]').forEach(link => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.classList.add("story-inview");
    });
  });
})();