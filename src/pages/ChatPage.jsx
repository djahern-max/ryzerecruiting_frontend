/* src/pages/ChatPage.jsx */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./ChatPage.module.css";
import ReactMarkdown from "react-markdown";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Inline result cards
// ---------------------------------------------------------------------------

function CandidateCard({ candidate }) {
    return (
        <div className={styles.candidateCard}>
            <div className={styles.cardHeader}>
                <div className={styles.cardName}>{candidate.name}</div>
                {candidate.score != null && (
                    <span className={styles.cardScore}>{Math.round(candidate.score * 100)}% match</span>
                )}
                {candidate.match_score != null && (
                    <span className={styles.cardScore}>{candidate.match_score}% match</span>
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
                    <span className={styles.tagYears}>{candidate.ai_years_experience} yrs</span>
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
                    <a href={meeting.meeting_url} target="_blank" rel="noopener noreferrer" className={styles.zoomLink}>
                        Join Zoom →
                    </a>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------

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
                        {/* Streaming cursor */}
                        {message.streaming && (
                            <span className={styles.streamCursor}>▋</span>
                        )}
                        {/* Inline result cards */}
                        {message.candidates?.length > 0 && (
                            <div className={styles.inlineCards}>
                                <div className={styles.inlineCardsLabel}>
                                    {message.candidates.length} candidate{message.candidates.length !== 1 ? "s" : ""}
                                </div>
                                {message.candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)}
                            </div>
                        )}
                        {message.meetings?.length > 0 && (
                            <div className={styles.inlineCards}>
                                <div className={styles.inlineCardsLabel}>
                                    {message.meetings.length} meeting{message.meetings.length !== 1 ? "s" : ""}
                                </div>
                                {message.meetings.map((m) => <MeetingCard key={m.id} meeting={m} />)}
                            </div>
                        )}
                        {message.employers?.length > 0 && (
                            <div className={styles.inlineCards}>
                                <div className={styles.inlineCardsLabel}>
                                    {message.employers.length} employer{message.employers.length !== 1 ? "s" : ""}
                                </div>
                                {message.employers.map((e) => (
                                    <div key={e.id} className={styles.candidateCard}>
                                        <div className={styles.cardName}>{e.company_name}</div>
                                        {e.industry && <div className={styles.cardMeta}>{e.industry}</div>}
                                    </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 375" width="18" height="18">
                    <path fill="#ffffff" d="M 186.078125 19.484375 L 0.367188 341.148438 L 180.234375 341.148438 L 229.054688 256.585938 L 201.605469 215.015625 L 190.46875 234.308594 L 154.511719 296.59375 L 77.539062 296.59375 L 186.394531 108.039062 L 296.730469 295.972656 L 243.730469 295.972656 L 221.453125 340.527344 L 374.554688 340.527344 Z" />
                </svg>
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ChatPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const token = localStorage.getItem("token");

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);  // tool-call phase
    const [streaming, setStreaming] = useState(false);  // text streaming phase
    const [error, setError] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, streaming]);

    async function sendMessage(text) {
        const userMessage = text.trim();
        if (!userMessage || loading || streaming) return;

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

            // ── Start reading the stream ──────────────────────────────────
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            // Add empty AI message — we'll fill it in as tokens arrive
            const aiMsgIndex = newMessages.length;
            const aiMsg = { role: "assistant", content: "", streaming: true };
            setMessages([...newMessages, aiMsg]);
            setLoading(false);
            setStreaming(true);

            let buffer = "";
            let fullText = "";
            let structuredData = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Check if the __DATA__ sentinel has arrived
                const dataMarker = "\n__DATA__\n";
                const markerIdx = buffer.indexOf(dataMarker);

                if (markerIdx !== -1) {
                    // Everything before the marker is text
                    fullText += buffer.slice(0, markerIdx);
                    // Everything after is the JSON payload
                    const jsonStr = buffer.slice(markerIdx + dataMarker.length);
                    try {
                        structuredData = JSON.parse(jsonStr);
                    } catch (e) {
                        logger.error?.("Failed to parse structured data", e);
                    }
                    buffer = "";
                } else {
                    // No marker yet — flush everything except the last few chars
                    // (in case the marker is split across chunks)
                    const safeLen = Math.max(0, buffer.length - dataMarker.length);
                    fullText += buffer.slice(0, safeLen);
                    buffer = buffer.slice(safeLen);
                }

                // Update the message bubble in real time
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[aiMsgIndex + 1] = {
                        ...updated[aiMsgIndex + 1],
                        content: fullText,
                        streaming: true,
                    };
                    return updated;
                });
            }

            // ── Stream complete — finalize message ────────────────────────
            setMessages((prev) => {
                const updated = [...prev];
                updated[aiMsgIndex + 1] = {
                    role: "assistant",
                    content: fullText,
                    streaming: false,
                    candidates: structuredData?.candidates || null,
                    employers: structuredData?.employers || null,
                    meetings: structuredData?.meetings || null,
                    job_orders: structuredData?.job_orders || null,
                };
                return updated;
            });

        } catch (e) {
            setError(e.message);
            setMessages(newMessages);
        } finally {
            setLoading(false);
            setStreaming(false);
            inputRef.current?.focus();
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    const isActive = loading || streaming;

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
                            disabled={isActive}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={() => sendMessage(input)}
                            disabled={isActive || !input.trim()}
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