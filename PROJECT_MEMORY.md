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
