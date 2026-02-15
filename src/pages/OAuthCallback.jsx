/* src/pages/OAuthCallback.jsx */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthToken } = useAuth();
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
            // Store token and redirect based on user
            localStorage.setItem('token', token);

            // Fetch user data to determine redirect
            fetch(
                import.meta.env.PROD
                    ? 'https://api.ryzerecruiting.com/api/me'
                    : 'http://localhost:8000/api/me',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
                .then(res => res.json())
                .then(userData => {
                    if (userData.user_type === 'employer') {
                        window.location.href = '/employer/dashboard';
                    } else {
                        window.location.href = '/candidate/dashboard';
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch user:', err);
                    navigate('/auth');
                });
        } else {
            setError('No token received');
            setTimeout(() => navigate('/auth'), 3000);
        }
    }, [searchParams, navigate, setAuthToken]);

    if (error) {
        return (
            <div className={styles.authPage}>
                <div className={styles.authContainer}>
                    <div className={styles.authHeader}>
                        <h1 className={styles.logo}>RYZE Recruiting</h1>
                        <h2 className={styles.authTitle}>Authentication Error</h2>
                    </div>
                    <div className={styles.error}>
                        {error}
                    </div>
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