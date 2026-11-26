(() => {
 const initCarousel = () => {
  const carousel = document.getElementById('heroPromoCarousel');
  const track = document.getElementById('heroPromoTrack');
  if (!carousel || !track) return;
  const slides = Array.from(track.querySelectorAll('.hero-promo-slide'));
  const dots = Array.from(carousel.querySelectorAll('.hero-promo-pagination button'));
  if (!slides.length || slides.length !== dots.length) return;
  let activeIndex = 0, ticking = false;
  // Keep the viewport tall enough for whichever departure has the tallest content.
  // This prevents the longer card from being clipped when it is swiped into view.
  const updateHeight = () => {
    const heights = slides
      .map(slide => slide.querySelector('.mobile-next-departure'))
      .filter(Boolean)
      .map(card => Math.ceil(card.getBoundingClientRect().height));
    const maxHeight = Math.max(0, ...heights);
    if (maxHeight > 0) {
      track.style.height = (maxHeight + 2) + 'px';
      slides.forEach(slide => { slide.style.height = maxHeight + 'px'; });
    }
  };
  const setActive = (index) => {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeIndex);
      if (i === activeIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    updateHeight();
  };
  const goTo = (index) => {
    const slide = slides[index];
    if (!slide) return;
    track.scrollTo({left:slide.offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    setActive(index);
  };

  if (slides.length > 1) {
    for (const [direction, step] of [['previous', -1], ['next', 1]]) {
      const arrow = document.createElement('button');
      arrow.type = 'button';
      arrow.className = 'hero-promo-arrow hero-promo-arrow-' + direction;
      arrow.setAttribute('aria-label', direction === 'next' ? 'Next departure' : 'Previous departure');
      arrow.setAttribute('aria-controls', track.id);
      arrow.addEventListener('click', () => {
        pauseForInteraction();
        goTo((activeIndex + step + slides.length) % slides.length);
      });
      carousel.appendChild(arrow);
    }
  }

  // Mobile hero promotions advance automatically every 3 seconds.
  // Manual swipe, focus, hover, open itinerary details and hidden tabs pause the rotation.
  const autoAdvanceEnabled = window.matchMedia('(max-width: 760px)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoAdvanceTimer = null;
  let interactionPaused = false;
  let hoverPaused = false;
  const scheduleAutoAdvance = () => {
    window.clearTimeout(autoAdvanceTimer);
    if (!autoAdvanceEnabled || slides.length < 2 || interactionPaused || hoverPaused ||
        document.hidden || (window.matchMedia('(hover: hover) and (pointer: fine)').matches && carousel.matches(':hover')) ||
        carousel.contains(document.activeElement) ||
        carousel.querySelector('.mobile-departure-itinerary-details[open]') ||
        document.body.classList.contains('promo-itinerary-modal-open')) return;
    autoAdvanceTimer = window.setTimeout(() => {
      if (document.body.classList.contains('promo-itinerary-modal-open')) return;
      goTo((activeIndex + 1) % slides.length);
      scheduleAutoAdvance();
    }, 3000);
  };
  const pauseForInteraction = () => {
    interactionPaused = true;
    window.clearTimeout(autoAdvanceTimer);
  };
  const pauseForHover = () => {
    hoverPaused = true;
    window.clearTimeout(autoAdvanceTimer);
  };
  const resumeAfterHover = () => {
    hoverPaused = false;
    scheduleAutoAdvance();
  };
  // A manual touch, swipe, click or keyboard interaction stops autoplay for this page view.
  // Hover pauses only while the pointer remains over the carousel.
  carousel.addEventListener('pointerdown', pauseForInteraction, {passive:true});
  carousel.addEventListener('mouseenter', pauseForHover);
  carousel.addEventListener('mouseleave', resumeAfterHover);
  carousel.addEventListener('focusin', pauseForInteraction);
  document.addEventListener('visibilitychange', scheduleAutoAdvance);
  dots.forEach((dot,index)=>dot.addEventListener('click',()=>goTo(index)));
  track.addEventListener('scroll',()=>{
    if(ticking)return;ticking=true;
    requestAnimationFrame(()=>{
      const center=track.scrollLeft+track.clientWidth/2;
      let nearest=0,distance=Infinity;
      slides.forEach((slide,index)=>{
        const d=Math.abs(center-(slide.offsetLeft+slide.offsetWidth/2));
        if(d<distance){distance=d;nearest=index;}
      });
      setActive(nearest);ticking=false;
      scheduleAutoAdvance();
    });
  },{passive:true});
  let startX=0,startScroll=0,dragging=false;
  track.addEventListener('pointerdown',(e)=>{
    if(e.pointerType!=='mouse'||e.button!==0)return;
    dragging=true;startX=e.clientX;startScroll=track.scrollLeft;
    track.classList.add('is-dragging');track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove',(e)=>{if(dragging)track.scrollLeft=startScroll-(e.clientX-startX);});
  const stopDrag=()=>{dragging=false;track.classList.remove('is-dragging');scheduleAutoAdvance();};
  track.addEventListener('pointerup',stopDrag);
  track.addEventListener('pointercancel',stopDrag);
  track.addEventListener('lostpointercapture',stopDrag);
  slides.forEach(slide => {
    const details = slide.querySelector('.mobile-departure-itinerary-details');
    if (details) details.addEventListener('toggle', () => updateHeight());
  });
  window.addEventListener('resize',()=>updateHeight(),{passive:true});
  if('ResizeObserver'in window){
    const observer=new ResizeObserver(()=>updateHeight());
    slides.forEach(slide=>{const card=slide.querySelector('.mobile-next-departure');if(card)observer.observe(card);});
  }
  setActive(0);
  scheduleAutoAdvance();
  const refreshHeight = () => requestAnimationFrame(() => requestAnimationFrame(updateHeight));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshHeight);
  window.addEventListener('load', refreshHeight, {once:true});
 };
 if(window.heroPromotionsReady){window.heroPromotionsReady.then(initCarousel).catch(initCarousel);}else{initCarousel();}
})();
