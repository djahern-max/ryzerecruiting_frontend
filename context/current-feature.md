# Current Feature

<!-- Feature/fix name -->
Feature 1 of 3 (frontend half) — Recruiter Signup Page, Demo Request Form, Landing Links, PostHog Events

## Status
In Progress

## Repo
ryzerecruiting_frontend — FRONTEND ONLY. The backend endpoints are live in production and verified; do not propose backend work.

## Goals
A recruiter landing on ryze.ai can sign up for a trial (and land in /admin logged in, trial badge showing) or request a demo — items 3–6 of the Feature 1 spec. Backend (items 1–2) is deployed and tested.

### Backend API contracts (live — treat as fixed, do not redesign)

**POST /api/auth/signup-firm** (public)
- Request JSON: `company_name`, `full_name`, `email`, `password`, plus honeypot field `website` which must be present in the form as a hidden input and submitted EMPTY by real users.
- Success 200/201 — same shape as /api/auth/login:
  ```json
  {
    "access_token": "...",
    "token_type": "bearer",
    "user": {
      "id": 5, "email": "...", "full_name": "...",
      "user_type": "ADMIN", "is_superuser": false,
      "tenant_id": "test_firm_alpha",
      "tenant_brand_name": "Test Firm Alpha"
    }
  }
  ```
- Errors: 400 duplicate email ("Email already registered" detail), 400 generic "Unable to process request" (honeypot trip), 429 rate-limited.

**POST /api/demo-request** (public)
- Request JSON: `name`, `company`, `email`, `phone` (optional), `message` (optional), plus the same hidden honeypot field (`website`) submitted empty.
- Success 201: the created row `{id, name, company, email, phone, message, created_at}`.
- Errors: 429 rate-limited. (Honeypot trips return a fake success on this endpoint — the frontend never needs to know.)

### Scope — IN
1. **Signup page at `/signup`** (`src/pages/SignupFirm.jsx` + CSS Module, or per existing pages convention):
   - Fields: company name, full name, email, password, confirm password. Client-side check: passwords match, all fields non-empty. No `<form>` tag — controlled inputs + explicit onClick handler per project convention.
   - Hidden honeypot input (`website`): rendered but visually hidden via CSS (position absolute off-screen — NOT `display:none`, and NOT `type="hidden"`, since bots skip those; also set `autocomplete="off"` and `tabIndex={-1}` to reduce autofill false-positives). The field name "website" is autofill-prone, so these mitigations are load-bearing, not decorative.
   - On success: store the token and user through the SAME path the existing login flow uses (audit AuthContext / login handling first — reuse it, do not invent a parallel storage path), then navigate to `/admin`. The trial badge must show without a refresh.
   - Error states: duplicate email → inline "That email is already registered — log in instead" with a link to /auth; 429 → "Too many attempts — please try again in a few minutes"; generic 400/500 → "Unable to process request — please try again."
2. **Demo request at `/demo`** (small page, not modal — simpler routing, shareable URL):
   - Fields: name, company, email, phone (optional), message (optional). Same honeypot treatment.
   - Success state replaces the form: "Thanks — we'll be in touch shortly."
   - 429 → same friendly retry message.
3. **Landing hookup:** two working links/buttons on the existing landing page to `/signup` and `/demo`. Minimal styling — do NOT redesign the hero (that's Feature 2). Just make the routes reachable.
4. **Routes registered** in the router for `/signup` and `/demo` as public routes (no auth guard).
5. **PostHog events:** `signup_started` (fired on submit click), `signup_completed` (fired on successful account creation, include `tenant_id` as a property), `demo_requested` (fired on successful demo submission).

### Scope — OUT
- Hero/landing visual redesign (Feature 2).
- OAuth on the signup-firm page (email/password only).
- Email verification UI.
- Any backend change.

## Audit first — do NOT write code yet
1. Read the existing auth flow: AuthContext (or equivalent), the login page, and how token + user are stored after /api/auth/login — the signup success path must reuse this exactly. Report the mechanism.
2. Confirm whether PostHog is already initialized in this repo (search for posthog imports/init). If it is NOT present, stop and report — installing/initializing PostHog is a decision point, not something to slip in silently.
3. Confirm the routing setup (router file, public vs guarded route pattern) and the CSS Modules page conventions (pick an existing simple page as the styling template and name it).
4. Confirm how existing pages call the API (apiFetch vs raw fetch). Note: these two endpoints are PUBLIC (no auth token), so if apiFetch assumes a token, say so and propose the right call pattern.
5. Propose the plan mapped to the numbered scope items. One concern per commit — expected shape: signup page, demo page, landing links + routes, PostHog events (or fold events into each page's commit if cleaner — propose either explicitly). Wait for confirmation before writing code.

## Verification
- Incognito → /signup → create account → lands in /admin logged in with trial badge visible, no refresh needed.
- Duplicate email shows the inline message with working login link.
- /demo submits → success state → (Dane confirms email + DB row).
- Honeypot field is invisible, untabbable, and not autofilled in Chrome + Safari.
- 429 path renders the friendly message (Dane can trip it deliberately from one IP).
- PostHog shows signup_started, signup_completed (with tenant_id), demo_requested — verified post-deploy against production; dev mode opts out of capture, so local testing can't confirm these.
- Landing links navigate; no other landing changes in the diff.
- Existing login flow still works (regression check).

## History
- 2026-07-26 — Task created. Backend half deployed and verified in production same day.
- 2026-07-26 — Audit complete; decisions confirmed (honeypot field = `website`, `signupFirm()` added to AuthContext, raw fetch, 3-commit plan). Commit 1 done: `signupFirm()` in AuthContext (mirrors `login()` — token storage, `setUser`, redirect to `/admin`; fires `signup_completed` with `tenant_id`), `/signup` page (`SignupFirm.jsx` + CSS module) with honeypot field, client-side validation, and `signup_started` event; `/signup` route registered. Build verified; smoke-tested in a headless browser (layout, honeypot off-screen + untabbable, client-side validation states) — full signup flow against a live backend not yet tested locally (no local backend running).
