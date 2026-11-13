# Windows Fluent Monochrome Design System
## Himalayan Odyssey Expedition

This is the active visual implementation brief for https://himalayanexpedition.co.in/.

## Design direction

Use **Windows 11 Fluent Design principles + premium monochrome travel editorial design**.

- Strict visual palette: pure black (#000000), pure white (#FFFFFF), and restrained neutral greys.
- Do not use green, gold, bronze, copper, teal, blue accents, or warm cream backgrounds unless the owner explicitly requests them.
- Alternate solid black and solid white sections to create a clear visual rhythm.
- Use Windows-inspired Acrylic/Mica treatments selectively for navigation, dropdowns, floating controls, and selected interactive surfaces.
- Keep glass translucent and subtle; do not turn every card into glass.
- Use premium, authentic Himalayan photography, especially Spiti and Kinnaur landscapes.
- Preserve the existing Himalayan Odyssey Expedition logo exactly. Do not replace, redraw, recolour, or invent a new logo.
- Typography should feel editorial, confident, and legible, with restrained motion and generous spacing.

## Responsive scope

- The current owner instruction is mobile-first and mobile-only: changes should be scoped to screens at or below 760px.
- Do not alter desktop layouts, desktop typography, or desktop navigation unless the owner explicitly asks.
- Test narrow iPhone widths and Android mobile widths; avoid horizontal overflow and clipped controls.
- Respect iOS safe areas and touch targets.
- Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.

## Fluent UI details

- Sticky, translucent Acrylic header with a subtle neutral border and backdrop blur.
- Existing logo and hamburger/menu interactions remain intact.
- Dropdowns use layered neutral Mica surfaces, rounded corners, and readable black text.
- Use 16–24px corner radii for interactive panels and cards where appropriate.
- Use subtle elevation, thin neutral borders, soft shadows, and short easing transitions.
- Avoid heavy gradients, neon glow, colourful borders, and excessive parallax.
- Use solid black or white CTA buttons with the opposite text colour for strong contrast.

## Homepage section rhythm

Use the following mobile black/white sequence while retaining existing content and behavior:

1. Hero: cinematic dark Himalayan image, existing departure promotion, mountain illustration and snowfall.
2. Trust strip: dark Mica-style panel with white text.
3. Upcoming Packages: white.
4. Design Your Own Journey / trip planner: black with dark neutral Fluent panels and bright native form controls.
5. Where Every Journey Becomes a Story: white.
6. Travel Packages: black with white cards.
7. Itineraries: white.
8. Cabs and Vehicles: black with white cards.
9. Hotels and Properties: white.
10. More Than Just Tours: black with white cards.
11. Contact and reviews: white or black only where contrast remains clear.
12. Instagram and footer: black with white typography.

Other public pages should use the same monochrome language: cinematic dark hero, clean white content areas, black feature sections, white cards, and restrained Acrylic navigation.

## Non-negotiable technical constraints

- Keep the existing static HTML/CSS/JavaScript architecture unless a change is necessary and explicitly reviewed.
- Preserve GitHub Pages hosting. Do not migrate to Vercel or introduce paid hosting, subscriptions, APIs, fonts, services, or build tools without explicit approval.
- Preserve the existing Supabase project, configuration, tables, authentication, row-level security assumptions, storage buckets, package loading, booking/enquiry flows, and admin functionality.
- Preserve all working WhatsApp links and the existing business contact number: +91 98169 29669.
- Keep the site fast and compatible with iPhone Safari and Android browsers.
- Do not invent testimonials, ratings, customer counts, seat availability, departure dates, safety claims, certifications, policies, or prices. Use only verified business data.
- Do not remove existing features as a shortcut to visual redesign.
- Keep API secrets out of client-side code. Preserve existing security boundaries and validate user input.

## Motion and interaction

- Prefer CSS transitions and lightweight transforms over new JavaScript dependencies.
- Keep animation subtle, purposeful, and non-blocking.
- Maintain swipe carousels, keyboard access, visible controls, and touch behavior.
- Do not hide essential content behind animations.
- Maintain a usable static fallback when animation or JavaScript is unavailable.

## SEO and accessibility

- Preserve page titles, meta descriptions, canonical URLs, robots directives, Open Graph/Twitter metadata, and structured data.
- Preserve semantic heading hierarchy and descriptive internal links.
- Keep meaningful image alt text; decorative images should use empty alt text.
- Maintain visible keyboard focus, sufficient contrast, accessible labels, and touch-friendly controls.
- Never add fake review schema, ratings, dates, prices, or availability.

## Implementation and verification

1. Inspect the current page, stylesheets, JavaScript, and any relevant Supabase interactions before editing.
2. Reuse the existing architecture and patterns; avoid broad rewrites and unnecessary dependencies.
3. Scope mobile visual changes to `max-width:760px`.
4. Preserve every existing package, itinerary, enquiry, WhatsApp, admin, and database interaction.
5. Check CSS syntax, responsive overflow, section contrast, menu behavior, form usability, and reduced-motion behavior.
6. Test the relevant page flows where browser testing is available. Do not claim live-browser testing if it was not performed.
7. Use a feature branch and pull request. Merge only when the owner has authorised merging.
8. A GitHub merge does not prove that GitHub Pages has deployed; verify the public URL before claiming the live site changed.

## Acceptance checklist

- [ ] Mobile theme uses only black, white, and neutral greys.
- [ ] Windows-inspired Acrylic/Mica is used selectively and remains legible.
- [ ] Black and white sections alternate with a consistent visual rhythm.
- [ ] Existing logo and Himalayan photography are preserved.
- [ ] Desktop presentation is unchanged.
- [ ] No horizontal overflow at common mobile widths.
- [ ] Existing Supabase, package, itinerary, enquiry, WhatsApp, and admin flows remain intact.
- [ ] Reduced-motion and accessibility requirements are respected.
- [ ] No paid services or hosting changes were introduced.
- [ ] Changes are deployed and verified on the live domain before being described as live.

## Reference

- Himalayan Odyssey Expedition: https://himalayanexpedition.co.in/
