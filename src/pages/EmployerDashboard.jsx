/* src/pages/EmployerDashboard.jsx */
import { useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import BookingModal from '../components/BookingModal';
import styles from './EmployerDashboard.module.css';

const FEATURE_CARDS = [
  {
    id: 'post-job',
    icon: '📋',
    title: 'Post a Job',
    description: 'Create a new listing and reach vetted accounting & finance professionals.',
    cta: 'Post Now',
    ready: false,
  },
  {
    id: 'browse-candidates',
    icon: '🔍',
    title: 'Browse Candidates',
    description: 'Search our database of pre-screened accounting and finance talent.',
    cta: 'Search Talent',
    ready: false,
  },
  {
    id: 'applications',
    icon: '📁',
    title: 'Manage Applications',
    description: 'Review, track, and move candidates through your hiring pipeline.',
    cta: 'View Pipeline',
    ready: false,
  },
  {
    id: 'messages',
    icon: '💬',
    title: 'Messages',
    description: 'Communicate directly with candidates and your RYZE recruiter.',
    cta: 'Open Inbox',
    ready: false,
  },
  {
    id: 'analytics',
    icon: '📊',
    title: 'Analytics',
    description: 'Track time-to-fill, applicant quality, and hiring funnel performance.',
    cta: 'View Reports',
    ready: false,
  },
  {
    id: 'saved',
    icon: '⭐',
    title: 'Saved Candidates',
    description: 'Revisit candidates you\'ve bookmarked for future roles.',
    cta: 'View Saved',
    ready: false,
  },
];

function EmployerDashboard() {
  const { user } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>

        {/* ── Welcome Banner ────────────────────────────── */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <div className={styles.badge}>Employer</div>
            <h2 className={styles.welcomeTitle}>Welcome back, {firstName}.</h2>
            <p className={styles.welcomeSub}>
              Your RYZE recruiting dashboard — everything you need to hire top accounting &amp; finance talent.
            </p>
          </div>
          <div className={styles.welcomeActions}>
            <button
              className={styles.bookingBtn}
              onClick={() => setBookingOpen(true)}
            >
              📅 Schedule Intro Call
            </button>
          </div>
        </div>

        {/* ── Feature Grid ──────────────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>What would you like to do?</h3>
          <div className={styles.featureGrid}>
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.id}
                className={`${styles.featureCard} ${!card.ready ? styles.featureCardDisabled : ''}`}
              >
                <div className={styles.featureCardTop}>
                  <span className={styles.featureIcon}>{card.icon}</span>
                  {!card.ready && (
                    <span className={styles.soonBadge}>Coming Soon</span>
                  )}
                </div>
                <h4 className={styles.featureTitle}>{card.title}</h4>
                <p className={styles.featureDesc}>{card.description}</p>
                <button
                  className={styles.featureBtn}
                  disabled={!card.ready}
                  onClick={() => {/* wire route here */ }}
                >
                  {card.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Booking Modal ─────────────────────────────── */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
}

export default EmployerDashboard;