# Current Feature

<!-- Feature/fix name -->
Feature 2 of 3 — Demo Video Hero on the Landing Page

## Status
Ready to implement — all prep complete, all decisions locked

## Repo
ryzerecruiting_frontend — FRONTEND ONLY. No backend code in this feature.

**Date:** 2026-07-26 · **Go-live day, feature 2 of 3** (after 1-self-serve-signup, before 3-usage-billing)
**Depends on:** Feature 1 merged ✅ — hero CTAs already link to `/signup` and `/demo`.

## Prep — DONE ✅ (completed outside the repo, 2026-07-26)
- Source video re-encoded HEVC → H.264 (`libx264`, CRF 22, `preset slow`), AAC audio copied untouched, `+faststart` applied. Verified `codec_name=h264`/`aac` via ffprobe. 1920×1080 @ 30fps, ~12m38s.
- Poster frame exported from frame zero (creator staged the opening frame as the intended thumbnail — poster matches the first frame of playback exactly, no visual swap on play).
- Both uploaded to DO Spaces with public-read ACL, CDN endpoint confirmed live, versioned filename (`-v1`) used so any future replacement ships under a new name instead of fighting CDN cache.

**Asset URLs (public, use these exact constants):**
```
VIDEO_URL  = "https://ryzerecruiting.nyc3.cdn.digitaloceanspaces.com/Demo_Video/ryze-demo-v1.mp4"
POSTER_URL = "https://ryzerecruiting.nyc3.cdn.digitaloceanspaces.com/Demo_Video/ryze-demo-poster.jpg"
```

## Context — current state of the code
- `src/pages/Landing.jsx` is the live `/` route. The prior task already left an empty `VideoSection` component (returns `null`) positioned between the hero CTA block and the `DemoChat` preview — this feature fills that slot and re-arranges around it.
- Hero CTAs already exist and are correct: "Start Your 60-Day Free Trial" → `/signup` (primary), subline, "Request a demo" → `/demo` (secondary). Do not rebuild them; reposition only if the layout requires it.
- PostHog is initialized app-wide via `PostHogProvider` in `main.jsx` (dev mode opts out of capture). Import `posthog` from `posthog-js` per the existing pattern in `DemoRequest.jsx`.
- CSS Modules per convention (`Landing.module.css`).

## Objective
The demo video becomes the visual centerpiece of the hero, replacing `DemoChat` in that position. `DemoChat` is NOT deleted — it moves below the fold (see decisions).

## Scope — IN
1. **Fill `VideoSection`** in `Landing.jsx`:
   - Native HTML5 `<video>` with `controls`, `poster={POSTER_URL}`, `preload="metadata"`, `playsInline`. Click-to-play behind the poster with a large play affordance. **No autoplay with sound.** (Muted autoplay loop only if it genuinely looks better — default to click-to-play.)
   - `VIDEO_URL` / `POSTER_URL` as constants at the top of the component (they're public URLs — no env var needed).
   - Video takes `DemoChat`'s current visual slot as the hero centerpiece — consider reusing/adapting the existing `.previewWrap` / `.previewGlow` framing so the video inherits the same polish, or build an equivalent framed treatment in the CSS module.
2. **Move `DemoChat` below the fold** — relocate the `previewWrap`/`DemoChat` block to its own section below the hero (e.g., between the hero and the proof row, or after the proof row — implementer's call on which reads better). Component itself is untouched; only its placement moves. Light section framing/heading is fine, restructuring the sections themselves is not the goal.
3. **PostHog:** fire `demo_video_played` on first play only — `onPlay` handler guarded by a played-once ref (`useRef(false)`), matching the app's existing analytics patterns.
4. **Mobile pass:** hero + video verified at phone-width viewport; `playsInline` prevents iOS fullscreen hijack; video scales to container width without overflow or layout shift (poster and video share the same 16:9 aspect ratio — reserve the box with `aspect-ratio` CSS to prevent CLS).

## Scope — OUT
- Adaptive bitrate streaming (HLS/Mux/Cloudflare Stream) — overkill at current traffic; revisit if mobile complaints appear.
- Multiple resolutions or a quality switcher.
- Any backend work.
- Deleting or modifying `DemoChat` internals — placement change only.
- Restructuring landing sections below the fold beyond the DemoChat relocation (fine to lightly tidy, not the goal).
- `SaasLanding.jsx` — still unrouted/orphaned, still out of scope, do not touch.

## Decisions — LOCKED 2026-07-26
- **DemoChat: moves below the fold** (not removed, not stacked in the hero with the video). One centerpiece per viewport.
- Poster = frame zero of the video (deliberately staged by Dane as the thumbnail).
- URLs as in-component constants, not env vars.
- Click-to-play, no autoplay.

## Acceptance criteria
- Video plays from the CDN URL on desktop Chrome and iPhone Safari; seeking works before full download (faststart verified).
- Page load stays fast: **the MP4 is not downloaded on initial page load** — only metadata fetched until play (verify in the Network tab; `preload="metadata"` should show a small ranged request, not the ~full file).
- Both CTAs still navigate correctly (`/signup`, `/demo`).
- `demo_video_played` fires exactly once per page load in PostHog, even across pause/resume (replay of the video after ending should NOT re-fire it).
- DemoChat renders below the fold with no console errors and no visual regression to the component itself.
- No layout shift when the poster loads or when play begins (aspect-ratio box reserved).
- `npm run build` passes clean.

## Notes
- Parking lot (future enhancement): cut a 60–90s highlight for the hero and link the full ~12min demo below it — long demos are the right asset to host, short ones convert better as heroes.
- If the video file is ever replaced, upload under a **new filename** (`-v2`, etc.) — the CDN caches aggressively and purging is slower than versioning.
- Parked backend cleanup (unchanged from prior task): `/api/waitlist` endpoint + `Waitlist` model are now caller-less but deliberately untouched.

## Session log
- 2026-07-26 — Prep completed outside the repo: HEVC source re-encoded to H.264/AAC with faststart, frame-zero poster exported, both uploaded to Spaces under `Demo_Video/` with versioned filenames, CDN URLs confirmed. DemoChat decision locked: moves below the fold. Spec finalized; ready for implementation session.
- (append per session)
