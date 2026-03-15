/* src/pages/ChatPage.jsx */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./ChatPage.module.css";
import ReactMarkdown from 'react-markdown';
import RyzeLogo from "../assets/RYZE_LOGO.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function CandidateCard({ candidate }) {
    return (
        <div className={styles.candidateCard}>
            <div className={styles.cardHeader}>
                <div className={styles.cardName}>{candidate.name}</div>
                {candidate.score && (
                    <span className={styles.cardScore}>
                        {Math.round(candidate.score * 100)}% match
                    </span>
                )}
            </div>
            <div className={styles.cardMeta}>
                {candidate.current_title && <span>{candidate.current_title}</span>}
                {candidate.current_company && <span className={styles.cardDot}>·</span>}
                {candidate.current_company && <span>{candidate.current_company}</span>}
            </div>
            {candidate.location && (
                <div className={styles.cardLocation}>📍 {candidate.location}</div>
            )}
            <div className={styles.cardTags}>
                {candidate.ai_career_level && (
                    <span className={styles.tagLevel}>{candidate.ai_career_level}</span>
                )}
                {candidate.ai_certifications && (
                    <span className={styles.tagCert}>{candidate.ai_certifications}</span>
                )}
                {candidate.ai_years_experience && (
                    <span className={styles.tagYears}>{candidate.ai_years_experience} yrs exp</span>
                )}
            </div>
            {candidate.ai_summary && (
                <div className={styles.cardSummary}>{candidate.ai_summary}</div>
            )}
        </div>
    );
}

