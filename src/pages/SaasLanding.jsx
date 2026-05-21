/* src/pages/SaasLanding.jsx */
/* ══════════════════════════════════════════════════════════════
   RYZE.ai — SaaS Demo Landing Page
   Template for iteration alongside the demo video build.
   ══════════════════════════════════════════════════════════════ */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import styles from "./SaasLanding.module.css";

// ── Icons ────────────────────────────────────────────────────────
function IconArrow() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function IconPlay() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 7l5 3-5 3V7z" fill="currentColor" />
        </svg>
    );
}

// ── RyzeLogo ─────────────────────────────────────────────────────
function RyzeLogo({ size = 28, color = "#1e3a5f" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill={color} />
            <path d="M8 24V8h8a6 6 0 0 1 0 12h-2l5 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ══════════════════════════════════════════════════════════════
// SECTION DATA — edit these as your demo evolves
// ══════════════════════════════════════════════════════════════

// ── Hero ─────────────────────────────────────────────────────────
const HERO = {
    eyebrow: "AI-Powered Recruiting",
    headline: "The recruiting platform\nbuilt for the AI era.",
    subhead: "RYZE connects AI-fluent talent with the companies building tomorrow — powered by intelligent matching, not keyword filters.",
    ctaPrimary: "Request Access",
    ctaSecondary: "See how it works",
};

// ── Features — add / remove as you build the demo ────────────────
const FEATURES = [
    {
        icon: "🤖",
        title: "AI Candidate Matching",
        desc: "pgvector cosine similarity ranks candidates by real fit — not resume keywords.",
    },
    {
        icon: "💬",
        title: "RYZE Intelligence",
        desc: "Ask anything about your pipeline. Get answers in plain English, instantly.",
    },
    {
        icon: "📋",
        title: "Structured Job Orders",
        desc: "Paste any job posting and AI extracts the role, requirements, and salary range automatically.",
    },
    {
        icon: "🏢",
        title: "Employer Profiles",
        desc: "Branded company pages with banner images, AI-generated overviews, and open roles.",
    },
    {
        icon: "🔒",
        title: "Multi-Tenant Isolation",
        desc: "Every recruiting firm gets its own fully isolated data partition. Built-in from day one.",
    },
    {
        icon: "📄",
        title: "One-Click PDF Export",
        desc: "Branded candidate and employer profile PDFs. Recruiter-grade. Ready to send.",
    },
];

// ── Steps — how it works ─────────────────────────────────────────
const STEPS = [
    { num: "01", title: "Connect", desc: "A recruiter onboards their firm in minutes. Candidates and employers follow." },
    { num: "02", title: "Match", desc: "AI ranks candidates against open roles using semantic similarity, not filters." },
    { num: "03", title: "Place", desc: "Schedule calls, export profiles, and close roles — all in one place." },
];

// ── Social proof — update as you get real quotes ─────────────────
const TESTIMONIALS = [
    {
        quote: "Finally a recruiting tool that actually understands what we're looking for.",
        author: "Hiring Manager",
        role: "Series B AI Company",
    },
    {
        quote: "I placed a candidate in three days. The AI matching is genuinely different.",
        author: "Independent Recruiter",
        role: "Technical Recruiting",
    },
];

// ══════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════

export default function SaasLanding() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Redirect authenticated users to their dashboard
    useEffect(() => {
        if (user) {
            if (user.user_type === "ADMIN") navigate("/admin");
            else if (user.user_type === "EMPLOYER") navigate("/employer/dashboard");
            else navigate("/candidate/dashboard");
        }
    }, [user, navigate]);

    return (
        <div className={styles.page}>

            {/* ══════════════════════════════════════════════════
                NAV
            ══════════════════════════════════════════════════ */}
            <nav className={styles.nav}>
                <div className={styles.navInner}>
                    <a href="/" className={styles.navBrand}>
                        <RyzeLogo size={26} color="#1e3a5f" />
                        <span className={styles.navLogo}>
                            RYZE<span className={styles.navLogoAi}>.ai</span>
                        </span>
                    </a>

                    <div className={styles.navRight}>
                        <a href="/about" className={styles.navLink}>Build in Public</a>
                        <button className={styles.navLinkBtn} onClick={() => navigate("/auth")}>
                            Log in
                        </button>
                        <button className={styles.navCta} onClick={() => navigate("/auth")}>
                            Get access <IconArrow />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ══════════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════════ */}
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroEyebrow}>{HERO.eyebrow}</div>
                        <h1 className={styles.heroH1}>
                            {HERO.headline.split("\n").map((line, i) => (
                                <span key={i}>{line}{i === 0 && <br />}</span>
                            ))}
                        </h1>
                        <p className={styles.heroSub}>{HERO.subhead}</p>
                        <div className={styles.heroCtas}>
                            <button className={styles.ctaPrimary} onClick={() => navigate("/auth")}>
                                {HERO.ctaPrimary} <IconArrow />
                            </button>
                            <a href="#demo" className={styles.ctaSecondary}>
                                <IconPlay /> {HERO.ctaSecondary}
                            </a>
                        </div>
                    </div>

                    {/* ── Hero visual — swap for screenshot/mockup as demo evolves ── */}
                    <div className={styles.heroVisual}>
                        <div className={styles.heroCard}>
                            <div className={styles.heroCardHeader}>
                                <div className={styles.trafficLights}>
                                    <span style={{ background: "#ff5f57" }} />
                                    <span style={{ background: "#febc2e" }} />
                                    <span style={{ background: "#28c840" }} />
                                </div>
                                <span className={styles.heroCardTitle}>RYZE Intelligence</span>
                            </div>
                            <div className={styles.heroCardBody}>
                                <div className={styles.chatMsg}>
                                    <span className={styles.chatLabel}>You</span>
                                    <div className={styles.chatBubbleUser}>
                                        Who are the top candidates for our Senior ML Engineer role?
                                    </div>
                                </div>
                                <div className={styles.chatMsg}>
                                    <span className={styles.chatLabel}>RYZE</span>
                                    <div className={styles.chatBubbleAi}>
                                        Based on semantic match scores, your top 3 candidates are Jordan Kim (94%), Alex Chen (91%), and Marcus Webb (88%). All three have production LLM experience and are open to remote.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                DEMO VIDEO SECTION
                — Replace placeholder with actual embed as you build
            ══════════════════════════════════════════════════ */}
            <section className={styles.demoSection} id="demo">
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>See it in action</div>
                    <h2 className={styles.sectionH2}>Watch the platform in 3 minutes.</h2>
                    <p className={styles.sectionSub}>
                        From candidate upload to AI match to placed hire — the full workflow, live.
                    </p>

                    {/* ── VIDEO PLACEHOLDER — replace src with real embed URL ── */}
                    <div className={styles.videoWrap}>
                        <div className={styles.videoPlaceholder}>
                            <div className={styles.videoPlayBtn}>
                                <IconPlay />
                            </div>
                            <p className={styles.videoPlaceholderText}>Demo video coming soon</p>
                        </div>
                        {/* UNCOMMENT when you have a real embed:
                        <iframe
                            src="https://www.loom.com/embed/YOUR_VIDEO_ID"
                            frameBorder="0"
                            allowFullScreen
                            className={styles.videoEmbed}
                            title="RYZE.ai Demo"
                        />
                        */}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                FEATURES
            ══════════════════════════════════════════════════ */}
            <section className={styles.features}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>The platform</div>
                    <h2 className={styles.sectionH2}>Built for quality matches, not volume.</h2>
                    <div className={styles.featureGrid}>
                        {FEATURES.map((f) => (
                            <div key={f.title} className={styles.featureCard}>
                                <div className={styles.featureIcon}>{f.icon}</div>
                                <h3 className={styles.featureTitle}>{f.title}</h3>
                                <p className={styles.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════════════════ */}
            <section className={styles.howItWorks}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>How it works</div>
                    <h2 className={styles.sectionH2}>Simple by design.</h2>
                    <div className={styles.stepsRow}>
                        {STEPS.map((s, i) => (
                            <div key={s.num} className={styles.step}>
                                {i < STEPS.length - 1 && <div className={styles.stepConnector} />}
                                <div className={styles.stepNum}>{s.num}</div>
                                <h3 className={styles.stepTitle}>{s.title}</h3>
                                <p className={styles.stepDesc}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                SOCIAL PROOF
                — Placeholder quotes; replace with real ones as you get them
            ══════════════════════════════════════════════════ */}
            <section className={styles.testimonials}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>Early feedback</div>
                    <div className={styles.testimonialsGrid}>
                        {TESTIMONIALS.map((t) => (
                            <div key={t.author} className={styles.testimonialCard}>
                                <p className={styles.testimonialQuote}>"{t.quote}"</p>
                                <div className={styles.testimonialAuthor}>
                                    <span className={styles.testimonialName}>{t.author}</span>
                                    <span className={styles.testimonialRole}>{t.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                CTA BAND
            ══════════════════════════════════════════════════ */}
            <section className={styles.ctaBand}>
                <div className={styles.ctaBandInner}>
                    <h2 className={styles.ctaBandH2}>Ready to find your match?</h2>
                    <p className={styles.ctaBandSub}>
                        Whether you build with AI or need someone who does — RYZE is where that connection happens.
                    </p>
                    <button className={styles.ctaBandBtn} onClick={() => navigate("/auth")}>
                        Request access <IconArrow />
                    </button>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════════════ */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <RyzeLogo size={18} color="#1e3a5f" />
                        <span className={styles.footerLogo}>
                            RYZE<span className={styles.footerLogoAi}>.ai</span>
                        </span>
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