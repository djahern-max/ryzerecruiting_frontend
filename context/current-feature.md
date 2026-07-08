# Current Feature

<!-- Feature/fix name -->
Dead-code inventory, frontend

## Status
<!-- Not Started | In Progress | Completed -->
In Progress

## Goals
<!-- Goals & requirements -->
Findings phase (done — see `context/dead-code-audit.md`) is now followed by an action phase: apply the deletions/fixes the audit identified, in three separate commits, verifying (`npm run build` + manual spot-check) between each:
1. Fix the `EmployerSelfprofile`/`EmployerSelfProfile` three-way casing mismatch (git index vs. disk vs. import) — rename to `EmployerSelfProfile.jsx` via a two-step `git mv`. Server build is the real verification here (macOS can't catch case-resolution bugs).
2. Delete the truly-dead `Recruiterinvitemodal.jsx` (+ its CSS module); remove it from CLAUDE.md's axios "don't touch" list.
3. Delete the confirmed-dead assets (`change.svg`, `Portfolio_RYZE.png`, `confirmed_old_old.svg`, the unused `src/assets/RYZE_LOGO.png` copy, `public/vite.svg`).

**Note:** API call consolidation (apiFetch migration) is still paused — resume from `ChatPage.jsx` once all three deletion commits are verified. `EmployerSelfProfile.jsx` (post-rename) stays on that migration list — it was never dead, just mis-cased.

## Related Files
<!-- Files this touches -->
- `context/dead-code-audit.md` — findings this phase acts on
- `src/pages/EmployerSelfprofile.jsx` → renamed to `EmployerSelfProfile.jsx` (+ `.module.css`), `src/App.jsx` import, `CLAUDE.md` migration list casing
- `src/components/Recruiterinvitemodal.jsx` + `.module.css` — delete; `CLAUDE.md` axios list entry — remove
- `src/assets/icons/change.svg`, `src/assets/icons/Portfolio_RYZE.png`, `src/assets/icons/confirmed_old_old.svg`, `src/assets/RYZE_LOGO.png`, `public/vite.svg` — delete

## Verification
<!-- How we'll know it worked -->
Per commit: `npm run build` locally, plus for commit 1 the real check is the **server** build (case-sensitive filesystem) — get the user's confirmation that the server build passed and `/employer/profile` renders before moving to commit 2. Commit 3 additionally needs a manual spot-check that `Landing` and `SaasLanding` still render with images intact.

## Notes
<!-- Any extra notes -->
- Paused task: API call consolidation — see History in this file (pre-pause) and `CLAUDE.md` for full context. Resume point: `ChatPage.jsx`, once all 3 deletion commits are done and verified.
- When all three commits are verified, flag complete so the user can archive to `CHANGELOG.md` and reset this file to resume the apiFetch migration.

## History
<!-- Keep this updated. Earliest to latest -->
- 2026-07-08 — Started dead-code inventory task. apiFetch migration paused (was in progress, next file `ChatPage.jsx`, `src/services/api.js` already updated to auto-attach Authorization header).
- 2026-07-08 — Commit 1/3: fixed the `EmployerSelfProfile` casing mismatch via two-step `git mv` (git index had `Employerselfprofile.jsx`, disk showed `EmployerSelfprofile.jsx`, import expected `EmployerSelfProfile.jsx` — now all three match). Updated CLAUDE.md's migration-list casing to match. Local `npm run build` passed. User confirmed server build passed and `/employer/profile` renders correctly.
- 2026-07-08 — Commit 2/3: deleted `src/components/Recruiterinvitemodal.jsx` + `.module.css` (confirmed zero importers anywhere; real invite flow runs through `admin/InviteForm.jsx` and an inline modal in `AdminDashboard.jsx`). Removed it from CLAUDE.md's "Already fine — don't touch" axios list. Local `npm run build` passed.
