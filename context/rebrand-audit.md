# Rebrand Audit — "ryze" occurrences (Frontend)

Date: 2026-11-02
Scope: findings only. No code was changed. `context/current-feature.md` was not touched.
Method: `grep -rniI 'ryze'` over the repo, excluding `.git/`, `node_modules/`, and `package-lock.json` (zero hits there anyway), plus `find -iname '*ryze*'` for filenames. Every hit was read in context before classification. This file is itself excluded from the counts.

**Scope note.** The task spec names `app/services/branding.py`, `app/services/usage.py`, `ai_brief.py`, `calendar.py`, and "the three PDF templates". None of those live in this repo — they are in the sibling `ryzerecruiting_backend` checkout. This audit inventories the **frontend** exhaustively. Appendix A is a read-only cross-reference of the backend's slug-gated code paths, done only because the Category A question ("which endpoints behave differently for a non-ryze slug") cannot be answered from the frontend alone. The backend needs its own full audit pass; Appendix A is not that.

**How branding reaches the frontend.** There is no resolver in this repo. The only resolved brand value is `user.tenant_brand_name`, which the backend attaches to the `/api/auth/me` payload via `get_branding(db, user.tenant_id).brand_name`. Three surfaces consume it (`Header.jsx:30`, `CandidateDashboard.jsx:312`, `CandidateSelfProfile.jsx:449`). Everything else that shows a brand is a hardcoded literal.

**Unrouted file.** `src/pages/SaasLanding.jsx` has 43 hits (27% of the repo total) but is imported by nothing — `App.jsx` routes `/` to `Landing.jsx`. Its rows are classified by what they *would* be if routed, and each note says so. Treat that file as a deletion candidate, not a rename candidate.

---

## A. TENANT-SLUG

The frontend never reads the database. All four hits compare or default against `user.tenant_id` from the `/api/auth/me` payload, which the backend populates from the `users.tenant_id` column (DB default `"ryze"`; NULL coalesces to `"ryze"` server-side). So: **read from DB by the backend, compared only in code here.**

| file | line | matching text | what breaks if changed |
|---|---|---|---|
| `src/contexts/AuthContext.jsx` | 56 | `tenant_id: user.tenant_id \|\| 'ryze',` | PostHog `identify()` person property only. Changing the fallback relabels analytics for users whose `/me` has a null `tenant_id`; no app behavior. |
| `src/components/Header.jsx` | 9 | `const isFirmTenant = Boolean(user?.tenant_id) && user.tenant_id !== 'ryze';` | Gates the "powered by RYZE" suffix (line 33). If the platform slug changes and this literal doesn't, platform-tenant users start seeing "powered by RYZE" next to their own wordmark. |
| `src/pages/CandidateDashboard.jsx` | 228 | `const isFirmTenant = Boolean(user?.tenant_id) && user.tenant_id !== 'ryze';` | Gates the "You're working with {tenant_brand_name}" banner subtitle (lines 311–312). Same failure mode as Header. |
| `src/pages/CandidateSelfProfile.jsx` | 48 | `const isFirmTenant = Boolean(user?.tenant_id) && user.tenant_id !== 'ryze';` | Gates the footer tagline "Prepared for you by {tenant_brand_name}" vs. "Your Candidate Profile" (lines 448–450). Same failure mode. |

### A.1 Frontend behavior that differs for a tenant whose slug is not `"ryze"`

Only three surfaces, all cosmetic, all driven by the same copy-pasted `isFirmTenant` expression:

1. `Header.jsx:32-34` — renders `powered by RYZE` beside the wordmark.
2. `CandidateDashboard.jsx:311-312` — renders `You're working with {tenant_brand_name}` under the welcome banner.
3. `CandidateSelfProfile.jsx:448-450` — footer reads `Prepared for you by {tenant_brand_name}` instead of `Your Candidate Profile`.

Everything else in the frontend is tenant-agnostic: routing, `AdminRoute`/`SuperAdminRoute` gating (`is_superuser` / `user_type`), the 402 interceptor, and every data call. The `/ryze/invite` route (`App.jsx:251`) is gated by `SuperAdminRoute`, not by slug — but the backend endpoint it calls *is* slug-gated (see Appendix A, item 3).

For the backend's list, see **Appendix A**.

---

## B. BRANDING-RESOLVED

Only one hit in the repo contains the literal "ryze" *and* goes through the resolved value.

| file | line | matching text | what breaks if changed |
|---|---|---|---|
| `src/components/Header.jsx` | 30 | `{user?.tenant_brand_name \|\| 'RYZE.ai'}` | Primary value is `tenant_brand_name` from `/me` (resolved by backend `get_branding`). The `'RYZE.ai'` literal is only the fallback when `user` is null (Header rendered logged-out) or the field is missing. A new tenant with a `tenants.brand_name` row sees its own name here with no code edit. Changing the literal only changes the logged-out/null case. |

