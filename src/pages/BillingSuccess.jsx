/* src/pages/BillingSuccess.jsx */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './UpgradePage.module.css';

export default function BillingSuccess() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Redirect to the right dashboard after 4 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (user?.user_type === 'ADMIN') navigate('/admin');
            else if (user?.user_type === 'EMPLOYER') navigate('/employer/dashboard');
            else navigate('/candidate/dashboard');
        }, 4000);
        return () => clearTimeout(timer);
    }, [user, navigate]);

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.logo}>RYZE.ai</div>

                <div className={styles.iconWrap} style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <i className="fi fi-rr-check-circle"></i>
                </div>

                <h1 className={styles.title}>You're all set!</h1>
                <p className={styles.sub}>
                    Payment confirmed. Your account is now active — full access restored.
                    Redirecting you back to the platform in a moment…
                </p>
            </div>
        </div>
    );
}