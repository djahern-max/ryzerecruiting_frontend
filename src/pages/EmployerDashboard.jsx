/* src/pages/EmployerDashboard.jsx */
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import ScheduleCallButton from '../components/ScheduleCallButton';
import styles from './EmployerDashboard.module.css';
import comingSoonIcon from '../assets/icons/coming-soon.svg';
import checkIcon from '../assets/icons/check.svg';
import zoomIcon from '../assets/icons/zoom.svg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const FEATURE_CARDS = [
  {
    id: 'post-job',
    icon: 'fi fi-rr-document',
    title: 'Post a Job',
    description: 'Create a new listing and reach vetted accounting & finance professionals.',
    cta: 'Post Now',
    ready: false,
  },
  {
    id: 'browse-candidates',
    icon: 'fi fi-rr-search',
    title: 'Browse Candidates',
    description: 'Search our database of pre-screened accounting and finance talent.',
    cta: 'Search Talent',
    ready: false,
  },
  {
    id: 'applications',
    icon: 'fi fi-rr-folder',
    title: 'Manage Applications',
    description: 'Review, track, and move candidates through your hiring pipeline.',
    cta: 'View Pipeline',
    ready: false,
  },
  {
    id: 'messages',
    icon: 'fi fi-rr-comment',
    title: 'Messages',
    description: 'Communicate directly with candidates and your RYZE recruiter.',
    cta: 'Open Inbox',
    ready: false,
  },
  {
    id: 'analytics',
    icon: 'fi fi-rr-chart-histogram',
    title: 'Analytics',
    description: 'Track time-to-fill, applicant quality, and hiring funnel performance.',
    cta: 'View Reports',
    ready: false,
  },
  {
    id: 'saved',
    icon: 'fi fi-rr-bookmark',
    title: 'Saved Candidates',
    description: "Revisit candidates you've bookmarked for future roles.",
    cta: 'View Saved',
    ready: false,
  },
];

function EmployerDashboard() {
  const { user } = useAuth();
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
            {/* Icon size constrained by .welcomeActions in CSS — see ScheduleCallButton note */}
            <ScheduleCallButton variant="iconOnly" size="md" />
          </div>
        </div>

        {/* ── My Scheduled Calls ────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>My Scheduled Calls</h3>
            <p className={styles.sectionSub}>Your discovery calls with RYZE Recruiting</p>
          </div>

          {bookingsLoading ? (
            <div className={styles.callsEmpty}>Loading your calls…</div>
          ) : myBookings.length === 0 ? (
            <div className={styles.callsEmpty}>
              <p>No calls scheduled yet.</p>
              <ScheduleCallButton size="sm" label="Book your first call" />
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
                      {/* ✅ check.svg restored — illustrated SVG preferred over CDN font here */}
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
                        <ScheduleCallButton
                          variant="ghost"
                          size="sm"
                          label="Rebook →"
                        />
                      </div>
                    )}
                  </div>

                  {/* ✅ Zoom SVG — Tier 2 brand asset */}
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
                  <i className={`${card.icon} ${styles.featureIcon}`}></i>
                  {!card.ready && (
                    <img
                      src={comingSoonIcon}
                      alt="Coming Soon"
                      className={styles.comingSoonBadge}
                    />
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
    </div>
  );
}

export default EmployerDashboard;