/* src/pages/EmployerDashboard.jsx */
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import BookingCard from '../components/BookingCard';

function EmployerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>RYZE Recruiting</h1>
          <div className={styles.userInfo}>
            {user?.is_superuser && (
              <button
                className={styles.adminLink}
                onClick={() => navigate('/admin')}
              >
                Admin Dashboard
              </button>
            )}
            <span className={styles.userName}>
              {user?.full_name || 'Employer'}
            </span>
            <button className={styles.logoutButton} onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <div className={styles.userTypeBadge}>Employer</div>
          <h2 className={styles.welcomeTitle}>Dashboard</h2>
          <p className={styles.welcomeText}>
            Welcome back, {user?.full_name}!
          </p>
        </div>

        <BookingCard />

        <div className={styles.comingSoon}>
          <div className={styles.comingSoonCard}>
            <h3>Coming Soon</h3>
            <ul className={styles.featureList}>
              <li>Post job openings</li>
              <li>Search candidate database</li>
              <li>Manage applications</li>
              <li>Message candidates</li>
              <li>Analytics & reporting</li>
            </ul>
            <p className={styles.note}>
              We're working hard to bring you the best recruiting platform!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmployerDashboard;