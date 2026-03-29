/* src/components/IntelligenceMessage.jsx */
import { useState } from "react";
import ReactMarkdown from "react-markdown";
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
    const navigate = useNavigate();

    const candidateIds = message.candidates || [];
    const employerIds = message.employers || [];
    const hasCards = candidateIds.length > 0 || employerIds.length > 0;

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

    const candidateLabel = candidateIds.length > 0
        ? `${candidateIds.length} Candidate${candidateIds.length !== 1 ? "s" : ""}`
        : null;
    const employerLabel = employerIds.length > 0
        ? `${employerIds.length} Employer${employerIds.length !== 1 ? "s" : ""}`
        : null;

    const parts = [candidateLabel, employerLabel].filter(Boolean);
    const toggleLabel = expanded
        ? "Hide ↑"
        : `View ${parts.join(" & ")} →`;

    return (
        <div className={styles.messageWrap}>
            <ReactMarkdown
                className={styles.prose}
                components={{
                    p: ({ children }) => <p className={styles.p}>{children}</p>,
                    strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
                    ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
                    li: ({ children }) => <li className={styles.li}>{children}</li>,
                }}
            >
                {message.content}
            </ReactMarkdown>

            {/* ── Toggle ── */}
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
                                    onViewProfile={(candidate) => navigate(`/admin/candidates/${candidate.id}`)}
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
                                    onViewEmployer={(employer) => navigate(`/admin/employers/${employer.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