For completeness, the two other resolved consumers contain no "ryze" literal and are not counted: `CandidateDashboard.jsx:312`, `CandidateSelfProfile.jsx:449`.

---

## C. BRANDING-HARDCODED

User-visible text, logos, titles, placeholders, legal copy, and CSS-generated text that bypass `tenant_brand_name`. Sorted: live shared chrome first, then auth/billing pages, dashboards, legal pages, and finally the unrouted `SaasLanding.jsx`.

| file | line | matching text | what breaks if changed |
|---|---|---|---|
| `index.html` | 6 | `<link rel="icon" type="image/png" href="/RYZE_LOGO.png" />` | Browser-tab favicon on every page. Renaming the file without updating this line = broken favicon. |
| `public/RYZE_LOGO.png` | — | (filename) | The favicon asset itself, served at `/RYZE_LOGO.png`. Paired with `index.html:6`. |
| `src/components/Header.jsx` | 33 | `<span className={styles.poweredBy}>powered by RYZE</span>` | Shown to every firm-tenant user (candidate/employer header). This is the one place the *platform* name is deliberately surfaced to white-labeled tenants. |
| `src/components/AdminHeader.jsx` | 77 | `...onClick={() => navigate("/admin")}>RYZE.ai</span>` | Wordmark on every admin page. Does **not** use `tenant_brand_name` — firm admins see "RYZE.ai", not their firm. |
| `src/components/BookingCard.jsx` | 186 | `"Let us learn about your hiring needs and how RYZE can help."` | Employer booking subtext. Copy only. |
| `src/components/BookingCard.jsx` | 356 | `RYZE GROUP, Inc. (RYZE.ai). Message frequency varies. Message and data rates` | SMS-consent legal text (TCPA sender identity). Must match the Twilio sender's registered entity — changing the brand without changing the sending entity is a compliance mismatch, not just a typo. |
| `src/pages/Auth.jsx` | 103 | `RYZE` | Login/signup wordmark. |
| `src/pages/Auth.module.css` | 36 | `content: 'RYZE';` | CSS-generated watermark inside the auth card. Visible. |
| `src/pages/AdminLogin.jsx` | 36 | `RYZE<span className={styles.logoAi}>.ai</span>` | Admin login wordmark. |
| `src/pages/AdminLogin.jsx` | 52 | `placeholder="you@ryze.ai"` | Email input placeholder. Cosmetic. |
| `src/pages/SignupFirm.jsx` | 60 | `<div className={styles.logo}>RYZE.ai</div>` | Firm-signup wordmark. |
| `src/pages/DemoRequest.jsx` | 60 | `<div className={styles.logo}>RYZE.ai</div>` | Demo-request wordmark. |
| `src/pages/OAuthCallback.jsx` | 60 | `<h1 className={styles.logo}>RYZE.ai</h1>` | OAuth loading-state wordmark. File is intentionally raw-fetch (CLAUDE.md); text-only change is safe. |
| `src/pages/OAuthCallback.jsx` | 76 | `<h1 className={styles.logo}>RYZE.ai</h1>` | OAuth error-state wordmark. Same. |
| `src/pages/CompleteOAuthSignup.jsx` | 64 | `<h1 className={styles.logo}>RYZE.ai</h1>` | OAuth signup-completion wordmark. |
| `src/pages/BillingSuccess.jsx` | 33 | `<div className={styles.logo}>RYZE.ai</div>` | Post-Stripe success wordmark. |
| `src/pages/UpgradePage.jsx` | 47 | `<div className={styles.logo}>RYZE.ai</div>` | 402-destination wordmark. File intentionally raw-fetch (CLAUDE.md); text-only change is safe. |
| `src/pages/UpgradePage.jsx` | 64 | `<span className={styles.planName}>RYZE.ai Recruiting Platform</span>` | Plan name on the upgrade card. Should match the Stripe product name a buyer sees at checkout. |
| `src/pages/UpgradePage.jsx` | 75 | `<li>... RYZE Intelligence chat</li>` | Feature bullet; product name "RYZE Intelligence". |
| `src/pages/ChatPage.jsx` | 289 | `const mobileChatTitle = activeSession?.title \|\| "RYZE Intelligence";` | Mobile chat header fallback title. Product name. |
| `src/pages/ChatPage.jsx` | 576 | `<h2 className={styles.emptyTitle}>RYZE Intelligence</h2>` | Empty-state title. Product name. |
| `src/pages/CandidateDashboard.jsx` | 339 | `<span className={styles.howItWorksBadge}>How RYZE.ai works</span>` | Onboarding badge shown to candidates with no profile. Shown to firm-tenant candidates too — says "RYZE.ai" where `tenant_brand_name` is available two lines away. |
| `src/pages/CandidateDashboard.jsx` | 348 | `After the call, RYZE.ai uses the conversation notes to help build your` | Onboarding copy. Same gap. |
| `src/pages/CandidateDashboard.jsx` | 423 | `<div className={styles.callMeta}>Intro call with RYZE.ai</div>` | Booking row meta. Same gap. |
| `src/pages/EmployerDashboard.jsx` | 166 | `RYZE Matched` | Badge on matched roles. Product term. |
| `src/pages/EmployerDashboard.jsx` | 205 | `Talk to RYZE about this AI opportunity →` | CTA link text. |
| `src/pages/EmployerDashboard.jsx` | 336 | `... From there, RYZE can help identify realistic opportuniti...` | Discovery-call explainer paragraph. |
| `src/pages/EmployerDashboard.jsx` | 347 | `{myRoles.length} active opportunit{...} with RYZE —` | Role-count summary. |
| `src/pages/EmployerDashboard.jsx` | 393 | `<div className={styles.callMeta}>AI opportunity discovery with RYZE.ai</div>` | Booking row meta. |
| `src/pages/EmployerDashboard.jsx` | 424 | `... being shaped across the RYZE network` | Other-roles summary. |
| `src/pages/EmployerSelfProfile.jsx` | 428 | `<span className={styles.footerBrand}>RYZE.ai</span>` | Employer self-profile footer brand. **Not gated** — unlike `CandidateSelfProfile`, which was white-labeled in Phase 3 (CHANGELOG). Employer portal still shows the platform brand. |
| `src/pages/Landing.jsx` | 123 | `<span className={styles.demoWindowTitle}>RYZE Intelligence</span>` | Public landing demo-window title. |
| `src/pages/Landing.jsx` | 137 | `<div className={styles.demoMsgLabel}>RYZE</div>` | Demo chat message label. |
| `src/pages/Landing.jsx` | 145 | `<div className={styles.demoMsgLabel}>RYZE</div>` | Demo chat message label. |
| `src/pages/Landing.jsx` | 245 | `RYZE<span className={styles.brandMobileAi}>.ai</span>` | Mobile nav wordmark. |
| `src/pages/Landing.jsx` | 293 | `<h2 ...>See RYZE Intelligence in action</h2>` | Section heading. |
| `src/pages/Landing.jsx` | 305 | `RYZE` | Footer wordmark. |
| `src/pages/Landing.module.css` | 176 | `content: 'RYZE.ai';` | CSS-generated hero watermark, animated. Visible. |
| `src/pages/admin/TenantSettings.jsx` | 138 | `sent under your firm's name from RYZE's email service;` | Help text on the Branding page, shown to firm admins. Describes the real sending domain — must stay truthful to whatever `FROM_EMAIL` the backend sends from. |
| `src/pages/PrivacyPolicy.jsx` | 15 | `Welcome to RYZE.ai, operated by RYZE GROUP, Inc. ("we," "our," or "us"). We are` | Legal entity. Linked from the SMS-consent checkbox (`BookingCard.jsx:358`). |
| `src/pages/PrivacyPolicy.jsx` | 18 | `when you use our recruiting platform at ryze.ai.` | Prose mention of the sold domain. |
| `src/pages/PrivacyPolicy.jsx` | 56 | `to receive these transactional SMS messages from RYZE GROUP, Inc. (RYZE.ai).` | SMS program disclosure (TCPA). |
| `src/pages/PrivacyPolicy.jsx` | 66 | `<li><strong>Sender:</strong> RYZE GROUP, Inc. d/b/a RYZE.ai</li>` | SMS program sender identity. |
| `src/pages/PrivacyPolicy.jsx` | 195 | `<li>Company: RYZE GROUP, Inc. d/b/a RYZE.ai</li>` | Contact block. |
| `src/pages/TermsOfService.jsx` | 15 | `By accessing or using RYZE.ai ("Platform"), you agree to be bound by these Terms...` | Defined term "Platform". |
| `src/pages/TermsOfService.jsx` | 22 | `RYZE.ai is a recruiting platform that connects employers with job candidates. ...` | Service description. |
| `src/pages/TermsOfService.jsx` | 111 | `RYZE GROUP, Inc. (RYZE.ai). These messages include booking confirmations, call` | SMS program disclosure. |
| `src/pages/TermsOfService.jsx` | 116 | `<li><strong>Sender:</strong> RYZE GROUP, Inc. d/b/a RYZE.ai</li>` | SMS program sender identity. |
| `src/pages/TermsOfService.jsx` | 163 | `TO THE MAXIMUM EXTENT PERMITTED BY LAW, RYZE.ai SHALL NOT BE LIABLE FOR ANY INDIRECT...` | Limitation of liability — names the entity. |
| `src/pages/TermsOfService.jsx` | 170 | `You agree to indemnify and hold harmless RYZE.ai from any claims...` | Indemnification — names the entity. |
| `src/pages/SaasLanding.jsx` | 42 | `desc: "...the beginning of something else. RYZE.ai is now a working recruiting platform..."` | Unrouted file — no live effect. Build-in-public episode blurb. |
| `src/pages/SaasLanding.jsx` | 49 | `desc: "...Employer Roster, the RYZE Intelligence chat page — each one tightened up..."` | Unrouted. Episode blurb. |
| `src/pages/SaasLanding.jsx` | 98 | `desc: "Before opening RYZE to real recruiters, the multi-tenant isolation layer..."` | Unrouted. Episode blurb. |
| `src/pages/SaasLanding.jsx` | 133 | `desc: "...Then I asked RYZE Intelligence 6 questions..."` | Unrouted. Episode blurb. |
| `src/pages/SaasLanding.jsx` | 140 | `desc: "RYZE turns recruiting activity into proprietary intelligence. ... RYZE parses each one..."` | Unrouted. Episode blurb. |
| `src/pages/SaasLanding.jsx` | 189 | `desc: "...I built RYZE because I've lived this problem from both sides..."` | Unrouted. Episode blurb. |
| `src/pages/SaasLanding.jsx` | 203 | `desc: "...as I build RYZE.ai in public..."` | Unrouted. Episode blurb. |
| `src/pages/SaasLanding.jsx` | 240 | `summary: "Transformed RYZE from a scheduling tool into an intelligence platform..."` | Unrouted. Changelog-style summary. |
| `src/pages/SaasLanding.jsx` | 254 | `summary: "...so RYZE Intelligence can find them by meaning..."` | Unrouted. Changelog-style summary. |
| `src/pages/SaasLanding.jsx` | 305 | `"RYZE Intelligence now has access to the full conversation — not just the AI summary",` | Unrouted. Bullet. |
| `src/pages/SaasLanding.jsx` | 353 | `summary: "Stress-tested the multi-tenant isolation layer before opening RYZE to external recruiters..."` | Unrouted. Changelog-style summary. |
| `src/pages/SaasLanding.jsx` | 537 | `<span className={styles.demoWindowTitle}>RYZE Intelligence</span>` | Unrouted. Demo-window title. |
| `src/pages/SaasLanding.jsx` | 551 | `<div className={styles.demoMsgLabel}><RyzeLogo size={12} color="#fff" /> RYZE</div>` | Unrouted. Demo label (also an E-category `RyzeLogo` usage; classified by the visible text). |
| `src/pages/SaasLanding.jsx` | 557 | `<div className={styles.demoMsgLabel}><RyzeLogo size={12} color="#fff" /> RYZE</div>` | Unrouted. Same. |
| `src/pages/SaasLanding.jsx` | 627 | `<span className={styles.brandName}>RYZE.ai</span>` | Unrouted. Nav wordmark. |
| `src/pages/SaasLanding.jsx` | 663 | `RYZE.ai is a recruiting platform I built and documented in real time.` | Unrouted. Hero copy. |
| `src/pages/SaasLanding.jsx` | 814 | `Job Order Roster, Employer Roster, and RYZE Intelligence. iPhone Mirroring` | Unrouted. Copy. |
| `src/pages/SaasLanding.jsx` | 828 | `using RYZE.ai as the tool.` | Unrouted. Copy. |
| `src/pages/SaasLanding.jsx` | 838 | `RYZE.ai to run an actual recruiting business. Follow along on LinkedIn` | Unrouted. Copy. |
| `src/pages/SaasLanding.jsx` | 855 | `Drop your email to follow along as RYZE goes live.` | Unrouted. Waitlist copy. |
| `src/pages/SaasLanding.jsx` | 864 | `<p className={styles.successSub}>We'll reach out when RYZE is ready for you.</p>` | Unrouted. Waitlist success copy. |
| `src/pages/SaasLanding.jsx` | 917 | `<span>RYZE.ai</span>` | Unrouted. Footer wordmark. |
| `src/pages/SaasLanding.jsx` | 924 | `© 2026 RYZE GROUP, Inc. d/b/a RYZE.ai · Version {CURRENT_VERSION}` | Unrouted. Footer legal line. |

