/* src/pages/Landing.jsx */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Landing.module.css";
import ryzeLogo from "../assets/RYZE_LOGO.svg";

import timeIcon from "../assets/icons/calendar.svg";
import apIcon from "../assets/icons/downloadV2.svg";
import poIcon from "../assets/icons/confirmed.svg";
import workflowIcon from "../assets/icons/change.svg";
import dashboardIcon from "../assets/icons/indexed.svg";
import aiIcon from "../assets/icons/artificial-intelligence.svg";
import buildIcon from "../assets/icons/edit.svg";
import businessIcon from "../assets/icons/Portfolio_RYZE.png";
import followIcon from "../assets/icons/happy_face.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── AI opportunities RYZE.ai is being shaped around ─────────────────────────
const PROJECTS = [
  {
    tag: "Accounting AI",
    title: "AP Automation Opportunity",
    desc: "Invoices stuck in email, approvals happening in Slack, and coding happening after the fact. RYZE.ai helps turn that messy process into a scoped AI implementation opportunity.",
    stack: ["Document AI", "FastAPI", "Postgres", "React"],
  },
  {
    tag: "Operations AI",
    title: "Time Tracking Workflow",
    desc: "Crews, managers, payroll, and job costing all need clean time data. RYZE.ai helps identify where automation can reduce chasing, rework, and payroll friction.",
    stack: ["Workflow Mapping", "FastAPI", "Postgres", "AI"],
  },
  {
    tag: "Purchasing AI",
    title: "Purchase Order Control",
    desc: "When purchasing happens through texts, emails, and verbal approvals, costs become hard to see. RYZE.ai helps scope PO workflows that bring approval and spend visibility into one place.",
    stack: ["Approvals", "React", "Postgres", "Reporting"],
  },
  {
    tag: "Business Intelligence",
    title: "Internal Reporting Assistant",
    desc: "Many companies have the data, but not the visibility. RYZE.ai helps identify reporting gaps and match them with builders who can create dashboards, admin tools, and AI-assisted summaries.",
    stack: ["Dashboards", "Search", "Summaries", "AI"],
  },
];

const SERVICES = [
  {
    icon: aiIcon,
    title: "AI Opportunity Discovery",
    desc: "Find the places inside a business where AI can realistically save time: documents, approvals, reporting, admin work, search, and repetitive workflows.",
  },
  {
    icon: workflowIcon,
    title: "Workflow Mapping",
    desc: "Translate messy processes into clear implementation opportunities by understanding who touches the workflow, what breaks, and what needs to be improved.",
  },
  {
    icon: businessIcon,
    title: "Company Intelligence",
    desc: "Build practical profiles of companies, industries, software stacks, pain points, and likely AI use cases so outreach is based on real business needs.",
  },
  {
    icon: buildIcon,
    title: "Builder Matching",
    desc: "Match companies with candidates who can actually implement the solution — combining technical ability with business context and domain understanding.",
  },
  {
    icon: dashboardIcon,
    title: "Implementation Roadmaps",
    desc: "Turn vague AI interest into scoped projects with clear workflows, deliverables, data needs, integrations, and the type of builder required.",
  },
  {
    icon: apIcon,
    title: "Practical AI Tools",
    desc: "Focus on useful AI: document parsing, workflow automation, internal search, summaries, admin dashboards, and tools that reduce manual work.",
  },
];

const PROCESS = [
  {
    num: "01",
    title: "Find the business pain",
    desc: "RYZE.ai starts by identifying companies with real workflow problems — the kind of problems hiding in spreadsheets, inboxes, approvals, PDFs, and disconnected systems.",
  },
  {
    num: "02",
    title: "Turn it into an AI opportunity",
    desc: "The problem gets translated into a practical use case: what should be automated, what data is needed, what the workflow should look like, and what outcome matters.",
  },
  {
    num: "03",
    title: "Match the right builder",
    desc: "The platform looks for candidates with the right mix of technical skill, business understanding, and implementation ability — not just keyword matches on a resume.",
  },
  {
    num: "04",
    title: "Build, learn, and improve",
    desc: "Once the project starts, real usage makes the workflow clearer. The software improves, the data gets cleaner, and the AI becomes more useful over time.",
  },
];

