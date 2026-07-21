# Changelog

Completed features/fixes move here from `current-feature.md` once Status = Completed — paste in the final Goals + full History, newest entry at the top. `current-feature.md` then resets to a blank template for the next item.

This file doubles as source material for the Build in Public series — each entry is close to script-ready: what the problem was, what changed, and the dated sequence of how it got fixed.

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
