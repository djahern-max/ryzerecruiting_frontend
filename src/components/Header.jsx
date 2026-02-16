/*src/components/Header.jsx*/
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