/* src/pages/AdminDashboard.jsx */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminDashboard.module.css';

const API_BASE = import.meta.env.PROD
  ? 'https://api.ryzerecruiting.com'
  : 'http://localhost:8000';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  pending: styles.statusPending,
  confirmed: styles.statusConfirmed,
  cancelled: styles.statusCancelled,
};

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId, newStatus) {
    setUpdatingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? updated : b))
      );
    } catch (err) {
      alert('Error updating booking: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete booking');
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      alert('Error deleting booking: ' + err.message);
    }
  }

  function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.logo}>RYZE Recruiting</h1>
            <span className={styles.adminBadge}>Admin</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{user?.full_name}</span>
            <button className={styles.logoutButton} onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Booking Management</h2>
          <p className={styles.pageSubtitle}>
            Manage all incoming discovery call requests
          </p>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{bookings.length}</span>
            <span className={styles.statLabel}>Total Bookings</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statNumber} ${styles.statPending}`}>{pending.length}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statNumber} ${styles.statConfirmed}`}>{confirmed.length}</span>
            <span className={styles.statLabel}>Confirmed</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statNumber} ${styles.statCancelled}`}>{cancelled.length}</span>
            <span className={styles.statLabel}>Cancelled</span>
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className={styles.emptyState}>Loading bookings…</div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : bookings.length === 0 ? (
          <div className={styles.emptyState}>No bookings yet.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Date & Time</th>
                  <th className={styles.phone}>Phone</th>
                  <th className={styles.notes}>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td className={styles.nameCell}>{booking.employer_name}</td>
                    <td>
                      <a href={`mailto:${booking.employer_email}`} className={styles.emailLink}>
                        {booking.employer_email}
                      </a>
                    </td>
                    <td>
                      {booking.company_name && (
                        <div className={styles.companyName}>{booking.company_name}</div>
                      )}
                      {booking.website_url && (
                        <a
                          href={
                            booking.website_url.startsWith('http')
                              ? booking.website_url
                              : `https://${booking.website_url}`
                          }
                        >
                          {booking.website_url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </td>
                    <td>
                      <div className={styles.dateText}>
                        {formatDate(booking.date)}
                      </div>
                      <div className={styles.timeText}>{booking.time_slot} EST</div>
                    </td>
                    <td className={styles.phone}>
                      {booking.phone || '—'}
                    </td>
                    <td className={styles.notes}>
                      {booking.notes || '—'}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${STATUS_COLORS[booking.status]}`}
                      >
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {booking.status !== 'confirmed' && (
                          <button
                            className={styles.confirmBtn}
                            disabled={updatingId === booking.id}
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            className={styles.cancelBtn}
                            disabled={updatingId === booking.id}
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                        {booking.status === 'cancelled' && (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => deleteBooking(booking.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
