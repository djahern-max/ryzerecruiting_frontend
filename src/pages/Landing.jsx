/* src/pages/Landing.jsx */
//
// Nice ATS landing page. Design/layout unchanged from the RYZE.ai version;
// copy reframed away from "AI product" toward "the ATS recruiting firms use."
//
// The headline is the big faint "hey, nice ATS" (styled by .heroH1 in the CSS);
// it is a real <h1> so screen readers and search engines still get a heading.
//
// TODO (rebrand task): VIDEO_URL / POSTER_URL / FULL_VIDEO_URL still point at
// the RYZE commercial in the old `ryzerecruiting` DO Spaces bucket. Replace with
// the new "Hey, nice ATS" spot when it exists; until then the section renders the
// old video.

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import posthog from "posthog-js";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Landing.module.css";

const VIDEO_URL =
  "https://ryzerecruiting.nyc3.cdn.digitaloceanspaces.com/Demo_Video/Commercial_2_V3.mp4";
const POSTER_URL =
  "https://ryzerecruiting.nyc3.cdn.digitaloceanspaces.com/Demo_Video/image1.png";
const FULL_VIDEO_URL =
  "https://ryzerecruiting.nyc3.cdn.digitaloceanspaces.com/Demo_Video/THE_ABSOLUTE_FINAL_VERSION_New_Intro_Song.mp4";

// Icons (existing assets)
import matchIcon from "../assets/icons/matched_opportunity.svg";
import calendarIcon from "../assets/icons/calendar.svg";
import downloadIcon from "../assets/icons/downloadV2.svg";

// Questions a recruiter at a firm actually asks their pipeline.
const DEMO_QUERIES = [
  {
    q: "Who do we have for the senior accountant role at Harbor Marine?",
    a: "3 matches: Dana Okafor (CPA, 7 yrs, manufacturing), Luis Carvalho (month-end close + NetSuite), Priya Nair (open now). Two have talked to us in the last 30 days.",
  },
  {
    q: "What did Mark at Harbor Marine say on last week's call about salary range?",
    a: "From the Oct 28 call: budget is $85–95K, flexible to $100K for a CPA. He wants someone in-seat before the January close.",
  },
  {
    q: "Which candidates haven't been contacted in over 60 days?",
    a: "14 candidates. 6 were in process for roles that closed. Want me to draft a check-in note for the 8 who were active?",
  },
];

const PROOF_POINTS = [
  {
    icon: matchIcon,
    title: "Matching that reads the resume",
    desc: "Candidates ranked against the job order by what it actually asks for, not keyword hits.",
  },
  {
    icon: calendarIcon,
    title: "Scheduling built in",
    desc: "Zoom + Google Calendar booking for candidates and clients, with automatic reminders.",
  },
  {
    icon: downloadIcon,
    title: "Submittals in one click",
    desc: "Branded candidate PDFs ready to send to the hiring manager.",
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

// ── Animated pipeline-search demo (light theme) ─────────────────────────────
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
        <span className={styles.demoWindowTitle}>Ask your pipeline</span>
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
            <div className={styles.demoMsgLabel}>Nice</div>
            <div className={styles.demoThinking}>
              <span /><span /><span />
            </div>
          </div>
        )}
        {displayA && (
          <div className={styles.demoMsgAi}>
            <div className={styles.demoMsgLabel}>Nice</div>
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

// ── Demo video (hero centerpiece) ───────────────────────────────────────────
function VideoSection() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const playedOnceRef = useRef(false);

  const handlePlay = () => {
    setPlaying(true);
    if (!playedOnceRef.current) {
      playedOnceRef.current = true;
      posthog.capture("demo_video_played");
    }
  };

  return (
    <div className={styles.previewWrap}>
      <div className={styles.previewGlow} aria-hidden="true" />
      <div className={styles.videoFrame}>
        <video
          ref={videoRef}
          className={styles.video}
          controls={playing}
          poster={POSTER_URL}
          preload="metadata"
          playsInline
          onPlay={handlePlay}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        {!playing && (
          <button
            type="button"
            className={styles.videoPlayButton}
            aria-label="Play demo video"
            onClick={() => videoRef.current?.play()}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
      <div>
        <a
          href={FULL_VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.fullDemoLink}
          onClick={() => posthog.capture("full_demo_video_clicked")}
        >
          Prefer the full walkthrough? Watch the extended demo →
        </a>
      </div>
    </div>
  );
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
            <span className={styles.brandDesktop}>
              <span className={styles.wordmark}>nice</span>
              <TypewriterTag text="APPLICANT TRACKING SYSTEM" />
            </span>
            <span className={styles.brandMobile}>
              nice<span className={styles.brandMobileAi}>ATS</span>
            </span>
          </a>
          <div className={styles.navActions}>
            <a href="/auth" className={styles.navSignIn}>Sign in</a>
            <a href="/signup" className={styles.navCta}>Start free trial</a>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <main className={styles.hero}>
        <h1 className={styles.heroH1}>hey, nice ATS</h1>

        <p className={styles.heroSub}>
          Candidates, clients, job orders, and every call you've had with them,
          in one place. The ATS built for recruiting firms.
        </p>

        {/* ── Primary conversion CTA ────────────────── */}
        <div className={styles.heroCtas}>
          <a href="/signup" className={styles.ctaPrimary}>Start Your 60-Day Free Trial</a>
          <p className={styles.ctaSub}>60 days free · $20/month after · No credit card required.</p>
          <a href="/demo" className={styles.ctaSecondary}>Request a demo</a>
        </div>

        <VideoSection />
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

      {/* ── Pipeline search preview (below the fold) ─ */}
      <section className={styles.chatSection}>
        <h2 className={styles.chatSectionTitle}>Ask your pipeline a question</h2>
        <p className={styles.chatSectionSub}>
          Every resume, job order, and call transcript is searchable. Ask in plain English.
        </p>
        <div className={styles.previewWrap}>
          <div className={styles.previewGlow} aria-hidden="true" />
          <DemoChat />
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.wordmarkSm}>
              nice<span className={styles.wordmarkSmAccent}>ATS</span>
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