---

## D. DOMAIN-URL

Owned/sold domains first, then the DigitalOcean Spaces bucket, then third-party permalinks that merely contain "ryze" in their path.

| file | line | matching text | what breaks if changed |
|---|---|---|---|
| `.env.production` | 1 | `VITE_API_URL=https://api.ryze.ai` | **Every production API call.** Once DNS for ryze.ai leaves your control, a production build is dead on arrival. Must change before any deploy regardless of the tenant-vs-default decision. Note: backend CORS (`app/main.py:43-47`) also only allows ryze.ai / ryzerecruiting.com origins — a greenscene.io frontend is blocked server-side until that list changes too. |
| `src/pages/PrivacyPolicy.jsx` | 71 | `<a href="mailto:dane@ryze.ai">dane@ryze.ai</a>` | SMS HELP contact. Mailbox goes with the domain. |
| `src/pages/PrivacyPolicy.jsx` | 135 | `<a href="mailto:dane@ryze.ai">dane@ryze.ai</a>` | Data-rights contact. Same. |
| `src/pages/PrivacyPolicy.jsx` | 196 | `<li>Email: <a href="mailto:dane@ryze.ai">dane@ryze.ai</a></li>` | Contact block. Same. |
| `src/pages/PrivacyPolicy.jsx` | 197 | `<li>Website: <a href="https://ryze.ai">https://ryze.ai</a></li>` | Link to the sold domain. |
| `src/pages/TermsOfService.jsx` | 120 | `...contact us at <a href="mailto:dane@ryze.ai">dane@ryze.ai</a>.</li>` | SMS HELP contact. |
| `src/pages/TermsOfService.jsx` | 206 | `<li>Email: <a href="mailto:dane@ryze.ai">dane@ryze.ai</a></li>` | Contact block. |
| `src/pages/TermsOfService.jsx` | 207 | `<li>Website: <a href="https://ryze.ai">https://ryze.ai</a></li>` | Link to the sold domain. |
| `src/pages/Landing.jsx` | 9 | `"https://ryzerecruiting.nyc3.cdn.digitaloceanspaces.com/Demo_Video/Commercial_2_V3.mp4"` | DigitalOcean Spaces **bucket name**, not a DNS domain you sold. The landing demo video keeps working as long as the bucket exists. Renaming the bucket breaks all three URLs. |
| `src/pages/Landing.jsx` | 11 | `"https://ryzerecruiting.nyc3.cdn.digitaloceanspaces.com/Demo_Video/image1.png"` | Video poster. Same bucket. |
| `src/pages/Landing.jsx` | 13 | `"https://ryzerecruiting.nyc3.cdn.digitaloceanspaces.com/Demo_Video/THE_ABSOLUTE_FINAL_VERSION_New_Intro_Song.mp4"` | Full demo video. Same bucket. |
| `src/pages/SaasLanding.jsx` | 41 | `url: "https://www.linkedin.com/posts/daneahern_ep24-building-ryzeai-the-final-episode-..."` | Third-party LinkedIn permalink; "ryzeai" is inside LinkedIn's slug. **Must not be edited.** File is unrouted anyway. |
| `src/pages/SaasLanding.jsx` | 69 | `url: "https://www.linkedin.com/posts/daneahern_ep20-of-building-ryzeai-in-public-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 83 | `url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-in-public-ep18-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 90 | `url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-in-public-ep17-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 97 | `url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-in-public-ep16-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 111 | `url: "https://www.linkedin.com/posts/daneahern_ep14-of-building-ryzeai-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 132 | `url: "https://www.linkedin.com/posts/daneahern_episode-11-of-building-ryze-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 139 | `url: "https://www.linkedin.com/posts/daneahern_episode-10-of-building-ryzeai-ryze-is-a-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 146 | `url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-episode-9-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 153 | `url: "https://www.linkedin.com/posts/daneahern_episode-8-of-building-ryze-in-public-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 160 | `url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-7-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 167 | `url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-6-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 174 | `url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-5-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 181 | `url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-4-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 188 | `url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-3-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 195 | `url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-2-..."` | Same. |
| `src/pages/SaasLanding.jsx` | 202 | `url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-1-..."` | Same. |

