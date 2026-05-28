/* src/pages/Landing.jsx */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Building2, BriefcaseBusiness, Binoculars } from "lucide-react";
import styles from "./Landing.module.css";

// Flaticon SVG icons
import aiIcon from "../assets/icons/artificial-intelligence.svg";
import calendarIcon from "../assets/icons/calendar.svg";
import zoomIcon from "../assets/icons/zoom.svg";
import addCandidateIcon from "../assets/icons/add-candidate.svg";
import enhanceIcon from "../assets/icons/enhance_profileV2.svg";
import indexedIcon from "../assets/icons/indexed.svg";
import downloadIcon from "../assets/icons/downloadV2.svg";
import sendInviteIcon from "../assets/icons/send_invite.svg";
import aiNotesIcon from "../assets/icons/ai_notes.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DEMO_QUERIES = [
  {
    q: "Who are my best candidates for a Controller role?",
    a: "3 strong matches: Sarah Chen (Big 4, CPA, 8 yrs), Marcus Webb (Manufacturing controller, $140K target), and Priya Nair (IPO experience, currently open).",
  },
  {
    q: "Which employers haven't heard from us in 30 days?",
    a: "4 employers need a touchpoint: Harbor Financial, Apex Manufacturing, TechBridge Group, and Summit Capital. Last contact was 31–47 days ago.",
  },
  {
    q: "What do we know about our Deloitte alumni candidates?",
    a: "4 Deloitte alumni in your pipeline. Avg target: $130–160K. Top reason for leaving: better work-life balance.",
  },
];

const STEPS = [
  {
    icon: addCandidateIcon,
    num: "01",
    title: "Add Candidates & Employers",
    desc: "Paste a resume, upload a PDF, or copy a LinkedIn profile. RYZE parses everything into structured records automatically.",
  },
  {
    icon: zoomIcon,
    num: "02",
    title: "Book & Run Zoom Calls",
    desc: "Integrated booking with Zoom and Google Calendar. AI pre-call briefs generated automatically before every meeting.",
  },
  {
    icon: aiNotesIcon,
    num: "03",
    title: "AI Captures Everything",
    desc: "Post-call summaries written and saved automatically. Every conversation becomes queryable intelligence in your database.",
  },
  {
    icon: indexedIcon,
    num: "04",
    title: "Match, Present & Export",
    desc: "Semantic matching surfaces the right candidates. One-click branded PDFs ready to send to hiring managers.",
  },
];

const FEATURES = [
  {
    icon: enhanceIcon,
    title: "AI-Generated Profiles",
    desc: "Claude writes candidate summaries, outreach messages, and recruiter notes from raw resume text — instantly.",
  },
  {
    icon: calendarIcon,
    title: "Smart Scheduling",
    desc: "Four booking flows for every recruiter scenario. Auto-confirms, sends reminders, no manual follow-up required.",
  },
  {
    icon: zoomIcon,
    title: "Zoom + Calendar Sync",
    desc: "Meetings create in Zoom and Google Calendar automatically. Links delivered by email and SMS.",
  },
  {
    icon: aiIcon,
    title: "Semantic Matching",
    desc: "pgvector cosine similarity ranks candidates against job orders by meaning — not just keywords.",
  },
  {
    icon: downloadIcon,
    title: "Branded PDF Exports",
    desc: "One-click recruiter-grade PDFs for candidates and job orders. Mirrors the UI layout exactly.",
  },
  {
    icon: sendInviteIcon,
    title: "Multi-Tenant Platform",
    desc: "Built for scale from day one. Each recruiting firm gets an isolated tenant environment with Stripe billing.",
  },
];

const INTENT_OPTIONS = [
  { value: "hiring", icon: Building2, label: "I'm hiring" },
  { value: "job_seeking", icon: BriefcaseBusiness, label: "I'm job hunting" },
  { value: "following", icon: Binoculars, label: "Following the build" },
];

// ── Inline RYZE logo SVG ────────────────────────────────────────────────────
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

