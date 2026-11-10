/* Himalayan Odyssey — cinematic header scroll behaviour */
(() => {
  const header = document.querySelector("body>header");
  if (!header) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dropdown = header.querySelector(".nav-dropdown");
  let lastY = Math.max(0, window.scrollY);
  let ticking = false;
  let direction = "up";

  const render = () => {
    // On mobile, keep the header sticky and unchanged; desktop scroll behaviour stays intact.
    if (window.matchMedia("(max-width: 760px)").matches) {
      header.classList.remove("is-scrolled", "is-hidden");
      ticking = false;
      return;
    }

    const y = Math.max(0, window.scrollY);
    const delta = y - lastY;

    if (Math.abs(delta) > 5) {
      direction = delta > 0 ? "down" : "up";
      lastY = y;
    }

    const atTop = y < 36;
    const menuOpen = dropdown?.classList.contains("open") === true;

    // At the top the header remains in normal page flow. Once scrolling,
    // it becomes fixed glass and can hide/reappear without covering hero content.
    header.classList.toggle("is-scrolled", !atTop);
    if (atTop || direction === "up" || menuOpen) {
      header.classList.remove("is-hidden");
    } else if (y > 90) {
      header.classList.add("is-hidden");
    }

    if (atTop) direction = "up";
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    if (reducedMotion) {
      render();
      return;
    }
    window.requestAnimationFrame(render);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  dropdown?.querySelector(".nav-dropdown-toggle")?.addEventListener("click", () => {
    if (dropdown.classList.contains("open")) header.classList.remove("is-hidden");
  });

  render();
})();