Not found in this repo: OAuth callback URIs (the frontend's `/auth/callback` route is relative; the registered redirect URI lives in the backend/provider config), CORS origins (backend), redirects to ryze.ai (none — all `navigate()`/`window.location` targets are relative paths). `.env` and `.env.example` have no hits.

---

## E. INTERNAL-ID

| file | line | matching text | what breaks if changed |
|---|---|---|---|
| `src/App.jsx` | 251 | `path="/ryze/invite"` | Superadmin invite route. **Nothing links to it** in the frontend or backend (grep for `ryze/invite` finds only this line) — it is typed by hand. Renaming breaks bookmarks only. It is visible in the address bar, so arguably user-facing, but it has no brand effect. |
| `src/theme.css` | 67 | `.ryzeGridBg {` | Global utility class. **Zero usages anywhere in `src/`** — dead CSS (same for the next 7 rows). |
| `src/theme.css` | 75 | `.ryzeContainer {` | Dead CSS. |
| `src/theme.css` | 81 | `.ryzeBtn {` | Dead CSS. |
| `src/theme.css` | 95 | `.ryzeBtnPrimary {` | Dead CSS. |
| `src/theme.css` | 101 | `.ryzeBtnPrimary:hover {` | Dead CSS. |
| `src/theme.css` | 107 | `.ryzePill {` | Dead CSS. |
| `src/theme.css` | 119 | `.ryzeUnderlineLink {` | Dead CSS. |
| `src/theme.css` | 126 | `.ryzeUnderlineLink:hover {` | Dead CSS. |
| `src/pages/Landing.module.css` | 192 | `animation: ryzeUp 1.8s cubic-bezier(...) 0.4s forwards;` | Keyframe reference for the hero watermark. Rename together with line 195 or the animation silently stops. |
| `src/pages/Landing.module.css` | 195 | `@keyframes ryzeUp {` | Keyframe definition. Pair with 192. |
| `src/pages/ChatPage.jsx` | 11 | `` const KEYFRAMES = `@keyframes ryze-pulse { ... }`; `` | Injected keyframe name. Pair with 217. |
| `src/pages/ChatPage.jsx` | 12 | `if (typeof document !== "undefined" && !document.getElementById("ryze-chat-keyframes")) {` | Idempotency guard for the injected `<style>`. Pair with 14. |
| `src/pages/ChatPage.jsx` | 14 | `s.id = "ryze-chat-keyframes";` | `<style>` element id. Pair with 12. |
| `src/pages/ChatPage.jsx` | 217 | `style={{ animation: "ryze-pulse 1.4s ease-in-out infinite", ... }}` | Typing-indicator animation. Pair with 11. |
| `src/pages/SaasLanding.jsx` | 471 | `function RyzeLogo({ size = 32, color = "#004aad" }) {` | Inline SVG wordmark component. Unrouted file. |
| `src/pages/SaasLanding.jsx` | 605 | `body: JSON.stringify({ ..., source: "ryze_ai_landing" }),` | Waitlist `source` tag sent to `POST /api/waitlist`. Unrouted file; changing it only changes the tag on future rows. |
| `src/pages/SaasLanding.jsx` | 916 | `<RyzeLogo size={16} color="#57a0d3" />` | Component usage. Unrouted file. |
| `src/assets/RYZE_LOGO.svg` | — | (filename) | **Orphaned.** No importer in `src/` (the dead-code audit of 2026-07-08 recorded `Landing.jsx` importing it; that import is gone). Safe to delete independent of the rebrand. |

---

## F. DOCS

| file | line | matching text | what breaks if changed |
|---|---|---|---|
| `CLAUDE.md` | 1 | `# RYZE.ai Frontend — CLAUDE.md` | Nothing. |
| `CLAUDE.md` | 4 | `React frontend for RYZE.ai V2 — a multi-tenant ATS for recruiting firms. ...` | Nothing. |
| `src/theme.css` | 2 | `RYZE.ai Design System` | Header comment. Nothing. |
| `src/pages/CandidateProfile.module.css` | 2 | `RYZE.ai — Admin Candidate Profile` | Header comment. Nothing. |
| `src/pages/CandidateSelfProfile.module.css` | 2 | `RYZE.ai — Candidate Self-Profile` | Header comment. Nothing. |
| `src/pages/Landing.module.css` | 173 | `/* Faint RYZE.ai watermark — rises from behind the headline to above it.` | Comment. Nothing. |
| `src/pages/Auth.module.css` | 34 | `/* Subtle RYZE watermark inside card */` | Comment. Nothing. |
| `src/pages/CandidateProfile.jsx` | 579 | `{/* RYZE footer */}` | JSX comment. Nothing. |
| `src/pages/CandidateSelfProfile.jsx` | 443 | `{/* RYZE footer */}` | JSX comment. Nothing. |
| `src/pages/EmployerSelfProfile.jsx` | 425 | `{/* RYZE footer */}` | JSX comment. Nothing. |
| `src/pages/admin/TenantSettings.jsx` | 10 | `// Fields the firm admin can edit. \`placeholder\` shows the RYZE fallback so an` | Comment. Nothing. |
| `src/pages/admin/TenantSettings.jsx` | 61 | `if (r.status === 404) return null; // RYZE's own admin has no tenant row` | Comment — but it documents a real backend behavior (Appendix A, item 6). The code on this line is not slug-aware; it reacts to the 404. |
| `context/current-feature.md` | 4 | `**Repo:** ryzerecruiting_frontend` | Working-tree version (uncommitted local-dev task draft). The committed HEAD version has only this one hit. |
| `context/current-feature.md` | 24 | `` - `.env.production` points at `https://api.ryze.ai` — a domain that has been `` | Working-tree only. |
| `context/current-feature.md` | 30 | `the RYZE PostHog project from localhost.` | Working-tree only. |
| `context/current-feature.md` | 63 | `` - [ ] Follow-ups recorded in Session log: `.env.production` → ryze.ai domain; Node version `` | Working-tree only. |
| `context/CHANGELOG.md` | 10 | `` ...new live-mode webhook destination `ryze-production` → `https://api.ryze.ai/...` `` | History. Nothing. |
| `context/CHANGELOG.md` | 27 | `...under a "See RYZE Intelligence in action" heading...` | History. |
| `context/CHANGELOG.md` | 35 | `...with a light "See RYZE Intelligence in action" heading...` | History. |
| `context/CHANGELOG.md` | 69 | `` ...confirmed live via `https://api.ryze.ai/openapi.json` before archiving... `` | History. |
| `context/CHANGELOG.md` | 79 | `` - 2026-07-23 — GET check against `https://api.ryze.ai/openapi.json` ... `` | History. |
| `context/CHANGELOG.md` | 99 | `...helper text explaining that mail sends from RYZE's service under the firm's name...` | History. |
| `context/CHANGELOG.md` | 102 | `"Emails are sent under your firm's name from RYZE's email service; replies go to..."` | History. |
| `context/CHANGELOG.md` | 130 | `...Header "powered by RYZE" microcopy...` | History. |
| `context/CHANGELOG.md` | 136 | `` surfaces, gated on `tenant_id !== 'ryze'` (ryze = platform signup bucket, not a `` | History — records the design intent behind Category A. |
| `context/CHANGELOG.md` | 147 | `` (`a8d5d4b`): gated `isFirmTenant` copy in Header ("powered by RYZE"), `` | History. |
| `context/CHANGELOG.md` | 151 | `passes after each commit. Live-browser verification (Renata vs. RYZE user)` | History. |
| `context/CHANGELOG.md` | 156 | `RYZE" sits beside the wordmark instead of under it; \`.poweredBy\` color fixed` | History. |
| `context/CHANGELOG.md` | 173 | `` ...deleted 5 confirmed-dead assets (`src/assets/icons/change.svg`, `src/assets/icons/Portfolio_RYZE.png`, ... `` | History. |
| `context/dead-code-audit.md` | 25 | `...(routed at \`/ryze/invite\` in \`App.jsx:24,240-243\`)...` | Prior audit. |
| `context/dead-code-audit.md` | 66 | `` - `src/assets/icons/Portfolio_RYZE.png` `` | Prior audit (asset since deleted). |
| `context/dead-code-audit.md` | 68 | `` - `src/assets/RYZE_LOGO.png` — a **different, unreferenced file** from `public/RYZE_LOGO.png`... `` | Prior audit. |
| `context/dead-code-audit.md` | 72 | `` - `src/assets/RYZE_LOGO.svg` — imported in `Landing.jsx`. `` | Prior audit — **now stale**; see Category E last row. |
| `context/dead-code-audit.md` | 73 | `` - `public/RYZE_LOGO.png` — favicon, referenced in `index.html:6`. `` | Prior audit. Still accurate. |
| `context/dead-code-audit.md` | 113 | `` \| `src/assets/icons/Portfolio_RYZE.png` \| dead \| certain \| `` | Prior audit. |
| `context/dead-code-audit.md` | 115 | `` \| `src/assets/RYZE_LOGO.png` \| dead (shadowed by `public/RYZE_LOGO.png`) \| certain \| `` | Prior audit. |

---

## Counts

| category | line hits | filename-only hits | total rows |
|---|---|---|---|
| A. TENANT-SLUG | 4 | 0 | 4 |
| B. BRANDING-RESOLVED | 1 | 0 | 1 |
| C. BRANDING-HARDCODED | 72 | 1 (`public/RYZE_LOGO.png`) | 73 |
| D. DOMAIN-URL | 28 | 0 | 28 |
| E. INTERNAL-ID | 18 | 1 (`src/assets/RYZE_LOGO.svg`) | 19 |
| F. DOCS | 36 | 0 | 36 |
| **Total** | **159** | **2** | **161** |

Of the 159 line hits, 43 are in the unrouted `SaasLanding.jsx` (23 C, 17 D, 3 E) and 24 are in `context/*.md`. Live, user-visible, hardcoded brand text outside those two buckets: **49 rows** across 24 files. `package-lock.json`, `.env`, `.env.example`, `package.json`, `vite.config.js`, `eslint.config.js`, `README.md`, and `src/main.jsx` have zero hits.

## Files with hits in more than one category

| file | categories |
|---|---|
| `src/components/Header.jsx` | A, B, C |
| `src/pages/SaasLanding.jsx` | C, D, E |
| `src/pages/Landing.module.css` | C, E, F |
| `src/pages/CandidateDashboard.jsx` | A, C |
| `src/pages/CandidateSelfProfile.jsx` | A, F |
| `src/pages/Landing.jsx` | C, D |
| `src/pages/PrivacyPolicy.jsx` | C, D |
| `src/pages/TermsOfService.jsx` | C, D |
| `src/pages/ChatPage.jsx` | C, E |
| `src/pages/Auth.module.css` | C, F |
| `src/pages/EmployerSelfProfile.jsx` | C, F |
| `src/pages/admin/TenantSettings.jsx` | C, F |
| `src/theme.css` | E, F |

---

## Appendix A — Backend code paths that behave differently for a non-`"ryze"` slug (read-only cross-reference)

Source: `../ryzerecruiting_backend/app`, grep + spot-read on 2026-11-02. **Not a full backend inventory** — only the slug-gated and default-fallback sites needed to answer the Category A question. The backend repo needs its own audit pass for categories B–F; in particular `email.py` (hardcoded invite/welcome emails at 1373–1508 linking to `https://ryze.ai/auth`), the three PDF templates, `calendar.py:63` (hardcoded `"RYZE.ai — {company}"` event summary — **not** resolved), and `ai_brief.py` (only comment hits at lines 6 and 209, both stating the brand name is resolved via `get_branding`; the code path itself was not traced here).

The constant is `RYZE_TENANT = "ryze"`, defined independently in **four** places: `app/core/deps.py:23`, `app/services/branding.py:34`, `app/models/job_order.py:8`, `app/models/job_interest.py:14`. They are not imported from one another.

| # | file:line | behavior for slug == `"ryze"` | behavior for any other slug |
|---|---|---|---|
| 1 | `app/core/deps.py:79` (`_check_tenant_access`) | Skips the `tenants` lookup entirely — never gets a 402 for trial/subscription. | Looks up the `tenants` row; raises 402 on expired trial or cancelled subscription. (A missing row is also allowed through as "legacy".) |
| 2 | `app/services/usage.py:102` (`is_over_budget`) | Always `False` — exempt from `AI_MONTHLY_BUDGET_USD`. | Monthly AI cost compared against the cap. *(the known example)* |
| 3 | `app/api/admin_invite.py:97` (`POST /api/admin/invite`) | Allowed. | **403** — only the ryze superadmin can onboard a new firm. This is what the frontend's `/ryze/invite` route calls. |
| 4 | `app/api/db_explorer.py:360` (`_is_platform_owner`) | Global, unscoped view across all tenants' rows. | Scoped to own tenant, even for a firm-level superuser. |
| 5 | `app/services/branding.py:89` (`get_branding`) | **Skips the DB lookup** and returns hardcoded `_ryze_defaults()` (`brand_name="RYZE.ai"`, `FROM_EMAIL="dane@ryze.ai"` from `config.py:28`, etc.). A `tenants` row with slug `"ryze"` would be ignored. | Reads the `tenants` row and overrides defaults field-by-field. |
| 6 | `app/api/settings.py:119-125, 143-147` (`GET`/`PATCH /api/settings/tenant`) | **404** — no `tenants` row exists for the platform slug by design. Frontend `TenantSettings.jsx:61,147` turns this into "This account isn't linked to a firm". | Returns/updates the row. |
| 7 | `app/services/tenant_resolution.py:25-56` | Self-registering candidates/employers with no matching firm profile are bucketed into `"ryze"`. | n/a (this is the fallback target, not a comparison). |
| 8 | `app/api/billing.py:62, 67, 142` | Stripe checkout/portal `tenant_slug` falls back to `RYZE_TENANT` when `tenant_id` is NULL. | Uses own slug. |
| 9 | `app/models/user.py:32`, `employer_profile.py:42`, `job_order.py:16`, `job_interest.py:28` | Column default `"ryze"` for `tenant_id` — every row created without an explicit tenant lands here. | n/a. |
| 10 | `app/services/email.py` — 15× `get_branding(None, "ryze")` | Any email helper called without an explicit `branding` renders with RYZE defaults. | Caller must pass resolved branding. |
| 11 | Function-signature defaults: `app/api/chat.py` (12×), `app/api/search.py:95`, `app/services/notifications.py` (11×), `app/services/embedding_service.py` (5×) | `tenant_id` defaults to `"ryze"` if a caller omits it. | Caller must pass it. |
| 12 | `app/main.py:43-47` (CORS) | Only `ryze.ai`, `www.ryze.ai`, `api.ryze.ai`, `ryzerecruiting.com`, `www.ryzerecruiting.com` origins allowed. | A `greenscene.io` origin is rejected at the browser until this list changes. Not slug-gated, but blocks the frontend regardless of the tenant decision. |

Implication for the decision (stated, not decided): items 1, 2, 3, 4, 5 and 6 are what "RYZE as platform default" *means* in code. A new tenant on top of the existing default inherits none of them (it gets billing checks, the AI budget cap, no invite rights, a scoped DB Explorer, DB-resolved branding, and a working Branding page). Replacing the default means either renaming the literal in four constant definitions plus ~40 inline `"ryze"` strings, or teaching `get_branding` to read a `tenants` row for the platform slug.
