/* src/pages/AdminDashboard.jsx */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminDashboard.module.css';

const API_BASE = import.meta.env.PROD
  ? 'https://api.ryzerecruiting.com'
  : 'http://localhost:8000';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  pending: styles.statusPending,
  confirmed: styles.statusConfirmed,
  cancelled: styles.statusCancelled,
};

const FEATURE_CARDS = [
  {
    id: 'job-orders',
    icon: '📋',
    title: 'Job Orders',
    description: 'Manage every active role you\'re recruiting for. Track status from intake all the way through to placement.',
    cta: 'View Job Orders',
    ready: false,
  },
  {
    id: 'employer-roster',
    icon: '🏢',
    title: 'Employer Roster',
    description: 'Your full client list — company details, active roles, call history, and relationship notes.',
    cta: 'View Employers',
    ready: false,
  },
  {
    id: 'candidate-roster',
    icon: '👥',
    title: 'Candidate Roster',
    description: 'Every candidate in your database with availability status, credentials, and which roles they\'re being considered for.',
    cta: 'View Candidates',
    ready: false,
  },
  {
    id: 'match-queue',
    icon: '🎯',
    title: 'Match Queue',
    description: 'Suggested candidate-to-job matches based on role criteria, experience level, and location. Your matchmaking command center.',
    cta: 'View Matches',
    ready: false,
  },
  {
    id: 'activity-feed',
    icon: '⚡',
    title: 'Activity Feed',
    description: 'A chronological log of everything happening across your pipeline — new bookings, submissions, employer responses, and status changes.',
    cta: 'View Activity',
    ready: false,
  },
  {
    id: 'analytics',
    icon: '📊',
    title: 'Reports & Analytics',
    description: 'Time-to-fill, placement rates, pipeline velocity, and revenue metrics. See how your desk is performing.',
    cta: 'View Reports',
    ready: false,
  },
];

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId, newStatus) {
    setUpdatingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? updated : b))
      );
    } catch (err) {
      alert('Error updating booking: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteBooking(bookingId) {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete booking');
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      alert('Error deleting booking: ' + err.message);
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className={styles.page}>

      {/* ── Header ──────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.logo}>RYZE Recruiting</h1>
            <span className={styles.adminBadge}>Admin</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{user?.full_name}</span>
            <button className={styles.logoutButton} onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>

        {/* ── Welcome Banner ──────────────────────────────── */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <div className={styles.badge}>Recruiter Dashboard</div>
            <h2 className={styles.welcomeTitle}>Welcome back, {firstName}.</h2>
            <p className={styles.welcomeSub}>
              Your RYZE command center — manage employers, candidates, job orders, and placements all in one place.
            </p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNumber}>{bookings.length}</span>
              <span className={styles.welcomeStatLabel}>Total Bookings</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={`${styles.welcomeStatNumber} ${styles.pendingColor}`}>
                {pending.length}
              </span>
              <span className={styles.welcomeStatLabel}>Pending</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={`${styles.welcomeStatNumber} ${styles.confirmedColor}`}>
                {confirmed.length}
              </span>
              <span className={styles.welcomeStatLabel}>Confirmed</span>
            </div>
          </div>
        </div>

        {/* ── Recruiter Tools Grid ────────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recruiter Tools</h3>
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

        {/* ── Booking Management ──────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Booking Management</h3>
              <p className={styles.sectionSub}>All incoming discovery call requests</p>
            </div>
            <div className={styles.liveBadge}>● Live</div>
          </div>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{bookings.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statNumber} ${styles.statPending}`}>{pending.length}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statNumber} ${styles.statConfirmed}`}>{confirmed.length}</span>
              <span className={styles.statLabel}>Confirmed</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statNumber} ${styles.statCancelled}`}>{cancelled.length}</span>
              <span className={styles.statLabel}>Cancelled</span>
            </div>
          </div>

          {/* Bookings Table */}
          {loading ? (
            <div className={styles.emptyState}>Loading bookings…</div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : bookings.length === 0 ? (
            <div className={styles.emptyState}>No bookings yet.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Date & Time</th>
                    <th>Phone</th>
                    <th>Notes</th>
                    <th>Meeting</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className={styles.row}>
                      <td className={styles.nameCell}>{booking.employer_name}</td>

                      <td>
                        <a
                          href={`mailto:${booking.employer_email}`}
                          className={styles.emailLink}
                        >
                          {booking.employer_email}
                        </a>
                      </td>

                      <td>
                        {booking.company_name && (
                          <div className={styles.companyName}>
                            {booking.company_name}
                          </div>
                        )}

                        {booking.website_url && (
                          <a
                            href={
                              booking.website_url.startsWith('http')
                                ? booking.website_url
                                : `https://${booking.website_url}`
                            }
                            className={styles.websiteLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {booking.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </td>

                      <td>
                        <div className={styles.dateText}>
                          {formatDate(booking.date)}
                        </div>
                        <div className={styles.timeText}>
                          {booking.time_slot} EST
                        </div>
                      </td>

                      <td className={styles.phone}>
                        {booking.phone || '—'}
                      </td>

                      <td>
                        {booking.meeting_url ? (
                          <a
                            href={booking.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#0a66c2',
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: '13px',
                            }}
                          >
                            Join Zoom →
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                            Pending
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}
                        >
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </td>

                      <td>
                        <div className={styles.actions}>
                          {booking.status !== 'confirmed' && (
                            <button
                              className={styles.confirmBtn}
                              disabled={updatingId === booking.id}
                              onClick={() =>
                                updateStatus(booking.id, 'confirmed')
                              }
                            >
                              Confirm
                            </button>
                          )}

                          {booking.status !== 'cancelled' && (
                            <button
                              className={styles.cancelBtn}
                              disabled={updatingId === booking.id}
                              onClick={() =>
                                updateStatus(booking.id, 'cancelled')
                              }
                            >
                              Cancel
                            </button>
                          )}

                          {booking.status === 'cancelled' && (
                            <button
                              className={styles.deleteBtn}
                              onClick={() =>
                                deleteBooking(booking.id)
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>


              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;