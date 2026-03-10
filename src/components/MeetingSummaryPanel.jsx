/* src/components/MeetingSummaryPanel.jsx */
import styles from './MeetingSummaryPanel.module.css';
import aiNotesIcon from '../assets/icons/ai_notes.svg';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function MeetingSummaryPanel({ booking, onClose }) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img src={aiNotesIcon} alt="" className={styles.icon} />
          <span>Meeting Summary</span>
        </div>
        <button className={styles.close} onClick={onClose} aria-label="Close summary">✕</button>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Contact</span>
          <span className={styles.metaValue}>{booking.employer_name}</span>
        </div>
        {booking.company_name && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Company</span>
            <span className={styles.metaValue}>{booking.company_name}</span>
          </div>
        )}
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Date</span>
          <span className={styles.metaValue}>{formatDate(booking.date)} · {booking.time_slot} EST</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Email</span>
          <span className={styles.metaValue}>{booking.employer_email}</span>
        </div>
      </div>

      <p className={styles.text}>{booking.meeting_summary}</p>
    </div>
  );
}

export default MeetingSummaryPanel;
