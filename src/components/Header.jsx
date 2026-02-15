/*src/components/Header.jsx*/
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/RYZE_LOGO.png";
import styles from "./Header.module.css";

function Header({ variant = "landing", showNav = true }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogoClick = () => {
    if (user) {
      // Navigate to appropriate dashboard if logged in
      if (user.user_type === "employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } else {
      // Navigate to landing if not logged in
      navigate("/");
    }
  };

  return (
    <header className={styles.header}>
      <div className={`ryzeContainer ${styles.headerInner}`}>
        <div className={styles.brand} onClick={handleLogoClick} role="button" tabIndex={0}>
          <img src={logo} alt="RYZE Logo" className={styles.logo} />
          <span className={styles.brandText}>
            <span className={styles.brandRyze}>RYZE</span> <span className={styles.brandRecruiting}>Recruiting</span>
          </span>
        </div>

        {showNav && (
          <nav className={styles.nav} aria-label="Primary">
            {variant === "landing" && (
              <>
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
              </>
            )}

            {variant === "dashboard" && user && (
              <>
                <span className={styles.userInfo}>
                  {user.email}
                </span>
                <button
                  className={styles.navLink}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}

            {variant === "auth" && (
              <button
                className={styles.navLink}
                onClick={() => navigate("/")}
              >
                ← Back to Home
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;