// ── Animated intelligence demo widget ──────────────────────────────────────
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
            <div className={styles.demoMsgLabel}>
              <RyzeLogo size={12} color="#fff" /> RYZE
            </div>
            <div className={styles.demoThinking}>
              <span /><span /><span />
            </div>
          </div>
        )}
        {displayA && (
          <div className={styles.demoMsgAi}>
            <div className={styles.demoMsgLabel}>
              <RyzeLogo size={12} color="#fff" /> RYZE
            </div>
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

// ── Main landing page ───────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const waitlistRef = useRef(null);

  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState(null);
  const [wlStatus, setWlStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect authenticated users to their dashboard
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
        body: JSON.stringify({
          email: email.trim(),
          intent: intent || "following",
          source: "ryze_ai_landing",
        }),
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

      {/* ── Navigation ─────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <img src={ryzeLogo} alt="RYZE.ai" className={styles.navLogo} />
          </div>
          <nav className={styles.navLinks}>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="/about" className={styles.navLink}>About the Build</a>
          </nav>
          <div className={styles.navActions}>
            <a href="/auth" className={styles.navSignIn}>Sign In</a>
            <button
              className={styles.navCta}
              onClick={() => waitlistRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              Get Early Access
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroPulse} />
              Built for Accounting &amp; Finance Recruiting
            </div>
            <h1 className={styles.heroH1}>
              Your Recruiting Pipeline,{" "}
              <em className={styles.heroEm}>Powered&nbsp;by&nbsp;AI</em>
            </h1>
            <p className={styles.heroSub}>
              RYZE.ai turns every candidate call, resume, and job order into
              searchable, actionable recruiting intelligence — automatically.
            </p>
            <div className={styles.heroCtas}>
              <button
                className={styles.heroCtaPrimary}
                onClick={() =>
                  waitlistRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Get Early Access
              </button>
              <a href="/about" className={styles.heroCtaSecondary}>
                Follow the Build →
              </a>
            </div>
            <p className={styles.heroStack}>
              Python · FastAPI · pgvector · React · Claude API
            </p>
          </div>

          <div className={styles.heroVisual}>
            <DemoChat />
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────── */}
      <section className={styles.stepsSection} id="how-it-works">
        <div className={styles.container}>
          <div className={styles.eyebrow}>How It Works</div>
          <h2 className={styles.sectionH2}>
            From first call to placement,<br />
            RYZE handles the intelligence layer.
          </h2>

          <div className={styles.stepsGrid}>
            {STEPS.map((step, i) => (
              <div key={step.num} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepIconWrap}>
                  <img src={step.icon} alt="" className={styles.stepIcon} />
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className={styles.stepArrow}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.container}>
          <div className={styles.eyebrow}>The Platform</div>
          <h2 className={styles.sectionH2}>
            Everything you need to run<br />
            a modern recruiting desk.
          </h2>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>
                  <img src={f.icon} alt="" className={styles.featureIcon} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waitlist ───────────────────────────────── */}
      <section className={styles.waitlistSection} ref={waitlistRef}>
        <div className={styles.waitlistInner}>
          <h2 className={styles.waitlistTitle}>Get early access.</h2>
          <p className={styles.waitlistSub}>
            RYZE is opening to recruiting firms in accounting and finance.
            Drop your email to get notified first.
          </p>

          {wlStatus === "success" ? (
            <div className={styles.successState}>
              <div className={styles.successCheck}>✓</div>
              <div>
                <p className={styles.successTitle}>You're on the list.</p>
                <p className={styles.successSub}>
                  We'll reach out when RYZE is ready for you.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.wlForm}>
              <div className={styles.intentRow}>
                {INTENT_OPTIONS.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.intentBtn} ${intent === value ? styles.intentBtnOn : ""
                      }`}
                    onClick={() => setIntent((v) => (v === value ? null : value))}
                    disabled={wlStatus === "loading"}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              <div className={styles.emailRow}>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                  }}
                  className={`${styles.emailInput} ${errorMsg ? styles.emailInputErr : ""
                    }`}
                  disabled={wlStatus === "loading"}
                  onKeyDown={(e) => e.key === "Enter" && handleWaitlist()}
                />
                <button
                  className={styles.notifyBtn}
                  onClick={handleWaitlist}
                  disabled={wlStatus === "loading"}
                >
                  {wlStatus === "loading" ? (
                    <span className={styles.spinner} />
                  ) : (
                    "Notify Me"
                  )}
                </button>
              </div>

              {errorMsg && <p className={styles.errMsg}>{errorMsg}</p>}
              <p className={styles.trustLine}>No spam. Unsubscribe any time.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <RyzeLogo size={16} color="#57a0d3" />
            <span>RYZE.ai</span>
          </div>
          <div className={styles.footerLinks}>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a
              href="https://www.linkedin.com/in/daneahern/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a href="/about">About the Build</a>
          </div>
          <p className={styles.footerCopy}>
            © 2026 RYZE GROUP, Inc. d/b/a RYZE.ai
          </p>
        </div>
        <a href="/admin/login" className={styles.adminGhost}>
          Admin
        </a>
      </footer>
    </div>
  );
}