function MeetingCard({ meeting }) {
    const statusColors = {
        confirmed: { bg: "#dcfce7", color: "#15803d", label: "Confirmed" },
        pending: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
        cancelled: { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled" },
    };
    const s = statusColors[meeting.status] || statusColors.pending;

    return (
        <div className={styles.meetingCard}>
            <div className={styles.meetingCardLeft}>
                <div className={styles.cardName}>{meeting.employer_name || "Unknown"}</div>
                {meeting.company_name && (
                    <div className={styles.cardMeta}>{meeting.company_name}</div>
                )}
                <div className={styles.meetingTime}>
                    📅 {meeting.date} at {meeting.time_slot} EST
                </div>
            </div>
            <div className={styles.meetingCardRight}>
                <span className={styles.meetingStatus} style={{ background: s.bg, color: s.color }}>
                    {s.label}
                </span>
                {meeting.meeting_url && meeting.status === "confirmed" && (
                    <a
                        href={meeting.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.zoomLink}
                    >
                        Join Zoom →
                    </a>
                )}
            </div>
        </div>
    );
}

function MessageBubble({ message }) {
    const isUser = message.role === "user";

    return (
        <div className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAI}`}>
            {!isUser && (
                <div className={styles.aiAvatar}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 375" width="18" height="18">
                        <path fill="#ffffff" d="M 186.078125 19.484375 L 0.367188 341.148438 L 180.234375 341.148438 L 229.054688 256.585938 L 201.605469 215.015625 L 190.46875 234.308594 L 154.511719 296.59375 L 77.539062 296.59375 L 186.394531 108.039062 L 296.730469 295.972656 L 243.730469 295.972656 L 221.453125 340.527344 L 374.554688 340.527344 Z" />
                    </svg>
                </div>
            )}
            <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAI}`}>
                {isUser ? (
                    <p className={styles.bubbleText}>{message.content}</p>
                ) : (
                    <>
                        <div className={styles.bubbleText}>
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        {message.candidates?.length > 0 && (
                            <div className={styles.inlineCards}>
                                <div className={styles.inlineCardsLabel}>
                                    {message.candidates.length} candidate{message.candidates.length !== 1 ? "s" : ""} found
                                </div>
                                {message.candidates.map((c) => (
                                    <CandidateCard key={c.id} candidate={c} />
                                ))}
                            </div>
                        )}
                        {message.meetings?.length > 0 && (
                            <div className={styles.inlineCards}>
                                <div className={styles.inlineCardsLabel}>
                                    {message.meetings.length} meeting{message.meetings.length !== 1 ? "s" : ""}
                                </div>
                                {message.meetings.map((m) => (
                                    <MeetingCard key={m.id} meeting={m} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className={`${styles.messageRow} ${styles.messageRowAI}`}>
            <div className={styles.aiAvatar}>
                <div className={styles.aiAvatar}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 375" width="18" height="18">
                        <path fill="#ffffff" d="M 186.078125 19.484375 L 0.367188 341.148438 L 180.234375 341.148438 L 229.054688 256.585938 L 201.605469 215.015625 L 190.46875 234.308594 L 154.511719 296.59375 L 77.539062 296.59375 L 186.394531 108.039062 L 296.730469 295.972656 L 243.730469 295.972656 L 221.453125 340.527344 L 374.554688 340.527344 Z" />
                    </svg>
                </div>
            </div>
            <div className={`${styles.bubble} ${styles.bubbleAI}`}>
                <p className={styles.thinkingLabel}>Searching your database...</p>
                <div className={styles.typingBubbleInner}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>
            </div>
        </div>
    );
}

export default function ChatPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const token = localStorage.getItem("token");

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function sendMessage(text) {
        const userMessage = text.trim();
        if (!userMessage || loading) return;

        setInput("");
        setError(null);

        const userMsg = { role: "user", content: userMessage };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setLoading(true);

        try {
            const history = messages.map((m) => ({ role: m.role, content: m.content }));

            const res = await fetch(`${API_BASE}/api/chat`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMessage, history }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || "Chat request failed");
            }

            const data = await res.json();

            const aiMsg = {
                role: "assistant",
                content: data.response,
                candidates: data.candidates,
                employers: data.employers,
                meetings: data.meetings,
                job_orders: data.job_orders,
            };

            setMessages([...newMessages, aiMsg]);
        } catch (e) {
            setError(e.message);
            setMessages(messages);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <span className={styles.logo}>RYZE.ai</span>
                        <span className={styles.adminBadge}>ADMIN</span>
                    </div>
                    <nav className={styles.nav}>
                        <button className={styles.navBtn} onClick={() => navigate("/admin")}>Dashboard</button>
                        <button className={styles.navBtn} onClick={() => navigate("/admin/employers")}>Employers</button>
                        <button className={styles.navBtn} onClick={() => navigate("/admin/candidates")}>Candidates</button>
                        <button className={`${styles.navBtn} ${styles.navBtnActive}`}>Intelligence</button>
                    </nav>
                    <div className={styles.headerRight}>
                        <span className={styles.userName}>{user?.full_name || user?.email}</span>
                        <button className={styles.logoutButton} onClick={logout}>
                            <i className="fi fi-rr-sign-out-alt" />
                        </button>
                    </div>
                </div>
            </header>

            <div className={styles.chatLayout}>
                <main className={styles.chatMain}>
                    {messages.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 375" width="80" height="80">
                                    <path fill="#004aad" d="M 186.078125 19.484375 L 0.367188 341.148438 L 180.234375 341.148438 L 229.054688 256.585938 L 201.605469 215.015625 L 190.46875 234.308594 L 154.511719 296.59375 L 77.539062 296.59375 L 186.394531 108.039062 L 296.730469 295.972656 L 243.730469 295.972656 L 221.453125 340.527344 L 374.554688 340.527344 Z" />
                                </svg>
                            </div>
                            <h2 className={styles.emptyTitle}>RYZE Intelligence</h2>
                            <p className={styles.emptySub}>
                                Ask anything about your candidates, employers, or schedule.
                                Your entire recruiting database, in plain English.
                            </p>

                        </div>
                    )}

                    <div className={styles.thread}>
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} message={msg} />
                        ))}
                        {loading && <TypingIndicator />}
                        <div ref={bottomRef} />
                    </div>
                </main>

                <div className={styles.inputBar}>
                    {error && <div className={styles.errorBanner}>{error}</div>}
                    <div className={styles.inputWrapper}>
                        <textarea
                            ref={inputRef}
                            className={styles.input}
                            placeholder="Ask about candidates, meetings, employers..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={() => sendMessage(input)}
                            disabled={loading || !input.trim()}
                        >
                            {loading ? <span className={styles.spinner} /> : "↑"}
                        </button>
                    </div>
                    <p className={styles.inputHint}>Press Enter to send · Shift+Enter for new line</p>
                </div>
            </div>
        </div>
    );
}