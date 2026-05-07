/* src/pages/EmployerProfile.jsx */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import styles from "./EmployerProfile.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const RELATIONSHIP_COLORS = {
    active: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    prospect: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    inactive: { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
    warm: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
};

const STATUS_COLORS = {
    open: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    filled: { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
    on_hold: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
};

function parseJsonList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function InfoRow({ label, value, href }) {
    if (!value) return null;
    return (
        <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{label}</span>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                    {value}
                </a>
            ) : (
                <span className={styles.infoValue}>{value}</span>
            )}
        </div>
    );
}

function Section({ title, children, className = "" }) {
    return (
        <div className={`${styles.section} ${className}`}>
            <div className={styles.sectionTitle}>{title}</div>
            <div className={styles.sectionBody}>{children}</div>
        </div>
    );
}

function JobOrderCard({ order }) {
    const statusStyle = STATUS_COLORS[order.status?.toLowerCase()] || STATUS_COLORS.open;
    const salary = order.salary_min && order.salary_max
        ? `$${(order.salary_min / 1000).toFixed(0)}K – $${(order.salary_max / 1000).toFixed(0)}K`
        : order.salary_min ? `From $${(order.salary_min / 1000).toFixed(0)}K` : null;

    return (
        <div className={styles.jobCard}>
            <div className={styles.jobCardMain}>
                <div className={styles.jobTitle}>{order.title}</div>
                <div className={styles.jobMeta}>
                    {order.location && <span>{order.location}</span>}
                    {order.location && salary && <span className={styles.metaDot}>·</span>}
                    {salary && <span>{salary}</span>}
                </div>
            </div>
            <span
                className={styles.jobStatusBadge}
                style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    borderColor: statusStyle.border,
                }}
            >
                {order.status === "on_hold" ? "On Hold" :
                    order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Open"}
            </span>
        </div>
    );
}

