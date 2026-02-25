/* src/pages/Landing.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import styles from "./Landing.module.css";

function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.user_type === "ADMIN") navigate("/admin");
      else if (user.user_type === "EMPLOYER") navigate("/employer/dashboard");
      else navigate("/candidate/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className={`${styles.page} ryzeBannerBg`}>

      {/* ── Minimal landing header ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.logo}>RYZE Recruiting</span>
          <button
            className={styles.signInLink}
            onClick={() => navigate("/auth")}
          >
            Sign in
          </button>
        </div>
      </header>

      <main className={`ryzeContainer ${styles.main}`}>
        <section className={styles.hero}>

          <h1 className={styles.title}>
            Recruiting built for{" "}
            <span className={styles.titleEmphasis}>
              Accounting &amp; Finance
            </span>
          </h1>

          <p className={styles.subtitle}>
            Specialized recruiting from someone who speaks your language.
          </p>

          <div className={styles.ctaRow}>
            <div className={styles.ctaCard}>
              <div className={styles.ctaLabel}>Employers</div>
              <h3 className={styles.ctaTitle}>Fill Your Open Role</h3>
              <p className={styles.ctaText}>
                Tell us what you need. We'll surface candidates who actually fit — screened on technical skills, not just keywords.
              </p>
              <button
                className={`ryzeBtn ryzeBtnPrimary ${styles.ctaButton}`}
                onClick={() => navigate("/auth?type=employer")}
              >
                Get Started →
              </button>
            </div>

            <div className={styles.ctaCard}>
              <div className={styles.ctaLabel}>Candidates</div>
              <h3 className={styles.ctaTitle}>Find Your Next Role</h3>
              <p className={styles.ctaText}>
                Work with a recruiter who understands your background and won't waste your time on roles that don't fit.
              </p>
              <button
                className={`ryzeBtn ryzeBtnPrimary ${styles.ctaButton}`}
                onClick={() => navigate("/auth?type=candidate")}
              >
                Browse Roles →
              </button>
            </div>
          </div>

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