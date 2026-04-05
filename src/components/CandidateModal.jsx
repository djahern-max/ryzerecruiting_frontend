/* src/components/CandidateModal.jsx */
import { useState, useEffect, useRef } from "react";
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

/**
 * CandidateModal
 *
 * Props:
 *   candidate    — existing candidate object (edit mode) or null (add mode)
 *   token        — auth token
 *   onSaved      — callback after successful save (receives updated candidate)
 *   onClose      — callback to close modal
 *   enrichMode   — (optional) when true, shows the Parse tab even for existing
 *                  candidates so a call-sourced stub can be enriched with a
 *                  resume or LinkedIn paste without losing the existing record
 */
export default function CandidateModal({ candidate, token, onSaved, onClose, enrichMode = false }) {
    const isEdit = !!candidate;

    // In enrichMode we show the parse tab and start there.
    // In normal edit mode we go straight to manual.
    // In add mode we default to parse.
    const initialTab = enrichMode ? "parse" : (isEdit ? "manual" : "parse");

    const [form, setForm] = useState(EMPTY_FORM);
    const [parseText, setParseText] = useState("");
    const [parseMode, setParseMode] = useState("file");
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [parseError, setParseError] = useState(null);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [skillInput, setSkillInput] = useState("");
    const [duplicates, setDuplicates] = useState([]);
    const [duplicateDismissed, setDuplicateDismissed] = useState(false);
    const fileInputRef = useRef(null);

    // Whether to show the parse tab at all
    const showParseTabs = !isEdit || enrichMode;

    // Modal title
    const modalTitle = enrichMode
        ? `Enrich — ${candidate?.name}`
        : isEdit
            ? `Edit — ${candidate?.name}`
            : "Add Candidate";

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

    async function checkForDuplicates(name, location) {
        if (!name || name.trim().length < 2) return;
        try {
            const params = new URLSearchParams({ name: name.trim() });
            if (location) params.append("location", location.trim());
            const res = await fetch(`${API_BASE}/api/candidates/check-duplicate?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const matches = await res.json();
                // In enrich mode, exclude the current candidate from duplicate results
                const filtered = isEdit
                    ? matches.filter(m => m.id !== candidate.id)
                    : matches;
                setDuplicates(filtered);
                setDuplicateDismissed(false);
            }
        } catch {
            // non-fatal
        }
    }

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
        setForm((prev) => ({ ...prev, ai_skills: prev.ai_skills.filter((s) => s !== skill) }));
    }

    function handleFileSelect(file) {
        if (!file) return;
        const name = file.name.toLowerCase();
        if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
            setParseError("Please select a PDF or Word (.docx) file.");
            return;
        }
        setParseError(null);
        setSelectedFile(file);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files[0]);
    }

    function applyParsedResult(parsed) {
        // In enrich mode, merge parsed data onto the existing form values.
        // Only overwrite a field if the parsed result has a non-empty value —
        // preserves existing data (e.g. recruiter notes, phone) that the
        // resume/LinkedIn paste won't contain.
        if (enrichMode && candidate) {
            setForm(prev => ({
                ...prev,
                name: parsed.name || prev.name,
                email: parsed.email || prev.email,
                phone: parsed.phone || prev.phone,
                linkedin_url: parsed.linkedin_url || prev.linkedin_url,
                linkedin_raw_text: parsed.linkedin_raw_text || parseText || prev.linkedin_raw_text,
                current_title: parsed.current_title || prev.current_title,
                current_company: parsed.current_company || prev.current_company,
                location: parsed.location || prev.location,
                ai_summary: parsed.ai_summary || prev.ai_summary,
                ai_career_level: parsed.ai_career_level || prev.ai_career_level,
                ai_experience: parsed.ai_experience || prev.ai_experience,
                ai_education: parsed.ai_education || prev.ai_education,
                ai_certifications: parsed.ai_certifications || prev.ai_certifications,
                ai_skills: parsed.ai_skills?.length ? parsed.ai_skills : prev.ai_skills,
                ai_years_experience: parsed.ai_years_experience || prev.ai_years_experience,
            }));
        } else {
            setForm({
                name: parsed.name || "",
                email: parsed.email || "",
                phone: parsed.phone || "",
                linkedin_url: parsed.linkedin_url || "",
                linkedin_raw_text: parsed.linkedin_raw_text || parseText || "",
                current_title: parsed.current_title || "",
                current_company: parsed.current_company || "",
                location: parsed.location || "",
                notes: "",
                ai_summary: parsed.ai_summary || "",
                ai_career_level: parsed.ai_career_level || "",
                ai_experience: parsed.ai_experience || "",
                ai_education: parsed.ai_education || "",
                ai_certifications: parsed.ai_certifications || "",
                ai_skills: parsed.ai_skills || [],
                ai_years_experience: parsed.ai_years_experience || "",
            });
        }

        setActiveTab("manual");
        if (parsed.name && !isEdit) {
            checkForDuplicates(parsed.name, parsed.location);
        }
    }

    async function handleParseText() {
        setParseError(null);
        if (!parseText.trim() || parseText.trim().length < 50) {
            setParseError("Please paste more text — at least a few lines.");
            return;
        }
        setParsing(true);
        try {
            const res = await fetch(`${API_BASE}/api/candidates/parse`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ text: parseText }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || "Parse failed");
            }
            applyParsedResult(await res.json());
        } catch (e) {
            setParseError(e.message);
        } finally {
            setParsing(false);
        }
    }

    async function handleParseFile() {
        setParseError(null);
        if (!selectedFile) { setParseError("Please select a file first."); return; }
        setParsing(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const res = await fetch(`${API_BASE}/api/candidates/parse-file`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || "Parse failed");
            }
            applyParsedResult(await res.json());
        } catch (e) {
            setParseError(e.message);
        } finally {
            setParsing(false);
        }
    }

    async function handleSave() {
        setError(null);
        if (!form.name.trim()) { setError("Name is required."); return; }
        setSaving(true);
        try {
            const url = isEdit ? `${API_BASE}/api/candidates/${candidate.id}` : `${API_BASE}/api/candidates`;
            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    ai_years_experience: form.ai_years_experience ? parseInt(form.ai_years_experience, 10) : null,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || "Save failed");
            }
            onSaved(await res.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    const showDuplicateWarning = !isEdit && duplicates.length > 0 && !duplicateDismissed;

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>

                {/* ── Header ── */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{modalTitle}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* ── Tabs — shown for add mode and enrich mode ── */}
                {showParseTabs && (
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === "parse" ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab("parse")}
                        >
                            ⚡ {enrichMode ? "Enrich from Resume / LinkedIn" : "Parse from Resume"}
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === "manual" ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab("manual")}
                        >
                            {enrichMode ? "Review & Save" : "Manual Entry"}
                        </button>
                    </div>
                )}

                <div className={styles.modalBody}>

                    {/* ── Duplicate Warning ── */}
                    {showDuplicateWarning && (
                        <div className={styles.duplicateWarning}>
                            <div className={styles.duplicateWarningLeft}>
                                <span className={styles.duplicateWarningIcon}>⚠️</span>
                                <div>
                                    <div className={styles.duplicateWarningTitle}>
                                        Possible duplicate{duplicates.length > 1 ? "s" : ""} found
                                    </div>
                                    <div className={styles.duplicateWarningMatches}>
                                        {duplicates.map((d) => (
                                            <span key={d.id} className={styles.duplicateMatch}>
                                                {d.name}{d.location ? ` · ${d.location}` : ""}{d.current_title ? ` · ${d.current_title}` : ""}
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.duplicateWarningHint}>
                                        Review the list before saving to avoid duplicates.
                                    </div>
                                </div>
                            </div>
                            <button
                                className={styles.duplicateDismiss}
                                onClick={() => setDuplicateDismissed(true)}
                                type="button"
                            >
                                Add anyway
                            </button>
                        </div>
                    )}

                    {/* ── Enrich mode hint ── */}
                    {enrichMode && activeTab === "parse" && (
                        <div style={{
                            background: '#f5f3ff',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            marginBottom: '16px',
                            fontSize: '13px',
                            color: '#6d28d9',
                            lineHeight: 1.5,
                        }}>
                            <strong>Enriching an existing profile.</strong> Parsed data will be merged into the current record —
                            existing fields are only overwritten if the resume or LinkedIn profile contains a value for them.
                            Recruiter notes and contact details you've already saved will be preserved.
                        </div>
                    )}

                    {/* ── Parse Tab ── */}
                    {activeTab === "parse" && showParseTabs && (
                        <div className={styles.parseSection}>
                            <div className={styles.parseModeToggle}>
                                <button
                                    className={`${styles.parseModeBtn} ${parseMode === "file" ? styles.parseModeBtnActive : ""}`}
                                    onClick={() => { setParseMode("file"); setParseError(null); }}
                                    type="button"
                                >
                                    📎 Upload File
                                </button>
                                <button
                                    className={`${styles.parseModeBtn} ${parseMode === "text" ? styles.parseModeBtnActive : ""}`}
                                    onClick={() => { setParseMode("text"); setParseError(null); }}
                                    type="button"
                                >
                                    📋 Paste Text
                                </button>
                            </div>

                            {parseMode === "file" && (
                                <>
                                    <div
                                        className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""} ${selectedFile ? styles.dropZoneHasFile : ""}`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.docx"
                                            style={{ display: "none" }}
                                            onChange={(e) => handleFileSelect(e.target.files[0])}
                                        />
                                        {selectedFile ? (
                                            <div className={styles.dropZoneFileSelected}>
                                                <span className={styles.dropZoneFileIcon}>
                                                    {selectedFile.name.endsWith(".pdf") ? "📄" : "📝"}
                                                </span>
                                                <div>
                                                    <div className={styles.dropZoneFileName}>{selectedFile.name}</div>
                                                    <div className={styles.dropZoneFileSize}>
                                                        {(selectedFile.size / 1024).toFixed(0)} KB — click to change
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.dropZoneEmpty}>
                                                <div className={styles.dropZoneIcon}>⬆️</div>
                                                <div className={styles.dropZoneText}>
                                                    Drag & drop a resume here, or <span className={styles.dropZoneBrowse}>browse</span>
                                                </div>
                                                <div className={styles.dropZoneHint}>PDF or Word (.docx) · Max 10MB</div>
                                            </div>
                                        )}
                                    </div>
                                    {parseError && <p className={styles.errorMsg}>{parseError}</p>}
                                    <button className={styles.parseBtn} onClick={handleParseFile} disabled={parsing || !selectedFile}>
                                        {parsing ? <><span className={styles.spinner} /> Parsing...</> : "⚡ Parse Resume"}
                                    </button>
                                </>
                            )}

                            {parseMode === "text" && (
                                <>
                                    <p className={styles.parseInstructions}>
                                        Paste a resume, bio, or LinkedIn profile (select all → copy → paste). Claude will extract their details automatically.
                                    </p>
                                    <textarea
                                        className={styles.parseTextarea}
                                        placeholder="Paste resume or LinkedIn profile here..."
                                        value={parseText}
                                        onChange={(e) => setParseText(e.target.value)}
                                        rows={10}
                                    />
                                    {parseError && <p className={styles.errorMsg}>{parseError}</p>}
                                    <button className={styles.parseBtn} onClick={handleParseText} disabled={parsing}>
                                        {parsing ? <><span className={styles.spinner} /> Parsing...</> : "⚡ Parse Profile"}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Manual / Review Tab ── */}
                    {activeTab === "manual" && (
                        <div className={styles.formSections}>

                            {enrichMode && (
                                <div style={{
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    marginBottom: '16px',
                                    fontSize: '13px',
                                    color: '#15803d',
                                }}>
                                    ✓ Profile parsed — review the fields below and click <strong>Save Changes</strong> to update this candidate.
                                </div>
                            )}

                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionHeader}>Basic Info</div>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Name *</label>
                                        <input className={styles.input} name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Current Title</label>
                                        <input className={styles.input} name="current_title" value={form.current_title} onChange={handleChange} placeholder="e.g. Senior Accountant" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Current Company</label>
                                        <input className={styles.input} name="current_company" value={form.current_company} onChange={handleChange} placeholder="e.g. Deloitte" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Location</label>
                                        <input className={styles.input} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Boston, MA" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email</label>
                                        <input className={styles.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Phone</label>
                                        <input className={styles.input} name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>LinkedIn URL</label>
                                        <input className={styles.input} name="linkedin_url" value={form.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionHeader}>
                                    <span>AI Intelligence</span>
                                    <span className={styles.sectionHint}>Extracted by Claude · editable</span>
                                </div>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Career Level</label>
                                        <select className={styles.select} name="ai_career_level" value={form.ai_career_level} onChange={handleChange}>
                                            {CAREER_LEVEL_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Years of Experience</label>
                                        <input className={styles.input} name="ai_years_experience" type="number" min="0" max="50" value={form.ai_years_experience} onChange={handleChange} placeholder="e.g. 8" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Certifications</label>
                                        <input className={styles.input} name="ai_certifications" value={form.ai_certifications} onChange={handleChange} placeholder="e.g. CPA, CMA" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Education</label>
                                        <input className={styles.input} name="ai_education" value={form.ai_education} onChange={handleChange} placeholder="e.g. BS Accounting, UMass" />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Skills</label>
                                        <div className={styles.skillsWrapper}>
                                            {form.ai_skills.map((skill) => (
                                                <span key={skill} className={styles.skillTag}>
                                                    {skill}
                                                    <button className={styles.skillRemove} onClick={() => removeSkill(skill)} type="button">×</button>
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
                                        <textarea className={styles.textarea} name="ai_summary" value={form.ai_summary} onChange={handleChange} placeholder="Recruiter-perspective summary of this candidate..." rows={3} />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Experience</label>
                                        <textarea className={styles.textarea} name="ai_experience" value={form.ai_experience} onChange={handleChange} placeholder="Work history and key accomplishments..." rows={4} />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionHeader}>Recruiter Notes</div>
                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <textarea className={styles.textarea} name="notes" value={form.notes} onChange={handleChange} placeholder="Internal notes — not visible to candidates..." rows={3} />
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
                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Candidate"}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}