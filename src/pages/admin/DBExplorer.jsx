/* src/pages/admin/DBExplorer.jsx */
import { useState, useEffect, useCallback } from "react";
import AdminHeader from "../../components/AdminHeader";
import styles from "./DBExplorer.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TABLES = [
    "bookings", "candidates", "employer_profiles",
    "job_orders", "chat_sessions", "chat_messages",
    "users", "waitlist", "contacts",
];

// ── CHANGED: added ai_years_experience to candidates, website_url to
//   employer_profiles, employer_profile_id to job_orders, tenant_id to users
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
};

const STATUS_FIELDS = new Set([
    "status", "embedding_status", "user_type",
    "intent", "provider", "booking_type", "call_outcome",
]);

// ── CHANGED: added job_order statuses (open, filled, on_hold)
const BADGE_COLORS = {
    pending: "amber", confirmed: "green", cancelled: "red",
    completed: "green", complete: "green", failed: "red",
    ADMIN: "red", CANDIDATE: "blue", EMPLOYER: "amber",
    hiring: "amber", job_seeking: "blue", following: "gray",
    google: "blue", linkedin: "blue",
    inbound: "blue", outbound_employer: "teal",
    outbound_candidate: "teal", inbound_candidate: "blue",
    placed: "green", not_a_fit: "red", follow_up: "amber", no_show: "red",
    // job_orders
    open: "green", filled: "blue", on_hold: "amber",
};

// ── CHANGED: expanded to cover all text blob fields across all tables
const LONG_TEXT_FIELDS = new Set([
    // bookings
    "meeting_summary", "meeting_next_steps", "meeting_transcript",
    "meeting_keywords", "call_notes",
    // candidates
    "ai_summary", "ai_experience", "ai_education",
    "ai_outreach_message", "linkedin_raw_text", "notes",
    // employer_profiles
    "ai_company_overview", "ai_hiring_needs", "ai_talking_points",
    "ai_red_flags", "ai_brief_raw", "recruiter_notes", "raw_text",
    // job_orders
    "requirements",
    // chat
    "content", "structured_data",
    // contacts
    "message",
]);

