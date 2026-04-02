/* src/pages/admin/InviteForm.jsx */
/* EP17 — Admin invite form. Creates a new tenant, fires the welcome email. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import styles from './InviteForm.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function InviteForm() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ company_name: '', full_name: '', email: '' });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrorMsg('');
    }

    async function handleSubmit() {
        const { company_name, full_name, email } = form;
        if (!company_name.trim() || !full_name.trim() || !email.trim()) {
            setErrorMsg('All three fields are required.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    company_name: company_name.trim(),
                    full_name: full_name.trim(),
                    email: email.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Invite failed. Please try again.');
            }

            setResult(data);
            setStatus('success');
        } catch (err) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    }

    function handleReset() {
        setForm({ company_name: '', full_name: '', email: '' });
        setResult(null);
        setStatus('idle');
        setErrorMsg('');
    }

    return (
        <div className={styles.page}>
            <AdminHeader />

            <div className={styles.container}>
                <button className={styles.backBtn} onClick={() => navigate('/admin')}>
                    ← Back to Dashboard
                </button>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h1 className={styles.title}>Invite a Recruiting Firm</h1>
                        <p className={styles.sub}>
                            Creates a new tenant account, starts their 30-day free trial,
                            and sends a branded welcome email with login credentials.
                        </p>
                    </div>

                    {status === 'success' && result ? (
                        /* ── Success state ─────────────────────────────────────── */
                        <div className={styles.successBlock}>
                            <div className={styles.successIcon}>✓</div>
                            <h2 className={styles.successTitle}>Invite sent</h2>
                            <p className={styles.successSub}>
                                Welcome email delivered to <strong>{form.email}</strong>
                            </p>

                            <div className={styles.resultTable}>
                                <div className={styles.resultRow}>
                                    <span className={styles.resultLabel}>Company</span>
                                    <span className={styles.resultValue}>{form.company_name}</span>
                                </div>
                                <div className={styles.resultRow}>
                                    <span className={styles.resultLabel}>Tenant slug</span>
                                    <span className={`${styles.resultValue} ${styles.mono}`}>
                                        {result.tenant_slug}
                                    </span>
                                </div>
                                <div className={styles.resultRow}>
                                    <span className={styles.resultLabel}>Trial ends</span>
                                    <span className={styles.resultValue}>{result.trial_ends_at}</span>
                                </div>
                                <div className={styles.resultRow}>
                                    <span className={styles.resultLabel}>User ID</span>
                                    <span className={`${styles.resultValue} ${styles.mono}`}>
                                        {result.user_id}
                                    </span>
                                </div>
                            </div>

                            <button className={styles.resetBtn} onClick={handleReset}>
                                Invite another firm
                            </button>
                        </div>
                    ) : (
                        /* ── Form ──────────────────────────────────────────────── */
                        <div className={styles.form}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label} htmlFor="company_name">
                                    Company Name
                                </label>
                                <input
                                    id="company_name"
                                    name="company_name"
                                    type="text"
                                    className={styles.input}
                                    placeholder="Acme Recruiting"
                                    value={form.company_name}
                                    onChange={handleChange}
                                    disabled={status === 'loading'}
                                    autoComplete="off"
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label} htmlFor="full_name">
                                    Contact Name
                                </label>
                                <input
                                    id="full_name"
                                    name="full_name"
                                    type="text"
                                    className={styles.input}
                                    placeholder="Jane Smith"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    disabled={status === 'loading'}
                                    autoComplete="off"
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label} htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className={styles.input}
                                    placeholder="jane@acmerecruiting.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={status === 'loading'}
                                    autoComplete="off"
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                />
                            </div>

                            {errorMsg && (
                                <div className={styles.errorMsg}>{errorMsg}</div>
                            )}

                            <button
                                className={styles.submitBtn}
                                onClick={handleSubmit}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <><span className={styles.spinner} /> Sending invite…</>
                                ) : (
                                    'Send Invite'
                                )}
                            </button>

                            <p className={styles.hint}>
                                A welcome email with login credentials and trial end date will be
                                sent immediately. The firm's 30-day trial starts the moment this
                                invite is sent.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}