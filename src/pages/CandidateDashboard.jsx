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

const COMING_SOON = [
  { icon: 'fi fi-rr-search', label: 'Browse Jobs' },
  { icon: 'fi fi-rr-folder', label: 'My Applications' },
  { icon: 'fi fi-rr-user', label: 'Build Your Profile' },
  { icon: 'fi fi-rr-bookmark', label: 'Saved Jobs' },
  { icon: 'fi fi-rr-comment', label: 'Messages' },
  { icon: 'fi fi-rr-book-alt', label: 'Career Resources' },
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
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <span className={styles.bannerBadge}>Candidate</span>
            <h1 className={styles.bannerTitle}>Welcome back, {firstName}.</h1>
            <p className={styles.bannerSub}>
              Your RYZE career dashboard — find the right accounting &amp; finance role and let us help get you there.
            </p>
          </div>
          <div className={styles.bannerRight}>
            <button className={styles.scheduleBtn} onClick={() => setBookingOpen(true)}>
              <i className="fi fi-rr-calendar"></i>
              Schedule a Call
            </button>
          </div>
        </div>

        {/* ── My Scheduled Calls ────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>My Scheduled Calls</h3>
            <p className={styles.sectionSub}>Your intro calls with RYZE.ai</p>
          </div>

          {bookingsLoading ? (
            <div className={styles.callsEmpty}>
              <i className="fi fi-rr-time" style={{ marginRight: '8px' }}></i>
              Loading your calls…
            </div>
          ) : myBookings.length === 0 ? (
            <div className={styles.callsEmpty}>
              <div className={styles.callsEmptyInner}>
                <i className={`fi fi-rr-calendar ${styles.callsEmptyIcon}`}></i>
                <p className={styles.callsEmptyText}>No calls scheduled yet.</p>
                <button className={styles.scheduleBtnSm} onClick={() => setBookingOpen(true)}>
                  Book Your First Call
                </button>
              </div>
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
                          <i className="fi fi-rr-clock" style={{ fontSize: '13px' }}></i>
                          Awaiting Confirmation
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className={styles.statusCancelled}>
                          <i className="fi fi-rr-ban" style={{ fontSize: '13px' }}></i>
                          Cancelled
                        </span>
                      )}
                    </div>

                    <div className={styles.callDate}>{formatDate(booking.date)}</div>
                    <div className={styles.callTime}>{booking.time_slot} EST</div>

                    {booking.status === 'pending' && (
                      <p className={styles.callNote}>
                        Your call request has been received — we'll confirm shortly.
                      </p>
                    )}

                    {booking.status === 'cancelled' && (
                      <p className={styles.callNote}>
                        This call was cancelled.{' '}
                        <button className={styles.rebookLink} onClick={() => setBookingOpen(true)}>
                          Rebook →
                        </button>
                      </p>
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
                        <span>Join Zoom</span>
                      </a>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className={styles.callCardRight}>
                      <div className={styles.pendingPill}>
                        <i className="fi fi-rr-hourglass" style={{ fontSize: '13px' }}></i>
                        Pending
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Coming Soon Strip ─────────────────────────── */}
        <div className={styles.comingSoon}>
          <span className={styles.comingSoonLabel}>Coming soon</span>
          <div className={styles.comingSoonItems}>
            {COMING_SOON.map((item) => (
              <div key={item.label} className={styles.comingSoonItem}>
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        variant="candidate"
      />
    </div>
  );
}

export default CandidateDashboard;