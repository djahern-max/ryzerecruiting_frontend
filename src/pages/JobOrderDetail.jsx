/* src/pages/JobOrderDetail.jsx */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import styles from './JobOrderDetail.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STATUS_STYLES = {
    open: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
    filled: { background: '#eff6ff', color: '#1e3a5f', border: '1px solid #bfdbfe' },
    on_hold: { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
};

const STATUS_OPTIONS = [
    { value: 'open', label: 'Open' },
    { value: 'filled', label: 'Filled' },
    { value: 'on_hold', label: 'On Hold' },
];

function formatSalary(min, max) {
    if (!min && !max) return null;
    const fmt = (n) => `$${Number(n).toLocaleString()}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `up to ${fmt(max)}`;
}

const EMPLOYMENT_TYPE_LABELS = {
    contract: 'Contract',
    contract_to_hire: 'Contract-to-Hire',
    direct_hire: 'Direct Hire',
};

function formatHourly(min, max) {
    if (!min && !max) return null;
    const fmt = (n) => `$${Number(n).toFixed(2)}/hr`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `up to ${fmt(max)}`;
}

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.open;
    const label = status === 'on_hold' ? 'On Hold'
        : status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={styles.statusBadge} style={s}>{label}</span>;
}

function MatchBar({ score }) {
    const pct = Math.round((score ?? 0) * 100);
    const color = pct >= 80 ? '#15803d' : pct >= 60 ? '#0a66c2' : '#94a3b8';
    return (
        <div className={styles.matchBarWrap}>
            <div className={styles.matchBarTrack}>
                <div
                    className={styles.matchBarFill}
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
            <span className={styles.matchPct} style={{ color }}>{pct}%</span>
        </div>
    );
}

export default function JobOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [employer, setEmployer] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusVal, setStatusVal] = useState('');
    const [savingStatus, setSavingStatus] = useState(false);
    const [statusSaved, setStatusSaved] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        async function fetchAll() {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const orderRes = await fetch(`${API_BASE}/api/job-orders/${id}`, { headers });
                if (!orderRes.ok) throw new Error('Job order not found');
                const orderData = await orderRes.json();
                setOrder(orderData);
                setStatusVal(orderData.status);

                // Fetch employer profile if linked
                if (orderData.employer_profile_id) {
                    fetch(`${API_BASE}/api/employer-profiles/${orderData.employer_profile_id}`, { headers })
                        .then(r => r.ok ? r.json() : null)
                        .then(data => setEmployer(data))
                        .catch(() => null);
                }

                // Fetch candidate matches
                fetch(`${API_BASE}/api/job-orders/${id}/candidate-matches?limit=10`, { headers })
                    .then(r => r.ok ? r.json() : [])
                    .then(data => setMatches(data))
                    .catch(() => []);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, [id]);

    async function handleStatusSave() {
        if (statusVal === order.status) return;
        setSavingStatus(true);
        try {
            const token = localStorage.getItem('token');
            const payload = { status: statusVal };
            if (statusVal === 'filled' && order.status !== 'filled') {
                payload.filled_at = new Date().toISOString();
            }
            const res = await fetch(`${API_BASE}/api/job-orders/${id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to update status');
            const updated = await res.json();
            setOrder(updated);
            setStatusSaved(true);
            setTimeout(() => setStatusSaved(false), 2000);
        } catch (err) {
            alert('Error updating status: ' + err.message);
        } finally {
            setSavingStatus(false);
        }
    }

    async function handleDownloadPdf() {
        setDownloading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/job-orders/${id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('PDF generation failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${order.title.replace(/\s+/g, '_')}_JobOrder.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error downloading PDF: ' + err.message);
        } finally {
            setDownloading(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm(`Delete "${order?.title}"? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/job-orders/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Delete failed');
            navigate('/admin/job-orders');
        } catch (err) {
            alert('Error deleting: ' + err.message);
        }
    }

    // ── Loading / Error states ──
    if (loading) {
        return (
            <div className={styles.page}>
                <AdminHeader active="job-orders" />
                <div className={styles.loadingState}>
                    <div className={styles.loadingDots}>
                        <span /><span /><span />
                    </div>
                    <p>Loading job order…</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className={styles.page}>
                <AdminHeader active="job-orders" />
                <div className={styles.errorState}>
                    <p>{error || 'Job order not found'}</p>
                    <button className={styles.backBtn} onClick={() => navigate('/admin/job-orders')}>
                        ← Back to Job Orders
                    </button>
                </div>
            </div>
        );
    }

    const salary = formatSalary(order.salary_min, order.salary_max);
    const hourly = formatHourly(order.hourly_min, order.hourly_max);
    const employmentTypeLabel = EMPLOYMENT_TYPE_LABELS[order.employment_type] || null;
    const companyInitial = employer?.company_name?.charAt(0).toUpperCase() ?? '?';

    return (
        <div className={styles.page}>
            <AdminHeader active="job-orders" />

            <main className={styles.main}>
                {/* Back link */}
                <button className={styles.backBtn} onClick={() => navigate('/admin/job-orders')}>
                    ← Back to Job Orders
                </button>

                {/* ── Hero Banner ── */}
                <div
                    className={styles.heroBanner}
                    style={employer?.banner_url
                        ? { backgroundImage: `url(${employer.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : {}}
                />

                {/* ── Identity Zone ── */}
                <div className={styles.identityZone}>
                    <div className={styles.identityLeft}>
                        {/* Employer logo or initial */}
                        <div className={styles.logoWrap}>
                            {employer?.logo_url
                                ? <img src={employer.logo_url} alt={employer.company_name} className={styles.logoImg} />
                                : <div className={styles.logoInitial}>{companyInitial}</div>
                            }
                        </div>

                        <div className={styles.identityInfo}>
                            <h1 className={styles.jobTitle}>{order.title}</h1>
                            <div className={styles.jobMeta}>
                                {employer && (
                                    <button
                                        className={styles.employerLink}
                                        onClick={() => navigate(`/admin/employers/${order.employer_profile_id}`)}
                                    >
                                        {employer.company_name}
                                    </button>
                                )}
                                {order.location && (
                                    <>
                                        {employer && <span className={styles.metaDot}>·</span>}
                                        <span>{order.location}</span>
                                    </>
                                )}
                                {salary && (
                                    <>
                                        <span className={styles.metaDot}>·</span>
                                        <span>{salary}</span>
                                    </>
                                )}
                            </div>
                            <div className={styles.badgeRow}>
                                <StatusBadge status={order.status} />
                                {matches.length > 0 && (
                                    <span className={styles.matchCountBadge}>
                                        {matches.length} candidate match{matches.length !== 1 ? 'es' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.identityActions}>
                        <button
                            className={styles.actionBtn}
                            onClick={handleDownloadPdf}
                            disabled={downloading}
                            title="Download PDF"
                        >
                            <i className="fi fi-rr-download" />
                            {downloading ? 'Generating…' : 'PDF'}
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={() => navigate(`/admin/job-orders?edit=${id}`)}
                            title="Edit"
                        >
                            <i className="fi fi-rr-pencil" />
                            Edit
                        </button>
                        <button
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={handleDelete}
                            title="Delete"
                        >
                            <i className="fi fi-rr-trash" />
                            Delete
                        </button>
                    </div>
                </div>

                {/* ── Two-column body ── */}
                <div className={styles.bodyGrid}>

                    {/* ── Main column ── */}
                    <div className={styles.mainCol}>

                        {/* Requirements */}
                        {order.requirements && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Requirements</div>
                                <div className={styles.bodyCardBody}>
                                    <p className={styles.requirementsText}>{order.requirements}</p>
                                </div>
                            </div>
                        )}

                        {/* Recruiter Notes */}
                        {order.notes && (
                            <div className={`${styles.bodyCard} ${styles.notesCard}`}>
                                <div className={styles.bodyCardTitle}>Recruiter Notes</div>
                                <div className={styles.bodyCardBody}>
                                    <p className={styles.bodyText}>{order.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Candidate Matches */}
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>
                                Candidate Matches
                                {matches.length > 0 && (
                                    <span className={styles.matchTitleCount}>{matches.length}</span>
                                )}
                            </div>
                            <div className={styles.bodyCardBody}>
                                {matches.length === 0 ? (
                                    <p className={styles.emptyMatches}>
                                        No matches yet. Make sure this job order is indexed for AI search.
                                    </p>
                                ) : (
                                    <div className={styles.matchList}>
                                        {matches.map((m, i) => (
                                            <div key={m.id ?? i} className={styles.matchRow}>
                                                <div className={styles.matchRank}>#{i + 1}</div>
                                                <div className={styles.matchInfo}>
                                                    <button
                                                        className={styles.matchName}
                                                        onClick={() => navigate(`/admin/candidates/${m.id}`)}
                                                    >
                                                        {m.display_name ?? m.name}
                                                    </button>
                                                    {m.current_title && (
                                                        <span className={styles.matchTitle}>{m.current_title}</span>
                                                    )}
                                                </div>
                                                <MatchBar score={m.match_score ?? m.score} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Side column ── */}
                    <div className={styles.sideCol}>

                        {/* Job Info */}
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Job Details</div>
                            <div className={styles.bodyCardBody}>
                                <div className={styles.infoList}>
                                    {employer && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Employer</span>
                                            <button
                                                className={styles.infoLink}
                                                onClick={() => navigate(`/admin/employers/${order.employer_profile_id}`)}
                                            >
                                                {employer.company_name}
                                            </button>
                                        </div>
                                    )}
                                    {order.location && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Location</span>
                                            <span className={styles.infoValue}>{order.location}</span>
                                        </div>
                                    )}
                                    {salary && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Salary</span>
                                            <span className={styles.infoValue}>{salary}</span>
                                        </div>
                                    )}
                                    {hourly && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Hourly Rate</span>
                                            <span className={styles.infoValue}>{hourly}</span>
                                        </div>
                                    )}
                                    {employmentTypeLabel && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Type</span>
                                            <span className={styles.infoValue}>{employmentTypeLabel}</span>
                                        </div>
                                    )}
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Status</span>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    {order.created_at && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Created</span>
                                            <span className={styles.infoValue}>
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {order.filled_at && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Filled</span>
                                            <span className={styles.infoValue}>
                                                {new Date(order.filled_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status Update */}
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Update Status</div>
                            <div className={styles.bodyCardBody}>
                                <select
                                    className={styles.statusSelect}
                                    value={statusVal}
                                    onChange={e => { setStatusVal(e.target.value); setStatusSaved(false); }}
                                >
                                    {STATUS_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <button
                                    className={styles.statusSaveBtn}
                                    onClick={handleStatusSave}
                                    disabled={savingStatus || statusVal === order.status}
                                >
                                    {savingStatus ? 'Saving…' : statusSaved ? '✓ Saved' : 'Save Status'}
                                </button>
                            </div>
                        </div>

                        {/* Employer Quick View */}
                        {employer && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Employer</div>
                                <div className={styles.bodyCardBody}>
                                    <div className={styles.employerQuick}>
                                        <div className={styles.employerQuickLogo}>
                                            {employer.logo_url
                                                ? <img src={employer.logo_url} alt={employer.company_name} className={styles.employerQuickImg} />
                                                : <div className={styles.employerQuickInitial}>{companyInitial}</div>
                                            }
                                        </div>
                                        <div>
                                            <div className={styles.employerQuickName}>{employer.company_name}</div>
                                            {employer.ai_industry && (
                                                <div className={styles.employerQuickMeta}>{employer.ai_industry}</div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className={styles.viewEmployerBtn}
                                        onClick={() => navigate(`/admin/employers/${order.employer_profile_id}`)}
                                    >
                                        View Employer Profile →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}