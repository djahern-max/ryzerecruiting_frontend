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
    ai_summary: "",
    ai_career_level: "",
    ai_experience: "",
    ai_education: "",
    ai_certifications: "",
    ai_skills: [],
    ai_years_experience: "",
};

const CAREER_LEVEL_OPTIONS = [
    { value: "", label: "Select level..." },
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior" },
    { value: "manager", label: "Manager" },
    { value: "director", label: "Director" },
    { value: "vp", label: "VP" },
    { value: "c-suite", label: "C-Suite" },
];

export default function CandidateModal({ candidate, token, onSaved, onClose }) {
    const isEdit = !!candidate;
    const [form, setForm] = useState(EMPTY_FORM);
    const [parseText, setParseText] = useState("");
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [parseError, setParseError] = useState(null);
    const [activeTab, setActiveTab] = useState("manual");
    const [skillInput, setSkillInput] = useState("");

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
                ai_summary: candidate.ai_summary || "",
                ai_career_level: candidate.ai_career_level || "",
                ai_experience: candidate.ai_experience || "",
                ai_education: candidate.ai_education || "",
                ai_certifications: candidate.ai_certifications || "",
                ai_skills: candidate.ai_skills || [],
                ai_years_experience: candidate.ai_years_experience || "",
            });
        }
    }, [candidate]);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSkillKeyDown(e) {
        if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
            e.preventDefault();
            const newSkill = skillInput.trim().replace(/,$/, "");
            if (newSkill && !form.ai_skills.includes(newSkill)) {
                setForm((prev) => ({ ...prev, ai_skills: [...prev.ai_skills, newSkill] }));
            }
            setSkillInput("");
        }
    }

    function removeSkill(skill) {
        setForm((prev) => ({
            ...prev,
            ai_skills: prev.ai_skills.filter((s) => s !== skill),
        }));
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
                ai_summary: parsed.ai_summary || prev.ai_summary,
                ai_career_level: parsed.ai_career_level || prev.ai_career_level,
                ai_experience: parsed.ai_experience || prev.ai_experience,
                ai_education: parsed.ai_education || prev.ai_education,
                ai_certifications: parsed.ai_certifications || prev.ai_certifications,
                ai_skills: parsed.ai_skills || prev.ai_skills,
                ai_years_experience: parsed.ai_years_experience || prev.ai_years_experience,
            }));

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
                body: JSON.stringify({
                    ...form,
                    ai_years_experience: form.ai_years_experience
                        ? parseInt(form.ai_years_experience, 10)
                        : null,
                }),
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

                {/* ── Tabs (add flow only) ── */}
                {!isEdit && (
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === "parse" ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab("parse")}
                        >
                            ⚡ Parse from Resume
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
                                Paste a resume, bio, or any candidate profile text below.
                                Claude will extract their details automatically.
                            </p>
                            <textarea
                                className={styles.parseTextarea}
                                placeholder="Paste resume or candidate profile text here..."
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
                        <div className={styles.formSections}>

                            {/* ── Section: Basic Info ── */}
                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionHeader}>Basic Info</div>
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
                                </div>
                            </div>

                            {/* ── Section: AI Intelligence ── */}
                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionHeader}>
                                    <span>AI Intelligence</span>
                                    <span className={styles.sectionHint}>Extracted by Claude · editable</span>
                                </div>
                                <div className={styles.formGrid}>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Career Level</label>
                                        <select
                                            className={styles.select}
                                            name="ai_career_level"
                                            value={form.ai_career_level}
                                            onChange={handleChange}
                                        >
                                            {CAREER_LEVEL_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Years of Experience</label>
                                        <input
                                            className={styles.input}
                                            name="ai_years_experience"
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={form.ai_years_experience}
                                            onChange={handleChange}
                                            placeholder="e.g. 8"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Certifications</label>
                                        <input
                                            className={styles.input}
                                            name="ai_certifications"
                                            value={form.ai_certifications}
                                            onChange={handleChange}
                                            placeholder="e.g. CPA, CMA"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Education</label>
                                        <input
                                            className={styles.input}
                                            name="ai_education"
                                            value={form.ai_education}
                                            onChange={handleChange}
                                            placeholder="e.g. BS Accounting, UMass"
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Skills</label>
                                        <div className={styles.skillsWrapper}>
                                            {form.ai_skills.map((skill) => (
                                                <span key={skill} className={styles.skillTag}>
                                                    {skill}
                                                    <button
                                                        className={styles.skillRemove}
                                                        onClick={() => removeSkill(skill)}
                                                        type="button"
                                                    >×</button>
                                                </span>
                                            ))}
                                            <input
                                                className={styles.skillInput}
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={handleSkillKeyDown}
                                                placeholder={form.ai_skills.length === 0 ? "Type a skill and press Enter..." : "Add another..."}
                                            />
                                        </div>
                                        <p className={styles.fieldHint}>Type a skill and press <em>Enter</em> or <em>,</em> to add it. Click × to remove.</p>
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>AI Summary</label>
                                        <textarea
                                            className={styles.textarea}
                                            name="ai_summary"
                                            value={form.ai_summary}
                                            onChange={handleChange}
                                            placeholder="Recruiter-perspective summary of this candidate..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Experience</label>
                                        <textarea
                                            className={styles.textarea}
                                            name="ai_experience"
                                            value={form.ai_experience}
                                            onChange={handleChange}
                                            placeholder="Work history and key accomplishments..."
                                            rows={4}
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* ── Section: Recruiter Notes ── */}
                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionHeader}>Recruiter Notes</div>
                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <textarea
                                            className={styles.textarea}
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            placeholder="Internal notes — not visible to candidates..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
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