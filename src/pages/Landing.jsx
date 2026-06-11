/* src/pages/Landing.jsx */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Code2,
  LayoutDashboard,
  Sparkles,
  Workflow,
  KeyRound,
  Calculator,
  AppWindow,
  Wrench,
  Lightbulb,
} from "lucide-react";
import styles from "./Landing.module.css";
import ryzeLogo from "../assets/RYZE_LOGO.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Hero showcase: cycles through real builds ───────────────────────────────
// NOTE: RYZE.ai is real. Replace the two client entries below with your
// actual project details (name, one-line description, stack) when ready.
const PROJECTS = [
  {
    tag: "AI Recruiting Platform",
    title: "RYZE.ai",
    desc: "Multi-tenant SaaS with AI candidate matching, semantic search, automated scheduling, and post-call intelligence. Designed and built end to end.",
    stack: ["FastAPI", "pgvector", "React", "Claude"],
  },
  {
    tag: "Finance & Operations",
    title: "Accounting Workflow App",
    desc: "A custom application replacing spreadsheets and manual reconciliation for a finance team — built around their actual close process.",
    stack: ["FastAPI", "Postgres", "React"],
  },
  {
    tag: "Operations",
    title: "Time Tracking System",
    desc: "Time and resource tracking designed around an existing operations workflow, instead of forcing the team into a new one.",
    stack: ["FastAPI", "Postgres", "React"],
  },
];

const SERVICES = [
  {
    icon: Code2,
    title: "Custom Applications",
    desc: "Full applications built around your workflow — not a template you have to bend your business to fit.",
  },
  {
    icon: LayoutDashboard,
    title: "Internal Tools & Dashboards",
    desc: "The admin panels, trackers, and dashboards your team needs but can't buy off the shelf.",
  },
  {
    icon: Sparkles,
    title: "AI Integration",
    desc: "Semantic search, RAG, document parsing, and LLM features wired into real workflows — not bolted on as a gimmick.",
  },
  {
    icon: Workflow,
    title: "Automation & Workflows",
    desc: "Scheduling, notifications, webhooks, and pipelines that remove the manual steps eating your team's time.",
  },
  {
    icon: KeyRound,
    title: "You Own the Code",
    desc: "No per-seat SaaS rent. The software is yours — deployed, documented, and handed over.",
  },
  {
    icon: Calculator,
    title: "Built by an Operator",
    desc: "A CPA and Controller who codes. I understand finance and operations first, then build the system to match.",
  },
];

const PROCESS = [
  {
    num: "01",
    title: "Understand the workflow",
    desc: "I learn how your business actually runs — the steps, the edge cases, the spreadsheets holding it together.",
  },
  {
    num: "02",
    title: "Design the system",
    desc: "Map the workflow to software with no bloat. You see the structure before a line of code is written.",
  },
  {
    num: "03",
    title: "Build it fast",
    desc: "Production software in weeks, not quarters — the same AI-assisted build process that produced RYZE.ai.",
  },
  {
    num: "04",
    title: "You own it",
    desc: "Deployed, documented, and yours to keep. Clean hand-off or ongoing support — your call.",
  },
];

const PROJECT_TYPES = [
  { value: "custom_app", icon: AppWindow, label: "Custom app" },
  { value: "internal_tool", icon: Wrench, label: "Internal tool" },
  { value: "not_sure", icon: Lightbulb, label: "Not sure yet" },
];

// ── Inline RYZE logo SVG (footer) ───────────────────────────────────────────
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

