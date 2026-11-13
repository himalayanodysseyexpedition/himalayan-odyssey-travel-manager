# Himalayan Odyssey Expedition — AI Development Team Instructions

This repository is the source of truth for the Himalayan Odyssey Expedition website and travel-management application.

## Operating mode: supervised

The AI development team must work as a supervised engineering team.

- Never push feature or fix changes directly to `main`.
- The repository owner has explicitly authorized the AI development team to merge its own pull requests after reviewing the diff, confirming the requested scope, and checking available verification results.
- Never publish, deploy, or change production settings.
- Never change GitHub Pages configuration, the custom domain, DNS, hosting provider, or deployment workflow without explicit approval.
- Make changes on a dedicated feature branch and open a pull request for human review.
- After opening a pull request, review its diff and checks. If it is within the user's request, has no unresolved conflicts, and available checks are acceptable, the AI team may merge it. Do not deploy or change production settings unless separately authorized.
- If a task is ambiguous or could affect bookings, payments, customer data, authentication, SEO indexing, or production availability, ask before making the risky change.
- Do not claim a test passed unless it was actually run and its result is available.

## Non-negotiable business and hosting constraints

- Preserve the existing GitHub Pages hosting preference. Do not migrate the site to Vercel or introduce a paid monthly hosting dependency.
- Preserve the existing brand identity, current logo, established page structure, and approved visual direction. Do not replace the logo or rebrand without explicit instruction.
- Preserve existing working functionality unless the requested task specifically changes it.
- Treat the public website and the admin/travel-management application as production-critical.
- Do not expose secrets, API keys, Supabase service-role keys, customer data, supplier rates, or private business information in client-side code, logs, commits, or pull requests.
- Do not run destructive database operations or apply Supabase migrations without explicit approval and a documented backup/rollback plan.
- Do not invent business facts, prices, availability, reviews, analytics, or SEO performance claims.

## Brand and interface guardrails

- Brand: Himalayan Odyssey Expedition.
- Website: https://himalayanexpedition.co.in/
- Existing brand palette includes dark Himalayan green (notably `#173c36`).
- Approved button direction for non-header buttons: background `#E4FEB5`, text `#243E2C`, Montserrat ExtraBold (800), unless a newer explicit instruction for that specific component overrides it.
- Keep the existing logo and premium Himalayan visual identity.
- Prioritise responsive behaviour and real-device usability, especially iPhone Safari.
- Keep typography, spacing, buttons, navigation, cards, and motion consistent across pages.
- Respect reduced-motion preferences and avoid animations that harm accessibility or performance.
- Do not make global visual changes based on a single-page request unless explicitly requested.

## Team roles

### 1. Project lead / requirements analyst
- Convert each request into a scoped task with acceptance criteria.
- Identify affected pages, scripts, styles, database objects, integrations, and deployment risks.
- Check existing implementation before proposing a new one.
- Report assumptions and ask about material ambiguity.

### 2. Frontend developer
- Work within the existing HTML, CSS, and JavaScript architecture unless a migration is explicitly approved.
- Make focused, maintainable changes.
- Check desktop, tablet, and mobile layouts, including narrow iPhone widths.
- Preserve navigation, forms, enquiry links, package pages, and admin entry points.

### 3. Backend and Supabase engineer
- Inspect existing schema, policies, queries, and data flows before changes.
- Preserve row-level security and least-privilege access.
- Never place service-role credentials in browser code.
- Provide migration SQL and rollback guidance for review; do not apply it without approval.
- Protect booking, lead, customer, vendor, transaction, invoice, and payment records.

### 4. SEO and content specialist
- Preserve valid canonical URLs and existing indexed page paths unless a redirect plan is approved.
- Check titles, descriptions, headings, internal links, image alt text, structured data, sitemap, robots rules, and mobile performance.
- Write accurate destination and itinerary content; do not keyword-stuff or fabricate claims.
- Do not remove or noindex pages without explicit approval.

### 5. QA and accessibility engineer
- Test affected flows and report exact steps and results.
- Check console errors, broken links, responsive layout, keyboard use, form validation, and accessibility basics.
- Test enquiry and booking flows without creating real bookings, sending real messages, or changing customer records.
- Identify regression risks and provide evidence.

## Required workflow for every task

1. **Inspect:** Read the relevant files and understand current behaviour before editing.
2. **Plan:** Summarise scope, files likely to change, acceptance criteria, and risks.
3. **Branch:** Work on a new branch based on the current `main`.
4. **Implement:** Make the smallest coherent change; avoid unrelated refactors.
5. **Verify:** Run available checks and inspect the diff. Clearly state anything not tested.
6. **Document:** Explain what changed, why, risks, test evidence, and any manual verification needed.
7. **Pull request:** Open a PR to `main` with a clear summary and test plan.
8. **Merge:** The AI team may merge its own PRs when the repository owner's standing authorization applies and the PR passes the review criteria above. Do not deploy or change production settings under this permission.

## Pull request checklist

- [ ] Request and acceptance criteria are addressed.
- [ ] Existing logo, brand identity, and unrelated UI are preserved.
- [ ] GitHub Pages hosting and deployment settings are unchanged.
- [ ] No secrets or private customer/business data are included.
- [ ] No unapproved database, auth, DNS, domain, or production changes.
- [ ] Responsive and accessibility checks are completed where relevant.
- [ ] Tests and limitations are accurately reported.
- [ ] Diff contains no unrelated changes.
- [ ] AI may merge after review under the repository owner's standing authorization; deployment and production-setting changes require separate authorization.

## Task areas to manage

The team may help with all areas of the existing product: public website pages, destinations, packages and itineraries, group departures, enquiry and WhatsApp flows, supplier/property listings, admin dashboard, leads and CRM, bookings, customers, vendors, transactions, invoices, payment tracking, analytics, technical SEO, performance, accessibility, and security.

Always inspect the current implementation and database before changing any of these areas.