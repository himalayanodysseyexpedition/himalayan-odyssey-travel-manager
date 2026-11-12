/* Shared accessible hamburger navigation for every public page. */
(() => {
  "use strict";
  const header = document.querySelector("body>header");
  const nav = header?.querySelector("nav.glass-nav");
  if (!header || !nav || header.querySelector(".header-menu-toggle")) return;

  const button = document.createElement("button");
  button.className = "header-menu-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "Open navigation menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "siteMainNavigation");
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  nav.id = nav.id || "siteMainNavigation";
  nav.setAttribute("aria-hidden", "true");
  header.querySelector(".header-inner")?.insertBefore(button, nav);

  const close = (restoreFocus = false) => {
    header.classList.remove("menu-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open navigation menu");
    nav.setAttribute("aria-hidden", "true");
    if (restoreFocus) button.focus();
  };
  button.addEventListener("click", () => {
    const open = !header.classList.contains("menu-open");
    header.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    nav.setAttribute("aria-hidden", String(!open));
  });
  document.addEventListener("click", event => {
    if (!header.contains(event.target)) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) close(true);
  });
  nav.addEventListener("click", event => {
    if (event.target.closest("a") && !event.target.closest(".nav-dropdown-menu")) close();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) close();
  }, { passive: true });
})();