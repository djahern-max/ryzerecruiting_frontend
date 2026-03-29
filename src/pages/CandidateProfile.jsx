/* src/pages/CandidateProfile.jsx */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import CandidateModal from "../components/CandidateModal";
import styles from "./CandidateProfile.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CAREER_LEVEL_COLORS = {
    entry:     { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    junior:    { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    mid:       { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    senior:    { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
    manager:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    director:  { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    vp:        { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
    "c-suite": { bg: "#0f172a", color: "#f8fafc", border: "#1e293b" },
    executive: { bg: "#0f172a", color: "#f8fafc", border: "#1e293b" },
};

function parseJsonField(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function InfoRow({ label, value, href }) {
    if (!value) return null;
    return (
        <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{label}</span>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                    {value}
                </a>
            ) : (
                <span className={styles.infoValue}>{value}</span>
            )}
        </div>
    );
}

function Section({ title, children, className = "" }) {
    return (
        <div className={`${styles.section} ${className}`}>
            <div className={styles.sectionTitle}>{title}</div>
            <div className={styles.sectionBody}>{children}</div>
        </div>
    );
}

export default function CandidateProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [outreachExpanded, setOutreachExpanded] = useState(false);

    useEffect(() => {
        async function fetchCandidate() {
            try {
                const res = await fetch(`${API_BASE}/api/candidates/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Candidate not found");
                setCandidate(await res.json());
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchCandidate();
    }, [id, token]);

    if (loading) {
        return (
            <div className={styles.page}>
                <AdminHeader active="candidates" />
                <div className={styles.loadingState}>Loading profile…</div>
            </div>
        );
    }

    if (error || !candidate) {
        return (
            <div className={styles.page}>
                <AdminHeader active="candidates" />
                <div className={styles.errorState}>
                    <p>{error || "Candidate not found."}</p>
                    <button onClick={() => navigate("/admin/candidates")} className={styles.backBtn}>
                        ← Back to Candidates
                    </button>
                </div>
            </div>
        );
    }

    const level = candidate.ai_career_level?.toLowerCase();
    const levelStyle = CAREER_LEVEL_COLORS[level] || null;
    const levelLabel = level ? level.charAt(0).toUpperCase() + level.slice(1) : null;
    const skills = parseJsonField(candidate.ai_skills);
    const hasCPA = candidate.ai_certifications?.toUpperCase().includes("CPA");
    const hasCFA = candidate.ai_certifications?.toUpperCase().includes("CFA");
    const hasCMA = candidate.ai_certifications?.toUpperCase().includes("CMA");

    return (
        <div className={styles.page}>
            <AdminHeader active="candidates" />

            {/* ── Profile Header ── */}
            <div className={styles.profileHeader}>
                <div className={styles.profileHeaderInner}>

                    <div className={styles.headerTop}>
                        <button
                            className={styles.backLink}
                            onClick={() => navigate(-1)}
                        >
                            ← Back
                        </button>
                        <button
                            className={styles.editBtn}
                            onClick={() => setEditOpen(true)}
                        >
                            ✏ Edit Profile
                        </button>
                    </div>

                    <div className={styles.headerMain}>
                        <div className={styles.avatar}>
                            {candidate.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.headerInfo}>
                            <h1 className={styles.candidateName}>{candidate.name}</h1>
                            <div className={styles.candidateMeta}>
                                {candidate.current_title && (
                                    <span>{candidate.current_title}</span>
                                )}
                                {candidate.current_title && candidate.current_company && (
                                    <span className={styles.metaDot}>·</span>
                                )}
                                {candidate.current_company && (
                                    <span>{candidate.current_company}</span>
                                )}
                            </div>
                            {candidate.location && (
                                <div className={styles.candidateLocation}>
                                    <span className={styles.locationIcon}>📍</span>
                                    {candidate.location}
                                </div>
                            )}
                            <div className={styles.headerBadges}>
                                {levelLabel && levelStyle && (
                                    <span
                                        className={styles.levelBadge}
                                        style={{
                                            background: levelStyle.bg,
                                            color: levelStyle.color,
                                            borderColor: levelStyle.border,
                                        }}
                                    >
                                        {levelLabel}
                                    </span>
                                )}
                                {candidate.ai_years_experience && (
                                    <span className={styles.statBadge}>
                                        {candidate.ai_years_experience} yrs exp
                                    </span>
                                )}
                                {hasCPA && <span className={styles.certBadge}>CPA</span>}
                                {hasCFA && <span className={styles.certBadge}>CFA</span>}
                                {hasCMA && <span className={styles.certBadge}>CMA</span>}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Profile Body ── */}
            <div className={styles.profileBody}>
                <div className={styles.profileBodyInner}>

                    {/* ── Main Column ── */}
                    <div className={styles.mainCol}>

                        {candidate.ai_summary && (
                            <Section title="AI Summary">
                                <p className={styles.summaryText}>{candidate.ai_summary}</p>
                            </Section>
                        )}

                        {candidate.ai_experience && (
                            <Section title="Experience">
                                <p className={styles.bodyText}>{candidate.ai_experience}</p>
                            </Section>
                        )}

                        {candidate.ai_education && (
                            <Section title="Education">
                                <p className={styles.bodyText}>{candidate.ai_education}</p>
                            </Section>
                        )}

                        {candidate.ai_outreach_message && (
                            <Section title="Outreach Message">
                                <div className={styles.outreachWrap}>
                                    <p className={`${styles.bodyText} ${styles.outreachText} ${outreachExpanded ? styles.outreachExpanded : ""}`}>
                                        {candidate.ai_outreach_message}
                                    </p>
                                    <button
                                        className={styles.outreachToggle}
                                        onClick={() => setOutreachExpanded(p => !p)}
                                    >
                                        {outreachExpanded ? "Show less ↑" : "Show full message ↓"}
                                    </button>
                                </div>
                            </Section>
                        )}

                        {candidate.notes && (
                            <Section title="Recruiter Notes" className={styles.notesSection}>
                                <div className={styles.notesInternalBadge}>Internal — not visible to candidates</div>
                                <p className={styles.bodyText}>{candidate.notes}</p>
                            </Section>
                        )}

                    </div>

                    {/* ── Sidebar ── */}
                    <div className={styles.sideCol}>

                        <Section title="Contact">
                            <div className={styles.infoList}>
                                <InfoRow label="Email" value={candidate.email} href={`mailto:${candidate.email}`} />
                                <InfoRow label="Phone" value={candidate.phone} />
                                <InfoRow
                                    label="LinkedIn"
                                    value={candidate.linkedin_url ? "View Profile" : null}
                                    href={candidate.linkedin_url}
                                />
                            </div>
                        </Section>

                        {(candidate.ai_certifications || skills.length > 0) && (
                            <Section title="Skills & Certifications">
                                {candidate.ai_certifications && (
                                    <div className={styles.certRow}>
                                        <span className={styles.sideLabel}>Certifications</span>
                                        <p className={styles.certText}>{candidate.ai_certifications}</p>
                                    </div>
                                )}
                                {skills.length > 0 && (
                                    <div className={styles.skillsWrap}>
                                        {skills.map((skill, i) => (
                                            <span key={i} className={styles.skillTag}>{skill}</span>
                                        ))}
                                    </div>
                                )}
                            </Section>
                        )}

                        {candidate.ai_parsed_at && (
                            <Section title="Profile Details">
                                <div className={styles.infoList}>
                                    <InfoRow
                                        label="Parsed"
                                        value={new Date(candidate.ai_parsed_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric"
                                        })}
                                    />
                                    <InfoRow
                                        label="Added"
                                        value={new Date(candidate.created_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric"
                                        })}
                                    />
                                    <InfoRow
                                        label="AI Search"
                                        value={candidate.embedded_at ? "✓ Indexed" : "Not indexed"}
                                    />
                                </div>
                            </Section>
                        )}

                    </div>
                </div>
            </div>

            {/* ── Edit Modal ── */}
            {editOpen && (
                <CandidateModal
                    candidate={candidate}
                    token={token}
                    onSaved={(updated) => {
                        setCandidate(updated);
                        setEditOpen(false);
                    }}
                    onClose={() => setEditOpen(false)}
                />
            )}
        </div>
    );
}
