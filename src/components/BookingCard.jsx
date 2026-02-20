import { useState } from "react";
import styles from "./BookingCard.module.css";
import axios from "axios";

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

export default function BookingCard() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  function handlePhoneChange(e) {
    setPhone(formatPhone(e.target.value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!date || !timeSlot) {
      setError("Please select a date and time slot.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/bookings`,
        {
          date,
          time_slot: timeSlot,
          company_name: companyName || null,
          website_url: websiteUrl || null,
          phone: phone || null,
          notes: notes || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfirmed(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className={styles.card}>
        <div className={styles.confirmation}>
          <span className={styles.checkIcon}>✓</span>
          <h2>You're booked!</h2>
          <p>
            Your intro call is set for <strong>{date}</strong> at{" "}
            <strong>{timeSlot}</strong>.
          </p>
          <p className={styles.confirmSub}>
            A confirmation email is on its way. We'll reach out if anything changes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && <InfoModal onClose={() => setShowModal(false)} />}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.headline}>Schedule an Intro Call</h2>
          <p className={styles.subtext}>
            Let us learn about your hiring needs and how RYZE can help.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.field}>
            <label htmlFor="booking-date">Preferred Date</label>
            <input
              id="booking-date"
              type="date"
              min={todayString()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label>Preferred Time</label>
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
              Company Website
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
              type="url"
              placeholder="https://acmecorp.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="booking-phone">Phone Number</label>
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
              placeholder="Role you're hiring for, team size, timeline..."
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
            {submitting ? "Booking..." : "Book My Call"}
          </button>
        </form>
      </div>
    </>
  );
}
