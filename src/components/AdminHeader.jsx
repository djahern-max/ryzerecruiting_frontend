/* src/components/AdminHeader.jsx */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./AdminHeader.module.css";

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