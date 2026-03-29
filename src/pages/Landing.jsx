/* src/pages/Landing.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { Building2, BriefcaseBusiness, Binoculars } from "lucide-react";
import styles from "./Landing.module.css";
import EP1 from "../assets/landing_page_thumbnails/EP1.png";
import EP2 from "../assets/landing_page_thumbnails/EP2.png";
import EP3 from "../assets/landing_page_thumbnails/EP3.png";
import EP4 from "../assets/landing_page_thumbnails/EP4.png";
import EP5 from "../assets/landing_page_thumbnails/EP5.png";
import EP6 from "../assets/landing_page_thumbnails/EP6.png";
import EP7 from "../assets/landing_page_thumbnails/EP7.png";
import EP8 from "../assets/landing_page_thumbnails/EP8.png";
import EP9 from "../assets/landing_page_thumbnails/EP9.png";
import EP10 from "../assets/landing_page_thumbnails/EP10.png";
import EP11 from "../assets/landing_page_thumbnails/EP11.png";
import EP12 from "../assets/landing_page_thumbnails/EP12.png";
import EP13 from "../assets/landing_page_thumbnails/EP13.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CURRENT_VERSION = 13;

const EPISODES = [
  {
    num: 13,
    title: "Fixing the Zoom Webhook — Getting the Transcript",
    thumb: EP13,
    url: "https://www.linkedin.com/posts/daneahern_episode-13-fixing-the-zoom-webhook-getting-ugcPost-7442718641017511936-FK50?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "Zoom fires three separate events after a meeting ends — and they don't all arrive at the same time. My webhook was only listening to the first two. The third one — recording.transcript_completed — was arriving, getting logged as 'unhandled event,' and doing nothing. One new handler. One bug fix on where Zoom puts the download token. Deploy. Test. 1946 chars saved to the database.",
  },
  {
    num: 12,
    title: "The DB Explorer — A Tool That Became a Feature",
    thumb: EP12,
    url: "https://www.linkedin.com/posts/daneahern_i-built-the-db-explorer-as-a-debugging-tool-activity-7441418508527226880-Qs3o?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "I built the DB Explorer as a personal debugging tool — a way to see exactly what was in my database without writing SQL by hand. It worked so well I kept using it every day. So I shipped it. Browse any table, search, sort, filter by date, edit records inline, jump between related records by foreign key, see embedding status, and export to CSV. A utility that became a permanent feature.",
  },
  {
    num: 11,
    title: "Does the AI Actually Learn?",
    thumb: EP11,
    url: "https://www.linkedin.com/posts/daneahern_episode-11-of-building-ryze-this-is-bob-activity-7440383984909340672-ilXO?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "Bob Callahan is finishing his accounting degree at night while working construction during the day. I played both roles — recruiter and candidate — on a real Zoom call. Then I asked RYZE Intelligence 6 questions. Some worked. Some failed completely. The system knew about the call OR the resume. Never both — until we connected them. One foreign key. That's all it took. More data. Smarter AI.",
  },
  {
    num: 10,
    title: "Adding Candidates to the Platform",
    thumb: EP10,
    url: "https://www.linkedin.com/posts/daneahern_episode-10-of-building-ryzeai-ryze-is-a-activity-7439683948621860864-TiN_?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "RYZE turns recruiting activity into proprietary intelligence. I uploaded six test resumes using three methods: copy/paste, direct document upload, and LinkedIn profile copy. RYZE parses each one into structured candidate data, generates embeddings, and lets Claude interact with the dataset conversationally. Instead of searching resumes — you're querying your own recruiting intelligence layer.",
  },
  {
    num: 9,
    title: "End-to-End Booking Test",
    thumb: EP9,
    url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-episode-9-this-episode-activity-7439627919678787584-cU-f?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "This episode is short. Just under 2 minutes. Candidate books a call → admin confirms → Zoom meeting creates → Calendar event creates → confirmation email sends → 15-minute reminder fires. The full booking loop, end-to-end, working in production.",
  },
  {
    num: 8,
    title: "Conversational AI Interface",
    thumb: EP8,
    url: "https://www.linkedin.com/posts/daneahern_episode-8-of-building-ryze-in-public-i-built-activity-7439362320063012864-TyTk?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "I built a conversational AI interface connected directly to my recruiting database. Ask it who your best candidates are for a Controller role. Ask it what you discussed with a client last week. Ask it who in your pipeline has Big 4 experience. It searches. It thinks. It answers. Your data. Your pipeline. Your intelligence.",
  },
  {
    num: 7,
    title: "RAG-Powered Intelligence Chat",
    thumb: EP7,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-7-this-activity-7439103131206029312-6_DF?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "I implemented RAG-powered Intelligence Chat — ask your entire candidate database a question in plain English and get an intelligent answer back. Not keyword search. Not filters. Just a question: \"Who would be a good fit for a Controller role in Boston?\" The system searches by meaning, powered by pgvector and RAG running directly inside PostgreSQL.",
  },
  {
    num: 6,
    title: "AI Meeting Notes",
    thumb: EP6,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-6-one-activity-7437906403861794816--73c?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "Important conversations happen — and then the details disappear. Notes buried in email threads, scattered across documents, or never written down at all. This week I implemented AI Meeting Notes: after every Zoom call, the summary is automatically captured and saved to the database as part of the candidate or employer record.",
  },
  {
    num: 5,
    title: "End-to-End Testing",
    thumb: EP5,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-5-this-activity-7437041631528267776-gSkN?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "This week was all about testing the entire booking system end-to-end. All four meeting flows are now working. The system generates an AI research brief before every call so recruiters walk in prepared. Building software is mostly testing, fixing bugs, and trying again — that's what this episode shows.",
  },
  {
    num: 4,
    title: "Building the Booking System",
    thumb: EP4,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-4-booking-activity-7435763383817269248-qiZc?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "Booking systems sound simple until you actually build one. This week I worked through four different meeting scenarios: Recruiter→Candidate, Recruiter→Employer, Candidate→Recruiter, and Employer→Recruiter. Each flow needs different fields, different logic, and different AI research rules. Candidates don't have company websites. Employers do. Small details create surprisingly complex systems.",
  },
  {
    num: 3,
    title: "What If Your Hiring Data Was Connected?",
    thumb: EP3,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-3-what-activity-7434907747122524160-JE-O?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "Notes in spreadsheets. Candidate history in email threads. Call outcomes on sticky notes. The data exists — it's just scattered everywhere and doing nothing. I'm a CPA and Controller. I've spent years inside companies watching valuable business data get created and immediately lost. I built RYZE because I've lived this problem from both sides of the table.",
  },
  {
    num: 2,
    title: "Preparation & Reminders",
    thumb: EP2,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-2-one-activity-7434615686380900352-RVmV?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "One of the biggest problems in recruiting is simple: people walk into calls unprepared. This episode covers automated 15-minute reminders before every Zoom meeting and AI pre-call briefs that summarize the company you're about to speak with. Small features like this are what slowly turn a scheduling tool into a real recruiting platform.",
  },
  {
    num: 1,
    title: "Start of Series",
    thumb: EP1,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-1-start-activity-7434171807298908160-SMk2?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "What does it actually take to build an ATS from scratch? I'm documenting the entire process as I build RYZE.ai in public. The goal: build a recruiting platform that captures the data recruiters create every day. Employer booking flow, admin dashboard, AI pre-call briefs, Zoom + Calendar integration, and OAuth login — all live on day one.",
  },
];

const PHASES = [
  {
    id: "1",
    title: "Platform Foundation",
    status: "complete",
    summary: "Built the core platform from scratch and deployed it to production. The foundation includes a full booking system for employer-initiated meetings, an admin dashboard, AI-generated pre-call research briefs, and all the integrations needed to run real recruiting calls — Zoom, Google Calendar, email, SMS, and OAuth login.",
    bullets: [
      "Employer booking flow — desktop & mobile",
      "Admin dashboard for booking management",
      "Zoom + Google Calendar integration — dynamic meeting creation",
      "Email (Resend) + SMS (Twilio) notifications",
      "OAuth login — Google & LinkedIn",
      "AI pre-call research briefs via Claude API",
      "Automated 15-minute reminders before every call",
    ],
  },
  {
    id: "2",
    title: "Full Booking System",
    status: "complete",
    summary: "Expanded from employer-only booking into all four meeting flows a recruiting firm actually needs. Each direction — recruiter outbound and candidate/employer inbound — has its own logic, fields, and AI research rules. Tested every flow end-to-end in production before building anything on top.",
    bullets: [
      "4 booking flows: Recruiter→Candidate, Recruiter→Employer, Candidate→Recruiter, Employer→Recruiter",
      "Per-flow logic — candidates and employers need different fields and AI research rules",
      "Candidate self-booking flow",
      "Recruiter outbound meeting invites",
      "End-to-end production test — Zoom creates, Calendar fires, email sends, reminder triggers",
    ],
  },
  {
    id: "3",
    title: "AI Intelligence Layer",
    status: "complete",
    summary: "Transformed RYZE from a scheduling tool into an intelligence platform. Every Zoom call now produces an AI-written meeting summary saved directly to the candidate or employer record. Then came the centerpiece: a conversational AI interface that lets recruiters query their entire database in plain English — powered by pgvector and RAG running inside PostgreSQL.",
    bullets: [
      "AI Meeting Notes — post-call summaries auto-saved via Zoom webhook",
      "PGVector installed on production Postgres 16",
      "RAG pipeline — semantic search by meaning, not keywords",
      "Conversational chat interface at /admin/chat — 8 tools, agentic loop",
      "Inline candidate and meeting cards returned with chat responses",
      "Chat session persistence — grouped sidebar, AI-generated titles",
    ],
  },
  {
    id: "4",
    title: "Candidate Data Pipeline",
    status: "complete",
    summary: "Built the full candidate intake and indexing pipeline. Recruiters can upload a PDF resume, paste a LinkedIn profile, or enter details manually — Claude parses each one into structured profile fields automatically. Every candidate is then embedded using OpenAI and indexed for semantic search, so RYZE Intelligence can find them by meaning the moment they're saved.",
    bullets: [
      "Candidate parsing — PDF upload, text paste, LinkedIn copy → structured fields via Claude",
      "Duplicate detection — name + location check before saving",
      "OpenAI text-embedding-3-small — 1536-dim embeddings on every candidate",
      "Auto-embed on save — runs in background, status badge updates in real time",
      "Semantic search endpoint — cosine similarity via raw SQL",
      "Employer and job order parsing + embedding — same pipeline",
    ],
  },
  {
    id: "5",
    title: "Intelligence UI Redesign",
    status: "complete",
    summary: "Redesigned the Intelligence feature from a card-heavy database browser into a prose-first recruiting assistant. The AI now responds like a senior recruiter — natural, confident paragraphs first, with structured candidate and employer cards available on demand behind a toggle.",
    bullets: [
      "Prose-first AI responses — senior recruiter voice, no markdown or field labels",
      "Updated system prompt — returns conversational prose + structured ID references",
      "IntelligenceMessage.jsx — new component replacing inline card rendering",
      "CandidateResultCard.jsx — compact card with career level + cert badges",
      "EmployerResultCard.jsx — compact card with relationship status badge",
      "View Candidates / View Employers toggle — lazy-fetches fresh data on demand",
      "View Profile links to CandidateModal · View Employer navigates to EmployerRoster",
    ],
  },
  {
    id: "6",
    title: "DB Explorer",
    status: "complete",
    summary: "Built the DB Explorer as a personal debugging tool — a way to inspect the production database without writing raw SQL. It proved so useful during development that it shipped as a permanent admin feature. Gives any technical user full visibility into every table, record, and relationship in the system.",
    bullets: [
      "Browse all 9 tables — bookings, candidates, employers, job orders, users, waitlist, chat sessions, chat messages, contacts",
      "Search, sort, and date range filtering per table",
      "Inline edit — patch editable fields directly from the UI",
      "Delete with confirmation — hard delete with row count update",
      "Foreign key navigation — click any ID to jump to related record",
      "Embedding badges — visual status for which records have vectors",
      "CSV export — download the current filtered view",
    ],
  },
  {
    id: "7",
    title: "Zoom Webhook & Transcript Pipeline",
    status: "complete",
    summary: "Debugged and completed the post-call data pipeline. Zoom fires three separate webhook events after a meeting ends — meeting.ended, recording.completed, and recording.transcript_completed — and they don't arrive at the same time. The webhook handler was only listening to the first two. This phase adds the missing handler, fixes the download token location in the payload, and ensures the full transcript is automatically saved to the correct candidate or employer record after every call.",
    bullets: [
      "Identified all three Zoom post-call webhook events and their timing differences",
      "Added recording.transcript_completed handler — the event that fires when the .vtt file is ready",
      "Fixed download token extraction — Zoom moved it in the payload between event types",
      "Transcript auto-saves to the candidate or employer record on every completed call",
      "1946 chars recorded to the database on first successful end-to-end test",
      "RYZE Intelligence now has access to the full conversation — not just the AI summary",
    ],
  },
  {
    id: "8",
    title: "Candidate & Employer Profile Pages",
    status: "complete",
    summary: "Replaced edit modals with full read-only profile pages built for sharing with clients. Candidate profiles include AI summary, experience, education, outreach message, skills, and recruiter notes. Employer profiles include company overview, hiring needs, talking points, red flags, and linked job orders. Both accessible directly from Intelligence chat results. Consolidated the auth flow to a single entry point at /auth with admin login access.",
    bullets: [
      "CandidateProfile page at /admin/candidates/:id — shareable, read-only",
      "EmployerProfile page at /admin/employers/:id — shareable, read-only",
      "Intelligence chat 'View Profile' now navigates to profile pages instead of edit modals",
      "Employer dashboard — company brief + linked open roles pulled from live data",
      "Candidate dashboard — open job opportunities from live job orders + scheduled calls",
      "Auth consolidated to /auth — single login entry point with admin access link",
      "Two new API endpoints: GET /api/employer-profiles/me and GET /api/job-orders/open",
    ],
  },

];

const DEMO_QUERIES = [
  {
    q: "Do I have any meetings this morning?",
    a: "2 confirmed calls today. 9:00 AM — Sarah Chen, Controller candidate. 11:30 AM — Marcus Rivera, CFO",
  },
  {
    q: "Recommend a CPA for the Controller role at Acme.",
    a: "1. Jennifer Walsh, CPA — 94% match. Big 4, NetSuite certified.",
  },
  {
    q: "What do we know about Deloitte candidates?",
    a: "4 Deloitte alumni in your pipeline. Avg target: $130–160K. Top reason for leaving: better work-life balance.",
  },
];

const INTENT_OPTIONS = [
  { value: "hiring", icon: Building2, label: "I'm hiring" },
  { value: "job_seeking", icon: BriefcaseBusiness, label: "I'm job hunting" },
  { value: "following", icon: Binoculars, label: "Following the build" },
];

function RyzeLogo({ size = 32, color = "#004aad" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 375 322"
      width={size}
      height={Math.round(size * (322 / 375))}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        fill={color}
        d="M 186.078125 19.484375 L 0.367188 341.148438 L 180.234375 341.148438 L 229.054688 256.585938 L 201.605469 215.015625 L 190.46875 234.308594 L 154.511719 296.59375 L 77.539062 296.59375 L 186.394531 108.039062 L 296.730469 295.972656 L 243.730469 295.972656 L 221.453125 340.527344 L 374.554688 340.527344 Z"
      />
    </svg>
  );
}

function DemoChat() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("typing");
  const [displayQ, setDisplayQ] = useState("");
  const [displayA, setDisplayA] = useState("");

  useEffect(() => {
    const entry = DEMO_QUERIES[idx];
    setDisplayQ("");
    setDisplayA("");
    setPhase("typing");

    let qi = 0;
    const typingTimer = setInterval(() => {
      qi++;
      setDisplayQ(entry.q.slice(0, qi));
      if (qi >= entry.q.length) {
        clearInterval(typingTimer);
        setTimeout(() => {
          setPhase("answering");
          let ai = 0;
          const ansTimer = setInterval(() => {
            ai += 3;
            setDisplayA(entry.a.slice(0, ai));
            if (ai >= entry.a.length) {
              setDisplayA(entry.a);
              clearInterval(ansTimer);
              setPhase("done");
              setTimeout(() => {
                setPhase("fading");
                setTimeout(() => setIdx(i => (i + 1) % DEMO_QUERIES.length), 500);
              }, 3500);
            }
          }, 16);
        }, 500);
      }
    }, 35);
    return () => clearInterval(typingTimer);
  }, [idx]);

  return (
    <div className={`${styles.demo} ${phase === "fading" ? styles.demoFading : ""}`}>
      <div className={styles.demoTitleBar}>
        <div className={styles.demoTrafficLights}>
          <span style={{ background: "#ff5f57" }} />
          <span style={{ background: "#febc2e" }} />
          <span style={{ background: "#28c840" }} />
        </div>
        <span className={styles.demoWindowTitle}>RYZE Intelligence</span>
      </div>
      <div className={styles.demoMessages}>
        {displayQ && (
          <div className={styles.demoMsgUser}>
            <div className={styles.demoMsgLabel}>You</div>
            <div className={styles.demoMsgBubble}>
              {displayQ}
              {phase === "typing" && <span className={styles.cursor}>|</span>}
            </div>
          </div>
        )}
        {phase === "answering" && !displayA && (
          <div className={styles.demoMsgAi}>
            <div className={styles.demoMsgLabel}><RyzeLogo size={12} color="#fff" /> RYZE</div>
            <div className={styles.demoThinking}><span /><span /><span /></div>
          </div>
        )}
        {displayA && (
          <div className={styles.demoMsgAi}>
            <div className={styles.demoMsgLabel}><RyzeLogo size={12} color="#fff" /> RYZE</div>
            <div className={styles.demoMsgAiBubble}>
              {displayA}
              {phase === "answering" && <span className={styles.cursor}>|</span>}
            </div>
          </div>
        )}
      </div>
      <div className={styles.demoPips}>
        {DEMO_QUERIES.map((_, i) => (
          <span key={i} className={`${styles.pip} ${i === idx ? styles.pipActive : ""}`} />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const waitlistRef = useRef(null);

  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState(null);
  const [wlStatus, setWlStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [openPhase, setOpenPhase] = useState(null);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.user_type === "ADMIN") navigate("/admin");
      else if (user.user_type === "EMPLOYER") navigate("/employer/dashboard");
      else navigate("/candidate/dashboard");
    }
  }, [user, navigate]);

  async function handleWaitlist() {
    setErrorMsg("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setWlStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), intent: intent || "following", source: "ryze_ai_landing" }),
      });
      if (res.ok || res.status === 409) {
        setWlStatus("success");
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorMsg(d.detail || "Something went wrong. Please try again.");
        setWlStatus("idle");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setWlStatus("idle");
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Header ─────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.brandName}>RYZE.ai</span>
            <span className={styles.brandPipe}>|</span>
            <span className={styles.brandSub}>AI Intelligence Platform</span>
          </div>
          <a
            href="https://www.linkedin.com/in/daneahern/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkedinBtn}
          >
            Follow on LinkedIn
          </a>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.docTag}>
            <span className={styles.livePulse} />
            Version {CURRENT_VERSION} &nbsp;·&nbsp; March 2026 &nbsp;·&nbsp; Building in Public
          </div>

          <h1 className={styles.heroTitle}>
            I'm building an AI-powered recruiting platform from scratch —
            <em> and documenting every step.</em>
          </h1>

          <p className={styles.heroSub}>
            RYZE.ai is a recruiting platform I'm building and documenting in real time. Every feature ships as a video—follow along as a simple scheduling tool grows into a full AI intelligence layer for modern recruiting.
          </p>
          <div className={styles.heroCtas}>
            <button
              className={styles.ctaPrimary}
              onClick={() => waitlistRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            >
              Join the Waitlist
            </button>
            <a
              href="https://www.linkedin.com/in/daneahern/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaSecondary}
            >
              Watch the build on LinkedIn →
            </a>
          </div>
        </div>

        <div className={styles.heroDemo}>
          <DemoChat />
        </div>
      </section>

      {/* ── Building in Public / Episodes ────────── */}
      <section className={styles.episodesSection}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>Building in Public</div>
          <h2 className={styles.sectionH2}>{EPISODES.length} episodes. Still building.</h2>
          <p className={styles.sectionP}>
            Every major milestone gets a video — published on <strong>LinkedIn</strong>. Hover any episode to see what was built.
          </p>

          <div className={styles.episodeGrid}>
            {EPISODES
              .slice(0, showAllEpisodes ? EPISODES.length : 3)
              .map((ep) => {
                if (ep.comingSoon) {
                  const CardEl = ep.url ? "a" : "div";
                  const cardProps = ep.url
                    ? { href: ep.url, target: "_blank", rel: "noopener noreferrer" }
                    : {};
                  return (
                    <CardEl
                      key={ep.num}
                      className={`${styles.episodeCard} ${styles.episodeCardComingSoon}`}
                      {...cardProps}
                    >
                      <div className={styles.epDefault}>
                        <div className={styles.epTop}>
                          <span className={styles.epNum}>Ep {ep.num}</span>
                          <span className={styles.epComingBadge}>Coming Soon</span>
                        </div>
                        <div className={styles.epTitle}>{ep.title}</div>
                      </div>
                      <div className={styles.epHover}>
                        <div className={styles.epHoverNum}>Episode {ep.num} — Coming Soon</div>
                        <p className={styles.epHoverDesc} style={{ whiteSpace: "pre-line" }}>
                          {ep.desc}
                        </p>
                        {ep.url && <span className={styles.epHoverLink}>Read on LinkedIn →</span>}
                      </div>
                    </CardEl>
                  );
                }
                return (
                  <a
                    key={ep.num}
                    href={ep.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.episodeCard}
                  >
                    <div className={styles.epThumbWrap}>
                      <img src={ep.thumb} alt={`Episode ${ep.num}`} className={styles.epThumb} />
                    </div>
                    <div className={styles.epHover}>
                      <div className={styles.epHoverNum}>Episode {ep.num}</div>
                      <p className={styles.epHoverDesc}>{ep.desc}</p>
                      <span className={styles.epHoverLink}>Watch on LinkedIn →</span>
                    </div>
                  </a>
                );
              })}
          </div>

          <button
            className={styles.showMoreBtn}
            onClick={() => setShowAllEpisodes((prev) => !prev)}
          >
            {showAllEpisodes ? "Show less ↑" : `Show all ${EPISODES.length} episodes ↓`}
          </button>
        </div>
      </section>

      {/* ── Phases / The Build So Far ─────────────── */}
      <section className={styles.phasesSection}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>The Build So Far</div>
          <h2 className={styles.sectionH2}>Where I am in the build.</h2>

          <div className={styles.phases}>
            {PHASES.map((p) => {
              const isOpen = openPhase === p.id;
              return (
                <div key={p.id} className={`${styles.phaseItem} ${styles[`pStatus_${p.status}`]}`}>
                  <button className={styles.phaseToggle} onClick={() => setOpenPhase(isOpen ? null : p.id)}>
                    <div className={styles.phaseToggleLeft}>
                      <span className={styles.phaseIdLabel}>Phase {p.id}</span>
                      <span className={`${styles.phasePill} ${styles[`pill_${p.status}`]}`}>
                        {p.status === "complete" ? "✓ Complete"
                          : p.status === "next" ? "⬡ Up Next"
                            : p.status === "planned" ? "Planned"
                              : "Future"}
                      </span>
                    </div>
                    <span className={styles.phaseToggleTitle}>{p.title}</span>
                    <span className={styles.phaseChevron}>{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className={styles.phaseDetail}>
                      <p>{p.summary}</p>
                      <ul>
                        {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What's Next ──────────────────────────── */}
      <section className={styles.whatsNextSection}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>What's Next</div>
          <h2 className={styles.sectionH2}>Still building. Here's what's coming.</h2>

          <div className={styles.nextGrid}>

            <div className={styles.nextCard}>
              <div className={styles.nextNum}>EP 14</div>
              <div className={styles.nextTitle}>Job Orders &amp; Candidate Matching</div>
              <p className={styles.nextDesc}>
                The recruiter sees AI-ranked candidate matches for every open role — powered by
                the same pgvector embeddings already running in production. One click pushes a
                candidate to an employer's dashboard or a job to a candidate's dashboard.
                Manual approval on AI-generated rankings. Fast to act on, easy to improve.
              </p>
              <span className={styles.nextBadge}>Up next</span>
            </div>

            <div className={styles.nextCard}>
              <div className={styles.nextNum}>EP 15</div>
              <div className={styles.nextTitle}>Stripe Billing &amp; Subscription</div>
              <p className={styles.nextDesc}>
                $99/month recruiter subscription via Stripe. Includes usage-based
                overflow protection — if API costs exceed the base plan in a billing
                period, usage is billed in $20 increments automatically. No surprise
                bills. No manual intervention.
              </p>
              <span className={styles.nextBadge}>Coming soon</span>
            </div>

            <div className={styles.nextCard}>
              <div className={styles.nextNum}>EP 16</div>
              <div className={styles.nextTitle}>Invitation System &amp; Beta Launch</div>
              <p className={styles.nextDesc}>
                Recruiters get access via invitation only. A 7-day free trial on signup,
                then the subscription kicks in. This episode also marks the transition
                from build-in-public landing page to a production application — RYZE.ai
                goes live as a real product.
              </p>
              <span className={styles.nextBadge}>Coming soon</span>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <RyzeLogo size={16} color="#57a0d3" />
            <span>RYZE.ai</span>
          </div>
          <div className={styles.footerLinks}>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="https://www.linkedin.com/in/daneahern/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
          <p className={styles.footerCopy}>© 2026 RYZE GROUP, Inc. d/b/a RYZE.ai · Version {CURRENT_VERSION}</p>
        </div>
        <a href="/admin/login" className={styles.adminGhost}>Admin</a>
      </footer>
    </div>
  );
}