export default function EmployerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [profile, setProfile] = useState(null);
    const [jobOrders, setJobOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const logoInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [profileRes, ordersRes] = await Promise.all([
                    fetch(`${API_BASE}/api/employer-profiles/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/api/job-orders`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                if (!profileRes.ok) throw new Error("Employer not found");
                const profileData = await profileRes.json();
                setProfile(profileData);
                if (ordersRes.ok) {
                    const allOrders = await ordersRes.json();
                    setJobOrders(allOrders.filter(o => o.employer_profile_id === parseInt(id)));
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, token]);

    async function handleLogoUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${API_BASE}/api/employer-profiles/${id}/logo`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Logo upload failed");
            const data = await res.json();
            setProfile(prev => ({ ...prev, logo_url: data.logo_url }));
        } catch (err) {
            alert(err.message);
        } finally {
            setUploadingLogo(false);
            e.target.value = "";
        }
    }

    async function handleBannerUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingBanner(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${API_BASE}/api/employer-profiles/${id}/banner`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Banner upload failed");
            const data = await res.json();
            setProfile(prev => ({ ...prev, banner_url: data.banner_url }));
        } catch (err) {
            alert(err.message);
        } finally {
            setUploadingBanner(false);
            e.target.value = "";
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <AdminHeader active="employers" />
                <div className={styles.loadingState}>Loading profile…</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={styles.page}>
                <AdminHeader active="employers" />
                <div className={styles.errorState}>
                    <p>{error || "Employer not found."}</p>
                    <button onClick={() => navigate("/admin/employers")} className={styles.backBtn}>
                        ← Back to Employers
                    </button>
                </div>
            </div>
        );
    }

    const relStatus = profile.relationship_status?.toLowerCase();
    const relStyle = RELATIONSHIP_COLORS[relStatus] || RELATIONSHIP_COLORS.prospect;
    const relLabel = profile.relationship_status
        ? profile.relationship_status.charAt(0).toUpperCase() + profile.relationship_status.slice(1).toLowerCase()
        : null;

    const hiringNeeds = parseJsonList(profile.ai_hiring_needs);
    const talkingPoints = parseJsonList(profile.ai_talking_points);
    const companyInitial = profile.company_name?.charAt(0).toUpperCase();

    return (
        <div className={styles.page}>
            <AdminHeader active="employers" />

            {/* ── Banner ── */}
            <div
                className={styles.banner}
                style={profile.banner_url
                    ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : {}}
                onClick={() => bannerInputRef.current?.click()}
                title="Click to upload banner"
            >
                <div className={styles.bannerOverlay}>
                    {uploadingBanner ? "Uploading…" : "Click to change banner"}
                </div>
                <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={handleBannerUpload}
                />
            </div>

            {/* ── Identity Zone ── */}
            <div className={styles.identityZone}>
                <div className={styles.identityLeft}>
                    <div
                        className={styles.logoWrap}
                        onClick={() => logoInputRef.current?.click()}
                        title="Click to upload logo"
                    >
                        {profile.logo_url
                            ? <img src={profile.logo_url} alt={profile.company_name} className={styles.logoImg} />
                            : <div className={styles.logoInitial}>{companyInitial}</div>
                        }
                        <div className={styles.logoOverlay}>
                            {uploadingLogo ? "…" : "📷"}
                        </div>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            style={{ display: "none" }}
                            onChange={handleLogoUpload}
                        />
                    </div>
                    <div className={styles.identityInfo}>
                        <h1 className={styles.identityName}>{profile.company_name}</h1>
                        <div className={styles.companyMeta}>
                            {profile.ai_industry && <span>{profile.ai_industry}</span>}
                            {profile.ai_industry && profile.ai_company_size && (
                                <span className={styles.metaDot}>·</span>
                            )}
                            {profile.ai_company_size && <span>{profile.ai_company_size}</span>}
                        </div>
                    </div>
                </div>
                <div className={styles.identityActions}>
                    <button onClick={() => navigate(-1)} className={styles.rawIconButton} title="Back">
                        ← Back
                    </button>
                    <button
                        onClick={() => navigate(`/admin/employers?expand=${id}`)}
                        className={styles.rawIconButton}
                        title="Edit"
                    >
                        ✏ Edit
                    </button>
                </div>
            </div>

            {/* ── Badges row ── */}
            <div className={styles.badgeRow}>
                {relLabel && (
                    <span className={styles.relBadge} style={{
                        background: relStyle.bg, color: relStyle.color, borderColor: relStyle.border,
                    }}>
                        {relLabel}
                    </span>
                )}
                {jobOrders.length > 0 && (
                    <span className={styles.statBadge}>
                        {jobOrders.length} open role{jobOrders.length !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* ── Profile Body ── */}
            <div className={styles.profileBody}>
                <div className={styles.profileBodyInner}>

                    {/* ── Main Column ── */}
                    <div className={styles.mainCol}>
                        {profile.ai_company_overview && (
                            <Section title="Company Overview">
                                <p className={styles.overviewText}>{profile.ai_company_overview}</p>
                            </Section>
                        )}
                        {hiringNeeds.length > 0 && (
                            <Section title="Hiring Needs">
                                <ul className={styles.bulletList}>
                                    {hiringNeeds.map((need, i) => <li key={i}>{need}</li>)}
                                </ul>
                            </Section>
                        )}
                        {talkingPoints.length > 0 && (
                            <Section title="Key Talking Points">
                                <ul className={styles.talkingList}>
                                    {talkingPoints.map((pt, i) => (
                                        <li key={i}>
                                            <span className={styles.tpBullet}>→</span>
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        )}
                        {profile.ai_red_flags && (
                            <Section title="Red Flags" className={styles.redFlagSection}>
                                <div className={styles.redFlagContent}>
                                    <span className={styles.redFlagIcon}>⚠️</span>
                                    <p className={styles.redFlagText}>{profile.ai_red_flags}</p>
                                </div>
                            </Section>
                        )}
                        {profile.recruiter_notes && (
                            <Section title="Recruiter Notes" className={styles.notesSection}>
                                <div className={styles.notesInternalBadge}>Internal — not visible to employers</div>
                                <p className={styles.bodyText}>{profile.recruiter_notes}</p>
                            </Section>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className={styles.sideCol}>
                        <Section title="Contact">
                            <div className={styles.infoList}>
                                <InfoRow label="Email" value={profile.primary_contact_email} href={`mailto:${profile.primary_contact_email}`} />
                                <InfoRow label="Phone" value={profile.phone} />
                                <InfoRow
                                    label="Website"
                                    value={profile.website_url ? profile.website_url.replace(/^https?:\/\//, "") : null}
                                    href={profile.website_url?.startsWith("http") ? profile.website_url : profile.website_url ? `https://${profile.website_url}` : null}
                                />
                            </div>
                        </Section>
                        {jobOrders.length > 0 && (
                            <Section title={`Open Roles (${jobOrders.length})`}>
                                <div className={styles.jobList}>
                                    {jobOrders.map(order => <JobOrderCard key={order.id} order={order} />)}
                                </div>
                            </Section>
                        )}
                        <Section title="Profile Details">
                            <div className={styles.infoList}>
                                {profile.ai_brief_updated_at && (
                                    <InfoRow label="Brief" value={new Date(profile.ai_brief_updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                                )}
                                <InfoRow label="Added" value={new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                                <InfoRow label="AI Search" value={profile.embedded_at ? "✓ Indexed" : "Not indexed"} />
                            </div>
                        </Section>
                    </div>

                </div>
            </div>
        </div>
    );
}