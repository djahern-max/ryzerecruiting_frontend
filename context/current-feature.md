# Current Feature — AI Limit Handling + Superadmin Usage View

**Date:** 2026-07-27 · Companion to the backend "AI Usage Metering" feature — backend ships first.
**Repo:** ryzerecruiting_frontend — FRONTEND ONLY.
**To activate:** copy this file to `context/current-feature.md`.

## Objective
Two small pieces: (1) the chat UI handles the new AI-usage-limit response gracefully,
(2) a superadmin-only usage view shows per-tenant AI cost for the current month.
**Explicitly NOT building any tenant-facing meter** — no dollar figures, bars, or
percentages are shown to regular tenant admins in v1.

## Context (verified in repo)
- The backend cap returns **429** with `detail: {code: "ai_usage_limit", message: "..."}`.
  It deliberately does NOT use 402, because `AuthContext.jsx`'s global axios interceptor
  (and `apiFetch`'s separate check) redirect all 402s to `/upgrade` — a capped-but-paying
  customer must never see the upgrade wall.
- `ChatPage.jsx` uses **raw `fetch`** (per the API-consolidation audit in CLAUDE.md), and
  its error path currently does `res.json().catch()` → `throw` → generic error banner.
- Routes are gated by `AdminRoute` / `SuperAdminRoute` wrappers in `App.jsx`;
  `user.is_superuser` is available from `AuthContext`. The superadmin already has extra
  nav items in `AdminHeader.jsx` behind `user?.is_superuser`.
- New backend endpoint: `GET /api/billing/usage` — superuser only — returns per-tenant
  {slug, cost_usd, budget, percent, event_count} plus a grand total for the current month.

## Scope — IN

### 1. Chat: handle `ai_usage_limit` (ChatPage.jsx)
- In `sendMessage`, when `!res.ok`: parse the JSON body and check for
  `data.detail?.code === "ai_usage_limit"`.
- On match: do NOT show the red error banner. Append an assistant-style message bubble
  with the backend's `detail.message` (e.g. "You've reached this month's AI usage limit.
  It resets on the 1st.") and disable nothing else — history, sessions, and the rest of
  the admin app keep working.
- Any other non-ok response keeps the existing error behavior.
- Same handling in `generateTitle` is unnecessary — it fails silently already; leave it.

### 2. Superadmin usage view
- New page `src/pages/admin/UsageDashboard.jsx` + `UsageDashboard.module.css`, routed at
  `/admin/usage` behind `SuperAdminRoute`.
- Nav entry in `AdminHeader.jsx` inside the existing `user?.is_superuser` block
  (label "Usage", icon consistent with the fi-rr set in use).
- Content: current-month table — tenant slug, cost (e.g. `$3.4218`), budget, percent
  with a small inline bar (amber ≥ 80%, red ≥ 100%), event count — and a grand-total row.
  Fetch on mount; no polling. If the endpoint errors or returns 403, render a quiet
  empty/error state (no crash, no redirect).
- Styling: CSS Modules, reuse the visual language of `AdminDashboard.module.css`
  (same card/table patterns, `--bg-50`/`--border-200` tokens). No new libraries.
- Use `apiFetch` from `services/api.js` (the consolidation target), not raw fetch.

### 3. Stripe publishable key env
- When the backend flips to live mode, the frontend's Stripe publishable key env var
  (if referenced anywhere client-side) must be switched to the live key in the same
  deploy. Verify whether the frontend references it at all — Checkout is
  backend-session-driven, so this may be a no-op; confirm and note in the session log.

## Scope — OUT
- Any usage/meter UI visible to non-superusers (tenant admins see nothing).
- The "$3.42 / $20" header meter from the earlier draft spec — dropped by design.
- Top-up purchase UI ($5 add-ons) — fast follow, only after the cap exists and real
  users hit it.
- Polling/websockets for live usage updates.

## Acceptance criteria
- With the backend budget temporarily lowered for a test tenant: sending a chat message
  renders the limit message as a normal chat bubble — no red banner, no redirect to
  `/upgrade`, and Candidates/Employers/Job Orders pages still load.
- As superuser: `/admin/usage` shows both real tenants with sensible dollar amounts that
  match the backend endpoint; bar colors flip at 80% / 100% (test by lowering the budget).
- As a regular tenant admin: no "Usage" nav item, and navigating to `/admin/usage`
  directly is blocked by `SuperAdminRoute`; no usage numbers appear anywhere in their UI.
- Existing trial badge behavior unchanged.

## Session log
- 2026-07-27: Implemented all three scope items.
  - `ChatPage.jsx` `sendMessage`: on non-ok response, checks `data.detail?.code === "ai_usage_limit"` and appends an assistant bubble with `data.detail.message` instead of throwing/showing the red banner. Other errors unchanged (guarded `typeof data.detail === "string"` since `detail` can now be an object).
  - Added `src/pages/admin/UsageDashboard.jsx` + `.module.css`, routed at `/admin/usage` behind `SuperAdminRoute` (`App.jsx`), fetching `GET /api/billing/usage` via `apiFetch`. Table: slug, cost, budget, percent bar (amber ≥80%, red ≥100%), event count, grand-total row. Quiet empty/error state on fetch failure.
  - Added "Usage" nav entry (`fi-rr-stats`) to the existing `user?.is_superuser` block in `AdminHeader.jsx`, next to "DB Explorer" — desktop nav + mobile menu both pick it up automatically.
  - Stripe key: confirmed via full-repo grep — no `stripe`/`STRIPE` reference anywhere in `src`. Item 3 is a no-op; nothing to change client-side.
  - `npm run build` passes clean.
  - Not yet done: backend-side verification per Acceptance Criteria (lowering a test tenant's budget/status) — needs the backend feature live first.
