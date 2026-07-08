# Dead Code Audit — Frontend

Date: 2026-07-08
Scope: findings only. No deletions or edits were made as part of this task (except `context/current-feature.md`, which was updated per instructions to park the apiFetch migration and register this task).

## 0. Knip sanity check

`npx knip` (default config, no `knip.json` present) ran cleanly against entry points resolved from `package.json`/Vite. It did **not** flag `main.jsx`, `App.jsx`, or `index.html` as unused — entry-point detection looks correct, so its output is trusted.

Knip's full output:
```
Unused files (2)
src/components/Recruiterinvitemodal.jsx
src/pages/EmployerSelfprofile.jsx
```
No unused-dependency, unused-devDependency, or unlisted-dependency sections were reported (see §3).

---

## 1. Dead / orphaned files

### 1a. `src/components/Recruiterinvitemodal.jsx` — **certain**
- Exports `RecruiterInviteModal` (function name and default export use that casing; the file itself and its paired CSS module are named `Recruiterinvitemodal.jsx` / `.module.css` on disk and in git).
- Searched: `grep -rni "recruiterinvitemodal"` and `grep -rli "InviteModal"` across `src/`. The only hits are the file's own definition, its own CSS import, and `AdminDashboard.jsx`'s **unrelated, inline** `SendInviteModal` function — a different component that duplicates similar functionality.
- The app's actual invite flow is wired through `src/pages/admin/InviteForm.jsx` (routed at `/ryze/invite` in `App.jsx:24,240-243`) and `AdminDashboard`'s inline modal — neither references this file.
- **Cross-reference with CLAUDE.md:** this file is listed under "Already fine — don't touch: Axios call sites" as `RecruiterInviteModal.jsx`. That entry appears stale — the file has no importers anywhere and knip independently confirms it's unreferenced. **Recommend skipping any apiFetch/axios review of this file** and confirming with the user whether it can be deleted, rather than treating it as a protected axios call site.
- Cluster: `Recruiterinvitemodal.jsx` + `Recruiterinvitemodal.module.css` (CSS module has no other importer either).

### 1b. `src/pages/EmployerSelfprofile.jsx` — **needs your review (not a simple dead-file deletion)**
This one is more serious than ordinary dead code — it looks like a **live, in-use page with a broken/fragile import path**, not an unused file:

- `App.jsx:27` imports it as `import EmployerSelfProfile from './pages/EmployerSelfProfile';` (capital `S`, capital `P`) and renders it at the employer profile route (`App.jsx:125`).
- The file on disk (per `find`/`ls`) is `src/pages/EmployerSelfprofile.jsx` (capital `S`, lowercase `p`).
- **git's index has yet a third casing**: `git ls-files` shows it tracked as `src/pages/Employerselfprofile.jsx` (lowercase `s`, lowercase `p`) — paired CSS module `Employerselfprofile.module.css` likewise.
- So there are three different casings in play: git index (`Employerselfprofile.jsx`), working-tree display (`EmployerSelfprofile.jsx`), and the import statement (`EmployerSelfProfile`). This only works today because your local filesystem is case-insensitive-but-case-preserving (macOS) and `git status` shows clean (no case-only diff — `core.ignorecase` is masking it).
- **Risk:** knip resolves imports case-sensitively and can't match the import to the file — which is exactly why it's flagged "unused." The same case-sensitivity would apply on a case-sensitive filesystem (typical Linux deploy target). Given the deploy workflow in CLAUDE.md is `git pull` + `npm run build` on the server, there's a real risk this import silently breaks (or already breaks) on a case-sensitive server filesystem.
- **This file is not a deletion candidate** — it's the real Employer Self-Profile page and is on the CLAUDE.md apiFetch migration list (step 4, "finish upload calls"). Flagging so you can decide whether to rename the file/import to a single consistent casing before continuing that migration. Not fixed here per the findings-only scope of this task.
- Cluster: `EmployerSelfprofile.jsx` + `EmployerSelfprofile.module.css` (both affected by the same casing mismatch).

---

## 2. Orphaned `.module.css` files

Checked every `.module.css` under `src/` for a same-named paired component; also checked shared/many-to-one CSS usage before calling anything orphaned.

- `src/pages/LegalPages.module.css` — no paired `LegalPages.jsx`, but it's **intentionally shared**: imported by both `TermsOfService.jsx` and `PrivacyPolicy.jsx`. **Not dead** — false positive from the naming-pair heuristic alone, confirmed alive by grep.
- No other orphaned CSS modules found beyond the two clusters already listed in §1 (`Recruiterinvitemodal.module.css`, `EmployerSelfprofile.module.css` / `Employerselfprofile.module.css`), which are dead/at-risk only because their paired component is.

---

## 3. `src/utils/`, `src/services/`, `src/contexts/`

