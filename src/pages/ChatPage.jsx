/* src/pages/ChatPage.jsx */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./ChatPage.module.css";
import AdminHeader from '../components/AdminHeader';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const KEYFRAMES = `@keyframes ryze-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }`;
if (typeof document !== "undefined" && !document.getElementById("ryze-chat-keyframes")) {
    const s = document.createElement("style");
    s.id = "ryze-chat-keyframes";
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupSessionsByDate(sessions) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = { Today: [], Yesterday: [], "This Week": [], Older: [] };
    for (const s of sessions) {
        const d = new Date(s.updated_at);
        const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (day >= today) groups["Today"].push(s);
        else if (day >= yesterday) groups["Yesterday"].push(s);
        else if (day >= weekAgo) groups["This Week"].push(s);
        else groups["Older"].push(s);
    }
    return groups;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function ChatSidebar({ sessions, activeSessionId, onNewChat, onSelectSession, onDeleteSession }) {
    const groups = groupSessionsByDate(sessions);
    const groupOrder = ["Today", "Yesterday", "This Week", "Older"];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <button className={styles.newChatBtn} onClick={onNewChat}>
                    <span>+</span> New Chat
                </button>
            </div>
            <div className={styles.sessionList}>
                {groupOrder.map((group) => {
                    const items = groups[group];
                    if (!items.length) return null;
                    return (
                        <div key={group} className={styles.sessionGroup}>
                            <div className={styles.sessionGroupLabel}>{group}</div>
                            {items.map((s) => (
                                <SessionItem
                                    key={s.id}
                                    session={s}
                                    isActive={s.id === activeSessionId}
                                    onSelect={() => onSelectSession(s.id)}
                                    onDelete={() => onDeleteSession(s.id)}
                                />
                            ))}
                        </div>
                    );
                })}
                {sessions.length === 0 && (
                    <div className={styles.noSessions}>No conversations yet</div>
                )}
            </div>
        </aside>
    );
}

