# Changelog

Completed features/fixes move here from `current-feature.md` once Status = Completed — paste in the final Goals + full History, newest entry at the top. `current-feature.md` then resets to a blank template for the next item.

This file doubles as source material for the Build in Public series — each entry is close to script-ready: what the problem was, what changed, and the dated sequence of how it got fixed.

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
