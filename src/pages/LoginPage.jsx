/* src/pages/LoginPage.jsx */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginPage.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';



function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <rect width="18" height="18" rx="3" fill="#0A66C2" />
            <path d="M4.5 7H6.5V13.5H4.5V7ZM5.5 6C4.95 6 4.5 5.55 4.5 5C4.5 4.45 4.95 4 5.5 4C6.05 4 6.5 4.45 6.5 5C6.5 5.55 6.05 6 5.5 6Z" fill="white" />
            <path d="M8 7H9.9V7.9H9.93C10.19 7.42 10.82 6.9 11.75 6.9C13.76 6.9 14.12 8.2 14.12 9.93V13.5H12.12V10.33C12.12 9.6 12.11 8.66 11.1 8.66C10.08 8.66 9.92 9.45 9.92 10.27V13.5H8V7Z" fill="white" />
        </svg>
    );
}

export default function LoginPage() {
    const navigate = useNavigate();
    const { user, login } = useAuth();

    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [userType, setUserType] = useState('CANDIDATE');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.user_type === 'EMPLOYER') navigate('/employer/dashboard');
            else if (user.user_type === 'CANDIDATE') navigate('/candidate/dashboard');
            else if (user.user_type === 'ADMIN') navigate('/admin');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                const res = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, full_name: name, user_type: userType }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Registration failed');
                await login(email, password);
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        window.location.href = `${API_BASE}/api/auth/google`;
    };

    const handleLinkedIn = () => {
        window.location.href = `${API_BASE}/api/auth/linkedin`;
    };

    return (
        <div className={`${styles.page} ${mounted ? styles.pageMounted : ''}`}>

            {/* Left panel — brand */}
            <div className={styles.left}>
                <div className={styles.leftInner}>

                    <h1 className={styles.brandName}>RYZE.ai</h1>
                    <p className={styles.brandTagline}>
                        The AI-native recruiting platform built for modern talent teams.
                    </p>

                    <div className={styles.featureList}>
                        {[
                            'AI-powered candidate matching',
                            'Semantic search across your pipeline',
                            'Automated booking & reminders',
                            'Pre-call intelligence briefs',
                        ].map((f, i) => (
                            <div key={i} className={styles.featureItem} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                                <span className={styles.featureDot} />
                                {f}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.leftFooter}>
                    <Link to="/privacy" className={styles.legalLink}>Privacy</Link>
                    <span className={styles.legalDivider}>·</span>
                    <Link to="/terms" className={styles.legalLink}>Terms</Link>
                </div>
            </div>

            {/* Right panel — form */}
            <div className={styles.right}>
                <div className={styles.card}>

                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            {mode === 'login' ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p className={styles.cardSub}>
                            {mode === 'login'
                                ? 'Sign in to your RYZE.ai account'
                                : 'Join RYZE.ai to get started'}
                        </p>
                    </div>

                    {/* OAuth buttons */}
                    <div className={styles.oauthRow}>
                        <button className={styles.oauthBtn} onClick={handleGoogle} disabled={loading}>
                            <GoogleIcon />
                            <span>Google</span>
                        </button>
                        <button className={styles.oauthBtn} onClick={handleLinkedIn} disabled={loading}>
                            <LinkedInIcon />
                            <span>LinkedIn</span>
                        </button>
                    </div>

                    <div className={styles.divider}>
                        <span>or continue with email</span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>

                        {mode === 'signup' && (
                            <div className={styles.field}>
                                <label className={styles.label}>Full name</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Jane Smith"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <div className={styles.field}>
                            <label className={styles.label}>Email address</label>
                            <input
                                className={styles.input}
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Password</label>
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                required
                                disabled={loading}
                            />
                        </div>

                        {mode === 'signup' && (
                            <div className={styles.field}>
                                <label className={styles.label}>I am a…</label>
                                <div className={styles.typeToggle}>
                                    <button
                                        type="button"
                                        className={`${styles.typeBtn} ${userType === 'CANDIDATE' ? styles.typeBtnActive : ''}`}
                                        onClick={() => setUserType('CANDIDATE')}
                                        disabled={loading}
                                    >
                                        Candidate
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.typeBtn} ${userType === 'EMPLOYER' ? styles.typeBtnActive : ''}`}
                                        onClick={() => setUserType('EMPLOYER')}
                                        disabled={loading}
                                    >
                                        Employer
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && <p className={styles.errorMsg}>{error}</p>}

                        <button className={styles.submitBtn} type="submit" disabled={loading}>
                            {loading
                                ? <span className={styles.spinner} />
                                : mode === 'login' ? 'Sign in →' : 'Create account →'}
                        </button>
                    </form>

                    <p className={styles.modeSwitch}>
                        {mode === 'login' ? (
                            <>Don't have an account?{' '}
                                <button className={styles.modeSwitchBtn} onClick={() => { setMode('signup'); setError(''); }}>
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>Already have an account?{' '}
                                <button className={styles.modeSwitchBtn} onClick={() => { setMode('login'); setError(''); }}>
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>
                </div>

                <a href="/admin/login" className={styles.adminLink}>Admin access</a>
            </div>
        </div>
    );
}