function SessionItem({ session, isActive, onSelect, onDelete }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            className={`${styles.sessionItem} ${isActive ? styles.sessionItemActive : ""}`}
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <span className={styles.sessionTitle}>
                {session.title || "New conversation"}
            </span>
            {hovered && (
                <button
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    title="Delete conversation"
                >
                    🗑
                </button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function CandidateCard({ candidate }) {
    const score = candidate.score != null ? Math.round(candidate.score * 100) : null;
    const scoreColor = score >= 80 ? "#15803d" : score >= 60 ? "#92400e" : "#6b7280";
    return (
        <div className={styles.candidateCard}>
            <div className={styles.cardTop}>
                <div>
                    <div className={styles.cardName}>{candidate.name}</div>
                    <div className={styles.cardMeta}>
                        {candidate.current_title}
                        {candidate.current_company ? ` · ${candidate.current_company}` : ""}
                    </div>
                    {candidate.location && (
                        <div className={styles.cardLocation}>📍 {candidate.location}</div>
                    )}
                </div>
                {score !== null && (
                    <div className={styles.scoreChip} style={{ color: scoreColor, borderColor: scoreColor }}>
                        {score}%
                    </div>
                )}
            </div>
            <div className={styles.cardTags}>
                {candidate.ai_career_level && (
                    <span className={styles.tag}>{candidate.ai_career_level}</span>
                )}
                {candidate.ai_certifications && (
                    <span className={styles.tag}>{candidate.ai_certifications}</span>
                )}
                {candidate.ai_years_experience && (
                    <span className={styles.tag}>{candidate.ai_years_experience} yrs</span>
                )}
            </div>
            {candidate.ai_summary && (
                <p className={styles.cardSummary}>{candidate.ai_summary}</p>
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
                {meeting.company_name && <div className={styles.cardMeta}>{meeting.company_name}</div>}
                <div className={styles.meetingTime}>📅 {meeting.date} at {meeting.time_slot} EST</div>
                {meeting.meeting_summary && (
                    <p className={styles.cardSummary}>{meeting.meeting_summary.slice(0, 180)}…</p>
                )}
            </div>
            <div className={styles.meetingCardRight}>
                <span className={styles.meetingStatus} style={{ background: s.bg, color: s.color }}>{s.label}</span>
                {meeting.meeting_url && meeting.status === "confirmed" && (
                    <a href={meeting.meeting_url} target="_blank" rel="noopener noreferrer" className={styles.zoomLink}>Join Zoom →</a>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

function TypingIndicator({ statusMsg }) {
    return (
        <div className={`${styles.messageRow} ${styles.messageRowAI}`}>
            <div style={{ flexShrink: 0, marginTop: 2, width: 28, height: 28 }}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 375 375"
                    width={28}
                    height={28}
                    style={{ animation: "ryze-pulse 1.4s ease-in-out infinite", transformOrigin: "center" }}
                >
                    <path fill="#0a66c2" d="M 186.078125 19.484375 L 0.367188 341.148438 L 180.234375 341.148438 L 229.054688 256.585938 L 201.605469 215.015625 L 190.46875 234.308594 L 154.511719 296.59375 L 77.539062 296.59375 L 186.394531 108.039062 L 296.730469 295.972656 L 243.730469 295.972656 L 221.453125 340.527344 L 374.554688 340.527344 Z" />
                </svg>
            </div>
            <div className={`${styles.bubble} ${styles.bubbleAI}`}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                        {[0, 150, 300].map((delay) => (
                            <span key={delay} className={styles.dot} style={{ animationDelay: `${delay}ms` }} />
                        ))}
                    </div>
                    <span style={{ fontSize: "0.83rem", color: "#94a3b8", fontStyle: "italic" }}>{statusMsg}</span>
                </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 375" width={28} height={28} style={{ flexShrink: 0, marginTop: 2 }}>
                    <path fill="#0a66c2" d="M 186.078125 19.484375 L 0.367188 341.148438 L 180.234375 341.148438 L 229.054688 256.585938 L 201.605469 215.015625 L 190.46875 234.308594 L 154.511719 296.59375 L 77.539062 296.59375 L 186.394531 108.039062 L 296.730469 295.972656 L 243.730469 295.972656 L 221.453125 340.527344 L 374.554688 340.527344 Z" />
                </svg>
            )}
            <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAI}`}>
                {isUser ? (
                    <p className={styles.bubbleText}>{message.content}</p>
                ) : (
                    <>
                        <div className={styles.bubbleText}>
                            {message.streaming
                                ? <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{message.content}</p>
                                : <ReactMarkdown>{message.content}</ReactMarkdown>
                            }
                        </div>
                        {message.streaming && <span className={styles.streamCursor}>▋</span>}

                        {!message.streaming && message.candidates?.length > 0 && (
                            <div className={styles.inlineCards}>
                                <div className={styles.inlineCardsLabel}>{message.candidates.length} candidate{message.candidates.length !== 1 ? "s" : ""}</div>
                                {message.candidates.map((c) => <CandidateCard key={c.id ?? c.name} candidate={c} />)}
                            </div>
                        )}
                        {!message.streaming && message.meetings?.length > 0 && (
                            <div className={styles.inlineCards}>
                                <div className={styles.inlineCardsLabel}>{message.meetings.length} meeting{message.meetings.length !== 1 ? "s" : ""}</div>
                                {message.meetings.map((m) => <MeetingCard key={m.id} meeting={m} />)}
                            </div>
                        )}
                        {!message.streaming && message.employers?.length > 0 && (
                            <div className={styles.inlineCards}>
                                <div className={styles.inlineCardsLabel}>{message.employers.length} employer{message.employers.length !== 1 ? "s" : ""}</div>
                                {message.employers.map((e) => (
                                    <div key={e.id} className={styles.candidateCard}>
                                        <div className={styles.cardName}>{e.company_name}</div>
                                        <div className={styles.cardMeta}>{e.ai_industry}</div>
                                        {e.ai_company_overview && <p className={styles.cardSummary}>{e.ai_company_overview.slice(0, 160)}…</p>}
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ChatPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const token = localStorage.getItem("token");

    // Chat state
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [statusMsg, setStatusMsg] = useState("Thinking...");
    const [error, setError] = useState(null);

    // Session state
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // ── Auto-scroll ────────────────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, streaming]);

    // ── Load sessions on mount ─────────────────────────────────────────────
    useEffect(() => {
        loadSessions();
    }, []);

    async function loadSessions() {
        try {
            const res = await fetch(`${API_BASE}/api/chat/sessions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (e) {
            console.error("Failed to load sessions", e);
        }
    }

    // ── Load a session's messages ──────────────────────────────────────────
    async function loadSession(sessionId) {
        try {
            const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            setActiveSessionId(sessionId);
            const restored = data.messages.map((m) => ({
                role: m.role,
                content: m.content,
                streaming: false,
                ...(m.structured_data ? JSON.parse(m.structured_data) : {}),
            }));
            setMessages(restored);
            setError(null);
        } catch (e) {
            console.error("Failed to load session", e);
        }
    }

    // ── New chat ───────────────────────────────────────────────────────────
    function handleNewChat() {
        setActiveSessionId(null);
        setMessages([]);
        setError(null);
        inputRef.current?.focus();
    }

    // ── Delete session ─────────────────────────────────────────────────────
    async function handleDeleteSession(sessionId) {
        try {
            await fetch(`${API_BASE}/api/chat/sessions/${sessionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (activeSessionId === sessionId) handleNewChat();
        } catch (e) {
            console.error("Failed to delete session", e);
        }
    }

    // ── Save a message to current session ─────────────────────────────────
    async function saveMessage(sessionId, role, content, structuredData) {
        try {
            await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/messages`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    role,
                    content,
                    structured_data: structuredData ? JSON.stringify(structuredData) : null,
                }),
            });
        } catch (e) {
            console.error("Failed to save message", e);
        }
    }

    // ── Generate title after first exchange ───────────────────────────────
    async function generateTitle(sessionId) {
        try {
            const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/generate-title`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSessions((prev) =>
                    prev.map((s) => s.id === sessionId ? { ...s, title: data.title } : s)
                );
            }
        } catch (e) {
            console.error("Failed to generate title", e);
        }
    }

    // ── Send message ───────────────────────────────────────────────────────
    async function sendMessage(text) {
        const userMessage = text.trim();
        if (!userMessage || loading || streaming) return;

        setInput("");
        setError(null);
        setStatusMsg("Thinking...");

        const userMsg = { role: "user", content: userMessage };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setLoading(true);

        // Create session on first message
        let sessionId = activeSessionId;
        const isFirstMessage = messages.length === 0;
        if (!sessionId) {
            try {
                const res = await fetch(`${API_BASE}/api/chat/sessions`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ title: null }),
                });
                if (res.ok) {
                    const session = await res.json();
                    sessionId = session.id;
                    setActiveSessionId(sessionId);
                    setSessions((prev) => [session, ...prev]);
                }
            } catch (e) {
                console.error("Failed to create session", e);
            }
        }

        // Save user message
        if (sessionId) {
            await saveMessage(sessionId, "user", userMessage, null);
        }

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

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            const STATUS_PREFIX = "__STATUS__:";
            const DATA_MARKER = "\n__DATA__\n";

            let buffer = "";
            let fullText = "";
            let structuredData = null;
            let aiMsgIndex = null;
            let phase = "loading";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                if (phase === "loading") {
                    let consumed = true;
                    while (consumed) {
                        consumed = false;
                        if (buffer.startsWith(STATUS_PREFIX)) {
                            const newlineIdx = buffer.indexOf("\n");
                            if (newlineIdx !== -1) {
                                const msg = buffer.slice(STATUS_PREFIX.length, newlineIdx);
                                setStatusMsg(msg);
                                buffer = buffer.slice(newlineIdx + 1);
                                consumed = true;
                            }
                        }
                    }
                    if (buffer.length > 0 && !buffer.startsWith(STATUS_PREFIX)) {
                        phase = "streaming";
                        aiMsgIndex = newMessages.length;
                        setMessages([...newMessages, { role: "assistant", content: "", streaming: true }]);
                        setLoading(false);
                        setStreaming(true);
                    }
                }

                if (phase === "streaming") {
                    const markerIdx = buffer.indexOf(DATA_MARKER);
                    if (markerIdx !== -1) {
                        fullText += buffer.slice(0, markerIdx);
                        const jsonStr = buffer.slice(markerIdx + DATA_MARKER.length);
                        try { structuredData = JSON.parse(jsonStr); } catch (e) { console.error("Failed to parse structured data", e); }
                        buffer = "";
                    } else {
                        const safeLen = Math.max(0, buffer.length - DATA_MARKER.length);
                        fullText += buffer.slice(0, safeLen);
                        buffer = buffer.slice(safeLen);
                    }

                    if (aiMsgIndex !== null) {
                        setMessages((prev) => {
                            const updated = [...prev];
                            updated[aiMsgIndex] = { ...updated[aiMsgIndex], content: fullText, streaming: true };
                            return updated;
                        });
                    }
                }
            }

            // Finalize
            if (aiMsgIndex !== null) {
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[aiMsgIndex] = {
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
            }

            // Save assistant message and generate title
            if (sessionId) {
                await saveMessage(sessionId, "assistant", fullText, structuredData);
                if (isFirstMessage) {
                    generateTitle(sessionId);
                }
                // Refresh session list to update updated_at ordering
                loadSessions();
            }

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
            {/* ── Header ── */}

            <AdminHeader active="intelligence" />
            {/* ── Body: sidebar + chat ── */}
            <div className={styles.body}>
                <ChatSidebar
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onNewChat={handleNewChat}
                    onSelectSession={loadSession}
                    onDeleteSession={handleDeleteSession}
                />

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
                                <p className={styles.emptySub}>Ask anything about your candidates, employers, or schedule. Your entire recruiting database, in plain English.</p>
                            </div>
                        )}
                        <div className={styles.thread}>
                            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
                            {loading && <TypingIndicator statusMsg={statusMsg} />}
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
        </div>
    );
}