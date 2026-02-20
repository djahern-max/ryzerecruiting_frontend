/* src/pages/OAuthCallback.jsx */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Auth.module.css';

function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError(errorParam);
            setTimeout(() => navigate('/auth'), 3000);
            return;
        }

        if (token) {
            localStorage.setItem('token', token);

            fetch(
                import.meta.env.PROD
                    ? 'https://api.ryzerecruiting.com/api/auth/me'
                    : 'http://localhost:8000/api/auth/me',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
                .then(res => {
                    if (!res.ok) throw new Error(`Auth failed: ${res.status}`); // 👈 added
                    return res.json();
                })
                .then(userData => {
                    if (userData.user_type === 'employer') {
                        window.location.href = '/employer/dashboard';
                    } else {
                        window.location.href = '/candidate/dashboard';
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch user:', err);
                    localStorage.removeItem('token'); // 👈 added
                    navigate('/auth');
                });
        } else {
            setError('No token received');
            setTimeout(() => navigate('/auth'), 3000);
        }
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className={styles.authPage}>
                <div className={styles.authContainer}>
                    <div className={styles.authHeader}>
                        <h1 className={styles.logo}>RYZE Recruiting</h1>
                        <h2 className={styles.authTitle}>Authentication Error</h2>
                    </div>
                    <div className={styles.error}>{error}</div>
                    <p style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                        Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                <div className={styles.authHeader}>
                    <h1 className={styles.logo}>RYZE Recruiting</h1>
                    <h2 className={styles.authTitle}>Completing Sign In...</h2>
                </div>
                <p style={{ textAlign: 'center', color: 'var(--text-500)' }}>
                    Please wait while we complete your authentication.
                </p>
            </div>
        </div>
    );
}

export default OAuthCallback;