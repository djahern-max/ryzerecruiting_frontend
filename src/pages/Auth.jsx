import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = searchParams.get('type') || 'candidate';
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, fullName, userType);
      }
      
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authHeader}>
          <h1 className={styles.logo} onClick={() => navigate('/')}>
            RYZE Recruiting
          </h1>
          <h2 className={styles.authTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className={styles.userTypeBadge}>
            {userType === 'employer' ? '💼 Employer' : '👤 Candidate'}
          </p>
        </div>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <form className={styles.authForm} onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            {!isLogin && (
              <small className={styles.helpText}>
                Must be at least 8 characters
              </small>
            )}
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
        
        <div className={styles.authFooter}>
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <button 
              className={styles.toggleButton}
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
          
          <button 
            className={styles.backButton}
            onClick={() => navigate('/')}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