const INTENTS = [
  { value: "employer", icon: businessIcon, label: "I want to implement AI" },
  { value: "builder", icon: buildIcon, label: "I can build AI solutions" },
  { value: "following", icon: followIcon, label: "I am following the build" },
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

// ── Hero opportunity showcase (cycling) ─────────────────────────────────────
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
          <RyzeLogo size={12} color="#57a0d3" /> AI Opportunities
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
      setErrorMsg("Enter a valid email.");
      return;
    }
    setStatus("loading");
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
            <a href="#services" className={styles.navLink}>AI Opportunities</a>
            <a href="#process" className={styles.navLink}>Matching Model</a>
            <a href="#work" className={styles.navLink}>Examples</a>
          </nav>
          <div className={styles.navActions}>
            <a href="/auth" className={styles.navSignIn}>Sign In</a>
            <button className={styles.navCta} onClick={scrollToContact}>
              Get in Touch
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
              AI opportunity discovery + builder matching
            </div>
            <h1 className={styles.heroH1}>
              Find AI opportunities inside businesses — and match them with{" "}
              <em className={styles.heroEm}>people who can build them.</em>
            </h1>
            <p className={styles.heroSub}>
              RYZE.ai helps identify practical AI use cases inside real companies —
              from AP automation and reporting to time tracking, document workflows,
              and internal tools — then connects those opportunities with builders who
              can scope, build, and implement the solution.
            </p>
            <div className={styles.heroCtas}>
              <button className={styles.heroCtaPrimary} onClick={scrollToContact}>
                I Need AI Implemented
              </button>
              <a href="#work" className={styles.heroCtaSecondary}>
                See Example Opportunities →
              </a>
            </div>
            <p className={styles.heroStack}>
              Company intelligence · Workflow mapping · AI tools · Builder matching
            </p>
          </div>

          <div className={styles.heroVisual}>
            <ProjectShowcase />
          </div>
        </div>
      </section>

      {/* ── AI Opportunities ─────────────── */}
      <section className={styles.servicesSection} id="services">
        <div className={styles.container}>
          <div className={styles.eyebrow}>AI Opportunities</div>
          <h2 className={styles.sectionH2}>
            Most companies do not need AI hype.<br />
            They need someone to find the workflow worth fixing.
          </h2>

          <div className={styles.servicesGrid}>
            {SERVICES.map((s) => (
              <div key={s.title} className={styles.serviceCard}>
                <div className={styles.serviceIconWrap}>
                  <img src={s.icon} alt="" className={styles.serviceIconImg} />
                </div>
                <h3 className={styles.serviceTitle}>{s.title}</h3>
                <p className={styles.serviceDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Matching Model ────────────────────────────────── */}
      <section className={styles.processSection} id="process">
        <div className={styles.container}>
          <div className={styles.eyebrow}>Matching Model</div>
          <h2 className={styles.sectionH2}>
            Start with the business problem.<br />
            Then match the builder to the work.
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

      {/* ── Work / example opportunities ──────────────────── */}
      <section className={styles.workSection} id="work">
        <div className={styles.container}>
          <div className={styles.eyebrow}>Example Opportunities</div>
          <h2 className={styles.sectionH2}>
            Practical AI projects hiding inside everyday business operations.
          </h2>

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

      {/* ── Contact ────────────────────────────────── */}
      <section className={styles.contactSection} ref={contactRef}>
        <div className={styles.contactInner}>
          <h2 className={styles.contactTitle}>Have a business problem that AI might solve?</h2>
          <p className={styles.contactSub}>
            Tell me what workflow is slowing the business down — invoices, approvals,
            time tracking, reporting, document review, admin work, or anything else.
            Or, if you build AI tools, tell me what kinds of problems you are good at solving.
          </p>

          {status === "success" ? (
            <div className={styles.successState}>
              <div className={styles.successCheck}>✓</div>
              <div>
                <p className={styles.successTitle}>Got it.</p>
                <p className={styles.successSub}>I will review it and reply shortly.</p>
              </div>
            </div>
          ) : (
            <div className={styles.contactForm}>
              <div className={styles.intentRow}>
                {INTENTS.map(({ value, icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.intentBtn} ${intent === value ? styles.intentBtnOn : ""}`}
                    onClick={() => setIntent((v) => (v === value ? null : value))}
                    disabled={status === "loading"}
                  >
                    <img src={icon} alt="" className={styles.intentIconImg} />
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
              <p className={styles.trustLine}>No spam, no AI buzzword funnel — just a real reply.</p>
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
            <a href="#services">AI Opportunities</a>
            <a href="#process">Matching Model</a>
            <a href="#work">Examples</a>
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
