// src/pages/CandidateSelfProfile.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { apiFetch } from '../services/api';
import styles from './CandidateSelfProfile.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Splits AI prose into bullet sentences, strips subject pronouns.
 * Mirrors backend _parse_to_bullets logic and PDF pdf_parse_to_bullets.
 */
function parseToDisplayBullets(text, maxItems = 6) {
    if (!text) return [];
    const sentences = text.split(/(?<=\.)\s+(?=[A-Z])/);
    const STRIP_PREFIXES = [
        "He then ", "He also ", "He currently ", "He is currently ",
        "She then ", "She also ", "She currently ", "She is currently ",
        "They then ", "They also ", "They currently ",
        "Concurrently, he ", "Concurrently, she ", "Concurrently, they ",
        "He ", "She ", "They ",
    ];
    const bullets = [];
    for (let s of sentences) {
        s = s.trim();
        if (s.length < 20) continue;
        if (/^[A-Z][a-z]+ [A-Z][a-z]+ has (an|a) /.test(s)) continue;
        for (const prefix of STRIP_PREFIXES) {
            if (s.startsWith(prefix)) {
                s = s.slice(prefix.length);
                s = s.charAt(0).toUpperCase() + s.slice(1);
                break;
            }
        }
        bullets.push(s);
    }
    return bullets.slice(0, maxItems);
}

