# Current Feature

<!-- Feature/fix name -->
Call Summary card on the candidate profile — surface call intelligence, demote the raw transcript

## Status
<!-- Not Started | In Progress | Completed -->
Not Started

> **Note:** this preempts the in-flight **apiFetch migration** (next file was `ChatPage.jsx`), parked
> at `context/parked-apifetch-migration.md`. Its plan of record still lives in `CLAUDE.md`. Restore
> it here when this task moves to `CHANGELOG.md`.

## Goals
<!-- Goals & requirements -->
**The backend is live.** `GET /api/candidates/{id}` (admin endpoint) now returns five derived,
read-only fields resolved from the candidate's most recent booking that has a summary. Verified
against Renata Voss (`/api/candidates/2`, tenant `green_path_recruiting`) on 2026-07-14:

```json
{
  "call_booking_id": 4,
  "call_date": "2026-07-10",
  "call_summary":    "Dane reached out to Renata Voss, a landscape designer and NC State …",
  "call_next_steps": "Renata to send her resume to Dane; Dane to build out her candidate …",
  "call_keywords":   "landscape design, outdoor living spaces, patio design, planting plans, …"
}
```

Note the shapes: `call_next_steps` is a **semicolon-delimited string**, not newline-delimited and
not a list. `call_keywords` is comma-delimited. `call_date` is a plain `YYYY-MM-DD` date string.
Don't assume — these came off the wire.

**The problem this solves.** `CandidateProfile.jsx` currently renders the raw Zoom transcript as
the primary artifact of a call. That's the least useful view of it. The AI summary, next steps, and
keywords existed all along — they were written to the *booking* row, so they never reached this page.

**Goal:** add a **"Call Summary"** card, above the transcript, and collapse the transcript beneath it.

**Naming discipline — this is the actual point of the task.** The UI currently has two different
things a viewer will conflate:

| Card / column | Field | Source |
|---|---|---|
| "About" (profile) / "AI Summary" (roster) | `ai_summary` | resume / LinkedIn parse |
| **"Call Summary" (new)** | `call_summary` | Claude, from the Zoom transcript |

These stay visually and verbally distinct. Do **not** label the new card "AI Summary". Do **not**
fall back from one to the other when either is null — they answer different questions, and a blank
one is meaningful information.

**Card contents, in order:**
1. Header: `Call Summary` + muted subline — `From your call on {call_date}`. Match the date
   formatting in `MeetingSummaryPanel.jsx`.
2. `call_summary` — prose paragraph.
3. `call_next_steps` — split on `;`, trim, render as `<ul>` using the existing `bulletList` /
   `bulletItem` classes.
4. `call_keywords` — split on `,`, trim, render with the existing skill-tag chip style.

**Transcript demotion:** the `CALL TRANSCRIPT` card stays but is collapsed by default behind a
`View full transcript` toggle. It's the receipt, not the headline.

**Empty states:** if `call_summary` is null, the whole card doesn't render — no skeleton, no
"pending" placeholder. A manually-added candidate who never had a call should show no trace of it.
Render sub-sections independently: a summary with no next steps still renders the card.

## Related Files
<!-- Files this touches -->
- `src/pages/CandidateProfile.jsx` — new Call Summary card in `mainCol`, **below** the "About" card
  and **above** the transcript card; transcript collapse toggle
- `src/pages/CandidateProfile.module.css` — reuse `bodyCard` / `bodyCardTitle` / `bodyCardBody` /
  `bulletList` / `bulletItem` / skill-tag styles. Add only what's genuinely new (header subline,
  transcript toggle).
- Reference only, do not change:
  - `src/components/MeetingSummaryPanel.jsx` — the booking-side summary panel. Match its date
    formatting and general shape for visual consistency.
  - `src/pages/CandidatesPage.jsx` — the roster "AI Summary" column stays bound to `ai_summary`.

**Explicitly out of scope:**
- Migrating `CandidateProfile.jsx` to `apiFetch`. It's on the migration list — separate concern,
  separate commit. Don't bundle it.
- `CandidateSelfProfile.jsx` / `CandidateDashboard.jsx`. Those read `GET /api/candidates/me`, which
  deliberately does **not** return `call_*` (recruiter-owned fields — see the backend task). Adding
  the card there would be a privacy regression, not a feature.
- The candidate PDF export.
- The "Profile stub — resume not yet parsed" banner. It's correct and stays. Once the Call Summary
  card is in, that banner reads as *intentional* ("we have the call, not the resume yet") rather
  than looking like something's broken.

## Verification
<!-- How we'll know it worked -->
1. As a `green_path_recruiting` admin, open `/admin/candidates/2` (Renata Voss). The Call Summary
   card renders above the transcript: summary prose, next steps as bullets, keywords as chips,
   `From your call on July 10, 2026` in the subline.
2. Transcript is collapsed by default, expands on click.
3. The "About" card is **absent** — her `ai_summary` is still `null`. Confirms the two aren't
   cross-wired.
4. Open a candidate with no booking → no Call Summary card, no empty container, no console errors.
   (Green Path only has Renata — create a throwaway candidate from the roster, check, delete.)
5. Enrich Renata via **Enrich with Resume / LinkedIn**. The "About" card appears *and* Call Summary
   remains. Both visible, clearly labeled, obviously different things.
6. `npm run build` passes locally before push.

## Notes
<!-- Any extra notes -->
- Backend shipped and verified 2026-07-14. This is unblocked.
- Demo-blocking, not polish — the Renata Voss demo video can't honestly claim "Claude writes the
  summary and pushes it into her profile" until it appears there.
- Once this ships the demo narrative gets *better*, not just accurate: two AI passes from two
  different sources (call → Call Summary; resume → About) landing on one profile.

## History
<!-- Keep this updated. Earliest to latest -->
- 2026-07-14 — Task created while scripting the Renata Voss demo. The profile page showed a raw
  transcript and no summary, and "AI Summary" in the roster turned out to be a *different* field
  (`ai_summary`, resume-derived) than the one generated from the call (`booking.meeting_summary`).
  Two things sharing one name was the real bug; the missing card was the symptom.
- 2026-07-14 — Backend counterpart shipped and verified: `call_summary`, `call_next_steps`,
  `call_keywords`, `call_date`, `call_booking_id` confirmed populated on `/api/candidates/2`,
  `ai_summary` confirmed still `null`, tenant isolation confirmed intact. Frontend unblocked.
- 2026-07-14 — `CandidateProfile.jsx` / `CandidateProfile.module.css` updated: Call Summary card
  added in `mainCol`, immediately after the About card. Renders `call_summary` prose,
  `call_next_steps` (split on `;`) as bullets, `call_keywords` (split on `,`) as skill-tag chips,
  and a muted subline "From your call on {call_date}" (long-month format, no weekday). Card is
  gated on `call_summary` alone so sub-sections render independently and a null `call_summary`
  hides the whole card. Call Transcript card reworked: reuses the existing `transcriptExpanded`
  state but now renders nothing until toggled ("View full transcript ↓" / "Hide transcript ↑"),
  replacing the old 600-char truncation + fade; removed the now-dead `.transcriptFade` CSS class.
  New CSS: `.callSummaryHeader`, `.callDateSubline`, `.callSummarySection`. `npm run build` passes
  locally. Not yet manually verified in-browser against Renata Voss — do that before marking
  Completed. `apiFetch` migration untouched, as scoped.
