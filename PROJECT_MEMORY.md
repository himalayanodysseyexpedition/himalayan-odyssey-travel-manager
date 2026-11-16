# Project Memory — Himalayan Odyssey Expedition

Last updated: 2026-11-14

This file is a factual working index for AI coding agents. The repository and current implementation are the source of truth. Re-inspect code before every task; do not assume this document describes the latest code.

## Project identity
- Brand: Himalayan Odyssey Expedition.
- Public website: https://himalayanexpedition.co.in/
- Main repository: https://github.com/himalayanodysseyexpedition/himalayan-odyssey-travel-manager
- Hosting preference: GitHub Pages. Do not migrate hosting or add paid monthly infrastructure without explicit approval.
- Existing logo: preserve it. Do not replace, redraw or rebrand without explicit instruction.

## Current design direction
The user's latest explicit direction supersedes older palette notes elsewhere in repository documentation:
- Premium, luxury Himalayan travel identity.
- Use a considered mix of dark and light sections; restrained, high-contrast layouts are preferred.
- Avoid green, gold, bronze and copper palettes unless the user explicitly requests them.
- Preserve the existing logo and approved brand assets.
- Prioritise responsive mobile UX, especially narrow mobile screens and iPhone Safari.
- Do not apply a global redesign when the request targets one component or page.

## Known product context — verify before changing
The site has been developed as an existing HTML/CSS/JavaScript website with a Supabase-backed travel-management application. Treat the actual repository, schema and runtime as authoritative; inspect them before changing implementation.

Known product areas include:
- Public homepage, destinations, tour packages and itinerary pages.
- Group departures and promotion cards.
- Enquiry and WhatsApp contact flows.
- Cab, hotel and travel services.
- Admin/travel-management dashboard.
- Leads, customers, bookings, vendors, transactions, invoices and payment tracking.
- SEO, performance and responsive presentation.

Known destination content includes Spiti Valley, Kinnaur, Narkanda, Manali, Kasol, Jibhi and Shimla. Verify the current destination inventory in code/data before editing it.

## Recent verified repository milestone
- 2026-11-14: PR #343, “Remove homepage trip planner section”, was merged to main.
- Merge commit: 79fafdc53e8fc15d64ce7e5e8c96e7f7baa8dee8.
- The requested change removed the homepage-only live trip planner section. The standalone Build Your Trip page was intended to remain. Verify current code before further work.
- A merged PR does not by itself prove that the live GitHub Pages deployment has completed. Verify deployment separately before claiming a live-site result.

## Change history and memory rules
- Add concise entries for significant completed changes, including date, scope, affected files, PR/commit and verification status.
- Record user-approved design decisions and superseded decisions with dates.
- Do not store secrets, credentials, private customer information, supplier rates or personal data here.
- Never infer a successful deployment from a successful merge.
- If code contradicts this memory, trust the code and update this file after verifying the facts.

## Mandatory scope discipline
A narrowly phrased user command authorizes a narrowly scoped change:
1. Identify the exact page/component/behaviour named by the user.
2. Trace only the dependencies needed to implement and test that change.
3. Modify the smallest set of files that can safely implement it.
4. Leave unrelated files, pages, components, content, styling and business logic untouched.
5. Do not opportunistically refactor, reformat, rename, upgrade dependencies or redesign adjacent sections.
6. If a shared component or additional file must change, explain why and ask if the expansion is material.
7. Inspect the final diff and remove every unrelated change.
8. Record actual changed files and verification evidence in the completion report.

## Important constraints
- Never expose API keys, Supabase service-role credentials, customer data or private supplier/business data.
- Do not make destructive database changes or apply migrations without explicit approval and a backup/rollback plan.
- Do not change DNS, custom domain, GitHub Pages settings, hosting provider or deployment workflows without explicit approval.
- Do not create real bookings, send real messages or alter live customer records during tests.
- Never claim tests, browser checks or deployment succeeded unless they were actually performed.


## 2026-11-14 — Premium public-site design layer (merged in PR #345)
- User explicitly requested a separate premium UI/UX improvement across the public website.
- Added `premium-design-system.css` as a visual-only shared layer: monochrome black/white surfaces, cool ice-blue micro accents, Windows Fluent/Mica-style headers, consistent editorial typography, cards, buttons, forms, responsive spacing and reduced-motion handling.
- Linked the shared layer from 24 public-facing pages, including homepage, destinations, tour/package/itinerary pages, guides, supplier submission, marketplace and policy pages.
- Admin dashboards and backend/data workflows were intentionally excluded from this public-site visual pass.
- No page content, routes, SEO metadata, JavaScript behaviour, Supabase schema/data, bookings, payments, hosting or deployment settings were intentionally changed.
- PR #345 merged as commit `f74241bd04d49817a723e2cd1ba1e510a4e336b9`. The public CSS asset URL was fetched successfully after merge. Full visual browser/device inspection remains unverified.

