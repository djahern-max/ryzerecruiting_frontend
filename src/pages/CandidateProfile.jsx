/* src/pages/CandidateProfile.jsx */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import CandidateModal from "../components/CandidateModal";
import styles from "./CandidateProfile.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function parseJsonField(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
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

    if (loading) return (
        <div className={styles.page}>
            <AdminHeader active="candidates" />
            <div className={styles.loadingState}>
                <div className={styles.loadingDots}><span /><span /><span /></div>
                <p>Loading profile…</p>
            </div>
        </div>
    );

    if (error || !candidate) return (
        <div className={styles.page}>
            <AdminHeader active="candidates" />
            <div className={styles.errorState}>
                <p>{error || "Candidate not found."}</p>
                <button onClick={() => navigate(-1)} className={styles.errorBackBtn}>
                    ← Back to Candidates
                </button>
            </div>
        </div>
    );

    const skills = parseJsonField(candidate.ai_skills);
    const hasCPA = candidate.ai_certifications?.toUpperCase().includes("CPA");
    const hasCFA = candidate.ai_certifications?.toUpperCase().includes("CFA");
    const hasCMA = candidate.ai_certifications?.toUpperCase().includes("CMA");
    const isFromCall = candidate.source === "booking";
    const isStub = isFromCall && !candidate.ai_summary && !candidate.current_title;
    const experienceBullets = parseToDisplayBullets(candidate.ai_experience);
    const educationBullets = parseToDisplayBullets(candidate.ai_education, 4);
    const careerLevelLabel = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', executive: 'Executive' }[candidate.ai_career_level] || candidate.ai_career_level || null;

    const totalMainBullets = experienceBullets.length + educationBullets.length;
    const skillsCap = totalMainBullets <= 4 ? 6 : totalMainBullets <= 7 ? 8 : 10;

    return (
        <div className={styles.page}>
            <AdminHeader active="candidates" />

            <main className={styles.main}>

                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    ← Back to Candidates
                </button>

                {/* Hidden file inputs */}
                <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBannerChange} />

                {/* BANNER — flat, no card */}
                <div
                    className={styles.banner}
                    style={candidate.banner_url ? {
                        backgroundImage: `url(${candidate.banner_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    } : {}}
                />

                {/* IDENTITY ZONE — avatar (left) + name (middle) + actions (right) */}
                <div className={styles.identityZone}>

                    {/* AVATAR */}
                    <div
                        className={styles.avatarWrap}
                        onClick={() => !photoUploading && photoInputRef.current?.click()}
                        title="Click to upload photo"
                    >
                        {candidate.photo_url
                            ? <img src={candidate.photo_url} alt={candidate.name} className={styles.avatarImg} />
                            : <div className={styles.avatarInitial}>{getInitials(candidate.name)}</div>
                        }
                        <div className={styles.avatarOverlay}>
                            {photoUploading
                                ? <span className={styles.spinner} />
                                : <span className={styles.cameraIcon}>📷</span>
                            }
                        </div>
                    </div>

                    {/* NAME */}
                    <div className={styles.identityName}>
                        {candidate.name}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className={styles.identityActions}>
                        <button
                            className={styles.actionBtn}
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={bannerUploading}
                            title="Change Banner"
                        >
                            {bannerUploading ? <span className={styles.spinner} /> : <i className="fi fi-rr-picture" />}
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={() => setEnrichOpen(true)}
                            title="Enrich Profile"
                        >
                            <i className="fi fi-rr-magic-wand" />
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={handleDownloadPdf}
                            disabled={pdfLoading}
                            title="Download PDF"
                        >
                            {pdfLoading ? <span className={styles.spinner} /> : <i className="fi fi-rr-file-pdf" />}
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={() => setEditOpen(true)}
                            title="Edit Profile"
                        >
                            <i className="fi fi-rr-edit" />
                        </button>
                    </div>
                </div>

                {/* NAME BLOCK — title, company, location */}
                <div className={styles.nameBlock}>

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

                {/* TWO-COLUMN BODY */}
                <div className={styles.profileBodyGrid}>

                    <div className={styles.mainCol}>
                        {candidate.ai_summary && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>About</div>
                                <div className={styles.bodyCardBody}>
                                    <p className={styles.summaryText}>{candidate.ai_summary}</p>
                                </div>
                            </div>
                        )}

                        {experienceBullets.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Experience</div>
                                <div className={styles.bodyCardBody}>
                                    <ul className={styles.bulletList}>
                                        {experienceBullets.map((b, i) => (
                                            <li key={i} className={styles.bulletItem}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {educationBullets.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Education</div>
                                <div className={styles.bodyCardBody}>
                                    <ul className={styles.bulletList}>
                                        {educationBullets.map((b, i) => (
                                            <li key={i} className={styles.bulletItem}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {candidate.ai_outreach_message && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Outreach Message</div>
                                <div className={styles.bodyCardBody}>
                                    <p className={styles.bodyText}>
                                        {outreachExpanded
                                            ? candidate.ai_outreach_message
                                            : candidate.ai_outreach_message.slice(0, 300) + (candidate.ai_outreach_message.length > 300 ? "…" : "")}
                                    </p>
                                    {candidate.ai_outreach_message.length > 300 && (
                                        <button className={styles.expandBtn} onClick={() => setOutreachExpanded(p => !p)}>
                                            {outreachExpanded ? "Show less ↑" : "Show full message ↓"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {candidate.meeting_transcript && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Call Transcript</div>
                                <div className={styles.bodyCardBody}>
                                    <div className={styles.transcriptWrap}>
                                        <pre className={styles.transcriptPre}>
                                            {transcriptExpanded
                                                ? candidate.meeting_transcript
                                                : candidate.meeting_transcript.slice(0, 600) + (candidate.meeting_transcript.length > 600 ? "…" : "")}
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
                                </div>
                            </div>
                        )}

                        {candidate.recruiter_notes && (
                            <div className={`${styles.bodyCard} ${styles.notesCard}`}>
                                <div className={styles.bodyCardTitle}>Recruiter Notes</div>
                                <div className={styles.bodyCardBody}>
                                    <span className={styles.notesInternalBadge}>Internal Only</span>
                                    <p className={styles.bodyText}>{candidate.recruiter_notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.sideCol}>

                        {/* Contact */}
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Contact</div>
                            <div className={styles.bodyCardBody}>
                                <div className={styles.roGrid}>
                                    {candidate.email && (
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>Email</span>
                                            <a href={`mailto:${candidate.email}`} className={styles.roLink}>{candidate.email}</a>
                                        </div>
                                    )}
                                    {candidate.phone && (
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>Phone</span>
                                            <a href={`tel:${candidate.phone}`} className={styles.roLink}>{candidate.phone}</a>
                                        </div>
                                    )}
                                    {candidate.linkedin_url && (
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>LinkedIn</span>
                                            <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.roLink}>View Profile</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Career Details */}
                        {(careerLevelLabel || candidate.ai_years_experience || candidate.ai_certifications) && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Career Details</div>
                                <div className={styles.bodyCardBody}>
                                    <div className={styles.roGrid}>
                                        {careerLevelLabel && (
                                            <div className={styles.roField}>
                                                <span className={styles.roLabel}>Level</span>
                                                <span className={styles.roValue}>{careerLevelLabel}</span>
                                            </div>
                                        )}
                                        {candidate.ai_years_experience && (
                                            <div className={styles.roField}>
                                                <span className={styles.roLabel}>Experience</span>
                                                <span className={styles.roValue}>{candidate.ai_years_experience} years</span>
                                            </div>
                                        )}
                                        {candidate.ai_certifications && (
                                            <div className={styles.roField}>
                                                <span className={styles.roLabel}>Certification</span>
                                                <div className={styles.certBadgeRow}>
                                                    {hasCPA && <span className={styles.certBadge}>CPA</span>}
                                                    {hasCFA && <span className={styles.certBadge}>CFA</span>}
                                                    {hasCMA && <span className={styles.certBadge}>CMA</span>}
                                                    {!hasCPA && !hasCFA && !hasCMA && (
                                                        <span className={styles.roValue}>{candidate.ai_certifications}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {skills.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Skills</div>
                                <div className={styles.bodyCardBody}>
                                    <div className={styles.skillsWrap}>
                                        {skills.slice(0, skillsCap).map((skill, i) => (
                                            <span key={i} className={styles.skillTag}>{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Profile Details */}
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Profile Details</div>
                            <div className={styles.bodyCardBody}>
                                <div className={styles.roGrid}>
                                    <div className={styles.roField}>
                                        <span className={styles.roLabel}>Source</span>
                                        <span className={styles.roValue}>{isFromCall ? "From Call" : "Manual Entry"}</span>
                                    </div>
                                    {candidate.ai_parsed_at && (
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>Parsed</span>
                                            <span className={styles.roValue}>
                                                {new Date(candidate.ai_parsed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>
                                    )}
                                    {candidate.created_at && (
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>Added</span>
                                            <span className={styles.roValue}>
                                                {new Date(candidate.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>
                                    )}
                                    <div className={styles.roField}>
                                        <span className={styles.roLabel}>AI Search</span>
                                        <span className={styles.roValue}>{candidate.embedded_at ? "✓ Indexed" : "Not indexed"}</span>
                                    </div>
                                    {candidate.meeting_transcript && (
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>Transcript</span>
                                            <span className={styles.roValue}>✓ Available</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RYZE footer */}
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

            </main>

            {enrichOpen && <CandidateModal candidate={candidate} token={token} enrichMode={true} onSaved={handleSaved} onClose={() => setEnrichOpen(false)} />}
            {editOpen && <CandidateModal candidate={candidate} token={token} onSaved={handleSaved} onClose={() => setEditOpen(false)} />}
        </div>
    );
}