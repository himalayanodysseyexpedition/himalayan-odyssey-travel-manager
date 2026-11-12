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
  finalCss.href = "/hamburger-header-final.css?v=2";
  document.head.appendChild(finalCss);
  /* Synchronous cascade guard: do not depend on the external CSS finishing its request. */
  const forceHeaderStyle = document.createElement("style");
  forceHeaderStyle.id = "force-white-hamburger-header";
  forceHeaderStyle.textContent = `
    html body>header,html body header{background:#fff!important;background-color:#fff!important;background-image:none!important;color:#171717!important;border-bottom:1px solid #e7e7e5!important;box-shadow:0 3px 16px rgba(0,0,0,.045)!important}
    html body>header .header-inner,html body header .header-inner{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;min-height:58px!important;padding:5px 12px!important}
    html body>header .header-inner>a.brand,html body header .header-inner>a.brand{margin:0 auto 0 0!important;padding:0!important;justify-content:flex-start!important;background:transparent!important;box-shadow:none!important}
    html body>header .header-inner>a.brand img,html body header .header-inner>a.brand img{width:clamp(150px,43vw,190px)!important;max-height:44px!important;object-fit:contain!important}
    html body>header .header-inner>nav.glass-nav,html body header .header-inner>nav.glass-nav{display:none!important;position:absolute!important;top:calc(100% + 7px)!important;right:10px!important;left:auto!important}
    html body>header.menu-open .header-inner>nav.glass-nav,html body header.menu-open .header-inner>nav.glass-nav{display:flex!important}
    html body>header .header-menu-toggle{display:inline-flex!important;background:#fff!important;color:#171717!important;border:1px solid #e5e5e3!important}
    html body>header .header-tagline{display:none!important}
  `;
  document.head.appendChild(forceHeaderStyle);

  const button = document.createElement("button");
  button.className = "header-menu-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "Open navigation menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "siteMainNavigation");
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  nav.id = nav.id || "siteMainNavigation";
  nav.setAttribute("aria-hidden", "true");
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