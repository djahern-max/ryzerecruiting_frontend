/* src/pages/Landing.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import styles from "./Landing.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Update these with your actual LinkedIn video URLs ────────────────────
const EPISODE_LINKS = {
  1: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-1-start-activity-7434171807298908160-SMk2?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
  2: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-2-one-activity-7434615686380900352-RVmV?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
  3: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-3-what-activity-7434907747122524160-JE-O?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
  4: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-4-booking-activity-7435763383817269248-qiZc?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
  5: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-5-this-activity-7437041631528267776-gSkN?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
  6: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-6-one-activity-7437906403861794816--73c?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
  7: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-7-this-activity-7439103131206029312-6_DF?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
};
// ─────────────────────────────────────────────────────────────────────────

const FEATURES = [
  { name: "User authentication", status: "live", note: "OAuth (Google, LinkedIn) + traditional login, role-based routing" },
  { name: "Employer dashboards", status: "live", note: "Booking management, company intelligence profiles" },
  { name: "Candidate dashboards", status: "live", note: "Profile management, booking flows" },
  { name: "Admin dashboard", status: "live", note: "Full CRUD for candidates, employers, job orders, bookings" },
  { name: "AI pre-call briefs", status: "live", note: "Claude API generates intelligence brief before each Zoom call" },
  { name: "AI Zoom meeting notes", status: "live", note: "Meeting summaries stored per booking" },
  { name: "Candidate parsing", status: "live", note: "PDF upload + text paste → Claude extracts structured profile fields" },
  { name: "Employer parsing", status: "live", note: "Job posting paste → Claude extracts company intelligence" },
  { name: "Job order parsing", status: "live", note: "Job description paste → structured job order fields" },
  { name: "SMS notifications", status: "live", note: "Twilio SMS for booking confirmations and reminders" },
  { name: "PGVector extension", status: "live", note: "Installed on production Postgres 16, migration complete" },
  { name: "Embedding columns", status: "live", note: "vector(1536) columns on candidates, employers, job_orders" },
  { name: "Embedding service", status: "live", note: "OpenAI text-embedding-3-small integration built" },
  { name: "Auto-embed on save", status: "live", note: "Every new/updated candidate, employer, job order auto-embeds in background" },
  { name: "Semantic search API", status: "live", note: "3 search endpoints: /candidates, /employers, /job-orders" },
  { name: "RYZE Intelligence chat", status: "live", note: "Conversational AI interface with 8 tools, inline candidate/meeting cards" },
  { name: "Duplicate detection", status: "live", note: "Name + location check on candidate parse before save" },
  { name: "Chat persistence", status: "planned", note: "Save/load conversations — see Phase 3b" },
];

const PHASES = [
  {
    id: "1",
    title: "Data Loading & Embedding",
    status: "complete",
    summary: "Phase 1 validated the full RAG pipeline end-to-end: 15 candidates loaded, OpenAI embeddings working, cosine similarity search returning semantically ranked results. The pgvector deserialization bug was resolved by rewriting the cosine search with raw SQL to bypass the ORM's type processor.",
    bullets: [
      "embedding_service.py — core RAG infrastructure, per-record background helpers",
      "search.py — semantic search endpoints with raw SQL cosine search",
      "candidates.py — auto-embed on POST/PATCH, file upload parse endpoint",
    ],
  },
  {
    id: "2",
    title: "Auto-Embedding on Save",
    status: "complete",
    summary: "Every new or updated candidate, employer profile, and job order now auto-embeds in a background task within seconds of saving. The PATCH flow clears the old embedding immediately so the status indicator reflects pending state while the new embedding is generated.",
    bullets: [
      "embed_candidate_background, embed_employer_background, embed_job_order_background",
      "BackgroundTasks wired into POST and PATCH for all three entity types",
      "PATCH flow clears embedding before re-embedding to reflect accurate status",
      "AI Indexed badge in candidate roster — green when embedded, amber spinner when indexing",
    ],
  },
  {
    id: "3a",
    title: "RYZE Intelligence Chat Interface",
    status: "complete",
    summary: "The chat interface is live at /admin/chat. Recruiters can query the entire database in plain English. Claude uses tool_use to decide which data sources to query, retrieves live results, and returns a natural language response with inline candidate and meeting cards.",
    bullets: [
      "POST /api/chat — accepts message + conversation history",
      "Agentic loop — Claude calls tools up to 5 times per query to gather data",
      "Tool dispatch — 8 tools available, Claude selects based on query intent",
      "Candidate results render as inline cards with match %, tags, and AI summary",
      "Typing indicator with animated dots while Claude is processing",
      "Session conversation history maintained so follow-up questions work",
    ],
  },
  {
    id: "3b",
    title: "Chat Persistence",
    status: "next",
    summary: "Conversations currently live only in React state and disappear on page refresh or navigation. Phase 3b adds persistent chat history — identical in pattern to ChatGPT and Claude.",
    bullets: [
      "Alembic migration — two new tables: chat_sessions (id, user_id, title, created_at, updated_at) and chat_messages",
      "Backend endpoints — POST /api/chat/sessions, GET /api/chat/sessions, GET /api/chat/sessions/{id}, DELETE",
      "Auto-title generation — after first AI response, Claude generates a 4–6 word title",
      "Chat sidebar — left panel showing past sessions grouped by date (Today, Yesterday, This Week, Older)",
      "Inline result JSON storage — candidate and meeting card data stored as JSON in chat_messages",
    ],
  },
  {
    id: "4",
    title: "Chat-Enhanced Intelligence",
    status: "planned",
    summary: "Zoom meeting notes and AI-generated company profiles surface directly inside RYZE Intelligence chat. Ask about a company and get their full profile, every meeting summary, and key talking points synthesized in a single response.",
    bullets: [
      "Zoom meeting summaries queryable through chat — ask about any past call by company or candidate name",
      "AI company profiles integrated as a chat tool — full employer intelligence on demand",
      "Meeting history and profile data combined into unified employer context",
      "Follow-up question chains — ask about a company, then drill into specific meetings or contacts",
    ],
  },
  {
    id: "5",
    title: "Candidate–Opportunity Matching",
    status: "planned",
    summary: "Link candidates to open job orders with semantic matching. Ask RYZE Intelligence to find the best fits for any role and get ranked candidates with match scores and reasoning — sourced entirely from your own pipeline.",
    bullets: [
      "Candidate-to-job-order semantic matching via vector similarity",
      "Chat tool: 'Who are my best fits for the Controller role at Acme Corp?' → ranked results with reasoning",
      "Candidate profiles enriched with job match scores visible in the roster",
      "Shortlist generation — produce a ranked candidate list for any open role in seconds",
    ],
  },
  {
    id: "6",
    title: "Go-to-Market & Operations",
    status: "planned",
    summary: "Streamline the platform into a working recruiting tool used daily. Refine the end-to-end workflow — from inbound lead to placed candidate — so RYZE.ai runs the business, not just supports it.",
    bullets: [
      "End-to-end workflow refinement from first contact to placement",
      "Recruiter-facing UI polish — faster access to daily priorities",
      "Pipeline reporting — placement velocity, candidate funnel, employer engagement",
      "Platform hardening for consistent daily use as the primary recruiting OS",
    ],
  },
  {
    id: "7",
    title: "LinkedIn Integration",
    status: "future",
    summary: "Phase 7 connects RYZE.ai to the broader recruiting ecosystem via LinkedIn's partner APIs.",
    bullets: [
      "LinkedIn Basic Job Posting API — post jobs from RYZE directly to LinkedIn company pages",
      "Candidate import flow — structured resume upload replaces manual data entry",
      "Apply Connect readiness — data models already structured to support LinkedIn partner integration",
      "LinkedIn Talent Solutions partner application — submit once platform demonstrates meaningful volume",
    ],
  },
  {
    id: "8",
    title: "RYZE.ai Platform Evolution",
    status: "future",
    summary: "This is where RYZE Recruiting becomes RYZE.ai. The proprietary database of accounting and finance hiring intelligence — every candidate, every company, every outcome — becomes the training substrate for a domain-specific AI that general platforms cannot replicate.",
    bullets: [
      "Multi-tenant architecture — other boutique recruiting firms can use RYZE.ai as their operating system",
      "Outcome tracking — track which candidates got placed, at what salary, how long they stayed",
      "Predictive matching — \"candidates like this typically succeed at companies like this\"",
      "Market intelligence — anonymized aggregate data on accounting/finance compensation trends",
      "API product — sell access to the intelligence layer to accounting firms, PE firms, and CFOs",
    ],
  },
];

const TECH_STACK = [
  { label: "PostgreSQL 16 + PGVector 0.6.0", role: "Vector storage & cosine similarity search" },
  { label: "OpenAI text-embedding-3-small", role: "1536-dim embedding generation" },
  { label: "Anthropic Claude Opus 4", role: "All AI generation, chat responses, parsing" },
  { label: "FastAPI + Python", role: "Backend API, async background tasks" },
  { label: "React + Vite", role: "Frontend — chat UI with inline result cards" },
  { label: "DigitalOcean + Gunicorn", role: "Production deployment, systemd services" },
];

const DEMO_QUERIES = [
  {
    q: "Do I have any meetings this morning?",
    a: "You have 2 confirmed calls today. 9:00 AM — Sarah Chen, Controller candidate, Big 4 background. 11:30 AM — Marcus Rivera, CFO at Acme Corp re: VP Finance search.",
  },
  {
    q: "Recommend 3 strong CPA candidates for the Controller role at Acme Corp.",
    a: "Top matches: 1. Jennifer Walsh, CPA — 94% match. Senior Manager at Deloitte, 12 yrs exp, NetSuite certified. 2. David Kim, CPA — 89% match. Controller at Series B startup, IPO-ready experience. 3. Priya Patel, CPA — 85% match. Big 4 audit manager transitioning into industry.",
  },
  {
    q: "What do we know about Deloitte's hiring patterns?",
    a: "Based on 4 Deloitte-background candidates in your pipeline: alumni typically target $130–160K base. Strong preference for structured environments. 3 of 4 cited \"better work-life balance\" as primary motivator.",
  },
];

const INTENT_OPTIONS = [
  { value: "hiring", emoji: "🏢", label: "I'm hiring" },
  { value: "job_seeking", emoji: "💼", label: "I'm job hunting" },
  { value: "following", emoji: "👀", label: "Following the build" },
];

function RyzeLogo({ size = 32, color = "#004aad" }) {
  // Clean triangle-only path extracted from RYZE_LOGO_V18.svg — no background rects
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

  const liveCount = FEATURES.filter(f => f.status === "live").length;

  return (
    <div className={styles.page}>

      {/* ── Header ─────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <RyzeLogo size={28} color="#004aad" />
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
            Version 10 &nbsp;·&nbsp; March 2026 &nbsp;·&nbsp; RAG &amp; Vector Search Implementation Plan
          </div>

          <h1 className={styles.heroTitle}>
            RYZE.ai is evolving from a recruiting tool into an
            <em> AI-native intelligence platform.</em>
          </h1>

          <p className={styles.heroSub}>
            Every candidate profile, company note, Zoom summary, and job order feeds a
            proprietary data moat — and a conversational AI interface lets recruiters query
            that data in plain English.
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

      {/* ── Why This Is Defensible ────────────────── */}
      <section className={styles.defensibleSection}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>Why This Is Defensible</div>
          <div className={styles.defensibleCards}>
            <div className={styles.defCard}>
              <div className={styles.defNum}>01</div>
              <p>General AI tools like ChatGPT have no access to your proprietary data.</p>
            </div>
            <div className={styles.defCard}>
              <div className={styles.defNum}>02</div>
              <p>Every candidate, company, and meeting you add makes RYZE.ai smarter — a flywheel competitors cannot replicate.</p>
            </div>
            <div className={styles.defCard}>
              <div className={styles.defNum}>03</div>
              <p>The platform compounds with use. Every placement, pattern, and outcome builds intelligence no competitor can buy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Current State Table ───────────────────── */}
      <section className={styles.statusSection}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>Current State — What Is Already Built</div>
          <h2 className={styles.sectionH2}>
            {liveCount} features live on production.
          </h2>
          <p className={styles.sectionP}>As of March 2026, the following are live and operational on ryze.ai:</p>

          <div className={styles.featureTable}>
            <div className={styles.featureTableHeader}>
              <span>Component</span>
              <span>Status</span>
              <span>Notes</span>
            </div>
            {FEATURES.map((f, i) => (
              <div key={i} className={`${styles.featureRow} ${f.status === "planned" ? styles.featureRowDimmed : ""}`}>
                <span className={styles.featureName}>{f.name}</span>
                <span className={f.status === "live" ? styles.badgeLive : styles.badgePlanned}>
                  {f.status === "live" ? "✓ Live" : "◎ Planned"}
                </span>
                <span className={styles.featureNote}>{f.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ───────────────────────────── */}
      <section className={styles.techSection}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>Technical Architecture</div>
          <h2 className={styles.sectionH2}>How RAG works in RYZE.ai.</h2>

          <div className={styles.ragLoop}>
            {[
              "User asks a question",
              "System converts it to a vector",
              "PGVector finds semantically similar records",
              "Records injected into Claude's context",
              "Claude answers using your actual data",
            ].map((step, i, arr) => (
              <div key={i} className={styles.ragRow}>
                <div className={styles.ragStep}>
                  <span className={styles.ragNum}>{i + 1}</span>
                  <span className={styles.ragText}>{step}</span>
                </div>
                {i < arr.length - 1 && <div className={styles.ragArrow}>↓</div>}
              </div>
            ))}
          </div>

          <div className={styles.techGrid}>
            {TECH_STACK.map((t, i) => (
              <div key={i} className={styles.techCard}>
                <div className={styles.techName}>{t.label}</div>
                <div className={styles.techRole}>{t.role}</div>
              </div>
            ))}
          </div>

          <div className={styles.costBox}>
            <div className={styles.costHeading}>Running cost at current scale</div>
            <div className={styles.costRows}>
              <div className={styles.costLine}><span>OpenAI Embeddings</span><span>~$0.01/mo</span></div>
              <div className={styles.costLine}><span>OpenAI Chat queries</span><span>~$0.10–2/mo</span></div>
              <div className={styles.costLine}><span>Anthropic Claude API</span><span>~$5–20/mo</span></div>
              <div className={styles.costLine}><span>DigitalOcean server</span><span>~$18/mo</span></div>
              <div className={`${styles.costLine} ${styles.costLineTotal}`}><span>Total</span><span>~$25–40/mo</span></div>
            </div>
            <p className={styles.costNote}>Scales very slowly — need 10,000+ users to hit $100/mo</p>
          </div>
        </div>
      </section>

      {/* ── Phases / Roadmap ─────────────────────── */}
      <section className={styles.phasesSection}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>The Roadmap</div>
          <h2 className={styles.sectionH2}>Where we are in the build.</h2>

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

      {/* ── Building in Public / Episodes ────────── */}
      <section className={styles.episodesSection}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>Building in Public</div>
          <h2 className={styles.sectionH2}>7 episodes documenting the journey.</h2>
          <p className={styles.sectionP}>
            Every major build milestone gets a video. Published primarily on <strong>LinkedIn</strong> — follow there for the best experience.
          </p>
          <div className={styles.episodeGrid}>
            {Object.entries(EPISODE_LINKS).map(([num, url]) => (
              <a key={num} href={url} target="_blank" rel="noopener noreferrer" className={styles.episodeCard}>
                <span className={styles.epNum}>Ep {num}</span>
                <span className={styles.epArrow}>→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waitlist ─────────────────────────────── */}
      <section className={styles.waitlistSection} ref={waitlistRef}>
        <div className={styles.waitlistInner}>
          <div className={styles.eyebrow} style={{ color: "#57a0d3" }}>Get Early Access</div>
          <h2 className={styles.waitlistTitle}>Join the waitlist.</h2>
          <p className={styles.waitlistSub}>
            RYZE.ai is currently in private beta. Accounting &amp; finance professionals,
            hiring managers, and anyone following the build — tell us who you are.
          </p>

          {wlStatus === "success" ? (
            <div className={styles.successState}>
              <span className={styles.successCheck}>✓</span>
              <div>
                <p className={styles.successTitle}>You're on the list.</p>
                <p className={styles.successSub}>We'll reach out when your spot opens up.</p>
              </div>
            </div>
          ) : (
            <div className={styles.wlForm}>
              <div className={styles.intentRow}>
                {INTENT_OPTIONS.map(({ value, emoji, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.intentBtn} ${intent === value ? styles.intentBtnOn : ""}`}
                    onClick={() => setIntent(p => p === value ? null : value)}
                    disabled={wlStatus === "loading"}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className={styles.emailRow}>
                <input
                  className={`${styles.emailInput} ${errorMsg ? styles.emailInputErr : ""}`}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrorMsg(""); }}
                  onKeyDown={e => e.key === "Enter" && handleWaitlist()}
                  disabled={wlStatus === "loading"}
                />
                <button className={styles.notifyBtn} onClick={handleWaitlist} disabled={wlStatus === "loading"}>
                  {wlStatus === "loading" ? <span className={styles.spinner} /> : "Notify Me →"}
                </button>
              </div>
              {errorMsg && <p className={styles.errMsg}>{errorMsg}</p>}
            </div>
          )}

          <p className={styles.trustLine}>No spam. No pressure. Just a heads-up when we open the doors.</p>
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
          <p className={styles.footerCopy}>© 2026 RYZE.ai · Built by Daniel Ahern, CPA · Version 10</p>
        </div>
        <a href="/admin/login" className={styles.adminGhost}>Admin</a>
      </footer>
    </div>
  );
}