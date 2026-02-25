/* src/pages/Landing.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import Header from "../components/Header";
import styles from "./Landing.module.css";

function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.user_type === "ADMIN") {
        navigate("/admin");
      } else if (user.user_type === "EMPLOYER") {
        navigate("/employer/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className={`${styles.page} ryzeBannerBg`}>
      <Header variant="landing" showNav={true} />

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
                onClick={() => navigate("/auth")}
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
                onClick={() => navigate("/auth")}
              >
                Explore Jobs →
              </button>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>© 2026 RYZE Recruiting. All rights reserved.</p>
          <a href="/admin/login" className={styles.adminAccess}>
            Admin
          </a>
        </footer>
      </main>
    </div>
  );
}

export default Landing;
