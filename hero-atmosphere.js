/* Himalayan Odyssey — mobile hero starfield and snowfall.
   Canvas is isolated to the homepage hero and pauses when hidden/off-screen. */
(() => {
  const media = window.matchMedia("(max-width: 760px)");
  if (!media.matches) return;

  const start = () => {
    const hero = document.getElementById("home");
    if (!hero || hero.querySelector(".hero-atmosphere-canvas")) return;
    const canvas = document.createElement("canvas");
    canvas.className = "hero-atmosphere-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("role", "presentation");
    hero.insertBefore(canvas, hero.firstChild);
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) { canvas.remove(); return; }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, dpr = 1, raf = 0, lastTime = 0, visible = true;
    let stars = [], flakes = [];
    const random = (min, max) => min + Math.random() * (max - min);

    const draw = (time, advance = true) => {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        const twinkle = reducedMotion ? 0.82 : 0.62 + Math.sin(time * 0.001 * star.speed + star.phase) * 0.24;
        ctx.beginPath();
        ctx.fillStyle = "rgba(230,244,255," + (star.alpha * twinkle).toFixed(3) + ")";
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const flake of flakes) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(244,250,255," + flake.alpha.toFixed(3) + ")";
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
        if (advance && !reducedMotion) {
          const dt = Math.min(0.04, (time - lastTime) / 1000 || 0);
          flake.y += flake.speed * dt;
          flake.x += (flake.drift + Math.sin(time * 0.00055 + flake.phase) * 5) * dt;
          if (flake.y > height + 4) { flake.y = -4; flake.x = random(0, width); }
          if (flake.x < -4) flake.x = width + 4;
          if (flake.x > width + 4) flake.x = -4;
        }
      }
    };

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: 76 }, () => ({
        x: random(0, width), y: random(0, height), radius: random(0.45, 1.25),
        phase: random(0, Math.PI * 2), speed: random(0.35, 1.15), alpha: random(0.28, 0.72)
      }));
      flakes = Array.from({ length: Math.max(24, Math.min(42, Math.round(width / 9))) }, () => ({
        x: random(0, width), y: random(0, height), radius: random(0.65, 1.8),
        speed: random(13, 30), drift: random(-7, 7), phase: random(0, Math.PI * 2),
        alpha: random(0.28, 0.68)
      }));
      draw(0, false);
    };

    const pause = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const animate = (time) => {
      if (!visible || document.hidden || reducedMotion) { raf = 0; return; }
      draw(time, true);
      lastTime = time;
      raf = requestAnimationFrame(animate);
    };
    const play = () => {
      if (!visible || document.hidden || reducedMotion || raf) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) play(); else pause();
    }, { threshold: 0 });
    observer.observe(hero);
    document.addEventListener("visibilitychange", () => document.hidden ? pause() : play());
    window.addEventListener("resize", resize, { passive: true });
    resize();
    play();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
