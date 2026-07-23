# Changelog

Completed features/fixes move here from `current-feature.md` once Status = Completed — paste in the final Goals + full History, newest entry at the top. `current-feature.md` then resets to a blank template for the next item.

This file doubles as source material for the Build in Public series — each entry is close to script-ready: what the problem was, what changed, and the dated sequence of how it got fixed.

## Employer Roster — profile link discoverability (completed 2026-07-23)
The company name in the Employer Roster navigates to the employer profile page (`/admin/employers/{id}`), but was styled as plain dark text (`var(--text-900)`, no underline at rest) and only revealed itself as a link on hover — users didn't realize it was clickable. Implemented all 4 numbered edit sites in `EmployerRoster.jsx` / `EmployerRoster.module.css`: (1) `.companyNameLink` resting color changed to `var(--brand-700)` + `text-decoration: none`, matching the existing `.websiteLink`/`.emailLink` convention; (2) added a `.linkArrow` `→` span after the company name, opacity ~0.35 at rest, brightening on `.row:hover`; (3) swapped the company-name `<button>` + `navigate()` for a react-router `<Link to={`/admin/employers/${profile.id}`}>` using the same class, enabling cmd+click/middle-click new-tab and status-bar URL preview (`EmployerCard`'s `navigate` left untouched); (4) added a `.cardMainText` flex wrapper plus a `.cardChevron` `›` span on the mobile card, using `var(--text-300, #cbd5e1)` since that token isn't defined in `theme.css` (flagged as a candidate future task, not fixed here). Out of scope — expand/Brief toggle, relationship-status dropdown, notes editing, and all other navigation — was left untouched. No backend change involved.

History:
- 2026-07-23 — Spec written from a discoverability review in Claude chat: brand-colored resting link + subtle arrow costs a few lines of CSS, requires no layout change, and matches the link language already established by `.websiteLink`. The button→Link swap was scoped in as a bonus usability win.
- 2026-07-23 — Implemented all 4 edit sites in `EmployerRoster.jsx` / `EmployerRoster.module.css`, per the History detail above. `npm run build` passed locally.
- 2026-07-23 — Live-browser verification checklist confirmed complete: desktop table shows the company name in brand blue at rest with the arrow visible at low opacity and brightening on row hover; clicking the name navigates to `/admin/employers/{id}` and cmd+click/middle-click opens a new tab; the link renders visually identical to the old button (font, weight, size, alignment, no layout shift); at mobile width the chevron is visible on the card's right edge, card tap still navigates, and the status select/Brief button still work without triggering navigation; expand/Brief panel, status dropdown, and notes editing all behave exactly as before on both layouts. Task confirmed complete.

