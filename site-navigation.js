/* Robust shared hamburger navigation for every public page. */
(() => {
  "use strict";

  const MENU_ITEMS = [
    ["/destinations/", "Destinations"],
    ["/travel-guides/", "Travel Guides"],
    ["/#cabs", "Vacation Cabs"],
    ["/#gallery", "Hotels & Properties"],
    ["/suppliers/", "List Your Vacation Property"]
  ];

  function init() {
    const header =
      document.querySelector("header.sitewide-header") ||
      document.querySelector("body > header") ||
      document.querySelector("header");
    if (!header) return;

    const inner = header.querySelector(".header-inner") || header;
    let nav = inner.querySelector("nav.glass-nav, nav.site-nav, nav[aria-label='Main navigation']");
    if (!nav) {
      nav = document.createElement("nav");
      nav.setAttribute("aria-label", "Main navigation");
      inner.appendChild(nav);
    }

    nav.classList.add("glass-nav");
    nav.id = "mobileMainNavigation";
    nav.innerHTML = MENU_ITEMS.map(([href, label]) =>
      '<a href="' + href + '"><span>' + label + '</span></a>'
    ).join("");

    let button = inner.querySelector(".header-menu-toggle") || header.querySelector(".header-menu-toggle");
    if (!button) {
      button = document.createElement("button");
      button.className = "header-menu-toggle";
      button.type = "button";
      button.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>';
      inner.insertBefore(button, nav);
    } else if (button.parentElement !== inner) {
      inner.insertBefore(button, nav);
    }

    button.setAttribute("aria-label", "Open navigation menu");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", nav.id);
    nav.setAttribute("aria-hidden", "true");

    if (!document.getElementById("sitewide-hamburger-stylesheet")) {
      const link = document.createElement("link");
      link.id = "sitewide-hamburger-stylesheet";
      link.rel = "stylesheet";
      link.href = "/hamburger-header-final.css?v=13";
      document.head.appendChild(link);
    }

    const applyOpenStyles = () => {
      header.style.setProperty("position", "relative", "important");
      header.style.setProperty("overflow", "visible", "important");
      header.style.setProperty("z-index", "1400", "important");
      inner.style.setProperty("position", "relative", "important");
      inner.style.setProperty("overflow", "visible", "important");
      nav.style.setProperty("display", "flex", "important");
      nav.style.setProperty("visibility", "visible", "important");
      nav.style.setProperty("opacity", "1", "important");
      nav.style.setProperty("pointer-events", "auto", "important");
      nav.style.setProperty("position", "absolute", "important");
      nav.style.setProperty("top", "calc(100% + 7px)", "important");
      nav.style.setProperty("right", "10px", "important");
      nav.style.setProperty("left", "auto", "important");
      nav.style.setProperty("z-index", "1500", "important");
      nav.style.setProperty("width", "min(310px, calc(100vw - 20px))", "important");
      nav.style.setProperty("max-height", "min(72vh, 520px)", "important");
      nav.style.setProperty("overflow-y", "auto", "important");
      nav.style.setProperty("flex-direction", "column", "important");
      nav.style.setProperty("align-items", "stretch", "important");
      nav.style.setProperty("gap", "5px", "important");
      nav.style.setProperty("padding", "10px", "important");
      nav.style.setProperty("background", "rgba(0,0,0,.78)", "important");
      nav.style.setProperty("background-color", "rgba(0,0,0,.78)", "important");
      nav.style.setProperty("border", "1px solid rgba(255,255,255,.16)", "important");
      nav.style.setProperty("border-radius", "18px", "important");
      nav.style.setProperty("box-shadow", "0 18px 46px rgba(0,0,0,.34)", "important");
      nav.style.setProperty("backdrop-filter", "blur(22px) saturate(125%)", "important");
      nav.style.setProperty("-webkit-backdrop-filter", "blur(22px) saturate(125%)", "important");
      nav.querySelectorAll("a").forEach(a => {
        a.style.setProperty("display", "flex", "important");
        a.style.setProperty("align-items", "center", "important");
        a.style.setProperty("min-height", "46px", "important");
        a.style.setProperty("padding", "0 14px", "important");
        a.style.setProperty("color", "#fff", "important");
        a.style.setProperty("-webkit-text-fill-color", "#fff", "important");
        a.style.setProperty("background", "transparent", "important");
        a.style.setProperty("text-decoration", "none", "important");
        a.style.setProperty("border", "0", "important");
      });
    };

    const close = () => {
      header.classList.remove("menu-open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open navigation menu");
      nav.setAttribute("aria-hidden", "true");
      ["display","visibility","opacity","pointer-events","position","top","right","left","z-index","width","max-height","overflow-y","flex-direction","align-items","gap","padding","background","background-color","border","border-radius","box-shadow","backdrop-filter","-webkit-backdrop-filter"].forEach(p => nav.style.removeProperty(p));
      nav.querySelectorAll("a").forEach(a => {
        ["display","align-items","min-height","padding","color","-webkit-text-fill-color","background","text-decoration","border"].forEach(p => a.style.removeProperty(p));
      });
      header.style.removeProperty("position");
      header.style.removeProperty("overflow");
      header.style.removeProperty("z-index");
      inner.style.removeProperty("position");
      inner.style.removeProperty("overflow");
    };

    if (button.dataset.sharedHamburgerReady === "true") return;
    button.dataset.sharedHamburgerReady = "true";

    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const open = button.getAttribute("aria-expanded") !== "true";
      if (open) {
        header.classList.add("menu-open");
        button.setAttribute("aria-expanded", "true");
        button.setAttribute("aria-label", "Close navigation menu");
        nav.setAttribute("aria-hidden", "false");
        if (window.matchMedia("(max-width: 760px)").matches) applyOpenStyles();
      } else {
        close();
      }
    });

    nav.addEventListener("click", event => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("click", event => {
      if (!header.contains(event.target) && button.getAttribute("aria-expanded") === "true") close();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        close();
        button.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 760px)").matches) close();
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();