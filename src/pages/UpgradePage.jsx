/* src/pages/UpgradePage.jsx */
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './UpgradePage.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function UpgradePage() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleUpgrade() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/billing/create-checkout-session`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Failed to start checkout');
            }

            const { checkout_url } = await res.json();
            window.location.href = checkout_url;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }

    const firstName = user?.full_name?.split(' ')[0] || 'there';

    return (
        <div className={styles.page}>
            <div className={styles.card}>

                {/* Logo */}
                <div className={styles.logo}>RYZE.ai</div>

                {/* Icon */}
                <div className={styles.iconWrap}>
                    <i className="fi fi-rr-lock"></i>
                </div>

                <h1 className={styles.title}>Your trial has ended</h1>
                <p className={styles.sub}>
                    Hey {firstName} — your 30-day free trial has expired.
                    Upgrade to keep full access to your pipeline, AI matching, and everything you've built.
                </p>

                {/* Plan card */}
                <div className={styles.planCard}>
                    <div className={styles.planHeader}>
                        <span className={styles.planName}>RYZE.ai Recruiting Platform</span>

                    </div>
                    <div className={styles.planPrice}>
                        <span className={styles.planAmount}>$99</span>
                        <span className={styles.planPer}>/month</span>
                    </div>
                    <ul className={styles.planFeatures}>
                        <li><i className="fi fi-rr-check"></i> Full candidate &amp; employer pipeline</li>
                        <li><i className="fi fi-rr-check"></i> AI-powered matching &amp; intelligence briefs</li>
                        <li><i className="fi fi-rr-check"></i> Zoom booking &amp; calendar integration</li>
                        <li><i className="fi fi-rr-check"></i> RYZE Intelligence chat</li>
                        <li><i className="fi fi-rr-check"></i> Transcript capture &amp; meeting summaries</li>
                    </ul>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button
                    className={`${styles.upgradeBtn} ${loading ? styles.upgradeBtnLoading : ''}`}
                    onClick={handleUpgrade}
                    disabled={loading}
                >
                    {loading
                        ? <><i className="fi fi-rr-time" style={{ marginRight: '8px' }}></i>Redirecting to Stripe…</>
                        : <><i className="fi fi-rr-credit-card" style={{ marginRight: '8px' }}></i>Upgrade for $99/month</>
                    }
                </button>

                <button className={styles.logoutLink} onClick={logout}>
                    Sign out
                </button>

            </div>
        </div>
    );
}