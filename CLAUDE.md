# RYZE.ai Frontend — CLAUDE.md

## What this is
React frontend for RYZE.ai V2 — a multi-tenant ATS for recruiting firms. Talks to the FastAPI backend at `VITE_API_URL` (local: `http://localhost:8000`). Serves three user types: admin/recruiter, employer, candidate.

## Stack
- React 19, React Router 7, Vite 7
- **Styling: CSS Modules** (`ComponentName.module.css` alongside each component) — this is the default; don't introduce Tailwind, styled-components, or another styling approach without asking
- **Three API-calling patterns currently coexist — see "In-progress: API call consolidation" below before assuming which one a file uses**
- `lucide-react` for icons, custom SVGs live in `src/assets/icons/`
- `react-markdown` for rendering AI-generated content (candidate/employer summaries, chat responses)
- `canvas-confetti` for celebration moments in the UI

## Repo layout
- `src/pages/` — route-level views (e.g. `CandidateProfile.jsx`, `EmployerProfile.jsx`, `CandidateSelfProfile.jsx`), each typically paired with a `.module.css` file
- `src/components/` — shared/reusable components (e.g. `Header`, `AdminHeader`)
- `src/contexts/` — `AuthContext.jsx` is the main one — owns user state, login/register/logout, and a global axios 402 interceptor for expired trials/subscriptions
- `src/services/` — API helpers (e.g. `api.js` with `apiFetch`)
- `src/utils/` — helpers like `imageResize.js`
- `src/App.jsx` — route definitions; routes are gated by `AdminRoute` / `SuperAdminRoute` wrappers

## Auth model
- **Bearer token, not cookies.** JWT is stored in `localStorage` under the key `token` and sent as `Authorization: Bearer <token>`.
- `AuthContext` fetches `/api/auth/me` on load if a token exists, and redirects post-login/register based on `user_type` (`ADMIN` / `EMPLOYER` / candidate default).
- A global axios response interceptor in `AuthContext.jsx` watches for `402` (trial expired / inactive subscription) and redirects to `/upgrade`, skipping that redirect if already on `/upgrade` or `/billing`.
- **`apiFetch` (in `services/api.js`) has its own separate 402 check** — a second, independent implementation of the same idea, not routed through the axios interceptor.
- **Confirmed by a full call-site audit (July 2026): raw `fetch` — bypassing both 402 checks entirely — is used in 17+ files, covering most of the admin app** (`AdminDashboard`, `ChatPage`, `CandidatesPage`, `EmployerRoster`, `JobOrderRoster`, both self-profile pages, `DBExplorer`, `InviteForm`, and more — see the migration list below). This is not an edge case to flag occasionally; it's the current majority pattern for authenticated pages. Don't assume 402 handling exists on any page without checking.

## In-progress: API call consolidation
Goal: make `apiFetch` the single source of truth for authenticated calls (auto-attach `Authorization` from localStorage + 402 handling), then migrate every raw-`fetch` call site onto it. One file per session, test + commit between each — don't batch multiple files in one change.

**Already fine — don't touch:**
- Axios call sites: `BookingCard.jsx`, `RecruiterInviteModal.jsx`, `AuthContext.jsx`, `CompleteOAuthSignup.jsx` — share the axios instance, get the interceptor for free.
- `apiFetch` call sites: `AdminDashboard.jsx`* (mixed), `CandidateDashboard.jsx`, `CandidateSelfProfile.jsx`* (mixed), `EmployerDashboard.jsx`, `EmployerSelfprofile.jsx`* (mixed), `admin/TenantSettings.jsx`. (*mixed = also has raw fetch, see migration list.)
- `OAuthCallback.jsx` — intentionally raw; validates a token before `AuthContext` state exists. Leave as-is.
- `UpgradePage.jsx` — intentionally raw; it's the 402 redirect's own destination and is explicitly excluded from the interceptor's redirect logic. Migrating it risks fighting that exclusion. Leave as-is.

**Migration order (raw `fetch` → `apiFetch`), highest-traffic first:**
1. `ChatPage.jsx`, `AdminDashboard.jsx` (finish — already partially on `apiFetch`)
2. `CandidatesPage.jsx`, `EmployerRoster.jsx`, `JobOrderRoster.jsx`
3. `CandidateProfile.jsx`, `EmployerProfile.jsx`, `JobOrderDetail.jsx`
4. `CandidateSelfProfile.jsx`, `EmployerSelfprofile.jsx` (finish — photo/banner upload calls)
5. `AdminHeader.jsx`, `CandidateModal.jsx`, `IntelligenceBrief.jsx`, `IntelligenceMessage.jsx`, `ChangePassword.jsx`, `admin/DBExplorer.jsx`, `admin/InviteForm.jsx`

**Verification per file:** temporarily set a test tenant's `status` to `expired` in the DB, confirm the `/upgrade` redirect fires from that specific page, then flip it back. Don't consider a migration done until this is checked once.

## Conventions
- **No `<form>` tags in artifacts/components that need onClick-style submission logic** — this project uses controlled inputs with explicit handlers throughout.
- File uploads (logos, banners, photos) use `FormData` — historically via raw `fetch`, now migrating to `apiFetch` (see migration list above). `apiFetch` still just wraps `fetch`, so passing a `FormData` body works unchanged — don't set a `Content-Type` header manually, let the browser set the multipart boundary.
- `API_BASE` / `API_URL` is read from `import.meta.env.VITE_API_URL` with a `http://localhost:8000` fallback — reuse this pattern, don't hardcode the URL in new files.
- Profile pages (`CandidateProfile`, `EmployerProfile`) are built as read-only, shareable views separate from the admin edit modals — don't collapse these back together without checking with me first.

## Deploy workflow — do NOT run these yourself
```
# local
npm run build     # build before pushing if you want me to sanity check it locally

# on server
git pull
npm run build     # server rebuild — never `npm install` directly on the server first, it causes package.json/lockfile conflicts with what's committed
```
Give me the exact commands for anything that touches the server — don't run deploy commands yourself.

## How I want you to work
- **Audit before you refactor.** For anything beyond a trivial fix: read the relevant files and related CSS Modules, list what you'd change and why, and wait for me to confirm before writing code.
- **One concern per change** — don't mix a refactor with a styling pass with a rename.
- I prefer **complete drop-in replacement files** for components/pages that have gotten complex, rather than partial diffs — I'll say so explicitly when I want that.
- Small, clearly-scoped surgical edits are fine without asking first.
- Match the CSS Modules + component-per-file pattern already in use — don't introduce a different state management library (Redux, Zustand, etc.) or CSS approach without discussing it first.