## DB Explorer — surface all current tables (`job_interests`, `tenants`) (completed 2026-07-23)
The DB Explorer hardcodes its table list separately from the backend (`TABLES`, `SUMMARY_COLS`, `EDITABLE_COLS`, `FK_MAP` in `src/pages/admin/DBExplorer.jsx`). Two real tables existed in the DB but were missing from the UI: `job_interests` (candidate "I'm Interested" feature) and `tenants` (superuser-global, read-only — no `tenant_id` column, `slug` is the identity). Added `job_interests` (after `job_orders`) and `tenants` (before `webhook_logs`) to `TABLES`; added row-summary columns for both to `SUMMARY_COLS`; set `EDITABLE_COLS` to `job_interests: ["note"]` (only editable field) and `tenants: []` (read-only — `slug` is the identity key referenced by every other table's plain-string `tenant_id` with no FK, and `status`/`trial_*`/`stripe_*` are platform-owned; tenant-editable branding fields already live behind `/api/settings/tenant`, not this explorer); added `job_order_id → job_orders` to `FK_MAP`. Depended on backend commit `4b60776` (`app/api/db_explorer.py`), already shipped, adding the same two tables to the API's config dicts — no endpoint-shape changes, so this frontend change was safe to deploy independently.

History:
- 2026-07-21 — Backend spec written and implemented first (see backend repo's `context/current-feature.md` / `CHANGELOG.md` for the full cross-repo audit and design rationale — column lists were derived directly from the `JobInterest`/`Tenant` SQLAlchemy models). Frontend changes mirrored the backend's shipped `EDITABLE_COLS` exactly per user guard: `tenants` stays fully read-only (no `slug`/`status`/`trial_*`/`stripe_*`), `job_interests` editable = `note` only.
- 2026-07-21 — Implemented: 4 edits to `DBExplorer.jsx` (`TABLES`, `SUMMARY_COLS`, `EDITABLE_COLS`, `FK_MAP`). Committed as `0a510a0`. This History entry was written after the fact, in the same session as the backend's "doc must travel with the commit" lesson — the commit landed before this file was updated to track it at all (it still held an unrelated, separately-completed task). See backend CHANGELOG for the full postmortem on that pattern.
- 2026-07-23 — Live-browser verification checklist confirmed complete: `npm run build` passes; superuser sidebar shows `job_interests` and `tenants` with correct row counts; `job_interests` browse/search/date-filter/CSV export/edit `note`/delete all work; `tenants` browse + CSV export work with no edit affordance and `twilio_auth_token` absent from columns; `job_order_id` on a `job_interests` row renders as a clickable FK navigating to `job_orders`. Task confirmed complete.

## Remove From Email from Branding settings (completed 2026-07-21)
Tenant admins must not be able to set a from address — an unverified domain there silently breaks all of that tenant's outbound email (hit live with Green Path). Removed the From Email input from `src/pages/admin/TenantSettings.jsx` entirely: the `FIELDS` entry, GET hydration, and post-save hydration, plus one line of helper text explaining that mail sends from RYZE's service under the firm's name with replies routed to their Reply-To. No other settings fields touched (reply_to/support/admin/signature all stay); no CSS was scoped to the removed field. Companion piece to the backend's "notifications@ sender + lock down from_email" task (backend CHANGELOG), which independently stopped persisting `from_email` server-side (`0d2eb88`) regardless of what the frontend sends.

History:
- 2026-07-21 — Task created (replacing the archived "I'm Interested" task). Audit done: `from_email` appears in exactly 3 places in `TenantSettings.jsx` (the `FIELDS` entry, GET hydration, post-save hydration) with no other frontend references anywhere (confirmed via repo-wide grep). `EMPTY_FORM` derives from `FIELDS.reduce(...)` and the PATCH body sends the whole `form` object directly, so removing the `FIELDS` entry and the two hydration lines was sufficient — no separate edits needed for those. `TenantSettings.module.css` has no CSS scoped to `from_email` (all shared classes), so no CSS removal was needed. Helper-text wording revised for accuracy — "Emails are sent under your firm's name from RYZE's email service; replies go to your Reply-To address" (not "your verified RYZE address," since nothing is verified by or belongs to the tenant).
- 2026-07-21 — Implemented all 4 steps in `TenantSettings.jsx`: removed the `from_email` FIELDS entry, GET hydration, and post-save hydration; updated the `.sub` copy with the approved wording. `npm run build` passed locally. Committed as `7c41ecc`.
- 2026-07-21 — Live-browser verification confirmed: Branding page renders with no From Email field, helper text present, saving succeeds with no 422. Task confirmed complete.

## Candidate "I'm Interested" button on matched roles (completed 2026-07-21)
Added a lightweight "I'm interested" action to each JobMatchCard on the candidate dashboard, as a low-friction alternative to "Schedule a Call": clicking reveals an optional short note + Send, which resolves to a disabled "✓ Interest sent" pill on success or on 409 (already sent). State is fetched from `GET /api/candidates/me/interests` alongside the existing dashboard fetches so it persists across refresh. POSTs go to `POST /api/job-orders/{job.id}/express-interest`.

History:
- 2026-07-21 — Task created, replacing the archived Phase 3 brand-copy task.
  Depends on backend "I'm Interested" endpoints already shipped.
- 2026-07-21 — Audit done: confirmed `JobMatchCard` is defined inline in
  `CandidateDashboard.jsx` (no separate file), confirmed `job.id` (map key
  for matched roles) is the same id as `job_order_id` used by the interest
  endpoints, no existing pill class fit the "Interest sent" state so a new
  `.interestSentPill` was added reusing the `.pill_confirmed` green tokens.
  You chose: outlined-pill button style (`.scheduleBtnSm`-style, not a plain
  text link) for the "I'm interested" trigger, and a Cancel link alongside
  Send so the note box can be collapsed without sending.
- 2026-07-21 — Implemented: added a 4th fetch
  (`/api/candidates/me/interests`) into `interestedJobIds`, threaded
  `hasInterest`/`onInterestSent` into `JobMatchCard`, added the button →
  textarea → Send/Cancel flow (201 and 409 both resolve to the sent pill,
  other errors show inline retry text), added matching CSS classes to
  `CandidateDashboard.module.css`. `npm run build` passed locally. Committed
  (`16b76ae`).
- 2026-07-21 — Live-browser verification and deploy confirmed done.

## Brand-relationship copy + contact details (candidate portal white-labeling — Phase 3) (completed 2026-07-16)
Made the authenticated candidate experience read as the firm the candidate is working with — Header "powered by RYZE" microcopy, dashboard "You're working with {firm}" subtitle, and profile footer "Prepared for you by {firm}" — all gated on `isFirmTenant` (`tenant_id` present and not the `ryze` platform signup bucket) so `ryze` users see plain RYZE branding. Also added an ungated, display-only Contact card (email + phone) to the candidate self-profile, sourced from existing `/me` data with no new fetch or backend change.

History:
- 2026-07-16 — Task created. Phase 3 of candidate portal white-labeling, after
  Phase 1 (backend brand fields) and Phase 2 (Header wordmark swap) shipped and
  verified. Scoped to two frontend concerns: (1) firm-relationship copy on 3
  surfaces, gated on `tenant_id !== 'ryze'` (ryze = platform signup bucket, not a
  firm); (2) display-only contact-details card from existing `/me` data. PDF
  download and visual logo/color theming were considered and deliberately
  deferred; body-copy rewording left out because it needs per-line
  platform-vs-firm judgment, not a mechanical swap.
- 2026-07-16 — Audit done: confirmed `user` shape in Header/CandidateDashboard/
  CandidateSelfProfile, found `.bannerSub` already existed unused in
  CandidateDashboard.module.css (perfect fit for the subtitle), confirmed all
  Contact-card CSS classes already exist. Flagged Phone duplication (Contact
  vs. existing Basic Information card) — you chose to leave both, Contact
  card first in sideCol, plain text (no mailto/tel links). Commit 1
  (`a8d5d4b`): gated `isFirmTenant` copy in Header ("powered by RYZE"),
  CandidateDashboard ("You're working with {firm}"), CandidateSelfProfile
  footer ("Prepared for you by {firm}"). Commit 2 (`0cb350a`): ungated
  Contact card (email + phone) on CandidateSelfProfile. `npm run build`
  passes after each commit. Live-browser verification (Renata vs. RYZE user)
  not yet done — no local dev server/backend running, no test credentials on
  hand; needs your manual check before deploy.
- 2026-07-16 — Two polish fixes from your visual review: (1) `Header.module.css`
  — `.logoGroup` switched from stacked column to inline row so "powered by
  RYZE" sits beside the wordmark instead of under it; `.poweredBy` color fixed
  from `var(--text-400)` (undefined in `theme.css` — was silently falling
  back to inherited/dark text) to a real light grey (`#94a3b8`). (2)
  `CandidateSelfProfile.module.css` — `.roValue` was missing `flex: 1` /
  `min-width: 0` / wrap handling, so a long email in the fixed-245px Contact
  card overflowed instead of wrapping; added `overflow-wrap: anywhere` fix,
  applies to all `roField` rows. `npm run build` passes after both fixes.
- 2026-07-21 — Live-browser verification and deploy confirmed done.

## Dead-code inventory, frontend (completed 2026-07-08)
Produced a findings-only inventory of dead code in the frontend — unused files in `src/pages/` and `src/components/`, orphaned `.module.css` files, unused `src/utils/`/`src/services/`/`src/contexts/` files, unused assets in `src/assets/` and `public/`, and unused npm dependencies — cross-referenced against the CLAUDE.md apiFetch migration list, then acted on the findings in three separate, verified commits. Findings doc: `context/dead-code-audit.md`.

History:
- 2026-07-08 — Started dead-code inventory task. apiFetch migration paused (was in progress, next file `ChatPage.jsx`, `src/services/api.js` already updated to auto-attach Authorization header).
- 2026-07-08 — `npx knip` sanity check passed (didn't flag `main.jsx`/`App.jsx`/`index.html`); manual grep pass across pages, components, CSS modules, utils/services/contexts, and assets; unused deps cross-checked with knip. Wrote `context/dead-code-audit.md`.
- 2026-07-08 — Commit 1/3: fixed the `EmployerSelfProfile` casing mismatch via two-step `git mv` (git index had `Employerselfprofile.jsx`, disk showed `EmployerSelfprofile.jsx`, import expected `EmployerSelfProfile.jsx` — now all three match). Updated CLAUDE.md's migration-list casing to match. Local `npm run build` passed. User confirmed server build passed and `/employer/profile` renders correctly.
- 2026-07-08 — Commit 2/3: deleted `src/components/Recruiterinvitemodal.jsx` + `.module.css` (confirmed zero importers anywhere; real invite flow runs through `admin/InviteForm.jsx` and an inline modal in `AdminDashboard.jsx`). Removed it from CLAUDE.md's "Already fine — don't touch" axios list. Local `npm run build` passed.
- 2026-07-08 — Commit 3/3: deleted 5 confirmed-dead assets (`src/assets/icons/change.svg`, `src/assets/icons/Portfolio_RYZE.png`, `src/assets/icons/confirmed_old_old.svg`, the unreferenced `src/assets/RYZE_LOGO.png` duplicate, `public/vite.svg`). Local `npm run build` passed. Spot-checked with a headless-browser pass over `/` and `/about` (Playwright via npx): 0 broken images, 0 failed network requests on both pages, and all 24 episode thumbnails on `/about` render correctly once expanded via "Show all episodes." Dead-code deletion phase complete — all 3 commits verified.

<!--
Example entry format:

## API call consolidation — apiFetch migration (completed 2026-07-XX)
Made `apiFetch` the single source of truth for authenticated calls, migrating
17+ raw-fetch call sites so every authenticated page gets 402 handling.

History:
- 2026-07-07 — Full call-site audit completed.
- 2026-07-07 — apiFetch updated to auto-attach Authorization header.
- 2026-07-08 — ChatPage.jsx migrated and verified.
- ...
-->
