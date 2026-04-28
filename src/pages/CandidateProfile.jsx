/* src/pages/CandidateProfile.jsx */
import { useState, useEffect, useRef } from "react";
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
    const photoInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [enrichOpen, setEnrichOpen] = useState(false);
    const [outreachExpanded, setOutreachExpanded] = useState(false);
    const [transcriptExpanded, setTranscriptExpanded] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);

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

    async function handlePhotoChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${API_BASE}/api/candidates/${id}/photo`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            setCandidate(prev => ({ ...prev, photo_url: data.photo_url }));
        } catch (err) {
            alert("Photo upload failed: " + err.message);
        } finally {
            setPhotoUploading(false);
        }
    }

    async function handleBannerChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${API_BASE}/api/candidates/${id}/banner`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            setCandidate(prev => ({ ...prev, banner_url: data.banner_url }));
        } catch (err) {
            alert("Banner upload failed: " + err.message);
        } finally {
            setBannerUploading(false);
        }
    }

    async function handleDownloadPdf() {
        setPdfLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/candidates/${id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("PDF generation failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${candidate.name.replace(/\s+/g, "_")}_profile.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert("PDF download failed: " + err.message);
        } finally {
            setPdfLoading(false);
        }
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
    const isStub = isFromCall && !candidate.ai_summary && !candidate.current_title;

    return (
        <div className={styles.page}>
            <AdminHeader active="candidates" />

            {/* ── Profile Header ── */}
            <div className={styles.profileHeader}>

                {/* ── Banner ── */}
                <div
                    className={styles.bannerWrap}
                    onClick={() => !bannerUploading && bannerInputRef.current?.click()}
                    title="Click to upload banner image"
                    style={candidate.banner_url ? {
                        backgroundImage: `url(${candidate.banner_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    } : {}}
                >
                    <div className={styles.bannerOverlay}>
                        {bannerUploading
                            ? <span className={styles.spinnerWhite} />
                            : <><i className="fi fi-rr-picture" /> <span>Upload banner</span></>
                        }
                    </div>
                </div>
                <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleBannerChange}
                />

                <div className={styles.profileHeaderInner}>

                    {/* ── Top Bar ── */}
                    <div className={styles.headerTop}>
                        <button className={styles.backLink} onClick={() => navigate(-1)}>
                            ← Back
                        </button>
                        <div className={styles.headerActions}>
                            <button
                                className={styles.pdfBtn}
                                onClick={handleDownloadPdf}
                                disabled={pdfLoading}
                            >
                                {pdfLoading
                                    ? <><span className={styles.spinnerWhite} /> Generating…</>
                                    : <><i className="fi fi-rr-file-pdf" style={{ marginRight: '6px', fontSize: '13px' }} />Download PDF</>
                                }
                            </button>
                            {isFromCall && (
                                <button
                                    className={`${styles.headerBtn} ${styles.enrichBtn}`}
                                    onClick={() => setEnrichOpen(true)}
                                >
                                    <i className="fi fi-rr-add" style={{ marginRight: '6px', fontSize: '13px' }} />
                                    Enrich Profile
                                </button>
                            )}
                            <button
                                className={styles.headerBtn}
                                onClick={() => setEditOpen(true)}
                            >
                                ✏ Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* ── Avatar + Info ── */}
                    <div className={styles.headerMain}>
                        <div
                            className={styles.avatarWrap}
                            onClick={() => !photoUploading && photoInputRef.current?.click()}
                            title="Click to upload photo"
                        >
                            {candidate.photo_url ? (
                                <img
                                    src={candidate.photo_url}
                                    alt={candidate.name}
                                    className={styles.avatarImg}
                                />
                            ) : (
                                <div className={styles.avatarInitial}>
                                    {candidate.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className={styles.avatarOverlay}>
                                {photoUploading
                                    ? <span className={styles.spinnerWhite} />
                                    : <i className="fi fi-rr-camera" />
                                }
                            </div>
                        </div>
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handlePhotoChange}
                        />

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
                                    <span className={styles.callBadge}>
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

                        {isStub && (
                            <div className={styles.stubNotice}>
                                <i className="fi fi-rr-info" style={{ color: '#7c3aed', marginTop: '2px', flexShrink: 0 }} />
                                <div>
                                    <div className={styles.stubTitle}>Profile created from a scheduled call</div>
                                    <div className={styles.stubBody}>
                                        This candidate was automatically added when the call was confirmed.
                                        Upload a resume or paste their LinkedIn profile to enrich the record with full details.
                                    </div>
                                    <button className={styles.stubBtn} onClick={() => setEnrichOpen(true)}>
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

                        {candidate.meeting_transcript && (
                            <Section title="Call Transcript">
                                <div className={styles.transcriptMeta}>
                                    <span className={styles.transcriptBadge}>
                                        <i className="fi fi-rr-rec" style={{ fontSize: '10px' }} />
                                        Zoom Recording
                                    </span>
                                    <span className={styles.transcriptLen}>
                                        {candidate.meeting_transcript.length.toLocaleString()} chars
                                    </span>
                                </div>
                                <div className={styles.transcriptWrap} style={{ maxHeight: transcriptExpanded ? 'none' : '240px' }}>
                                    <pre className={styles.transcriptPre}>
                                        {candidate.meeting_transcript}
                                    </pre>
                                    {!transcriptExpanded && <div className={styles.transcriptFade} />}
                                </div>
                                <button
                                    className={styles.outreachToggle}
                                    onClick={() => setTranscriptExpanded(p => !p)}
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
                                <InfoRow label="Source" value={isFromCall ? "From Call" : "Manual Entry"} />
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
                                    value={candidate.created_at ? new Date(candidate.created_at).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric"
                                    }) : "—"}
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

                        {/* ── PDF Export Card ── */}
                        <div className={styles.pdfCard}>
                            <div className={styles.pdfCardTitle}>Export Profile</div>
                            <p className={styles.pdfCardDesc}>
                                Download a clean one-page PDF to share with potential employers.
                            </p>
                            <button
                                className={styles.pdfCardBtn}
                                onClick={handleDownloadPdf}
                                disabled={pdfLoading}
                            >
                                {pdfLoading
                                    ? "Generating…"
                                    : <><i className="fi fi-rr-file-pdf" style={{ marginRight: '6px' }} />Download PDF</>
                                }
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {enrichOpen && (
                <CandidateModal
                    candidate={candidate}
                    token={token}
                    enrichMode={true}
                    onSaved={handleSaved}
                    onClose={() => setEnrichOpen(false)}
                />
            )}

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