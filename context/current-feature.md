# current-feature.md

## Feature: Header brand name from user object (candidate portal white-labeling — Phase 2 of 2, FRONTEND)

**Status:** Code change complete, build verified. Awaiting your live-browser check (Renata → "Green Path Recruiting", RYZE user → "RYZE.ai") and deploy.
**Repo:** ryzerecruiting_frontend
**Depends on:** Phase 1 (backend) — DEPLOYED & VERIFIED. `GET /api/auth/me` and
the login response now carry `tenant_brand_name` and `tenant_id` on the user
object. Confirmed live: Renata (green_path) → `tenant_brand_name:
"Green Path Recruiting"`; RYZE users → `"RYZE.ai"`.

### Goal
Display the recruiting firm's brand name in the app Header instead of the
hardcoded "RYZE.ai", so an authenticated candidate (e.g. Renata @ Green Path)
sees their firm's name on every page. Because `Header` is shared across admin,
employer, and candidate, and `tenant_brand_name` falls back to "RYZE.ai" for the
`ryze` tenant, this single change brands the whole authenticated app per-tenant
with no per-page forking — RYZE users still see "RYZE.ai".

**This is a pure display change. NO new API call.** The value already arrives on
the `user` object via `AuthContext` (`/auth/me` on load, and the login response).
Read it from `useAuth().user` — do NOT add an `apiFetch`, a new endpoint, or a
new fetch of any kind.

### The core change
In `src/components/Header.jsx`, `Header` already destructures `user` from
`useAuth()`. Replace the hardcoded logo text:

```jsx
<span className={styles.logo} onClick={handleLogoClick}>
  RYZE.ai
</span>
```

with:

```jsx
<span className={styles.logo} onClick={handleLogoClick}>
  {user?.tenant_brand_name || 'RYZE.ai'}
</span>
```

The `|| 'RYZE.ai'` fallback covers the brief pre-load window where `user` is
still null and any edge case where the field is missing.

### Non-goals (keep scope tight)
- **Do not touch pre-auth surfaces** (landing page, login, register). There is no
  tenant context before authentication, so the platform brand "RYZE.ai" is
  correct there. Leave them hardcoded.
- **Do not change** `index.html` `<title>` or the favicon (`/RYZE_LOGO.png`) —
  platform-level, out of scope for this phase.
- No visual theming (firm logo image, brand colors) — name only. That's a
  separate, later task.
- No new API calls, no `AuthContext` changes (the field already flows through).

### Kickoff prompt for Claude Code (audit-first)

Workspace is rooted at this frontend repo. Before writing any code:

**1. Audit — read and list, do not edit yet:**
- `src/components/Header.jsx`: confirm it destructures `user` from `useAuth()`
  and locate the exact hardcoded "RYZE.ai" node.
- Grep the whole `src/` tree for other hardcoded brand strings — `RYZE.ai`,
  `RYZE.AI`, `RYZE` — and list every hit, classifying each as:
    - **In scope** (renders to an *authenticated* user and should be per-tenant),
    - **Out of scope — pre-auth** (landing/login/register — platform brand,
      leave as-is),
    - **Out of scope — platform** (`index.html` title/favicon, CSS comments,
      alt text on the RYZE logo asset).
  Do NOT auto-fix anything beyond the Header. Present the list and let me decide
  what, if anything, to fold in.
- Specifically check `src/components/AdminHeader.jsx` if it exists: note whether
  it hardcodes "RYZE.ai". Admins are always the RYZE tenant, so it resolves to
  "RYZE.ai" either way — applying the same `user?.tenant_brand_name || 'RYZE.ai'`
  fallback is harmless/future-proof, but it's optional. Flag it for my call; do
  not change it without confirmation.

**2. Propose a plan and wait for confirmation.** For the core change the plan is
trivial (the one-line swap above); the substance of your plan is the audit
findings — the categorized list of other brand-string hits and your
recommendation on which (if any) belong in this task vs. a later pass.

**3. After confirmation, write.** Narrow surgical edit to `Header.jsx` only,
unless I greenlight additional in-scope hits. One concern per change.

**4. Verify (frontend is build-and-look):**
- `npm run build` succeeds.
- Logged in as Renata (green_path) → Header reads "Green Path Recruiting".
- Logged in as a RYZE user → Header reads "RYZE.ai".
- No brief flash of the wrong brand on load beyond the acceptable null→value
  swap (AuthContext gates authenticated routes on `loading`, so `user` should be
  populated by the time Header renders).

**5. Deploy is manual.** Hand me the exact commands; do not run them. Frontend
deploy:
```
# on server
git pull
npm run build
```

### History
- 2026-07-16 — Task created. Phase 2 of candidate portal white-labeling. Phase 1
  (backend) deployed and verified same day: `tenant_brand_name` / `tenant_id`
  now on the auth user object, confirmed via Renata's `/api/auth/me` returning
  "Green Path Recruiting". This phase surfaces that value in the shared Header.
  Pure display change — no new API call; the field already flows through
  `AuthContext`.
- 2026-07-16 — Audit done (full grep of `RYZE`/`RYZE.ai` across `src/`, results
  categorized in-conversation, not persisted here). Made the core edit:
  `Header.jsx:27-29` now reads `{user?.tenant_brand_name || 'RYZE.ai'}` instead
  of the hardcoded string. `npm run build` succeeds. `AdminHeader.jsx` and all
  flagged/ambiguous brand-string hits (dashboards, profile footers, booking
  copy, "RYZE Intelligence"/"RYZE network" platform terms) left untouched per
  your call. Live-browser verification (Renata vs. RYZE user) not yet done —
  no local dev server/backend running and no test credentials on hand; needs
  your manual check before deploy.
