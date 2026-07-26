/* src/pages/DemoRequest.jsx */
import { useState } from 'react';
import posthog from 'posthog-js';
import styles from './DemoRequest.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function DemoRequest() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — must stay empty
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setError('');

    if (!name.trim() || !company.trim() || !email.trim()) {
      setError('Please fill out your name, company, and email.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/demo-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          message: message.trim() || null,
          website,
        }),
      });

      if (response.ok) {
        posthog.capture('demo_requested');
        setSubmitted(true);
      } else if (response.status === 429) {
        setError('Too many attempts — please try again in a few minutes.');
      } else {
        setError('Unable to process request — please try again.');
      }
    } catch {
      setError('Unable to process request — please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>RYZE.ai</div>

        {submitted ? (
          <div className={styles.successState}>
            <div className={styles.successCheck}>✓</div>
            <p className={styles.successTitle}>Thanks — we'll be in touch shortly.</p>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>Request a demo</h1>
            <p className={styles.sub}>Tell us a bit about your firm and we'll set up a time to talk.</p>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
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
                <label htmlFor="phone">Phone (optional)</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message (optional)</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
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
                {loading ? 'Sending…' : 'Request demo'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DemoRequest;
