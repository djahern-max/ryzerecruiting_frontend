/* src/pages/CandidateProfile.jsx */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import CandidateModal from "../components/CandidateModal";
import styles from "./CandidateProfile.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

function parseToDisplayBullets(text, maxItems = 6) {
    if (!text) return [];
    const sentences = text.split(/(?<=\.)\s+(?=[A-Z])/);
    const STRIP_PREFIXES = [
        "He then ", "He also ", "He currently ", "He is currently ",
        "She then ", "She also ", "She currently ", "She is currently ",
        "They then ", "They also ", "They currently ",
        "Concurrently, he ", "Concurrently, she ", "Concurrently, they ",
        "He ", "She ", "They ",
    ];
    const bullets = [];
    for (let s of sentences) {
        s = s.trim();
        if (s.length < 20) continue;
        if (/^[A-Z][a-z]+ [A-Z][a-z]+ has (an|a) /.test(s)) continue;
        for (const prefix of STRIP_PREFIXES) {
            if (s.startsWith(prefix)) {
                s = s.slice(prefix.length);
                s = s.charAt(0).toUpperCase() + s.slice(1);
                break;
            }
        }
        bullets.push(s);
    }
    return bullets.slice(0, maxItems);
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
                    cache: "no-store",
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
            if (photoInputRef.current) photoInputRef.current.value = "";
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
            if (bannerInputRef.current) bannerInputRef.current.value = "";
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
                    <button onClick={() => navigate("/admin/candidates")} className={styles.errorBackBtn}>
                        ← Back to Candidates
                    </button>
                </div>
            </div>
        );
    }

    const skills = parseJsonField(candidate.ai_skills);
    const hasCPA = candidate.ai_certifications?.toUpperCase().includes("CPA");
    const hasCFA = candidate.ai_certifications?.toUpperCase().includes("CFA");
    const hasCMA = candidate.ai_certifications?.toUpperCase().includes("CMA");
    const isFromCall = candidate.source === "booking";
    const isStub = isFromCall && !candidate.ai_summary && !candidate.current_title;
    const experienceBullets = parseToDisplayBullets(candidate.ai_experience);
    const educationBullets = parseToDisplayBullets(candidate.ai_education, 4);

    return (
        <div className={styles.page}>
            <AdminHeader active="candidates" />

            <div className={styles.profileBody}>

                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    ← Back to Candidates
                </button>

                {/* ══════════════════════════════════════════
                    IDENTITY CARD — mirrors PDF structure exactly:
                    banner → identityZone (avatar) → nameBlock (gradient border)
                ══════════════════════════════════════════ */}
                <div className={styles.identityCard}>

                    {/* Banner — purely visual */}
                    <div
                        className={styles.banner}
                        style={candidate.banner_url ? {
                            backgroundImage: `url(${candidate.banner_url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        } : {}}
                    />

                    {/* Hidden file inputs */}
                    <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBannerChange} />
                    <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />

                    {/* Identity zone: avatar overlaps banner seam (mirrors .identity-zone) */}
                    <div className={styles.identityZone}>
                        <div
                            className={styles.avatarWrap}
                            onClick={() => !photoUploading && photoInputRef.current?.click()}
                            title="Click to upload photo"
                        >
                            {candidate.photo_url ? (
                                <img src={candidate.photo_url} alt={candidate.name} className={styles.avatarImg} />
                            ) : (
                                <div className={styles.avatarInitial}>
                                    {candidate.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className={styles.avatarOverlay}>
                                {photoUploading
                                    ? <span className={styles.spinnerDark} />
                                    : <i className="fi fi-rr-camera" />}
                            </div>
                        </div>
                    </div>

                    {/* Name block — white bg, gradient border-bottom (mirrors .name-block) */}
                    <div className={styles.nameBlock}>
                        <div className={styles.candidateName}>{candidate.name}</div>

                        {(candidate.current_title || candidate.current_company) && (
                            <div className={styles.candidateMeta}>
                                {candidate.current_title}
                                {candidate.current_title && candidate.current_company && (
                                    <span className={styles.metaDivider}>·</span>
                                )}
                                {candidate.current_company}
                            </div>
                        )}

                        {candidate.location && (
                            <div className={styles.candidateLocation}>
                                <i className="fi fi-rr-marker" /> {candidate.location}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className={styles.profileActions}>
                            <button
                                className={styles.actionBtn}
                                onClick={() => bannerInputRef.current?.click()}
                                disabled={bannerUploading}
                            >
                                {bannerUploading
                                    ? <><span className={styles.spinner} /> Uploading…</>
                                    : <><i className="fi fi-rr-picture" /> Change Banner</>}
                            </button>

                            <button className={styles.actionBtnGreen} onClick={() => setEnrichOpen(true)}>
                                <i className="fi fi-rr-magic-wand" /> Enrich Profile
                            </button>

                            <button
                                className={styles.actionBtnBlue}
                                onClick={handleDownloadPdf}
                                disabled={pdfLoading}
                            >
                                {pdfLoading
                                    ? <><span className={styles.spinner} /> Generating…</>
                                    : <><i className="fi fi-rr-file-pdf" /> Download PDF</>}
                            </button>

                            <button className={styles.actionBtn} onClick={() => setEditOpen(true)}>
                                <i className="fi fi-rr-edit" /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stub notice */}
                {isStub && (
                    <div className={styles.stubNotice}>
                        <div className={styles.stubTitle}>Profile stub — resume not yet parsed</div>
                        <div className={styles.stubBody}>
                            This candidate was added from a call booking. Upload their resume or paste
                            their LinkedIn to enrich the profile with AI-generated details.
                        </div>
                        <button className={styles.stubBtn} onClick={() => setEnrichOpen(true)}>
                            Enrich with Resume / LinkedIn
                        </button>
                    </div>
                )}

                {/* ══════════════════════════════════════════
                    TWO-COLUMN BODY — mirrors PDF .body layout
                ══════════════════════════════════════════ */}
                <div className={styles.profileBodyInner}>

                    {/* ── Main column ── */}
                    <div className={styles.mainCol}>

                        {candidate.ai_summary && (
                            <Section title="About">
                                <p className={styles.summaryText}>{candidate.ai_summary}</p>
                            </Section>
                        )}

                        {experienceBullets.length > 0 && (
                            <Section title="Experience">
                                <ul className={styles.bulletList}>
                                    {experienceBullets.map((b, i) => (
                                        <li key={i} className={styles.bulletItem}>{b}</li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {educationBullets.length > 0 && (
                            <Section title="Education">
                                <ul className={styles.bulletList}>
                                    {educationBullets.map((b, i) => (
                                        <li key={i} className={styles.bulletItem}>{b}</li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {candidate.ai_outreach_message && (
                            <Section title="Outreach Message">
                                <p className={styles.bodyText}>
                                    {outreachExpanded
                                        ? candidate.ai_outreach_message
                                        : candidate.ai_outreach_message.slice(0, 300) +
                                        (candidate.ai_outreach_message.length > 300 ? "…" : "")}
                                </p>
                                {candidate.ai_outreach_message.length > 300 && (
                                    <button className={styles.expandBtn} onClick={() => setOutreachExpanded(p => !p)}>
                                        {outreachExpanded ? "Show less ↑" : "Show full message ↓"}
                                    </button>
                                )}
                            </Section>
                        )}

                        {candidate.meeting_transcript && (
                            <Section title="Call Transcript">
                                <div className={styles.transcriptWrap}>
                                    <pre className={styles.transcriptPre}>
                                        {transcriptExpanded
                                            ? candidate.meeting_transcript
                                            : candidate.meeting_transcript.slice(0, 600) +
                                            (candidate.meeting_transcript.length > 600 ? "…" : "")}
                                    </pre>
                                    {candidate.meeting_transcript.length > 600 && !transcriptExpanded && (
                                        <div className={styles.transcriptFade} />
                                    )}
                                </div>
                                {candidate.meeting_transcript.length > 600 && (
                                    <button className={styles.expandBtn} onClick={() => setTranscriptExpanded(p => !p)}>
                                        {transcriptExpanded ? "Show less ↑" : "Show full transcript ↓"}
                                    </button>
                                )}
                            </Section>
                        )}

                        {candidate.recruiter_notes && (
                            <Section title="Recruiter Notes" className={styles.notesSection}>
                                <span className={styles.notesInternalBadge}>Internal Only</span>
                                <p className={styles.bodyText}>{candidate.recruiter_notes}</p>
                            </Section>
                        )}
                    </div>

                    {/* ── Side column ── */}
                    <div className={styles.sideCol}>

                        <Section title="Contact">
                            <div className={styles.infoList}>
                                <InfoRow label="Email" value={candidate.email} href={candidate.email ? `mailto:${candidate.email}` : null} />
                                <InfoRow label="Phone" value={candidate.phone} href={candidate.phone ? `tel:${candidate.phone}` : null} />
                                <InfoRow label="LinkedIn" value={candidate.linkedin_url ? "View Profile" : null} href={candidate.linkedin_url} />
                            </div>
                        </Section>

                        {(candidate.ai_certifications || skills.length > 0) && (
                            <Section title="Skills & Certifications">
                                {candidate.ai_certifications && (
                                    <div className={styles.certRow}>
                                        <span className={styles.sideLabel}>Certifications</span>
                                        <div className={styles.certBadgeRow}>
                                            {hasCPA && <span className={styles.certBadge}>CPA</span>}
                                            {hasCFA && <span className={styles.certBadge}>CFA</span>}
                                            {hasCMA && <span className={styles.certBadge}>CMA</span>}
                                            {!hasCPA && !hasCFA && !hasCMA && (
                                                <p className={styles.certText}>{candidate.ai_certifications}</p>
                                            )}
                                        </div>
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
                                    label="Level"
                                    value={candidate.ai_career_level
                                        ? candidate.ai_career_level.charAt(0).toUpperCase() + candidate.ai_career_level.slice(1)
                                        : null}
                                />
                                <InfoRow label="Experience" value={candidate.ai_years_experience ? `${candidate.ai_years_experience} years` : null} />
                                <InfoRow label="Source" value={isFromCall ? "From Call" : "Manual Entry"} />
                                {candidate.ai_parsed_at && (
                                    <InfoRow
                                        label="Parsed"
                                        value={new Date(candidate.ai_parsed_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric",
                                        })}
                                    />
                                )}
                                <InfoRow
                                    label="Added"
                                    value={candidate.created_at
                                        ? new Date(candidate.created_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric",
                                        })
                                        : "—"}
                                />
                                <InfoRow label="AI Search" value={candidate.embedded_at ? "✓ Indexed" : "Not indexed"} />
                                {candidate.meeting_transcript && <InfoRow label="Transcript" value="✓ Available" />}
                            </div>
                        </Section>

                        {/* PDF export card — mirrors PDF card style */}
                        <div className={styles.pdfCard}>
                            <div className={styles.pdfCardHeader}>Export Profile</div>
                            <div className={styles.pdfCardBody}>
                                <p className={styles.pdfCardDesc}>
                                    Download a clean PDF to share with potential employers.
                                </p>
                                <button className={styles.pdfCardBtn} onClick={handleDownloadPdf} disabled={pdfLoading}>
                                    {pdfLoading
                                        ? <><span className={styles.spinner} /> Generating…</>
                                        : <><i className="fi fi-rr-file-pdf" /> Download PDF</>}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── RYZE footer — mirrors PDF footer ── */}
                <div className={styles.profileFooter}>
                    <div className={styles.footerLeft}>
                        <span className={styles.footerBrand}>RYZE.ai</span>
                        <span className={styles.footerSep} />
                        <span className={styles.footerTagline}>Candidate Profile</span>
                    </div>
                    <div className={styles.footerRight}>
                        {candidate.ai_parsed_at
                            ? `Parsed ${new Date(candidate.ai_parsed_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                            : "Not yet enriched"}
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