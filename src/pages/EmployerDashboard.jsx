/* src/pages/EmployerDashboard.jsx */
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import BookingModal from '../components/BookingModal';
import styles from './EmployerDashboard.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    description: "Revisit candidates you've bookmarked for future roles.",
    cta: 'View Saved',
    ready: false,
  },
];

function EmployerDashboard() {
  const { user } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    async function fetchMyBookings() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/bookings/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load bookings');
        const data = await res.json();
        setMyBookings(data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setBookingsLoading(false);
      }
    }
    fetchMyBookings();
  }, []);

  function formatDate(dateStr) {
    // dateStr is "YYYY-MM-DD" from the API — parse as local date to avoid
    // timezone-shift issues (e.g. Dec 31 rendering as Dec 30).
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

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

        {/* ── My Scheduled Calls ────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>My Scheduled Calls</h3>
              <p className={styles.sectionSub}>Your discovery calls with RYZE Recruiting</p>
            </div>
          </div>

          {bookingsLoading ? (
            <div className={styles.callsEmpty}>Loading your calls…</div>
          ) : myBookings.length === 0 ? (
            <div className={styles.callsEmpty}>
              No calls scheduled yet.{' '}
              <button className={styles.callsBookLink} onClick={() => setBookingOpen(true)}>
                Book your first call →
              </button>
            </div>
          ) : (
            <div className={styles.callsList}>
              {myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`${styles.callCard} ${styles[`callCard_${booking.status}`]}`}
                >
                  <div className={styles.callCardLeft}>
                    <div className={styles.callStatus}>
                      {booking.status === 'confirmed' && (
                        <span className={styles.statusConfirmed}>✅ Confirmed</span>
                      )}
                      {booking.status === 'pending' && (
                        <span className={styles.statusPending}>🕐 Awaiting Confirmation</span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className={styles.statusCancelled}>❌ Cancelled</span>
                      )}
                    </div>
                    <div className={styles.callDate}>{formatDate(booking.date)}</div>
                    <div className={styles.callTime}>{booking.time_slot} EST</div>
                    {booking.company_name && (
                      <div className={styles.callCompany}>{booking.company_name}</div>
                    )}
                    {booking.status === 'pending' && (
                      <div className={styles.callPendingNote}>
                        You'll receive an email with your Zoom link once confirmed.
                      </div>
                    )}
                    {booking.status === 'cancelled' && (
                      <div className={styles.callPendingNote}>
                        This call was cancelled.{' '}
                        <button
                          className={styles.callsBookLink}
                          onClick={() => setBookingOpen(true)}
                        >
                          Rebook →
                        </button>
                      </div>
                    )}
                  </div>

                  {booking.status === 'confirmed' && booking.meeting_url && (
                    <div className={styles.callCardRight}>
                      <a
                        href={booking.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.zoomButton}
                      >
                        📹 Join Zoom Call
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

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