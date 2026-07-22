# current-feature.md

## Feature: DB Explorer — surface all current tables (`job_interests`, `tenants`)

**Status:** Built, awaiting your verification and deploy.
**Repo:** ryzerecruiting_frontend
**Depends on:** Backend commit `4b60776` (`app/api/db_explorer.py`) already
shipped in the backend repo — adds the same two tables to the API's config
dicts. No endpoint-shape changes, so this frontend change is safe to deploy
independently once built.

### Goal
The DB Explorer hardcodes its table list separately from the backend
(`TABLES`, `SUMMARY_COLS`, `EDITABLE_COLS`, `FK_MAP` in
`src/pages/admin/DBExplorer.jsx`). Two real tables existed in the DB but were
missing from the UI: `job_interests` (candidate "I'm Interested" feature) and
`tenants` (superuser-global, read-only — no `tenant_id` column, `slug` is the
identity).

### Changes made
- `TABLES`: added `job_interests` (after `job_orders`) and `tenants` (before
  `webhook_logs`).
- `SUMMARY_COLS`: added row-summary columns for both.
- `EDITABLE_COLS`: `job_interests: ["note"]` (note is the only editable
  field); `tenants: []` (read-only — `slug` is the identity key referenced
  by every other table's plain-string `tenant_id` with no FK, and
  `status`/`trial_*`/`stripe_*` are platform-owned; tenant-editable branding
  fields already live behind `/api/settings/tenant`, not this explorer).
- `FK_MAP`: added `job_order_id → job_orders` (the first table to expose that
  column; `candidate_id → candidates` already existed).

## Verification
1. `npm run build` passes.
2. As a superuser: sidebar shows `job_interests` and `tenants` with correct
   row counts.
3. `job_interests`: browse, search on `note`, date filter on `created_at`,
   CSV export, edit `note` (persists), delete all work.
4. `tenants`: browse + CSV export work; no edit affordance shown (read-only);
   `twilio_auth_token` absent from the columns.
5. `job_order_id` on a `job_interests` row renders as a clickable FK and
   navigates to `job_orders`.

## History
- 2026-07-21 — Backend spec written and implemented first (see backend
  repo's `context/current-feature.md` / `CHANGELOG.md` for the full
  cross-repo audit and design rationale — column lists were derived directly
  from the `JobInterest`/`Tenant` SQLAlchemy models). Frontend changes
  mirrored the backend's shipped `EDITABLE_COLS` exactly per user guard:
  `tenants` stays fully read-only (no `slug`/`status`/`trial_*`/`stripe_*`),
  `job_interests` editable = `note` only.
- 2026-07-21 — Implemented: 4 edits to `DBExplorer.jsx` (`TABLES`,
  `SUMMARY_COLS`, `EDITABLE_COLS`, `FK_MAP`). Committed as `0a510a0`. This
  History entry was written after the fact, in the same session as the
  backend's "doc must travel with the commit" lesson — the commit landed
  before this file was updated to track it at all (it still held an
  unrelated, separately-completed task). See backend CHANGELOG for the full
  postmortem on that pattern.
- Remaining: `npm run build` + live-browser verification checklist above not
  yet run.
