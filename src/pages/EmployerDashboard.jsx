// src/pages/EmployerDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ScheduleCallButton from '../components/ScheduleCallButton';
import zoomIcon from '../assets/icons/zoom.svg';
import styles from './EmployerDashboard.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const TRUNCATE = 200;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

// ---------------------------------------------------------------------------
// Match score helpers
// ---------------------------------------------------------------------------

function getScorePct(score) {
  return Math.round((score || 0) * 100);
}

function getScoreTier(score) {
  const pct = getScorePct(score);
  if (pct >= 80) return 'high';
  if (pct >= 60) return 'mid';
  return 'low';
}

// ---------------------------------------------------------------------------
// CandidateMatchRow — compact row shown inside a job card
// ---------------------------------------------------------------------------

function CandidateMatchRow({ candidate, rank }) {
  const pct = getScorePct(candidate.match_score);
  const tier = getScoreTier(candidate.match_score);

  const levelLabel = {
    junior: 'Junior',
    mid: 'Mid-Level',
    senior: 'Senior',
    executive: 'Executive',
  }[candidate.ai_career_level?.toLowerCase()] || candidate.ai_career_level;

  return (
    <div className={styles.candidateRow}>
      <div className={styles.candidateRank}>#{rank}</div>

      <div className={styles.candidateInfo}>
        <span className={styles.candidateName}>{candidate.display_name}</span>
        {candidate.current_title && (
          <span className={styles.candidateTitle}>{candidate.current_title}</span>
        )}
      </div>

      <div className={styles.candidateTags}>
        {levelLabel && (
          <span className={`${styles.levelTag} ${styles[`level_${candidate.ai_career_level?.toLowerCase()}`]}`}>
            {levelLabel}
          </span>
        )}
        {candidate.ai_certifications && (
          <span className={styles.certTag}>{candidate.ai_certifications}</span>
        )}
        {candidate.ai_years_experience && (
          <span className={styles.yearsTag}>{candidate.ai_years_experience} yrs</span>
        )}
      </div>

      <div className={`${styles.candidateScore} ${styles[`score_${tier}`]}`}>
        {pct}%
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// JobCard — job order with embedded AI candidate matches
// ---------------------------------------------------------------------------

function JobCard({ job, candidateMatches, matchesLoading, onSchedule }) {
  const [expanded, setExpanded] = useState(false);
  const [showCandidates, setShowCandidates] = useState(true);
  const isLong = job.requirements && job.requirements.length > TRUNCATE;
  const salary = formatSalary(job.salary_min, job.salary_max);
  const hasCandidates = candidateMatches && candidateMatches.length > 0;

  return (
    <div className={styles.jobCard}>

      {/* ── Job header ── */}
      <div className={styles.jobCardHeader}>
        <div className={styles.jobCardLeft}>
          <h3 className={styles.jobTitle}>{job.title}</h3>
          <div className={styles.jobMeta}>
            {job.location && (
              <span className={styles.jobMetaItem}>
                <i className="fi fi-rr-marker" /> {job.location}
              </span>
            )}
            {salary && (
              <span className={styles.jobMetaItem}>
                <i className="fi fi-rr-usd-circle" /> {salary}
              </span>
            )}
          </div>
        </div>
        <span className={styles.jobOpenBadge}>Open</span>
      </div>

      {/* ── Requirements ── */}
      {job.requirements && (
        <div className={styles.jobReqs}>
          <p className={styles.jobReqsText}>
            {expanded || !isLong
              ? job.requirements
              : `${job.requirements.slice(0, TRUNCATE)}…`}
          </p>
          {isLong && (
            <button className={styles.jobToggle} onClick={() => setExpanded(p => !p)}>
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>
      )}

      {/* ── AI Candidate Matches ── */}
      <div className={styles.candidateSection}>
        <div className={styles.candidateSectionHeader}>
          <div className={styles.candidateSectionLeft}>
            <span className={styles.candidateSectionTitle}>
              <i className="fi fi-rr-users" />
              Top Candidates in Pipeline
            </span>
            {hasCandidates && (
              <span className={styles.candidateSectionBadge}>
                AI Ranked
              </span>
            )}
          </div>
          {hasCandidates && (
            <button
              className={styles.candidateToggleBtn}
              onClick={() => setShowCandidates(p => !p)}
            >
              {showCandidates ? 'Hide ↑' : 'Show ↓'}
            </button>
          )}
        </div>

        {matchesLoading ? (
          <div className={styles.candidatesLoading}>
            <div className={styles.candidatesLoadingDots}>
              <span /><span /><span />
            </div>
            <span>Matching candidates…</span>
          </div>
        ) : !hasCandidates ? (
          <div className={styles.candidatesEmpty}>
            <i className="fi fi-rr-search" />
            <span>
              {candidateMatches === null
                ? 'Analyzing role requirements…'
                : 'No candidates indexed yet — check back soon.'}
            </span>
          </div>
        ) : showCandidates ? (
          <>
            <div className={styles.candidateList}>
              {candidateMatches.map((c, i) => (
                <CandidateMatchRow key={i} candidate={c} rank={i + 1} />
              ))}
            </div>
            <div className={styles.candidateCta}>
              <button className={styles.requestBtn} onClick={onSchedule}>
                Talk to RYZE about these candidates →
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmployerDashboard
// ---------------------------------------------------------------------------

export default function EmployerDashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const [bookingOpen, setBookingOpen] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [openRoles, setOpenRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // EP15: candidateMatches is a map: { [job_order_id]: candidates[] | null }
  // null = loading, [] = no matches, [...] = results
  const [candidateMatches, setCandidateMatches] = useState({});
  const [matchesLoading, setMatchesLoading] = useState({});

  useEffect(() => {
    async function fetchAll() {
      const headers = { Authorization: `Bearer ${token}` };

      // Bookings
      fetch(`${API_BASE}/api/bookings/my`, { headers, cache: 'no-store' })
        .then(r => r.ok ? r.json() : [])
        .then(data => setMyBookings(data))
        .catch(() => { })
        .finally(() => setBookingsLoading(false));

      // Employer profile (linked by email)
      fetch(`${API_BASE}/api/employer-profiles/me`, { headers, cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(data => setProfile(data))
        .catch(() => setProfile(null))
        .finally(() => setProfileLoading(false));

      // Open job orders (public)
      fetch(`${API_BASE}/api/job-orders/open`)
        .then(r => r.ok ? r.json() : [])
        .then(data => setOpenRoles(data))
        .catch(() => { })
        .finally(() => setRolesLoading(false));
    }
    fetchAll();
  }, [token]);

  // EP15: Fetch candidate matches for each employer-linked job once roles load
  useEffect(() => {
    if (rolesLoading || profileLoading || !profile) return;

    const myRoles = openRoles.filter(j => j.employer_profile_id === profile.id);
    if (myRoles.length === 0) return;

    const headers = { Authorization: `Bearer ${token}` };

    // Mark all as loading
    const initialLoading = {};
    myRoles.forEach(j => { initialLoading[j.id] = true; });
    setMatchesLoading(initialLoading);

    // Fetch candidate matches for all job orders in parallel
    Promise.all(
      myRoles.map(job =>
        fetch(`${API_BASE}/api/job-orders/${job.id}/candidate-matches?limit=5`, { headers, cache: 'no-store' })
          .then(r => r.ok ? r.json() : [])
          .catch(() => [])
          .then(matches => ({ jobId: job.id, matches }))
      )
    ).then(results => {
      const newMatches = {};
      const newLoading = {};
      results.forEach(({ jobId, matches }) => {
        newMatches[jobId] = matches;
        newLoading[jobId] = false;
      });
      setCandidateMatches(newMatches);
      setMatchesLoading(newLoading);
    });
  }, [rolesLoading, profileLoading, profile, openRoles, token]);

  // Split job orders: employer's roles vs other open roles
  const myRoles = profile
    ? openRoles.filter(j => j.employer_profile_id === profile.id)
    : [];

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
            <h1 className={styles.bannerTitle}>Welcome back, {firstName}.</h1>
            {profile && <p className={styles.companyLine}>{profile.company_name}</p>}
          </div>
          <div className={styles.bannerRight}>
            <ScheduleCallButton variant="primary" size="md" label="Schedule a Call" />
          </div>
        </div>

        {/* ── Your Open Roles (with AI candidate matches) ── */}
        {!rolesLoading && myRoles.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Your Open Roles</h3>
              <p className={styles.sectionSub}>
                {myRoles.length} active position{myRoles.length !== 1 ? 's' : ''} with RYZE —
                AI-matched candidates shown for each
              </p>
            </div>
            <div className={styles.jobList}>
              {myRoles.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  candidateMatches={candidateMatches[job.id] ?? null}
                  matchesLoading={matchesLoading[job.id] ?? false}
                  onSchedule={() => setBookingOpen(true)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── My Scheduled Calls ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>My Scheduled Calls</h3>
            <p className={styles.sectionSub}>Your discovery calls with RYZE.ai</p>
          </div>

          {bookingsLoading ? (
            <div className={styles.callsEmpty}>Loading your calls…</div>
          ) : myBookings.length === 0 ? (
            <div className={styles.callsEmpty}>
              No calls scheduled yet.{' '}
              <button className={styles.rebookLink} onClick={() => setBookingOpen(true)}>
                Schedule one now →
              </button>
            </div>
          ) : (
            <div className={styles.callList}>
              {myBookings.map(booking => (
                <div key={booking.id} className={styles.callCard}>
                  <div className={styles.callCardLeft}>
                    <span className={`${styles.callStatusPill} ${styles[`pill_${booking.status}`]}`}>
                      {booking.status}
                    </span>
                    <div className={styles.callTitle}>
                      {booking.date && formatDate(booking.date)}
                      {booking.time_slot && ` · ${formatTime(booking.time_slot)}`}
                    </div>
                    <div className={styles.callMeta}>Discovery call with RYZE.ai</div>
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

        {/* ── Other Open Roles ── */}
        {!rolesLoading && otherRoles.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Other Open Roles</h3>
              <p className={styles.sectionSub}>
                {otherRoles.length} additional position{otherRoles.length !== 1 ? 's' : ''} in the RYZE network
              </p>
            </div>
            <div className={styles.jobList}>
              {otherRoles.map(job => (
                <div key={job.id} className={styles.otherJobCard}>
                  <div className={styles.otherJobLeft}>
                    <div className={styles.jobTitle}>{job.title}</div>
                    <div className={styles.jobMeta}>
                      {job.location && (
                        <span className={styles.jobMetaItem}>
                          <i className="fi fi-rr-marker" /> {job.location}
                        </span>
                      )}
                      {formatSalary(job.salary_min, job.salary_max) && (
                        <span className={styles.jobMetaItem}>
                          <i className="fi fi-rr-usd-circle" /> {formatSalary(job.salary_min, job.salary_max)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={styles.jobOpenBadge}>Open</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {bookingOpen && (
        <div className={styles.modalOverlay} onClick={() => setBookingOpen(false)}>
          <div onClick={e => e.stopPropagation()}>
            <ScheduleCallButton
              variant="modal"
              onClose={() => setBookingOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
