/* src/pages/CandidateDashboard.jsx */
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import BookingModal from '../components/BookingModal';
import styles from './CandidateDashboard.module.css';

const API_BASE = import.meta.env.PROD
  ? 'https://api.ryzerecruiting.com'
  : 'http://localhost:8000';

const FEATURE_CARDS = [
  {
    id: 'browse-jobs',
    icon: '🔍',
    title: 'Browse Jobs',
    description: 'Explore open accounting & finance roles matched to your background and experience level.',
    cta: 'Search Jobs',
    ready: false,
  },
  {
    id: 'my-applications',
    icon: '📁',
    title: 'My Applications',
    description: 'Track the status of every role you\'ve applied to and follow up at the right time.',
    cta: 'View Applications',
    ready: false,
  },
  {
    id: 'build-profile',
    icon: '👤',
    title: 'Build Your Profile',
    description: 'Add your resume, credentials, and work history so employers can find and vet you quickly.',
    cta: 'Edit Profile',
    ready: false,
  },
  {
    id: 'saved-jobs',
    icon: '⭐',
    title: 'Saved Jobs',
    description: 'Revisit roles you\'ve bookmarked and apply when the timing is right.',
    cta: 'View Saved',
    ready: false,
  },
  {
    id: 'messages',
    icon: '💬',
    title: 'Messages',
    description: 'Communicate directly with employers and your RYZE recruiter.',
    cta: 'Open Inbox',
    ready: false,
  },
  {
    id: 'resources',
    icon: '📚',
    title: 'Career Resources',
    description: 'Interview guides, salary benchmarks, and tips tailored to accounting & finance professionals.',
    cta: 'Explore Resources',
    ready: false,
  },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function CandidateDashboard() {
  const { user } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState([]);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    async function fetchMyBookings() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/bookings/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const confirmed = data.filter(b => b.status === 'confirmed' && b.meeting_url);
        setConfirmedBookings(confirmed);
      } catch (e) {
        // non-fatal
      }
    }
    fetchMyBookings();
  }, []);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>

        {/* ── Confirmed Call Banner ─────────────────────── */}
        {confirmedBookings.map(booking => (
          <div key={booking.id} className={styles.callBanner}>
            <div className={styles.callBannerIcon}>📅</div>
            <div className={styles.callBannerText}>
              <div className={styles.callBannerTitle}>Your intro call is confirmed</div>
              <div className={styles.callBannerSub}>
                {formatDate(booking.date)} at {booking.time_slot} EST
              </div>
            </div>
            <a
              href={booking.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.callBannerBtn}
            >
              Join Zoom Call →
            </a>
          </div>
        ))}

        {/* ── Welcome Banner ────────────────────────────── */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <div className={styles.badge}>Candidate</div>
            <h2 className={styles.welcomeTitle}>Welcome back, {firstName}.</h2>
            <p className={styles.welcomeSub}>
              Your RYZE career dashboard — find the right accounting &amp; finance role and let us help get you there.
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
        variant="candidate"
      />
    </div>
  );
}

export default CandidateDashboard;