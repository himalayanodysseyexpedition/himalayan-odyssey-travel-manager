/* Shared accessible Services dropdown for all public pages. */
(() => {
  "use strict";
  document.querySelectorAll("header .nav-dropdown").forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");
    const menu = dropdown.querySelector(".nav-dropdown-menu");
    if (!toggle || !menu) return;
    const close = () => {
      dropdown.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const open = !dropdown.classList.contains("open");
      dropdown.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        toggle.focus();
      }
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
  });
})();