All three files present have confirmed importers — **none dead**:
- `src/utils/imageResize.js` → imported by `CandidateSelfProfile.jsx`, `CandidateProfile.jsx`.
- `src/services/api.js` (`apiFetch`) → imported by 6 files (`CandidateDashboard`, `EmployerSelfprofile`, `CandidateSelfProfile`, `AdminDashboard`, `EmployerDashboard`, `admin/TenantSettings`).
- `src/contexts/AuthContext.jsx` → 19 files reference `AuthContext`/`useAuth`.

---

## 4. Assets — `src/assets/` and `public/`

Checked every asset for both `import` statements and string-path references (`src=""`, `url()`, `index.html` `<link>`/`<script>` tags).

**Dead — certain (zero references found anywhere):**
- `src/assets/icons/change.svg`
- `src/assets/icons/Portfolio_RYZE.png`
- `src/assets/icons/confirmed_old_old.svg` — the `_old_old` naming plus zero references strongly suggests a stale leftover superseded by `confirmed.svg` (which *is* referenced).
- `src/assets/RYZE_LOGO.png` — a **different, unreferenced file** from `public/RYZE_LOGO.png`. `index.html:6` links the favicon via the absolute path `/RYZE_LOGO.png`, which resolves to the `public/` copy at build time, not this one under `src/assets/`. This `src/assets/` copy has no importer.
- `public/vite.svg` — default Vite scaffold asset; not referenced in `index.html` or anywhere in `src/`.

**Alive, confirmed:**
- `src/assets/RYZE_LOGO.svg` — imported in `Landing.jsx`.
- `public/RYZE_LOGO.png` — favicon, referenced in `index.html:6`.
- All 24 files in `src/assets/landing_page_thumbnails/` — all referenced from `SaasLanding.jsx` (spot-checked `EP1.png` and `EP24.png`, both hit; no `import.meta.glob` or dynamic path construction found, so static grep is reliable here).
- All other icons under `src/assets/icons/` — each has ≥1 reference.

No `import.meta.glob` or template-literal dynamic asset paths exist in the codebase (checked explicitly), so static grep-based reference counting is reliable for all assets above — no risk of a dynamically-loaded asset being misflagged as dead.

---

## 5. Unused npm dependencies

Knip reported **no unused dependencies or devDependencies** — every package in `package.json` is used. Independently spot-checked the non-obvious ones:

| package | files referencing it |
|---|---|
| `axios` | 4 |
| `canvas-confetti` | 1 |
| `lucide-react` | 2 |
| `react-markdown` | 1 |
| `react-router-dom` | 25 |

Nothing to flag here.

---

## 6. Cross-reference with CLAUDE.md's apiFetch migration list

- **`RecruiterInviteModal.jsx`** (CLAUDE.md: "Already fine — don't touch," axios call site) → **dead** per §1a. Skip any axios/apiFetch review of this file; confirm with the user whether it should be deleted rather than preserved as a protected call site.
- **`EmployerSelfprofile.jsx`** (CLAUDE.md: migration step 4, "finish upload calls") → **not dead, but import-path is fragile/mis-cased** per §1b. Do not skip its migration, but consider resolving the casing mismatch (file vs. git vs. import) before or during that work, since it's currently a landmine that only "works" due to macOS case-insensitivity.
- All other files named in the migration list (steps 1–5) and in the "Already fine" list (`BookingCard.jsx`, `AuthContext.jsx`, `CompleteOAuthSignup.jsx`) show confirmed active importers — nothing else to flag.

---

## Summary table

| Item | Verdict | Confidence |
|---|---|---|
| `src/components/Recruiterinvitemodal.jsx` (+ its `.module.css`) | dead, no importers | certain |
| `src/pages/EmployerSelfprofile.jsx` (+ its `.module.css`) | **not dead** — live page, but broken/mis-cased import path (3-way casing mismatch: git index / disk / import statement) | certain issue exists; risk severity needs your judgment |
| `src/pages/LegalPages.module.css` | shared by 2 pages, not orphaned | certain (false positive ruled out) |
| `src/assets/icons/change.svg` | dead | certain |
| `src/assets/icons/Portfolio_RYZE.png` | dead | certain |
| `src/assets/icons/confirmed_old_old.svg` | dead, superseded by `confirmed.svg` | certain |
| `src/assets/RYZE_LOGO.png` | dead (shadowed by `public/RYZE_LOGO.png`) | certain |
| `public/vite.svg` | dead, default scaffold leftover | certain |
| npm dependencies | none unused | certain |
| `src/utils/`, `src/services/`, `src/contexts/` | all files alive | certain |

No deletions have been made. Let me know which of these you want removed, and whether you want the `EmployerSelfprofile` casing issue addressed before resuming the apiFetch migration at `ChatPage.jsx`.
