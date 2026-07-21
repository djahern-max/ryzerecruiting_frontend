# current-feature.md

## Feature: Candidate "I'm Interested" button on matched roles (frontend)

**Status:** Built, awaiting your live-browser verification and deploy.
**Repo:** ryzerecruiting_frontend
**Depends on:** Backend "I'm Interested" task — SHIPPED and deployed.
Endpoints: `POST /api/job-orders/{id}/express-interest` ({ note?: string },
201 on success, 409 if already sent, max 500 chars) and
`GET /api/candidates/me/interests` → [{ job_order_id, created_at }].

### Goal
On the candidate dashboard's JobMatchCard, add a lightweight "I'm interested"
action: click reveals an optional short-note textarea + Send; on success the
control becomes a disabled "✓ Interest sent" pill. State survives refresh via
the interests endpoint. This is the low-friction alternative to "Schedule a
Call" — do NOT remove or demote the existing booking flow.

One concern, one commit:
- `src/pages/CandidateDashboard.jsx` — fetch `/api/candidates/me/interests`
  alongside the existing dashboard fetches (apiFetch, Bearer header, same
  pattern); pass a `hasInterest` flag + submit handler into JobMatchCard.
- JobMatchCard: "I'm interested" button near "Read more"; expanding textarea
  (placeholder "Add a quick note — optional", maxLength 500); Send with
  loading state; success AND 409 both render the "✓ Interest sent" pill.
- Styles in `CandidateDashboard.module.css` — reuse existing pill/button
  tokens, no new styling approach.

### Explicitly OUT of scope
- Any change to BookingModal / Schedule a Call.
- Employer or admin dashboards.
- Toast/notification systems — inline state on the card is enough.

## Verification
1. `npm run build` passes locally.
2. As Renata: click "I'm interested" on the Greenscene card, send with a
   note → pill flips to "✓ Interest sent"; recruiter email arrives.
3. Refresh the dashboard → pill still shows sent (interests fetch works).
4. Card for a role NOT expressed on still shows the active button.
5. Empty note (skip the textarea) sends successfully.

## History
- 2026-07-21 — Task created (replacing the archived Phase 3 brand-copy task).
  Audit done: confirmed `JobMatchCard` is defined inline in
  `CandidateDashboard.jsx` (no separate file), confirmed `job.id` (map key
  for matched roles) is the same id as `job_order_id` used by the interest
  endpoints, no existing pill class fit the "Interest sent" state so a new
  `.interestSentPill` was added reusing the `.pill_confirmed` green tokens.
  You chose: outlined-pill button style (`.scheduleBtnSm`-style, not a plain
  text link) for the "I'm interested" trigger, and a Cancel link alongside
  Send so the note box can be collapsed without sending.
  Implemented in one commit (not yet made — pending your review): added a
  4th fetch (`/api/candidates/me/interests`) into `interestedJobIds`, threaded
  `hasInterest`/`onInterestSent` into `JobMatchCard`, added the button →
  textarea → Send/Cancel flow (201 and 409 both resolve to the sent pill,
  other errors show inline retry text), added matching CSS classes to
  `CandidateDashboard.module.css`. `npm run build` passes locally.
  Live-browser verification (Renata, note + no-note sends, refresh
  persistence, recruiter email) not yet done — needs your manual check
  before deploy.
