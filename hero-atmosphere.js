/* Himalayan Odyssey — mobile hero snowfall canvas.
   Isolated to the homepage hero; pauses when hidden or off-screen. */
(() => {
  const mobile = window.matchMedia("(max-width: 760px)");
  if (!mobile.matches) return;

  const start = () => {
    const hero = document.getElementById("home");
    if (!hero || hero.querySelector(".hero-atmosphere-canvas")) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-atmosphere-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("role", "presentation");
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      canvas.remove();
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const random = (min, max) => min + Math.random() * (max - min);
    let width = 1;
    let height = 1;
    let dpr = 1;
    let flakes = [];
    let frame = 0;
    let lastTime = 0;
    let visible = true;
    let resumeTimer = 0;

    const makeFlake = (randomY = true) => {
      const depth = random(0.55, 1);
      return {
        x: random(-12, width + 12),
        y: randomY ? random(-12, height + 12) : random(-30, -8),
        depth,
        radius: random(0.8, 2.35) * depth,
        speedX: random(-7, 19) * depth,
        speedY: random(34, 88) * depth,
        alpha: random(0.42, 0.92)
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const flake of flakes) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255," + flake.alpha.toFixed(2) + ")";
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      const nextDpr = Math.min(window.devicePixelRatio || 1, 1.0);
      if (width === nextWidth && height === nextHeight && dpr === nextDpr) return;
      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(28, Math.min(54, Math.round((width * height) / 8500)));
      flakes = Array.from({ length: count }, () => makeFlake());
      draw();
    };

    const pause = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const animate = (time) => {
      if (!visible || document.hidden || reducedMotion) {
        frame = 0;
        return;
      }
      // Snow motion is decorative: cap canvas redraws near 24 fps on mobile.
      // Keep movement time-based, so the visible falling speed stays the same.
      if (time - lastTime < 1000 / 24 - 1) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const delta = Math.min(0.05, Math.max(0, (time - lastTime) / 1000));
      lastTime = time;

      for (const flake of flakes) {
        flake.x += flake.speedX * delta;
        flake.y += flake.speedY * delta;
        if (flake.y > height + 8 || flake.x > width + 14 || flake.x < -14) {
          Object.assign(flake, makeFlake(false));
          if (flake.x > width + 14) flake.x = -8;
          if (flake.x < -14) flake.x = width + 8;
        }
      }
      draw();
      frame = requestAnimationFrame(animate);
    };

    const play = () => {
      if (!visible || document.hidden || reducedMotion || resumeTimer || frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    };

    resize();
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          if (visible) play();
          else pause();
        }, { threshold: 0 })
      : null;

    if (observer) observer.observe(hero);
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(hero);
    else window.addEventListener("resize", resize, { passive: true });

    if (!reducedMotion) window.addEventListener("scroll", () => {
      if (!visible && !resumeTimer) return;
      pause();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        resumeTimer = 0;
        play();
      }, 150);
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pause();
      else play();
    });

    if (!reducedMotion) play();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
