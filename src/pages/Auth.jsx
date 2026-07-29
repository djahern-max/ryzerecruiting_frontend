/* src/pages/Auth.jsx */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 4c4.2 0 7.1-3.7 8.3-5-1.2-1.3-4.1-5-8.3-5S4.9 9.7 3.7 11c1.2 1.3 4.1 5 8.3 5z" fill="currentColor" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 4c4.2 0 7.1-3.7 8.3-5-1.2-1.3-4.1-5-8.3-5S4.9 9.7 3.7 11c1.2 1.3 4.1 5 8.3 5z" fill="currentColor" />
      <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" fill="currentColor" />
    </svg>
  );
}

function TypewriterTag({ text }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 70);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className={styles.logoTag}>
      {display}
      {display.length < text.length && <span className={styles.tagCursor}>|</span>}
    </span>
  );
}

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  function switchMode() {
    setIsLogin(v => !v);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isLogin && !userType) {
      setError('Please select an account type.');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, fullName, userType);

      if (!result.success) setError(result.error);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${API_BASE}/api/auth/oauth/google`;
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>

        {/* ── Logo & heading ──────────────────────── */}
        <div className={styles.authHeader}>
          <div className={styles.logo}>
            RYZE
            <TypewriterTag text="FOR RECRUITERS" />
          </div>
          <h1 className={styles.authTitle}>
            {isLogin ? 'Welcome' : 'Create Account'}
          </h1>
          <p className={styles.authSubtitle}>
            {isLogin
              ? 'Sign in with Google or use email and password.'
              : 'Sign up with Google or use email and password.'}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* ── OAuth ───────────────────────────────── */}
        <div className={styles.oauthButtons}>
          <button onClick={handleGoogleLogin} className={styles.oauthButton}>
            <svg className={styles.oauthIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>
        </div>

        {/* ── Divider ─────────────────────────────── */}
        <div className={styles.divider}>
          <span>or</span>
        </div>

        {/* ── Form ────────────────────────────────── */}
        <form className={styles.authForm} onSubmit={handleSubmit}>

          {/* Register-only fields */}
          {!isLogin && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>I am a…</label>
                <div className={styles.userTypeSelection}>
                  <button
                    type="button"
                    className={`${styles.userTypeButton} ${userType === 'EMPLOYER' ? styles.userTypeButtonActive : ''}`}
                    onClick={() => setUserType('EMPLOYER')}
                  >
                    <span className={styles.userTypeLabel}>Employer</span>
                    <span className={styles.userTypeDesc}>I'm hiring accounting &amp; finance professionals</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.userTypeButton} ${userType === 'CANDIDATE' ? styles.userTypeButtonActive : ''}`}
                    onClick={() => setUserType('CANDIDATE')}
                  >
                    <span className={styles.userTypeLabel}>Candidate</span>
                    <span className={styles.userTypeDesc}>I'm looking for accounting &amp; finance roles</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
              autoComplete="email"
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
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
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
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? (isLogin ? 'Signing in…' : 'Creating account…') : 'Continue'}
          </button>
        </form>

        {/* ── Toggle login / register ──────────────── */}
        <div className={styles.authFooter}>
          <p className={styles.toggleText}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button className={styles.toggleButton} onClick={switchMode}>
              {isLogin ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>



      </div>

      {/* ── Legal line below card ─────────────────── */}
      <p className={styles.legalText}>
        By proceeding, you agree to the{' '}
        <a href="/privacy">Privacy Policy</a> and{' '}
        <a href="/terms">Terms of Service</a>
      </p>
    </div>
  );
}

export default Auth;