function FieldValue({ fieldKey, value }) {
    if (value === null || value === undefined || value === "") {
        return <span className={styles.nullVal}>—</span>;
    }
    if (typeof value === "boolean") {
        return <span className={`${styles.badge} ${value ? styles.badgeGreen : styles.badgeGray}`}>{String(value)}</span>;
    }
    if (STATUS_FIELDS.has(fieldKey)) {
        const color = BADGE_COLORS[String(value)] || "gray";
        const cls = `badge${color.charAt(0).toUpperCase() + color.slice(1)}`;
        return <span className={`${styles.badge} ${styles[cls]}`}>{String(value)}</span>;
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
    const lines = value.split("\n").filter(Boolean).length;
    return <span className={`${styles.badge} ${styles.badgeGreen}`}>{lines} lines ✓</span>;
}

function DetailPanel({ row, columns }) {
    const [expandedFields, setExpandedFields] = useState(new Set());

    function toggleField(key) {
        setExpandedFields((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }

    return (
        <div className={styles.detailPanel}>
            {columns.map((key) => {
                const value = row[key];
                const isLong = LONG_TEXT_FIELDS.has(key);
                const hasValue = value !== null && value !== undefined && value !== "";
                const isExpanded = expandedFields.has(key);
                return (
                    <div key={key} className={styles.detailRow}>
                        <span className={styles.detailKey}>{key}</span>
                        <span className={styles.detailVal}>
                            {isLong && hasValue ? (
                                <>
                                    <button className={styles.expandBtn} onClick={(e) => { e.stopPropagation(); toggleField(key); }}>
                                        {isExpanded ? "▲ hide" : `▼ ${String(value).split("\n").filter(Boolean).length} lines`}
                                    </button>
                                    {isExpanded && <pre className={styles.longText}>{String(value)}</pre>}
                                </>
                            ) : (
                                <FieldValue fieldKey={key} value={value} />
                            )}
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

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ table: activeTable, limit: String(PAGE_SIZE), offset: String(offset) });
            if (search) params.set("search", search);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/admin/db/explorer?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.detail || `Request failed (${res.status})`);
            }
            const data = await res.json();
            setRecords(data.rows || []);
            setColumns(data.columns || []);
            setTotal(data.total || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [activeTable, offset, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    function switchTable(t) { setActiveTable(t); setOffset(0); setSearch(""); setSearchInput(""); setExpandedId(null); }
    function submitSearch(e) { e.preventDefault(); setSearch(searchInput.trim()); setOffset(0); setExpandedId(null); }
    function clearSearch() { setSearch(""); setSearchInput(""); setOffset(0); setExpandedId(null); }
    function toggleRow(id) { setExpandedId((prev) => (prev === id ? null : id)); }

    const summaryCols = SUMMARY_COLS[activeTable] || columns.slice(0, 6);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
    const colTemplate = `repeat(${summaryCols.length}, minmax(160px, 1fr))`;

    return (
        <div className={styles.page}>
            <AdminHeader />
            <div className={styles.layout}>

                <aside className={styles.sidebar}>
                    <p className={styles.sidebarLabel}>Tables</p>
                    {TABLES.map((t) => (
                        <button
                            key={t}
                            className={`${styles.tableBtn} ${t === activeTable ? styles.tableBtnActive : ""}`}
                            onClick={() => switchTable(t)}
                        >
                            <span className={styles.tableName}>{t}</span>
                            {t === activeTable && total > 0 && (
                                <span className={styles.tableCount}>{total.toLocaleString()}</span>
                            )}
                        </button>
                    ))}
                </aside>

                <main className={styles.main}>
                    <div className={styles.toolbar}>
                        <span className={styles.activeTable}>{activeTable}</span>
                        <form onSubmit={submitSearch} className={styles.searchForm}>
                            <input
                                className={styles.searchInput}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search…"
                            />
                            <button type="submit" className={styles.searchBtn}>Go</button>
                            {search && (
                                <button type="button" className={styles.clearBtn} onClick={clearSearch}>✕</button>
                            )}
                        </form>
                        <span className={styles.countLabel}>
                            {loading ? "…" : `${total.toLocaleString()} rows`}
                        </span>
                        <button className={styles.refreshBtn} onClick={fetchData} title="Refresh">↻</button>
                    </div>

                    <div className={styles.tableScroll}>
                        <div className={styles.tableInner}>
                            {!loading && records.length > 0 && (
                                <div className={styles.colHeader} style={{ gridTemplateColumns: colTemplate }}>
                                    {summaryCols.map((col) => (
                                        <div key={col} className={styles.colLabel}>{col}</div>
                                    ))}
                                </div>
                            )}

                            <div className={styles.records}>
                                {error && <div className={styles.errorMsg}>⚠ {error}</div>}
                                {loading && <div className={styles.stateMsg}>Loading…</div>}
                                {!loading && !error && records.length === 0 && (
                                    <div className={styles.stateMsg}>No records found.</div>
                                )}

                                {!loading && records.map((row) => {
                                    const isExpanded = expandedId === row.id;
                                    return (
                                        <div
                                            key={row.id}
                                            className={`${styles.row} ${isExpanded ? styles.rowExpanded : ""}`}
                                            onClick={() => toggleRow(row.id)}
                                        >
                                            <div className={styles.rowSummary} style={{ gridTemplateColumns: colTemplate }}>
                                                {summaryCols.map((col) => (
                                                    <div key={col} className={styles.cell}>
                                                        {col === "meeting_transcript"
                                                            ? <TranscriptBadge value={row[col]} />
                                                            : <FieldValue fieldKey={col} value={row[col]} />}
                                                    </div>
                                                ))}
                                            </div>
                                            {isExpanded && <DetailPanel row={row} columns={columns} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button
                            className={styles.pgBtn}
                            onClick={() => { setOffset(Math.max(0, offset - PAGE_SIZE)); setExpandedId(null); }}
                            disabled={offset === 0}
                        >
                            ← Prev
                        </button>
                        <span className={styles.pgLabel}>Page {currentPage} of {totalPages}</span>
                        <button
                            className={styles.pgBtn}
                            onClick={() => { setOffset(offset + PAGE_SIZE); setExpandedId(null); }}
                            disabled={offset + PAGE_SIZE >= total}
                        >
                            Next →
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}