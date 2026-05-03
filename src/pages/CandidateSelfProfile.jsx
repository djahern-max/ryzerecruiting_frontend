// src/pages/CandidateSelfProfile.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { apiFetch } from '../services/api';
import styles from './CandidateSelfProfile.module.css';
import editIcon from '../assets/icons/edit.svg';
import changeIcon from '../assets/icons/change.svg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

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
        apiFetch(`${API_BASE}/api/candidates/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => { if (r.status === 404) return null; if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                setProfile(data);
                if (data) setForm({
                    current_title: data.current_title || '',
                    current_company: data.current_company || '',
                    location: data.location || '',
                    phone: data.phone || '',
                    linkedin_url: data.linkedin_url || '',
                });
            })
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [token]);

    async function handleSave() {
        setSaving(true); setSaveMsg('');
        try {
            const res = await apiFetch(`${API_BASE}/api/candidates/me`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            const updated = await res.json();
            setProfile(updated); setEditing(false); setSaveMsg('Changes saved!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch { setSaveMsg('Save failed — please try again.'); }
        finally { setSaving(false); }
    }

    function handleCancel() {
        if (profile) setForm({ current_title: profile.current_title || '', current_company: profile.current_company || '', location: profile.location || '', phone: profile.phone || '', linkedin_url: profile.linkedin_url || '' });
        setEditing(false); setSaveMsg('');
    }

    async function handlePhotoChange(e) {
        const file = e.target.files?.[0]; if (!file) return;
        setPhotoUploading(true);
        try {
            const fd = new FormData(); fd.append('file', file);
            const res = await fetch(`${API_BASE}/api/candidates/me/photo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setProfile(prev => ({ ...prev, photo_url: data.photo_url }));
        } catch (err) { alert('Photo upload failed: ' + err.message); }
        finally { setPhotoUploading(false); if (photoInputRef.current) photoInputRef.current.value = ''; }
    }

    async function handleBannerChange(e) {
        const file = e.target.files?.[0]; if (!file) return;
        setBannerUploading(true);
        try {
            const fd = new FormData(); fd.append('file', file);
            const res = await fetch(`${API_BASE}/api/candidates/me/banner`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setProfile(prev => ({ ...prev, banner_url: data.banner_url }));
        } catch (err) { alert('Banner upload failed: ' + err.message); }
        finally { setBannerUploading(false); if (bannerInputRef.current) bannerInputRef.current.value = ''; }
    }

    const skills = Array.isArray(profile?.ai_skills) ? profile.ai_skills
        : typeof profile?.ai_skills === 'string' ? profile.ai_skills.split(',').map(s => s.trim()).filter(Boolean)
            : [];
    const experienceBullets = parseToDisplayBullets(profile?.ai_experience);
    const educationBullets = parseToDisplayBullets(profile?.ai_education, 4);
    const careerLevelLabel = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', executive: 'Executive' }[profile?.ai_career_level] || profile?.ai_career_level || null;

    if (loading) return (
        <div className={styles.page}><Header />
            <div className={styles.loadingState}>
                <div className={styles.loadingDots}><span /><span /><span /></div>
                <p>Loading your profile…</p>
            </div>
        </div>
    );

    if (!profile) return (
        <div className={styles.page}><Header />
            <div className={styles.emptyState}>
                <p>No profile found. <button className={styles.backLink} onClick={() => navigate('/candidate/dashboard')}>Go back</button></p>
            </div>
        </div>
    );

    return (

        <div className={styles.page}>
            <Header />
            <main className={styles.main}>

                <button className={styles.backBtn} onClick={() => navigate('/candidate/dashboard')}>
                    ← Back to Dashboard
                </button>

                {/* Hidden file inputs */}
                <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />

                {/* BANNER — flat, no card */}
                <div
                    className={styles.banner}
                    style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                />

                {/* IDENTITY ZONE — avatar (left) + actions (right) */}
                <div className={styles.identityZone}>
                    <div className={styles.avatarWrap} onClick={() => !photoUploading && photoInputRef.current?.click()} title="Click to update your photo">
                        {profile.photo_url
                            ? <img src={profile.photo_url} alt={profile.name} className={styles.avatarImg} />
                            : <div className={styles.avatarInitial}>{getInitials(profile.name)}</div>}
                        <div className={styles.avatarOverlay}>
                            {photoUploading ? <span className={styles.spinner} /> : <i className="fi fi-rr-camera" />}
                        </div>
                    </div>

                    <div className={styles.identityActions}>
                        {!editing && (
                            <button className={styles.changeBannerBtn} onClick={() => bannerInputRef.current?.click()} disabled={bannerUploading}>
                                {bannerUploading
                                    ? <><span className={styles.spinner} /> Uploading…</>
                                    : <><img src={changeIcon} alt="" className={styles.btnIcon} /> Change Banner</>
                                }
                            </button>
                        )}
                        {editing ? (
                            <div className={styles.editActions}>
                                <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>Cancel</button>
                                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                    {saving ? <><span className={styles.spinner} /> Saving…</> : 'Save Changes'}
                                </button>
                            </div>
                        ) : (
                            <button className={styles.editBtn} onClick={() => setEditing(true)}>
                                <img src={editIcon} alt="" className={styles.btnIcon} /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* NAME BLOCK — always visible, white bg, gradient border */}
                <div className={styles.nameBlock}>

                </div>
                {/* TWO-COLUMN BODY */}
                <div className={styles.profileBodyGrid}>

                    <div className={styles.mainCol}>
                        {profile.ai_summary && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>About</div>
                                <div className={styles.bodyCardBody}><p className={styles.summaryText}>{profile.ai_summary}</p></div>
                            </div>
                        )}
                        {experienceBullets.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Experience</div>
                                <div className={styles.bodyCardBody}>
                                    <ul className={styles.bulletList}>
                                        {experienceBullets.map((b, i) => <li key={i} className={styles.bulletItem}>{b}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {educationBullets.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Education</div>
                                <div className={styles.bodyCardBody}>
                                    <ul className={styles.bulletList}>
                                        {educationBullets.map((b, i) => <li key={i} className={styles.bulletItem}>{b}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className={styles.sideCol}>
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Basic Information</div>
                            <div className={styles.bodyCardBody}>
                                {editing ? (
                                    <div className={styles.fieldRow}>
                                        {[['current_title', 'Current Title', 'e.g. Senior Accountant'], ['current_company', 'Current Company', 'e.g. Acme Corp'], ['location', 'Location', 'e.g. Manchester, NH'], ['phone', 'Phone', 'e.g. 603-555-0100'], ['linkedin_url', 'LinkedIn URL', 'https://linkedin.com/in/…']].map(([key, label, ph]) => (
                                            <div key={key} className={styles.fieldGroup}>
                                                <label className={styles.fieldLabel}>{label}</label>
                                                <input className={styles.fieldInput} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.roGrid}>
                                        {[['Title', profile.current_title], ['Company', profile.current_company], ['Location', profile.location], ['Phone', profile.phone]].map(([label, val]) => val ? (
                                            <div key={label} className={styles.roField}>
                                                <span className={styles.roLabel}>{label}</span>
                                                <span className={styles.roValue}>{val}</span>
                                            </div>
                                        ) : null)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {(careerLevelLabel || profile.ai_years_experience || profile.ai_certifications) && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Career Details</div>
                                <div className={styles.bodyCardBody}>
                                    <div className={styles.roGrid}>
                                        {careerLevelLabel && <div className={styles.roField}><span className={styles.roLabel}>Level</span><span className={styles.roValue}>{careerLevelLabel}</span></div>}
                                        {profile.ai_years_experience && <div className={styles.roField}><span className={styles.roLabel}>Experience</span><span className={styles.roValue}>{profile.ai_years_experience} years</span></div>}
                                        {profile.ai_certifications && <div className={styles.roField} style={{ gridColumn: '1/-1' }}><span className={styles.roLabel}>Certifications</span><span className={styles.roValue}>{profile.ai_certifications}</span></div>}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                    {/* Skills AFTER Education */}
                    {skills.length > 0 && (
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Skills</div>
                            <div className={styles.bodyCardBody}>
                                <div className={styles.skillsWrap}>
                                    {skills.map((skill, i) => <span key={i} className={styles.skillTag}>{skill}</span>)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RYZE footer */}
                <div className={styles.profileFooter}>
                    <div className={styles.footerLeft}>
                        <span className={styles.footerBrand}>RYZE.ai</span>
                        <span className={styles.footerSep} />
                        <span className={styles.footerTagline}>Your Candidate Profile</span>
                    </div>

                </div>

            </main>
        </div>
    );
}