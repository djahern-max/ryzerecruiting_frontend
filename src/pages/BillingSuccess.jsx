/* src/pages/BillingSuccess.jsx */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';
import styles from './UpgradePage.module.css';
import happyFace from '../assets/icons/happy_face.svg';

export default function BillingSuccess() {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#0a66c2', '#16a34a', '#f59e0b', '#ec4899'],
        });

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

                <div className={styles.iconWrap}>
                    <img src={happyFace} alt="" style={{ width: '64px', height: '64px' }} />
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