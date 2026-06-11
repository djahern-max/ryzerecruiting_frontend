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

// ── Current business problems RYZE.ai is being shaped around ───────────────────────────
const PROJECTS = [
  {
    tag: "Operations",
    title: "Time Tracking App",
    desc: "A simple way for teams to track time, review hours, approve work, and make payroll easier without chasing spreadsheets or screenshots.",
    stack: ["FastAPI", "Postgres", "React"],
  },
  {
    tag: "Accounting",
    title: "AP Automation",
    desc: "Invoice intake, vendor review, approvals, coding, and payment prep built around how the accounting process actually works.",
    stack: ["FastAPI", "Postgres", "React", "AI"],
  },
  {
    tag: "Purchasing",
    title: "Purchase Order System",
    desc: "A clean PO workflow for requests, approvals, vendor orders, receiving, and visibility before money is already out the door.",
    stack: ["FastAPI", "Postgres", "React"],
  },
];

const SERVICES = [
  {
    icon: workflowIcon,
    title: "Workflow Apps",
    desc: "Custom tools for the messy internal processes that do not fit neatly inside QuickBooks, payroll software, or spreadsheets.",
  },
  {
    icon: timeIcon,
    title: "Time Tracking",
    desc: "Crew, employee, manager, and payroll workflows built around how time is actually captured and approved.",
  },
  {
    icon: apIcon,
    title: "AP Automation",
    desc: "Invoice capture, routing, coding, approvals, and payment prep designed to reduce duplicate entry and confusion.",
  },
  {
    icon: poIcon,
    title: "PO Systems",
    desc: "Purchase requests, approvals, vendor tracking, receiving, and budget visibility without making the process harder than it needs to be.",
  },
  {
    icon: dashboardIcon,
    title: "Dashboards & Admin Tools",
    desc: "The internal screens, reports, and trackers a business needs but usually cannot buy off the shelf.",
  },
  {
    icon: aiIcon,
    title: "Practical AI Features",
    desc: "Document parsing, search, summaries, and workflow assistance where AI saves time instead of being added as a buzzword.",
  },
];

const PROCESS = [
  {
    num: "01",
    title: "Start with the real problem",
    desc: "The first step is understanding the workflow, who touches it, where things break down, and what the business actually needs to see.",
  },
  {
    num: "02",
    title: "Build the simplest useful version",
    desc: "The goal is not to create a bloated platform. It is to build a clean tool that solves the highest-friction part of the process first.",
  },
  {
    num: "03",
    title: "Connect it to the business",
    desc: "Users, approvals, notifications, exports, documents, and reporting are added around the way the team already operates.",
  },
  {
    num: "04",
    title: "Improve it from real use",
    desc: "Once people use it, the software gets better. The workflow becomes clearer, the data gets cleaner, and the tool becomes more valuable.",
  },
];

const INTENTS = [
  { value: "employer", icon: businessIcon, label: "I need custom software" },
  { value: "builder", icon: buildIcon, label: "I have a workflow problem" },
  { value: "following", icon: followIcon, label: "Just following along" },
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
          <RyzeLogo size={12} color="#57a0d3" /> Current Builds
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
            <a href="#services" className={styles.navLink}>Use Cases</a>
            <a href="#process" className={styles.navLink}>Approach</a>
            <a href="#work" className={styles.navLink}>Current Builds</a>
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
              Practical software for real business workflows
            </div>
            <h1 className={styles.heroH1}>
              Custom software for{" "}
              <em className={styles.heroEm}>messy&nbsp;business processes.</em>
            </h1>
            <p className={styles.heroSub}>
              RYZE.ai helps businesses replace spreadsheets, email threads,
              and clunky workflows with simple internal tools built around how
              the team actually works.
            </p>
            <div className={styles.heroCtas}>
              <button className={styles.heroCtaPrimary} onClick={scrollToContact}>
                Get in Touch
              </button>
              <a href="#work" className={styles.heroCtaSecondary}>
                See Practical Examples →
              </a>
            </div>
            <p className={styles.heroStack}>
              Python · FastAPI · Postgres · React · AI
            </p>
          </div>

          <div className={styles.heroVisual}>
            <ProjectShowcase />
          </div>
        </div>
      </section>

      {/* ── Use Cases (services) ─────────────── */}
      <section className={styles.servicesSection} id="services">
        <div className={styles.container}>
          <div className={styles.eyebrow}>Use Cases</div>
          <h2 className={styles.sectionH2}>
            Internal tools for the work that<br />
            off-the-shelf software does not handle well.
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

      {/* ── Process ────────────────────────────────── */}
      <section className={styles.processSection} id="process">
        <div className={styles.container}>
          <div className={styles.eyebrow}>Approach</div>
          <h2 className={styles.sectionH2}>
            Start with the workflow.<br />
            Then build the software around it.
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

      {/* ── Work / current builds ──────────────────── */}
      <section className={styles.workSection} id="work">
        <div className={styles.container}>
          <div className={styles.eyebrow}>Current Builds</div>
          <h2 className={styles.sectionH2}>Practical examples from real business needs.</h2>

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
          <h2 className={styles.contactTitle}>Have a workflow that needs software?</h2>
          <p className={styles.contactSub}>
            Describe the process that is slowing your team down. Time tracking, AP, purchase orders, reporting, approvals — whatever it is, start with the real problem.
          </p>

          {status === "success" ? (
            <div className={styles.successState}>
              <div className={styles.successCheck}>✓</div>
              <div>
                <p className={styles.successTitle}>Got it.</p>
                <p className={styles.successSub}>Expect a reply shortly.</p>
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
              <p className={styles.trustLine}>No spam, no sales funnel — just a real reply.</p>
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
            <a href="#services">Use Cases</a>
            <a href="#work">Current Builds</a>
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