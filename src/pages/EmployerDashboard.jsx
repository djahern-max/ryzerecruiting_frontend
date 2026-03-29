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

function JobCard({ job }) {
  const salary = formatSalary(job.salary_min, job.salary_max);
  return (
    <div className={styles.jobCard}>
      <div className={styles.jobCardMain}>
        <div className={styles.jobTitle}>{job.title}</div>
        <div className={styles.jobMeta}>
          {job.location && <span>{job.location}</span>}
          {job.location && salary && <span className={styles.jobDot}>·</span>}
          {salary && <span>{salary}</span>}
        </div>
        {job.requirements && (
          <p className={styles.jobReq}>{job.requirements.slice(0, 120)}{job.requirements.length > 120 ? '…' : ''}</p>
        )}
      </div>
      <div className={styles.jobCardRight}>
        <span className={styles.jobOpenBadge}>Open</span>
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [openRoles, setOpenRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const headers = { Authorization: `Bearer ${token}` };

      // Bookings
      fetch(`${API_BASE}/api/bookings/my`, { headers })
        .then(r => r.ok ? r.json() : [])
        .then(data => setMyBookings(data))
        .catch(() => {})
        .finally(() => setBookingsLoading(false));

      // Employer profile (linked by email)
      fetch(`${API_BASE}/api/employer-profiles/me`, { headers })
        .then(r => r.ok ? r.json() : null)
        .then(data => setProfile(data))
        .catch(() => setProfile(null))
        .finally(() => setProfileLoading(false));

      // Open job orders (public — no auth needed)
      fetch(`${API_BASE}/api/job-orders/open`)
        .then(r => r.ok ? r.json() : [])
        .then(data => setOpenRoles(data))
        .catch(() => {})
        .finally(() => setRolesLoading(false));
    }
    fetchAll();
  }, [token]);

  // Job orders linked to this employer's profile
  const myRoles = profile
    ? openRoles.filter(j => j.employer_profile_id === profile.id)
    : [];

  // All other open roles (other companies)
  const otherRoles = profile
    ? openRoles.filter(j => j.employer_profile_id !== profile.id)
    : openRoles;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>

        {/* ── Welcome Banner ── */}
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <span className={styles.bannerBadge}>Employer</span>
            <h1 className={styles.bannerTitle}>
              Welcome back, {firstName}.
              {profile && <span className={styles.companyName}> · {profile.company_name}</span>}
            </h1>
            <p className={styles.bannerSub}>
              Your hiring dashboard — powered by RYZE.ai.
            </p>
          </div>
          <div className={styles.bannerRight}>
            <ScheduleCallButton variant="primary" size="md" label="Schedule a Call" />
          </div>
        </div>

        {/* ── Company Intelligence Brief ── */}
        {!profileLoading && profile && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Your Company Brief</h3>
              <p className={styles.sectionSub}>RYZE intelligence on {profile.company_name}</p>
            </div>
            <div className={styles.briefCard}>
              <div className={styles.briefHeader}>
                <div className={styles.briefLogo}>{profile.company_name.charAt(0)}</div>
                <div className={styles.briefCompanyInfo}>
                  <div className={styles.briefCompany}>{profile.company_name}</div>
                  <div className={styles.briefMeta}>
                    {profile.ai_industry && <span>{profile.ai_industry}</span>}
                    {profile.ai_industry && profile.ai_company_size && <span className={styles.metaDot}>·</span>}
                    {profile.ai_company_size && <span>{profile.ai_company_size}</span>}
                  </div>
                </div>
                {profile.relationship_status && (
                  <span className={`${styles.relBadge} ${styles[`rel_${profile.relationship_status.toLowerCase()}`]}`}>
                    {profile.relationship_status}
                  </span>
                )}
              </div>

              {profile.ai_company_overview && (
                <p className={styles.briefOverview}>{profile.ai_company_overview}</p>
              )}

              {profile.ai_hiring_needs?.length > 0 && (
                <div className={styles.briefSection}>
                  <div className={styles.briefLabel}>Current Hiring Needs</div>
                  <ul className={styles.needsList}>
                    {profile.ai_hiring_needs.map((need, i) => (
                      <li key={i}>{need}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── My Open Roles ── */}
        {!rolesLoading && myRoles.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Your Open Roles</h3>
              <p className={styles.sectionSub}>{myRoles.length} active position{myRoles.length !== 1 ? 's' : ''} with RYZE</p>
            </div>
            <div className={styles.jobList}>
              {myRoles.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          </section>
        )}

        {/* ── Scheduled Calls ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>My Scheduled Calls</h3>
            <p className={styles.sectionSub}>Your discovery calls with RYZE.ai</p>
          </div>

          {bookingsLoading ? (
            <div className={styles.callsEmpty}>
              Loading your calls…
            </div>
          ) : myBookings.length === 0 ? (
            <div className={styles.callsEmpty}>
              <div className={styles.callsEmptyInner}>
                <i className={`fi fi-rr-calendar ${styles.callsEmptyIcon}`} />
                <p className={styles.callsEmptyText}>No calls scheduled yet.</p>
                <ScheduleCallButton variant="primary" size="sm" label="Book Your First Call" />
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
                      <div className={styles.callPendingNote}>
                        Your call request has been received — we'll confirm shortly.
                      </div>
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

        {/* ── Coming Soon ── */}
        <div className={styles.comingSoon}>
          <span className={styles.comingSoonLabel}>Coming soon</span>
          <div className={styles.comingSoonItems}>
            {COMING_SOON.map(item => (
              <div key={item.label} className={styles.comingSoonItem}>
                <i className={item.icon} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
