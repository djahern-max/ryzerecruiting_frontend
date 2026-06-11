/* src/pages/Landing.jsx */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Landing.module.css";
import ryzeLogo from "../assets/RYZE_LOGO.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/* ── Custom inline SVG icons ──────────────────────────────────────────────
   Hand-rolled, 24×24, stroke-based — no icon library dependency.        */
const iconProps = (size) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  width: size,
  height: size,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
});

const IconCode = ({ size = 24, className }) => (
  <svg {...iconProps(size)} className={className}>
    <polyline points="8 6 3 12 8 18" />
    <polyline points="16 6 21 12 16 18" />
    <line x1="13.5" y1="4.5" x2="10.5" y2="19.5" />
  </svg>
);

const IconGrid = ({ size = 24, className }) => (
  <svg {...iconProps(size)} className={className}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="10" width="8" height="11" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

const IconSpark = ({ size = 24, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
  </svg>
);

const IconFlow = ({ size = 24, className }) => (
  <svg {...iconProps(size)} className={className}>
    <rect x="3" y="4" width="6" height="6" rx="1.5" />
    <rect x="15" y="14" width="6" height="6" rx="1.5" />
    <path d="M9 7h5a3 3 0 0 1 3 3v4" />
    <polyline points="14.5 11.5 17 14 19.5 11.5" />
  </svg>
);

const IconKey = ({ size = 24, className }) => (
  <svg {...iconProps(size)} className={className}>
    <circle cx="8" cy="14" r="4.5" />
    <path d="M11.5 10.5L20 2" />
    <path d="M16.5 5.5L19.5 8.5" />
    <path d="M14 8l2 2" />
  </svg>
);

const IconShield = ({ size = 24, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3z" />
    <polyline points="9 12 11.2 14.2 15.5 9.5" />
  </svg>
);

const IconHammer = ({ size = 24, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M14.5 4.5l5 5-2 2-5-5 2-2z" />
    <path d="M13 8L4 17a1.8 1.8 0 0 0 0 2.5v0a1.8 1.8 0 0 0 2.5 0l9-9" />
    <path d="M16 3l5 5" />
  </svg>
);

const IconBriefcase = ({ size = 24, className }) => (
  <svg {...iconProps(size)} className={className}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    <path d="M3 12h18" />
  </svg>
);

const IconBulb = ({ size = 24, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1.3 1.5 1.5 2.5h5c.2-1 .7-1.8 1.5-2.5A6 6 0 0 0 12 3z" />
  </svg>
);

// ── Hero showcase: current builds in the pipeline ───────────────────────────
const PROJECTS = [
  {
    tag: "Operations",
    title: "Time Tracking App",
    desc: "Time and resource tracking designed around an existing operations workflow — instead of forcing the team into a new one.",
    stack: ["FastAPI", "Postgres", "React"],
  },
  {
    tag: "Finance Automation",
    title: "AP Automation",
    desc: "Accounts payable without the manual grind — invoice capture, approval routing, and payment prep wired into the actual close process.",
    stack: ["FastAPI", "Postgres", "React", "Claude"],
  },
  {
    tag: "Risk & Insurance",
    title: "Workers' Comp Cost Mitigation",
    desc: "A tool that tracks claims, classifications, and experience-mod drivers to surface where premiums can actually be reduced.",
    stack: ["FastAPI", "Postgres", "React"],
  },
];

const SERVICES = [
  {
    icon: IconShield,
    title: "Vetted Builders",
    desc: "Every builder on the platform is invited based on software they've actually shipped — proof of work, not promises.",
  },
  {
    icon: IconCode,
    title: "Custom Applications",
    desc: "Full applications built around a real workflow — not a template the business has to bend itself to fit.",
  },
  {
    icon: IconGrid,
    title: "Internal Tools & Dashboards",
    desc: "The admin panels, trackers, and dashboards a team needs but can't buy off the shelf.",
  },
  {
    icon: IconSpark,
    title: "AI Integration",
    desc: "Semantic search, RAG, document parsing, and LLM features wired into real workflows — not bolted on as a gimmick.",
  },
  {
    icon: IconFlow,
    title: "Automation & Workflows",
    desc: "Scheduling, notifications, webhooks, and pipelines that remove the manual steps eating a team's time.",
  },
  {
    icon: IconKey,
    title: "The Business Owns the Code",
    desc: "No per-seat SaaS rent. The software belongs to the company that paid for it — deployed, documented, and handed over.",
  },
];

const PROCESS = [
  {
    num: "01",
    title: "Builders prove it",
    desc: "Invitations go to people who can demonstrably build professional custom software — shipped products, not keyword-stuffed resumes.",
  },
  {
    num: "02",
    title: "A profile is created",
    desc: "Each builder gets a profile showcasing what they've built, how they work, and what they're ready to take on next.",
  },
  {
    num: "03",
    title: "Employers bring the work",
    desc: "Businesses describe what they need built. Projects are matched to the builder whose track record actually fits.",
  },
  {
    num: "04",
    title: "The work flows",
    desc: "As work comes in from the employer side, everyone involved stays busy — and every project shipped strengthens a builder's profile.",
  },
];

const INTENTS = [
  { value: "builder", icon: IconHammer, label: "I build software" },
  { value: "employer", icon: IconBriefcase, label: "I need software built" },
  { value: "following", icon: IconBulb, label: "Just following along" },
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
            <a href="#services" className={styles.navLink}>What Gets Built</a>
            <a href="#process" className={styles.navLink}>How It Works</a>
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
              Invite-only · Proven builders
            </div>
            <h1 className={styles.heroH1}>
              Software built by people who've{" "}
              <em className={styles.heroEm}>actually&nbsp;shipped.</em>
            </h1>
            <p className={styles.heroSub}>
              An invite-only network of builders who can deliver professional
              custom software — matched with businesses that have real work to
              be done.
            </p>
            <div className={styles.heroCtas}>
              <button className={styles.heroCtaPrimary} onClick={scrollToContact}>
                Get in Touch
              </button>
              <a href="#work" className={styles.heroCtaSecondary}>
                See Current Builds →
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

      {/* ── What Gets Built (services) ─────────────── */}
      <section className={styles.servicesSection} id="services">
        <div className={styles.container}>
          <div className={styles.eyebrow}>What Gets Built</div>
          <h2 className={styles.sectionH2}>
            Software shaped to the business,<br />
            not the other way around.
          </h2>

          <div className={styles.servicesGrid}>
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className={styles.serviceCard}>
                  <div className={styles.serviceIconWrap}>
                    <Icon className={styles.serviceIcon} size={24} />
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
            Proven builders on one side.<br />
            Real projects on the other.
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
          <h2 className={styles.sectionH2}>Real projects, in the pipeline now.</h2>

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

      {/* ── Why RYZE band ──────────────────────────── */}
      <section className={styles.operatorSection}>
        <div className={styles.operatorInner}>
          <div className={styles.operatorEyebrow}>Why RYZE</div>
          <h2 className={styles.operatorTitle}>
            Resumes don't ship software.
            Shipped software does.
          </h2>
          <p className={styles.operatorText}>
            Builders are invited based on what they've actually built, then that
            proof is put in front of businesses with real work. No
            keyword-matched resumes, no agencies marking up junior talent — just
            a direct line between people who can build professional custom
            software and the companies that need it built.
          </p>
          <div className={styles.operatorSig}>
            Proof of work · Direct matches · No middle layers
          </div>
        </div>
      </section>

      {/* ── Contact ────────────────────────────────── */}
      <section className={styles.contactSection} ref={contactRef}>
        <div className={styles.contactInner}>
          <h2 className={styles.contactTitle}>Build, or get something built.</h2>
          <p className={styles.contactSub}>
            Builders: show what's been shipped. Employers: describe what's
            needed. Either way, leave an email below and expect a real reply.
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
                {INTENTS.map(({ value, icon: Icon, label }) => (
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
              <p className={styles.trustLine}>No spam, no sales funnel — just a reply.</p>
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
            <a href="#services">What Gets Built</a>
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