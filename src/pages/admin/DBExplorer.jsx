/* src/pages/admin/DBExplorer.jsx */
import { useState, useEffect, useCallback } from "react";
import AdminHeader from "../../components/AdminHeader";
import styles from "./DBExplorer.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TABLES = [
    "bookings", "candidates", "employer_profiles",
    "job_orders", "chat_sessions", "chat_messages",
    "users", "waitlist", "contacts", "webhook_logs",
];

const SUMMARY_COLS = {
    bookings: ["id", "booking_type", "status", "employer_name", "company_name", "date", "time_slot", "call_outcome"],
    candidates: ["id", "name", "current_title", "current_company", "location", "ai_career_level", "ai_years_experience", "created_at"],
    employer_profiles: ["id", "company_name", "website_url", "ai_industry", "primary_contact_email", "relationship_status", "created_at"],
    job_orders: ["id", "title", "location", "status", "salary_min", "salary_max", "employer_profile_id", "created_at"],
    chat_sessions: ["id", "user_id", "title", "created_at", "updated_at"],
    chat_messages: ["id", "session_id", "role", "content", "created_at"],
    users: ["id", "email", "full_name", "user_type", "oauth_provider", "tenant_id", "created_at"],
    waitlist: ["id", "email", "intent", "source", "created_at"],
    contacts: ["id", "name", "email", "message"],
    webhook_logs: ["id", "event", "meeting_id", "booking_found", "result", "received_at"],
};

const EDITABLE_COLS = {
    bookings: ["status", "call_outcome", "call_notes", "notes", "company_name", "website_url", "phone", "date", "time_slot", "meeting_summary", "meeting_next_steps", "meeting_keywords"],
    candidates: ["name", "email", "phone", "linkedin_url", "current_title", "current_company", "location", "notes", "ai_career_level", "ai_years_experience", "ai_certifications", "ai_summary", "ai_experience", "ai_education", "ai_outreach_message"],
    employer_profiles: ["company_name", "website_url", "primary_contact_email", "phone", "relationship_status", "recruiter_notes", "ai_industry", "ai_company_size", "ai_company_overview", "ai_hiring_needs", "ai_talking_points", "ai_red_flags"],
    job_orders: ["title", "location", "salary_min", "salary_max", "requirements", "notes", "status"],
    users: ["full_name", "is_active"],
    waitlist: ["intent"],
    chat_sessions: [],
    chat_messages: [],
    contacts: [],
    webhook_logs: [],
};

const FK_MAP = {
    employer_profile_id: "employer_profiles",
    candidate_id: "candidates",
    user_id: "users",
    session_id: "chat_sessions",
    employer_id: "users",
};

const STATUS_FIELDS = new Set(["status", "user_type", "intent", "booking_type", "call_outcome"]);

const BADGE_COLORS = {
    pending: "amber", confirmed: "green", cancelled: "red",
    completed: "green", complete: "green", failed: "red",
    ADMIN: "red", CANDIDATE: "blue", EMPLOYER: "amber",
    hiring: "amber", job_seeking: "blue", following: "gray",
    google: "blue", linkedin: "blue",
    inbound: "blue", outbound_employer: "teal",
    outbound_candidate: "teal", inbound_candidate: "blue",
    placed: "green", not_a_fit: "red", follow_up: "amber", no_show: "red",
    open: "green", filled: "blue", on_hold: "amber",
    yes: "green", no: "red", "n/a": "gray",
};

const LONG_TEXT_FIELDS = new Set([
    "meeting_summary", "meeting_next_steps", "meeting_transcript", "meeting_keywords", "call_notes",
    "ai_summary", "ai_experience", "ai_education", "ai_outreach_message", "linkedin_raw_text", "notes",
    "ai_company_overview", "ai_hiring_needs", "ai_talking_points", "ai_red_flags", "ai_brief_raw", "recruiter_notes", "raw_text",
    "requirements", "content", "structured_data", "message",
    "raw_payload",
]);

