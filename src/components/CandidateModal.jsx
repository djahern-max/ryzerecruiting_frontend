/* src/components/CandidateModal.jsx */
import { useState, useEffect } from "react";
import styles from "./CandidateModal.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    linkedin_url: "",
    linkedin_raw_text: "",
    current_title: "",
    current_company: "",
    location: "",
    notes: "",
};

export default function CandidateModal({ candidate, token, onSaved, onClose }) {
    const isEdit = !!candidate;
    const [form, setForm] = useState(EMPTY_FORM);
    const [parseText, setParseText] = useState("");
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [parseError, setParseError] = useState(null);
    const [activeTab, setActiveTab] = useState("manual"); // "manual" | "parse"

    useEffect(() => {
        if (candidate) {
            setForm({
                name: candidate.name || "",
                email: candidate.email || "",
                phone: candidate.phone || "",
                linkedin_url: candidate.linkedin_url || "",
                linkedin_raw_text: candidate.linkedin_raw_text || "",
                current_title: candidate.current_title || "",
                current_company: candidate.current_company || "",
                location: candidate.location || "",
                notes: candidate.notes || "",
            });
        }
    }, [candidate]);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleParse() {
        setParseError(null);
        if (!parseText.trim() || parseText.trim().length < 50) {
            setParseError("Please paste more text — at least a few lines.");
            return;
        }
        setParsing(true);
        try {
            const res = await fetch(`${API_BASE}/api/candidates/parse`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: parseText }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || "Parse failed");
            }
            const parsed = await res.json();

            // Pre-fill form with parsed fields, keep existing values if parsed returns null
            setForm((prev) => ({
                name: parsed.name || prev.name,
                email: parsed.email || prev.email,
                phone: parsed.phone || prev.phone,
                linkedin_url: parsed.linkedin_url || prev.linkedin_url,
                linkedin_raw_text: parseText,
                current_title: parsed.current_title || prev.current_title,
                current_company: parsed.current_company || prev.current_company,
                location: parsed.location || prev.location,
                notes: prev.notes,
            }));

            // Switch to manual tab to review parsed fields
            setActiveTab("manual");
        } catch (e) {
            setParseError(e.message);
        } finally {
            setParsing(false);
        }
    }

    async function handleSave() {
        setError(null);
        if (!form.name.trim()) {
            setError("Name is required.");
            return;
        }
        setSaving(true);
        try {
            const url = isEdit
                ? `${API_BASE}/api/candidates/${candidate.id}`
                : `${API_BASE}/api/candidates`;
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || "Save failed");
            }
            onSaved();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                {/* ── Header ── */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {isEdit ? `Edit — ${candidate.name}` : "Add Candidate"}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* ── Tabs ── */}
                {!isEdit && (
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === "parse" ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab("parse")}
                        >
                            ⚡ Parse from LinkedIn / Resume
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === "manual" ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab("manual")}
                        >
                            Manual Entry
                        </button>
                    </div>
                )}

                <div className={styles.modalBody}>
                    {/* ── Parse Tab ── */}
                    {activeTab === "parse" && !isEdit && (
                        <div className={styles.parseSection}>
                            <p className={styles.parseInstructions}>
                                Open a LinkedIn profile or resume, select all (<kbd>⌘A</kbd>),
                                copy (<kbd>⌘C</kbd>), and paste below. Claude will extract the
                                candidate's details automatically.
                            </p>
                            <textarea
                                className={styles.parseTextarea}
                                placeholder="Paste LinkedIn profile or resume text here..."
                                value={parseText}
                                onChange={(e) => setParseText(e.target.value)}
                                rows={10}
                            />
                            {parseError && <p className={styles.errorMsg}>{parseError}</p>}
                            <button
                                className={styles.parseBtn}
                                onClick={handleParse}
                                disabled={parsing}
                            >
                                {parsing ? (
                                    <><span className={styles.spinner} /> Parsing...</>
                                ) : (
                                    "⚡ Parse Profile"
                                )}
                            </button>
                        </div>
                    )}

                    {/* ── Manual / Review Tab ── */}
                    {activeTab === "manual" && (
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Name *</label>
                                <input
                                    className={styles.input}
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Full name"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Current Title</label>
                                <input
                                    className={styles.input}
                                    name="current_title"
                                    value={form.current_title}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Accountant"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Current Company</label>
                                <input
                                    className={styles.input}
                                    name="current_company"
                                    value={form.current_company}
                                    onChange={handleChange}
                                    placeholder="e.g. Deloitte"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Location</label>
                                <input
                                    className={styles.input}
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Boston, MA"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email</label>
                                <input
                                    className={styles.input}
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Phone</label>
                                <input
                                    className={styles.input}
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>LinkedIn URL</label>
                                <input
                                    className={styles.input}
                                    name="linkedin_url"
                                    value={form.linkedin_url}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Recruiter Notes</label>
                                <textarea
                                    className={styles.textarea}
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    placeholder="Internal notes about this candidate..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className={styles.modalFooter}>
                    {error && <p className={styles.errorMsg}>{error}</p>}
                    <div className={styles.footerActions}>
                        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        {activeTab === "manual" && (
                            <button
                                className={styles.saveBtn}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Candidate"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}