export default function CandidateSelfProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const photoInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [form, setForm] = useState({});
    const [photoUploading, setPhotoUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);

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
            setSaveMsg('Changes saved!');
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

    async function handlePhotoChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_BASE}/api/candidates/me/photo`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setProfile(prev => ({ ...prev, photo_url: data.photo_url }));
        } catch (err) {
            alert('Photo upload failed: ' + err.message);
        } finally {
            setPhotoUploading(false);
            if (photoInputRef.current) photoInputRef.current.value = '';
        }
    }

    async function handleBannerChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_BASE}/api/candidates/me/banner`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setProfile(prev => ({ ...prev, banner_url: data.banner_url }));
        } catch (err) {
            alert('Banner upload failed: ' + err.message);
        } finally {
            setBannerUploading(false);
            if (bannerInputRef.current) bannerInputRef.current.value = '';
        }
    }

    // ── Derived display values ──────────────────────────────────────────────
    const skills = Array.isArray(profile?.ai_skills)
        ? profile.ai_skills
        : typeof profile?.ai_skills === 'string'
            ? profile.ai_skills.split(',').map(s => s.trim()).filter(Boolean)
            : [];

    const experienceBullets = parseToDisplayBullets(profile?.ai_experience);
    const educationBullets = parseToDisplayBullets(profile?.ai_education, 4);

    const careerLevelLabel = {
        entry: 'Entry Level',
        mid: 'Mid Level',
        senior: 'Senior',
        executive: 'Executive',
    }[profile?.ai_career_level] || profile?.ai_career_level || null;

    // ── Loading / empty ─────────────────────────────────────────────────────
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

                <button className={styles.backBtn} onClick={() => navigate('/candidate/dashboard')}>
                    ← Back to Dashboard
                </button>

                {/* ══════════════════════════════════════════
                    IDENTITY CARD — mirrors PDF structure exactly:
                    banner → identityZone (avatar + actions) → nameBlock
                ══════════════════════════════════════════ */}
                <div className={styles.profileCard}>

                    {/* Banner — purely visual */}
                    <div
                        className={styles.banner}
                        style={profile.banner_url ? {
                            backgroundImage: `url(${profile.banner_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        } : {}}
                    />

                    {/* Hidden file inputs */}
                    <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                    <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />

                    {/* Identity zone: avatar (left) + action buttons (right) */}
                    <div className={styles.identityZone}>
                        <div
                            className={styles.avatarWrap}
                            onClick={() => !photoUploading && photoInputRef.current?.click()}
                            title="Click to update your photo"
                        >
                            {profile.photo_url ? (
                                <img src={profile.photo_url} alt={profile.name} className={styles.avatarImg} />
                            ) : (
                                <div className={styles.avatarInitial}>
                                    {getInitials(profile.name)}
                                </div>
                            )}
                            <div className={styles.avatarOverlay}>
                                {photoUploading
                                    ? <span className={styles.spinner} />
                                    : <i className="fi fi-rr-camera" />}
                            </div>
                        </div>

                        {/* Action buttons float to the right, aligned to bottom of identity zone */}
                        <div className={styles.identityActions}>
                            {!editing && (
                                <button
                                    className={styles.changeBannerBtn}
                                    onClick={() => bannerInputRef.current?.click()}
                                    disabled={bannerUploading}
                                >
                                    {bannerUploading
                                        ? <><span className={styles.spinner} /> Uploading…</>
                                        : <><i className="fi fi-rr-picture" /> Change Banner</>}
                                </button>
                            )}

                            {editing ? (
                                <div className={styles.editActions}>
                                    <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                                        Cancel
                                    </button>
                                    <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                        {saving ? <><span className={styles.spinner} /> Saving…</> : 'Save Changes'}
                                    </button>
                                </div>
                            ) : (
                                <button className={styles.editBtn} onClick={() => setEditing(true)}>
                                    <i className="fi fi-rr-edit" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Name block — gradient border-bottom (mirrors .name-block) */}
                    <div className={styles.nameBlock}>
                        <div className={styles.candidateName}>{profile.name}</div>

                        {(profile.current_title || profile.current_company) && (
                            <div className={styles.candidateMeta}>
                                {profile.current_title}
                                {profile.current_title && profile.current_company && (
                                    <span className={styles.metaDivider}>·</span>
                                )}
                                {profile.current_company}
                            </div>
                        )}

                        {profile.location && (
                            <div className={styles.candidateLocation}>
                                <i className="fi fi-rr-marker" /> {profile.location}
                            </div>
                        )}

                        {saveMsg && (
                            <div className={`${styles.saveMsg} ${saveMsg.includes('failed') ? styles.saveMsgErr : ''}`}>
                                {saveMsg}
                            </div>
                        )}
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    TWO-COLUMN BODY — mirrors PDF .body layout
                ══════════════════════════════════════════ */}
                <div className={styles.profileBodyGrid}>

                    {/* ── Main column ── */}
                    <div className={styles.mainCol}>

                        {profile.ai_summary && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>About</div>
                                <div style={{ padding: '14px 18px' }}>
                                    <p className={styles.summaryText}>{profile.ai_summary}</p>
                                </div>
                            </div>
                        )}

                        {experienceBullets.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Experience</div>
                                <div style={{ padding: '14px 18px' }}>
                                    <ul className={styles.bulletList}>
                                        {experienceBullets.map((b, i) => (
                                            <li key={i} className={styles.bulletItem}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {educationBullets.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Education</div>
                                <div style={{ padding: '14px 18px' }}>
                                    <ul className={styles.bulletList}>
                                        {educationBullets.map((b, i) => (
                                            <li key={i} className={styles.bulletItem}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Side column ── */}
                    <div className={styles.sideCol}>

                        {/* Basic Info — editable */}
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Basic Information</div>
                            <div style={{ padding: '14px 18px' }}>
                                {editing ? (
                                    <div className={styles.fieldRow}>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Current Title</label>
                                            <input
                                                className={styles.fieldInput}
                                                value={form.current_title}
                                                onChange={e => setForm(p => ({ ...p, current_title: e.target.value }))}
                                                placeholder="e.g. Senior Accountant"
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Current Company</label>
                                            <input
                                                className={styles.fieldInput}
                                                value={form.current_company}
                                                onChange={e => setForm(p => ({ ...p, current_company: e.target.value }))}
                                                placeholder="e.g. Acme Corp"
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Location</label>
                                            <input
                                                className={styles.fieldInput}
                                                value={form.location}
                                                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                                placeholder="e.g. Manchester, NH"
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Phone</label>
                                            <input
                                                className={styles.fieldInput}
                                                value={form.phone}
                                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="e.g. 603-555-0100"
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>LinkedIn URL</label>
                                            <input
                                                className={styles.fieldInput}
                                                value={form.linkedin_url}
                                                onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))}
                                                placeholder="https://linkedin.com/in/…"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.roGrid}>
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>Title</span>
                                            {profile.current_title && <span className={styles.roValue}>{profile.current_title}</span>}
                                        </div>
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>Company</span>
                                            {profile.current_company && <span className={styles.roValue}>{profile.current_company}</span>}
                                        </div>
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>Location</span>
                                            {profile.location && <span className={styles.roValue}>{profile.location}</span>}
                                        </div>
                                        <div className={styles.roField}>
                                            <span className={styles.roLabel}>Phone</span>
                                            {profile.phone && <span className={styles.roValue}>{profile.phone}</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Career info — read-only */}
                        {(careerLevelLabel || profile.ai_years_experience || profile.ai_certifications) && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Career Details</div>
                                <div style={{ padding: '14px 18px' }}>
                                    <div className={styles.roGrid}>
                                        {careerLevelLabel && (
                                            <div className={styles.roField}>
                                                <span className={styles.roLabel}>Level</span>
                                                <span className={styles.roValue}>{careerLevelLabel}</span>
                                            </div>
                                        )}
                                        {profile.ai_years_experience && (
                                            <div className={styles.roField}>
                                                <span className={styles.roLabel}>Experience</span>
                                                <span className={styles.roValue}>{profile.ai_years_experience} years</span>
                                            </div>
                                        )}
                                        {profile.ai_certifications && (
                                            <div className={styles.roField} style={{ gridColumn: '1 / -1' }}>
                                                <span className={styles.roLabel}>Certifications</span>
                                                <span className={styles.roValue}>{profile.ai_certifications}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Skills — mirrors .skill-tag */}
                        {skills.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Skills</div>
                                <div style={{ padding: '12px 18px' }}>
                                    <div className={styles.skillsWrap}>
                                        {skills.map((skill, i) => (
                                            <span key={i} className={styles.skillTag}>{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Contact</div>
                            <div style={{ padding: '14px 18px' }}>
                                <div className={styles.detailList}>
                                    {profile.email && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Email</span>
                                            <a href={`mailto:${profile.email}`} className={styles.detailLink}>{profile.email}</a>
                                        </div>
                                    )}
                                    {profile.phone && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Phone</span>
                                            <a href={`tel:${profile.phone}`} className={styles.detailLink}>{profile.phone}</a>
                                        </div>
                                    )}
                                    {profile.linkedin_url && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>LinkedIn</span>
                                            <a
                                                href={profile.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.detailLink}
                                            >
                                                View Profile
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── RYZE footer — mirrors PDF footer ── */}
                <div className={styles.profileFooter}>
                    <div className={styles.footerLeft}>
                        <span className={styles.footerBrand}>RYZE.ai</span>
                        <span className={styles.footerSep} />
                        <span className={styles.footerTagline}>Your Candidate Profile</span>
                    </div>
                    <div className={styles.footerRight}>
                        {profile.ai_parsed_at
                            ? `Enriched ${new Date(profile.ai_parsed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                            : 'Not yet enriched'}
                    </div>
                </div>

            </main>
        </div>
    );
}