function FieldValue({ fieldKey, value, onFkClick }) {
    if (value === null || value === undefined || value === "") return <span className={styles.nullVal}>—</span>;
    if (typeof value === "boolean") return <span className={`${styles.badge} ${value ? styles.badgeGreen : styles.badgeGray}`}>{String(value)}</span>;
    if (STATUS_FIELDS.has(fieldKey)) {
        const color = BADGE_COLORS[String(value)] || "gray";
        return <span className={`${styles.badge} ${styles["badge" + color.charAt(0).toUpperCase() + color.slice(1)]}`}>{String(value)}</span>;
    }
    if (fieldKey === "booking_found") {
        const color = BADGE_COLORS[String(value)] || "gray";
        return <span className={`${styles.badge} ${styles["badge" + color.charAt(0).toUpperCase() + color.slice(1)]}`}>{String(value)}</span>;
    }
    if (fieldKey in FK_MAP && value && onFkClick) {
        return <button className={styles.fkLink} onClick={e => { e.stopPropagation(); onFkClick(FK_MAP[fieldKey], value); }}>→ {FK_MAP[fieldKey]} #{value}</button>;
    }
    if ((fieldKey.endsWith("_at") || fieldKey.endsWith("_time") || fieldKey === "date") && typeof value === "string") {
        try {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                if (fieldKey === "date") return <span className={styles.timestamp}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>;
                return <span className={styles.timestamp}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>;
            }
        } catch (_) { }
    }
    const str = String(value);
    if (str.length > 80) return <span className={styles.truncated} title={str}>{str.slice(0, 80)}…</span>;
    return <span>{str}</span>;
}

function TranscriptBadge({ value }) {
    if (!value) return <span className={`${styles.badge} ${styles.badgeGray}`}>no transcript</span>;
    return <span className={`${styles.badge} ${styles.badgeGreen}`}>{value.split("\n").filter(Boolean).length} lines ✓</span>;
}

function EmbeddingBadge({ value }) {
    if (!value) return <span className={`${styles.badge} ${styles.badgeGray}`}>not embedded</span>;
    return <span className={`${styles.badge} ${styles.badgeGreen}`}>embedded ✓</span>;
}

