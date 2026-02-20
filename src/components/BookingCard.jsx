/* src/components/BookingCard.jsx */
import { useState } from "react";
import styles from "./BookingCard.module.css";
import axios from "axios";

const API_URL = import.meta.env.PROD
  ? 'https://api.ryzerecruiting.com'
  : 'http://localhost:8000';

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM",
  "3:00 PM", "4:00 PM",
];

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function isWeekday(dateStr) {
  if (!dateStr) return true;
  const day = new Date(dateStr + "T00:00:00").getDay();
  return day !== 0 && day !== 6;
}

export default function BookingCard() {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!date || !timeSlot) {
      setError("Please select a date and time slot.");
      return;
    }
    if (!isWeekday(date)) {
      setError("Please choose a weekday (Monday – Friday).");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/bookings`,
        { date, time_slot: timeSlot, phone: phone || null, notes: notes || null },
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
            A confirmation email is on its way. Dane will reach out if anything changes.
          </p>
        </div>
      </div>
    );
  }

  return (
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
          <label htmlFor="booking-phone">Phone Number <span className={styles.optional}>(optional)</span></label>
          <input
            id="booking-phone"
            type="tel"
            placeholder="(555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="booking-notes">Anything you'd like us to know? <span className={styles.optional}>(optional)</span></label>
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
  );
}