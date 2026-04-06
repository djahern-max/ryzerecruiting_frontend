/* src/pages/AdminDashboard.jsx */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

import IntelligenceBrief from '../components/IntelligenceBrief';
import MeetingSummaryPanel from '../components/MeetingSummaryPanel';

import aiIcon from '../assets/icons/artificial-intelligence.svg';
import aiNotesIcon from '../assets/icons/ai_notes.svg';
import zoomIcon from '../assets/icons/zoom.svg';
import letterXIcon from '../assets/icons/letter-x.svg';
import AdminHeader from '../components/AdminHeader';
import { apiFetch } from '../services/api';
import profileIcon from '../assets/icons/profile.svg';
import candidateBookingsIcon from '../assets/icons/candidate_bookings.svg';
import employerBookingsIcon from '../assets/icons/employer_bookings.svg';
import calendarIcon from '../assets/icons/calendar.svg';
import pendingIcon from '../assets/icons/pending.svg';
import confirmedIcon from '../assets/icons/confirmed.svg';
import cancelledIcon from '../assets/icons/cancelled.svg';
import sendInviteIcon from '../assets/icons/send_invite.svg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

function getAvailableSlots(selectedDate) {
  if (!selectedDate) return TIME_SLOTS;
  const now = new Date();
  const selected = new Date(selectedDate + 'T00:00:00');
  const isToday = selected.toDateString() === now.toDateString();
  if (!isToday) return TIME_SLOTS;

  return TIME_SLOTS.filter((slot) => {
    const [time, period] = slot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime > now;
  });
}

