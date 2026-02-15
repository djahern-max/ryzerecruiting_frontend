/*src/pages/CompleteOAuthSignup.jsx*/

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Auth.module.css';

const API_URL = import.meta.env.PROD
    ? 'https://api.ryzerecruiting.com'
    : 'http://localhost:8000';

function CompleteOAuthSignup() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [userType, setUserType] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const tempToken = searchParams.get('temp_token');

    useEffect(() => {
        if (!tempToken) {
            navigate('/auth');
        }

        // Check if user had a preference stored
        const storedType = sessionStorage.getItem('oauth_user_type');
        if (storedType) {
            setUserType(storedType);
            sessionStorage.removeItem('oauth_user_type');
        }
    }, [tempToken, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!userType) {
            setError('Please select your user type');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${API_URL}/api/auth/oauth/complete-signup?temp_token=${tempToken}&user_type=${userType}`
            );

            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);

            // Redirect based on user type
            if (user.user_type === 'employer') {
                navigate('/employer/dashboard');
            } else {
                navigate('/candidate/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to complete signup');
            setLoading(false);
        }
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                <div className={styles.authHeader}>
                    <h1 className={styles.logo}>RYZE Recruiting</h1>
                    <h2 className={styles.authTitle}>Complete Your Sign Up</h2>
                    <p style={{ color: 'var(--text-500)', marginTop: '0.5rem' }}>
                        Please select your account type to continue
                    </p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <form className={styles.authForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>I am a...</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <label
                                style={{
                                    flex: 1,
                                    cursor: 'pointer',
                                    padding: '1rem',
                                    border: `2px solid ${userType === 'candidate' ? 'var(--brand-700)' : 'var(--border-200)'}`,
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    transition: 'all 180ms ease',
                                    background: userType === 'candidate' ? 'rgba(28, 102, 214, 0.05)' : 'white'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="userType"
                                    value="candidate"
                                    checked={userType === 'candidate'}
                                    onChange={(e) => setUserType(e.target.value)}
                                    style={{ display: 'none' }}
                                />
                                <div style={{ fontWeight: 600, color: 'var(--text-900)' }}>
                                    Candidate
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-500)', marginTop: '0.25rem' }}>
                                    Looking for a job
                                </div>
                            </label>

                            <label
                                style={{
                                    flex: 1,
                                    cursor: 'pointer',
                                    padding: '1rem',
                                    border: `2px solid ${userType === 'employer' ? 'var(--brand-700)' : 'var(--border-200)'}`,
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    transition: 'all 180ms ease',
                                    background: userType === 'employer' ? 'rgba(28, 102, 214, 0.05)' : 'white'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="userType"
                                    value="employer"
                                    checked={userType === 'employer'}
                                    onChange={(e) => setUserType(e.target.value)}
                                    style={{ display: 'none' }}
                                />
                                <div style={{ fontWeight: 600, color: 'var(--text-900)' }}>
                                    Employer
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-500)', marginTop: '0.25rem' }}>
                                    Hiring talent
                                </div>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading || !userType}
                    >
                        {loading ? 'Please wait...' : 'Complete Sign Up'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CompleteOAuthSignup;