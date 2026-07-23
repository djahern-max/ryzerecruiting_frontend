/* src/pages/JobOrderRoster.jsx */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import styles from './JobOrderRoster.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STATUS_OPTIONS = [
    { value: 'open', label: 'Open' },
    { value: 'filled', label: 'Filled' },
    { value: 'on_hold', label: 'On Hold' },
];

const STATUS_STYLES = {
    open: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
    filled: { background: '#eff6ff', color: '#1e3a5f', border: '1px solid #bfdbfe' },
    on_hold: { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
};

function formatSalary(min, max) {
    if (!min && !max) return '—';
    const fmt = (n) => `$${Number(n).toLocaleString()}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `up to ${fmt(max)}`;
}

const EMPLOYMENT_TYPE_OPTIONS = [
    { value: '', label: '— Select type —' },
    { value: 'contract', label: 'Contract' },
    { value: 'contract_to_hire', label: 'Contract-to-Hire' },
    { value: 'direct_hire', label: 'Direct Hire' },
];

const EMPLOYMENT_TYPE_LABELS = {
    contract: 'Contract',
    contract_to_hire: 'Contract-to-Hire',
    direct_hire: 'Direct Hire',
};

function formatHourly(min, max) {
    if (!min && !max) return '—';
    const fmt = (n) => `$${Number(n).toFixed(2)}/hr`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `up to ${fmt(max)}`;
}

function formatComp(order) {
    if (order.salary_min || order.salary_max) return formatSalary(order.salary_min, order.salary_max);
    if (order.hourly_min || order.hourly_max) return formatHourly(order.hourly_min, order.hourly_max);
    return '—';
}

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.open;
    const label = status === 'on_hold' ? 'On Hold'
        : status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={styles.statusBadge} style={s}>{label}</span>;
}

// ---------------------------------------------------------------------------
// Drawer — Create / Edit
// ---------------------------------------------------------------------------
function JobOrderDrawer({ isOpen, onClose, onSaved, editOrder, employers }) {
    const [form, setForm] = useState({
        title: '', employer_profile_id: '', location: '',
        salary_min: '', salary_max: '', hourly_min: '', hourly_max: '',
        employment_type: '', status: 'open',
        requirements: '', notes: '',
    });
    const [parseText, setParseText] = useState('');
    const [showParseArea, setShowParseArea] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editOrder) {
            setForm({
                title: editOrder.title || '',
                employer_profile_id: editOrder.employer_profile_id || '',
                location: editOrder.location || '',
                salary_min: editOrder.salary_min || '',
                salary_max: editOrder.salary_max || '',
                hourly_min: editOrder.hourly_min || '',
                hourly_max: editOrder.hourly_max || '',
                employment_type: editOrder.employment_type || '',
                status: editOrder.status || 'open',
                requirements: editOrder.requirements || '',
                notes: editOrder.notes || '',
            });
        } else {
            setForm({
                title: '', employer_profile_id: '', location: '',
                salary_min: '', salary_max: '', hourly_min: '', hourly_max: '',
                employment_type: '', status: 'open',
                requirements: '', notes: '',
            });
        }
        setParseText('');
        setShowParseArea(false);
        setError('');
    }, [editOrder, isOpen]);

    async function handleParse() {
        if (!parseText.trim()) return;
        setParsing(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/job-orders/parse`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: parseText }),
            });
            if (!res.ok) throw new Error('Parse failed');
            const data = await res.json();
            setForm(prev => ({
                ...prev,
                title: data.title || prev.title,
                location: data.location || prev.location,
                salary_min: data.salary_min || prev.salary_min,
                salary_max: data.salary_max || prev.salary_max,
                hourly_min: data.hourly_min || prev.hourly_min,
                hourly_max: data.hourly_max || prev.hourly_max,
                employment_type: data.employment_type || prev.employment_type,
                requirements: data.requirements || prev.requirements,
                notes: data.notes || prev.notes,
            }));
            setShowParseArea(false);
            setParseText('');
        } catch (err) {
            setError('Parse failed — check your connection and try again.');
        } finally {
            setParsing(false);
        }
    }

    async function handleSave() {
        if (!form.title.trim()) { setError('Title is required.'); return; }
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...form,
                employer_profile_id: form.employer_profile_id ? Number(form.employer_profile_id) : null,
                salary_min: form.salary_min ? Number(form.salary_min) : null,
                salary_max: form.salary_max ? Number(form.salary_max) : null,
                hourly_min: form.hourly_min ? Number(form.hourly_min) : null,
                hourly_max: form.hourly_max ? Number(form.hourly_max) : null,
                employment_type: form.employment_type || null,
            };
            const url = editOrder
                ? `${API_BASE}/api/job-orders/${editOrder.id}`
                : `${API_BASE}/api/job-orders`;
            const res = await fetch(url, {
                method: editOrder ? 'PATCH' : 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Save failed');
            const saved = await res.json();
            onSaved(saved, !!editOrder);
            onClose();
        } catch (err) {
            setError('Save failed — check your connection and try again.');
        } finally {
            setSaving(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className={styles.drawerOverlay} onClick={onClose}>
            <div className={styles.drawer} onClick={e => e.stopPropagation()}>
                <div className={styles.drawerHeader}>
                    <h3 className={styles.drawerTitle}>
                        {editOrder ? 'Edit Job Order' : 'New Job Order'}
                    </h3>
                    <button className={styles.drawerClose} onClick={onClose}>✕</button>
                </div>

                <div className={styles.drawerBody}>
                    {/* AI Parse toggle */}
                    {!editOrder && (
                        <div>
                            <button
                                className={styles.parseToggleBtn}
                                onClick={() => setShowParseArea(v => !v)}
                            >
                                {showParseArea ? '− Hide AI Parser' : '✦ Paste job posting to auto-fill'}
                            </button>
                            {showParseArea && (
                                <div className={styles.parseArea}>
                                    <textarea
                                        className={styles.fieldTextarea}
                                        rows={6}
                                        placeholder="Paste the full job description here…"
                                        value={parseText}
                                        onChange={e => setParseText(e.target.value)}
                                    />
                                    <button
                                        className={styles.parseBtn}
                                        onClick={handleParse}
                                        disabled={parsing || !parseText.trim()}
                                    >
                                        {parsing ? 'Parsing…' : 'Extract Fields'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form fields */}
                    <div className={styles.formGrid}>
                        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                            <label className={styles.fieldLabel}>Job Title *</label>
                            <input
                                className={styles.fieldInput}
                                value={form.title}
                                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. Operations Manager"
                            />
                        </div>

                        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                            <label className={styles.fieldLabel}>Employer</label>
                            <select
                                className={styles.fieldSelect}
                                value={form.employer_profile_id}
                                onChange={e => setForm(p => ({ ...p, employer_profile_id: e.target.value }))}
                            >
                                <option value="">— No employer linked —</option>
                                {employers.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.company_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Location</label>
                            <input
                                className={styles.fieldInput}
                                value={form.location}
                                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                placeholder="e.g. Boston, MA"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Status</label>
                            <select
                                className={styles.fieldSelect}
                                value={form.status}
                                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                            >
                                {STATUS_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Salary Min</label>
                            <input
                                className={styles.fieldInput}
                                type="number"
                                value={form.salary_min}
                                onChange={e => setForm(p => ({ ...p, salary_min: e.target.value }))}
                                placeholder="e.g. 50000"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Salary Max</label>
                            <input
                                className={styles.fieldInput}
                                type="number"
                                value={form.salary_max}
                                onChange={e => setForm(p => ({ ...p, salary_max: e.target.value }))}
                                placeholder="e.g. 80000"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Hourly Min</label>
                            <input
                                className={styles.fieldInput}
                                type="number"
                                step="0.01"
                                value={form.hourly_min}
                                onChange={e => setForm(p => ({ ...p, hourly_min: e.target.value }))}
                                placeholder="e.g. 25.00"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Hourly Max</label>
                            <input
                                className={styles.fieldInput}
                                type="number"
                                step="0.01"
                                value={form.hourly_max}
                                onChange={e => setForm(p => ({ ...p, hourly_max: e.target.value }))}
                                placeholder="e.g. 40.00"
                            />
                        </div>

                        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                            <label className={styles.fieldLabel}>Employment Type</label>
                            <select
                                className={styles.fieldSelect}
                                value={form.employment_type}
                                onChange={e => setForm(p => ({ ...p, employment_type: e.target.value }))}
                            >
                                {EMPLOYMENT_TYPE_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                            <label className={styles.fieldLabel}>Requirements</label>
                            <textarea
                                className={styles.fieldTextarea}
                                rows={5}
                                value={form.requirements}
                                onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))}
                                placeholder="Key qualifications and responsibilities…"
                            />
                        </div>

                        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                            <label className={styles.fieldLabel}>Recruiter Notes</label>
                            <textarea
                                className={styles.fieldTextarea}
                                rows={3}
                                value={form.notes}
                                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                placeholder="Internal notes — not visible to candidates…"
                            />
                        </div>
                    </div>

                    {error && <div className={styles.drawerError}>{error}</div>}
                </div>

                <div className={styles.drawerFooter}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : editOrder ? 'Save Changes' : 'Create Job Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function JobOrderRoster() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editOrder, setEditOrder] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const [ordersRes, employersRes] = await Promise.all([
                    fetch(`${API_BASE}/api/job-orders`, { headers }),
                    fetch(`${API_BASE}/api/employer-profiles`, { headers }),
                ]);
                if (!ordersRes.ok) throw new Error('Failed to load job orders');
                const [ordersData, employersData] = await Promise.all([
                    ordersRes.json(),
                    employersRes.ok ? employersRes.json() : [],
                ]);
                setOrders(ordersData);
                setEmployers(employersData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    function handleSaved(saved, isEdit) {
        if (isEdit) {
            setOrders(prev => prev.map(o => o.id === saved.id ? saved : o));
        } else {
            setOrders(prev => [saved, ...prev]);
        }
    }

    function openCreate() { setEditOrder(null); setDrawerOpen(true); }
    function openEdit(order) { setEditOrder(order); setDrawerOpen(true); }

    async function handleDelete(order) {
        if (!window.confirm(`Delete "${order.title}"? This cannot be undone.`)) return;
        setDeletingId(order.id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/job-orders/${order.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Delete failed');
            setOrders(prev => prev.filter(o => o.id !== order.id));
        } catch (err) {
            alert('Error deleting job order: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    }

    function getEmployerName(employerProfileId) {
        if (!employerProfileId) return null;
        const emp = employers.find(e => e.id === employerProfileId);
        return emp?.company_name || null;
    }

    const total = orders.length;
    const open = orders.filter(o => o.status === 'open').length;
    const filled = orders.filter(o => o.status === 'filled').length;
    const onHold = orders.filter(o => o.status === 'on_hold').length;

    const hasOrders = !loading && !error && orders.length > 0;

    return (
        <div className={styles.page}>
            <AdminHeader active="job-orders" />

            <main className={styles.main}>

                {/* Page header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.pageTitle}>Job Orders</h2>
                        <p className={styles.pageSub}>Active requisitions and placement pipeline.</p>
                    </div>
                    <button className={styles.newBtn} onClick={openCreate}>
                        <i className="fi fi-rr-plus" />
                        New Job Order
                    </button>
                </div>

                {/* Stats row */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <i className={`fi fi-rr-briefcase ${styles.statIcon} ${styles.statIconTotal}`} />
                        <div>
                            <div className={styles.statNum}>{total}</div>
                            <div className={styles.statLabel}>Total</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <i className={`fi fi-rr-check-circle ${styles.statIcon} ${styles.statIconOpen}`} />
                        <div>
                            <div className={`${styles.statNum} ${styles.statNumOpen}`}>{open}</div>
                            <div className={styles.statLabel}>Open</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <i className={`fi fi-rr-trophy ${styles.statIcon} ${styles.statIconFilled}`} />
                        <div>
                            <div className={`${styles.statNum} ${styles.statNumFilled}`}>{filled}</div>
                            <div className={styles.statLabel}>Filled</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <i className={`fi fi-rr-pause-circle ${styles.statIcon} ${styles.statIconHold}`} />
                        <div>
                            <div className={`${styles.statNum} ${styles.statNumHold}`}>{onHold}</div>
                            <div className={styles.statLabel}>On Hold</div>
                        </div>
                    </div>
                </div>

                {/* Loading / error / empty states */}
                {loading && <div className={styles.emptyState}>Loading job orders…</div>}
                {error && <div className={styles.errorState}>{error}</div>}
                {!loading && !error && orders.length === 0 && (
                    <div className={styles.emptyState}>
                        No job orders yet.{' '}
                        <button className={styles.emptyCreateBtn} onClick={openCreate}>
                            Create your first one →
                        </button>
                    </div>
                )}

                {/* ── Desktop table ── */}
                {hasOrders && (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Employer</th>
                                    <th>Location</th>
                                    <th>Compensation</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className={styles.row}>
                                        <td className={styles.titleCell}>
                                            <button
                                                className={styles.titleLink}
                                                onClick={() => navigate(`/admin/job-orders/${order.id}`)}
                                            >
                                                {order.title}
                                            </button>
                                        </td>
                                        <td className={styles.employerCell}>
                                            {getEmployerName(order.employer_profile_id) || (
                                                <span className={styles.empty}>—</span>
                                            )}
                                        </td>
                                        <td>{order.location || <span className={styles.empty}>—</span>}</td>
                                        <td className={styles.salaryCell}>
                                            {formatComp(order)}
                                        </td>
                                        <td><StatusBadge status={order.status} /></td>
                                        <td className={styles.dateCell}>
                                            {order.created_at
                                                ? new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })
                                                : '—'}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.viewBtn}
                                                    onClick={() => navigate(`/admin/job-orders/${order.id}`)}
                                                    title="View detail"
                                                >
                                                    <i className="fi fi-rr-eye" />
                                                </button>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => openEdit(order)}
                                                    title="Edit"
                                                >
                                                    <i className="fi fi-rr-pencil" />
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(order)}
                                                    disabled={deletingId === order.id}
                                                    title="Delete"
                                                >
                                                    <i className="fi fi-rr-trash" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Mobile card list ── */}
                {hasOrders && (
                    <div className={styles.cardList}>
                        {orders.map(order => {
                            const employerName = getEmployerName(order.employer_profile_id);
                            const salary = formatComp(order);
                            return (
                                <div key={order.id} className={styles.orderCard}>
                                    {/* Clickable main area */}
                                    <div
                                        className={styles.cardMain}
                                        onClick={() => navigate(`/admin/job-orders/${order.id}`)}
                                    >
                                        <div className={styles.cardTitle}>{order.title}</div>
                                        {employerName && (
                                            <div className={styles.cardEmployer}>{employerName}</div>
                                        )}
                                        <div className={styles.cardMeta}>
                                            {order.location && <span>{order.location}</span>}
                                            {order.location && salary !== '—' && (
                                                <span className={styles.cardMetaDot}>·</span>
                                            )}
                                            {salary !== '—' && <span>{salary}</span>}
                                        </div>
                                    </div>

                                    {/* Footer: badge + actions */}
                                    <div className={styles.cardFooter}>
                                        <StatusBadge status={order.status} />
                                        <div className={styles.cardActions}>
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() => navigate(`/admin/job-orders/${order.id}`)}
                                                title="View"
                                            >
                                                <i className="fi fi-rr-eye" />
                                            </button>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => openEdit(order)}
                                                title="Edit"
                                            >
                                                <i className="fi fi-rr-pencil" />
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(order)}
                                                disabled={deletingId === order.id}
                                                title="Delete"
                                            >
                                                <i className="fi fi-rr-trash" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </main>

            <JobOrderDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditOrder(null); }}
                onSaved={handleSaved}
                editOrder={editOrder}
                employers={employers}
            />
        </div>
    );
}