function formatPhone(phone) {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

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
    time_slot: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'date') {
        const available = getAvailableSlots(value);
        if (prev.time_slot && !available.includes(prev.time_slot)) {
          updated.time_slot = '';
        }
      }
      return updated;
    });
  }

  async function handleSubmit() {
    setError(null);
    if (!form.contact_name || !form.contact_email || !form.date || !form.time_slot) {
      setError('Name, email, date, and time are required.');
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
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Send Meeting Invite</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <img src={letterXIcon} alt="Close" className={styles.modalCloseIcon} />
          </button>
        </div>

        <div className={styles.modalBody}>
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

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Full Name <span className={styles.required}>*</span></label>
              <input className={styles.fieldInput} type="text" name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Email <span className={styles.required}>*</span></label>
              <input className={styles.fieldInput} type="email" name="contact_email" value={form.contact_email} onChange={handleChange} placeholder="Email address" />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Phone</label>
            <input className={styles.fieldInput} type="tel" name="contact_phone" value={form.contact_phone} onChange={handleChange} placeholder="(555) 000-0000" />
          </div>

          {form.invite_type === 'outbound_employer' && (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Company</label>
                <input className={styles.fieldInput} type="text" name="company_name" value={form.company_name} onChange={handleChange} placeholder="Company name" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Website <span className={styles.fieldHint}>(used for AI brief)</span>
                </label>
                <input className={styles.fieldInput} type="text" name="website_url" value={form.website_url} onChange={handleChange} placeholder="https://company.com" />
              </div>
            </>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Date <span className={styles.required}>*</span></label>
            <input className={styles.fieldInput} type="date" name="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Time (EST) <span className={styles.required}>*</span></label>
            {form.date && getAvailableSlots(form.date).length === 0 ? (
              <p className={styles.noSlots}>No remaining slots for today — please select a future date.</p>
            ) : (
              <div className={styles.timeGrid}>
                {getAvailableSlots(form.date).map(slot => (
                  <button
                    key={slot}
                    type="button"
                    className={`${styles.timeSlotBtn} ${form.time_slot === slot ? styles.timeSlotBtnActive : ''}`}
                    onClick={() => setForm(p => ({ ...p, time_slot: slot }))}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

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

        <div className={styles.modalFooter}>
          <button className={styles.modalCancelBtn} onClick={onClose} disabled={submitting}>Cancel</button>
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
// Booking Type Badge
// ---------------------------------------------------------------------------
function BookingTypeBadge({ type }) {
  if (type === 'outbound_employer') return <span className={styles.badgeOutboundEmployer}>Employer · Out</span>;
  if (type === 'outbound_candidate') return <span className={styles.badgeOutboundCandidate}>Candidate · Out</span>;
  if (type === 'inbound_candidate') return <span className={styles.badgeOutboundCandidate}>Candidate · In</span>;
  return <span className={styles.badgeInbound}>Inbound</span>;
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

function AdminDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedBriefId, setExpandedBriefId] = useState(null);
  const [expandedSummaryId, setExpandedSummaryId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [candidatesOpen, setCandidatesOpen] = useState(true);
  const [employersOpen, setEmployersOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`${API_BASE}/api/bookings`, {
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
      const res = await apiFetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
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

  async function cancelBooking(bookingId, name) {
    if (!window.confirm(`Cancel this meeting with ${name}?\n\nThis cannot be undone.`)) return;
    await updateStatus(bookingId, 'cancelled');
  }

  async function deleteBooking(bookingId) {
    if (!window.confirm('Permanently delete this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`${API_BASE}/api/bookings/${bookingId}`, {
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

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');
  const candidateBookings = bookings.filter(
    b => b.booking_type === 'outbound_candidate' || b.booking_type === 'inbound_candidate'
  );
  const employerBookings = bookings.filter(
    b => b.booking_type === 'outbound_employer' || b.booking_type === 'inbound'
  );

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // ---------------------------------------------------------------------------
  // Action Buttons
  // ---------------------------------------------------------------------------
  function ActionButtons({ booking }) {
    const busy = updatingId === booking.id;
    const isConfirming = busy && booking.status === 'pending';
    const isCandidateBooking = booking.booking_type === 'outbound_candidate' || booking.booking_type === 'inbound_candidate';

    return (
      <div className={styles.actions}>
        {booking.status === 'confirmed' && booking.employer_profile_id && (
          <button
            className={`${styles.iconBtn} ${styles.iconBtnAi} ${expandedBriefId === booking.id ? styles.iconBtnActive : ''}`}
            onClick={() => setExpandedBriefId(prev => (prev === booking.id ? null : booking.id))}
            title="View AI intelligence brief"
          >
            <img src={aiIcon} alt="" className={styles.actionIcon} />
          </button>
        )}

        {booking.meeting_summary && (
          <button
            className={`${styles.iconBtn} ${styles.iconBtnSummary} ${expandedSummaryId === booking.id ? styles.iconBtnActive : ''}`}
            onClick={() => setExpandedSummaryId(prev => (prev === booking.id ? null : booking.id))}
            title="View meeting summary"
          >
            <img src={aiNotesIcon} alt="" className={styles.actionIcon} />
          </button>
        )}

        {isCandidateBooking && booking.candidate_id && (
          <button
            className={`${styles.iconBtn}`}
            onClick={() => navigate(`/admin/candidates/${booking.candidate_id}`)}
            title="View candidate profile"
          >
            <img src={profileIcon} alt="Profile" className={styles.profileIcon} />
          </button>
        )}

        {booking.status !== 'confirmed' && (
          <button
            className={`${styles.confirmBtn} ${isConfirming ? styles.confirmBtnLoading : ''}`}
            disabled={busy}
            onClick={() => updateStatus(booking.id, 'confirmed')}
          >
            {isConfirming
              ? <><i className="fi fi-rr-time" style={{ marginRight: '4px' }}></i>Confirming…</>
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
          >
            <img src={letterXIcon} alt="" className={styles.actionIcon} />
          </button>
        )}

        {booking.status === 'cancelled' && (
          <button className={styles.deleteBtn} onClick={() => deleteBooking(booking.id)}>
            <i className="fi fi-rr-trash" style={{ marginRight: '4px' }}></i>Delete
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <AdminHeader active="dashboard" />
      <main className={styles.main}>

        <div className={styles.pageTop}>
          <div>
            <h1 className={styles.pageTitle}>Booking Management</h1>
            <p className={styles.pageSub}>Welcome back, {firstName}. Here's your pipeline.</p>
          </div>
          <div className={styles.pageTopRight}>
            <button className={styles.inviteBtn} onClick={() => setShowInviteModal(true)} title="Send Invite">
              <img src={sendInviteIcon} alt="Send Invite" style={{ width: '32px', height: '32px' }} />
            </button>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <img src={calendarIcon} alt="" style={{ width: '22px', height: '22px' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{bookings.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconPending}`}>
              <img src={pendingIcon} alt="" style={{ width: '22px', height: '22px' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={`${styles.statNumber} ${styles.statPending}`}>{pending.length}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconConfirmed}`}>
              <img src={confirmedIcon} alt="" style={{ width: '22px', height: '22px' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={`${styles.statNumber} ${styles.statConfirmed}`}>{confirmed.length}</span>
              <span className={styles.statLabel}>Confirmed</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconCancelled}`}>
              <img src={cancelledIcon} alt="" style={{ width: '22px', height: '22px' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={`${styles.statNumber} ${styles.statCancelled}`}>{cancelled.length}</span>
              <span className={styles.statLabel}>Cancelled</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <i className="fi fi-rr-time" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}></i>
            Loading bookings…
          </div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : (
          <>
            {/* ── Candidate Bookings ── */}
            <div className={styles.sectionBlock}>
              <div
                className={styles.sectionHeading}
                onClick={() => setCandidatesOpen(p => !p)}
                style={{ cursor: 'pointer' }}
              >
                <img src={candidateBookingsIcon} alt="Candidate Bookings" style={{ width: '42px', height: '42px' }} />
                <span className={styles.sectionLabel} style={{ fontStyle: 'italic' }}>Candidates</span>
                <span className={styles.sectionCount}>{candidateBookings.length}</span>
                <i
                  className={`fi ${candidatesOpen ? 'fi-rr-angle-up' : 'fi-rr-angle-down'}`}
                  style={{ marginLeft: 'auto', fontSize: '13px', color: '#94a3b8' }}
                ></i>
              </div>

              {candidatesOpen && (
                <>
                  {candidateBookings.length === 0 ? (
                    <div className={styles.emptyState}>
                      <i className="fi fi-rr-calendar" style={{ marginRight: '10px', fontSize: '1.25rem' }}></i>
                      No candidate bookings yet.
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Date &amp; Time</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Meeting</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidateBookings.map((booking) => (
                              <>
                                <tr
                                  key={booking.id}
                                  className={`${styles.row} ${expandedBriefId === booking.id || expandedSummaryId === booking.id ? styles.rowExpanded : ''}`}
                                >
                                  <td className={styles.nameCell}>
                                    {booking.candidate_id ? (
                                      <span
                                        onClick={() => navigate(`/admin/candidates/${booking.candidate_id}`)}
                                        className={styles.candidateNameLink}
                                        title="View candidate profile"
                                      >
                                        {booking.employer_name}
                                      </span>
                                    ) : (
                                      booking.employer_name
                                    )}
                                  </td>
                                  <td>
                                    <div className={styles.dateText}>{formatDate(booking.date)}</div>
                                    <div className={styles.timeText}>{booking.time_slot} EST</div>
                                  </td>
                                  <td>
                                    <a href={`mailto:${booking.employer_email}`} className={styles.emailLink}>
                                      {booking.employer_email}
                                    </a>
                                  </td>
                                  <td className={styles.phone}>{formatPhone(booking.phone)}</td>
                                  <td>
                                    {booking.meeting_url ? (
                                      <a href={booking.meeting_url} target="_blank" rel="noreferrer" className={styles.zoomLink} title="Join Zoom Meeting">
                                        <img src={zoomIcon} alt="" className={styles.zoomIcon} />
                                      </a>
                                    ) : (
                                      <span className={styles.zoomPending}>—</span>
                                    )}
                                  </td>
                                  <td><BookingTypeBadge type={booking.booking_type} /></td>
                                  <td>
                                    <span className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}>
                                      {STATUS_LABELS[booking.status]}
                                    </span>
                                  </td>
                                  <td><ActionButtons booking={booking} /></td>
                                </tr>

                                {expandedBriefId === booking.id && booking.employer_profile_id && (
                                  <tr key={`brief-${booking.id}`} className={styles.expandedRow}>
                                    <td colSpan={8} className={styles.expandedCell}>
                                      <IntelligenceBrief
                                        profileId={booking.employer_profile_id}
                                        onClose={() => setExpandedBriefId(null)}
                                      />
                                    </td>
                                  </tr>
                                )}

                                {expandedSummaryId === booking.id && booking.meeting_summary && (
                                  <tr key={`summary-${booking.id}`} className={styles.expandedRow}>
                                    <td colSpan={8} className={styles.expandedCell}>
                                      <MeetingSummaryPanel
                                        booking={booking}
                                        onClose={() => setExpandedSummaryId(null)}
                                      />
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className={styles.cardList}>
                        {candidateBookings.map((booking) => (
                          <div key={booking.id} className={styles.bookingCard}>
                            <div className={styles.cardHeader}>
                              <div className={styles.cardName}>{booking.employer_name}</div>
                              <span className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}>
                                {STATUS_LABELS[booking.status]}
                              </span>
                            </div>
                            <div className={styles.cardBody}>
                              <div className={styles.cardField}>
                                <span className={styles.cardLabel}>Date &amp; Time</span>
                                <span className={styles.cardValue}>{formatDate(booking.date)}</span>
                                <span className={styles.timeText}>{booking.time_slot} EST</span>
                              </div>
                              <div className={styles.cardField}>
                                <span className={styles.cardLabel}>Email</span>
                                <a href={`mailto:${booking.employer_email}`} className={styles.emailLink}>{booking.employer_email}</a>
                              </div>
                              <div className={styles.cardField}>
                                <span className={styles.cardLabel}>Phone</span>
                                <span className={styles.cardValue}>{formatPhone(booking.phone)}</span>
                              </div>
                              <div className={styles.cardField}>
                                <span className={styles.cardLabel}>Type</span>
                                <BookingTypeBadge type={booking.booking_type} />
                              </div>
                              <div className={styles.cardField}>
                                <span className={styles.cardLabel}>Meeting</span>
                                {booking.meeting_url ? (
                                  <a href={booking.meeting_url} target="_blank" rel="noreferrer" className={styles.zoomLinkMobile}>
                                    <img src={zoomIcon} alt="" style={{ width: '18px', height: '18px' }} />
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
                            {expandedSummaryId === booking.id && booking.meeting_summary && (
                              <MeetingSummaryPanel
                                booking={booking}
                                onClose={() => setExpandedSummaryId(null)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* ── Employer Bookings ── */}
            <div className={styles.sectionBlock}>
              <div
                className={styles.sectionHeading}
                onClick={() => setEmployersOpen(p => !p)}
                style={{ cursor: 'pointer' }}
              >
                <img src={employerBookingsIcon} alt="Employer Bookings" style={{ width: '42px', height: '42px' }} />
                <span className={styles.sectionLabel} style={{ fontStyle: 'italic' }}>Employers</span>
                <span className={styles.sectionCount}>{employerBookings.length}</span>
                <i
                  className={`fi ${employersOpen ? 'fi-rr-angle-up' : 'fi-rr-angle-down'}`}
                  style={{ marginLeft: 'auto', fontSize: '13px', color: '#94a3b8' }}
                ></i>
              </div>

              {employersOpen && (
                <>
                  {employerBookings.length === 0 ? (
                    <div className={styles.emptyState}>
                      <i className="fi fi-rr-calendar" style={{ marginRight: '10px', fontSize: '1.25rem' }}></i>
                      No employer bookings yet.
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Company</th>
                              <th>Date &amp; Time</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Meeting</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employerBookings.map((booking) => (
                              <>
                                <tr
                                  key={booking.id}
                                  className={`${styles.row} ${expandedBriefId === booking.id || expandedSummaryId === booking.id ? styles.rowExpanded : ''}`}
                                >
                                  <td className={styles.nameCell}>{booking.employer_name}</td>
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
                                  <td>
                                    <a href={`mailto:${booking.employer_email}`} className={styles.emailLink}>
                                      {booking.employer_email}
                                    </a>
                                  </td>
                                  <td className={styles.phone}>{formatPhone(booking.phone)}</td>
                                  <td>
                                    {booking.meeting_url ? (
                                      <a href={booking.meeting_url} target="_blank" rel="noreferrer" className={styles.zoomLink} title="Join Zoom Meeting">
                                        <img src={zoomIcon} alt="" className={styles.zoomIcon} />
                                      </a>
                                    ) : (
                                      <span className={styles.zoomPending}>—</span>
                                    )}
                                  </td>
                                  <td><BookingTypeBadge type={booking.booking_type} /></td>
                                  <td>
                                    <span className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}>
                                      {STATUS_LABELS[booking.status]}
                                    </span>
                                  </td>
                                  <td><ActionButtons booking={booking} /></td>
                                </tr>

                                {expandedBriefId === booking.id && booking.employer_profile_id && (
                                  <tr key={`brief-${booking.id}`} className={styles.expandedRow}>
                                    <td colSpan={9} className={styles.expandedCell}>
                                      <IntelligenceBrief
                                        profileId={booking.employer_profile_id}
                                        onClose={() => setExpandedBriefId(null)}
                                      />
                                    </td>
                                  </tr>
                                )}

                                {expandedSummaryId === booking.id && booking.meeting_summary && (
                                  <tr key={`summary-${booking.id}`} className={styles.expandedRow}>
                                    <td colSpan={9} className={styles.expandedCell}>
                                      <MeetingSummaryPanel
                                        booking={booking}
                                        onClose={() => setExpandedSummaryId(null)}
                                      />
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className={styles.cardList}>
                        {employerBookings.map((booking) => (
                          <div key={booking.id} className={styles.bookingCard}>
                            <div className={styles.cardHeader}>
                              <div className={styles.cardName}>{booking.employer_name}</div>
                              <span className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}>
                                {STATUS_LABELS[booking.status]}
                              </span>
                            </div>
                            <div className={styles.cardBody}>
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
                                <span className={styles.cardLabel}>Email</span>
                                <a href={`mailto:${booking.employer_email}`} className={styles.emailLink}>{booking.employer_email}</a>
                              </div>
                              <div className={styles.cardField}>
                                <span className={styles.cardLabel}>Phone</span>
                                <span className={styles.cardValue}>{booking.phone || '—'}</span>
                              </div>
                              <div className={styles.cardField}>
                                <span className={styles.cardLabel}>Type</span>
                                <BookingTypeBadge type={booking.booking_type} />
                              </div>
                              <div className={styles.cardField}>
                                <span className={styles.cardLabel}>Meeting</span>
                                {booking.meeting_url ? (
                                  <a href={booking.meeting_url} target="_blank" rel="noreferrer" className={styles.zoomLinkMobile}>
                                    <img src={zoomIcon} alt="" style={{ width: '18px', height: '18px' }} />
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
                            {expandedSummaryId === booking.id && booking.meeting_summary && (
                              <MeetingSummaryPanel
                                booking={booking}
                                onClose={() => setExpandedSummaryId(null)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>

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