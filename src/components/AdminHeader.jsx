/* src/components/AdminHeader.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./AdminHeader.module.css";

export default function AdminHeader({ active }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const NAV = [
        { key: "dashboard", label: "Dashboard", icon: "fi-rr-apps", path: "/admin" },
        { key: "employers", label: "Employers", icon: "fi-rr-building", path: "/admin/employers" },
        { key: "candidates", label: "Candidates", icon: "fi-rr-users", path: "/admin/candidates" },
        { key: "intelligence", label: "Intelligence", icon: "fi-rr-brain", path: "/admin/chat" },
        { key: "reports", label: "Reports", icon: "fi-rr-chart-histogram", path: null },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>

                <div className={styles.headerLeft}>
                    <span className={styles.logo} onClick={() => navigate("/admin")}>RYZE.ai</span>
                    <span className={styles.adminBadge}>ADMIN</span>
                </div>

                <nav className={styles.nav}>
                    {NAV.map(({ key, label, icon, path }) => {
                        const isActive = active === key;
                        const isSoon = !path;
                        return (
                            <button
                                key={key}
                                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""} ${isSoon ? styles.navLinkSoon : ""}`}
                                onClick={() => path && navigate(path)}
                                disabled={isSoon}
                            >
                                <i className={`fi ${icon}`} />
                                {label}
                            </button>
                        );
                    })}
                </nav>

                <div className={styles.headerRight}>
                    <span className={styles.userName}>{user?.full_name}</span>
                    <button className={styles.logoutBtn} onClick={logout} title="Logout">
                        <i className="fi fi-rr-exit" />
                    </button>
                </div>

            </div>
        </header>
    );
}