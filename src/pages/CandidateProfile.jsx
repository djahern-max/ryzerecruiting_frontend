/* src/pages/CandidateProfile.jsx */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import CandidateModal from "../components/CandidateModal";
import styles from "./CandidateProfile.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CAREER_LEVEL_COLORS = {
    entry: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    junior: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    mid: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    senior: { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
    manager: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    director: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    vp: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
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

    // Two separate modal modes — never open both at once
    const [editOpen, setEditOpen] = useState(false);
    const [enrichOpen, setEnrichOpen] = useState(false);

    const [outreachExpanded, setOutreachExpanded] = useState(false);
    const [transcriptExpanded, setTranscriptExpanded] = useState(false);

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

    function handleSaved(updated) {
        setCandidate(updated);
        setEditOpen(false);
        setEnrichOpen(false);
    }

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
    const isFromCall = candidate.source === "booking";

    // A stub is a call-sourced candidate that hasn't been enriched yet —
    // no AI summary and no current title means the only data we have is
    // what was on the booking (name, email, phone).
    const isStub = isFromCall && !candidate.ai_summary && !candidate.current_title;

    return (
        <div className={styles.page}>
            <AdminHeader active="candidates" />

            {/* ── Profile Header ── */}
            <div className={styles.profileHeader}>
                <div className={styles.profileHeaderInner}>

                    <div className={styles.headerTop}>
                        <button className={styles.backLink} onClick={() => navigate(-1)}>
                            ← Back
                        </button>

                        {/* Header actions — Enrich shown only for call-sourced, Edit always shown */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {isFromCall && (
                                <button
                                    className={styles.editBtn}
                                    onClick={() => setEnrichOpen(true)}
                                    style={{
                                        background: '#f5f3ff',
                                        color: '#7c3aed',
                                        border: '1px solid #ddd6fe',
                                    }}
                                >
                                    <i className="fi fi-rr-add" style={{ marginRight: '6px', fontSize: '13px' }} />
                                    Enrich Profile
                                </button>
                            )}
                            <button
                                className={styles.editBtn}
                                onClick={() => setEditOpen(true)}
                            >
                                ✏ Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className={styles.headerMain}>
                        <div className={styles.avatar}>
                            {candidate.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.headerInfo}>
                            <h1 className={styles.candidateName}>{candidate.name}</h1>
                            <div className={styles.candidateMeta}>
                                {candidate.current_title && <span>{candidate.current_title}</span>}
                                {candidate.current_title && candidate.current_company && (
                                    <span className={styles.metaDot}>·</span>
                                )}
                                {candidate.current_company && <span>{candidate.current_company}</span>}
                            </div>
                            {candidate.location && (
                                <div className={styles.candidateLocation}>
                                    <span className={styles.locationIcon}>📍</span>
                                    {candidate.location}
                                </div>
                            )}
                            <div className={styles.headerBadges}>
                                {isFromCall && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#7c3aed',
                                        background: '#f5f3ff',
                                        border: '1px solid #ddd6fe',
                                        borderRadius: '6px',
                                        padding: '3px 8px',
                                    }}>
                                        <i className="fi fi-rr-phone-call" style={{ fontSize: '11px' }} />
                                        Created from Call
                                    </span>
                                )}
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

                        {/* Stub notice — shown when call-sourced and not yet enriched */}
                        {isStub && (
                            <div style={{
                                background: '#faf5ff',
                                border: '1px solid #e9d5ff',
                                borderRadius: '10px',
                                padding: '16px 20px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                            }}>
                                <i className="fi fi-rr-info" style={{ color: '#7c3aed', marginTop: '2px', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 600, color: '#6d28d9', fontSize: '14px', marginBottom: '4px' }}>
                                        Profile created from a scheduled call
                                    </div>
                                    <div style={{ color: '#7c3aed', fontSize: '13px', lineHeight: 1.5 }}>
                                        This candidate was automatically added when the call was confirmed.
                                        Upload a resume or paste their LinkedIn profile to enrich the record with full details.
                                    </div>
                                    <button
                                        onClick={() => setEnrichOpen(true)}
                                        style={{
                                            marginTop: '10px',
                                            background: '#7c3aed',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '7px 14px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        Enrich Profile →
                                    </button>
                                </div>
                            </div>
                        )}

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

                        {/* ── Call Transcript ── */}
                        {candidate.meeting_transcript && (
                            <Section title="Call Transcript">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '10px',
                                }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#0369a1',
                                        background: '#e0f2fe',
                                        border: '1px solid #bae6fd',
                                        borderRadius: '4px',
                                        padding: '2px 7px',
                                    }}>
                                        <i className="fi fi-rr-rec" style={{ fontSize: '10px' }} />
                                        Zoom Recording
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                        {candidate.meeting_transcript.length.toLocaleString()} chars
                                    </span>
                                </div>
                                <div style={{
                                    position: 'relative',
                                    maxHeight: transcriptExpanded ? 'none' : '240px',
                                    overflow: transcriptExpanded ? 'visible' : 'hidden',
                                }}>
                                    <pre style={{
                                        fontFamily: 'inherit',
                                        fontSize: '13px',
                                        lineHeight: 1.65,
                                        color: '#374151',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        margin: 0,
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '14px 16px',
                                    }}>
                                        {candidate.meeting_transcript}
                                    </pre>
                                    {!transcriptExpanded && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '60px',
                                            background: 'linear-gradient(to bottom, transparent, #fff)',
                                            pointerEvents: 'none',
                                        }} />
                                    )}
                                </div>
                                <button
                                    onClick={() => setTranscriptExpanded(p => !p)}
                                    style={{
                                        marginTop: '8px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#2563eb',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        padding: '0',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    {transcriptExpanded ? "Show less ↑" : "Show full transcript ↓"}
                                </button>
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

                        <Section title="Profile Details">
                            <div className={styles.infoList}>
                                <InfoRow
                                    label="Source"
                                    value={isFromCall ? "From Call" : "Manual Entry"}
                                />
                                {candidate.ai_parsed_at && (
                                    <InfoRow
                                        label="Parsed"
                                        value={new Date(candidate.ai_parsed_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric"
                                        })}
                                    />
                                )}
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
                                {candidate.meeting_transcript && (
                                    <InfoRow label="Transcript" value="✓ Available" />
                                )}
                            </div>
                        </Section>

                    </div>
                </div>
            </div>

            {/* ── Enrich Modal — parse tab, merges into existing record ── */}
            {enrichOpen && (
                <CandidateModal
                    candidate={candidate}
                    token={token}
                    enrichMode={true}
                    onSaved={handleSaved}
                    onClose={() => setEnrichOpen(false)}
                />
            )}

            {/* ── Edit Modal — manual form only ── */}
            {editOpen && (
                <CandidateModal
                    candidate={candidate}
                    token={token}
                    onSaved={handleSaved}
                    onClose={() => setEditOpen(false)}
                />
            )}
        </div>
    );
}