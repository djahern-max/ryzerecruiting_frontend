# Current Feature

Job Orders — hourly rate range + employment type + industry-agnostic placeholders (frontend)

## Status
In Progress — both commits' code done; backend GET check + manual Verification checklist still outstanding (no local backend reachable yet)

## Goals
Mirror the backend's new job order fields in the admin UI and make the form industry-agnostic:

1. **Industry-agnostic placeholders** — Job Title example changes from "Senior Fund Accountant" to a neutral role (use `e.g. Operations Manager`).
2. **Lower salary examples** — Salary Min placeholder `e.g. 50000`, Salary Max placeholder `e.g. 80000`.
3. **New form fields** — Hourly Min / Hourly Max (number inputs, `step="0.01"`, placeholders `e.g. 25.00` / `e.g. 40.00`) and an Employment Type select: `— Select type —` (empty), Contract (`contract`), Contract-to-Hire (`contract_to_hire`), Direct Hire (`direct_hire`).
4. **Display** — roster table/mobile cards and the detail page surface hourly rates and employment type; AI parse auto-fill maps the new fields.

**Depends on the backend task** (backend repo `context/current-feature.md`, same feature name) being deployed first — the API must accept and return `hourly_min`, `hourly_max`, `employment_type` before this ships. The frontend changes are backward-safe either way (fields just come back undefined), but don't verify against a stale backend.

