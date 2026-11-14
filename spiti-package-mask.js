/* Adds the diagonal masked image reveal only to Spiti Valley package cards. */
(() => {
  const selector = "#packageList .package-slide";
  const enhance = (card) => {
    if (card.dataset.spitiMaskReady === "true") return;
    const title = card.querySelector(".card-body h3");
    const image = card.querySelector(":scope > img");
    if (!title || !image || !/spiti\s*valley/i.test(title.textContent || "")) return;
    const frame = document.createElement("span");
    frame.className = "spiti-mask-frame";
    frame.setAttribute("aria-hidden", "true");
    image.parentNode.insertBefore(frame, image);
    frame.appendChild(image);
    const overlay = image.cloneNode(false);
    overlay.removeAttribute("id");
    overlay.className = "spiti-mask-overlay";
    overlay.alt = "";
    overlay.setAttribute("aria-hidden", "true");
    frame.appendChild(overlay);
    card.classList.add("spiti-mask-card");
    card.dataset.spitiMaskReady = "true";
    card.addEventListener("touchstart", () => {
      card.classList.add("spiti-mask-active");
      window.setTimeout(() => card.classList.remove("spiti-mask-active"), 1500);
    }, {passive:true});
  };
  const scan = () => document.querySelectorAll(selector).forEach(enhance);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan, {once:true});
  else scan();
  const rail = document.getElementById("packageList");
  if (rail) new MutationObserver(scan).observe(rail, {childList:true,subtree:true});
})();