// ── Hero project showcase (cycling) ─────────────────────────────────────────
function ProjectShowcase() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PROJECTS.length), 4200);
    return () => clearInterval(t);
  }, []);

  const p = PROJECTS[idx];

  return (
    <div className={styles.showcase}>
      <div className={styles.showcaseBar}>
        <div className={styles.showcaseLights}>
          <span style={{ background: "#ff5f57" }} />
          <span style={{ background: "#febc2e" }} />
          <span style={{ background: "#28c840" }} />
        </div>
        <span className={styles.showcaseWindowTitle}>
          <RyzeLogo size={12} color="#57a0d3" /> Selected Work
        </span>
      </div>

      <div className={styles.showcaseBody}>
        <div key={idx} className={styles.showcaseCard}>
          <span className={styles.showcaseTag}>{p.tag}</span>
          <h3 className={styles.showcaseTitle}>{p.title}</h3>
          <p className={styles.showcaseDesc}>{p.desc}</p>
          <div className={styles.showcaseStack}>
            {p.stack.map((s) => (
              <span key={s} className={styles.stackChip}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.showcasePips}>
        {PROJECTS.map((_, i) => (
          <span
            key={i}
            className={`${styles.pip} ${i === idx ? styles.pipActive : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main landing page ───────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const contactRef = useRef(null);

  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      if (user.user_type === "ADMIN") navigate("/admin");
      else if (user.user_type === "EMPLOYER") navigate("/employer/dashboard");
      else navigate("/candidate/dashboard");
    }
  }, [user, navigate]);

  function scrollToContact() {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSubmit() {
    setErrorMsg("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Enter a valid email so I can reply.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          intent: intent || "not_sure",
          source: "ryze_ai_landing",
        }),
      });
      if (res.ok || res.status === 409) {
        setStatus("success");
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorMsg(d.detail || "Something went wrong. Try again.");
        setStatus("idle");
      }
    } catch {
      setErrorMsg("Network error. Try again.");
      setStatus("idle");
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Navigation ─────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <img src={ryzeLogo} alt="RYZE.ai" className={styles.navLogo} />
            <span className={styles.navBrandName}>RYZE.ai</span>
          </div>
          <nav className={styles.navLinks}>
            <a href="#services" className={styles.navLink}>What I Build</a>
            <a href="#process" className={styles.navLink}>Process</a>
            <a href="#work" className={styles.navLink}>Work</a>
          </nav>
          <div className={styles.navActions}>
            <a href="/auth" className={styles.navSignIn}>Sign In</a>
            <button className={styles.navCta} onClick={scrollToContact}>
              Start a Project
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
              Built by a CPA who builds
            </div>
            <h1 className={styles.heroH1}>
              We build the software{" "}
              <em className={styles.heroEm}>you&nbsp;can't&nbsp;buy.</em>
            </h1>
            <p className={styles.heroSub}>
              Custom apps, internal tools, and automation — built around how your
              business actually works, not how an off-the-shelf vendor thinks it
              should.
            </p>
            <div className={styles.heroCtas}>
              <button className={styles.heroCtaPrimary} onClick={scrollToContact}>
                Start a Project
              </button>
              <a href="#work" className={styles.heroCtaSecondary}>
                See the Work →
              </a>
            </div>
            <p className={styles.heroStack}>
              Python · FastAPI · pgvector · React · Claude API
            </p>
          </div>

          <div className={styles.heroVisual}>
            <ProjectShowcase />
          </div>
        </div>
      </section>

      {/* ── What I Build (services) ────────────────── */}
      <section className={styles.servicesSection} id="services">
        <div className={styles.container}>
          <div className={styles.eyebrow}>What I Build</div>
          <h2 className={styles.sectionH2}>
            Software shaped to your business,<br />
            not the other way around.
          </h2>

          <div className={styles.servicesGrid}>
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className={styles.serviceCard}>
                  <div className={styles.serviceIconWrap}>
                    <Icon className={styles.serviceIcon} size={24} strokeWidth={1.75} />
                  </div>
                  <h3 className={styles.serviceTitle}>{s.title}</h3>
                  <p className={styles.serviceDesc}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Process ────────────────────────────────── */}
      <section className={styles.processSection} id="process">
        <div className={styles.container}>
          <div className={styles.eyebrow}>How It Works</div>
          <h2 className={styles.sectionH2}>
            From your workflow to working software<br />
            in weeks, not quarters.
          </h2>

          <div className={styles.processGrid}>
            {PROCESS.map((step) => (
              <div key={step.num} className={styles.processCard}>
                <div className={styles.processNum}>{step.num}</div>
                <h3 className={styles.processTitle}>{step.title}</h3>
                <p className={styles.processDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Work / case studies ────────────────────── */}
      <section className={styles.workSection} id="work">
        <div className={styles.container}>
          <div className={styles.eyebrow}>Selected Work</div>
          <h2 className={styles.sectionH2}>Real software, built end to end.</h2>

          <div className={styles.workGrid}>
            {PROJECTS.map((p) => (
              <div key={p.title} className={styles.workCard}>
                <span className={styles.workCardTag}>{p.tag}</span>
                <h3 className={styles.workCardTitle}>{p.title}</h3>
                <p className={styles.workCardDesc}>{p.desc}</p>
                <div className={styles.workCardStack}>
                  {p.stack.map((s) => (
                    <span key={s} className={styles.stackChip}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Operator band ──────────────────────────── */}
      <section className={styles.operatorSection}>
        <div className={styles.operatorInner}>
          <div className={styles.operatorEyebrow}>Why RYZE</div>
          <h2 className={styles.operatorTitle}>
            Most developers don't understand your business.
            Most operators can't build. I do both.
          </h2>
          <p className={styles.operatorText}>
            I'm Dane Ahern — a CPA and Controller with twelve years in finance
            leadership who builds production software. That combination is rare,
            and it's the whole point: less translation between what you need and
            what gets built, fewer wrong turns, and software that fits the work
            the first time. RYZE.ai is the proof — a full platform I designed and
            built end to end. Now I build that caliber of software for other
            companies.
          </p>
          <div className={styles.operatorSig}>Dane Ahern · CPA · Controller · Builder</div>
        </div>
      </section>

      {/* ── Contact ────────────────────────────────── */}
      <section className={styles.contactSection} ref={contactRef}>
        <div className={styles.contactInner}>
          <h2 className={styles.contactTitle}>Have something to build?</h2>
          <p className={styles.contactSub}>
            Tell me what you're trying to do and I'll tell you straight whether I
            can build it. No sales funnel — it comes directly to me.
          </p>

          {status === "success" ? (
            <div className={styles.successState}>
              <div className={styles.successCheck}>✓</div>
              <div>
                <p className={styles.successTitle}>Got it.</p>
                <p className={styles.successSub}>I'll be in touch shortly.</p>
              </div>
            </div>
          ) : (
            <div className={styles.contactForm}>
              <div className={styles.intentRow}>
                {PROJECT_TYPES.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.intentBtn} ${intent === value ? styles.intentBtnOn : ""}`}
                    onClick={() => setIntent((v) => (v === value ? null : value))}
                    disabled={status === "loading"}
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
                  className={`${styles.emailInput} ${errorMsg ? styles.emailInputErr : ""}`}
                  disabled={status === "loading"}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                  className={styles.notifyBtn}
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                >
                  {status === "loading" ? <span className={styles.spinner} /> : "Send"}
                </button>
              </div>

              {errorMsg && <p className={styles.errMsg}>{errorMsg}</p>}
              <p className={styles.trustLine}>Goes straight to my inbox. No spam.</p>
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
            <a href="#services">What I Build</a>
            <a href="#work">Work</a>
            <a
              href="https://www.linkedin.com/in/daneahern/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
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