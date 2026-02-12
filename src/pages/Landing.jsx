import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import styles from './Landing.module.css';

function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.user_type === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    }
  }, [user, navigate]);
  
  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <h1 className={styles.logo}>RYZE Recruiting</h1>
        <p className={styles.tagline}>Connect Employers with Top Talent</p>
      </header>
      
      <main className={styles.main}>
        <section className={styles.hero}>
          <h2 className={styles.heroTitle}>Who are you?</h2>
          
          <div className={styles.userTypeSelection}>
            <div className={styles.userTypeCard}>
              <div className={styles.cardIcon}>💼</div>
              <h3>I'm an Employer</h3>
              <p>Post jobs and find qualified candidates</p>
              <button 
                className={styles.primaryButton}
                onClick={() => navigate('/auth?type=employer')}
              >
                Get Started
              </button>
            </div>
            
            <div className={styles.userTypeCard}>
              <div className={styles.cardIcon}>👤</div>
              <h3>I'm a Candidate</h3>
              <p>Find your next opportunity</p>
              <button 
                className={styles.primaryButton}
                onClick={() => navigate('/auth?type=candidate')}
              >
                Get Started
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className={styles.footer}>
        <p>&copy; 2026 RYZE Recruiting. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
