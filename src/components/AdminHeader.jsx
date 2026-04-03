/* src/components/AdminHeader.jsx */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./AdminHeader.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function TrialBadge() {
    const [billing, setBilling] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch(`${API_BASE}/api/billing/status`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => setBilling(data))
            .catch(() => null);
    }, []);

    if (!billing || billing.status === "active") return null;

    const days = billing.days_remaining ?? 0;
    const urgent = days <= 7;

    return (
        <span className={`${styles.trialBadge} ${urgent ? styles.trialBadgeUrgent : ""}`}>
            <span className={styles.trialDot} />
            {days > 0 ? `Trial · ${days}d left` : "Trial expired"}
        </span>
    );
}

export default function AdminHeader({ active }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const NAV = [
        { key: "dashboard", label: "Dashboard", icon: "fi-rr-apps", path: "/admin" },
        { key: "employers", label: "Employers", icon: "fi-rr-building", path: "/admin/employers" },
        { key: "candidates", label: "Candidates", icon: "fi-rr-users", path: "/admin/candidates" },
        { key: "intelligence", label: "Intelligence", icon: "fi-rr-bolt", path: "/admin/chat" },
        { key: "db", label: "DB Explorer", icon: "fi-rr-database", path: "/admin/db-explorer" },
    ];

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    function handleNav(path) {
        setMenuOpen(false);
        if (path) navigate(path);
    }

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>

                <div className={styles.headerLeft}>
                    <span className={styles.logo} onClick={() => navigate("/admin")}>RYZE.ai</span>
                    <span className={styles.adminBadge}>ADMIN</span>
                </div>

                {/* Desktop nav */}
                <nav className={styles.nav}>
                    {NAV.map(({ key, label, icon, path }) => (
                        <button
                            key={key}
                            className={`${styles.navLink} ${active === key ? styles.navLinkActive : ""}`}
                            onClick={() => path && navigate(path)}
                        >
                            <i className={`fi ${icon}`} />
                            {label}
                        </button>
                    ))}
                </nav>


                <div className={styles.headerRight}>
                    <TrialBadge />
                    <button
                        className={styles.settingsBtn}
                        onClick={() => navigate('/settings')}
                        title="Account Settings"
                    >
                        <i className="fi fi-rr-settings" />
                    </button>
                    <span className={styles.userName}>{user?.full_name}</span>
                    <button className={styles.logoutBtn} onClick={logout} title="Logout">
                        <i className="fi fi-rr-exit" />
                    </button>

                    {/* Hamburger — mobile only */}
                    <div className={styles.menuWrapper} ref={menuRef}>
                        <button
                            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ""}`}
                            onClick={() => setMenuOpen(o => !o)}
                            aria-label="Toggle navigation"
                        >
                            <span />
                            <span />
                            <span />
                        </button>

                        {menuOpen && (
                            <div className={styles.mobileMenu}>
                                {NAV.map(({ key, label, icon, path }) => (
                                    <button
                                        key={key}
                                        className={`${styles.mobileNavLink} ${active === key ? styles.mobileNavLinkActive : ""}`}
                                        onClick={() => handleNav(path)}
                                    >
                                        <i className={`fi ${icon}`} />
                                        {label}
                                    </button>
                                ))}
                                <div className={styles.mobileDivider} />
                                <button
                                    className={styles.mobileLogout}
                                    onClick={() => { setMenuOpen(false); logout(); }}
                                >
                                    <i className="fi fi-rr-exit" />
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </header>
    );
}