import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';   // 👈 ADD THIS
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
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
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}

function App() {

  // 👇 ADD THIS BLOCK RIGHT HERE
  useEffect(() => {
    // Change this to test themes:
    // "blue" | "navyGold" | "teal" | "forest" | "electric"
    document.documentElement.setAttribute("data-theme", "blue");
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
