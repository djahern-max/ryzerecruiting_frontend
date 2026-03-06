// src/components/RecruiterInviteModal.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './RecruiterInviteModal.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TIME_SLOTS = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
];

function todayString() {
    return new Date().toISOString().split("T")[0];
}

function formatPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function RecruiterInviteModal({ isOpen, onClose, onSuccess }) {
    const [inviteType, setInviteType] = useState("outbound_employer");
    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    const isEmployer = inviteType === "outbound_employer";

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setInviteType("outbound_employer");
            setContactName("");
            setContactEmail("");
            setContactPhone("");
            setCompanyName("");
            setWebsiteUrl("");
            setDate("");
            setTimeSlot("");
            setNotes("");
            setError("");
            setSuccess(null);
        }
    }, [isOpen]);

    function handlePhoneChange(e) {
        setContactPhone(formatPhone(e.target.value));
    }

    // Clear company fields when switching to candidate
    function handleTypeChange(type) {
        setInviteType(type);
        if (type === "outbound_candidate") {
            setCompanyName("");
            setWebsiteUrl("");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!contactName.trim()) { setError("Contact name is required."); return; }
        if (!contactEmail.trim()) { setError("Contact email is required."); return; }
        if (!date) { setError("Please select a date."); return; }
        if (!timeSlot) { setError("Please select a time slot."); return; }
        if (isEmployer && !companyName.trim()) { setError("Company name is required for employer invites."); return; }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                `${API_URL}/api/bookings/recruiter-invite`,
                {
                    invite_type: inviteType,
                    contact_name: contactName,
                    contact_email: contactEmail,
                    contact_phone: contactPhone || null,
                    company_name: isEmployer ? (companyName || null) : null,
                    website_url: isEmployer ? (websiteUrl || null) : null,
                    date,
                    time_slot: timeSlot,
                    notes: notes || null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(data);
            if (onSuccess) onSuccess(data);
        } catch (err) {
            setError(err.response?.data?.detail || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>Send Meeting Invite</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className={styles.drawerBody}>
                    {success ? (
                        /* Success state */
                        <div className={styles.successState}>
                            <span className={styles.checkIcon}>✓</span>
                            <h3>Invite sent!</h3>
                            <p>
                                A Zoom meeting has been created and an invite email was sent to{" "}
                                <strong>{success.employer_name}</strong> for{" "}
                                <strong>{success.date}</strong> at <strong>{success.time_slot} EST</strong>.
                            </p>
                            {success.meeting_url && (
                                <a
                                    href={success.meeting_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.meetingLink}
                                >
                                    View Zoom Link →
                                </a>
                            )}
                            <button className={styles.sendAnotherBtn} onClick={() => setSuccess(null)}>
                                Send Another Invite
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>

                            {/* Invite type toggle */}
                            <div className={styles.field}>
                                <label>Invite Type</label>
                                <div className={styles.toggle}>
                                    <button
                                        type="button"
                                        className={`${styles.toggleBtn} ${isEmployer ? styles.toggleActive : ""}`}
                                        onClick={() => handleTypeChange("outbound_employer")}
                                    >
                                        Employer
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.toggleBtn} ${!isEmployer ? styles.toggleActive : ""}`}
                                        onClick={() => handleTypeChange("outbound_candidate")}
                                    >
                                        Candidate
                                    </button>
                                </div>
                            </div>

                            {/* Contact details */}
                            <div className={styles.field}>
                                <label htmlFor="ri-name">Contact Name</label>
                                <input
                                    id="ri-name"
                                    type="text"
                                    placeholder={isEmployer ? "Jane Smith" : "John Doe"}
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="ri-email">Contact Email</label>
                                <input
                                    id="ri-email"
                                    type="email"
                                    placeholder={isEmployer ? "jane@company.com" : "john@email.com"}
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="ri-phone">
                                    Phone <span className={styles.optional}>(optional)</span>
                                </label>
                                <input
                                    id="ri-phone"
                                    type="tel"
                                    placeholder="(555) 000-0000"
                                    value={contactPhone}
                                    onChange={handlePhoneChange}
                                    className={styles.input}
                                />
                            </div>

                            {/* Employer-only fields */}
                            {isEmployer && (
                                <>
                                    <div className={styles.field}>
                                        <label htmlFor="ri-company">Company Name</label>
                                        <input
                                            id="ri-company"
                                            type="text"
                                            placeholder="Acme Corp"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor="ri-website">
                                            Company Website <span className={styles.optional}>(optional)</span>
                                        </label>
                                        <input
                                            id="ri-website"
                                            type="text"
                                            inputMode="url"
                                            placeholder="acmecorp.com"
                                            value={websiteUrl}
                                            onChange={(e) => setWebsiteUrl(e.target.value)}
                                            onBlur={(e) => {
                                                const val = e.target.value.trim();
                                                if (val && !val.startsWith('http')) {
                                                    setWebsiteUrl('https://' + val);
                                                }
                                            }}
                                            className={styles.input}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Date */}
                            <div className={styles.field}>
                                <label htmlFor="ri-date">Date</label>
                                <input
                                    id="ri-date"
                                    type="date"
                                    min={todayString()}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            {/* Time slot */}
                            <div className={styles.field}>
                                <label>Time</label>
                                <div className={styles.timeGrid}>
                                    {TIME_SLOTS.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            className={`${styles.timeBtn} ${timeSlot === slot ? styles.timeBtnActive : ""}`}
                                            onClick={() => setTimeSlot(slot)}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className={styles.field}>
                                <label htmlFor="ri-notes">
                                    Notes <span className={styles.optional}>(optional)</span>
                                </label>
                                <textarea
                                    id="ri-notes"
                                    rows={3}
                                    placeholder={
                                        isEmployer
                                            ? "Role being hired for, context for the call..."
                                            : "Positions discussed, candidate background..."
                                    }
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className={styles.textarea}
                                />
                            </div>

                            {error && <p className={styles.error}>{error}</p>}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={submitting}
                            >
                                {submitting ? "Sending..." : "Send Invite & Create Zoom"}
                            </button>

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RecruiterInviteModal;