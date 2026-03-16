/* src/pages/EmployerRoster.jsx */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './EmployerRoster.module.css';
import AdminHeader from '../components/AdminHeader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const RELATIONSHIP_OPTIONS = [
    { value: '', label: 'Set status...' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'active_client', label: 'Active Client' },
    { value: 'placed', label: 'Placed' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'not_a_fit', label: 'Not a Fit' },
];

const STATUS_STYLES = {
    prospect: { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
    active_client: { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' },
    placed: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
    inactive: { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' },
    not_a_fit: { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' },
};

function EmployerRow({ profile, onUpdate }) {
    const [expanded, setExpanded] = useState(false);
    const [notes, setNotes] = useState(profile.recruiter_notes || '');
    const [editingNotes, setEditingNotes] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);
    const [status, setStatus] = useState(profile.relationship_status || '');

    async function saveNotes() {
        setSavingNotes(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/employer-profiles/${profile.id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recruiter_notes: notes }),
            });

            if (!res.ok) throw new Error('Failed to save notes');

            const updated = await res.json();
            onUpdate(updated);
            setEditingNotes(false);
        } catch (err) {
            alert('Error saving notes: ' + (err?.message || String(err)));
        } finally {
            setSavingNotes(false);
        }
    }

    async function saveStatus(newStatus) {
        setStatus(newStatus);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/employer-profiles/${profile.id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ relationship_status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            const updated = await res.json();
            onUpdate(updated);
        } catch (err) {
            alert('Error updating status: ' + (err?.message || String(err)));
        }
    }

    // Parse hiring needs from raw if structured fields empty
    function getHiringNeeds() {
        if (profile.ai_hiring_needs?.length) return profile.ai_hiring_needs;

        if (profile.ai_brief_raw) {
            try {
                const cleaned = profile.ai_brief_raw
                    .replace(/^```json\s*/m, '')
                    .replace(/^```\s*/m, '')
                    .replace(/\s*```$/m, '')
                    .trim();

                const parsed = JSON.parse(cleaned);
                return parsed.hiring_needs || [];
            } catch {
                return [];
            }
        }

        return [];
    }

    const hiringNeeds = getHiringNeeds();

    return (
        <>
            <tr className={`${styles.row} ${expanded ? styles.rowExpanded : ''}`}>
                <td className={styles.companyCell}>
                    <div className={styles.companyName}>{profile.company_name}</div>

                    {profile.website_url && (
                        <a
                            href={
                                profile.website_url.startsWith('http')
                                    ? profile.website_url
                                    : `https://${profile.website_url}`
                            }
                            className={styles.websiteLink}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {profile.website_url.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                </td>

                <td>{profile.ai_industry || <span className={styles.empty}>—</span>}</td>
                <td>{profile.ai_company_size || <span className={styles.empty}>—</span>}</td>

                <td>
                    <select
                        className={styles.statusSelect}
                        value={status}
                        onChange={e => saveStatus(e.target.value)}
                    >
                        {RELATIONSHIP_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>

                </td>

                {/* <td>
                    {profile.primary_contact_email ? (
                        <a href={`mailto:${profile.primary_contact_email}`} className={styles.emailLink}>
                            {profile.primary_contact_email}
                        </a>
                    ) : (
                        <span className={styles.empty}>—</span>
                    )}
                </td> */}

                <td>
                    <button
                        className={`${styles.expandBtn} ${expanded ? styles.expandBtnActive : ''}`}
                        onClick={() => setExpanded(p => !p)}
                        title={expanded ? 'Collapse' : 'View intelligence brief'}
                        type="button"
                    >
                        {expanded ? '▲ Hide' : '▼ Brief'}
                    </button>
                </td>
            </tr>

            {expanded && (
                <tr className={styles.detailRow}>
                    <td colSpan={5} className={styles.detailCell}>
                        <div className={styles.detailPanel}>
                            {/* Overview + Size/Industry */}
                            {profile.ai_company_overview && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>Company Overview</div>
                                    <div className={styles.detailContent}>{profile.ai_company_overview}</div>
                                </div>
                            )}

                            {/* Hiring Needs */}
                            {hiringNeeds.length > 0 && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>Likely Hiring Needs</div>
                                    <div className={styles.tagRow}>
                                        {hiringNeeds.map((need, i) => (
                                            <span key={i} className={styles.tag}>
                                                {need}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Talking Points */}
                            {profile.ai_talking_points?.length > 0 && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>Key Talking Points</div>
                                    <ul className={styles.detailList}>
                                        {profile.ai_talking_points.map((pt, i) => (
                                            <li key={i}>{pt}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Red Flags */}
                            {profile.ai_red_flags && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>⚠️ Red Flags</div>
                                    <div className={styles.redFlags}>{profile.ai_red_flags}</div>
                                </div>
                            )}

                            {/* Recruiter Notes */}
                            <div className={styles.detailSection}>
                                <div className={styles.detailLabel}>📝 Recruiter Notes</div>

                                {editingNotes ? (
                                    <div className={styles.notesEditor}>
                                        <textarea
                                            className={styles.notesTextarea}
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            rows={4}
                                            placeholder="Add your post-call notes here..."
                                            autoFocus
                                        />
                                        <div className={styles.notesActions}>
                                            <button
                                                className={styles.saveBtn}
                                                onClick={saveNotes}
                                                disabled={savingNotes}
                                                type="button"
                                            >
                                                {savingNotes ? 'Saving…' : 'Save Notes'}
                                            </button>
                                            <button
                                                className={styles.cancelBtn}
                                                onClick={() => {
                                                    setNotes(profile.recruiter_notes || '');
                                                    setEditingNotes(false);
                                                }}
                                                type="button"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={styles.notesDisplay}
                                        onClick={() => setEditingNotes(true)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') setEditingNotes(true);
                                        }}
                                    >
                                        {notes || (
                                            <span className={styles.notesPlaceholder}>
                                                Click to add recruiter notes…
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default function EmployerRoster() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProfiles() {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE}/api/employer-profiles`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error('Failed to load employer profiles');

                const data = await res.json();
                setProfiles(data);
            } catch (err) {
                setError(err?.message || String(err));
            } finally {
                setLoading(false);
            }
        }

        fetchProfiles();
    }, []);

    function handleUpdate(updated) {
        setProfiles(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    }

    // (kept if you want later)
    // const firstName = user?.full_name?.split(' ')[0] || 'there';

    return (
        <div className={styles.page}>
            <AdminHeader active="employers" />

            <main className={styles.main}>
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>Employer Roster</h2>
                        <p className={styles.pageSub}>
                            All companies you've engaged with — enriched with AI intelligence.
                        </p>
                    </div>
                    <div className={styles.countBadge}>
                        {profiles.length} {profiles.length === 1 ? 'Company' : 'Companies'}
                    </div>
                </div>

                {loading ? (
                    <div className={styles.emptyState}>Loading employers…</div>
                ) : error ? (
                    <div className={styles.errorState}>{error}</div>
                ) : profiles.length === 0 ? (
                    <div className={styles.emptyState}>
                        No employer profiles yet. Confirm a booking to generate the first one.
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Industry</th>
                                    <th>Est. Size</th>
                                    <th>Status</th>
                                    {/* <th>Contact</th> */}
                                    <th>Intel</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map(profile => (
                                    <EmployerRow key={profile.id} profile={profile} onUpdate={handleUpdate} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}