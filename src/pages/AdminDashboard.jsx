/* src/pages/AdminDashboard.jsx */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminDashboard.module.css';
import { useNavigate } from 'react-router-dom';

// ── Tier 2 SVG assets (brand / illustrated) ──────────────
import aiIcon from '../assets/icons/artificial-intelligence.svg';
import zoomIcon from '../assets/icons/zoom.svg';
import letterXIcon from '../assets/icons/letter-x.svg';
import comingSoonIcon from '../assets/icons/coming-soon.svg';

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
    icon: 'fi fi-rr-document',
    title: 'Job Orders',
    description: "Manage every active role you're recruiting for. Track status from intake all the way through to placement.",
    cta: 'View Job Orders',
    ready: false,
  },
  {
    id: 'employer-roster',
    icon: 'fi fi-rr-building',
    title: 'Employer Roster',
    description: 'Your full client list — company details, active roles, call history, and relationship notes.',
    cta: 'View Employers',
    ready: true,
  },
  {
    id: 'candidate-roster',
    icon: 'fi fi-rr-users',
    title: 'Candidate Roster',
    description: "Every candidate in your database with availability status, credentials, and which roles they're being considered for.",
    cta: 'View Candidates',
    ready: false,
  },
  {
    id: 'match-queue',
    icon: 'fi fi-rr-target',
    title: 'Match Queue',
    description: 'Suggested candidate-to-job matches based on role criteria, experience level, and location. Your matchmaking command center.',
    cta: 'View Matches',
    ready: false,
  },
  {
    id: 'activity-feed',
    icon: 'fi fi-rr-bolt',
    title: 'Activity Feed',
    description: 'A chronological log of everything happening across your pipeline — new bookings, submissions, employer responses, and status changes.',
    cta: 'View Activity',
    ready: false,
  },
  {
    id: 'analytics',
    icon: 'fi fi-rr-chart-histogram',
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
        <div className={styles.briefLoading}>
          <i className="fi fi-rr-time" style={{ animation: 'spin 1s linear infinite', marginRight: '6px' }}></i>
          Generating intelligence brief…
        </div>
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

  const hasStructuredData =
    profile.ai_company_overview ||
    profile.ai_industry ||
    profile.ai_company_size ||
    profile.ai_hiring_needs?.length ||
    profile.ai_talking_points?.length ||
    profile.ai_red_flags;

  return (
    <div className={styles.briefPanel}>
      <div className={styles.briefHeader}>
        <img src={aiIcon} alt="" className={styles.briefAiIcon} />
        <span className={styles.briefTitle}>Pre-Call Intelligence Brief</span>
        {profile.ai_brief_updated_at && (
          <span className={styles.briefUpdated}>
            Updated {new Date(profile.ai_brief_updated_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        )}
        {/* ✅ letter-x.svg — bare icon button, no wrapper styling */}
        <button className={styles.briefClose} onClick={onClose} aria-label="Close brief">
          <img src={letterXIcon} alt="Close" className={styles.briefCloseIcon} />
        </button>
      </div>

      {!hasStructuredData && !profile.ai_brief_raw ? (
        <p className={styles.briefEmpty}>
          No intelligence brief available — website may not have been provided or the brief generation failed.
        </p>
      ) : (
        <div className={styles.briefBody}>
          {profile.ai_brief_raw && !hasStructuredData && (() => {
            try {
              const cleaned = profile.ai_brief_raw
                .replace(/^```json\s*/m, '').replace(/^```\s*/m, '').replace(/\s*```$/m, '').trim();
              const parsed = JSON.parse(cleaned);
              return (
                <div className={styles.briefBody}>
                  {parsed.company_overview && (
                    <div className={styles.briefSection}>
                      <div className={styles.briefSectionLabel}>Company Overview</div>
                      <div className={styles.briefSectionContent}>{parsed.company_overview}</div>
                    </div>
                  )}
                  <div className={styles.briefRow}>
                    {parsed.industry && (
                      <div className={styles.briefSection}>
                        <div className={styles.briefSectionLabel}>Industry</div>
                        <div className={styles.briefSectionContent}>{parsed.industry}</div>
                      </div>
                    )}
                    {parsed.estimated_size && (
                      <div className={styles.briefSection}>
                        <div className={styles.briefSectionLabel}>Estimated Size</div>
                        <div className={styles.briefSectionContent}>{parsed.estimated_size}</div>
                      </div>
                    )}
                  </div>
                  {parsed.hiring_needs?.length > 0 && (
                    <div className={styles.briefSection}>
                      <div className={styles.briefSectionLabel}>Likely Hiring Needs</div>
                      <div className={styles.briefTags}>
                        {parsed.hiring_needs.map((need, i) => <span key={i} className={styles.briefTag}>{need}</span>)}
                      </div>
                    </div>
                  )}
                  {parsed.talking_points?.length > 0 && (
                    <div className={styles.briefSection}>
                      <div className={styles.briefSectionLabel}>Key Talking Points</div>
                      <ul className={styles.briefList}>
                        {parsed.talking_points.map((pt, i) => <li key={i}>{pt}</li>)}
                      </ul>
                    </div>
                  )}
                  {parsed.red_flags && (
                    <div className={styles.briefSection}>
                      <div className={styles.briefSectionLabel}>
                        <i className="fi fi-rr-triangle-warning" style={{ marginRight: '4px' }}></i>Red Flags
                      </div>
                      <div className={`${styles.briefSectionContent} ${styles.briefRedFlags}`}>{parsed.red_flags}</div>
                    </div>
                  )}
                </div>
              );
            } catch {
              return <pre className={styles.briefRaw}>{profile.ai_brief_raw}</pre>;
            }
          })()}

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
                {profile.ai_hiring_needs.map((need, i) => <span key={i} className={styles.briefTag}>{need}</span>)}
              </div>
            </div>
          )}
          {profile.ai_talking_points?.length > 0 && (
            <div className={styles.briefSection}>
              <div className={styles.briefSectionLabel}>Key Talking Points</div>
              <ul className={styles.briefList}>
                {profile.ai_talking_points.map((pt, i) => <li key={i}>{pt}</li>)}
              </ul>
            </div>
          )}
          {profile.ai_red_flags && (
            <div className={styles.briefSection}>
              <div className={styles.briefSectionLabel}>
                <i className="fi fi-rr-triangle-warning" style={{ marginRight: '4px' }}></i>Red Flags / Considerations
              </div>
              <div className={`${styles.briefSectionContent} ${styles.briefRedFlags}`}>{profile.ai_red_flags}</div>
            </div>
          )}
          {profile.recruiter_notes && (
            <div className={styles.briefSection}>
              <div className={styles.briefSectionLabel}>
                <i className="fi fi-rr-pencil" style={{ marginRight: '4px' }}></i>Recruiter Notes
              </div>
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
  const [expandedBriefId, setExpandedBriefId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchBookings(); }, []);

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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setBookings(prev => prev.map(b => (b.id === bookingId ? updated : b)));
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
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // ── Action Buttons ────────────────────────────────────
  function ActionButtons({ booking }) {
    const busy = updatingId === booking.id;
    const isConfirming = busy && booking.status === 'pending';

    return (
      <div className={styles.actions}>

        {/* ✅ AI icon — bare SVG button, centered, no border/background */}
        {booking.status === 'confirmed' && booking.employer_profile_id && (
          <button
            className={`${styles.iconBtn} ${expandedBriefId === booking.id ? styles.iconBtnActive : ''}`}
            onClick={() => toggleBrief(booking.id)}
            title="View AI intelligence brief"
            aria-label="View AI intelligence brief"
          >
            <img src={aiIcon} alt="" className={styles.actionIcon} />
          </button>
        )}

        {booking.status !== 'confirmed' && (
          <button
            className={`${styles.confirmBtn} ${isConfirming ? styles.confirmBtnLoading : ''}`}
            disabled={busy}
            onClick={() => updateStatus(booking.id, 'confirmed')}
          >
            {isConfirming
              ? <><i className="fi fi-rr-time" style={{ marginRight: '4px' }}></i>Researching…</>
              : <><i className="fi fi-rr-check" style={{ marginRight: '4px' }}></i>Confirm</>
            }
          </button>
        )}

        {/* ✅ Cancel — bare X SVG button, no grey pill wrapper */}
        {booking.status !== 'cancelled' && (
          <button
            className={styles.iconBtn}
            disabled={busy}
            onClick={() => updateStatus(booking.id, 'cancelled')}
            title="Cancel booking"
            aria-label="Cancel booking"
          >
            <img src={letterXIcon} alt="" className={styles.actionIcon} />
          </button>
        )}

        {booking.status === 'cancelled' && (
          <button
            className={styles.deleteBtn}
            onClick={() => deleteBooking(booking.id)}
          >
            <i className="fi fi-rr-trash" style={{ marginRight: '4px' }}></i>Delete
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
              <i className="fi fi-rr-exit" style={{ marginRight: '6px' }}></i>Logout
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
              <span className={`${styles.welcomeStatNumber} ${styles.pendingColor}`}>{pending.length}</span>
              <span className={styles.welcomeStatLabel}>Pending</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={`${styles.welcomeStatNumber} ${styles.confirmedColor}`}>{confirmed.length}</span>
              <span className={styles.welcomeStatLabel}>Confirmed</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={`${styles.welcomeStatNumber} ${styles.cancelledColor}`}>{cancelled.length}</span>
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
                  <i className={`${card.icon} ${styles.featureIcon}`}></i>
                  {!card.ready && (
                    <img src={comingSoonIcon} alt="Coming Soon" className={styles.comingSoonBadge} />
                  )}
                </div>
                <h4 className={styles.featureTitle}>{card.title}</h4>
                <p className={styles.featureDesc}>{card.description}</p>
                <button
                  className={styles.featureBtn}
                  disabled={!card.ready}
                  onClick={() => { if (card.id === 'employer-roster') navigate('/admin/employers'); }}
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
            <div className={styles.liveBadge}>
              <i className="fi fi-rr-circle" style={{ fontSize: '8px' }}></i> Live
            </div>
          </div>

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
            <div className={styles.emptyState}>
              <i className="fi fi-rr-time" style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }}></i>
              Loading bookings…
            </div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : bookings.length === 0 ? (
            <div className={styles.emptyState}>No bookings yet.</div>
          ) : (
            <>
              {/* ── Desktop Table ── */}
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Company</th>
                      <th>Date &amp; Time</th>
                      <th>Phone</th>
                      <th>Meeting</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <>
                        <tr
                          key={booking.id}
                          className={`${styles.row} ${expandedBriefId === booking.id ? styles.rowExpanded : ''}`}
                        >
                          <td className={styles.nameCell}>{booking.employer_name}</td>
                          <td>
                            <a href={`mailto:${booking.employer_email}`} className={styles.emailLink}>
                              {booking.employer_email}
                            </a>
                          </td>
                          <td>
                            {booking.company_name && <div className={styles.companyName}>{booking.company_name}</div>}
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
                          <td className={styles.phone}>{booking.phone || '—'}</td>
                          <td>
                            {booking.meeting_url ? (
                              <a
                                href={booking.meeting_url}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.zoomIconLink}
                                title="Join Zoom Meeting"
                                aria-label="Join Zoom Meeting"
                              >
                                <img src={zoomIcon} alt="" className={styles.zoomIconImg} />
                              </a>
                            ) : (
                              <span className={styles.zoomPending}>—</span>
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

                        {expandedBriefId === booking.id && booking.employer_profile_id && (
                          <tr key={`brief-${booking.id}`} className={styles.briefTableRow}>
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

              {/* ── Mobile Cards ── */}
              <div className={styles.cardList}>
                {bookings.map((booking) => (
                  <div key={booking.id} className={styles.bookingCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardName}>{booking.employer_name}</div>
                      <span className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </div>
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
                        <span className={styles.cardLabel}>Date &amp; Time</span>
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
                            className={styles.zoomLinkMobile}
                            aria-label="Join Zoom Meeting"
                          >
                            <img src={zoomIcon} alt="" className={styles.zoomIconImgMobile} />
                            <span>Join Zoom</span>
                          </a>
                        ) : (
                          <span className={styles.zoomPending}>Pending</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <ActionButtons booking={booking} />
                    </div>
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