/* App.jsx */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import AdminLogin from './pages/AdminLogin';
import OAuthCallback from './pages/OAuthCallback';
import CompleteOAuthSignup from './pages/CompleteOAuthSignup';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

const loadingScreen = (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    color: 'var(--brand-700)',
    background: 'var(--bg-50)',
    fontFamily: 'var(--font-sans)'
  }}>
    Loading...
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return loadingScreen;
  if (!user) return <Navigate to="/auth" />;
  return children;
}

/**
 * AdminRoute: Guards pages that only admin users (user_type === 'admin') can access.
 * Uses both user_type and is_superuser as a double-check.
 */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return loadingScreen;
  if (!user) return <Navigate to="/admin/login" />;
  if (user.user_type !== 'admin' || !user.is_superuser) return <Navigate to="/" />;
  return children;
}

function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "blue");
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/auth/complete-signup" element={<CompleteOAuthSignup />} />

          {/* Admin login — separate from public auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Employer dashboard */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Candidate dashboard */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard — only accessible to admin users */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
