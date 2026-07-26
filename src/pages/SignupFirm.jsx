/* src/pages/SignupFirm.jsx */
import { useState } from 'react';
import posthog from 'posthog-js';
import { useAuth } from '../contexts/AuthContext';
import styles from './SignupFirm.module.css';

function SignupFirm() {
  const { signupFirm } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — must stay empty
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    posthog.capture('signup_started');
    setError('');

    if (!companyName.trim() || !fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await signupFirm({
      company_name: companyName.trim(),
      full_name: fullName.trim(),
      email: email.trim(),
      password,
      website,
    });

    if (!result.success) {
      if (result.status === 400 && result.detail === 'Email already registered') {
        setError('duplicate_email');
      } else if (result.status === 429) {
        setError('Too many attempts — please try again in a few minutes.');
      } else {
        setError('Unable to process request — please try again.');
      }
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>RYZE.ai</div>
        <h1 className={styles.title}>Start your free trial</h1>
        <p className={styles.sub}>Set up your firm's account in under a minute.</p>

        {error && (
          <div className={styles.error}>
            {error === 'duplicate_email' ? (
              <>That email is already registered — <a href="/auth">log in instead</a></>
            ) : error}
          </div>
        )}

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="companyName">Company name</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          {/* Honeypot — real users never see or fill this in */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </div>

        <p className={styles.legalText}>
          Already have an account? <a href="/auth">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default SignupFirm;
