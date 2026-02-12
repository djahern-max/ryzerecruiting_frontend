import { useAuth } from '../contexts/AuthContext';
import styles from './Dashboard.module.css';

function CandidateDashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>RYZE Recruiting</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.full_name || 'Candidate'}
            </span>
            <button className={styles.logoutButton} onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>
            👤 Candidate Dashboard
          </h2>
          <p className={styles.welcomeText}>
            Welcome back, {user?.full_name}!
          </p>
        </div>
        
        <div className={styles.comingSoon}>
          <div className={styles.comingSoonCard}>
            <h3>🚀 Coming Soon</h3>
            <ul className={styles.featureList}>
              <li>Browse job listings</li>
              <li>Apply to positions</li>
              <li>Build your profile</li>
              <li>Track applications</li>
              <li>Message employers</li>
            </ul>
            <p className={styles.note}>
              We're working hard to help you find your dream job!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CandidateDashboard;
