/* Shared accessible compact hamburger navigation for every public page. */
(() => {
  "use strict";
  const header = document.querySelector("body>header");
  const nav = header?.querySelector("nav.glass-nav");
  const inner = header?.querySelector(".header-inner");
  if (!header || !nav || !inner || header.querySelector(".header-menu-toggle")) return;

  /* Load after legacy inline page styles so they cannot restore the old nav. */
  const finalCss = document.createElement("link");
  finalCss.rel = "stylesheet";
  finalCss.href = "/hamburger-header-final.css?v=9";
  document.head.appendChild(finalCss);
  /* The shared stylesheet is the single source of truth for header presentation. */
  const button = document.createElement("button");
  button.className = "header-menu-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "Open navigation menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "siteMainNavigation");
  /* Build the three-line icon with DOM nodes so it cannot be stripped by HTML sanitizers. */
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("width", "22");
  icon.setAttribute("height", "22");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  const menuLines = document.createElementNS("http://www.w3.org/2000/svg", "path");
  menuLines.setAttribute("d", "M4 6h16M4 12h16M4 18h16");
  menuLines.setAttribute("class", "menu-icon-lines");
  icon.appendChild(menuLines);
  button.appendChild(icon);
  nav.id = nav.id || "siteMainNavigation";
  nav.setAttribute("aria-hidden", "true");

  /* Add a clear SVG chevron to the Services dropdown. */
  const servicesToggle = nav.querySelector(".nav-dropdown-toggle");
  if (servicesToggle && !servicesToggle.querySelector(".services-chevron-icon")) {
    const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chevron.setAttribute("class", "services-chevron-icon");
    chevron.setAttribute("viewBox", "0 0 24 24");
    chevron.setAttribute("width", "16");
    chevron.setAttribute("height", "16");
    chevron.setAttribute("fill", "none");
    chevron.setAttribute("stroke", "currentColor");
    chevron.setAttribute("stroke-width", "2");
    chevron.setAttribute("stroke-linecap", "round");
    chevron.setAttribute("stroke-linejoin", "round");
    chevron.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "m6 9 6 6 6-6");
    chevron.appendChild(path);
    servicesToggle.appendChild(chevron);
  }
  inner.insertBefore(button, nav);

  const close = (restoreFocus = false) => {
    header.classList.remove("menu-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open navigation menu");
    nav.setAttribute("aria-hidden", "true");
    nav.querySelectorAll(".nav-dropdown.open").forEach(dropdown => {
      dropdown.classList.remove("open");
      dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
    if (restoreFocus) button.focus();
  };

  button.addEventListener("click", () => {
    const open = !header.classList.contains("menu-open");
    header.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    nav.setAttribute("aria-hidden", String(!open));
  });

  nav.addEventListener("click", event => {
    const toggle = event.target.closest(".nav-dropdown-toggle");
    if (toggle) {
      event.preventDefault();
      const dropdown = toggle.closest(".nav-dropdown");
      const open = !dropdown.classList.contains("open");
      dropdown.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      return;
    }
    if (event.target.closest("a")) close();
  });

  document.addEventListener("click", event => {
    if (!header.contains(event.target)) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) close(true);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) close();
  }, { passive: true });
})();