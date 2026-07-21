// src/pages/admin/TenantSettings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { apiFetch } from '../../services/api';
import styles from './TenantSettings.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fields the firm admin can edit. `placeholder` shows the RYZE fallback so an
// empty input reads as "we'll use the default" rather than looking broken.
const FIELDS = [
    {
        name: 'signature_name',
        label: 'Signature name',
        help: 'Who outbound emails are signed by — appears as "{name} from {firm}".',
        placeholder: 'e.g. Sarah',
        type: 'text',
    },
    {
        name: 'reply_to_email',
        label: 'Reply-to email',
        help: 'Where replies land when a candidate or employer responds.',
        placeholder: 'name@yourfirm.com',
        type: 'email',
    },
    {
        name: 'support_email',
        label: 'Support email',
        help: 'Shown to contacts who need help. Can be the same as reply-to.',
        placeholder: 'name@yourfirm.com',
        type: 'email',
    },
    {
        name: 'admin_email',
        label: 'Internal notifications email',
        help: 'Where your own team gets notified — new bookings, accepted invites, cancellations.',
        placeholder: 'name@yourfirm.com',
        type: 'email',
    },
];

const EMPTY_FORM = FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});

export default function TenantSettings() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [tenant, setTenant] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        apiFetch(`${API_BASE}/api/settings/tenant`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => {
                if (r.status === 404) return null; // RYZE's own admin has no tenant row
                if (!r.ok) throw new Error('Could not load settings.');
                return r.json();
            })
            .then(data => {
                setTenant(data);
                if (data) {
                    setForm({
                        signature_name: data.signature_name || '',
                        reply_to_email: data.reply_to_email || '',
                        support_email: data.support_email || '',
                        admin_email: data.admin_email || '',
                    });
                }
            })
            .catch(() => setTenant(null))
            .finally(() => setLoading(false));
    }, [token]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (status !== 'idle') { setStatus('idle'); setMessage(''); }
    }

    async function handleSave() {
        setSaving(true);
        setStatus('idle');
        setMessage('');
        try {
            const res = await apiFetch(`${API_BASE}/api/settings/tenant`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                // Send all fields; the API normalizes blank strings to NULL,
                // which restores the shared-default for that field.
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Could not save settings.');
            }
            const updated = await res.json();
            setTenant(updated);
            setForm({
                signature_name: updated.signature_name || '',
                reply_to_email: updated.reply_to_email || '',
                support_email: updated.support_email || '',
                admin_email: updated.admin_email || '',
            });
            setStatus('success');
            setMessage('Branding saved.');
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={styles.page}>
            <AdminHeader active="branding" />

            <div className={styles.container}>
                <button className={styles.backBtn} onClick={() => navigate('/admin')}>
                    ← Back to Dashboard
                </button>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h1 className={styles.title}>Branding</h1>
                        <p className={styles.sub}>
                            Control how your firm appears on outbound email and SMS.
                            Leave a field blank to use the platform default. Emails are
                            sent under your firm's name from RYZE's email service;
                            replies go to your Reply-To address.
                        </p>
                    </div>

                    {loading ? (
                        <div className={styles.stateMsg}>Loading…</div>
                    ) : tenant === null ? (
                        <div className={styles.stateMsg}>
                            This account isn't linked to a firm, so there's nothing to brand here.
                        </div>
                    ) : (
                        <div className={styles.body}>
                            <div className={styles.firmRow}>
                                <span className={styles.firmLabel}>Firm</span>
                                <span className={styles.firmName}>{tenant.company_name}</span>
                            </div>

                            {FIELDS.map(field => (
                                <div className={styles.fieldGroup} key={field.name}>
                                    <label className={styles.label} htmlFor={field.name}>
                                        {field.label}
                                    </label>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type}
                                        className={styles.input}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        disabled={saving}
                                        autoComplete="off"
                                    />
                                    <p className={styles.help}>{field.help}</p>
                                </div>
                            ))}

                            {message && (
                                <div
                                    className={
                                        status === 'error' ? styles.errorMsg : styles.successMsg
                                    }
                                >
                                    {message}
                                </div>
                            )}

                            <button
                                className={styles.saveBtn}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <><span className={styles.spinner} /> Saving…</>
                                ) : (
                                    'Save changes'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}