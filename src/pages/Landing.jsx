/* src/pages/Landing.jsx */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Landing.module.css";

// Icons (existing assets)
import aiIcon from "../assets/icons/artificial-intelligence.svg";
import calendarIcon from "../assets/icons/calendar.svg";
import downloadIcon from "../assets/icons/downloadV2.svg";

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

// ── Typewriter tagline ──────────────────────────────────────────────────────
function TypewriterTag({ text }) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 70);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className={styles.wordmarkTag}>
      {display}
      {display.length < text.length && <span className={styles.tagCursor}>|</span>}
    </span>
  );
}

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

// Feature 2 drops the demo video in here — intentionally empty for now, so
// visitors see nothing unfinished; swap the null return for real markup then.
function VideoSection() {
  return null;
}

// ── Main landing page ───────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      if (user.user_type === "ADMIN") navigate("/admin");
      else if (user.user_type === "EMPLOYER") navigate("/employer/dashboard");
      else navigate("/candidate/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className={styles.page}>

      {/* ── Navigation ─────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a href="/" className={styles.navBrand}>
            <span className={styles.wordmark}>AI</span>
            <TypewriterTag text="FOR RECRUITERS" />
          </a>
          <div className={styles.navActions}>
            <a href="/auth" className={styles.navSignIn}>Sign in</a>
            <a href="/signup" className={styles.navCta}>Start free trial</a>
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

        {/* ── Primary conversion CTA ────────────────── */}
        <div className={styles.heroCtas}>
          <a href="/signup" className={styles.ctaPrimary}>Start Your 60-Day Free Trial</a>
          <p className={styles.ctaSub}>60 days free · $20/month after · No credit card required.</p>
          <a href="/demo" className={styles.ctaSecondary}>Request a demo</a>
        </div>

        <VideoSection />

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
            <a href="/demo">Request a demo</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}