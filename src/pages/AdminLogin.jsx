/* src/pages/AdminLogin.jsx */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminLogin.module.css';

function AdminLogin() {
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();

  const [email, setEmail] = useState('dane@ryze.ai');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.user_type === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo} onClick={() => navigate('/')}>
            RYZE.ai
          </h1>
          <span className={styles.adminBadge}>Admin Access</span>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="dane@ryze.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <button
          className={styles.backLink}
          onClick={() => navigate('/')}
          type="button"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
