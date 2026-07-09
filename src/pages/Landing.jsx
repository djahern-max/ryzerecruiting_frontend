/* src/pages/Landing.jsx */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Building2, BriefcaseBusiness, Binoculars } from "lucide-react";
import styles from "./Landing.module.css";

// Icons (existing assets)
import aiIcon from "../assets/icons/artificial-intelligence.svg";
import calendarIcon from "../assets/icons/calendar.svg";
import downloadIcon from "../assets/icons/downloadV2.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DEMO_QUERIES = [
  {
    q: "Who can build AP automation for a QuickBooks user receiving 100 invoices a day through Gmail?",
    a: "3 matches: Sarah Chen (QuickBooks + Gmail API, 6 integrations), Marcus Webb (invoice OCR & approval routing), Priya Nair (open now). Avg start: 2 weeks.",
  },
  {
    q: "Who can build a time-tracking app with geofencing and biometric login for remote construction crews?",
    a: "2 strong matches: Devon Hale (two field-service apps, GPS geofencing) and Ana Reyes (biometric login + payroll integrations). Portfolios on file.",
  },
  {
    q: "Who can build a PO system that gives a construction company visibility into equipment repair and maintenance schedules?",
    a: "4 builders matched. Two have built PO + asset-tracking systems; one tied maintenance scheduling directly into QuickBooks. Avg start: 2–3 weeks.",
  },
];

const PROOF_POINTS = [
  {
    icon: aiIcon,
    title: "Semantic matching",
    desc: "Candidates ranked against job orders by meaning, not keywords.",
  },
  {
    icon: calendarIcon,
    title: "Scheduling built in",
    desc: "Zoom + Google Calendar booking with automatic reminders.",
  },
  {
    icon: downloadIcon,
    title: "Branded PDFs",
    desc: "One-click exports ready to send to hiring managers.",
  },
];

const INTENT_OPTIONS = [
  { value: "solo", icon: BriefcaseBusiness, label: "Solo recruiter" },
  { value: "firm", icon: Building2, label: "Recruiting firm" },
  { value: "following", icon: Binoculars, label: "Just following along" },
];

// ── Animated intelligence demo (light theme) ────────────────────────────────
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
                setTimeout(() => setIdx((i) => (i + 1) % DEMO_QUERIES.length), 500);
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
            <div className={styles.demoMsgLabel}>RYZE</div>
            <div className={styles.demoThinking}>
              <span /><span /><span />
            </div>
          </div>
        )}
        {displayA && (
          <div className={styles.demoMsgAi}>
            <div className={styles.demoMsgLabel}>RYZE</div>
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
  const formRef = useRef(null);

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
          <a href="/" className={styles.navBrand}>
            <span className={styles.wordmark}>
              RYZE
            </span>
          </a>
          <div className={styles.navActions}>

            <a href="/auth" className={styles.navSignIn}>Sign in</a>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <main className={styles.hero}>
        <h1 className={styles.heroH1}>
          Recruiting, with the busywork
          <span className={styles.heroAccent}> handled by AI.</span>
        </h1>
        <p className={styles.heroSub}>
          Turn every call, resume, and job order into searchable
          recruiting intelligence.
        </p>

        {/* Email capture, right in the hero */}
        <div className={styles.heroForm} ref={formRef}>
          {wlStatus === "success" ? (
            <div className={styles.successState}>
              <div className={styles.successCheck}>✓</div>
              <div>
                <p className={styles.successTitle}>You're on the list.</p>
                <p className={styles.successSub}>We'll reach out when RYZE is ready for you.</p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.intentRow}>
                {INTENT_OPTIONS.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.intentBtn} ${intent === value ? styles.intentBtnOn : ""}`}
                    onClick={() => setIntent((v) => (v === value ? null : value))}
                    disabled={wlStatus === "loading"}
                  >
                    <Icon size={15} />
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
                  disabled={wlStatus === "loading"}
                  onKeyDown={(e) => e.key === "Enter" && handleWaitlist()}
                />
                <button
                  className={styles.notifyBtn}
                  onClick={handleWaitlist}
                  disabled={wlStatus === "loading"}
                >
                  {wlStatus === "loading" ? <span className={styles.spinner} /> : "Get early access"}
                </button>
              </div>

              {errorMsg && <p className={styles.errMsg}>{errorMsg}</p>}
              <p className={styles.trustLine}>
                Early access for recruiting firms. No spam, ever.
              </p>
            </>
          )}
        </div>

        {/* ── App preview (the centerpiece) ────────── */}
        <div className={styles.previewWrap}>
          <div className={styles.previewGlow} aria-hidden="true" />
          <DemoChat />
        </div>
      </main>

      {/* ── Proof row ──────────────────────────────── */}
      <section className={styles.proofSection}>
        <div className={styles.proofGrid}>
          {PROOF_POINTS.map((p) => (
            <div key={p.title} className={styles.proofItem}>
              <img src={p.icon} alt="" className={styles.proofIcon} />
              <div>
                <h3 className={styles.proofTitle}>{p.title}</h3>
                <p className={styles.proofDesc}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.wordmarkSm}>
              RYZE
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className={styles.footerLinks}>
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
        </div>
      </footer>
    </div>
  );
}