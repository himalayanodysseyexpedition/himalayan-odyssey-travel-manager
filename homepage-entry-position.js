/* Ensure a fresh visit or reload of the homepage starts at the hero.
   Preserve intentional section deep-links and normal back/forward restoration. */
(() => {
  'use strict';
  const isHome = location.pathname === '/' || location.pathname === '/index.html';
  if (!isHome) return;

  const navigation = performance.getEntriesByType?.('navigation')?.[0];
  if (navigation?.type === 'back_forward') return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const moveToHero = () => {
    if (location.hash && location.hash !== '#home') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  window.addEventListener('pageshow', event => {
    if (event.persisted) return;
    requestAnimationFrame(() => requestAnimationFrame(moveToHero));
  });
})();