### Numbered edit sites — `src/pages/JobOrderRoster.jsx` unless noted
1. **Constants + formatters (top of file)** — add `EMPLOYMENT_TYPE_OPTIONS` (the four options above, empty value first) and `EMPLOYMENT_TYPE_LABELS`; add `formatHourly(min, max)` mirroring `formatSalary`'s shape but with 2-decimal `/hr` output (`$25.00/hr – $40.00/hr`, `+`, `up to`); add `formatComp(order)` that returns the salary string if present, else the hourly string, else `—`.
2. **Drawer form state** — add `hourly_min: ''`, `hourly_max: ''`, `employment_type: ''` to the initial `useState`, the `editOrder` branch of the `useEffect` (`|| ''` pattern like the others), and the reset branch.
3. **Placeholders** — Job Title → `e.g. Operations Manager`; Salary Min → `e.g. 50000`; Salary Max → `e.g. 80000`.
4. **Form grid** — after the Salary Max field group: Hourly Min and Hourly Max field groups (same markup pattern as the salary inputs, `type="number" step="0.01"`), then a full-width Employment Type `<select>` using the existing `fieldSelect` class and mapping `EMPLOYMENT_TYPE_OPTIONS`.
5. **`handleSave` payload** — `hourly_min: form.hourly_min ? Number(form.hourly_min) : null`, same for `hourly_max`, and `employment_type: form.employment_type || null`.
6. **`handleParse` mapping** — extend the `setForm` merge with `hourly_min`, `hourly_max`, `employment_type` (`data.x || prev.x` pattern, matching the existing lines).
7. **Roster display** — desktop table salary cell and the mobile card's salary line switch from `formatSalary(order.salary_min, order.salary_max)` to `formatComp(order)`. Column header "Salary Range" → "Compensation".
8. **`src/pages/JobOrderDetail.jsx`** — compute `formatHourly` for the order (import/duplicate per this repo's existing convention — check whether formatters are shared or per-file, and match it); add two info rows next to the existing Salary row: "Hourly Rate" (render only if present) and "Type" (label via `EMPLOYMENT_TYPE_LABELS`, render only if set). If the detail page's edit path reuses `JobOrderDrawer`, it inherits the new fields for free — confirm this in the audit; if it has its own form, apply edit sites 2–6 there too.

## Related Files
- `src/pages/JobOrderRoster.jsx`
- `src/pages/JobOrderRoster.module.css` (only if the new fields need grid tweaks — expect none; reuse `fieldGroup` / `fieldFull`)
- `src/pages/JobOrderDetail.jsx`
- `src/pages/JobOrderDetail.module.css` (same caveat)

## Decisions to flag in the audit
- **Formatter sharing:** `formatSalary` currently appears in both `JobOrderRoster.jsx` and `JobOrderDetail.jsx`. State whether you'll duplicate `formatHourly`/labels into the detail page (matching the existing duplication) or extract a shared util — default to **duplicating** to match the current pattern; extraction is a separate refactor, not this task.
- **Fetch pattern:** the apiFetch migration (parked task) has not reached these files uniformly. Use whatever call pattern each file currently uses — do **not** fold an apiFetch migration into this change.
- **`formatComp` precedence:** spec says salary wins when both exist (roster column stays compact). If you think showing both is better in the table, flag it in the plan — the detail page already shows both as separate rows regardless.

## Verification
- [ ] New Job Order modal shows: neutral title placeholder, 50000/80000 salary placeholders, Hourly Min/Max inputs, Employment Type select
- [ ] Create an hourly contract order (hourly only, type = Contract) → saves; roster row shows the hourly range in the Compensation column; detail page shows Hourly Rate row and Type: Contract
- [ ] Create a salaried Direct Hire order → roster shows salary range; detail shows Salary + Type: Direct Hire, no Hourly row
- [ ] Edit an existing pre-migration order → drawer opens with empty hourly/type fields, saving without touching them changes nothing
- [ ] Paste an hourly temp-to-hire posting into the AI parser → hourly fields and Employment Type = Contract-to-Hire auto-fill; salary fields stay empty
- [ ] Decimal hourly values (e.g. 32.50) round-trip through save → reload without truncation
- [ ] Mobile card list renders the hourly range correctly (check at iPhone width per the media-query pass conventions)
- [ ] PDF download for an hourly order shows the new chips (backend renders these — just confirm end-to-end)

## Notes
- Values sent to the API are lowercase snake_case (`contract_to_hire`); labels are display-only. Keep them in sync with the backend's `EMPLOYMENT_TYPE_LABELS`.
- No new CSS classes expected — the select and number inputs reuse existing module classes.
- One concern per commit: Roster (sites 1–7) and Detail (site 8) can be separate commits.
- **Known pre-existing gap (not fixed here):** `JobOrderDetail.jsx`'s Edit button navigates to `/admin/job-orders?edit={id}`, but `JobOrderRoster.jsx` has no `?edit=` / `useSearchParams` handling to auto-open the drawer for that order — the wiring is incomplete today, unrelated to this task. Verification consequence: the "edit a pre-existing order" check must be run by opening the drawer from the roster's own Edit button, not via the detail page's Edit button. Queue as its own task later.

## History
<!-- Keep this updated. Earliest to latest -->
- 2026-07-23 — Audit done: confirmed `formatSalary` is duplicated (not shared) between `JobOrderRoster.jsx` and `JobOrderDetail.jsx`; confirmed both files use raw `fetch` (not `apiFetch`) throughout, matching the CLAUDE.md migration list — not touched. Confirmed `JobOrderDetail.jsx` has no separate edit form (its Edit button navigates to `/admin/job-orders?edit={id}`), so edit sites 2–6 do not need to expand into Detail — found and flagged the `?edit=` wiring gap above. Decisions confirmed: duplicate `formatHourly`/`EMPLOYMENT_TYPE_LABELS` into Detail (Roster's copy returns `'—'` when empty for `formatComp`, Detail's copy returns `null` to hide the row, matching each file's existing `formatSalary` convention); `formatComp` salary-wins precedence as spec'd. No local backend reachable to confirm `hourly_min`/`hourly_max`/`employment_type` are live yet — verification items stay unchecked until that GET check is done.
- 2026-07-23 — Commit 1/2 (Roster, sites 1–7): added `EMPLOYMENT_TYPE_OPTIONS`/`EMPLOYMENT_TYPE_LABELS`/`formatHourly`/`formatComp`; added `hourly_min`/`hourly_max`/`employment_type` to drawer form state (initial, edit-hydration, reset), `handleSave` payload, and `handleParse` mapping; updated Job Title/Salary Min/Salary Max placeholders; added Hourly Min/Max inputs + Employment Type select to the form grid (existing `fieldGroup`/`fieldFull`/`fieldSelect` classes, no new CSS); switched roster desktop + mobile compensation display to `formatComp(order)`, renamed the column header to "Compensation". `npm run build` passed; `npx eslint` shows only 2 pre-existing unrelated errors (unused `err` in catch blocks, present before this change). Committed `d7d4129`.
- 2026-07-23 — You asked to archive this task as complete, but it wasn't — `JobOrderDetail.jsx` had zero diff and every Verification checkbox was unchecked. Flagged this before archiving; you chose to finish the Detail commit now rather than archive Roster-only. Implemented commit 2/2 (Detail, site 8): duplicated `EMPLOYMENT_TYPE_LABELS`/`formatHourly` into `JobOrderDetail.jsx` (this file's copy returns `null` when both hourly values are empty, matching its existing `formatSalary` convention, so the Hourly Rate row hides); added `hourly`/`employmentTypeLabel` derived values next to the existing `salary` line; added "Hourly Rate" and "Type" info rows into the Job Details card, each rendering only when present. `npm run build` and `npx eslint` both clean (0 errors). Local backend at `localhost:8000` still unreachable — could not do the required GET check for `hourly_min`/`hourly_max`/`employment_type`, so no Verification checklist item is checked off yet.
