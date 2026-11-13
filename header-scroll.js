/* Himalayan Odyssey — keep the desktop header permanently visible while scrolling. */
(() => {
  const header = document.querySelector("body>header");
  if (!header) return;

  // The desktop header, logo, menu button and prayer-flag overlay stay in place.
  // Do not apply scroll-direction hide/show classes.
  header.classList.remove("is-scrolled", "is-hidden");
})();
