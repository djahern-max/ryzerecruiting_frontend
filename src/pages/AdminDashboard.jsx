/* src/pages/AdminDashboard.jsx */
import { useEffect, useState, useCallback } from 'react';
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

// ---------------------------------------------------------------------------
// Intelligence Brief Panel
// ---------------------------------------------------------------------------

function IntelligenceBrief({ profileId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/employer-profiles/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load intelligence brief');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [profileId]);

  if (loading) {
    return (
      <div className={styles.briefPanel}>
        <div className={styles.briefLoading}><span className={styles.briefSpinner}>⏳</span> Generating intelligence brief…</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.briefPanel}>
        <div className={styles.briefError}>Could not load brief. {error}</div>
      </div>
    );
  }

  const hasStructuredData = profile.ai_company_overview || profile.ai_industry ||
    profile.ai_company_size || profile.ai_hiring_needs?.length ||
    profile.ai_talking_points?.length || profile.ai_red_flags;

  return (
    <div className={styles.briefPanel}>
      <div className={styles.briefHeader}>
        <span className={styles.briefTitle}>⚡ Pre-Call Intelligence Brief</span>
        {profile.ai_brief_updated_at && (
          <span className={styles.briefUpdated}>
            Updated {new Date(profile.ai_brief_updated_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </span>
        )}
        <button className={styles.briefClose} onClick={onClose} aria-label="Close brief">✕</button>
      </div>

      {!hasStructuredData && !profile.ai_brief_raw ? (
        <p className={styles.briefEmpty}>
          No intelligence brief available — website may not have been provided or the brief generation failed.
        </p>
      ) : (
        <div className={styles.briefBody}>

          {/* Fallback: raw text */}
          {profile.ai_brief_raw && !hasStructuredData && (
            <pre className={styles.briefRaw}>{profile.ai_brief_raw}</pre>
          )}

          {/* Structured fields */}
          {profile.ai_company_overview && (
            <div className={styles.briefSection}>
              <div className={styles.briefSectionLabel}>Company Overview</div>
              <div className={styles.briefSectionContent}>{profile.ai_company_overview}</div>
            </div>
          )}

          <div className={styles.briefRow}>
            {profile.ai_industry && (
              <div className={styles.briefSection}>
                <div className={styles.briefSectionLabel}>Industry</div>
                <div className={styles.briefSectionContent}>{profile.ai_industry}</div>
              </div>
            )}
            {profile.ai_company_size && (
              <div className={styles.briefSection}>
                <div className={styles.briefSectionLabel}>Estimated Size</div>
                <div className={styles.briefSectionContent}>{profile.ai_company_size}</div>
              </div>
            )}
          </div>

          {profile.ai_hiring_needs?.length > 0 && (
            <div className={styles.briefSection}>
              <div className={styles.briefSectionLabel}>Likely Hiring Needs</div>
              <div className={styles.briefTags}>
                {profile.ai_hiring_needs.map((need, i) => (
                  <span key={i} className={styles.briefTag}>{need}</span>
                ))}
              </div>
            </div>
          )}

          {profile.ai_talking_points?.length > 0 && (
            <div className={styles.briefSection}>
              <div className={styles.briefSectionLabel}>Key Talking Points</div>
              <ul className={styles.briefList}>
                {profile.ai_talking_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {profile.ai_red_flags && (
            <div className={styles.briefSection}>
              <div className={styles.briefSectionLabel}>⚠️ Red Flags / Considerations</div>
              <div className={`${styles.briefSectionContent} ${styles.briefRedFlags}`}>
                {profile.ai_red_flags}
              </div>
            </div>
          )}

          {profile.recruiter_notes && (
            <div className={styles.briefSection}>
              <div className={styles.briefSectionLabel}>📝 Recruiter Notes</div>
              <div className={styles.briefSectionContent}>{profile.recruiter_notes}</div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedBriefId, setExpandedBriefId] = useState(null); // booking.id of expanded brief

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
      setBookings(prev => prev.map(b => (b.id === bookingId ? updated : b)));
      // Close brief panel if booking is no longer confirmed
      if (newStatus !== 'confirmed') setExpandedBriefId(null);
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

  function toggleBrief(bookingId) {
    setExpandedBriefId(prev => (prev === bookingId ? null : bookingId));
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

  // Shared action buttons (reused in both table and cards)
  function ActionButtons({ booking }) {
    const busy = updatingId === booking.id;
    return (
      <div className={styles.actions}>
        {booking.status === 'confirmed' && booking.employer_profile_id && (
          <button
            className={`${styles.briefBtn} ${expandedBriefId === booking.id ? styles.briefBtnActive : ''}`}
            onClick={() => toggleBrief(booking.id)}
            title="View AI intelligence brief"
          >
            ⚡ Brief
          </button>
        )}
        {booking.status !== 'confirmed' && (
          <button
            className={styles.confirmBtn}
            disabled={busy}
            onClick={() => updateStatus(booking.id, 'confirmed')}
          >
            Confirm
          </button>
        )}
        {booking.status !== 'cancelled' && (
          <button
            className={styles.cancelBtn}
            disabled={busy}
            onClick={() => updateStatus(booking.id, 'cancelled')}
          >
            Cancel
          </button>
        )}
        {booking.status === 'cancelled' && (
          <button
            className={styles.deleteBtn}
            onClick={() => deleteBooking(booking.id)}
          >
            Delete
          </button>
        )}
      </div>
    );
  }

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
              <span className={styles.welcomeStatLabel}>Total</span>
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
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={`${styles.welcomeStatNumber} ${styles.cancelledColor}`}>
                {cancelled.length}
              </span>
              <span className={styles.welcomeStatLabel}>Cancelled</span>
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
                  onClick={() => { }}
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

          {loading ? (
            <div className={styles.emptyState}>Loading bookings…</div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : bookings.length === 0 ? (
            <div className={styles.emptyState}>No bookings yet.</div>
          ) : (
            <>
              {/* ── Desktop Table (hidden on mobile) ── */}
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Company</th>
                      <th>Date & Time</th>
                      <th>Phone</th>
                      <th>Meeting</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <>
                        <tr key={booking.id} className={`${styles.row} ${expandedBriefId === booking.id ? styles.rowExpanded : ''}`}>

                          <td className={styles.nameCell}>
                            {booking.employer_name}
                          </td>

                          <td>
                            <a href={`mailto:${booking.employer_email}`} className={styles.emailLink}>
                              {booking.employer_email}
                            </a>
                          </td>

                          <td>
                            {booking.company_name && (
                              <div className={styles.companyName}>{booking.company_name}</div>
                            )}
                            {booking.website_url && (
                              <a
                                href={booking.website_url.startsWith('http') ? booking.website_url : `https://${booking.website_url}`}
                                className={styles.websiteLink}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {booking.website_url.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                          </td>

                          <td>
                            <div className={styles.dateText}>{formatDate(booking.date)}</div>
                            <div className={styles.timeText}>{booking.time_slot} EST</div>
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
                                className={styles.zoomLink}
                              >
                                Join Zoom →
                              </a>
                            ) : (
                              <span className={styles.zoomPending}>Pending</span>
                            )}
                          </td>

                          <td>
                            <span className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}>
                              {STATUS_LABELS[booking.status]}
                            </span>
                          </td>

                          <td>
                            <ActionButtons booking={booking} />
                          </td>

                        </tr>

                        {/* Intelligence Brief Row — expands below the booking row */}
                        {expandedBriefId === booking.id && booking.employer_profile_id && (
                          <tr key={`brief-${booking.id}`} className={styles.briefRow}>
                            <td colSpan={8} className={styles.briefCell}>
                              <IntelligenceBrief
                                profileId={booking.employer_profile_id}
                                onClose={() => setExpandedBriefId(null)}
                              />
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile Cards (hidden on desktop) ── */}
              <div className={styles.cardList}>
                {bookings.map((booking) => (
                  <div key={booking.id} className={styles.bookingCard}>

                    {/* Card Header: name + status badge */}
                    <div className={styles.cardHeader}>
                      <div className={styles.cardName}>{booking.employer_name}</div>
                      <span className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </div>

                    {/* Card Body: two-column grid of details */}
                    <div className={styles.cardGrid}>

                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Email</span>
                        <a href={`mailto:${booking.employer_email}`} className={styles.emailLink}>
                          {booking.employer_email}
                        </a>
                      </div>

                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Phone</span>
                        <span className={styles.cardValue}>{booking.phone || '—'}</span>
                      </div>

                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Company</span>
                        <span className={styles.cardValue}>{booking.company_name || '—'}</span>
                        {booking.website_url && (
                          <a
                            href={booking.website_url.startsWith('http') ? booking.website_url : `https://${booking.website_url}`}
                            className={styles.websiteLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {booking.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>

                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Date & Time</span>
                        <span className={styles.cardValue}>{formatDate(booking.date)}</span>
                        <span className={styles.timeText}>{booking.time_slot} EST</span>
                      </div>

                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Meeting</span>
                        {booking.meeting_url ? (
                          <a
                            href={booking.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.zoomLink}
                          >
                            Join Zoom →
                          </a>
                        ) : (
                          <span className={styles.zoomPending}>Pending</span>
                        )}
                      </div>

                    </div>

                    {/* Card Footer: action buttons */}
                    <div className={styles.cardFooter}>
                      <ActionButtons booking={booking} />
                    </div>

                    {/* Intelligence Brief — expands below card footer on mobile */}
                    {expandedBriefId === booking.id && booking.employer_profile_id && (
                      <IntelligenceBrief
                        profileId={booking.employer_profile_id}
                        onClose={() => setExpandedBriefId(null)}
                      />
                    )}

                  </div>
                ))}
              </div>
            </>
          )}
        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;