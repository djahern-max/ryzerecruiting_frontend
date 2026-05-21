/* src/pages/SaasLanding.jsx */
/* ══════════════════════════════════════════════════════════════
   RYZE.ai — SaaS Demo Landing Page
   General Recruiting Focus (AI-Native ATS & CRM)
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
// SECTION DATA 
// ══════════════════════════════════════════════════════════════

const HERO = {
    eyebrow: "The New Standard in Recruiting",
    headline: "Stop Parsing.\nStart Placing.",
    subhead: "RYZE.ai is the AI-native ATS and CRM that reads resumes, takes your meeting notes, and surfaces your perfect candidates automatically. Build relationships, let the AI handle the data entry.",
    ctaPrimary: "Get Early Access",
    ctaSecondary: "See how it works",
};

const FEATURES = [
    {
        icon: "📄",
        title: "Autonomous Data Parsing",
        desc: "Stop manual data entry. Upload a resume or paste a job description, and RYZE automatically extracts skills, calculates experience, and generates recruiter-ready summaries.",
    },
    {
        icon: "🎯",
        title: "Semantic Matching",
        desc: "Boolean search is dead. Ask for what you want using natural language. Our vector search understands context and mathematically ranks your best-fit candidates.",
    },
    {
        icon: "📹",
        title: "Meeting Intelligence",
        desc: "Be fully present. RYZE tracks your calendar, ingests Zoom transcripts, and automatically generates summaries and action items so your database is always up-to-date.",
    },
    {
        icon: "🧠",
        title: "Agentic Chat Assistant",
        desc: "Talk to your database. Ask RYZE Intelligence questions like 'Who am I calling today?' and get immediate, actionable answers directly from your live pipeline.",
    },
];

const STEPS = [
    { num: "01", title: "Capture", desc: "Sync your calendar and upload resumes. RYZE instantly structures the unstructured data." },
    { num: "02", title: "Command", desc: "Use natural language to search, match, and organize your candidates and employer prospects." },
    { num: "03", title: "Connect", desc: "Spend the hours you saved on data entry doing what actually matters: building relationships." },
];

const PORTALS = [
    {
        title: "For Recruiters",
        desc: "The ultimate command center and AI assistant to manage your entire desk.",
    },
    {
        title: "For Clients",
        desc: "A dedicated dashboard to manage company profiles, view active job orders, and collaborate.",
    },
    {
        title: "For Candidates",
        desc: "A private portal to manage their profile, upload fresh resumes, and stay in the loop.",
    }
];

const TESTIMONIALS = [
    {
        quote: "Finally a recruiting tool that actually understands what we're looking for.",
        author: "Hiring Manager",
        role: "Series B Tech Company",
    },
    {
        quote: "I placed a candidate in three days. The AI matching is genuinely different.",
        author: "Independent Recruiter",
        role: "Agency Owner",
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
                                        Who are the top candidates for our Senior Developer role?
                                    </div>
                                </div>
                                <div className={styles.chatMsg}>
                                    <span className={styles.chatLabel}>RYZE</span>
                                    <div className={styles.chatBubbleAi}>
                                        Based on semantic match scores, your top 3 candidates are Jordan Kim (94%), Alex Chen (91%), and Marcus Webb (88%). All three have startup experience and are open to remote.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                THE PROBLEM
            ══════════════════════════════════════════════════ */}
            <section className={styles.problemSection}>
                <div className={styles.sectionInner}>
                    <div className={styles.problemContent}>
                        <div className={styles.sectionLabel}>The Problem</div>
                        <h2 className={styles.sectionH2}>The old way of recruiting is broken.</h2>
                        <p className={styles.sectionSub} style={{ margin: 0 }}>
                            Traditional ATS platforms are just digital filing cabinets. You spend hours reading resumes, tagging skills, copying Zoom notes, and running endless boolean searches just to find a candidate you already spoke to six months ago.
                        </p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                FEATURES (The Solution)
            ══════════════════════════════════════════════════ */}
            <section className={styles.features}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>The Solution</div>
                    <h2 className={styles.sectionH2}>Meet your new AI recruiting assistant.</h2>
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
                    <div className={styles.sectionLabel}>Workflow</div>
                    <h2 className={styles.sectionH2}>Seamless workflow from intake to placement.</h2>
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
                DEMO VIDEO SECTION
            ══════════════════════════════════════════════════ */}
            <section className={styles.demoSection} id="demo">
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>See it in action</div>
                    <h2 className={styles.sectionH2}>Watch the platform in 3 minutes.</h2>
                    <p className={styles.sectionSub}>
                        From candidate upload to AI match to placed hire — the full workflow, live.
                    </p>

                    <div className={styles.videoWrap}>
                        <div className={styles.videoPlaceholder}>
                            <div className={styles.videoPlayBtn}>
                                <IconPlay />
                            </div>
                            <p className={styles.videoPlaceholderText}>Demo video coming soon</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                PORTALS
            ══════════════════════════════════════════════════ */}
            <section className={styles.portals}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>Portals</div>
                    <h2 className={styles.sectionH2}>Built for the whole team.</h2>
                    <p className={styles.sectionSub}>RYZE features strict, multi-tenant portals designed to keep everyone aligned.</p>

                    <div className={styles.portalGrid}>
                        {PORTALS.map((p) => (
                            <div key={p.title} className={styles.portalCard}>
                                <h3 className={styles.portalTitle}>{p.title}</h3>
                                <p className={styles.portalDesc}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                SOCIAL PROOF
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
                    <h2 className={styles.ctaBandH2}>Ready to elevate your recruiting?</h2>
                    <p className={styles.ctaBandSub}>
                        Join the modern recruiters using RYZE.ai to automate the busywork and close more roles.
                    </p>
                    <button className={styles.ctaBandBtn} onClick={() => navigate("/auth")}>
                        Start Your Free Trial Today <IconArrow />
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