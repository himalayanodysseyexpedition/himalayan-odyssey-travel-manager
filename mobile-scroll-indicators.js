/* Mobile-only persistent scroll indicators. Desktop native scrolling is untouched. */
(() => {
  "use strict";
  const mobile = window.matchMedia("(max-width: 760px)");
  if (!mobile.matches) return;

  const style = document.createElement("style");
  style.textContent = `
    @media (max-width:760px) {
      .mobile-page-scroll-indicator {
        position:fixed; z-index:9997; right:3px; top:14vh; bottom:14vh;
        width:5px; border-radius:99px; background:rgba(0,0,0,.13);
        pointer-events:none; opacity:0; transition:opacity .2s ease;
      }
      .mobile-page-scroll-indicator.is-visible { opacity:1; }
      .mobile-page-scroll-indicator .mobile-scroll-thumb {
        position:absolute; left:0; top:0; width:100%; min-height:24px;
        border-radius:99px; background:#171717;
        box-shadow:0 0 0 1px rgba(255,255,255,.55);
        will-change:transform,height;
      }
      .mobile-carousel-scroll-indicator {
        display:block; position:relative; width:min(100%,220px); height:4px;
        margin:7px auto 2px; border-radius:99px;
        background:#e5e5e5; overflow:hidden; pointer-events:none;
      }
      .mobile-carousel-scroll-indicator .mobile-scroll-thumb {
        position:absolute; inset:0 auto 0 0; width:30%;
        border-radius:99px; background:#171717;
        transition:width .12s ease; will-change:transform,width;
      }
      .mobile-scroll-indicator-host { scrollbar-width:none!important; }
    }
  `;
  document.head.appendChild(style);

  const makeThumb = (className) => {
    const track = document.createElement("div");
    track.className = className;
    track.setAttribute("aria-hidden", "true");
    const thumb = document.createElement("span");
    thumb.className = "mobile-scroll-thumb";
    track.appendChild(thumb);
    return {track, thumb};
  };

  const page = makeThumb("mobile-page-scroll-indicator");
  document.body.appendChild(page.track);
  const updatePage = () => {
    const root = document.documentElement;
    const max = Math.max(0, root.scrollHeight - window.innerHeight);
    const visible = max > 24;
    page.track.classList.toggle("is-visible", visible);
    if (!visible) return;
    const trackHeight = page.track.clientHeight;
    const thumbHeight = Math.max(24, trackHeight * window.innerHeight / root.scrollHeight);
    const travel = Math.max(0, trackHeight - thumbHeight);
    const progress = max ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    page.thumb.style.height = thumbHeight + "px";
    page.thumb.style.transform = "translateY(" + (travel * progress) + "px)";
  };

  const attachCarousel = (el) => {
    if (el.dataset.mobileScrollIndicator === "true") return;
    if (el.scrollWidth <= el.clientWidth + 8) return;
    el.dataset.mobileScrollIndicator = "true";
    el.classList.add("mobile-scroll-indicator-host");
    const indicator = makeThumb("mobile-carousel-scroll-indicator");
    el.insertAdjacentElement("afterend", indicator.track);
    const update = () => {
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      const ratio = el.clientWidth / el.scrollWidth;
      const width = Math.max(18, ratio * 100);
      const travel = Math.max(0, 100 - width);
      const progress = max ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0;
      indicator.thumb.style.width = width + "%";
      indicator.thumb.style.transform = "translateX(" + (travel * progress) + "%)";
      indicator.track.hidden = max <= 8;
    };
    el.addEventListener("scroll", update, {passive:true});
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    }
    update();
  };

  const scan = () => {
    document.querySelectorAll("body *").forEach((el) => {
      if (!(el instanceof HTMLElement) || el.dataset.mobileScrollIndicator === "true") return;
      const overflow = getComputedStyle(el).overflowX;
      if ((overflow === "auto" || overflow === "scroll") && el.scrollWidth > el.clientWidth + 8) {
        attachCarousel(el);
      }
    });
    updatePage();
  };

  let scheduled = false;
  const scheduleScan = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; scan(); });
  };
  window.addEventListener("scroll", updatePage, {passive:true});
  window.addEventListener("resize", scheduleScan, {passive:true});
  window.addEventListener("orientationchange", scheduleScan, {passive:true});
  if ("MutationObserver" in window) {
    new MutationObserver(scheduleScan).observe(document.body, {childList:true,subtree:true});
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleScan, {once:true});
  } else {
    scheduleScan();
  }
  setTimeout(scheduleScan, 900);
})();