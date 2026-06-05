// src/components/BookingCard.jsx
import { useState } from "react";
import styles from "./BookingCard.module.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TIME_SLOTS = [
  "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM",
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
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

function getAvailableSlots(selectedDate) {
  if (!selectedDate) return TIME_SLOTS;
  const now = new Date();
  const selected = new Date(selectedDate + "T00:00:00");
  const isToday = selected.toDateString() === now.toDateString();
  if (!isToday) return TIME_SLOTS;

  return TIME_SLOTS.filter((slot) => {
    const [time, period] = slot.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime > now;
  });
}

function InfoModal({ onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <h3 className={styles.modalTitle}>Why we ask for this</h3>
        <p className={styles.modalText}>
          The more accurate information you provide, the more prepared we will be for this call.
          This saves both parties time and leads to a quicker, more productive conversation.
        </p>
        <p className={styles.modalText}>
          Your company name and website allow us to research your business beforehand so we can
          speak directly to your hiring needs — no generic pitch, no wasted time.
        </p>
      </div>
    </div>
  );
}

// variant: "employer" (default) | "candidate"
export default function BookingCard({ variant = "employer" }) {
  const isCandidate = variant === "candidate";

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  function handlePhoneChange(e) {
    setPhone(formatPhone(e.target.value));
  }

  function handleDateChange(e) {
    const newDate = e.target.value;
    setDate(newDate);
    const available = getAvailableSlots(newDate);
    if (timeSlot && !available.includes(timeSlot)) {
      setTimeSlot("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!date || !timeSlot) {
      setError("Please select a date and time slot.");
      return;
    }

    if (isCandidate && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isCandidate
        ? `${API_URL}/api/bookings/candidate`
        : `${API_URL}/api/bookings`;

      const payload = isCandidate
        ? {
          name: name.trim(),
          date,
          time_slot: timeSlot,
          company_name: companyName || null,
          phone: phone || null,
          notes: notes || null,
        }
        : {
          date,
          time_slot: timeSlot,
          company_name: companyName || null,
          website_url: websiteUrl || null,
          phone: phone || null,
          notes: notes || null,
        };

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (booking) {
    return (
      <div className={styles.card}>
        <div className={styles.confirmation}>
          <span className={styles.checkIcon}>✓</span>
          <h2>You're booked!</h2>
          <p>
            Your call is set for <strong>{booking.date}</strong> at{" "}
            <strong>{booking.time_slot} EST</strong>.
          </p>
          <p className={styles.confirmSub}>
            A confirmation email is on its way. We'll reach out shortly to confirm your Zoom link.
          </p>
          {booking.meeting_url && (
            <a
              href={booking.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.meetingBtn}
            >
              Join Zoom Call →
            </a>
          )}
        </div>
      </div>
    );
  }

  const availableSlots = getAvailableSlots(date);

  return (
    <>
      {showModal && <InfoModal onClose={() => setShowModal(false)} />}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.headline}>
            {isCandidate ? "Schedule a Call" : "Schedule an Intro Call"}
          </h2>
          <p className={styles.subtext}>
            {isCandidate
              ? "Tell us a bit about yourself and pick a time that works for you."
              : "Let us learn about your hiring needs and how RYZE can help."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Candidate-only: name + current company */}
          {isCandidate && (
            <>
              <div className={styles.field}>
                <label htmlFor="booking-name">Your Name</label>
                <input
                  id="booking-name"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="booking-company">
                  Current Company{" "}
                  <span style={{ fontWeight: 400, color: '#5a7290' }}>(optional)</span>
                </label>
                <input
                  id="booking-company"
                  type="text"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={styles.input}
                />
              </div>
            </>
          )}

          <div className={styles.field}>
            <label htmlFor="booking-date">Preferred Date</label>
            <input
              id="booking-date"
              type="date"
              min={todayString()}
              value={date}
              onChange={handleDateChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label>Preferred Time</label>
            <div className={styles.timeGrid}>
              {availableSlots.length === 0 ? (
                <p className={styles.noSlots}>No remaining slots for today. Please select a future date.</p>
              ) : (
                availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`${styles.timeBtn} ${timeSlot === slot ? styles.timeBtnActive : ""}`}
                    onClick={() => setTimeSlot(slot)}
                  >
                    {slot}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Employer-only fields */}
          {!isCandidate && (
            <>
              <div className={styles.field}>
                <label htmlFor="booking-company">
                  Company Name
                  <button
                    type="button"
                    className={styles.infoBtn}
                    onClick={() => setShowModal(true)}
                    aria-label="Why we need this"
                  >
                    ⓘ
                  </button>
                </label>
                <input
                  id="booking-company"
                  type="text"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="booking-website">
                  Company Website{" "}
                  <span style={{ fontWeight: 400, color: '#5a7290' }}>(optional)</span>
                  <button
                    type="button"
                    className={styles.infoBtn}
                    onClick={() => setShowModal(true)}
                    aria-label="Why we need this"
                  >
                    ⓘ
                  </button>
                </label>
                <input
                  id="booking-website"
                  type="text"
                  inputMode="url"
                  placeholder="dirtt.com"
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

          <div className={styles.field}>
            <label htmlFor="booking-phone">
              Phone Number{" "}
              {isCandidate && (
                <span style={{ fontWeight: 400, color: '#5a7290' }}>(optional)</span>
              )}
            </label>
            <input
              id="booking-phone"
              type="tel"
              placeholder="(555) 000-0000"
              value={phone}
              onChange={handlePhoneChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="booking-notes">Anything you'd like us to know?</label>
            <textarea
              id="booking-notes"
              rows={3}
              placeholder={
                isCandidate
                  ? "Roles you're interested in, experience level, availability..."
                  : "Role you're hiring for, team size, timeline..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
            />
          </div>

          {/* SMS opt-in consent */}
          <label className={styles.smsConsent}>
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              className={styles.smsCheckbox}
            />
            <span>
              I agree to receive SMS appointment reminders and booking notifications from
              RYZE GROUP, Inc. (RYZE.ai). Message frequency varies. Message and data rates
              may apply. Reply STOP to opt out.{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>
          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? "Booking..." : "Book My Call"}
          </button>
        </form>
      </div>
    </>
  );
}