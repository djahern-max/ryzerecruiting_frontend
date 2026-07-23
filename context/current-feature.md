# Current Feature

Employer Roster — profile link discoverability

## Status
Not Started

## Goals
Make it obvious that the company name in the Employer Roster navigates to the
employer profile page (`/admin/employers/{id}`). Today `.companyNameLink` is
styled as plain dark text (`var(--text-900)`, no underline at rest) and only
reveals itself as a link on hover — users don't realize it's clickable.

Numbered edit sites:

1. **`EmployerRoster.module.css` — `.companyNameLink` resting color.**
   Change resting `color` from `var(--text-900)` to `var(--brand-700)` so the
   name reads as a link at rest, matching the existing `.websiteLink` /
   `.emailLink` convention. Keep the hover underline behavior. Add
   `text-decoration: none` at rest (needed for edit site 3's element swap).

2. **`EmployerRoster.jsx` (desktop `EmployerRow`) — arrow affordance.**
   After the company name, inside the name element, add
   `<span className={styles.linkArrow}>→</span>`. In the CSS: `.linkArrow` at
   opacity ~0.35, 120ms opacity transition, 4px left margin, brought to full
   opacity on `.row:hover .linkArrow`.

3. **`EmployerRow` — convert `<button>` + `navigate()` to react-router `<Link>`.**
   Replace the company-name `<button>` with
   `<Link to={`/admin/employers/${profile.id}`}>` using the same
   `.companyNameLink` class, so cmd+click / middle-click open a new tab and the
   browser status bar shows the destination. Import `Link` from
   `react-router-dom`. Verify the link renders visually identical to the button
   (watch `font-family` inheritance — buttons don't inherit it by default,
   anchors do).

4. **Mobile `EmployerCard` — chevron affordance.**
   Add an iOS-style `›` chevron on the right edge of the tappable `.cardMain`
   area to signal that tapping navigates. Position with flexbox, color
   `var(--text-300)`. Must not interfere with the existing `onClick`
   navigation on `.cardMain` or the status select / Brief button in
   `.cardFooter`.

Out of scope — do NOT touch: the expand/Brief toggle, the relationship-status
dropdown, notes editing, any navigation behavior or routes, or any other page.
Match the existing CSS Modules conventions and design tokens already used in
these files.

## Related Files
- `src/pages/EmployerRoster.jsx`
- `src/pages/EmployerRoster.module.css`

## Verification
- `npm run build` passes.
- Desktop table: company name renders brand blue at rest; arrow visible at low
  opacity and brightens on row hover; clicking the name still navigates to
  `/admin/employers/{id}`; cmd+click (or middle-click) opens the profile in a
  new tab.
- Visual check: name link renders identically to the old button (font, weight,
  size, alignment) — no layout shift in the company cell.
- Mobile width (~380px): chevron visible on the right edge of each card; card
  tap still navigates; status select and Brief button still work without
  triggering navigation.
- Expand/Brief panel, status dropdown, and notes editing all behave exactly as
  before on both layouts.

## Notes
Spec came from a discoverability review in Claude chat (2026-07-23): the name
link was styled as plain `var(--text-900)` text and only revealed as a link on
hover, so the path from roster → employer profile wasn't visible. Design
rationale: brand-colored resting link + subtle arrow costs a few lines of CSS,
requires no layout change, and matches the link language already established by
`.websiteLink`. The button→Link swap is a bonus usability win (new-tab support,
status-bar URL preview). No backend change expected.

Candidate future task: `--text-300` is used repo-wide (this file's `.empty`/
`.noStatus`, `CandidateModal`, `IntelligenceMessage`, `CandidateResultCard`,
`ChatPage`, `JobOrderRoster`, etc.) but is never defined in `theme.css` —
only `--text-900`/`--text-700`/`--text-500` exist there. Out of scope for
this task; the new `.cardChevron` rule uses `var(--text-300, #cbd5e1)` with
an inline fallback rather than touching the token or any other call site.

## History
<!-- Keep this updated. Earliest to latest -->
- 2026-07-23 — Implemented all 4 edit sites in `EmployerRoster.jsx` /
  `EmployerRoster.module.css`: (1) `.companyNameLink` resting color →
  `var(--brand-700)` + `text-decoration: none`; (2) added `.linkArrow` span
  + hover-opacity CSS; (3) swapped the company-name `<button>` for
  react-router `<Link>`, imported `Link`, removed the now-unused `navigate`
  from `EmployerRow` (left `EmployerCard`'s `navigate` untouched); (4) added
  a `.cardMainText` flex wrapper (`flex: 1; min-width: 0`) around the
  existing mobile card text plus a `.cardChevron` span using
  `var(--text-300, #cbd5e1)` since the token isn't defined in `theme.css`
  (see Notes above — flagged as a candidate future task, not fixed here).
