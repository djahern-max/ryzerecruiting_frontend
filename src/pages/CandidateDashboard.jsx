// src/pages/CandidateDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BookingModal from '../components/BookingModal';
import zoomIcon from '../assets/icons/zoom.svg';
import scheduledCallIcon from '../assets/icons/scheduled_call.svg';
import matchedOpportunityIcon from '../assets/icons/matched_opportunity.svg';
import styles from './CandidateDashboard.module.css';
import { apiFetch } from '../services/api';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';



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
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
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
// JobMatchCard
// ---------------------------------------------------------------------------

const TRUNCATE = 220;
const NOTE_MAX = 500;

function JobMatchCard({ job, rank, hasInterest, onInterestSent }) {
  const [expanded, setExpanded] = useState(false);
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const isLong = job.requirements && job.requirements.length > TRUNCATE;
  const hasScore = job.match_score != null;
  const pct = hasScore ? getScorePercent(job.match_score) : null;
  const tier = hasScore ? getScoreTier(job.match_score) : null;
  const salary = formatSalary(job.salary_min, job.salary_max);

  const token = localStorage.getItem('token');

  const handleSend = () => {
    setSending(true);
    setError(null);
    const trimmed = note.trim();

    apiFetch(`${API_BASE}/api/job-orders/${job.id}/express-interest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trimmed ? { note: trimmed } : {}),
    })
      .then(r => {
        if (r.status === 201 || r.status === 409) {
          onInterestSent(job.id);
          setShowNoteBox(false);
          return;
        }
        throw new Error(`HTTP ${r.status}`);
      })
      .catch(() => setError("Couldn't send — try again."))
      .finally(() => setSending(false));
  };

  const handleCancel = () => {
    setShowNoteBox(false);
    setNote('');
    setError(null);
  };

  return (
    <div className={`${styles.matchCard} ${hasScore ? styles[`tier_${tier}`] : ''}`}>

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

        </div>

        {job.requirements && (
          <div className={styles.matchReqs}>
            <p className={styles.matchReqsText}>
              {expanded || !isLong
                ? job.requirements
                : `${job.requirements.slice(0, TRUNCATE)}…`}
            </p>
            {isLong && (
              <button className={styles.matchToggle} onClick={() => setExpanded(p => !p)}>
                {expanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            )}
          </div>
        )}

        <div className={styles.interestSection}>
          {hasInterest ? (
            <span className={styles.interestSentPill}>✓ Interest sent</span>
          ) : !showNoteBox ? (
            <button className={styles.interestBtn} onClick={() => setShowNoteBox(true)}>
              I'm interested
            </button>
          ) : (
            <div className={styles.interestBox}>
              <textarea
                className={styles.interestTextarea}
                placeholder="Add a quick note — optional"
                maxLength={NOTE_MAX}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={sending}
              />
              {error && <p className={styles.interestError}>{error}</p>}
              <div className={styles.interestActions}>
                <button
                  className={styles.interestSendBtn}
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? 'Sending…' : 'Send'}
                </button>
                <button
                  className={styles.interestCancelBtn}
                  onClick={handleCancel}
                  disabled={sending}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const isFirmTenant = Boolean(user?.tenant_id) && user.tenant_id !== 'ryze';

  const [bookingOpen, setBookingOpen] = useState(false);

  // Bookings
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Candidate profile — null = no profile, false = loading
  const [candidateProfile, setCandidateProfile] = useState(false);

  // Matched roles — only populated when profile exists
  const [matchedRoles, setMatchedRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Expressed interests (job order ids)
  const [interestedJobIds, setInterestedJobIds] = useState(new Set());

  const markInterested = (jobId) => {
    setInterestedJobIds(prev => new Set(prev).add(jobId));
  };

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' };

    // Bookings
    apiFetch(`${API_BASE}/api/bookings/my`, { headers, cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMyBookings(data))
      .catch(() => { })
      .finally(() => setBookingsLoading(false));

    // Candidate profile — sets null if 404, no fallback
    apiFetch(`${API_BASE}/api/candidates/me`, { headers, cache: 'no-store' })
      .then(r => {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => setCandidateProfile(data))
      .catch(() => setCandidateProfile(null));

    // Expressed interests
    apiFetch(`${API_BASE}/api/candidates/me/interests`, { headers, cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setInterestedJobIds(new Set(data.map(i => i.job_order_id))))
      .catch(() => { });

  }, [token]);

  // Only fetch matches once we know a profile exists
  useEffect(() => {
    if (candidateProfile === false) return; // still loading
    if (candidateProfile === null) return;  // no profile — don't fetch

    const headers = { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' };
    setRolesLoading(true);

    apiFetch(`${API_BASE}/api/candidates/me/job-matches`, { headers, cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => setMatchedRoles(data))
      .catch(() => setMatchedRoles([]))
      .finally(() => setRolesLoading(false));

  }, [candidateProfile, token]);

  const profileLoading = candidateProfile === false;
  const hasProfile = candidateProfile !== false && candidateProfile !== null;
  const isRanked = matchedRoles.length > 0 && matchedRoles[0].match_score != null;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>

        {/* ── Welcome Banner ── */}
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <h1 className={styles.bannerTitle}>Welcome back, {firstName}.</h1>
            {isFirmTenant && user.tenant_brand_name && (
              <p className={styles.bannerSub}>You're working with {user.tenant_brand_name}</p>
            )}
          </div>
          <div className={styles.bannerRight}>
            <button className={styles.profileBtn} onClick={() => navigate('/candidate/profile')}>
              <i className="fi fi-rr-user" /> My Profile
            </button>
            <button className={styles.scheduleBtn} onClick={() => setBookingOpen(true)}>
              <i className="fi fi-rr-calendar" />
              Schedule a Call
            </button>
          </div>
        </div>

        {/* ── How It Works ── */}
        {!hasProfile && (
          <section className={styles.howItWorks}>
            <div className={styles.howItWorksIntro}>
              <span className={styles.howItWorksBadge}>How RYZE.ai works</span>
              <h2 className={styles.howItWorksTitle}>
                Your profile starts with a quick conversation.
              </h2>
              <p className={styles.howItWorksText}>
                Schedule a short Zoom intro call so we can learn about your background,
                goals, experience, and what kind of opportunity would actually be a good fit.
              </p>
              <p className={styles.howItWorksText}>
                After the call, RYZE.ai uses the conversation notes to help build your
                candidate profile. From there, matched opportunities can appear here as
                relevant roles become available.
              </p>
            </div>

            <div className={styles.howItWorksSteps}>
              <div className={styles.howStep}>
                <div className={styles.howStepIcon}>
                  <i className="fi fi-rr-calendar" />
                </div>
                <div>
                  <h4>1. Schedule a call</h4>
                  <p>Pick a time for a quick intro Zoom call.</p>
                </div>
              </div>

              <div className={styles.howStep}>
                <div className={styles.howStepIcon}>
                  <i className="fi fi-rr-user" />
                </div>
                <div>
                  <h4>2. Build your profile</h4>
                  <p>Your background and preferences are organized into a candidate profile.</p>
                </div>
              </div>

              <div className={styles.howStep}>
                <div className={styles.howStepIcon}>
                  <i className="fi fi-rr-briefcase" />
                </div>
                <div>
                  <h4>3. See matched roles</h4>
                  <p>Relevant opportunities appear here when there is a potential fit.</p>
                </div>
              </div>
            </div>

            <button className={styles.scheduleBtn} onClick={() => setBookingOpen(true)}>
              <i className="fi fi-rr-calendar" />
              Schedule Intro Call
            </button>
          </section>
        )}

        {/* ── My Scheduled Calls ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <span className={styles.sectionIcon}><img src={scheduledCallIcon} alt="" className={styles.sectionIconImg} /></span>
              <h3 className={styles.sectionTitle}>My Scheduled Calls</h3>
            </div>
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
                <div className={styles.sectionTitleRow}>
                  <span className={styles.sectionIcon}><img src={matchedOpportunityIcon} alt="" className={styles.sectionIconImg} /></span>
                  <h3 className={styles.sectionTitle}>
                    {profileLoading
                      ? 'Opportunities'
                      : isRanked
                        ? 'Matched Opportunities'
                        : hasProfile
                          ? 'Open Opportunities'
                          : 'Set Up Your Profile'}
                  </h3>
                </div>

                {/* subtitle only when it actually says something true */}
                {(profileLoading || rolesLoading || isRanked) && (
                  <p className={styles.sectionSub}>
                    {profileLoading || rolesLoading
                      ? 'Running AI matching…'
                      : `${matchedRoles.length} role${matchedRoles.length !== 1 ? 's' : ''} ranked by AI fit for your profile`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {profileLoading || rolesLoading ? (
            <div className={styles.rolesLoading}>
              <div className={styles.rolesLoadingDots}>
                <span /><span /><span />
              </div>
              <p>Running AI match analysis…</p>
            </div>
          ) : !hasProfile ? (
            <div className={styles.rolesEmpty}>
              <span className={styles.rolesEmptyIconWrap}>
                <i className={`fi fi-rr-user-add ${styles.rolesEmptyIcon}`} />
              </span>
              <p>Matched roles appear once your profile is set up.</p>
              <button className={styles.scheduleBtnSm} onClick={() => setBookingOpen(true)}>
                Talk to a Recruiter
              </button>
            </div>
          ) : matchedRoles.length === 0 ? (
            <div className={styles.rolesEmpty}>
              <span className={styles.rolesEmptyIconWrap}>
                <i className={`fi fi-rr-briefcase ${styles.rolesEmptyIcon}`} />
              </span>
              <p>No matched roles right now — check back soon.</p>
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
                  hasInterest={interestedJobIds.has(job.id)}
                  onInterestSent={markInterested}
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