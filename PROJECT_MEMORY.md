# Project Memory — Himalayan Odyssey Expedition

Last updated: 2026-11-18

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
- Files: `index.html`, `mobile-app-experience.js`, `himalayan-bottom-navigation.css`, `PROJECT_MEMORY.md`. PR #512 merged as `905f02b934a95d166ef2890994ddebbefa7fdf31`; static-site quality checks, GitGuardian security checks and GitHub Pages deployment succeeded. Live device screenshot verification was not performed.


## 2026-11-16 — Fix mobile Explore icon and align Menu tile with desktop dock (PR #513)
- Removed the remaining obsolete mobile-dock override from `windows-fluent-monochrome-mobile.css`. It targeted the live `.mobile-app-dock` anchors with black labels/icons and a circular WhatsApp button, explaining why the Explore glyph remained black after the earlier stylesheet removal.
- Explicitly set all Explore SVG path strokes to white with no fill. Standardised all four mobile dock control tiles to the desktop dock's 19px corner radius and shared transition curve; Menu retains its black face while using the same grid-cell dimensions and interaction geometry as Home, Explore and WhatsApp.
- Bumped the mobile stylesheet and script cache versions. Desktop-specific rules, navigation destinations, menu open/close behaviour and WhatsApp URL are unchanged.
- Files: `windows-fluent-monochrome-mobile.css`, `himalayan-bottom-navigation.css`, `mobile-app-experience.js`, `index.html`, `PROJECT_MEMORY.md`. PR #513 merged as `361081384fcecadb1016da6932e5f77a1feabfbd`; static-site quality validation, GitGuardian security checks, and GitHub Pages deployment all succeeded. Live device screenshot verification has not been performed.


## 2026-11-16 — Restore mobile hero vertical stage and reduce photo crop
- Restored vertical breathing room in the mobile homepage hero by extending the hero stage by a responsive 28–36px and shifting the complete content column down by the same amount. The destination ticker's automatic centering, promo-to-ticker spacing, and mountain artwork's bottom anchoring are preserved.
- Reduced the dedicated mobile hero photo layer from 116% overscan plus 1.04–1.20 zoom to 106% overscan plus 1.01–1.08 zoom so more of the source photograph remains visible while retaining restrained Ken Burns motion.
- Scope is limited to the mobile homepage hero (viewports up to 760px). Desktop layout, hero copy, promotion details/actions, ticker content, mountain artwork, navigation, business flows and hosting/deployment configuration are unchanged.
- Files: `index.html`. PR #515 merged as `34e86ced8808b3e61b2e35d7c1c3197b0fe0d498`; GitGuardian, static-site validation, GitHub Pages build and deployment checks all succeeded. Live mobile screenshot verification was not available.


## 2026-11-16 — Nudge mobile hero photo layer upward
- Shifted only the dedicated mobile hero photograph layer upward by 16px in its base state, both Ken Burns keyframes and the reduced-motion state. The promotion card, destination ticker, mountain artwork, and their spacing remain unchanged.
- Scope: homepage mobile hero photo only (viewports up to 760px); desktop and all other site functionality remain untouched.
- File: `index.html`. PR #516 merged as `71b9c89b0e568f89911748efef1e4aa00b613cad`; GitGuardian, static-site validation, GitHub Pages build and deployment succeeded. Live mobile visual verification was unavailable.


## 2026-11-16 — Shift mobile hero image crop upward within frame
- The prior 16px translate moved the photo layer, but did not sufficiently correct the visible crop. Adjusted the mobile image element's object-position from 58% 42% to 58% 58%, shifting the photograph content upward within the same hero frame.
- Kept the image layer's existing 16px upward translation and zoom animation, and left the promotion card, destination ticker, mountain artwork, spacing, and desktop hero unchanged.
- File: `index.html`. PR and checks pending; live mobile screenshot verification and deployment have not been performed.


