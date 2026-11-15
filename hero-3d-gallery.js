/* Supabase-backed, manually controlled 3D hero gallery. */
(() => {
  "use strict";

  const root = document.querySelector("[data-hero-3d-gallery]");
  if (!root || !window.supabase?.createClient) return;

  const stage = root.querySelector(".hero-3d-gallery__stage");
  const status = root.querySelector(".hero-3d-gallery__status");
  if (!stage || !status) return;

  const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  let rotation = 0;
  let pointer = null;
  let suppressClickUntil = 0;
  let cardsCount = 0;
  let radius = 0;

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[char]));

  const safeHref = value => {
    const href = String(value || "/build-your-trip/").trim();
    return /^(https?:\/\/|\/)/i.test(href) ? href : "/build-your-trip/";
  };

  function setRotation(value) {
    rotation = value;
    stage.style.transform = "perspective(1000px) rotateX(-8deg) rotateY(" + rotation + "deg)";
  }

  function positionCards() {
    const card = stage.querySelector(".hero-3d-gallery__card");
    if (!card || !cardsCount) return;
    const width = card.getBoundingClientRect().width || 86;
    radius = Math.max(width < 100 ? 132 : 158, width / (2 * Math.tan(Math.PI / cardsCount)) + 44);
    stage.querySelectorAll(".hero-3d-gallery__card").forEach((item, index) => {
      item.style.transform = "rotateY(" + (index * 360 / cardsCount) + "deg) translateZ(" + radius + "px)";
    });
    setRotation(rotation);
  }

  function render(items) {
    const valid = (items || []).filter(item => item && item.image_url);
    if (!valid.length) {
      status.textContent = "No published destination photos. Add photos in Admin → Destinations.";
      return;
    }

    cardsCount = valid.length;
    stage.innerHTML = valid.map((item, index) => {
      const title = escapeHTML(item.title || "Explore Himachal");
      const image = escapeHTML(item.image_url);
      const href = escapeHTML(safeHref(item.link_url));
      const loading = index < 3 ? "eager" : "lazy";
      return '<a class="hero-3d-gallery__card" href="' + href + '" aria-label="Explore ' + title + '">' +
        '<img src="' + image + '" alt="' + title + '" loading="' + loading + '" decoding="async" draggable="false">' +
        '<span class="hero-3d-gallery__card-title">' + title + '</span></a>';
    }).join("");

    status.hidden = true;
    root.classList.add("is-ready");
    positionCards();
    window.addEventListener("resize", positionCards, { passive:true });
  }

  async function loadGallery() {
    try {
      const { data, error } = await client
        .from("destinations")
        .select("title,tagline,image_url,link_url,sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending:true });

      if (error) throw error;
      render(data);
    } catch (error) {
      console.warn("Hero destination gallery could not be loaded:", error);
      status.textContent = "Gallery photos are temporarily unavailable.";
    }
  }

  stage.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    pointer = {
      id:event.pointerId,
      x:event.clientX,
      y:event.clientY,
      lastX:event.clientX,
      moved:false,
      cancelled:false
    };
    stage.classList.add("is-dragging");
    try { stage.setPointerCapture(event.pointerId); } catch (_) {}
  });

  stage.addEventListener("pointermove", event => {
    if (!pointer || pointer.id !== event.pointerId || pointer.cancelled) return;
    const dx = event.clientX - pointer.lastX;
    const totalX = event.clientX - pointer.x;
    const totalY = event.clientY - pointer.y;

    if (!pointer.moved && Math.abs(totalY) > 10 && Math.abs(totalY) > Math.abs(totalX)) {
      pointer.cancelled = true;
      return;
    }
    if (Math.abs(totalX) > 5) pointer.moved = true;
    if (pointer.moved) {
      setRotation(rotation + dx * 0.58);
      pointer.lastX = event.clientX;
    }
  });

  function finishPointer(event) {
    if (!pointer || (event && pointer.id !== event.pointerId)) return;
    if (pointer.moved) suppressClickUntil = Date.now() + 350;
    pointer = null;
    stage.classList.remove("is-dragging");
  }
  stage.addEventListener("pointerup", finishPointer);
  stage.addEventListener("pointercancel", finishPointer);
  stage.addEventListener("lostpointercapture", finishPointer);

  stage.addEventListener("click", event => {
    if (Date.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  stage.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setRotation(rotation - 30);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setRotation(rotation + 30);
    }
  });

  loadGallery();
})();
