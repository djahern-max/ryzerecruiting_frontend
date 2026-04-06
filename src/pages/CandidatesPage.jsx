/* src/pages/CandidatesPage.jsx */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CandidateModal from "../components/CandidateModal";
import styles from "./CandidatesPage.module.css";
import AdminHeader from '../components/AdminHeader';
import addCandidateIcon from '../assets/icons/add-candidate.svg';


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function CandidatesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
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

    const indexedCount = candidates.filter((c) => c.embedded_at).length;
    const fromCallCount = candidates.filter((c) => c.source === "booking").length;

    return (
        <div className={styles.page}>
            {/* ── Header ── */}
            <AdminHeader active="candidates" />

            <main className={styles.main}>
                {/* ── Page Header ── */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Candidates</h1>
                        <p className={styles.pageSub}>
                            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} in your database
                            {candidates.length > 0 && (
                                <>

                                    {fromCallCount > 0 && (
                                        <span style={{
                                            marginLeft: '12px',
                                            fontSize: '12px',
                                            color: '#7c3aed',
                                            fontWeight: 500,
                                        }}>
                                            · {fromCallCount} from calls
                                        </span>
                                    )}
                                </>
                            )}
                        </p>
                    </div>
                    <button className={styles.addIconBtn} onClick={openAdd} title="Add Candidate">
                        <img src={addCandidateIcon} alt="Add Candidate" className={styles.addIcon} />
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
                        <button className={styles.clearSearch} onClick={() => setSearch("")}>✕</button>
                    )}
                </div>

                {/* ── Table ── */}
                {loading ? (
                    <div className={styles.emptyState}>Loading candidates...</div>
                ) : error ? (
                    <div className={styles.errorState}>{error}</div>
                ) : filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        {search ? "No candidates match your search." : "No candidates yet. Add your first one above."}
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
                                    <th>AI Search</th>
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
                                        navigate={navigate}
                                        styles={styles}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

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

function FragmentRow({ candidate: c, expandedId, setExpandedId, openEdit, handleDelete, navigate, styles }) {
    const isFromCall = c.source === "booking";

    return (
        <>
            <tr className={`${styles.row} ${expandedId === c.id ? styles.rowExpanded : ""}`}>
                <td>
                    {/* Name — clickable, navigates to full profile */}
                    <div
                        className={styles.candidateName}
                        onClick={() => navigate(`/admin/candidates/${c.id}`)}
                        style={{ cursor: 'pointer' }}
                        title="View full profile"
                    >
                        {c.name}
                    </div>

                    {/* Source badge — shown when auto-created from a confirmed call */}
                    {isFromCall && (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '3px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#7c3aed',
                            background: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            borderRadius: '4px',
                            padding: '1px 6px',
                            letterSpacing: '0.01em',
                        }}>
                            <i className="fi fi-rr-phone-call" style={{ fontSize: '10px' }} />
                            From Call
                        </span>
                    )}

                    {c.linkedin_url && (
                        <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.linkedinLink}>
                            LinkedIn ↗
                        </a>
                    )}
                </td>

                <td>{c.current_title || <span className={styles.empty}>—</span>}</td>
                <td>{c.current_company || <span className={styles.empty}>—</span>}</td>
                <td>{c.location || <span className={styles.empty}>—</span>}</td>

                <td>
                    {c.embedded_at ? (
                        <span className={styles.badgeIndexed}>
                            <span className={styles.badgeDot} />
                            Indexed
                        </span>
                    ) : (
                        <span className={styles.badgePending}>
                            <span className={styles.badgeSpinner} />
                            Indexing...
                        </span>
                    )}
                </td>

                <td className={styles.summaryCell}>
                    {c.ai_summary ? (
                        <button
                            className={`${styles.expandBtn} ${expandedId === c.id ? styles.expandBtnActive : ""}`}
                            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        >
                            {expandedId === c.id ? "Hide" : "View Brief"}
                        </button>
                    ) : (
                        <span className={styles.noSummary}>No brief</span>
                    )}
                </td>

                <td>
                    <div className={styles.actions}>
                        <button
                            className={styles.editBtn}
                            onClick={() => navigate(`/admin/candidates/${c.id}`)}
                            title="View full profile"
                        >
                            Profile
                        </button>
                        <button className={styles.editBtn} onClick={() => openEdit(c)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                </td>
            </tr>

            {expandedId === c.id && c.ai_summary && (
                <tr className={styles.detailRow}>
                    <td colSpan={7} className={styles.detailCell}>
                        <div className={styles.detailPanel}>
                            <div className={styles.detailSection}>
                                <div className={styles.detailLabel}>AI Summary</div>
                                <div className={styles.detailContent}>{c.ai_summary}</div>
                            </div>
                            {c.ai_career_level && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>Career Level</div>
                                    <div className={styles.detailContent} style={{ textTransform: 'capitalize' }}>
                                        {c.ai_career_level}{c.ai_years_experience ? ` · ${c.ai_years_experience} years experience` : ""}
                                    </div>
                                </div>
                            )}
                            {c.ai_experience && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>Experience</div>
                                    <div className={styles.detailContent}>{c.ai_experience}</div>
                                </div>
                            )}
                            {c.ai_education && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>Education</div>
                                    <div className={styles.detailContent}>{c.ai_education}</div>
                                </div>
                            )}
                            {c.ai_certifications && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>Certifications</div>
                                    <div className={styles.detailContent}>{c.ai_certifications}</div>
                                </div>
                            )}
                            {c.ai_skills?.length > 0 && (
                                <div className={styles.detailSection}>
                                    <div className={styles.detailLabel}>Skills</div>
                                    <div className={styles.tagRow}>
                                        {c.ai_skills.map((skill, i) => (
                                            <span key={i} className={styles.tag}>{skill}</span>
                                        ))}
                                    </div>
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