## 2026-11-16 — Shift mobile hero photograph further upward
- Moved the mobile-only hero photograph layer 16px further upward (from -16px to -32px) in its base transform, both Ken Burns animation keyframes, and reduced-motion state. Kept the current photo crop, image scale, hero height, promotional card, ticker, mountain artwork, spacing, and all other content unchanged.
- Scope is limited to the homepage hero at viewports up to 760px; desktop styling and functionality are unchanged.
- Files: `index.html`, `PROJECT_MEMORY.md`. PR review, responsive visual verification, and deployment verification pending.


## 2026-11-16 — Move mobile header menu access to the bottom navigation
- Hid the hamburger control in the mobile header (up to 760px) while retaining the hidden native control required by the existing bottom-dock Menu handler.
- Kept the bottom-dock Menu pop-up and its three existing destinations: Destinations (/destinations/), Cabs (/#cabs), and Hotels & Properties (/#gallery).
- Desktop hamburger navigation, desktop dock, menu destinations and section routes remain unchanged.
- Files: `hamburger-header-final.css`, `site-navigation.js`. PR #519 merged as `6143bcb4be705388e79d19ebda8af05cd97cdb62`; JavaScript syntax validation, site metadata/offline-shell validation, and GitGuardian checks succeeded. Real-device visual verification and live deployment verification were not performed.


## 2026-11-16 — Raise mobile bottom-dock menu popup above the dock
- Fixed the mobile stacking order when the bottom-dock Menu opens the Destinations/Cabs/Hotels & Properties panel: raise the header stacking context to 2000 and the dock-open menu panel to 2100, above the dock at 1800.
- Keep the normal header menu and desktop menu stacking values unchanged.
- Bump the `site-navigation.js` cache version from v16 to v17.
- Files: `site-navigation.js`, `index.html`. Responsive visual verification and deployment verification pending.


## 2026-11-16 — Re-anchor mobile bottom-dock menu popup above the dock
- Corrected the previous stacking-only approach: the mobile popup is now temporarily reparented from the sticky header into `document.body` while opened from the bottom-dock Menu control. This removes the header stacking/containing-block constraint that kept the popup at the top of the page.
- The popup remains fixed-positioned and bottom-anchored at approximately 98px plus the device safe-area inset, placing it directly above the bottom navigation dock. Its layer is 1900, above the dock at 1800.
- The popup is returned to the header when closed or when the viewport is no longer mobile. Outside-click handling treats the reparented popup as part of the menu.
- Scope: mobile dock menu only (up to 760px); desktop menu and desktop layout are unchanged.
- Files: `site-navigation.js`, `index.html`. Responsive visual verification and deployment verification pending.


## 2026-11-17 — Anchor bottom-dock menu popup consistently across public pages
- Updated public HTML pages to load the current shared `site-navigation.js` cache version so the dock-popup positioning fix is not limited to the homepage.
- On mobile, calculate the popup's fixed bottom offset from the live top edge of the visible bottom navigation dock, preserving a 10px gap above it; retain the safe-area fallback when the dock position is unavailable.
- Desktop navigation layout and header-menu positioning remain unchanged.
- Responsive real-device visual verification remains pending.

## 2026-11-17 — Add a 3D card carousel to mobile Featured Travel Photography (PR #533)
- Reworked only the mobile Featured Travel Photography presentation into a perspective-based 3D stacked-card carousel, using the existing active Supabase gallery records and their image/title/caption/alt-text fields.
- Kept the desktop carousel implementation and all other website sections unchanged. Retained mobile swipe, previous/next arrows, pagination dots, keyboard navigation, reduced-motion handling, and the existing 2-second autoplay interval.
- Bumped the homepage gallery CSS and JavaScript cache versions. No Supabase schema, gallery records, hosting, or deployment settings were changed.
- Files: `featured-travel-photography.js`, `featured-travel-photography.css`, `index.html`, `PROJECT_MEMORY.md`. PR #533 opened; automated validation and deployment status pending.

## 2026-11-17 — Fix mobile homepage departure promotion sizing
- Corrected the primary promotional card's mobile CSS grid: it now declares a single-column grid template for every content region, matching the named grid areas already assigned to the card elements.
- Prevented the mobile CTA from stretching vertically by setting a consistent 48px control height and explicit box sizing. Kept the secondary departure's existing mobile layout and all desktop rules unchanged.
- Bumped `homepage-mobile-departure-promo.css` to v15 for cache refresh.
- Files: `homepage-mobile-departure-promo.css`, `index.html`. Live iPhone verification remains pending.

## 2026-11-17 — Restore complete mobile departure card content and second-card animated bar
- On mobile only, both carousel cards use a full-width one-column layout with explicit grid areas for date, facts, price, seat information/progress, itinerary control, and enquiry CTA. Remove vertical clipping from the carousel viewport and slides.
- Add a Tibetan-colour animated decorative strip to the 19 December card without inventing a booking count or percentage.
- Improve carousel height measurement: size slides to the tallest card and remeasure after web fonts and page load settle. Desktop rules remain unchanged.
- Bump `homepage-mobile-departure-promo.css` to v16.
- Files: `homepage-mobile-departure-promo.css`, `index.html`, `PROJECT_MEMORY.md`. Live device screenshot verification pending.

## 2026-11-17 — Mobile promo cards: replace conflicting grid layout with flex document flow
- User screenshots showed the second carousel card rendered as a mostly blank black panel with only its itinerary and WhatsApp controls visible, despite its content being present in HTML. Earlier fixes kept appending CSS grid-area overrides and did not eliminate conflicting mobile grid templates.
- Final mobile-only override switches both promo cards to normal flex-column document flow, resets all child grid-area/position/visibility/opacity overrides, and explicitly orders each content block. This avoids Safari's implicit/empty grid tracks and restores content visibility.
- Restore the 19 December card's animated Tibetan-colour progress strip with a dedicated keyframe definition and visible full-width span.
- Bump stylesheet cache to v17. Desktop styles remain untouched. Screenshot validation on physical iPhone still required.

## 2026-11-17 — Match mobile promotional card details and layout to desktop reference
- User supplied a desktop screenshot as the visual reference and requested the mobile promotional cards to use the same information hierarchy and layout.
- Removed the accumulated conflicting mobile promo CSS overrides (including the flex-column fallback and older grid placements) and replaced them with one consolidated mobile-only desktop-matching card layout.
- First card uses the desktop two-column price-left / seat-count-right row, with the booking progress bar and both full-width pill CTAs below.
- Second card uses the same typography, borders, black gradient card, date/facts hierarchy, progress strip, and pill controls. It has no verified seat count, so its price/progress span the full row rather than inventing seat information.
- Existing carousel height remeasurement remains in place; bump mobile promo stylesheet to v18. Desktop CSS and desktop markup remain unchanged.

## 2026-11-17 — Kinnaur & Spiti group tour booking count
- Kinnaur & Spiti Group Tour price is ₹15,000 per person.
- Show 4 of 12 people booked and 8 seats remaining.
- Promotional card now includes an accessible 4/12 progressbar; mobile fill is one-third of the track with the existing animated multicolour gradient.
- Price, booking count, and WhatsApp enquiry price remain consistent.

## 2026-11-17 — Admin-managed homepage hero promotional cards
- Added a separate Hero Promotional Cards entry in the admin dashboard, linking to /admin-hero-promotions.html.
- Added independent CRUD for homepage hero promotional cards: create, edit, publish/hide, permanent delete, and sort order; fields include headings, season/date, trip facts, per-person price, booked/total people, itinerary lines/link, and CTA label/URL.
- Added public homepage rendering from Supabase table public.site_hero_promotions, ordered by sort_order and limited to active cards. Existing two hero promotions were seeded with their current content and prices (Winter Spiti ₹17,000; Kinnaur & Spiti ₹15,000, 4/12 booked).
- Added RLS: public can read active cards; only the existing admin auth UID can read/manage all cards and perform mutations.
- Explicitly left the existing Tour Packages admin section and its data/functions untouched.


## 2026-11-17 — Mobile hero promotional itinerary popup
- Updated homepage hero promotion itinerary buttons on mobile (up to 760px) to open a centered, scrollable white popup inspired by the supplied Uiverse discount-card styling.
- Popup content is populated from each active `site_hero_promotions` record, including its title, date, trip facts, price and admin-managed day-wise `itinerary_items`; empty itineraries show a clear update message and the existing itinerary-page link.
- Added close-button, backdrop-click, Escape-key and focus-restoration behaviour. Desktop itinerary links retain their existing navigation behaviour.
- Files: `index.html`, `hero-promotions.js`, `hero-promo-itinerary-modal.js`, `hero-promo-itinerary-popup.css`.
- Mobile-only styling and interaction; no Supabase schema/data, admin workflow, booking flow, desktop layout, SEO metadata, hosting or deployment settings changed.
- Merged via PR #560 as commit `ce98607f093dd189b6b664ebe3358578ab8b3159`. GitHub validation and GitGuardian checks passed. Automated browser/device verification was not run; GitHub Pages deployment/live visual behaviour was not independently verified.


## 2026-11-17 — Simplify mobile homepage carousel navigation
- Removed the arrow buttons, decorative blue progress strips and redundant swipe-instruction captions beneath the mobile homepage carousel sections.
- Centered the live page counters for Travel Packages, Tour Itineraries, Vehicles & Cabs, Upcoming Packages and matching guide/destination controls.
- Preserved horizontal touch swiping, scroll snapping, carousel counter updates, keyboard handling and all desktop carousel controls/layouts.
- Added a mobile stylesheet cache-bust in the homepage HTML so iPhone Safari fetches the updated rules.
- Files: `windows-fluent-monochrome-mobile.css`, `index.html`, `PROJECT_MEMORY.md`. Browser/device visual verification remains pending.


## 2026-11-18 — Keep the mobile bottom navigation permanently visible
- The shared mobile bottom dock no longer hides when visitors scroll down or up; it stays fixed at the bottom of every page using the shared navigation script.
- Added a mobile CSS safeguard so the dock remains visible and interactive even if a stale `is-hidden` class is present.
- Kept the existing desktop dock scroll hide/reveal behaviour unchanged.
- Bumped the service-worker shell cache to v18 so deployed clients refresh the shared navigation assets.
- Files: `mobile-app-experience.js`, `himalayan-bottom-navigation.css`, `service-worker.js`, `PROJECT_MEMORY.md`.


## 2026-11-18 — Restyle mobile bottom navigation as blue glass
- Restyled only the mobile bottom navigation shell as one translucent blue-tinted glass capsule with stronger blur, a restrained blue rim and subtle inner highlights.
- Removed all individual button fills, active-state fills and button shadows; Home, Explore, WhatsApp and Menu remain transparent controls within the one shared capsule.
- Kept all four SVG symbols and labels white, with soft depth lighting and a slow, minimal floating/glow animation. Reduced-motion preferences disable the animation.
- Desktop navigation styling remains unchanged.
- Updated the shared injected stylesheet URL to v6 and service-worker cache to v19.
- Files: `himalayan-bottom-navigation.css`, `mobile-app-experience.js`, `service-worker.js`, `PROJECT_MEMORY.md`.


## 2026-11-18 — Fix homepage blue-glass dock stylesheet loader
- Found the live homepage loads `mobile-app-experience-v13.js`, whose loader still pointed to the legacy `himalayan-bottom-navigation-v6.css` file; this bypassed the newly updated shared blue-glass stylesheet.
- Updated the homepage v13 loader to request `/himalayan-bottom-navigation.css?v=6`, matching the shared mobile dock used by the rest of the public pages.
- Bumped the homepage v13 script URL to `?v=14` and the service-worker shell cache to v20 to invalidate stale assets.
- No homepage content, navigation destinations, interactions, or desktop layout changes.
- Files: `mobile-app-experience-v13.js`, `index.html`, `service-worker.js`, `PROJECT_MEMORY.md`.


## 2026-11-18 — Bypass stale mobile dock asset caches
- Added fresh, uniquely named assets for the homepage's mobile dock: `mobile-app-experience-v14.js` and `himalayan-bottom-navigation-blue-glass.css`. This bypasses old service-worker entries keyed by the former asset paths.
- Pointed the homepage at the new script. Updated the shared mobile loaders to use the new blue-glass stylesheet path.
- Updated the homepage script's service-worker registration URL to `?build=18` and bumped the shell cache to v21. Added both new assets to the offline shell.
- The design remains mobile-only; desktop navigation, destinations and button behavior are unchanged.
- Files: `index.html`, `mobile-app-experience.js`, `mobile-app-experience-v13.js`, `mobile-app-experience-v14.js` (new), `himalayan-bottom-navigation-blue-glass.css` (new), `service-worker.js`, `PROJECT_MEMORY.md`.


## 2026-11-18 — Mobile hero promotional card object reveal
- Added a mobile-only object-style reveal to both homepage hero promotional departure cards (up to 760px): a top-down masked reveal with subtle 3D tilt/settle, followed by staggered content reveal.
- Preserved card content, carousel swipe/snap behaviour, links, desktop presentation and existing promotion styling.
- Respects `prefers-reduced-motion`; no JavaScript, dependencies, images or hosting changes.
- File: `homepage-mobile-departure-promo.css`. PR and automated verification pending.


## 2026-11-18 — Add project-local third-party agent skills
- Added four compatible `SKILL.md` packages under `.agents/skills/`: `frontend-ui`, `web-motion`, `seo-audit` and `supabase`.
- Included their linked Markdown references and upstream license notices, plus `.agents/skills/README.md` with source attribution and project-specific precedence rules.
- Updated `AGENTS.md` to tell compatible coding agents where to discover the skills and to prevent generic third-party guidance from overriding this project's stack and safety constraints.
- Only Markdown and license text files changed; no website runtime code, dependencies, database, hosting or deployment settings changed.
- PR: #629 (https://github.com/himalayanodysseyexpedition/himalayan-odyssey-travel-manager/pull/629). Verification: diff review confirms 23 documentation-only files; no application tests or live-browser checks apply.


## SEO internal-link and heading cleanup — 2026-11-20
- Updated internal navigation and related-content links on existing public pages to point directly to current homepage sections or relevant live destination pages instead of retired noindex redirect URLs. Retired routes and their redirect/noindex behaviour were not changed; no new pages were created.
- Corrected homepage heading hierarchy by changing seven experience-card subheadings from H4 to H3 under their existing H2 section.
- Refreshed sitemap lastmod values only for existing sitemap URLs changed in this pass.
- Files: index.html, about-us/index.html, himachal-pradesh-tours/index.html, jibhi-tours/index.html, kasol-tours/index.html, manali-tours/index.html, marketplace/index.html, privacy-policy/index.html, services/index.html, shimla-tours/index.html, spiti-tour-cost/index.html, spiti-valley-travel-guide/index.html, suppliers/index.html, travel-guides/index.html, sitemap.xml, PROJECT_MEMORY.md. PR and verification pending; hosting/deployment settings unchanged.


## 2026-11-20 — Remove 12 public pages and expose 404 responses
- Removed the public page files for About Us, Himachal Pradesh Tours, Jibhi Tours, Kasol Tours, Manali Tours, Shimla Tours, Spiti Tour Cost, Spiti Valley Travel Guide, Travel Guides, Services, Marketplace and Suppliers. Removed page-local Marketplace/Suppliers scripts with their page directories; admin tools, Supabase data/schema and unrelated routes remain untouched.
- Removed these 12 URLs from `sitemap.xml` and removed the Services dropdown from the two remaining static navigation templates (`itinerary.html` and `privacy-policy/index.html`) so they no longer link to deleted pages.
- GitHub Pages should serve its standard 404 for the removed directory URLs after the change is published. No custom redirect or custom 404 page was added. Hosting configuration, DNS, deployment workflows, booking/admin flows and database records were not changed.


## 2026-11-20 — Free GEO foundations (PR #647)
- Merged PR #647 as commit `8944aea105e9c0bec1e5718ecfc778b79bc556cc`.
- Updated homepage meta/social descriptions to identify Himalayan Odyssey Expedition as a Narkanda-based Himachal travel operator and added `knowsAbout` topics to the existing TravelAgency JSON-LD.
- Updated `robots.txt` with explicit allow rules for OAI-SearchBot, ChatGPT-User, GPTBot, Google-Extended, ClaudeBot and PerplexityBot; the existing site-wide allow rule remains.
- Added root `llms.txt` with verified public business identity, contact, destinations, services and travel-condition caveats.
- Scope: `index.html`, `robots.txt`, `llms.txt`; no routes, visual styling, booking flows, Supabase, hosting, DNS or deployment settings changed.
- Verification: JSON-LD parsed successfully; crawler directives and llms.txt facts were checked from the repository branch. No workflow run was returned for the merge commit, and live deployment / crawler access remain unverified.


## 2026-11-20 — Publish-ready 2027 Spiti travel journal content
- Added a new `/blog/` index and six original, standalone 2027 planning guides: Winter Spiti route planning, winter road access, Delhi-to-Spiti planning, winter-versus-summer comparison, Spiti trip-cost budgeting and an eight-day sample itinerary.
- Added article titles, unique meta descriptions, canonical URLs, Open Graph/Twitter metadata, Article JSON-LD, related-article links, WhatsApp enquiry links and links to official Himachal Tourism / Lahaul & Spiti district route information. Content avoids fixed future prices and guarantees of road access.
- Added three guide cards and an all-guides link to the homepage, a Travel Journal footer link, and all seven new URLs to `sitemap.xml`.
- New public URLs use `/blog/` and do not recreate the previously removed `/spiti-tour-cost/`, `/spiti-valley-travel-guide/` or `/travel-guides/` routes.
- Files: `blog/index.html`, six `blog/*/index.html` articles, `index.html`, `sitemap.xml`, `PROJECT_MEMORY.md`. No Supabase, booking/payment logic, hosting configuration, deployment workflow or paid services changed.
- Verification: all seven blog pages have unique title/description/canonical metadata; all six articles contain Article JSON-LD; sitemap contains nine URLs and is well-formed XML. Browser rendering and live deployment remain unverified.


## 2026-11-20 — Website lead capture and CRM connection
- Added a shared responsive website enquiry form to the homepage and five active commercial landing pages (Spiti Valley, Winter Spiti, Kinnaur, Spiti from Chandigarh and Narkanda).
- Captures name, 10-digit WhatsApp number, destination/package, optional travel date, traveller count, starting city and contact consent. Page context is recorded as the lead source; starting city and page URL are stored in lead notes.
- Connects to the existing active `submit-website-enquiry` Supabase Edge Function, which writes into the existing customers and leads tables. Existing Admin Dashboard Guest Leads already displays these CRM records; no schema or RLS changes were made.
- After submission, opens a pre-filled WhatsApp enquiry. If CRM save cannot be confirmed, WhatsApp remains the fallback path. Includes client validation, hidden honeypot, accessible status feedback and date minimum.
- No booking, payment, admin permissions, database schema, hosting, DNS, deployment configuration or deleted routes changed.
- PR #655: https://github.com/himalayanodysseyexpedition/himalayan-odyssey-travel-manager/pull/655; merged 2026-11-20 as commit `157899ed71df09edf2019abf6e83c934f1696c23`.
- Verification: JavaScript syntax parsing passed; GitHub Actions `Static site quality checks` run #1579 passed (run ID `44769162351`). GitHub Pages deployment run `44769236182` was still in progress at the time of this note; live form rendering and an end-to-end test submission were not performed to avoid creating test customer/lead records.


## 2026-11-21 — Mobile voice-only travel assistant (PR pending)
- Added a mobile-only floating microphone assistant for public pages using the shared navigation script. It supports Hindi and English voice input, sends recognized speech to the existing Gemini-backed Supabase AI Travel Assistant, and reads replies aloud using browser speech synthesis. No text-chat transcript or text input is shown.
- Added `voice-travel-assistant.js` and a small loader in `site-navigation.js`. Added `[functions.ai-travel-assistant] verify_jwt = false` to Supabase config to match the existing setup guide's public-function deployment requirement; no function deployment or secret changes were performed.
- Free browser speech APIs are used; browser/device support and microphone permission vary. The existing Gemini API still requires the already-documented `GEMINI_API_KEY` Supabase secret and a deployed Edge Function. Live voice and iPhone Safari compatibility remain unverified.
- Desktop UI, hosting, DNS, database schema/data, existing chat/lead logic and WhatsApp enquiry flows are unchanged. PR pending; no production deployment performed.


## 2026-11-22 — Voice assistant AI question routing and conversation recovery
- Connected general travel-planning questions in the initial guided assistant state to the existing AI Travel Assistant endpoint; package and group-departure selection remains deterministic and data-backed.
- AI recommendation cards for packages and group departures now select the item and continue the guided enquiry rather than bypassing guest/date/pickup collection with a direct WhatsApp link.
- Fixed the AI response lifecycle so microphone listening resumes after the request finishes, including when speech playback is unavailable or ends before the request cleanup.
- Bumped the shared voice assistant script cache URL from v8 to v9. No Supabase schema/data, credentials, deployment settings, or booking records changed.
- PR #677 merged to main on 2026-11-22 as commit `f6fd231025040d1bb1ed79e8cd55cc6e5392e5e0`; GitHub Actions Static site quality checks run #1626 passed. GitHub Pages deployment run #1296 and Pages build #1653 completed successfully. Live browser/device verification remains unverified.


## 2026-11-22 — Source-level SEO sitemap validation
- Checked all 18 URLs in `sitemap.xml` against the repository: every corresponding page file exists.
- All 18 sitemap pages have a non-empty title, meta description and canonical URL; no duplicate titles or canonical URLs were found, and none of the sitemap pages is marked noindex.
- This validates repository source only; it does not establish that GitHub Pages has deployed the latest files, that Google has crawled them, or that the URLs are indexed.


## 2026-11-22 — Optimize large homepage and destination images (PR pending)
- Used a temporary branch-scoped GitHub Actions workflow with Sharp to generate the optimized assets; removed the workflow after the successful run. No paid service or production runtime dependency was added.
- Converted the 4.46 MB mobile hero JPEG into a 302 KB WebP at quality 82 and updated the homepage preload, hero image element, inline mobile backgrounds and hero stylesheet to use the WebP asset. Bumped the hero stylesheet cache URL.
- Compressed destination JPGs: Kinnaur 591 KB to 283 KB, Spiti 268 KB to 224 KB, Narkanda 211 KB to 179 KB, and Manali 539 KB to 331 KB. Kinnaur and Manali remain above the first-pass target; further compression may trade away visible quality.
- PR #678 merged to main on 2026-11-22 as commit `6271380cc3c4f70ee9fedd3cf824d7848d5a8765`. Temporary image optimization workflow run #1 succeeded; static-site quality checks run #1630 passed; GitHub Pages deployment run #1297 and Pages build #1654 completed successfully. Live mobile visual comparison remains unverified.

## 2026-11-23 — Add a subtle purple glow to mobile homepage promotional cards
- Added a restrained purple ambient highlight inside the backgrounds and a soft violet halo around both homepage hero group-departure promotional cards.
- Scoped the effect to the mobile breakpoint (760px and below). Desktop styling, card content, carousel behaviour, buttons, and booking/enquiry functionality remain unchanged.
- File: `homepage-mobile-departure-promo.css`. PR and automated verification pending; no production deployment performed.
