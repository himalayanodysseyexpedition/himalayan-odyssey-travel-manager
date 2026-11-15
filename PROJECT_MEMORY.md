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