## 2026-11-14 — Homepage section backgrounds through Hotels & Properties
- User specified backgrounds for the homepage, with Hero and Upcoming Packages explicitly unchanged.
- Applied solid near-black backgrounds to `#journey-story` (Travel With Us), `#itineraries` (Tour Itineraries), and `#gallery` (Hotels & Properties).
- Applied light cream backgrounds to `#packages` (Our Travel Packages) and `#cabs` (Our Vehicles & Cabs).
- The later `#more-than-tours` section/cards were intentionally left unchanged because the user said to stop at Hotels & Properties.
- Only `index.html` was changed for the implementation; a final scoped style block was appended after existing homepage styles to ensure precedence.
- PR #347 merged on 2026-11-14 as commit `e35ea39ebdec0cfea13379811a3053ca44cdeb0d`.
- Static site quality check for the implementation commit `67968ba58b5c4735d954c29f0b2aa60ba6f498cd` completed successfully (run #789). GitHub Pages deployment for the merge commit was queued at the time this entry was written; live visual verification remains pending.


## 2026-11-14 — Remove white inset frame from homepage card buttons
- User clarified that the pill-shaped CTA buttons in Our Travel Packages, Tour Itineraries, Vehicles & Cabs, and Hotels & Properties must not have a white rectangular inset border.
- Root cause identified in the existing global CSS: `.btn:after` creates an inset pseudo-element with a white/ice border. The previous button reset removed the real border but did not disable this pseudo-element.
- Added narrowly scoped pseudo-element resets for buttons/links inside the four requested homepage card groups. Existing pill radius, button fill, text styling, hover colours and click behaviour are preserved.
- Implementation is on branch `fix/homepage-card-button-white-inset-border`; PR and deployment verification pending.


## 2026-11-15 — Mobile hamburger animation (Cevorob-inspired)
- Updated the public-site mobile hamburger control (screens up to 760px) to use three animated CSS bars that morph into a close icon when the menu opens.
- Kept the existing native button and uses its `aria-expanded` state instead of adding a nested checkbox/label, preserving keyboard activation, screen-reader state, and existing open/close handlers.
- Desktop continues to display the existing SVG hamburger icon. The mobile dropdown, outside-click, Escape, and navigation interactions are unchanged.
- Files: `site-navigation.js`, `hamburger-header-final.css`. Mobile browser/device visual verification pending.


## 2026-11-15 — FH638-inspired mobile hamburger dropdown
- Updated the mobile hamburger dropdown to use a compact dark vertical menu with individual icon-and-label rows, subtle focus/hover treatment and a blue active indicator inspired by the supplied Uiverse FH638 example.
- Preserved the website's actual navigation destinations and labels (Destinations, Cabs, Hotels & Properties); did not substitute the demo's profile/settings items.
- Scoped dropdown visuals to mobile screens up to 760px; desktop navigation and existing menu open/close behavior remain unchanged.
- Bumped the shared hamburger stylesheet URL to v17 to avoid stale CSS cache.
- Live deployment pending merge and GitHub Pages workflow verification.


## 2026-11-15 — Apply FH638 hamburger dropdown to desktop
- Extended the same compact dark FH638-inspired vertical navigation menu to desktop screens (761px and wider).
- Desktop menu uses the same menu labels, icons, row spacing, focus/hover treatment and blue active indicator as mobile.
- Applied the three-bar animated hamburger icon to desktop as well, morphing into an X while open.
- Updated shared navigation logic to apply dropdown styles at all viewport widths and retain the menu when resizing; outside-click, Escape and link-close behaviour remain intact.
- Mobile styling remains unchanged; desktop change is limited to the hamburger control and its opened dropdown. Stylesheet cache URL bumped to v18.


## 2026-11-16 — Cinematic homepage opening intro (PR pending)
- Added a full-screen cinematic opening overlay shown on a fresh homepage tab before the homepage is revealed. Uses existing `/spiti.jpg` hero photography and existing `/logo.webp`; no new image assets, audio or paid dependencies.
- 5-second sequence: slow background camera push, brand/title reveal, animated rule and progress line, then smooth fade to homepage. Includes a Skip Intro button and Escape key support.
- Intro is shown once per browser tab session; reloads/navigation within the same tab do not replay it. Respects `prefers-reduced-motion` and avoids autoplay audio. The existing homepage remains in the document underneath the overlay for SEO and normal page loading.
- Scope: homepage only. Existing header, hero, cards, navigation, admin, Supabase, enquiries, bookings, payments, and deployment configuration unchanged.
- Files: `index.html`, `cinematic-opening.css`, `cinematic-opening.js`, this project-memory entry. PR and checks pending; no deployment performed.


## 2026-11-16 — Shorten cinematic homepage intro
- Adjusted the existing homepage opening sequence from 5 seconds to approximately 2.6 seconds total: the timed hold ends at 2.15 seconds and the overlay fades out over 0.45 seconds.
- Shortened the background camera/progress animation to 2.1 seconds and the DOM cleanup delay to match the faster close.
- No changes to the logo, imagery, intro copy, homepage content, admin, Supabase, navigation, SEO or deployment configuration.
- Implementation PR and checks pending; no production deployment performed.


## 2026-11-16 — Independent homepage Featured Travel Photography (conflict-resolved PR)
- Rebased the gallery implementation conceptually onto the current main snapshot after the original PR #429 became conflicted; preserved newer main-branch homepage, admin and application changes.
- Added a separate homepage carousel directly below the hero, independent of Destination Photos. Uses only existing site images: `/spiti.jpg`, `/kinnaur.jpg`, `/narkanda.jpg`, and `/manali.jpg`; no new or generated photos.
- Includes 10-second autoplay, touch/pointer swipe, keyboard arrows, active-slide scaling, dots, pause behaviour and reduced-motion support.
- Added independent admin create/edit/replace/reorder/publish/unpublish/delete controls and a dedicated additive Supabase migration. Migration is not applied; requires separate owner approval and backup/rollback review.
- Fresh conflict-resolution branch is based on current main commit `a677ba378db358369812bb74688a9ffbb6e7901d`; original conflicted PR #429 was closed as superseded by replacement PR #432.
- Browser/device and Supabase migration verification pending; no deployment performed.

## 2026-11-16 — Remove cinematic homepage opening
- Removed the full-screen first-visit cinematic overlay, pre-paint session trigger, skip/timer markup and homepage script/style references from `index.html` at the user's request.
- Preserved the existing homepage hero, photography, featured gallery, navigation, scroll animations and all other site functionality.
- Dedicated CSS/JS asset files remain in the repository but are no longer loaded by the homepage; they are inert unless referenced elsewhere.
- PR and automated verification pending; no deployment performed.


## 2026-11-16 — Lower mobile hero destination ticker
- Shifted only the homepage destination ticker down by an additional 8px on mobile (from its existing 96px offset to 104px).
- Kept the Cabs / Hotels / Packages service row, desktop layout, ticker content and animation unchanged.
- PR pending; no production deployment performed.


## 2026-11-16 — Raise mobile hero destination ticker slightly
- Reduced the mobile-only destination ticker offset from 104px to 88px, moving the ticker 16px upward after the prior placement felt too low.
- Kept the service buttons, desktop layout, ticker content and animation unchanged.
- PR and checks pending; no production deployment performed.


## 2026-11-16 — Set Featured Travel Photography autoplay to 2 seconds
- Changed the independent homepage Featured Travel Photography carousel auto-advance interval from 10,000 ms to 2,000 ms.
- Kept manual swipe, keyboard navigation, dot controls, hover/focus pause, hidden-tab pause, reduced-motion handling, images, admin controls and desktop/mobile layout unchanged.
- Files: `featured-travel-photography.js`, `PROJECT_MEMORY.md`. PR and validation pending; no deployment performed.


## 2026-11-16 — Center mobile destination ticker between promotion and mountain artwork
- Replaced the old 88px mobile-only ticker offset with normal-flow placement, then shifted the ticker upward 12px to position it in the gap between the Winter Spiti promotion card and mountain artwork.
- Kept the ticker above the mountain layer with z-index 4; content, marquee animation, promotion card, service row, mountain art and desktop layout remain unchanged.
- Files: `index.html`, `PROJECT_MEMORY.md`. Replacement PR and validation pending; no deployment performed.

## 2026-11-16 — Remove homepage Our Destinations section
- Removed the homepage-only mobile 3D Our Destinations section from `index.html`; the dedicated `/destinations/` page and its hamburger-menu link remain unchanged.
- The removed section was mobile-only; desktop homepage content was already unaffected. No destination page, destination data, menu navigation, Supabase data, SEO routes, or other homepage sections were changed.
- PR and verification pending; no deployment performed.

## 2026-11-16 — Lower mobile hero destination ticker by 6px
- Changed only the mobile ticker's relative vertical offset from -12px to -6px, moving it 6px lower within the gap between the Winter Spiti promotion card and mountain artwork.
- Kept ticker z-index, margin, text, animation, service row, promotion card, mountain artwork and desktop layout unchanged.
- Files: `index.html`, `PROJECT_MEMORY.md`. PR and validation pending; no deployment performed.

## 2026-11-16 — Lower mobile hero destination ticker another 6px
- Moved the homepage destination ticker down by a further 6px on mobile by changing its relative top offset from -6px to 0px.
- Kept the ticker in normal flow and above the mountain artwork; ticker content, animation, promotion card, service buttons and desktop layout are unchanged.
- Files: `index.html`, `PROJECT_MEMORY.md`. PR and validation pending; no deployment performed.


## 2026-11-16 — Lower mobile hero destination ticker a further 6px
- Moved the homepage destination ticker down by another 6px on mobile by changing its relative top offset from 0px to 6px.
- Kept the ticker content, animation, promotion card, service buttons, mountain artwork and desktop layout unchanged.
- Files: `index.html`, `PROJECT_MEMORY.md`. PR and verification pending; no deployment performed.

## 2026-11-16 — Lower mobile hero destination ticker another 6px
- Moved the homepage destination ticker down by a further 6px on mobile by changing its relative top offset from 6px to 12px.
- Kept the ticker content, animation, promotion card, service buttons, mountain artwork and desktop layout unchanged.
- Files: `index.html`, `PROJECT_MEMORY.md`. PR and verification pending; no production deployment performed.

## 2026-11-16 — Lower mobile hero destination ticker another 6px
- Moved the homepage destination ticker down by a further 6px on mobile by changing its relative top offset from 12px to 18px.
- Kept ticker content, animation, promotion card, service buttons, mountain artwork and desktop layout unchanged.
- Files: `index.html`, `PROJECT_MEMORY.md`. PR pending; no production deployment performed.


## 2026-11-16 — Raise Featured Travel Photography slideshow cards on mobile
- Shifted the Featured Travel Photography carousel upward by 8px only within the mobile breakpoint using a relative top offset; the heading, dots, hint, desktop layout, images and carousel behaviour remain unchanged.
- Files: `featured-travel-photography.css`, `PROJECT_MEMORY.md`. PR pending; no production deployment performed.


## 2026-11-16 — Raise Featured Travel Photography slideshow cards a further 6px on mobile
- Shifted the mobile slideshow carousel/cards upward by a further 6px, changing its relative top offset from -8px to -14px within the existing mobile breakpoint.
- Desktop positioning, heading, dots, hint, images and carousel behaviour remain unchanged. Files: `featured-travel-photography.css`, `PROJECT_MEMORY.md`. PR pending; no production deployment performed.


## 2026-11-16 — Remove Featured Travel Photography introductory sentence
- Removed only the white introductory sentence beneath the Featured Travel Photography heading on the homepage.
- Preserved the slideshow photos, visible destination names and captions, image alt text, carousel controls and behaviour; no other page or desktop/mobile styling changed.
- Files: `index.html`, `PROJECT_MEMORY.md`. PR review and verification pending; no production deployment performed.


## 2026-11-16 — Restore Featured Travel Photography intro with black text
- Restored the sentence “A closer look at the landscapes and places waiting along your journey.” beneath the Featured Travel Photography heading.
- Changed only `.featured-travel-heading p` text color to black (`#000`). Left section background and all other typography, images, captions, carousel layout/behaviour and desktop/mobile rules unchanged.
- Files: `index.html`, `featured-travel-photography.css`, `PROJECT_MEMORY.md`. PR review pending; no deployment performed.


## 2026-11-16 — Enforce black Featured Travel Photography intro text
- Strengthened the intro paragraph color rule with the section ID and `!important` so competing paragraph styles cannot override the requested black text.
- Bumped the homepage stylesheet query version to `v=2` to avoid a stale cached CSS file.
- The sentence content, section background, heading, carousel, images, layout, and desktop/mobile behaviour are otherwise unchanged. Files: `featured-travel-photography.css`, `index.html`, `PROJECT_MEMORY.md`. PR review and deployment verification pending; no production deployment performed.


## 2026-11-16 — Change Featured Travel Photography intro to matte black
- Changed only the intro sentence text color from pure black to matte black (`#1C1C1C`).
- Preserved the sentence, background, heading, carousel, imagery, layout, and responsive behaviour. Files: `featured-travel-photography.css`, `PROJECT_MEMORY.md`. PR review and deployment verification pending; no production deployment performed.

## 2026-11-16 — Lower Featured Travel Photography images slightly on mobile
- Shifted only the mobile Featured Travel Photography carousel/images 6px downward by changing its relative top offset from -14px to -8px.
- Kept desktop positioning, heading and intro text, dots, hint, image content, carousel behaviour and all other homepage sections unchanged.
- Files: `featured-travel-photography.css`, `PROJECT_MEMORY.md`. PR review pending; no production deployment performed.

## 2026-11-16 — Lower Featured Travel Photography images another 6px on mobile
- Shifted only the mobile carousel/images another 6px downward by changing its relative top offset from -8px to -2px.
- Desktop positioning and all headings, text, dots, hints, image content and carousel behaviour remain unchanged.
- Files: `featured-travel-photography.css`, `PROJECT_MEMORY.md`. PR review pending; no production deployment performed.


## 2026-11-16 — Force a clearer downward shift for mobile Featured Travel Photography images
- The previous relative offset (`top:-2px`) produced no clearly visible downward movement for the user. Increased the mobile carousel offset to `top:10px!important`, a 12px downward change from the previous setting, and bumped the stylesheet URL to `v=3` to bypass cached CSS.
- Only the mobile Featured Travel Photography carousel positioning and its stylesheet cache version changed; desktop layout and all content/behaviour remain unchanged.
- PR review and verification pending; no production deployment performed.


## 2026-11-16 — Add refined light effects to the hero departure promotion
- Added soft corner glows, a slow diagonal shimmer sweep and a subtle animated edge highlight treatment to the homepage group-departure promotion card.
- Added a restrained lift on desktop hover and a gentle glow response on mobile touch; retained reduced-motion support.
- Preserved promotion content, black-and-white styling, CTA behaviour and card layout. Bumped the promotion stylesheet cache version to v11.
- Files: `homepage-mobile-departure-promo.css`, `index.html`, `PROJECT_MEMORY.md`. PR review/verification pending; no production deployment performed.


## 2026-11-16 — Set the mobile homepage hero background to IMG_8475.jpeg
- Changed only the mobile homepage hero photograph to the repository-root asset `/IMG_8475.jpeg`, preserving the existing gradient overlays, hero content, animation layers and layout.
- Scoped the new background and its high-priority preload to viewports up to 760px; desktop keeps the existing `/spiti.jpg` hero image and preload.
- Files: `index.html`, `PROJECT_MEMORY.md`. PR review, responsive visual verification and deployment verification pending; no production deployment performed.


## 2026-11-16 — Correct mobile hero background cascade
- The first mobile hero image override was placed in the document head, before later legacy inline styles in the body; those later styles could override it. The first merge therefore did not reliably change the visible hero image.
- Removed the early override and placed a final, mobile-only background shorthand override immediately before the closing body tag, after all legacy inline styles. Added an image query version to bypass stale browser image cache.
- Desktop remains on `/spiti.jpg`; mobile points to `/IMG_8475.jpeg?v=2`. Existing hero content, weather effects and overlays remain.
- Browser visual verification remains pending; no claim of visual success until checked.


## 2026-11-16 — Correct the mobile hero image animation overlay
- Confirmed from the user's iPhone screenshot that the visible old village photo came from the separate `#home.hero::before` layer in `hero-motion-repair.css`, which still loaded `/spiti.jpg` above the parent hero background.
- Changed only that pseudo-element's mobile background image to `/IMG_8475.jpeg?v=2`; retained its gradients, Ken Burns animation, cloud overlay, layout and reduced-motion handling.
- Bumped the homepage stylesheet URL to `hero-motion-repair.css?v=2` to avoid stale CSS caching. The rule remains inside the existing max-width:760px media query; desktop is unchanged.
- Browser visual verification and Pages deployment verification remain pending; no deployment performed.


## 2026-11-16 — Remove 1px left-edge seam on mobile hero
- User reported a thin white vertical line along the left edge of the mobile hero after the new background image appeared.
- Added a mobile-only 1px full-bleed extension to `#home.hero` (width calc(100% + 1px), margin-left -1px) and explicitly removed any left border. The existing hero image, pseudo-element crop, content and animations are unchanged.
- Desktop rules are outside the mobile media query and remain untouched. Browser visual verification remains pending.


## 2026-11-16 — Target mobile hero image left edge only
- User clarified the thin white line is confined to the left edge of the hero image and appeared with both the previous and current background images; therefore the image asset is not the cause.
- Replaced the earlier 1px hero width/margin nudge with a mobile-only full-viewport hero width/alignment rule (`100vw`, centered viewport margins) to eliminate any parent-container gutter at the image edge. Kept the hero border-left disabled and extended only the existing image pseudo-element 2px beyond each horizontal edge to prevent subpixel gaps.
- No hero content, promo card, ticker, navigation, image asset, animation, or desktop styles changed. Updated the linked CSS cache key from v2 to v3.
- Visual confirmation on the user's iPhone remains pending.


## 2026-11-16 — Mobile hero left-edge correction (pending review)
- Live HTML and CSS were fetched from the public site; the deployed stylesheet v3 still used a `100vw` width plus centered negative viewport margins on the homepage hero, which is a direct child of `body`.
- Replaced that viewport breakout with normal `width:100%` sizing, zero horizontal margins, border-box sizing and no border. This removes the unnecessary viewport-width/negative-margin calculation while keeping the mobile-only hero image, overlays, content, animation and desktop layout unchanged.
- Updated the stylesheet cache key to v4. Browser-level iPhone visual confirmation is still pending because the available remote browser session could not start; the live HTML/CSS source fetch succeeded.


## 2026-11-16 — Remove residual mobile hero overlay edge
- After the user supplied a fresh iPhone screenshot, identified legacy edge styling on the mobile hero image pseudo-element as the likely source of the narrow grey-white strip.
- Explicitly reset the mobile image overlay's border, radius, outline and box shadow while retaining its existing inset, image URL, gradients, crop and animation.
- Scoped to the mobile hero pseudo-element only; desktop and hero content remain unchanged. Visual confirmation after publish is still required.


## 2026-11-16 — Bust the mobile hero overlay stylesheet cache
- Updated the homepage reference to hero-motion-repair.css v5 so mobile browsers fetch the merged overlay-edge reset instead of reusing a cached v4 response.
- No visual rules or desktop styling changed; the stylesheet content and all other homepage assets remain unchanged.


## 2026-11-16 — Remove inherited left border from mobile hero overlay
- Full homepage cascade inspection found the exact cause of the persistent left-edge line: `homepage-hero-final.css` assigns `border-left:1px solid rgba(223,242,252,.68)` to `#home.hero:after` for a scroll cue, while `hero-motion-repair.css` later reuses the same pseudo-element as a viewport-sized light overlay without clearing that border.
- Explicitly reset border, border-left, radius, outline, shadow and padding on the mobile `#home.hero::after` overlay. This removes the inherited scroll-cue edge while preserving the overlay gradients and animation.
- Bumped the homepage stylesheet reference to v6 to bypass cached v5 CSS. Desktop styling, hero image, promotion card, ticker and hero content remain unchanged.
- Exact cause identified from source; browser screenshot verification on iPhone remains pending.


## 2026-11-16 — Consolidate mobile hero photograph into one paint layer
- Full source-order audit found the mobile hero photo was painted twice: the hero element received /IMG_8475.jpeg from a late inline style, while hero-motion-repair.css separately painted the same image on a transformed ::before pseudo-element. The earlier final stylesheet was in the document head, but additional inline style blocks followed it in the HTML source.
- The pseudo-element also inherited positioning/decorative properties from earlier hero rules (including the scroll-indicator ::after border-left), so resetting only the hero box width/border and only the ::before border did not remove all competing paint layers.
- Added a final mobile-only rule at the very end of index.html: the hero element itself is now the single photo/gradient layer, both hero pseudo-elements are disabled, and a gentle background-position pan preserves subtle photo motion without a transformed image edge. Existing real child cloud and mountain overlays remain.
- Desktop styles, hero content, promotion card, ticker, header, and other homepage sections are unchanged. Visual confirmation on an iPhone is still required.


## 2026-11-16 — Add mobile hero starfield and snowfall
- Added a lightweight canvas particle layer to the homepage hero on viewports up to 760px: 76 subtle twinkling stars and a restrained field of softly falling snow particles.
- Particles render above the hero photograph and below all hero content; the departure card, ticker, headline and navigation remain interactive and unobstructed.
- Animation pauses when the hero is off-screen or the document is hidden, caps canvas device-pixel-ratio at 1.5, and respects prefers-reduced-motion with a static particle composition.
- Added hero-atmosphere.js, mobile canvas styling in hero-motion-repair.css, and loaded the script from index.html; bumped the hero stylesheet cache key from v6 to v7.
- Desktop, other pages, hero image, copy, booking/enquiry actions, and hosting/deployment configuration are unchanged. Visual verification on a real iPhone remains pending.


## 2026-11-16 — Apply Ken Burns motion to the single mobile hero image layer
- Replaced the prior subtle background-position-only pan with a 28-second alternating Ken Burns animation on the existing single hero background layer: proportional image-height zoom from 112% to 120%, with a restrained position drift from 56%/40% to 60%/44%.
- Kept the hero image asset, gradient overlays, starfield/snowfall canvas, hero content, departure card and ticker unchanged.
- Mobile-only rule remains scoped to viewports up to 760px. Desktop styles and all other pages are untouched. Existing prefers-reduced-motion rule continues to disable the animation.
- File changed: index.html. Visual verification on a real iPhone remains pending; no deployment or hosting configuration changed.


## 2026-11-16 — Correct Ken Burns interpolation for mobile Safari
- User reported no visible Ken Burns motion after PR #467. Reviewing the merged CSS showed the image zoom used an `auto 112%` to `auto 120%` background-size interpolation, which can fail to interpolate consistently in mobile Safari because of the auto component.
- Replaced it with explicit numeric background-size values for all three layers: gradients stay at 100% 100%, while the image zooms from 112% 112% to 124% 124%, and the focal position drifts slightly over a 22-second alternating cycle.
- Kept the animation mobile-only and retained the existing reduced-motion opt-out. This corrects the animation method; real-device visual confirmation remains pending.

## 2026-11-16 — Allow mobile Safari Ken Burns zoom keyframes to override base background size
- Follow-up diagnosis found the mobile hero base rule declared `background-size:100% 100%,100% 100%,112% 112% !important`. Important declarations outrank CSS animation keyframes, preventing the photo's 112% to 124% zoom interpolation; only the small background-position pan could run.
- Removed `!important` from that single base background-size declaration so the existing `mobileHeroKenBurnsSafari` keyframes can animate the image zoom as intended. Kept the animation duration, focal-point movement, image asset, gradient layers, snowfall/starfield, and reduced-motion opt-out unchanged.
- Mobile homepage hero only. Desktop and all other pages are unchanged. Static source-level verification confirms the base declaration is no longer important and the keyframes retain their explicit 112% to 124% zoom values; real-device visual verification remains pending.

## 2026-11-16 — Replace mobile hero background zoom with a dedicated animated image layer
- Root-cause audit found earlier hero styles still set `background-size:...!important` on `#home.hero` in both `homepage-cinematic.css` / `homepage-hero-final.css` and the legacy `mobile-hero-img-8475-final` inline rule. These important declarations outranked the background-size animation keyframes, so removing the priority only from the latest rule could not enable zoom.
- Added a dedicated decorative `img.hero-ken-burns-photo` as the first hero child and animated its CSS transform from scale(1.04) to scale(1.20), with a slight pan. The mobile hero background now supplies only the dark gradients; the image element is the sole moving photo layer.
- Preserved the mobile-only scope, existing photo asset, gradient treatment, starfield/snowfall canvas, weather/cloud and mountain layers, departure card, ticker, and reduced-motion behaviour. Desktop and all other pages remain unchanged.
- Source-level validation confirms the image layer, animation keyframes, mobile-only rules, and reduced-motion fallback are present. Real-device visual verification is still required; merge does not itself verify the live appearance.


## 2026-11-16 — Refine mobile floating navigation to black and white
- Updated only the mobile floating quick-navigation capsule: solid white surface, black Home/Explore/Packages icons and labels, and a black WhatsApp action with white icon/text.
- Preserved the existing floating navigation markup, destinations, links, four visible items, responsive fixed-position behaviour, and desktop styling.
- Bumped the homepage stylesheet reference for `windows-fluent-monochrome-mobile.css` from v10 to v11 so iPhone Safari fetches the updated CSS instead of reusing the previous cached response.
- Files: `windows-fluent-monochrome-mobile.css`, `index.html`, `PROJECT_MEMORY.md`. PR #471 validation passed at source/check level; live visual verification and deployment remain pending.


## 2026-11-16 — Apply monochrome styling to the actual mobile app dock
- Traced the visible Home / Explore / Packages / WhatsApp bar to `.mobile-app-dock`, which is injected by `mobile-app-experience.js` on mobile. That script removes the legacy `#footerContactBar`, so earlier styling applied to `#footerContactBar` could not affect the visible dock.
- Added a mobile-only CSS override for the generated `.mobile-app-dock`: solid white capsule, black icons and labels, and a black circular WhatsApp control with a white icon and label. Bumped the homepage stylesheet reference from v11 to v12 to force mobile browsers to fetch the corrected CSS.
- Preserved the JavaScript-generated links, item order, route/active-state logic, scroll hide/show behaviour, and dock positioning. Desktop dock styling and website content remain unchanged.
- Files: `windows-fluent-monochrome-mobile.css`, `PROJECT_MEMORY.md`. PR and CI review pending; visual confirmation on an iPhone remains pending.


## 2026-11-16 — iOS glass / black-and-white mobile floating dock
- Applied the selected iOS Floating Glass + Black & White design to the actual JavaScript-injected `.mobile-app-dock`.
- Dock surface: translucent white glass, 26px blur, subtle white border, soft shadow and 28px capsule corners.
- Navigation: black Home / Explore / Packages icons and labels; active destination gets a restrained light-grey highlight.
- WhatsApp: black circular icon with white glyph; its label remains black below the icon.
- Preserved the four generated navigation destinations, links, active-state logic, safe-area positioning and existing scroll hide/reveal behaviour.
- New dedicated stylesheet is loaded last in the homepage head to override legacy styles. CSS is scoped to mobile widths only; desktop is unchanged.
- Files: `mobile-ios-glass-monochrome-dock.css`, `index.html`, `PROJECT_MEMORY.md`. Browser/device visual verification pending.


## 2026-11-16 — Remove packages subtitle browse link
- Removed the inline “Browse all current packages” link from the homepage “Our Travel Packages” subtitle, leaving the descriptive sentence unchanged.
- The homepage uses one shared subtitle markup for responsive layouts, so this single content edit applies to both mobile and desktop.
- Only the homepage subtitle was changed; package cards, carousel controls, package routes, navigation and all other content remain untouched. Live-site visual verification is pending.
 
## 2026-11-16 — Correct mobile hero alignment cascade after PR #509
- Follow-up source-order audit found PR #509's inline alignment block was placed before later inline mobile styles in `index.html`; later rules reset the destination ticker to `top:18px` and reinstated a larger ticker margin, so the earlier reset did not win the cascade.
- Replaced the ineffective earlier block, normalized the ticker to normal flow, and added one final mobile-only alignment override after the legacy inline styles. The hero uses a top-starting flex layout; the promo card and ticker remain in the image container; the mountain artwork remains anchored to the bottom of that hero.
- Desktop rules, page content, image asset, navigation and booking/enquiry behaviour are unchanged. GitHub Pages deployment of PR #509 succeeded; browser visual verification is still pending.
 
## 2026-11-16 — Center the mobile destination ticker between the promo card and mountain artwork
- Adjusted only the homepage mobile hero. The hero now reserves viewport height and the content column extends down to the mountain illustration's visible upper reveal edge.
- The destination ticker uses equal automatic top and bottom margins in the remaining flex space, centering it vertically between the bottom of the Winter Spiti promotion card and the upper visible mountain ridge. The content bottom inset matches the mountain layer's 24% top-mask reveal (76% of its clamped height), so the midpoint tracks the actual visible illustration boundary.
- Desktop styling, promotion-card content/actions, destination ticker content, mountain artwork and image assets remain unchanged. Source-level layout check completed; device screenshot verification remains pending.


## 2026-11-16 — Correct mobile bottom navigation contrast and button surfaces (PR #512)
- Removed the obsolete `mobile-ios-glass-monochrome-dock.css` homepage reference. Its high-specificity mobile rules were forcing the Home/Explore labels and icons to black and adding a black circular background behind the WhatsApp glyph.
- Kept mobile dock labels and all navigation icons white. WhatsApp now uses the same full-size pill surface and dimensions as Home and Explore, with no separate circular icon background. Menu remains a solid black full-size button with a matching border footprint.
- Bumped `mobile-app-experience.js` and its injected `himalayan-bottom-navigation.css` cache versions so mobile browsers fetch the corrected rules. Navigation destinations, WhatsApp URL, menu interaction and desktop styles are unchanged.
- Files: `index.html`, `mobile-app-experience.js`, `himalayan-bottom-navigation.css`, `PROJECT_MEMORY.md`. PR #512 open; implementation checks passed (static site quality workflow and GitGuardian security checks); merge and GitHub Pages deployment verification pending. Live device screenshot verification has not been performed.
