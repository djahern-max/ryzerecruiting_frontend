/* src/pages/ChangePassword.jsx */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './ChangePassword.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ChangePassword() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setMessage('');
        setStatus('idle');
    }

    async function handleSubmit() {
        if (!form.current_password || !form.new_password || !form.confirm_password) {
            setMessage('All fields are required.');
            setStatus('error');
            return;
        }
        if (form.new_password !== form.confirm_password) {
            setMessage('New passwords do not match.');
            setStatus('error');
            return;
        }
        if (form.new_password.length < 8) {
            setMessage('New password must be at least 8 characters.');
            setStatus('error');
            return;
        }

        setStatus('loading');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/settings/change-password`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Failed to update password.');
            }

            setStatus('success');
            setMessage('Password updated successfully.');
            setForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    }

    // Back navigation — admins go to /admin, others to their dashboard
    function handleBack() {
        if (user?.user_type === 'ADMIN') navigate('/admin');
        else if (user?.user_type === 'EMPLOYER') navigate('/employer/dashboard');
        else navigate('/candidate/dashboard');
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>

                <div className={styles.cardHeader}>
                    <button className={styles.backBtn} onClick={handleBack}>
                        ← Back
                    </button>
                    <h1 className={styles.title}>Account Settings</h1>
                    <p className={styles.sub}>Signed in as <strong>{user?.email}</strong></p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Change Password</h2>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Current Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            name="current_password"
                            value={form.current_password}
                            onChange={handleChange}
                            placeholder="Enter current password"
                            disabled={status === 'loading'}
                            autoComplete="current-password"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>New Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            name="new_password"
                            value={form.new_password}
                            onChange={handleChange}
                            placeholder="At least 8 characters"
                            disabled={status === 'loading'}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Confirm New Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            name="confirm_password"
                            value={form.confirm_password}
                            onChange={handleChange}
                            placeholder="Repeat new password"
                            disabled={status === 'loading'}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            autoComplete="new-password"
                        />
                    </div>

                    {message && (
                        <div className={`${styles.message} ${status === 'success' ? styles.messageSuccess : styles.messageError}`}>
                            {message}
                        </div>
                    )}

                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading'
                            ? <><span className={styles.spinner} /> Updating…</>
                            : 'Update Password'
                        }
                    </button>
                </div>

            </div>
        </div>
    );
}