import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import styles from "./Landing.module.css";

function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.user_type === "employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className={`${styles.page} ryzeGridBg`}>
      <header className={styles.header}>
        <div className={`ryzeContainer ${styles.headerInner}`}>
          <div className={styles.brand}>
            <span className={styles.brandText}>RYZE Recruiting</span>
          </div>

          <nav className={styles.nav} aria-label="Primary">
            <button
              className={styles.navLink}
              onClick={() => navigate("/auth?type=employer")}
            >
              For Employers
            </button>
            <button
              className={styles.navLink}
              onClick={() => navigate("/auth?type=candidate")}
            >
              For Candidates
            </button>
          </nav>
        </div>
      </header>

      <main className={`ryzeContainer ${styles.main}`}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Strategic Hiring for{" "}
            <span className={styles.titleEmphasis}>
              Accounting &amp; Finance Roles
            </span>
          </h1>

          <p className={styles.subtitle}>
            We connect companies with talent that drives growth.
          </p>

          {/* Hide these on mobile (non-functional, clutter) */}
          <div className={styles.linksRow} aria-hidden="true">
            <span className="ryzeUnderlineLink">Accounting</span>
            <span className="ryzeUnderlineLink">Finance</span>
            <span className="ryzeUnderlineLink">Talent strategy</span>
            <span className="ryzeUnderlineLink">Business operations</span>
          </div>

          <div className={styles.ctaRow}>
            <div className={styles.ctaCard}>
              <div className={styles.ctaLabel}>Employers</div>
              <h3 className={styles.ctaTitle}>Post Your Position</h3>
              <p className={styles.ctaText}>
                Connect with vetted accounting &amp; finance professionals.
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
                Discover opportunities aligned with your expertise.
              </p>
              <button
                className={`ryzeBtn ryzeBtnPrimary ${styles.ctaButton}`}
                onClick={() => navigate("/auth?type=candidate")}
              >
                Explore Jobs →
              </button>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>© 2026 RYZE Recruiting. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default Landing;
