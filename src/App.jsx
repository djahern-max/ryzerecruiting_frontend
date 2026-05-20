/* App.jsx */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import Auth from './pages/Auth';
import AdminLogin from './pages/AdminLogin';
import OAuthCallback from './pages/OAuthCallback';
import CompleteOAuthSignup from './pages/CompleteOAuthSignup';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import EmployerRoster from './pages/EmployerRoster';
import CandidatesPage from './pages/CandidatesPage';
import ChatPage from './pages/ChatPage';
import DBExplorer from './pages/admin/DBExplorer';
import CandidateProfile from './pages/CandidateProfile';
import EmployerProfile from './pages/EmployerProfile';
import UpgradePage from './pages/UpgradePage';
import BillingSuccess from './pages/BillingSuccess';
import InviteForm from './pages/admin/InviteForm';
import ChangePassword from './pages/ChangePassword';
import CandidateSelfProfile from './pages/CandidateSelfProfile';
import EmployerSelfProfile from './pages/EmployerSelfProfile';
import JobOrderRoster from './pages/JobOrderRoster';
import JobOrderDetail from './pages/JobOrderDetail';

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

/**
 * ProtectedRoute — requires authentication + optional role check.
 *
 * allowedRoles: array of user_type strings e.g. ['EMPLOYER']
 * If the user is authenticated but the wrong role, redirect to their own
 * dashboard rather than a dead-end 403. Admins can access everything.
 */
function ProtectedRoute({ children, allowedRoles = null }) {
  const { user, loading } = useAuth();

  if (loading) return loadingScreen;
  if (!user) return <Navigate to="/auth" replace />;

  // Admins can access any protected route
  if (user.user_type === 'ADMIN') return children;

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    if (user.user_type === 'EMPLOYER') return <Navigate to="/employer/dashboard" replace />;
    if (user.user_type === 'CANDIDATE') return <Navigate to="/candidate/dashboard" replace />;
    return <Navigate to="/auth" replace />;
  }

  return children;
}

/**
 * AdminRoute — requires ADMIN user_type AND is_superuser flag.
 * Separates admin auth from employer/candidate auth entirely.
 */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return loadingScreen;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.user_type !== 'ADMIN' || !user.is_superuser) return <Navigate to="/auth" replace />;
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
          {/* ── Root → auth ─────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/auth" replace />} />

          {/* ── Public ─────────────────────────────────────────────── */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/auth/complete-signup" element={<CompleteOAuthSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/billing/success" element={<BillingSuccess />} />

          {/* ── Employer — role-locked ──────────────────────────────── */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER']}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/roster"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER']}>
                <EmployerRoster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER']}>
                <EmployerSelfProfile />
              </ProtectedRoute>
            }
          />

          {/* ── Candidate — role-locked ─────────────────────────────── */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateSelfProfile />
              </ProtectedRoute>
            }
          />

          {/* ── Shared protected ────────────────────────────────────── */}
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <CandidatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates/:id"
            element={
              <ProtectedRoute>
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employers/:id"
            element={
              <ProtectedRoute>
                <EmployerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-orders"
            element={
              <ProtectedRoute>
                <JobOrderRoster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-orders/:id"
            element={
              <ProtectedRoute>
                <JobOrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* ── Admin ───────────────────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/db-explorer"
            element={
              <AdminRoute>
                <DBExplorer />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/invite"
            element={
              <AdminRoute>
                <InviteForm />
              </AdminRoute>
            }
          />

          {/* ── Catch-all ───────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;