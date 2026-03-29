/* src/pages/CandidateDashboard.jsx */
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import BookingModal from '../components/BookingModal';
import styles from './CandidateDashboard.module.css';
import checkIcon from '../assets/icons/check.svg';
import zoomIcon from '../assets/icons/zoom.svg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const COMING_SOON = [
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

function formatSalary(min, max) {
  if (min && max) return `$${Math.round(min / 1000)}K – $${Math.round(max / 1000)}K`;
  if (min) return `From $${Math.round(min / 1000)}K`;
  return null;
}

function JobOpportunityCard({ job, onSchedule }) {
  const salary = formatSalary(job.salary_min, job.salary_max);
  return (
    <div className={styles.opportunityCard}>
      <div className={styles.oppCardTop}>
        <div className={styles.oppCardMain}>
          <div className={styles.oppTitle}>{job.title}</div>
          <div className={styles.oppMeta}>
            {job.location && <span><i className="fi fi-rr-marker" /> {job.location}</span>}
            {job.location && salary && <span className={styles.oppDot}>·</span>}
            {salary && <span><i className="fi fi-rr-dollar" /> {salary}</span>}
          </div>
          {job.requirements && (
            <p className={styles.oppReq}>
              {job.requirements.slice(0, 140)}{job.requirements.length > 140 ? '…' : ''}
            </p>
          )}
        </div>
        <span className={styles.oppBadge}>Open</span>
      </div>
      <div className={styles.oppCardFooter}>
        <button className={styles.applyBtn} onClick={onSchedule}>
          Schedule an Intro Call →
        </button>
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const [bookingOpen, setBookingOpen] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [openRoles, setOpenRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    // My bookings
    fetch(`${API_BASE}/api/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMyBookings(data))
      .catch(() => { })
      .finally(() => setBookingsLoading(false));

    // Open job orders — public endpoint, no auth needed
    fetch(`${API_BASE}/api/job-orders/open`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setOpenRoles(data))
      .catch(() => { })
      .finally(() => setRolesLoading(false));
  }, [token]);

  const hasBookings = myBookings.length > 0;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>

        {/* ── Welcome Banner ── */}
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <span className={styles.bannerBadge}>Candidate</span>
            <h1 className={styles.bannerTitle}>Welcome back, {firstName}.</h1>
            <p className={styles.bannerSub}>
              Your RYZE career dashboard — accounting &amp; finance roles matched to you.
            </p>
          </div>
          <div className={styles.bannerRight}>
            <button className={styles.scheduleBtn} onClick={() => setBookingOpen(true)}>
              <i className="fi fi-rr-calendar" />
              Schedule a Call
            </button>
          </div>
        </div>

        {/* ── My Scheduled Calls ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>My Scheduled Calls</h3>
            <p className={styles.sectionSub}>Your intro calls with RYZE.ai</p>
          </div>

          {bookingsLoading ? (
            <div className={styles.callsEmpty}>Loading your calls…</div>
          ) : !hasBookings ? (
            <div className={styles.callsEmpty}>
              <div className={styles.callsEmptyInner}>
                <i className={`fi fi-rr-calendar ${styles.callsEmptyIcon}`} />
                <p className={styles.callsEmptyText}>No calls scheduled yet.</p>
                <button className={styles.scheduleBtnSm} onClick={() => setBookingOpen(true)}>
                  Book Your First Call
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.callsList}>
              {myBookings.map(booking => (
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
                          <i className="fi fi-rr-clock" style={{ fontSize: '13px' }} />
                          Awaiting Confirmation
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className={styles.statusCancelled}>
                          <i className="fi fi-rr-ban" style={{ fontSize: '13px' }} />
                          Cancelled
                        </span>
                      )}
                    </div>
                    <div className={styles.callDate}>{formatDate(booking.date)}</div>
                    <div className={styles.callTime}>{booking.time_slot} EST</div>
                    {booking.status === 'pending' && (
                      <p className={styles.callNote}>
                        Your request has been received — we'll confirm shortly.
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
                      <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer" className={styles.zoomButton}>
                        <img src={zoomIcon} alt="" className={styles.zoomIcon} />
                        <span>Join Zoom</span>
                      </a>
                    </div>
                  )}
                  {booking.status === 'pending' && (
                    <div className={styles.callCardRight}>
                      <div className={styles.pendingPill}>
                        <i className="fi fi-rr-hourglass" style={{ fontSize: '13px' }} />
                        Pending
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>


        {/* ── Open Opportunities ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Open Opportunities</h3>
            <p className={styles.sectionSub}>
              {rolesLoading
                ? 'Loading roles…'
                : openRoles.length > 0
                  ? `${openRoles.length} active role${openRoles.length !== 1 ? 's' : ''} in accounting & finance`
                  : 'New roles added regularly — check back soon'}
            </p>
          </div>

          {rolesLoading ? (
            <div className={styles.rolesLoading}>Loading opportunities…</div>
          ) : openRoles.length === 0 ? (
            <div className={styles.rolesEmpty}>
              <i className={`fi fi-rr-briefcase ${styles.rolesEmptyIcon}`} />
              <p>No open roles right now — check back soon.</p>
              <button className={styles.scheduleBtnSm} onClick={() => setBookingOpen(true)}>
                Talk to a Recruiter
              </button>
            </div>
          ) : (
            <div className={styles.opportunityList}>
              {openRoles.map(job => (
                <JobOpportunityCard
                  key={job.id}
                  job={job}
                  onSchedule={() => setBookingOpen(true)}
                />
              ))}
            </div>
          )}
        </section>




      </main>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        variant="candidate"
      />
    </div>
  );
}
