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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Update these with your actual LinkedIn video URLs ────────────────────
const EPISODES = [
  {
    num: 10,
    title: "Adding Candidates to the Platform",
    thumb: EP10,
    url: "https://www.linkedin.com/posts/daneahern_episode-10-of-building-ryzeai-ryze-is-a-activity-7439683948621860864-TiN_?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "RYZE now has a full candidate intake system. Upload a PDF or Word resume, paste a LinkedIn profile, or enter details manually — Claude parses the document and extracts structured profile fields automatically. Every candidate is then indexed for semantic search so RYZE Intelligence can find them by meaning, not just keywords.",
  },
  {
    num: 9,
    title: "Call Booking System Testing",
    thumb: EP9,
    url: "https://www.linkedin.com/posts/daneahern_building-ryzeai-episode-9-this-episode-activity-7439627919678787584-cU-f?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "In this episode I tested two key booking flows: Candidate → Recruiter and Employer → Recruiter. Both paths generate Zoom meetings, send confirmation emails, and schedule reminders automatically. The goal was to validate that the scheduling system works from both sides before building additional recruiter workflow features.",
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
    desc: "I implemented RAG-powered Intelligence Chat — ask your entire candidate database a question in plain English and get an intelligent answer back. Not keyword search. Not filters. Just a question: 'Who would be a good fit for a Controller role in Boston?' The system searches by meaning, powered by pgvector and RAG running directly inside PostgreSQL.",
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
    desc: "Booking systems sound simple until you actually build one. This week I worked through four different meeting scenarios: Recruiter→Candidate, Recruiter→Employer, Candidate→Recruiter, and Employer→Recruiter. Each flow needs different fields, different logic, and different AI research rules. Small details create surprisingly complex systems.",
  },
  {
    num: 3,
    title: "What If Your Hiring Data Was Connected?",
    thumb: EP3,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-3-what-activity-7434907747122524160-JE-O?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "Notes in spreadsheets. Candidate history in email threads. Call outcomes on sticky notes. The data exists — it's just scattered everywhere and doing nothing. RYZE is built to capture every hire, every call, every candidate interaction from day one. Structured. Persistent. Ready for AI to turn into something useful.",
  },
  {
    num: 2,
    title: "Preparation & Reminders",
    thumb: EP2,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-2-one-activity-7434615686380900352-RVmV?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "One of the biggest problems in recruiting is simple: people walk into calls unprepared. This episode covers automated 15-minute reminders before every Zoom meeting and AI pre-call briefs that summarize the company you're about to speak with. Small features that slowly turn a scheduling tool into a real recruiting platform.",
  },
  {
    num: 1,
    title: "Start of Series",
    thumb: EP1,
    url: "https://www.linkedin.com/posts/daneahern_building-ryze-in-public-episode-1-start-activity-7434171807298908160-SMk2?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFhYcIkB3YuEArnJ31c8xMk_UxADZZURwzo",
    desc: "What does it actually take to build an ATS from scratch? I'm documenting the entire process as I build RYZE.ai in public. The goal: build a recruiting platform that captures the data recruiters create every day. Employer booking flow, admin dashboard, AI pre-call briefs, Zoom + Calendar integration, and OAuth login — all live on day one.",
  },
];



// ── Phases — fill these in when ready ───────────────────────────────────
const PHASES = [];



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
            Version 11 &nbsp;·&nbsp; March 2026 &nbsp;·&nbsp; Building in Public
          </div>

          <h1 className={styles.heroTitle}>
            I'm building an AI-powered recruiting platform from scratch —
            <em> and documenting every step.</em>
          </h1>

          <p className={styles.heroSub}>
            RYZE.ai is a live, production recruiting platform I'm building and running
            simultaneously. Every feature ships as a video. Follow along as a scheduling
            tool grows into a full AI intelligence layer for accounting &amp; finance recruiting.
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
          <h2 className={styles.sectionH2}>10 episodes. Still building.</h2>
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
                        <p
                          className={styles.epHoverDesc}
                          style={{ whiteSpace: "pre-line" }}
                        >
                          {ep.desc}
                        </p>
                        {ep.url && (
                          <span className={styles.epHoverLink}>Read on LinkedIn →</span>
                        )}
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
                      <img
                        src={ep.thumb}
                        alt={`Episode ${ep.num}`}
                        className={styles.epThumb}
                      />
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
            {showAllEpisodes
              ? "Show less ↑"
              : `Show all ${EPISODES.length} episodes ↓`}
          </button>
        </div>
      </section>




      {/* ── Phases / Roadmap ─────────────────────── */}
      {PHASES.length > 0 && (
        <section className={styles.phasesSection}>
          <div className={styles.container}>
            <div className={styles.eyebrow}>The Roadmap</div>
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
      )}

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
                {INTENT_OPTIONS.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.intentBtn} ${intent === value ? styles.intentBtnOn : ""}`}
                    onClick={() => setIntent(p => p === value ? null : value)}
                    disabled={wlStatus === "loading"}
                  >
                    <Icon size={22} strokeWidth={1.5} />
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
          <p className={styles.footerCopy}>© 2026 RYZE.ai · Built by Daniel Ahern, CPA · Version 11</p>
        </div>
        <a href="/admin/login" className={styles.adminGhost}>Admin</a>
      </footer>
    </div>
  );
}