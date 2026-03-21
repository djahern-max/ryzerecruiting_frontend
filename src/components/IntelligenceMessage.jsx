/* src/components/IntelligenceMessage.jsx */
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import CandidateModal from "./CandidateModal";
import styles from "./IntelligenceMessage.module.css";
import CandidateResultCard from "./CandidateResultCard";
import EmployerResultCard from "./EmployerResultCard";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function IntelligenceMessage({ message }) {
    const [expanded, setExpanded] = useState(false);
    const [fetchedCandidates, setFetchedCandidates] = useState(null);
    const [fetchedEmployers, setFetchedEmployers] = useState(null);
    const [loadingCards, setLoadingCards] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const navigate = useNavigate();

    const candidateIds = message.candidates || [];
    const employerIds = message.employers || [];
    const hasCards = candidateIds.length > 0 || employerIds.length > 0;

    // UPDATE handleToggle — add employer fetching
    async function handleToggle() {
        if (expanded) {
            setExpanded(false);
            return;
        }

        setExpanded(true);
        const token = localStorage.getItem("token");

        const fetches = [];

        if (fetchedCandidates === null && candidateIds.length > 0) {
            fetches.push(
                Promise.all(
                    candidateIds.map((id) =>
                        fetch(`${API_BASE}/api/candidates/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }).then((r) => r.ok ? r.json() : null)
                    )
                ).then((results) => setFetchedCandidates(results.filter(Boolean)))
            );
        }

        if (fetchedEmployers === null && employerIds.length > 0) {
            fetches.push(
                Promise.all(
                    employerIds.map((id) =>
                        fetch(`${API_BASE}/api/employer-profiles/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }).then((r) => r.ok ? r.json() : null)
                    )
                ).then((results) => setFetchedEmployers(results.filter(Boolean)))
            );
        }

        if (fetches.length > 0) {
            setLoadingCards(true);
            try {
                await Promise.all(fetches);
            } catch (e) {
                setFetchedCandidates(fetchedCandidates ?? []);
                setFetchedEmployers(fetchedEmployers ?? []);
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
                    {!loadingCards && fetchedEmployers?.length > 0 && (
                        <div className={styles.cardsList}>
                            {fetchedEmployers.map((e) => (
                                <EmployerResultCard
                                    key={e.id}
                                    employer={e}
                                    onViewEmployer={(employer) => navigate(`/admin/employers?expand=${employer.id}`)}
                                />
                            ))}
                        </div>
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