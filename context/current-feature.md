# Current Feature

<!-- Feature/fix name -->
Landing page revision — remove waitlist, single 60-day-trial CTA, video placeholder

## Status
Not Started

## Repo
ryzerecruiting_frontend — FRONTEND ONLY.

## Context
The live `/` route renders `src/pages/Landing.jsx` (confirmed via `App.jsx` — `<Route path="/" element={<Landing />} />`). Its hero still carries the pre-signup waitlist email-capture form (intent buttons + email input + "Join the waitlist" button, posting to `/api/waitlist`) from before self-serve signup existed. That's now redundant with the real `/signup` flow shipped in the prior task (nav already has a "Start free trial" → `/signup` CTA, footer already has "Request a demo" → `/demo`).

Note: `src/pages/SaasLanding.jsx` also has a waitlist form and hero CTA, but it is **not routed anywhere** in `App.jsx` (grepped — zero references outside the file itself) — it's dead/orphaned code, not the live landing page. Out of scope for this task; do not touch it.

## Goals
1. **Remove the waitlist** — delete the hero email-capture block in `Landing.jsx` (intent buttons, email input, success state, `handleWaitlist`, and the `email`/`intent`/`wlStatus`/`errorMsg`/`formRef` state it uses) and any now-dead CSS in `Landing.module.css`.
2. **Single 60-day-trial CTA** — replace it with one clear primary CTA in the hero driving to `/signup`, with copy that makes "60-day free trial" an explicit selling point (mirrors the same "60-day" positioning already added to `SignupFirm.jsx`'s subhead in the trial-length task). Nav's existing "Start free trial" link stays as-is unless you want its copy updated too — flagged as a decision below.
3. **Video placeholder** — add a placeholder for a future product demo video. Where it sits relative to the existing `DemoChat` preview component (replace it, sit beside/below it, or something else) is a decision below, not assumed.

## Open decisions — confirm before I write code
- Does `DemoChat` (the animated chat preview, currently the hero's centerpiece) stay, or does the video placeholder replace it?
- Exact CTA copy/label (e.g. "Start your free 60-day trial") and whether the nav CTA also gets updated to mention 60 days, or stays generic.
- What the video placeholder should actually look like — static box with a play icon and "Demo video coming soon," an embed shell ready for a real video URL, or something else — and whether it needs its own CSS or can reuse an existing card/frame style from elsewhere in the page.
- Confirm the `/api/waitlist` backend endpoint and `Waitlist` model stay untouched (frontend-only removal of the form, not a backend deprecation) — this matches the stated repo scope, but worth confirming explicitly since removing the only live caller of that endpoint is a meaningful side effect worth naming.

## Related Files
- `src/pages/Landing.jsx` (hero section, ~L230-303)
- `src/pages/Landing.module.css` (hero form / intent / email-row / success-state classes, plus new CTA/video-placeholder styles)

## Verification
- `/` loads with no waitlist form anywhere in the hero, no console errors.
- Single trial CTA is visible, styled consistently with the rest of the page, and navigates to `/signup`.
- Video placeholder renders in its agreed position without layout shift or breaking mobile width.
- No leftover references to `handleWaitlist`/`wlStatus`/waitlist state in `Landing.jsx` (grep confirms zero).
- Regression: nav "Start free trial" / "Sign in" and footer "Request a demo" / Privacy / Terms links still work unchanged.

## History
<!-- Keep this updated. Earliest to latest -->
- 2026-07-26: Task loaded. Confirmed via grep that the live landing page is `Landing.jsx` (routed at `/`), not `SaasLanding.jsx` (unrouted, out of scope). Located the current waitlist form, nav/footer CTAs, and `DemoChat` preview in `Landing.jsx` before writing this spec. Awaiting answers to the open decisions above before proposing an implementation plan.
