/* src/pages/Auth.jsx */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function EyeIcon({ open }) {
  return open ? (
    // eye-off-ish
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 4c4.2 0 7.1-3.7 8.3-5-1.2-1.3-4.1-5-8.3-5S4.9 9.7 3.7 11c1.2 1.3 4.1 5 8.3 5z"
        fill="currentColor"
      />
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    // eye
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 4c4.2 0 7.1-3.7 8.3-5-1.2-1.3-4.1-5-8.3-5S4.9 9.7 3.7 11c1.2 1.3 4.1 5 8.3 5z"
        fill="currentColor"
      />
      <path
        d="M12 9a3 3 0 100 6 3 3 0 000-6z"
        fill="currentColor"
      />
    </svg>
  );
}

function Auth() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isLogin && !userType) {
      setError('Please select an account type');
      return;
    }
    setLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        result = await register(email, password, fullName, userType);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    sessionStorage.setItem('oauth_user_type', userType);
    window.location.href = `${API_BASE}/api/auth/oauth/google`;

  }

  function handleLinkedInLogin() {
    sessionStorage.setItem('oauth_user_type', userType);
    window.location.href = `${API_BASE}/api/auth/oauth/linkedin`;
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authHeader}>
          <h1 className={styles.logo} onClick={() => navigate('/')}>
            RYZE.ai
          </h1>
          <h2 className={styles.authTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* OAuth Buttons */}
        <div className={styles.oauthButtons}>
          <button onClick={handleGoogleLogin} className={styles.oauthButton}>
            <svg className={styles.oauthIcon} viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button onClick={handleLinkedInLogin} className={styles.oauthButton}>
            <svg className={styles.oauthIcon} viewBox="0 0 24 24">
              <path
                fill="#0077B5"
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C0 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
            Continue with LinkedIn
          </button>
        </div>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Account Type</label>
              <div className={styles.userTypeSelection}>
                <button
                  type="button"
                  className={`${styles.userTypeButton} ${userType === 'EMPLOYER' ? styles.userTypeButtonActive : ''}`}
                  onClick={() => setUserType('EMPLOYER')}
                >
                  <span className={styles.userTypeLabel}>Employer</span>
                  <span className={styles.userTypeDesc}>I'm hiring accounting & finance professionals</span>
                </button>
                <button
                  type="button"
                  className={`${styles.userTypeButton} ${userType === 'CANDIDATE' ? styles.userTypeButtonActive : ''}`}
                  onClick={() => setUserType('CANDIDATE')}
                >
                  <span className={styles.userTypeLabel}>Candidate</span>
                  <span className={styles.userTypeDesc}>I'm looking for accounting & finance roles</span>
                </button>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>

            <div className={styles.passwordRow}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {!isLogin && (
              <small className={styles.helpText}>
                Must be at least 8 characters
              </small>
            )}
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div className={styles.passwordRow}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <small className={styles.errorText}>Passwords do not match</small>
              )}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              className={styles.toggleButton}
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>

          <button className={styles.backButton} onClick={() => navigate('/')}>
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;