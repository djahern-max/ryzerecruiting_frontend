/* src/pages/CandidatesPage.jsx */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CandidateModal from "../components/CandidateModal";
import styles from "./CandidatesPage.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function CandidatesPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const token = localStorage.getItem('token');

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState(null);

    const fetchCandidates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = search ? `?search=${encodeURIComponent(search)}` : "";
            const res = await fetch(`${API_BASE}/api/candidates${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch candidates");

            setCandidates(await res.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [token, search]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    async function handleDelete(id) {
        if (!window.confirm("Delete this candidate?")) return;

        await fetch(`${API_BASE}/api/candidates/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        fetchCandidates();
    }

    function openAdd() {
        setEditingCandidate(null);
        setModalOpen(true);
    }

    function openEdit(candidate) {
        setEditingCandidate(candidate);
        setModalOpen(true);
    }

    function handleSaved() {
        setModalOpen(false);
        fetchCandidates();
    }

    const filtered = candidates.filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();

        return (
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.current_title?.toLowerCase().includes(q) ||
            c.current_company?.toLowerCase().includes(q) ||
            c.location?.toLowerCase().includes(q)
        );
    });

    return (
        <div className={styles.page}>
            {/* ── Header ── */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <span className={styles.logo}>RYZE.ai</span>
                        <span className={styles.adminBadge}>ADMIN</span>
                    </div>

                    <nav className={styles.nav}>
                        <button className={styles.navBtn} onClick={() => navigate("/admin")}>
                            Dashboard
                        </button>
                        <button
                            className={styles.navBtn}
                            onClick={() => navigate("/admin/employers")}
                        >
                            Employers
                        </button>
                        <button className={`${styles.navBtn} ${styles.navBtnActive}`}>
                            Candidates
                        </button>
                    </nav>

                    <div className={styles.headerRight}>
                        <span className={styles.userName}>
                            {user?.full_name || user?.email}
                        </span>
                        <button className={styles.logoutButton} onClick={logout}>
                            <i className="fi fi-rr-sign-out-alt" />
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                {/* ── Page Header ── */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Candidates</h1>
                        <p className={styles.pageSub}>
                            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} in
                            your database
                        </p>
                    </div>

                    <button className={styles.addBtn} onClick={openAdd}>
                        + Add Candidate
                    </button>
                </div>

                {/* ── Search ── */}
                <div className={styles.searchBar}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search by name, title, company, location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className={styles.clearSearch}
                            onClick={() => setSearch("")}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* ── Table ── */}
                {loading ? (
                    <div className={styles.emptyState}>Loading candidates...</div>
                ) : error ? (
                    <div className={styles.errorState}>{error}</div>
                ) : filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        {search
                            ? "No candidates match your search."
                            : "No candidates yet. Add your first one above."}
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Title</th>
                                    <th>Company</th>
                                    <th>Location</th>
                                    <th>Contact</th>
                                    <th>AI Summary</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <FragmentRow
                                        key={c.id}
                                        candidate={c}
                                        expandedId={expandedId}
                                        setExpandedId={setExpandedId}
                                        openEdit={openEdit}
                                        handleDelete={handleDelete}
                                        styles={styles}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* ── Modal ── */}
            {modalOpen && (
                <CandidateModal
                    candidate={editingCandidate}
                    token={token}
                    onSaved={handleSaved}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
}

function FragmentRow({
    candidate: c,
    expandedId,
    setExpandedId,
    openEdit,
    handleDelete,
    styles,
}) {
    return (
        <>
            <tr
                className={`${styles.row} ${expandedId === c.id ? styles.rowExpanded : ""
                    }`}
            >
                <td>
                    <div className={styles.candidateName}>{c.name}</div>
                    {c.linkedin_url && (
                        <a
                            href={c.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.linkedinLink}
                        >
                            LinkedIn ↗
                        </a>
                    )}
                </td>

                <td>{c.current_title || <span className={styles.empty}>—</span>}</td>
                <td>{c.current_company || <span className={styles.empty}>—</span>}</td>
                <td>{c.location || <span className={styles.empty}>—</span>}</td>

                <td>
                    {c.email && (
                        <a href={`mailto:${c.email}`} className={styles.emailLink}>
                            {c.email}
                        </a>
                    )}
                    {c.phone && <div className={styles.phone}>{c.phone}</div>}
                    {!c.email && !c.phone && <span className={styles.empty}>—</span>}
                </td>

                <td className={styles.summaryCell}>
                    {c.ai_summary ? (
                        <button
                            className={`${styles.expandBtn} ${expandedId === c.id ? styles.expandBtnActive : ""
                                }`}
                            onClick={() =>
                                setExpandedId(expandedId === c.id ? null : c.id)
                            }
                        >
                            {expandedId === c.id ? "Hide" : "View Brief"}
                        </button>
                    ) : (
                        <span className={styles.noSummary}>No brief</span>
                    )}
                </td>

                <td>
                    <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => openEdit(c)}>
                            Edit
                        </button>
                        <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(c.id)}
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>

            {expandedId === c.id && c.ai_summary && (
                <tr className={styles.detailRow}>
                    <td colSpan={7} className={styles.detailCell}>
                        <div className={styles.detailPanel}>
                            {c.ai_summary && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>AI Candidate Summary</div>
                                    <div className={styles.detailContent}>{c.ai_summary}</div>
                                </div>
                            )}

                            {c.notes && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>Recruiter Notes</div>
                                    <div className={styles.detailContent}>{c.notes}</div>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
