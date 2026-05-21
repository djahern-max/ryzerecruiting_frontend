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

function IconFileText() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
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

// ── Feature card data ─────────────────────────────────────────────
const FEATURES = [
    {
        icon: <IconBrain />,
        title: 'AI-Powered Matching',
        desc: 'pgvector cosine similarity surfaces the right candidates for every open role — ranked by fit, not recency.',
    },
    {
        icon: <IconCalendar />,
        title: 'Automated Booking',
        desc: 'Candidates and employers book directly. Zoom links generate automatically. No back-and-forth.',
    },
    {
        icon: <IconUsers />,
        title: 'Intelligence Briefs',
        desc: 'Walk into every call prepared. AI pre-call briefs pull company intel from the web before you pick up the phone.',
    },
    {
        icon: <IconFileText />,
        title: 'Branded PDF Exports',
        desc: 'One-click recruiter-grade candidate profiles and employer briefs — ready to send to any hiring manager.',
    },
];

// ── Steps ─────────────────────────────────────────────────────────
const STEPS = [
    { num: '01', title: 'Onboard your firm', desc: 'Your team gets its own tenant. Data stays isolated. Billing starts on a 30-day trial.' },
    { num: '02', title: 'Build your pipeline', desc: 'Add candidates and employers. AI embeds profiles automatically — no manual tagging.' },
    { num: '03', title: 'Let RYZE work', desc: 'Matches surface, briefs generate, calls get booked. You focus on the conversation.' },
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
                        <span className={styles.navTagline}>Accounting &amp; Finance Recruiting</span>
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
                        Built in public · EP23
                    </div>
                    <h1 className={styles.heroH1}>
                        The recruiting platform<br />
                        <span className={styles.heroAccent}>built for accounting &amp; finance.</span>
                    </h1>
                    <p className={styles.heroSub}>
                        AI matching, automated booking, and intelligence briefs — purpose-built for recruiters
                        who place accounting and finance professionals.
                    </p>
                    <div className={styles.heroCtas}>
                        <button className={styles.ctaPrimary} onClick={() => navigate('/auth')}>
                            Get started <IconArrow />
                        </button>
                        <a
                            href="/about"
                            className={styles.ctaSecondary}
                        >
                            Watch the build
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────── */}
            <section className={styles.features}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>What RYZE does</div>
                    <h2 className={styles.sectionH2}>Everything a recruiting firm needs — nothing it doesn't.</h2>
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
                    <h2 className={styles.sectionH2}>Up and running in minutes.</h2>
                    <div className={styles.stepsRow}>
                        {STEPS.map((s, i) => (
                            <div key={s.num} className={styles.step}>
                                <div className={styles.stepNum}>{s.num}</div>
                                <h3 className={styles.stepTitle}>{s.title}</h3>
                                <p className={styles.stepDesc}>{s.desc}</p>
                                {i < STEPS.length - 1 && <div className={styles.stepConnector} />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA band ──────────────────────────────────────── */}
            <section className={styles.ctaBand}>
                <div className={styles.ctaBandInner}>
                    <h2 className={styles.ctaBandH2}>Ready to run a smarter desk?</h2>
                    <p className={styles.ctaBandSub}>Request access and get started in under five minutes.</p>
                    <button className={styles.ctaBandBtn} onClick={() => navigate('/auth')}>
                        Get access <IconArrow />
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