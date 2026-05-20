/* src/pages/Auth.jsx */
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 4c4.2 0 7.1-3.7 8.3-5-1.2-1.3-4.1-5-8.3-5S4.9 9.7 3.7 11c1.2 1.3 4.1 5 8.3 5z"
        fill="currentColor"
      />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 4c4.2 0 7.1-3.7 8.3-5-1.2-1.3-4.1-5-8.3-5S4.9 9.7 3.7 11c1.2 1.3 4.1 5 8.3 5z"
        fill="currentColor"
      />
      <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" fill="currentColor" />
    </svg>
  );
}

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
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

  function handleLinkedInLogin() {
    window.location.href = `${API_BASE}/api/auth/oauth/linkedin`;
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>

        {/* ── Logo & heading ──────────────────────── */}
        <div className={styles.authHeader}>
          <div className={styles.logo}>
            RYZE<span className={styles.logoAi}>.ai</span>
          </div>
          <h1 className={styles.authTitle}>Welcome</h1>
          <p className={styles.authSubtitle}>
            Sign in with Google, LinkedIn, or use email and password.
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
            Sign in with Google
          </button>

          <button onClick={handleLinkedInLogin} className={styles.oauthButton}>
            <svg className={styles.oauthIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C0 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Sign in with LinkedIn
          </button>
        </div>

        {/* ── Divider ─────────────────────────────── */}
        <div className={styles.divider}>
          <span>or</span>
        </div>

        {/* ── Email / Password form ────────────────── */}
        <form className={styles.authForm} onSubmit={handleSubmit}>
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
                autoComplete="current-password"
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
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>

        {/* ── Admin ghost link ─────────────────────── */}
        <div className={styles.adminAccess}>
          <a href="/admin/login" className={styles.adminAccessLink}>Admin login</a>
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