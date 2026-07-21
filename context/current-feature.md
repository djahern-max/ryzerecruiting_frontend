# current-feature.md

## Feature: remove From Email from Branding settings (frontend)

**Status:** Built, awaiting your verification and deploy.
**Repo:** ryzerecruiting_frontend
**Depends on:** Backend "notifications@ sender" task deployed —
`from_email` is gone from the tenant settings GET response and ignored on
PATCH.

### Goal
Tenant admins must not be able to set a from address — an unverified domain
there silently breaks all their outbound email (hit live with Green Path).
One concern, one commit:

- `src/pages/admin/TenantSettings.jsx`: remove the From Email input, remove
  `from_email` from the form state object, the GET hydration, and the PATCH
  body.
- While in there: add one line of helper text near the top of the form —
  "Emails send from Green-Path-style branding on RYZE's verified address;
  replies go to your Reply-To." (adjust wording to fit the existing sub
  copy style — keep it to one sentence).
- Remove any now-orphaned CSS for that field from the module if it had
  dedicated classes; leave shared classes alone.

### Explicitly OUT of scope
- No other settings fields (reply_to, support, admin, signature all stay).
- No backend calls beyond the existing GET/PATCH.

## Verification
1. `npm run build` passes.
2. As dane@greenpathrecruiting.com: Branding page renders without a From
   Email field; editing Signature Name and saving succeeds (no 422).
3. `SELECT from_email FROM tenants WHERE slug='green_path_recruiting';`
   still NULL after a save.

## History
- 2026-07-21 — Task created (replacing the archived "I'm Interested" task).
  Audit done: `from_email` appears in exactly 3 places in
  `TenantSettings.jsx` (the `FIELDS` entry, GET hydration, post-save
  hydration) with no other frontend references anywhere (confirmed via
  repo-wide grep). `EMPTY_FORM` derives from `FIELDS.reduce(...)` and the
  PATCH body sends the whole `form` object directly, so removing the
  `FIELDS` entry and the two hydration lines was sufficient — no separate
  edits needed for those. `TenantSettings.module.css` has no CSS scoped to
  `from_email` (all shared classes), so no CSS removal was needed.
  You revised the helper-text wording for accuracy — "Emails are sent under
  your firm's name from RYZE's email service; replies go to your Reply-To
  address" (not "your verified RYZE address," since nothing is verified by
  or belongs to the tenant).
- 2026-07-21 — Implemented all 4 steps in `TenantSettings.jsx`: removed the
  `from_email` FIELDS entry, GET hydration, and post-save hydration; updated
  the `.sub` copy with the approved wording. `npm run build` passed locally.
  Live verification (Branding page render, Signature Name save, DB check on
  `from_email`) not yet done — needs your manual check before deploy.
