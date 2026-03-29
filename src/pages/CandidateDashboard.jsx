// src/pages/CandidateDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BookingModal from '../components/BookingModal';
import zoomIcon from '../assets/icons/zoom.svg';
import styles from './CandidateDashboard.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

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
// Match score utilities
// ---------------------------------------------------------------------------

function getScorePercent(score) {
  return Math.round((score || 0) * 100);
}

function getScoreTier(score) {
  const pct = getScorePercent(score);
  if (pct >= 80) return 'high';
  if (pct >= 60) return 'mid';
  return 'low';
}

// ---------------------------------------------------------------------------
// JobMatchCard — ranked job opportunity with AI score
// ---------------------------------------------------------------------------

const TRUNCATE = 220;

function JobMatchCard({ job, onSchedule, rank }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = job.requirements && job.requirements.length > TRUNCATE;
  const hasScore = job.match_score !== null && job.match_score !== undefined;
  const pct = hasScore ? getScorePercent(job.match_score) : null;
  const tier = hasScore ? getScoreTier(job.match_score) : null;
  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <div className={`${styles.matchCard} ${hasScore ? styles[`tier_${tier}`] : ''}`}>

      {/* Score strip */}
      {hasScore && (
        <div className={`${styles.scoreStrip} ${styles[`scoreStrip_${tier}`]}`}>
          <div className={styles.scoreLeft}>
            <span className={`${styles.scoreBadge} ${styles[`scoreBadge_${tier}`]}`}>
              {pct}% Match
            </span>
            {rank === 1 && (
              <span className={styles.topPickBadge}>
                <i className="fi fi-rr-star" /> Top Pick
              </span>
            )}
          </div>
          <div className={styles.scoreBar}>
            <div
              className={`${styles.scoreBarFill} ${styles[`scoreBarFill_${tier}`]}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className={styles.matchCardBody}>
        {/* Header row */}
        <div className={styles.matchCardHeader}>
          <div className={styles.matchCardLeft}>
            <h3 className={styles.matchTitle}>{job.title}</h3>
            <div className={styles.matchMeta}>
              {job.location && (
                <span className={styles.matchMetaItem}>
                  <i className="fi fi-rr-marker" />
                  {job.location}
                </span>
              )}
              {salary && (
                <span className={styles.matchMetaItem}>
                  <i className="fi fi-rr-usd-circle" />
                  {salary}
                </span>
              )}
            </div>
          </div>
          <span className={styles.openBadge}>Open</span>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className={styles.matchReqs}>
            <p className={styles.matchReqsText}>
              {expanded || !isLong
                ? job.requirements
                : `${job.requirements.slice(0, TRUNCATE)}…`}
            </p>
            {isLong && (
              <button
                className={styles.matchToggle}
                onClick={() => setExpanded(p => !p)}
              >
                {expanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            )}
          </div>
        )}

        {/* CTA */}
        <div className={styles.matchCardFooter}>
          <button className={styles.applyBtn} onClick={onSchedule}>
            Schedule an Intro Call →
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// No-embedding notice
// ---------------------------------------------------------------------------

function IndexingNotice() {
  return (
    <div className={styles.indexingNotice}>
      <i className="fi fi-rr-hourglass" style={{ fontSize: '20px' }} />
      <div>
        <div className={styles.indexingTitle}>Your profile is being analyzed</div>
        <div className={styles.indexingText}>
          AI matching will be ready shortly. Jobs are shown below — check back soon for personalized rankings.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CandidateDashboard
// ---------------------------------------------------------------------------

export default function CandidateDashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const [bookingOpen, setBookingOpen] = useState(false);

  // Bookings
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // AI-matched job opportunities
  const [matchedRoles, setMatchedRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState(null);

  // Candidate profile (to show embedding status)
  const [candidateProfile, setCandidateProfile] = useState(null);

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    };

    // Bookings
    fetch(`${API_BASE}/api/bookings/my`, { headers, cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMyBookings(data))
      .catch(() => { })
      .finally(() => setBookingsLoading(false));

    // Candidate profile (for embedding status badge)
    fetch(`${API_BASE}/api/candidates/me`, { headers, cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setCandidateProfile(data))
      .catch(() => { });

    // AI-ranked job matches
    fetch(`${API_BASE}/api/candidates/me/job-matches`, { headers, cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => setMatchedRoles(data))
      .catch(err => {
        setRolesError(err.message);
        // Fallback to unranked open roles if matching fails
        fetch(`${API_BASE}/api/job-orders/open`, { cache: 'no-store' })
          .then(r => r.ok ? r.json() : [])
          .then(data => setMatchedRoles(data))
          .catch(() => { });
      })
      .finally(() => setRolesLoading(false));
  }, [token]); deb

  const isRanked = matchedRoles.length > 0 && matchedRoles[0].match_score !== null;
  const hasEmbedding = candidateProfile?.has_embedding ?? null;

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
              {isRanked
                ? 'Your matched roles, ranked by AI fit.'
                : 'Your RYZE career dashboard — accounting & finance roles.'}
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
          ) : myBookings.length === 0 ? (
            <div className={styles.callsEmpty}>
              No calls scheduled yet.{' '}
              <button className={styles.rebookLink} onClick={() => setBookingOpen(true)}>
                Book one now →
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
                    <div className={styles.callMeta}>Intro call with RYZE.ai</div>
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

        {/* ── AI-Matched Opportunities ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderTop}>
              <div>
                <h3 className={styles.sectionTitle}>
                  {isRanked ? 'Matched Opportunities' : 'Open Opportunities'}
                </h3>
                <p className={styles.sectionSub}>
                  {rolesLoading
                    ? 'Running AI matching…'
                    : isRanked
                      ? `${matchedRoles.length} role${matchedRoles.length !== 1 ? 's' : ''} ranked by AI fit for your profile`
                      : matchedRoles.length > 0
                        ? `${matchedRoles.length} active role${matchedRoles.length !== 1 ? 's' : ''} in accounting & finance`
                        : 'New roles added regularly — check back soon'}
                </p>
              </div>
              {isRanked && (
                <span className={styles.aiRankedBadge}>
                  <i className="fi fi-rr-magic-wand" />
                  AI Ranked
                </span>
              )}
            </div>

            {/* No-embedding notice */}
            {!rolesLoading && hasEmbedding === false && (
              <IndexingNotice />
            )}
          </div>

          {rolesLoading ? (
            <div className={styles.rolesLoading}>
              <div className={styles.rolesLoadingDots}>
                <span /><span /><span />
              </div>
              <p>Running AI match analysis…</p>
            </div>
          ) : matchedRoles.length === 0 ? (
            <div className={styles.rolesEmpty}>
              <i className={`fi fi-rr-briefcase ${styles.rolesEmptyIcon}`} />
              <p>No open roles right now — check back soon.</p>
              <button className={styles.scheduleBtnSm} onClick={() => setBookingOpen(true)}>
                Talk to a Recruiter
              </button>
            </div>
          ) : (
            <div className={styles.matchList}>
              {matchedRoles.map((job, idx) => (
                <JobMatchCard
                  key={job.id}
                  job={job}
                  rank={idx + 1}
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
