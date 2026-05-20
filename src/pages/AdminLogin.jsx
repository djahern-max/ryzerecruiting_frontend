/* src/pages/AdminLogin.jsx */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';   // ← reuse the dark-card styles

function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await adminLogin(email, password);
      if (!result.success) setError(result.error || 'Invalid credentials.');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>

        {/* ── Logo & heading ──────────────────────── */}
        <div className={styles.authHeader}>
          <div className={styles.logo}>
            RYZE<span className={styles.logoAi}>.ai</span>
          </div>
          <h1 className={styles.authTitle}>Admin Access</h1>
          <p className={styles.authSubtitle}>
            Restricted to authorised administrators only.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@ryze.ai"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* ── Back to login ────────────────────────── */}
        <div className={styles.adminAccess}>
          <button
            className={styles.adminAccessLink}
            onClick={() => navigate('/auth')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Back to login
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;