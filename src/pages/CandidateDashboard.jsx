/* src/pages/CandidateDashboard.jsx */
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import BookingModal from '../components/BookingModal';
import styles from './CandidateDashboard.module.css';
import checkIcon from '../assets/icons/check.svg';
import zoomIcon from '../assets/icons/zoom.svg';

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
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function CandidateDashboard() {
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
        if (!res.ok) return;
        const data = await res.json();
        setMyBookings(data);
      } catch (e) {
        // non-fatal
      } finally {
        setBookingsLoading(false);
      }
    }
    fetchMyBookings();
  }, []);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>

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
              📅 Schedule Call
            </button>
          </div>
        </div>

        {/* ── My Scheduled Calls ────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>My Scheduled Calls</h3>
              <p className={styles.sectionSub}>Your intro calls with RYZE Recruiting</p>
            </div>
          </div>

          {bookingsLoading ? (
            <div className={styles.callsEmpty}>Loading your calls…</div>
          ) : myBookings.length === 0 ? (
            <div className={styles.callsEmpty}>
              <p>No calls scheduled yet.</p>
              <button className={styles.bookingBtnSm} onClick={() => setBookingOpen(true)}>
                Book your first call
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
                        <span className={styles.statusConfirmed}>
                          <img src={checkIcon} alt="" className={styles.statusIcon} />
                          Confirmed
                        </span>
                      )}
                      {booking.status === 'pending' && (
                        <span className={styles.statusPending}>
                          <i className="fi fi-rr-clock"></i>
                          Awaiting Confirmation
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className={styles.statusCancelled}>
                          <i className="fi fi-rr-circle-xmark"></i>
                          Cancelled
                        </span>
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
                          className={styles.rebookLink}
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
                        aria-label="Join Zoom Call"
                      >
                        <img src={zoomIcon} alt="" className={styles.zoomIcon} />
                      </a>
                    </div>
                  )}
                  {booking.status === 'pending' && (
                    <div className={styles.callCardRight}>
                      <button
                        className={styles.calendarIcon}
                        onClick={() => setBookingOpen(true)}
                        aria-label="Schedule another call"
                      >
                        📅
                      </button>
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
                  onClick={() => { }}
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