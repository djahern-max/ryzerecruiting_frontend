# Current Feature

<!-- Feature/fix name -->
API call consolidation — apiFetch migration

## Status
<!-- Not Started | In Progress | Completed -->
In Progress

## Goals
<!-- Goals & requirements -->
Make `apiFetch` (in `services/api.js`) the single source of truth for authenticated API calls, replacing raw `fetch` at 17+ call sites so every authenticated page gets 402 (trial-expired) handling automatically. Full rationale and file-by-file migration order live in `CLAUDE.md` → "In-progress: API call consolidation" — this file tracks live status, this is the source of truth for the plan.

## Related Files
<!-- Files this touches -->
- `src/services/api.js` — DONE — now auto-attaches `Authorization` header from localStorage
- `src/pages/ChatPage.jsx` — NEXT
- `src/pages/AdminDashboard.jsx` — partial, finish remaining raw `fetch` calls
- `src/pages/CandidatesPage.jsx`, `EmployerRoster.jsx`, `JobOrderRoster.jsx`
- `src/pages/CandidateProfile.jsx`, `EmployerProfile.jsx`, `JobOrderDetail.jsx`
- `src/pages/CandidateSelfProfile.jsx`, `EmployerSelfprofile.jsx` — finish upload calls
- `src/components/AdminHeader.jsx`, `CandidateModal.jsx`, `IntelligenceBrief.jsx`, `IntelligenceMessage.jsx`, `src/pages/ChangePassword.jsx`, `src/pages/admin/DBExplorer.jsx`, `src/pages/admin/InviteForm.jsx`

## Verification
<!-- How we'll know it worked -->
Per file: temporarily set a test tenant's `status` to `expired` in the DB, confirm the page redirects to `/upgrade` on its next API call, then flip status back. Don't mark a file's migration done until this is checked once. Since there are no real users in production yet, this is safe to verify directly against the live site for now.

## Notes
<!-- Any extra notes -->
- `OAuthCallback.jsx` and `UpgradePage.jsx` are intentionally excluded from migration — see `CLAUDE.md` for why.
- One file per Claude Code session. Test and commit between each — don't batch multiple files into one change.
- This History section doubles as raw material for the Build in Public series — when this moves to `CHANGELOG.md`, it's ready to turn into a video script without reconstructing the timeline from memory.

## History
<!-- Keep this updated. Earliest to latest -->
- 2026-07-07 — Full call-site audit completed: mapped every axios / apiFetch / raw-fetch usage across `src/`. Found raw `fetch` (no 402 handling) is the majority pattern on authenticated pages, not an edge case.
- 2026-07-07 — `apiFetch` updated to auto-attach `Authorization` header from localStorage. Diff reviewed, applied, committed.
- 2026-07-07 — Confirmed production admin dashboard showing all-zero data is expected (no real users yet), not a bug. Cleared to continue verifying directly on production for now.
