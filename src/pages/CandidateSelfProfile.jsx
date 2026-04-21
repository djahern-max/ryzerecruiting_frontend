// src/pages/CandidateProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { apiFetch } from '../services/api';
import styles from './CandidateSelfProfile.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fields the candidate can edit themselves
const EDITABLE_FIELDS = ['current_title', 'current_company', 'location', 'phone', 'linkedin_url'];

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function SkillTag({ label }) {
    return <span className={styles.skillTag}>{label}</span>;
}

function ReadOnlyField({ label, value }) {
    if (!value) return null;
    return (
        <div className={styles.roField}>
            <span className={styles.roLabel}>{label}</span>
            <span className={styles.roValue}>{value}</span>
        </div>
    );
}

export default function CandidateProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [form, setForm] = useState({});

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        apiFetch(`${API_BASE}/api/candidates/me`, { headers })
            .then(r => {
                if (r.status === 404) return null;
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => {
                setProfile(data);
                if (data) {
                    setForm({
                        current_title: data.current_title || '',
                        current_company: data.current_company || '',
                        location: data.location || '',
                        phone: data.phone || '',
                        linkedin_url: data.linkedin_url || '',
                    });
                }
            })
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [token]);

    async function handleSave() {
        setSaving(true);
        setSaveMsg('');
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
            const res = await apiFetch(`${API_BASE}/api/candidates/me`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const updated = await res.json();
            setProfile(updated);
            setEditing(false);
            setSaveMsg('Saved!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch {
            setSaveMsg('Save failed — please try again.');
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        if (profile) {
            setForm({
                current_title: profile.current_title || '',
                current_company: profile.current_company || '',
                location: profile.location || '',
                phone: profile.phone || '',
                linkedin_url: profile.linkedin_url || '',
            });
        }
        setEditing(false);
        setSaveMsg('');
    }

    const skills = Array.isArray(profile?.ai_skills)
        ? profile.ai_skills
        : typeof profile?.ai_skills === 'string'
            ? profile.ai_skills.split(',').map(s => s.trim()).filter(Boolean)
            : [];

    const careerLevelLabel = {
        entry: 'Entry Level',
        mid: 'Mid Level',
        senior: 'Senior',
        executive: 'Executive',
    }[profile?.ai_career_level] || profile?.ai_career_level || null;

    if (loading) {
        return (
            <div className={styles.page}>
                <Header />
                <div className={styles.loadingState}>
                    <div className={styles.loadingDots}><span /><span /><span /></div>
                    <p>Loading your profile…</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={styles.page}>
                <Header />
                <div className={styles.emptyState}>
                    <p>No profile found. <button className={styles.backLink} onClick={() => navigate('/candidate/dashboard')}>Go back</button></p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>

                {/* ── Back nav ── */}
                <button className={styles.backBtn} onClick={() => navigate('/candidate/dashboard')}>
                    ← Back to Dashboard
                </button>

                {/* ── Profile card ── */}
                <div className={styles.profileCard}>

                    {/* Banner */}
                    <div className={styles.banner}>
                        <div className={styles.bannerPlaceholder}>
                            <span className={styles.bannerComingSoon}>
                                Profile banner — coming soon
                            </span>
                        </div>
                    </div>

                    {/* Avatar + identity */}
                    <div className={styles.identityRow}>
                        <div className={styles.avatarWrap}>
                            <div className={styles.avatar}>
                                {getInitials(profile.name)}
                            </div>
                            <button className={styles.avatarUploadBtn} title="Photo upload coming soon" disabled>
                                <i className="fi fi-rr-camera" />
                            </button>
                        </div>

                        <div className={styles.identityActions}>
                            {!editing ? (
                                <button className={styles.editBtn} onClick={() => setEditing(true)}>
                                    <i className="fi fi-rr-edit" /> Edit Profile
                                </button>
                            ) : (
                                <div className={styles.editActions}>
                                    <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                                        Cancel
                                    </button>
                                    <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                            {saveMsg && (
                                <span className={`${styles.saveMsg} ${saveMsg.includes('failed') ? styles.saveMsgErr : ''}`}>
                                    {saveMsg}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Name + headline */}
                    <div className={styles.nameBlock}>
                        <h1 className={styles.name}>{profile.name}</h1>
                        {(profile.current_title || profile.current_company) && (
                            <p className={styles.headline}>
                                {[profile.current_title, profile.current_company].filter(Boolean).join(' · ')}
                            </p>
                        )}
                        {profile.location && (
                            <p className={styles.locationLine}>
                                <i className="fi fi-rr-marker" /> {profile.location}
                            </p>
                        )}
                    </div>

                    {/* Level + experience badges */}
                    {(careerLevelLabel || profile.ai_years_experience || profile.ai_certifications) && (
                        <div className={styles.badgeRow}>
                            {careerLevelLabel && <span className={styles.levelBadge}>{careerLevelLabel}</span>}
                            {profile.ai_years_experience && (
                                <span className={styles.expBadge}>{profile.ai_years_experience} yrs experience</span>
                            )}
                            {profile.ai_certifications && (
                                <span className={styles.certBadge}><i className="fi fi-rr-diploma" /> {profile.ai_certifications}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Editable basic info ── */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Basic Information</h2>
                        <p className={styles.sectionSub}>
                            {editing ? 'Update your contact and position details below.' : 'Your contact and position details.'}
                        </p>
                    </div>

                    {editing ? (
                        <div className={styles.editForm}>
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>Current Title</label>
                                    <input
                                        className={styles.fieldInput}
                                        value={form.current_title}
                                        onChange={e => setForm(f => ({ ...f, current_title: e.target.value }))}
                                        placeholder="e.g. Senior Accountant"
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>Current Company</label>
                                    <input
                                        className={styles.fieldInput}
                                        value={form.current_company}
                                        onChange={e => setForm(f => ({ ...f, current_company: e.target.value }))}
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                            </div>
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>Location</label>
                                    <input
                                        className={styles.fieldInput}
                                        value={form.location}
                                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                        placeholder="e.g. Boston, MA"
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.fieldLabel}>Phone</label>
                                    <input
                                        className={styles.fieldInput}
                                        value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="e.g. (617) 555-0100"
                                    />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.fieldLabel}>LinkedIn URL</label>
                                <input
                                    className={styles.fieldInput}
                                    value={form.linkedin_url}
                                    onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                                    placeholder="https://linkedin.com/in/yourname"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.roGrid}>
                            <ReadOnlyField label="Current Title" value={profile.current_title} />
                            <ReadOnlyField label="Current Company" value={profile.current_company} />
                            <ReadOnlyField label="Location" value={profile.location} />
                            <ReadOnlyField label="Phone" value={profile.phone} />
                            {profile.linkedin_url && (
                                <div className={styles.roField}>
                                    <span className={styles.roLabel}>LinkedIn</span>
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.roLink}
                                    >
                                        {profile.linkedin_url.replace('https://', '')}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── AI-built profile (read-only) ── */}
                {(profile.ai_summary || skills.length > 0 || profile.ai_experience || profile.ai_education) && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Your Profile</h2>
                            <p className={styles.sectionSub}>Built by your RYZE recruiter from your resume and intro call.</p>
                        </div>

                        {profile.ai_summary && (
                            <div className={styles.summaryBlock}>
                                <p className={styles.summaryText}>{profile.ai_summary}</p>
                            </div>
                        )}

                        {skills.length > 0 && (
                            <div className={styles.subsection}>
                                <h3 className={styles.subsectionTitle}>Skills</h3>
                                <div className={styles.skillsWrap}>
                                    {skills.map((s, i) => <SkillTag key={i} label={s} />)}
                                </div>
                            </div>
                        )}

                        {profile.ai_experience && (
                            <div className={styles.subsection}>
                                <h3 className={styles.subsectionTitle}>Experience</h3>
                                <p className={styles.subsectionText}>{profile.ai_experience}</p>
                            </div>
                        )}

                        {profile.ai_education && (
                            <div className={styles.subsection}>
                                <h3 className={styles.subsectionTitle}>Education</h3>
                                <p className={styles.subsectionText}>{profile.ai_education}</p>
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}