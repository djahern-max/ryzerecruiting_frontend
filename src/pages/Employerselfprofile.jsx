// src/pages/EmployerSelfProfile.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { apiFetch } from '../services/api';
import styles from './EmployerSelfProfile.module.css';
import changeIcon from '../assets/icons/banner_image.svg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getInitial(companyName) {
    if (!companyName) return '?';
    return companyName.trim()[0].toUpperCase();
}

function formatPhone(phone) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    if (digits.length === 11 && digits[0] === '1') return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return phone;
}

export default function EmployerSelfProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const logoInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [form, setForm] = useState({});
    const [logoUploading, setLogoUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);

    useEffect(() => {
        apiFetch(`${API_BASE}/api/employer-profiles/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => { if (r.status === 404) return null; if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                setProfile(data);
                if (data) setForm({
                    company_name: data.company_name || '',
                    website_url: data.website_url || '',
                    phone: data.phone || '',
                    ai_industry: data.ai_industry || '',
                    ai_company_size: data.ai_company_size || '',
                });
            })
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [token]);

    async function handleSave() {
        setSaving(true); setSaveMsg('');
        try {
            const res = await apiFetch(`${API_BASE}/api/employer-profiles/me`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
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
        if (profile) setForm({
            company_name: profile.company_name || '',
            website_url: profile.website_url || '',
            phone: profile.phone || '',
            ai_industry: profile.ai_industry || '',
            ai_company_size: profile.ai_company_size || '',
        });
        setEditing(false);
        setSaveMsg('');
    }

    async function handleLogoChange(e) {
        const file = e.target.files?.[0]; if (!file) return;
        setLogoUploading(true);
        try {
            const fd = new FormData(); fd.append('file', file);
            const res = await fetch(`${API_BASE}/api/employer-profiles/me/logo`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setProfile(prev => ({ ...prev, logo_url: data.logo_url }));
        } catch (err) {
            alert('Logo upload failed: ' + err.message);
        } finally {
            setLogoUploading(false);
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    }

    async function handleBannerChange(e) {
        const file = e.target.files?.[0]; if (!file) return;
        setBannerUploading(true);
        try {
            const fd = new FormData(); fd.append('file', file);
            const res = await fetch(`${API_BASE}/api/employer-profiles/me/banner`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
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

    // hiring_needs and talking_points come back as arrays from the API
    const hiringNeeds = Array.isArray(profile?.ai_hiring_needs) ? profile.ai_hiring_needs : [];
    const talkingPoints = Array.isArray(profile?.ai_talking_points) ? profile.ai_talking_points : [];

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
                <p>No profile found. <button className={styles.backLink} onClick={() => navigate('/employer/dashboard')}>Go back</button></p>
            </div>
        </div>
    );

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>

                <button className={styles.backBtn} onClick={() => navigate('/employer/dashboard')}>
                    ← Back to Dashboard
                </button>

                {/* Hidden file inputs */}
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />

                {/* BANNER */}
                <div
                    className={styles.banner}
                    style={profile.banner_url
                        ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : {}}
                />

                {/* IDENTITY ZONE */}
                <div className={styles.identityZone}>

                    {/* LEFT GROUP — logo + company name */}
                    <div className={styles.identityLeft}>
                        <div
                            className={styles.avatarWrap}
                            onClick={() => !logoUploading && logoInputRef.current?.click()}
                            title="Click to update your logo"
                        >
                            {profile.logo_url ? (
                                <img src={profile.logo_url} alt={profile.company_name} className={styles.avatarImg} />
                            ) : (
                                <div className={styles.avatarInitial}>{getInitial(profile.company_name)}</div>
                            )}
                            <div className={styles.avatarOverlay}>
                                {logoUploading ? (
                                    <span className={styles.spinner} />
                                ) : (
                                    <span className={styles.cameraIcon}>📷</span>
                                )}
                            </div>
                        </div>

                        <span className={styles.identityName}>{profile.company_name}</span>
                    </div>

                    {/* RIGHT GROUP — action buttons */}
                    <div className={styles.identityActions}>
                        {editing ? (
                            <div className={styles.editActions}>
                                <button
                                    type="button"
                                    className={styles.rawIconButton}
                                    onClick={handleCancel}
                                    disabled={saving}
                                    title="Cancel"
                                    aria-label="Cancel"
                                >
                                    <span className={styles.actionGlyph}>✕</span>
                                </button>
                                <button
                                    type="button"
                                    className={styles.rawIconButton}
                                    onClick={handleSave}
                                    disabled={saving}
                                    title="Save Changes"
                                    aria-label="Save Changes"
                                >
                                    {saving ? (
                                        <span className={styles.spinner} />
                                    ) : (
                                        <span className={styles.actionGlyph}>✓</span>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className={styles.rawIconButton}
                                    onClick={() => bannerInputRef.current?.click()}
                                    disabled={bannerUploading}
                                    title="Change Banner"
                                    aria-label="Change Banner"
                                >
                                    {bannerUploading ? (
                                        <span className={styles.spinner} />
                                    ) : (
                                        <img src={changeIcon} className={styles.actionIcon} alt="Change banner" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className={styles.rawIconButton}
                                    onClick={() => setEditing(true)}
                                    title="Edit Profile"
                                    aria-label="Edit Profile"
                                >
                                    <span className={styles.actionGlyph}>✎</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* NAME BLOCK */}
                <div className={styles.nameBlock}>
                    <div className={styles.companyMeta}>
                        {profile.ai_industry && <span>{profile.ai_industry}</span>}
                        {profile.ai_industry && profile.ai_company_size && (
                            <span className={styles.metaDivider}>·</span>
                        )}
                        {profile.ai_company_size && <span>{profile.ai_company_size}</span>}
                    </div>
                    {saveMsg && (
                        <p className={`${styles.saveMsg} ${saveMsg.includes('failed') ? styles.saveMsgErr : ''}`}>
                            {saveMsg}
                        </p>
                    )}
                </div>

                {/* TWO-COLUMN BODY */}
                <div className={styles.profileBodyGrid}>

                    {/* MAIN COLUMN — AI-generated content, read-only */}
                    <div className={styles.mainCol}>

                        {profile.ai_company_overview && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Company Overview</div>
                                <div className={styles.bodyCardBody}>
                                    <p className={styles.summaryText}>{profile.ai_company_overview}</p>
                                </div>
                            </div>
                        )}

                        {hiringNeeds.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Hiring Needs</div>
                                <div className={styles.bodyCardBody}>
                                    <ul className={styles.bulletList}>
                                        {hiringNeeds.map((need, i) => (
                                            <li key={i} className={styles.bulletItem}>{need}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {talkingPoints.length > 0 && (
                            <div className={styles.bodyCard}>
                                <div className={styles.bodyCardTitle}>Talking Points</div>
                                <div className={styles.bodyCardBody}>
                                    <ul className={styles.bulletList}>
                                        {talkingPoints.map((point, i) => (
                                            <li key={i} className={styles.bulletItem}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SIDE COLUMN — editable company info */}
                    <div className={styles.sideCol}>
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Company Information</div>
                            <div className={styles.bodyCardBody}>
                                {editing ? (
                                    <div className={styles.fieldRow}>
                                        {[
                                            ['company_name', 'Company Name', 'e.g. Acme Corp'],
                                            ['website_url', 'Website', 'e.g. acmecorp.com'],
                                            ['phone', 'Phone', 'e.g. (603) 555-0100'],
                                            ['ai_industry', 'Industry', 'e.g. Public Accounting'],
                                            ['ai_company_size', 'Company Size', 'e.g. 50–200 employees'],
                                        ].map(([key, label, placeholder]) => (
                                            <div key={key} className={styles.fieldGroup}>
                                                <label className={styles.fieldLabel}>{label}</label>
                                                <input
                                                    className={styles.fieldInput}
                                                    value={form[key] || ''}
                                                    placeholder={placeholder}
                                                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.roGrid}>
                                        {[
                                            ['Company', profile.company_name],
                                            ['Website', profile.website_url],
                                            ['Phone', formatPhone(profile.phone)],
                                            ['Industry', profile.ai_industry],
                                            ['Size', profile.ai_company_size],
                                        ].map(([label, val]) => val ? (
                                            <div key={label} className={styles.roField}>
                                                <span className={styles.roLabel}>{label}</span>
                                                <span className={styles.roValue}>
                                                    {label === 'Website' ? (
                                                        <a
                                                            href={val.startsWith('http') ? val : `https://${val}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.detailLink}
                                                        >
                                                            {val.replace(/^https?:\/\//, '')} ↗
                                                        </a>
                                                    ) : val}
                                                </span>
                                            </div>
                                        ) : null)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile status card */}
                        <div className={styles.bodyCard}>
                            <div className={styles.bodyCardTitle}>Profile Status</div>
                            <div className={styles.bodyCardBody}>
                                <div className={styles.roGrid}>
                                    <div className={styles.roField}>
                                        <span className={styles.roLabel}>AI Brief</span>
                                        <span className={styles.roValue}>
                                            {profile.ai_company_overview ? '✓ Generated' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className={styles.roField}>
                                        <span className={styles.roLabel}>Logo</span>
                                        <span className={styles.roValue}>
                                            {profile.logo_url ? '✓ Uploaded' : (
                                                <button
                                                    className={styles.inlineUploadBtn}
                                                    onClick={() => logoInputRef.current?.click()}
                                                >
                                                    Upload logo
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                    <div className={styles.roField}>
                                        <span className={styles.roLabel}>Banner</span>
                                        <span className={styles.roValue}>
                                            {profile.banner_url ? '✓ Uploaded' : (
                                                <button
                                                    className={styles.inlineUploadBtn}
                                                    onClick={() => bannerInputRef.current?.click()}
                                                >
                                                    Upload banner
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                    <div className={styles.roField}>
                                        <span className={styles.roLabel}>Matching</span>
                                        <span className={styles.roValue}>
                                            {profile.embedded_at ? '✓ Active' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RYZE footer */}
                <div className={styles.profileFooter}>
                    <div className={styles.footerLeft}>
                        <span className={styles.footerBrand}>RYZE.ai</span>
                        <span className={styles.footerSep} />
                        <span className={styles.footerTagline}>Your Company Profile</span>
                    </div>
                </div>

            </main>
        </div>
    );
}