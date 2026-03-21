/* src/components/CandidateResultCard.jsx */
import styles from "./CandidateResultCard.module.css";

const CAREER_LEVEL_COLORS = {
    junior: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    mid: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    senior: { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
    executive: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
};

export default function CandidateResultCard({ candidate, onViewProfile }) {
    const level = candidate.ai_career_level?.toLowerCase();
    const levelStyle = CAREER_LEVEL_COLORS[level] || CAREER_LEVEL_COLORS.mid;
    const hasCPA = candidate.ai_certifications?.toUpperCase().includes("CPA");
    const hasCFA = candidate.ai_certifications?.toUpperCase().includes("CFA");

    return (
        <div className={styles.card}>
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
                        <span
                            className={styles.badge}
                            style={{
                                background: levelStyle.bg,
                                color: levelStyle.color,
                                borderColor: levelStyle.border,
                            }}
                        >
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