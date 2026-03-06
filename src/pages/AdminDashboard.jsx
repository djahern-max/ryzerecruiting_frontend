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

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM',
];

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
// Send Meeting Invite Modal
// ---------------------------------------------------------------------------

function SendInviteModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    invite_type: 'outbound_employer',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    website_url: '',
    date: '',
    time_slot: '9:00 AM',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    setError(null);
    if (!form.contact_name || !form.contact_email || !form.date) {
      setError('Name, email, and date are required.');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bookings/recruiter-invite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_type: form.invite_type,
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone || null,
          company_name: form.company_name || null,
          website_url: form.website_url || null,
          date: form.date,
          time_slot: form.time_slot,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to send invite');
      }
      const booking = await res.json();
      onSuccess(booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Send Meeting Invite</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <img src={letterXIcon} alt="Close" className={styles.modalCloseIcon} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>

          {/* Invite type toggle */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Invite Type</label>
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${form.invite_type === 'outbound_employer' ? styles.toggleBtnActive : ''}`}
                onClick={() => setForm(p => ({ ...p, invite_type: 'outbound_employer' }))}
              >
                <i className="fi fi-rr-building" style={{ marginRight: '6px' }}></i>Employer
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${form.invite_type === 'outbound_candidate' ? styles.toggleBtnActive : ''}`}
                onClick={() => setForm(p => ({ ...p, invite_type: 'outbound_candidate' }))}
              >
                <i className="fi fi-rr-user" style={{ marginRight: '6px' }}></i>Candidate
              </button>
            </div>
          </div>

          {/* Name + Email */}
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Full Name <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.fieldInput}
                type="text"
                name="contact_name"
                value={form.contact_name}
                onChange={handleChange}
                placeholder="Bob Henderson"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.fieldInput}
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                placeholder="bob@company.com"
              />
            </div>
          </div>

          {/* Phone — always visible */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Phone</label>
            <input className={styles.fieldInput} type="tel" name="contact_phone"
              value={form.contact_phone} onChange={handleChange} placeholder="(555) 000-0000" />
          </div>

          {/* Company + Website — employer only */}
          {form.invite_type === 'outbound_employer' && (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Company</label>
                <input className={styles.fieldInput} type="text" name="company_name"
                  value={form.company_name} onChange={handleChange} placeholder="Analytics Hub" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Website <span className={styles.fieldHint}>(used for AI brief)</span>
                </label>
                <input className={styles.fieldInput} type="text" name="website_url"
                  value={form.website_url} onChange={handleChange} placeholder="https://analytics-hub.com" />
              </div>
            </>
          )}

          {/* Date + Time */}
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Date <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.fieldInput}
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Time (EST)</label>
              <select
                className={styles.fieldInput}
                name="time_slot"
                value={form.time_slot}
                onChange={handleChange}
              >
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot} EST</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Notes</label>
            <textarea
              className={styles.fieldTextarea}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Optional context — how you found them, role they're hiring for, etc."
              rows={3}
            />
          </div>

          {error && <div className={styles.modalError}>{error}</div>}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.modalCancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className={`${styles.modalSubmitBtn} ${submitting ? styles.modalSubmitBtnLoading : ''}`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <><i className="fi fi-rr-time" style={{ marginRight: '6px' }}></i>Sending…</>
              : <><i className="fi fi-rr-paper-plane" style={{ marginRight: '6px' }}></i>Send Invite</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

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
  const [showInviteModal, setShowInviteModal] = useState(false);
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

  async function cancelBooking(bookingId, employerName) {
    const confirmed = window.confirm(
      `Cancel this meeting with ${employerName}?\n\nThis cannot be undone. The booking will be marked as cancelled.`
    );
    if (!confirmed) return;
    await updateStatus(bookingId, 'cancelled');
  }

  async function deleteBooking(bookingId) {
    if (!window.confirm('Are you sure you want to permanently delete this booking?')) return;
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

  function handleInviteSuccess(newBooking) {
    setBookings(prev => [...prev, newBooking]);
    setShowInviteModal(false);
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

  function ActionButtons({ booking }) {
    const busy = updatingId === booking.id;
    const isConfirming = busy && booking.status === 'pending';

    return (
      <div className={styles.actions}>
        {booking.status === 'confirmed' && booking.employer_profile_id && (
          <button
            className={`${styles.iconBtn} ${styles.iconBtnAi} ${expandedBriefId === booking.id ? styles.iconBtnActive : ''}`}
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

        {booking.status !== 'cancelled' && (
          <button
            className={`${styles.iconBtn} ${styles.iconBtnCancel}`}
            disabled={busy}
            onClick={() => cancelBooking(booking.id, booking.employer_name)}
            title={`Cancel meeting with ${booking.employer_name}`}
            aria-label={`Cancel meeting with ${booking.employer_name}`}
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

  function BookingTypeBadge({ type }) {
    if (type === 'outbound_employer') {
      return <span className={styles.typeBadgeOutbound}>Outbound · Employer</span>;
    }
    if (type === 'outbound_candidate') {
      return <span className={styles.typeBadgeOutbound}>Outbound · Candidate</span>;
    }
    return <span className={styles.typeBadgeInbound}>Inbound</span>;
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

        {/* ── Recruiter Tools Grid ────────────────────────── */}
        <section className={styles.section}>
          <p className={styles.pageGreeting}>Welcome back, {firstName}.</p>
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
            <div className={styles.sectionHeaderRight}>
              <button
                className={styles.scheduleBtn}
                onClick={() => setShowInviteModal(true)}
              >
                <i className="fi fi-rr-paper-plane" style={{ marginRight: '7px' }}></i>
                Send Meeting Invite
              </button>
              <div className={styles.liveBadge}>
                <i className="fi fi-rr-circle" style={{ fontSize: '8px' }}></i> Live
              </div>
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
                      <th>Type</th>
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
                            <BookingTypeBadge type={booking.booking_type} />
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
                            <td colSpan={9} className={styles.briefCell}>
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
                        <span className={styles.cardLabel}>Type</span>
                        <BookingTypeBadge type={booking.booking_type} />
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

      {/* ── Send Invite Modal ────────────────────────────── */}
      {showInviteModal && (
        <SendInviteModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

    </div>
  );
}

export default AdminDashboard;