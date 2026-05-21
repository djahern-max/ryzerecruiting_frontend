/* src/pages/SaasLanding.jsx */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import styles from './SaasLanding.module.css';

// ── Simple inline SVG icons (no icon library dependency) ──────────
function IconBrain() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 3a5 5 0 0 0-5 5c0 1.5.6 2.8 1.6 3.8A4 4 0 0 0 8 19h8a4 4 0 0 0 2.4-7.2A5 5 0 0 0 9 3z" />
            <line x1="12" y1="10" x2="12" y2="19" />
            <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
    );
}

function IconCalendar() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function IconUsers() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function IconZap() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}

function IconArrow() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

function IconLinkedIn() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.999 23.227 23.999 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

// ── Two-sided value props ─────────────────────────────────────────
const SIDES = [
    {
        label: 'For Talent',
        icon: <IconBrain />,
        title: 'Showcase what you actually build.',
        desc: "A profile that goes beyond a resume. Show your AI tools, automation work, and the real outcomes you've delivered — and get matched with companies that are ready to move.",
    },
    {
        label: 'For Companies',
        icon: <IconZap />,
        title: 'Find people who can actually do it.',
        desc: "Stop sorting through generalists. Every person on RYZE has been vetted for hands-on AI and automation capability. Book a call, see their work, and know exactly what you're getting.",
    },
];

// ── Platform features ─────────────────────────────────────────────
const FEATURES = [
    {
        icon: <IconBrain />,
        title: 'AI-Powered Matching',
        desc: 'Profiles are embedded and ranked by fit — not keyword overlap. The right talent surfaces for the right company.',
    },
    {
        icon: <IconCalendar />,
        title: 'Frictionless Booking',
        desc: 'Book directly from a profile. Zoom links generate automatically. No back-and-forth.',
    },
    {
        icon: <IconUsers />,
        title: 'Curated, Invite-Only',
        desc: 'Quality over volume. Every talent profile on RYZE is vetted. Companies know exactly who they\'re talking to.',
    },
    {
        icon: <IconZap />,
        title: 'Intelligence Briefs',
        desc: 'AI-generated pre-call briefs give both sides context before the conversation starts.',
    },
];

// ── Steps ─────────────────────────────────────────────────────────
const STEPS = [
    {
        num: '01',
        title: 'Request access',
        desc: 'RYZE is invite-only. Tell us whether you\'re talent or a company and we\'ll get you set up.',
    },
    {
        num: '02',
        title: 'Build your profile',
        desc: 'Talent: show your tools, your work, your outcomes. Companies: tell us what you\'re trying to solve.',
    },
    {
        num: '03',
        title: 'Get matched',
        desc: 'AI surfaces the right fit. You review, book a call, and take it from there.',
    },
];

// ─────────────────────────────────────────────────────────────────
export default function SaasLanding() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    // Redirect authenticated users to their dashboard
    useEffect(() => {
        if (!loading && user) {
            if (user.user_type === 'ADMIN') navigate('/admin', { replace: true });
            else if (user.user_type === 'EMPLOYER') navigate('/employer/dashboard', { replace: true });
            else if (user.user_type === 'CANDIDATE') navigate('/candidate/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) return null;

    return (
        <div className={styles.page}>

            {/* ── Nav ───────────────────────────────────────────── */}
            <header className={styles.nav}>
                <div className={styles.navInner}>
                    <div className={styles.navBrand}>
                        <span className={styles.navLogo}>RYZE<span className={styles.navLogoAi}>.ai</span></span>
                        <span className={styles.navTagline}>AI Talent Matching</span>
                    </div>
                    <div className={styles.navRight}>
                        <a
                            href="https://www.linkedin.com/in/daneahern/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.navLink}
                        >
                            <IconLinkedIn /> Follow the build
                        </a>
                        <button className={styles.navCta} onClick={() => navigate('/auth')}>
                            Sign in
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Hero ──────────────────────────────────────────── */}
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroBadge}>
                        <span className={styles.heroBadgeDot} />
                        Invite only · Built in public
                    </div>
                    <h1 className={styles.heroH1}>
                        The people who know how to use AI —<br />
                        <span className={styles.heroAccent}>matched to the businesses that need them.</span>
                    </h1>
                    <p className={styles.heroSub}>
                        RYZE connects vetted AI practitioners and builders with companies
                        that are ready to move — but don't know where to start.
                    </p>
                    <div className={styles.heroCtas}>
                        <button className={styles.ctaPrimary} onClick={() => navigate('/auth')}>
                            Request access <IconArrow />
                        </button>
                        <a href="/about" className={styles.ctaSecondary}>
                            Watch the build
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Two sides ─────────────────────────────────────── */}
            <section className={styles.twoSides}>
                <div className={styles.sectionInner}>
                    <div className={styles.sidesGrid}>
                        {SIDES.map(s => (
                            <div key={s.label} className={styles.sideCard}>
                                <div className={styles.sideLabel}>{s.label}</div>
                                <div className={styles.sideIcon}>{s.icon}</div>
                                <h3 className={styles.sideTitle}>{s.title}</h3>
                                <p className={styles.sideDesc}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────── */}
            <section className={styles.features}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>The platform</div>
                    <h2 className={styles.sectionH2}>Built for quality matches, not volume.</h2>
                    <div className={styles.featureGrid}>
                        {FEATURES.map(f => (
                            <div key={f.title} className={styles.featureCard}>
                                <div className={styles.featureIcon}>{f.icon}</div>
                                <h3 className={styles.featureTitle}>{f.title}</h3>
                                <p className={styles.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ──────────────────────────────────── */}
            <section className={styles.howItWorks}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>How it works</div>
                    <h2 className={styles.sectionH2}>Simple by design.</h2>
                    <div className={styles.stepsRow}>
                        {STEPS.map((s) => (
                            <div key={s.num} className={styles.step}>
                                <div className={styles.stepNum}>{s.num}</div>
                                <h3 className={styles.stepTitle}>{s.title}</h3>
                                <p className={styles.stepDesc}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA band ──────────────────────────────────────── */}
            <section className={styles.ctaBand}>
                <div className={styles.ctaBandInner}>
                    <h2 className={styles.ctaBandH2}>Ready to find your match?</h2>
                    <p className={styles.ctaBandSub}>
                        Whether you build with AI or need someone who does — RYZE is where that connection happens.
                    </p>
                    <button className={styles.ctaBandBtn} onClick={() => navigate('/auth')}>
                        Request access <IconArrow />
                    </button>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <span className={styles.footerLogo}>RYZE<span className={styles.footerLogoAi}>.ai</span></span>
                        <span className={styles.footerCopy}>© 2026 RYZE GROUP, Inc.</span>
                    </div>
                    <div className={styles.footerLinks}>
                        <a href="/about">Build in Public</a>
                        <a href="/privacy">Privacy</a>
                        <a href="/terms">Terms</a>
                        <a href="https://www.linkedin.com/in/daneahern/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                </div>
                <a href="/admin/login" className={styles.adminGhost}>Admin</a>
            </footer>

        </div>
    );
}