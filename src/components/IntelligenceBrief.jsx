/* src/components/IntelligenceBrief.jsx */
import { useEffect, useState } from 'react';
import styles from './IntelligenceBrief.module.css';
import aiIcon from '../assets/icons/artificial-intelligence.svg';
import letterXIcon from '../assets/icons/letter-x.svg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
      <div className={styles.panel}>
        <div className={styles.stateMsg}>
          <i className="fi fi-rr-time" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}></i>
          Generating intelligence brief…
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.panel}>
        <div className={`${styles.stateMsg} ${styles.stateMsgError}`}>
          Could not load brief. {error}
        </div>
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

  function renderFromRaw() {
    try {
      const cleaned = profile.ai_brief_raw
        .replace(/^```json\s*/m, '').replace(/^```\s*/m, '').replace(/\s*```$/m, '').trim();
      const parsed = JSON.parse(cleaned);
      return (
        <>
          {parsed.company_overview && (
            <div className={styles.section}>
              <div className={styles.label}>Company Overview</div>
              <div className={styles.content}>{parsed.company_overview}</div>
            </div>
          )}
          <div className={styles.twoCol}>
            {parsed.industry && (
              <div className={styles.section}>
                <div className={styles.label}>Industry</div>
                <div className={styles.content}>{parsed.industry}</div>
              </div>
            )}
            {parsed.estimated_size && (
              <div className={styles.section}>
                <div className={styles.label}>Estimated Size</div>
                <div className={styles.content}>{parsed.estimated_size}</div>
              </div>
            )}
          </div>
          {parsed.hiring_needs?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.label}>Likely Hiring Needs</div>
              <div className={styles.tags}>
                {parsed.hiring_needs.map((need, i) => <span key={i} className={styles.tag}>{need}</span>)}
              </div>
            </div>
          )}
          {parsed.talking_points?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.label}>Key Talking Points</div>
              <ul className={styles.list}>
                {parsed.talking_points.map((pt, i) => <li key={i}>{pt}</li>)}
              </ul>
            </div>
          )}
          {parsed.red_flags && (
            <div className={styles.section}>
              <div className={styles.label}>
                <i className="fi fi-rr-triangle-warning" style={{ marginRight: '4px' }}></i>Red Flags
              </div>
              <div className={`${styles.content} ${styles.redFlags}`}>{parsed.red_flags}</div>
            </div>
          )}
        </>
      );
    } catch {
      return <pre className={styles.raw}>{profile.ai_brief_raw}</pre>;
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <img src={aiIcon} alt="" className={styles.aiIcon} />
        <span className={styles.title}>Pre-Call Intelligence Brief</span>
        {profile.ai_brief_updated_at && (
          <span className={styles.updated}>
            Updated {new Date(profile.ai_brief_updated_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        )}
        <button className={styles.close} onClick={onClose} aria-label="Close brief">
          <img src={letterXIcon} alt="Close" className={styles.closeIcon} />
        </button>
      </div>

      {!hasStructuredData && !profile.ai_brief_raw ? (
        <p className={styles.empty}>
          No intelligence brief available — website may not have been provided or brief generation failed.
        </p>
      ) : (
        <div className={styles.body}>
          {!hasStructuredData && profile.ai_brief_raw
            ? renderFromRaw()
            : (
              <>
                {profile.ai_company_overview && (
                  <div className={styles.section}>
                    <div className={styles.label}>Company Overview</div>
                    <div className={styles.content}>{profile.ai_company_overview}</div>
                  </div>
                )}
                <div className={styles.twoCol}>
                  {profile.ai_industry && (
                    <div className={styles.section}>
                      <div className={styles.label}>Industry</div>
                      <div className={styles.content}>{profile.ai_industry}</div>
                    </div>
                  )}
                  {profile.ai_company_size && (
                    <div className={styles.section}>
                      <div className={styles.label}>Estimated Size</div>
                      <div className={styles.content}>{profile.ai_company_size}</div>
                    </div>
                  )}
                </div>
                {profile.ai_hiring_needs?.length > 0 && (
                  <div className={styles.section}>
                    <div className={styles.label}>Likely Hiring Needs</div>
                    <div className={styles.tags}>
                      {profile.ai_hiring_needs.map((need, i) => (
                        <span key={i} className={styles.tag}>{need}</span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.ai_talking_points?.length > 0 && (
                  <div className={styles.section}>
                    <div className={styles.label}>Key Talking Points</div>
                    <ul className={styles.list}>
                      {profile.ai_talking_points.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                )}
                {profile.ai_red_flags && (
                  <div className={styles.section}>
                    <div className={styles.label}>
                      <i className="fi fi-rr-triangle-warning" style={{ marginRight: '4px' }}></i>
                      Red Flags / Considerations
                    </div>
                    <div className={`${styles.content} ${styles.redFlags}`}>{profile.ai_red_flags}</div>
                  </div>
                )}
                {profile.recruiter_notes && (
                  <div className={styles.section}>
                    <div className={styles.label}>
                      <i className="fi fi-rr-pencil" style={{ marginRight: '4px' }}></i>
                      Recruiter Notes
                    </div>
                    <div className={styles.content}>{profile.recruiter_notes}</div>
                  </div>
                )}
              </>
            )
          }
        </div>
      )}
    </div>
  );
}

export default IntelligenceBrief;
