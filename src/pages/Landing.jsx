/* src/pages/Landing.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import styles from "./Landing.module.css";
import underConstructionIcon from "../assets/icons/under-construction.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      if (user.user_type === "ADMIN") navigate("/admin");
      else if (user.user_type === "EMPLOYER") navigate("/employer/dashboard");
      else navigate("/candidate/dashboard");
    }
  }, [user, navigate]);

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  async function handleSubmit() {
    setErrorMsg("");
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok || res.status === 409) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.detail || "Something went wrong. Please try again.");
        setStatus("idle");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className={`${styles.page} ryzeBannerBg`}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.logo}>RYZE Recruiting</span>
        </div>
      </header>

      <main className={`ryzeContainer ${styles.main}`}>
        <section className={styles.hero}>

          {/* ── Under Construction Icon ── */}
          <img
            src={underConstructionIcon}
            alt=""
            className={styles.constructionIcon}
          />

          {/* ── Headline ── */}
          <h1 className={styles.title}>
            <span className={styles.titleEmphasis}>Accounting & Finance</span>{" "}
            Recruiting, Done Right.
          </h1>

          <p className={styles.subtitle}>
            Specialized recruiting from someone who speaks your language.
            Be the first to know when we launch.
          </p>

          {/* ── Email Capture ── */}
          {status === "success" ? (
            <div className={styles.successBox}>
              <img
                src={underConstructionIcon}
                alt=""
                style={{ width: "2rem", height: "2rem", flexShrink: 0 }}
              />
              <div>
                <p className={styles.successTitle}>You're on the list.</p>
                <p className={styles.successSub}>We'll be in touch when we launch.</p>
              </div>
            </div>
          ) : (
            <div className={styles.captureWrapper}>
              <div className={styles.inputRow}>
                <input
                  className={`${styles.emailInput} ${errorMsg ? styles.inputError : ""}`}
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                  onKeyDown={handleKeyDown}
                  disabled={status === "loading"}
                  autoComplete="email"
                />
                <button
                  className={`ryzeBtn ryzeBtnPrimary ${styles.notifyBtn}`}
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>Notify Me &rarr;</>
                  )}
                </button>
              </div>
              {errorMsg && (
                <p className={styles.errorMsg}>{errorMsg}</p>
              )}
            </div>
          )}

          {/* ── Trust line ── */}
          <p className={styles.trustLine}>
            No spam. No pressure. Just a heads-up when we open the doors.
          </p>

        </section>

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <a href="/privacy" className={styles.footerLink}>Privacy</a>
            <a href="/terms" className={styles.footerLink}>Terms</a>
          </div>
          <p className={styles.copyright}>© 2026 RYZE Recruiting</p>
          <a href="/admin/login" className={styles.adminAccess}>Admin</a>
        </footer>
      </main>
    </div>
  );
}

export default Landing;