# Roamora-Inspired Website Redesign
## Himalayan Odyssey Expedition

This document is the implementation brief for evolving https://himalayanexpedition.co.in/ using the public-facing design patterns of https://roamora.co.in/ as inspiration. Recreate the quality and information architecture, not Roamora's brand identity, copy, imagery, or proprietary assets.

## Non-negotiable project constraints

- Keep the existing single-page HTML/CSS/JavaScript architecture unless a change is necessary and explicitly reviewed.
- Preserve the existing Supabase project, credentials/configuration, tables, row-level security assumptions, package loading, booking/enquiry flows, and admin functionality.
- Preserve all working WhatsApp links and the existing business contact number: +91 98169 29669.
- Keep the current premium Himalayan visual identity: forest green, warm gold, natural neutrals, and authentic Himalayan photography. Improve consistency rather than replacing the brand.
- Do not introduce paid services, build tools, frameworks, APIs, or subscriptions without approval. Prefer the existing stack and free hosting-compatible assets.
- Do not invent testimonials, ratings, customer counts, seat availability, departure dates, safety claims, certifications, or prices. Show only verified data already stored or supplied by the business.
- Keep the site fast, responsive, accessible, and usable on iPhone Safari and Android browsers.
- Respect reduced-motion preferences and provide touch-friendly interactions.

## Desired homepage structure

1. **Header and navigation**
   - Clear Himalayan Odyssey Expedition wordmark/logo.
   - Compact navigation to Packages, Destinations, About, FAQs, and Contact.
   - Prominent WhatsApp enquiry action.
   - Mobile menu with accessible labels and keyboard/touch support.

2. **Hero section**
   - Large, immersive, authentic Spiti/Himalayan landscape image.
   - Strong headline positioning the company as a Himalayan and Spiti Valley travel specialist.
   - Short supporting line explaining the type of journeys offered.
   - Primary action: Plan your trip on WhatsApp.
   - Secondary action: Explore packages.
   - Maintain legible contrast with a subtle image overlay; avoid clutter and excessive animation.

3. **Trust strip**
   - Use only verifiable business facts (for example, office at Narkanda, locally managed trip planning, or actual services offered).
   - Do not copy Roamora's traveller count, Google rating, group-size cap, Trip Captain, oxygen, or permit claims unless independently true and confirmed.

4. **Featured / upcoming packages**
   - Visually strong horizontal cards or a responsive grid, inspired by Roamora's departure cards.
   - Each card should use live package data from the existing Supabase source.
   - Display only available fields: destination, duration, title, verified departure date, price, and a real package detail/enquiry action.
   - Never hardcode seat counts or scarcity labels. If no departure date or price exists, omit that field cleanly.
   - Preserve existing package detail and enquiry behavior.

5. **Destinations**
   - Feature Spiti Valley first, then other destinations actually offered by Himalayan Odyssey Expedition.
   - Use authentic destination photography, concise descriptions, and links/anchors to relevant package content.
   - Do not create dead links or pages that do not exist.

6. **Why travel with Himalayan Odyssey**
   - Explain real differentiators: local knowledge, Narkanda base/office, itinerary planning, transport/stay coordination, and direct human assistance, but only where accurate.
   - Use concise icon-and-copy blocks with consistent visual rhythm.
   - Avoid unsupported safety guarantees or absolute claims.

7. **Guest experiences**
   - Display only genuine guest reviews with permission and accurate attribution.
   - If no verified reviews are available, omit the section or use a neutral “Guest experiences” introduction without fabricated quotations or star ratings.

8. **Instagram / visual gallery**
   - Link to the official Instagram account only if the URL is already configured and verified.
   - Prefer optimized, locally hosted images over heavy third-party embeds.
   - Include descriptive alt text for meaningful images; decorative images should have empty alt text.

9. **FAQs**
   - Cover practical questions using the actual business policies: booking process, inclusions, pickup/drop points, payment/cancellation, group/private trips, and weather/route changes.
   - Do not invent policy terms. If a policy is not confirmed, omit the answer or mark it for owner review.

10. **Final enquiry CTA and footer**
    - Clear WhatsApp and phone actions.
    - Business name and verified contact details.
    - Useful navigation and policy links only where pages exist.
    - Keep the footer compact and mobile-friendly.

## Visual direction

- Premium, editorial Himalayan travel aesthetic.
- Forest-green surfaces and text, restrained warm-gold accents, off-white/stone backgrounds.
- Strong typography hierarchy with generous whitespace.
- Large landscape photography with consistent aspect ratios and subtle corner treatment.
- Package cards should prioritize image, destination, duration, price/date (when available), and one clear action.
- Use subtle transitions and restrained scroll reveals; no constant motion, parallax that harms mobile performance, or animation that blocks content.
- Avoid generic travel-template gradients, excessive glassmorphism, and crowded badge clusters.

## Motion and interaction

- Smooth anchor navigation where supported.
- Small hero entrance and restrained reveal transitions.
- Package-card hover lift only on hover-capable devices; preserve touch behavior.
- Carousels must support swipe, keyboard controls, and visible previous/next controls where appropriate.
- Respect `prefers-reduced-motion: reduce`.
- Ensure animations do not hide content when JavaScript is unavailable.

## SEO and technical requirements

- Preserve and improve the existing page title, meta description, canonical URL, robots directives, Open Graph/Twitter metadata, and structured data.
- Use one clear H1 and a logical H2/H3 hierarchy.
- Ensure all important package content is crawlable and discoverable; do not rely exclusively on client-side interactions for essential text.
- Add descriptive alt text to meaningful images.
- Keep internal links descriptive and functional.
- Validate robots.txt, sitemap.xml, HTTPS, canonical consistency, and indexability.
- Use accurate LocalBusiness/TravelAgency and relevant tourism/package structured data only when supported by visible page content and verified business facts.
- Do not add fake ratings, review schema, prices, dates, or availability.
- Preserve mobile viewport settings and avoid layout shifts; set image dimensions/aspect ratios and lazy-load below-the-fold imagery.
- Keep external scripts to a minimum.

## Implementation sequence

1. Inspect the current `index.html`, `app.js`, admin page, and Supabase integration before editing.
2. Map each existing package/enquiry function to the redesigned sections so no working behavior is lost.
3. Implement the homepage structure and styling incrementally in the existing architecture.
4. Test desktop and mobile layouts, especially iPhone Safari.
5. Test package loading, enquiry submission, WhatsApp destination/number, navigation, admin functions, and empty-data states.
6. Run an SEO/metadata and accessibility review.
7. Deploy to the actual static host and verify the public website URL. A GitHub commit alone does not prove that the live host has deployed the changes.

## Acceptance checklist

- [ ] Existing Supabase configuration and data remain intact.
- [ ] Packages still load from the existing data source.
- [ ] Booking/enquiry flow still works end-to-end.
- [ ] WhatsApp actions open the correct business number.
- [ ] No invented reviews, ratings, prices, dates, or scarcity claims.
- [ ] Hero, packages, destinations, trust content, FAQs, and footer are responsive.
- [ ] No horizontal overflow on mobile.
- [ ] Reduced-motion preference is respected.
- [ ] SEO metadata, headings, canonical, robots, sitemap, and structured data are valid.
- [ ] Changes are deployed and verified on the live domain.

## Reference

- Roamora homepage: https://roamora.co.in/
- Himalayan Odyssey Expedition: https://himalayanexpedition.co.in/