function DetailPanel({ row, columns, table, onFkClick, onSaved, onDeleted }) {
    const [expandedFields, setExpandedFields] = useState(new Set());
    const [editing, setEditing] = useState(false);
    const [editValues, setEditValues] = useState({});
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [actionError, setActionError] = useState(null);

    const editableSet = new Set(EDITABLE_COLS[table] || []);

    function startEdit() {
        const init = {};
        columns.forEach(k => { if (editableSet.has(k)) init[k] = row[k] ?? ""; });
        setEditValues(init); setEditing(true); setActionError(null);
    }

    async function saveEdit() {
        setSaving(true); setActionError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/admin/db/records/${table}/${row.id}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(editValues),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || "Save failed"); }
            setEditing(false); onSaved();
        } catch (err) { setActionError(err.message); }
        finally { setSaving(false); }
    }

    async function doDelete() {
        setDeleting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/admin/db/records/${table}/${row.id}`, {
                method: "DELETE", headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || "Delete failed"); }
            onDeleted(row.id);
        } catch (err) { setActionError(err.message); setDeleting(false); setConfirmDelete(false); }
    }

    function toggleField(key) {
        setExpandedFields(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
    }

    return (
        <div className={styles.detailPanel}>
            <div className={styles.detailActions} onClick={e => e.stopPropagation()}>
                {!editing && !confirmDelete && editableSet.size > 0 && (
                    <button className={styles.editBtn} onClick={startEdit}>✎ Edit</button>
                )}
                {editing && (
                    <>
                        <button className={styles.saveBtn} onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "✓ Save"}</button>
                        <button className={styles.cancelEditBtn} onClick={() => { setEditing(false); setActionError(null); }}>✕ Cancel</button>
                    </>
                )}
                {!editing && !confirmDelete && (
                    <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>🗑 Delete</button>
                )}
                {confirmDelete && !editing && (
                    <div className={styles.deleteConfirm}>
                        <span className={styles.deleteConfirmText}>Delete #{row.id}? Cannot be undone.</span>
                        <button className={styles.confirmDeleteBtn} onClick={doDelete} disabled={deleting}>{deleting ? "Deleting…" : "Yes, delete"}</button>
                        <button className={styles.cancelEditBtn} onClick={() => setConfirmDelete(false)}>Cancel</button>
                    </div>
                )}
                {actionError && <span className={styles.actionError}>{actionError}</span>}
            </div>

            {columns.map((key) => {
                const raw = row[key];
                const isEditable = editing && editableSet.has(key);
                const isLong = LONG_TEXT_FIELDS.has(key);
                const hasValue = raw !== null && raw !== undefined && raw !== "";
                const isExpanded = expandedFields.has(key);
                return (
                    <div key={key} className={styles.detailRow}>
                        <span className={`${styles.detailKey} ${isEditable ? styles.detailKeyEditing : ""}`}>{key}</span>
                        <span className={styles.detailVal}>
                            {isEditable ? (
                                LONG_TEXT_FIELDS.has(key)
                                    ? <textarea className={styles.editTextarea} value={editValues[key] ?? ""} rows={4} onChange={e => setEditValues(p => ({ ...p, [key]: e.target.value }))} onClick={e => e.stopPropagation()} />
                                    : <input className={styles.editInput} value={editValues[key] ?? ""} onChange={e => setEditValues(p => ({ ...p, [key]: e.target.value }))} onClick={e => e.stopPropagation()} />
                            ) : key === "embedded_at" ? <EmbeddingBadge value={raw} />
                                : key === "meeting_transcript" ? <TranscriptBadge value={raw} />
                                    : isLong && hasValue ? (
                                        <>
                                            <button className={styles.expandBtn} onClick={e => { e.stopPropagation(); toggleField(key); }}>
                                                {isExpanded ? "▲ hide" : `▼ ${String(raw).split("\n").filter(Boolean).length} lines`}
                                            </button>
                                            {isExpanded && <pre className={styles.longText}>{String(raw)}</pre>}
                                        </>
                                    ) : <FieldValue fieldKey={key} value={raw} onFkClick={onFkClick} />}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function DBExplorer() {
    const [activeTable, setActiveTable] = useState("bookings");
    const [records, setRecords] = useState([]);
    const [columns, setColumns] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [offset, setOffset] = useState(0);
    const PAGE_SIZE = 25;

    const [counts, setCounts] = useState({});
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState("desc");
    const [showFilter, setShowFilter] = useState(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [exportLoading, setExportLoading] = useState(false);

    const fetchCounts = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/admin/db/counts`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setCounts(await res.json());
        } catch (_) { }
    }, []);

    useEffect(() => { fetchCounts(); }, [fetchCounts]);

    const fetchData = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const params = new URLSearchParams({ table: activeTable, limit: String(PAGE_SIZE), offset: String(offset) });
            if (search) params.set("search", search);
            if (sortCol) { params.set("sort_col", sortCol); params.set("sort_dir", sortDir); }
            if (dateFrom) params.set("date_from", dateFrom);
            if (dateTo) params.set("date_to", dateTo);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/admin/db/explorer?${params}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || `Request failed (${res.status})`); }
            const data = await res.json();
            setRecords(data.rows || []); setColumns(data.columns || []); setTotal(data.total || 0);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }, [activeTable, offset, search, sortCol, sortDir, dateFrom, dateTo]);

    useEffect(() => { fetchData(); }, [fetchData]);

    function switchTable(t) {
        setActiveTable(t); setOffset(0); setSearch(""); setSearchInput(""); setExpandedId(null);
        setSortCol(null); setSortDir("desc"); setDateFrom(""); setDateTo(""); setShowFilter(false);
    }

    function handleFkClick(targetTable, id) {
        switchTable(targetTable);
        setTimeout(() => { setSearch(String(id)); setSearchInput(String(id)); }, 0);
    }

    function submitSearch(e) { e.preventDefault(); setSearch(searchInput.trim()); setOffset(0); setExpandedId(null); }
    function clearSearch() { setSearch(""); setSearchInput(""); setOffset(0); setExpandedId(null); }
    function toggleRow(id) { setExpandedId(prev => prev === id ? null : id); }

    function handleSort(col) {
        if (sortCol === col) setSortDir(p => p === "desc" ? "asc" : "desc");
        else { setSortCol(col); setSortDir("desc"); }
        setOffset(0); setExpandedId(null);
    }

    async function handleExport() {
        setExportLoading(true);
        try {
            const params = new URLSearchParams({ table: activeTable });
            if (search) params.set("search", search);
            if (dateFrom) params.set("date_from", dateFrom);
            if (dateTo) params.set("date_to", dateTo);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/admin/db/export?${params}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `${activeTable}.csv`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) { setError(err.message); }
        finally { setExportLoading(false); }
    }

    function handleSaved() { fetchData(); fetchCounts(); setExpandedId(null); }
    function handleDeleted(id) { setRecords(p => p.filter(r => r.id !== id)); setTotal(p => p - 1); setExpandedId(null); fetchCounts(); }

    const summaryCols = SUMMARY_COLS[activeTable] || columns.slice(0, 6);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
    const colTemplate = `repeat(${summaryCols.length}, minmax(160px, 1fr))`;
    const hasFilters = dateFrom || dateTo;

    return (
        <div className={styles.page}>
            <AdminHeader active="db" />
            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <p className={styles.sidebarLabel}>Tables</p>
                    {TABLES.map((t) => (
                        <button key={t} className={`${styles.tableBtn} ${t === activeTable ? styles.tableBtnActive : ""}`} onClick={() => switchTable(t)}>
                            <span className={styles.tableName}>{t}</span>
                            {counts[t] > 0 && (
                                <span className={`${styles.tableCount} ${t === activeTable ? styles.tableCountActive : ""}`}>
                                    {counts[t].toLocaleString()}
                                </span>
                            )}
                        </button>
                    ))}
                </aside>

                <main className={styles.main}>
                    <div className={styles.toolbar}>
                        <span className={styles.activeTable}>{activeTable}</span>
                        <form onSubmit={submitSearch} className={styles.searchForm}>
                            <input className={styles.searchInput} value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search…" />
                            <button type="submit" className={styles.searchBtn}>Go</button>
                            {search && <button type="button" className={styles.clearBtn} onClick={clearSearch}>✕</button>}
                        </form>
                        <button className={`${styles.filterToggleBtn} ${(showFilter || hasFilters) ? styles.filterToggleBtnActive : ""}`} onClick={() => setShowFilter(p => !p)} title="Date range filter">
                            ⚌{hasFilters ? " •" : ""}
                        </button>
                        <span className={styles.countLabel}>{loading ? "…" : `${total.toLocaleString()} rows`}</span>
                        <button className={styles.exportBtn} onClick={handleExport} disabled={exportLoading} title="Export CSV">{exportLoading ? "…" : "↓ CSV"}</button>
                        <button className={styles.refreshBtn} onClick={fetchData} title="Refresh">↻</button>
                    </div>

                    {showFilter && (
                        <div className={styles.filterBar}>
                            <span className={styles.filterLabel}>created_at</span>
                            <input type="date" className={styles.filterInput} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setOffset(0); }} />
                            <span className={styles.filterSep}>→</span>
                            <input type="date" className={styles.filterInput} value={dateTo} onChange={e => { setDateTo(e.target.value); setOffset(0); }} />
                            {hasFilters && <button className={styles.clearBtn} onClick={() => { setDateFrom(""); setDateTo(""); setOffset(0); }}>Clear</button>}
                        </div>
                    )}

                    <div className={styles.tableScroll}>
                        <div className={styles.tableInner}>
                            {!loading && records.length > 0 && (
                                <div className={styles.colHeader} style={{ gridTemplateColumns: colTemplate }}>
                                    {summaryCols.map((col) => (
                                        <div key={col} className={`${styles.colLabel} ${styles.colLabelSortable}`} onClick={() => handleSort(col)}>
                                            {col}{sortCol === col && <span className={styles.sortIndicator}>{sortDir === "desc" ? " ↓" : " ↑"}</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className={styles.records}>
                                {error && <div className={styles.errorMsg}>⚠ {error}</div>}
                                {loading && <div className={styles.stateMsg}>Loading…</div>}
                                {!loading && !error && records.length === 0 && <div className={styles.stateMsg}>No records found.</div>}
                                {!loading && records.map((row) => {
                                    const isExpanded = expandedId === row.id;
                                    return (
                                        <div key={row.id} className={`${styles.row} ${isExpanded ? styles.rowExpanded : ""}`} onClick={() => toggleRow(row.id)}>
                                            <div className={styles.rowSummary} style={{ gridTemplateColumns: colTemplate }}>
                                                {summaryCols.map((col) => (
                                                    <div key={col} className={styles.cell}>
                                                        {col === "meeting_transcript" ? <TranscriptBadge value={row[col]} />
                                                            : col === "embedded_at" ? <EmbeddingBadge value={row[col]} />
                                                                : <FieldValue fieldKey={col} value={row[col]} onFkClick={handleFkClick} />}
                                                    </div>
                                                ))}
                                            </div>
                                            {isExpanded && <DetailPanel row={row} columns={columns} table={activeTable} onFkClick={handleFkClick} onSaved={handleSaved} onDeleted={handleDeleted} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.pgBtn} onClick={() => { setOffset(Math.max(0, offset - PAGE_SIZE)); setExpandedId(null); }} disabled={offset === 0}>← Prev</button>
                        <span className={styles.pgLabel}>Page {currentPage} of {totalPages}</span>
                        <button className={styles.pgBtn} onClick={() => { setOffset(offset + PAGE_SIZE); setExpandedId(null); }} disabled={offset + PAGE_SIZE >= total}>Next →</button>
                    </div>
                </main>
            </div>
        </div>
    );
}