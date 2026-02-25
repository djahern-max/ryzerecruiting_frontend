/* src/pages/CompleteOAuthSignup.jsx */
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

    const storedType = sessionStorage.getItem('oauth_user_type');
    if (storedType) {
      setUserType(storedType);
      sessionStorage.removeItem('oauth_user_type');
    }
  }, [tempToken, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userType) {
      setError('Please select your account type');
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

      if (user.user_type === 'ADMIN') {
        window.location.href = '/admin';
      } else if (user.user_type === 'EMPLOYER') {
        window.location.href = '/employer/dashboard';
      } else {
        window.location.href = '/candidate/dashboard';
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
          <div className={styles.userTypeSelection}>
            <button
              type="button"
              className={`${styles.userTypeButton} ${userType === 'employer' ? styles.userTypeButtonActive : ''}`}
              onClick={() => setUserType('employer')}
            >
              <span className={styles.userTypeIcon}>🏢</span>
              <span className={styles.userTypeLabel}>Employer</span>
              <span className={styles.userTypeDesc}>I'm hiring accounting & finance professionals</span>
            </button>

            <button
              type="button"
              className={`${styles.userTypeButton} ${userType === 'candidate' ? styles.userTypeButtonActive : ''}`}
              onClick={() => setUserType('candidate')}
            >
              <span className={styles.userTypeIcon}>👤</span>
              <span className={styles.userTypeLabel}>Candidate</span>
              <span className={styles.userTypeDesc}>I'm looking for accounting & finance roles</span>
            </button>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !userType}
          >
            {loading ? 'Setting up your account…' : 'Continue →'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <button className={styles.backButton} onClick={() => navigate('/auth')}>
            ← Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteOAuthSignup;
