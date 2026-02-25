/* src/components/Header.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Header.module.css";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogoClick = () => {
    if (user) {
      if (user.user_type === "ADMIN") {
        navigate("/admin");
      } else if (user.user_type === "EMPLOYER") {
        navigate("/employer/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.logo} onClick={handleLogoClick}>
          RYZE Recruiting
        </h1>
        <div className={styles.userInfo}>
          {user && (
            <>
              <span className={styles.userName}>
                {user.full_name || user.email}
              </span>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
