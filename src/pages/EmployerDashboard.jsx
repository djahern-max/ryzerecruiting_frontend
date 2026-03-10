/* src/pages/EmployerDashboard.jsx */
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import ScheduleCallButton from '../components/ScheduleCallButton';
import styles from './EmployerDashboard.module.css';
import checkIcon from '../assets/icons/check.svg';
import zoomIcon from '../assets/icons/zoom.svg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const COMING_SOON = [
  { icon: 'fi fi-rr-document', label: 'Post a Job' },
  { icon: 'fi fi-rr-search', label: 'Browse Candidates' },
  { icon: 'fi fi-rr-folder', label: 'Manage Applications' },
  { icon: 'fi fi-rr-comment', label: 'Messages' },
  { icon: 'fi fi-rr-chart-histogram', label: 'Analytics' },
  { icon: 'fi fi-rr-bookmark', label: 'Saved Candidates' },
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
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>

        {/* ── Page Top ──────────────────────────────────── */}
        <div className={styles.pageTop}>
          <div>
            <h1 className={styles.pageTitle}>Welcome back, {firstName}.</h1>
            <p className={styles.pageSub}>Your hiring dashboard — powered by RYZE Recruiting.</p>
          </div>
          <ScheduleCallButton variant="primary" size="md" label="Schedule a Call" />
        </div>

        {/* ── My Scheduled Calls ────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>My Scheduled Calls</h3>
            <p className={styles.sectionSub}>Your discovery calls with RYZE Recruiting</p>
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
                <ScheduleCallButton variant="primary" size="sm" label="Book Your First Call" />
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
                    {/* Status */}
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

                    {/* Date & time */}
                    <div className={styles.callDate}>{formatDate(booking.date)}</div>
                    <div className={styles.callTime}>{booking.time_slot} EST</div>

                    {/* Pending nudge */}
                    {booking.status === 'pending' && (
                      <div className={styles.callPendingNote}>
                        Your call request has been received — we'll confirm shortly.
                      </div>
                    )}

                    {/* Cancelled nudge */}
                    {booking.status === 'cancelled' && (
                      <div className={styles.callCancelledNote}>
                        This call was cancelled.{' '}
                        <ScheduleCallButton variant="ghost" size="sm" label="Rebook →" />
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
    </div>
  );
}

export default EmployerDashboard;