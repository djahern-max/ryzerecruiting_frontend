/* src/components/IntelligenceMessage.jsx */
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import CandidateModal from "./CandidateModal";
import styles from "./IntelligenceMessage.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CAREER_LEVEL_COLORS = {
    junior: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    mid: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    senior: { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
    executive: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
};

function CandidateResultCard({ candidate, onViewProfile }) {
    const level = candidate.ai_career_level?.toLowerCase();
    const levelStyle = CAREER_LEVEL_COLORS[level] || CAREER_LEVEL_COLORS.mid;
    const hasCPA = candidate.ai_certifications?.toUpperCase().includes("CPA");
    const hasCFA = candidate.ai_certifications?.toUpperCase().includes("CFA");

    return (
        <div className={styles.resultCard}>
            <div className={styles.cardMain}>
                <div className={styles.cardName}>{candidate.name}</div>
                <div className={styles.cardMeta}>
                    {candidate.current_title}
                    {candidate.current_company && (
                        <><span className={styles.cardDot}>·</span>{candidate.current_company}</>
                    )}
                </div>
                {candidate.location && (
                    <div className={styles.cardLocation}>{candidate.location}</div>
                )}
                <div className={styles.cardBadges}>
                    {level && (
                        <span className={styles.badge} style={{ background: levelStyle.bg, color: levelStyle.color, borderColor: levelStyle.border }}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                    )}
                    {hasCPA && <span className={styles.badgeCert}>CPA</span>}
                    {hasCFA && <span className={styles.badgeCert}>CFA</span>}
                </div>
            </div>
            <button className={styles.viewProfileBtn} onClick={() => onViewProfile(candidate)}>
                View Profile →
            </button>
        </div>
    );
}

export default function IntelligenceMessage({ message }) {
    const [expanded, setExpanded] = useState(false);
    const [fetchedCandidates, setFetchedCandidates] = useState(null);
    const [fetchedEmployers, setFetchedEmployers] = useState(null);
    const [loadingCards, setLoadingCards] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const candidateIds = message.candidates || [];
    const employerIds = message.employers || [];
    const hasCards = candidateIds.length > 0 || employerIds.length > 0;

    async function handleToggle() {
        if (expanded) {
            setExpanded(false);
            return;
        }

        setExpanded(true);

        // Only fetch if we haven't already
        if (fetchedCandidates === null && candidateIds.length > 0) {
            setLoadingCards(true);
            try {
                const token = localStorage.getItem("token");
                const results = await Promise.all(
                    candidateIds.map((id) =>
                        fetch(`${API_BASE}/api/candidates/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }).then((r) => r.ok ? r.json() : null)
                    )
                );
                setFetchedCandidates(results.filter(Boolean));
            } catch (e) {
                setFetchedCandidates([]);
            } finally {
                setLoadingCards(false);
            }
        }
    }

    // Build the "See More" button label
    // REPLACE WITH
    const candidateLabel = candidateIds.length > 0
        ? `${candidateIds.length} Candidate${candidateIds.length !== 1 ? "s" : ""}`
        : null;
    const employerLabel = employerIds.length > 0
        ? `${employerIds.length} Employer${employerIds.length !== 1 ? "s" : ""}`
        : null;
    const countLabel = [candidateLabel, employerLabel].filter(Boolean).join(" & ");
    const toggleLabel = expanded ? "Hide ↑" : `View ${countLabel} ↓`;

    return (
        <div className={styles.wrapper}>
            {/* ── Prose ── */}
            <div className={styles.prose}>
                {message.streaming
                    ? <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{message.content}</p>
                    : <ReactMarkdown>{message.content}</ReactMarkdown>
                }
                {message.streaming && <span className={styles.streamCursor}>▋</span>}
            </div>

            {/* ── Meetings (always shown, unchanged) ── */}
            {!message.streaming && message.meetings?.length > 0 && (
                <div className={styles.meetingSection}>
                    {message.meetings.map((m) => (
                        <div key={m.id} className={styles.meetingRow}>
                            <span className={styles.meetingName}>{m.employer_name}</span>
                            <span className={styles.meetingDot}>·</span>
                            <span className={styles.meetingMeta}>{m.company_name}</span>
                            <span className={styles.meetingDot}>·</span>
                            <span className={styles.meetingTime}>{m.time_slot}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── See More toggle ── */}
            {!message.streaming && hasCards && (
                <button className={styles.seeMoreBtn} onClick={handleToggle}>
                    {toggleLabel}
                </button>
            )}

            {/* ── Expanded cards ── */}
            {expanded && (
                <div className={styles.cardsSection}>
                    {loadingCards && (
                        <div className={styles.cardsLoading}>Loading profiles…</div>
                    )}
                    {!loadingCards && fetchedCandidates?.length > 0 && (
                        <div className={styles.cardsList}>
                            {fetchedCandidates.map((c) => (
                                <CandidateResultCard
                                    key={c.id}
                                    candidate={c}
                                    onViewProfile={setSelectedCandidate}
                                />
                            ))}
                        </div>
                    )}
                    {!loadingCards && fetchedCandidates?.length === 0 && candidateIds.length > 0 && (
                        <div className={styles.cardsEmpty}>Could not load candidate profiles.</div>
                    )}
                </div>
            )}

            {/* ── Candidate modal ── */}
            {selectedCandidate && (
                <CandidateModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    onSaved={(updated) => setSelectedCandidate(updated)}
                />
            )}
        </div>
    );
}