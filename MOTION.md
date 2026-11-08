# Himalayan Odyssey Expedition — Motion Design Guidelines

## Visual direction
- Editorial, cinematic Himalayan travel aesthetic.
- Preserve the existing forest-green, warm-gold, cream palette and Cormorant Garamond / DM Sans typography.
- Motion should feel calm, considered and premium—not flashy or playful.

## Animation rules
- Prefer opacity and transform for entrance/reveal effects; avoid animating layout properties.
- Use gentle vertical reveal distances (16–24px) and durations around 450–700ms.
- Use a restrained ease such as cubic-bezier(.22,.68,0,1).
- Stagger adjacent cards by small increments (60–130ms); never make users wait for content.
- Keep hero entrance concise (about 0.8–1.1s).
- Use subtle image zoom and card lift only on devices with hover and a fine pointer.
- On touch devices, do not rely on hover.
- Avoid continuous loops, flashing, large parallax, scroll hijacking and distracting motion.

## Accessibility and performance
- Respect prefers-reduced-motion: reduce; show all content immediately and remove non-essential motion.
- Never hide essential content if JavaScript or IntersectionObserver is unavailable.
- Prefer opacity and transform; avoid expensive animation of large images or sections.
- Keep mobile Safari smooth and preserve focus states and tap targets.
- Animations must not delay package cards, enquiry forms, WhatsApp links or booking functionality.

## Compatibility constraints
- Keep the current single-page HTML/CSS/JavaScript architecture.
- Do not add animation libraries or migrate frameworks without approval.
- Do not change Supabase configuration, queries, authentication, database schema, package loading, itinerary loading, property galleries, enquiry forms, SEO metadata, structured data or WhatsApp destinations.
- Test desktop, iPhone Safari and Android-sized layouts.
- Check that every .reveal element becomes visible with IntersectionObserver and when it is unavailable.

## Review checklist
- [ ] Hero entrance is smooth and brief.
- [ ] Section and card reveals are subtle and staggered.
- [ ] Hover-only effects do not stick on touch devices.
- [ ] Reduced-motion preference removes non-essential motion.
- [ ] No content remains invisible after load.
- [ ] No console errors or regressions in booking/enquiry flows.