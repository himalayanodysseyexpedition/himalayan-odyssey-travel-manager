/* Build the hero's layered cards from the existing admin-managed destinations. */
(() => {
  "use strict";
  const hero = document.getElementById("home");
  if (!hero || hero.querySelector(".hero-card-stack")) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stack = document.createElement("div");
  stack.className = "hero-card-stack";
  stack.setAttribute("aria-label", "Explore Himalayan destinations");
  stack.setAttribute("aria-live", "off");
  hero.appendChild(stack);

  const safeUrl = value => {
    try {
      const url = new URL(value || "/destinations/", window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "/destinations/";
    } catch (_) { return "/destinations/"; }
  };

  const render = items => {
    const selected = (items || []).filter(item => item && item.title && item.image_url).slice(0, 5);
    if (!selected.length) { stack.remove(); return; }
    selected.forEach((item, index) => {
      const link = document.createElement("a");
      link.className = "hero-stack-card";
      link.href = safeUrl(item.link_url);
      link.setAttribute("aria-label", "Explore " + item.title);
      link.style.setProperty("--hero-card-order", String(index));
      const photo = document.createElement("img");
      photo.src = item.image_url;
      photo.alt = item.title + " in Himachal Pradesh";
      photo.loading = index < 3 ? "eager" : "lazy";
      photo.decoding = "async";
      const title = document.createElement("span");
      title.textContent = item.title;
      link.append(photo, title);
      stack.appendChild(link);
    });
    if (selected.length < 2 || reducedMotion) return;
    let timer = null;
    const pause = () => { if (timer) window.clearInterval(timer); timer = null; };
    const resume = () => {
      pause();
      if (document.hidden) return;
      timer = window.setInterval(() => {
        if (document.hidden || stack.matches(":hover") || stack.contains(document.activeElement)) return;
        stack.appendChild(stack.firstElementChild);
      }, 3600);
    };
    stack.addEventListener("mouseenter", pause);
    stack.addEventListener("mouseleave", resume);
    stack.addEventListener("focusin", pause);
    stack.addEventListener("focusout", resume);
    document.addEventListener("visibilitychange", resume);
    resume();
  };

  const load = async () => {
    if (!window.supabase) { stack.remove(); return; }
    try {
      const client = window.supabase.createClient(
        "https://ynkoiuyjevclypumnyes.supabase.co",
        "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-"
      );
      const { data, error } = await client.from("destinations")
        .select("title,image_url,link_url,sort_order")
        .eq("is_active", true).order("sort_order", { ascending: true }).limit(5);
      if (error) throw error;
      render(data);
    } catch (error) {
      console.warn("Hero destination cards could not be loaded:", error);
      stack.remove();
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load, { once: true });
  } else load();
})();
