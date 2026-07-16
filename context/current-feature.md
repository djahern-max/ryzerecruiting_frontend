# current-feature.md

## Feature: Brand-relationship copy + contact details (candidate portal white-labeling — Phase 3, FRONTEND)

**Status:** Both commits done, build verified locally. Awaiting your live-browser check (Renata vs. RYZE user) and deploy.
**Repo:** ryzerecruiting_frontend
**Depends on:** Phase 1 (backend) + Phase 2 (frontend) — both SHIPPED.
`user.tenant_id` and `user.tenant_brand_name` are on the auth user object and
flow through `AuthContext`; the Header already renders `tenant_brand_name`.

### Context / the tenant model (important for the gate)
`ryze` is NOT a recruiting firm — it is the platform's default signup / lead
bucket where people who register directly on RYZE (no firm behind them) land.
Real firms (e.g. `green_path_recruiting`) are their own tenants. Any recruiting
business run later gets its own named tenant too. So:
- **Firm tenant** (`tenant_id !== 'ryze'`) → show the firm relationship: firm
  name + a quiet "powered by RYZE", "you're working with [firm]", "prepared for
  you by [firm]".
- **`ryze` tenant** → plain RYZE brand, NO "powered by RYZE" (redundant — it IS
  RYZE), NO relationship copy. There's no firm to name.

### Goal
Make the authenticated candidate experience read as the firm they're working
with — for firm tenants only — and surface the candidate's own contact details
on their self-profile.

Two concerns, **two separate commits, one session:**

---

### Concern 1 — brand-relationship copy (GATED on firm tenant) → commit 1

Gate expression (get this exactly right — must be **false** while `user` is
still loading or has no tenant):
```js
const isFirmTenant = Boolean(user?.tenant_id) && user.tenant_id !== 'ryze';
```
Relationship copy renders only when `isFirmTenant` AND `user.tenant_brand_name`
is present (never render "working with undefined").

Three surfaces:
1. **Header** (`src/components/Header.jsx`): keep the firm wordmark (already
   done in Phase 2). Add small, muted "powered by RYZE" microcopy beside/under
   it, rendered ONLY when `isFirmTenant`. Keep it genuinely small — the header
   must not get busy.
2. **Dashboard greeting** (the "Welcome back, {name}." component — likely
   `src/pages/CandidateDashboard.jsx`): add a subtitle under the greeting reading
   **"You're working with {tenant_brand_name}"**, ONLY when `isFirmTenant`.
3. **Profile footer** (`src/pages/CandidateSelfProfile.jsx`): the footer tagline
   currently reads "Your Candidate Profile". When `isFirmTenant`, replace it with
   **"Prepared for you by {tenant_brand_name}"** (warm register — this exact
   phrasing is the chosen copy). For `ryze` users, leave it as "Your Candidate
   Profile".

### Concern 2 — contact details (NOT gated, display-only) → commit 2

Add a **Contact** card/section to `src/pages/CandidateSelfProfile.jsx` showing
the candidate's **email** and **phone**, read from the existing `/me` data
(`profile.email`, `profile.phone` — already present, no new fetch, no backend
change). Mirror the existing card pattern (ABOUT / EDUCATION / SKILLS) and its
CSS-module styling. Display-only — no edit, no `apiFetch`. Hide any row whose
value is null/empty rather than showing a blank label. This card is the
candidate's own data, so it is **NOT** gated — show it for all tenants,
including `ryze`.

---

### Explicitly OUT of scope (do NOT touch)
- The body-copy items flagged in the Phase 2 audit ("Intro call with RYZE.ai",
  "how RYZE can help", "How RYZE.ai works", "RYZE.ai uses the conversation
  notes…"). Several describe RYZE's AI processing and can't be mechanically
  swapped to a firm name without becoming false — deferred to a dedicated copy
  pass.
- Platform terms: "the RYZE network", "RYZE Matched", "RYZE Intelligence" — stay
  as-is.
- `AdminHeader.jsx`, pre-auth pages (landing/login/register), `index.html`
  title/favicon, legal/billing pages — all out of scope, same as Phase 2.
- Firm logo image + brand colors (visual white-label) — a separate later phase;
  no new tenant columns / migration in this task.
- Making contact details editable — out of scope (would need a
  `CandidateSelfUpdate` whitelist change). Display-only here.

### Kickoff prompt for Claude Code (audit-first)

Workspace is rooted at this frontend repo. Before writing any code:

**1. Audit — read and list, do not edit yet:**
- `Header.jsx` (post-Phase-2 state): where to place the "powered by RYZE"
  microcopy; confirm `user.tenant_id` is available from `useAuth()`.
- The dashboard component that renders "Welcome back, {name}." — locate the
  greeting node and confirm access to `user` (tenant_id + tenant_brand_name).
- `CandidateSelfProfile.jsx`: locate the footer tagline (the `{/* RYZE footer */}`
  area / "Your Candidate Profile"); confirm `profile.email` and `profile.phone`
  are on the object it already renders; identify the existing card component/
  markup pattern to mirror for the Contact card.
- The relevant `*.module.css` files (per repo convention, styles are CSS Modules
  scoped per component — reuse existing tokens/classes, don't introduce new
  styling approaches).

**2. Propose a plan and wait for confirmation.** Include: the exact
`isFirmTenant` expression and where it's defined in each of the 3 components
(recommend inlining the one-liner unless it's cleaner as a tiny shared helper);
the exact microcopy / subtitle / footer wording; and the Contact card markup +
which existing card it mirrors.

**3. After confirmation, write — two commits:**
- commit 1: brand-relationship copy (Header microcopy, dashboard subtitle,
  footer), all gated.
- commit 2: Contact card (ungated, display-only).
Keep them as separate diffs — do not bundle.

**4. Verify (`npm run build`, then look):**
- As Renata (`green_path_recruiting`): Header shows the firm name + small
  "powered by RYZE"; dashboard shows "You're working with Green Path Recruiting";
  footer reads "Prepared for you by Green Path Recruiting"; Contact card shows
  her email + phone.
- As a `ryze` user: Header shows "RYZE.ai" with NO "powered by RYZE"; no
  dashboard subtitle; footer reads "Your Candidate Profile"; Contact card still
  shows (contact is ungated).
- Confirm no wrong-brand flash while `user` loads (the `isFirmTenant` guard must
  be false when `user`/`tenant_id` is absent).

**5. Deploy is manual.** Hand me the exact commands; do not run them:
```
# on server
git pull
npm run build
```

### History
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
