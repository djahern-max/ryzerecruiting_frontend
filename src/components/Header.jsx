/* src/components/Header.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Header.module.css";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isFirmTenant = Boolean(user?.tenant_id) && user.tenant_id !== 'ryze';

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogoClick = () => {
    if (!user) { navigate("/"); return; }
    if (user.user_type === "ADMIN") navigate("/admin");
    else if (user.user_type === "EMPLOYER") navigate("/employer/dashboard");
    else navigate("/candidate/dashboard");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>

        <div className={styles.headerLeft}>
          <div className={styles.logoGroup} onClick={handleLogoClick}>
            <span className={styles.logo}>
              {user?.tenant_brand_name || 'RYZE.ai'}
            </span>
            {isFirmTenant && (
              <span className={styles.poweredBy}>powered by RYZE</span>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          {user && (
            <>
              <span className={styles.userName}>
                {user.full_name || user.email}
              </span>
              <button
                className={styles.settingsBtn}
                onClick={() => navigate('/settings')}
                title="Account Settings"
              >
                <i className="fi fi-rr-settings" />
              </button>
              <button
                className={styles.logoutBtn}
                onClick={handleLogout}
                title="Logout"
              >
                <i className="fi fi-rr-exit" />
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;