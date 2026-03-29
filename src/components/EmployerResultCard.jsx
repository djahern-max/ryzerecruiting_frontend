/* src/components/EmployerResultCard.jsx */
import styles from "./EmployerResultCard.module.css";

const RELATIONSHIP_COLORS = {
    active:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    prospect: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    inactive: { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
    warm:     { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
};

export default function EmployerResultCard({ employer, onViewEmployer }) {
    const status = employer.relationship_status?.toLowerCase();
    const statusStyle = RELATIONSHIP_COLORS[status] || RELATIONSHIP_COLORS.prospect;
    const statusLabel = employer.relationship_status
        ? employer.relationship_status.charAt(0).toUpperCase() + employer.relationship_status.slice(1).toLowerCase()
        : null;

    return (
        <div className={styles.card}>
            <div className={styles.cardMain}>
                <div className={styles.cardName}>{employer.company_name}</div>
                {employer.ai_industry && (
                    <div className={styles.cardMeta}>{employer.ai_industry}</div>
                )}
                {employer.ai_company_size && (
                    <div className={styles.cardSize}>{employer.ai_company_size}</div>
                )}
                {statusLabel && (
                    <div className={styles.cardBadges}>
                        <span
                            className={styles.badge}
                            style={{
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                borderColor: statusStyle.border,
                            }}
                        >
                            {statusLabel}
                        </span>
                    </div>
                )}
            </div>
            <button className={styles.viewEmployerBtn} onClick={() => onViewEmployer(employer)}>
                View Profile →
            </button>
        </div>
    );
}
