// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import posthog from 'posthog-js';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getRedirectPath(user) {
  if (user.user_type === 'ADMIN') return '/admin';
  if (user.user_type === 'EMPLOYER') return '/employer/dashboard';
  return '/candidate/dashboard';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Global 402 interceptor ───────────────────────────────────────────────
  // Any API response with status 402 means the tenant's trial has expired
  // or their subscription is inactive. Redirect to /upgrade immediately.
  // The UpgradePage handles the Stripe checkout redirect from there.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 402) {
          // Don't redirect if already on the upgrade or billing pages
          const path = window.location.pathname;
          if (!path.startsWith('/upgrade') && !path.startsWith('/billing')) {
            window.location.href = '/upgrade';
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  // ── PostHog: identify the user once auth state resolves ─────────────────
  useEffect(() => {
    if (user) {
      posthog.identify(String(user.id), {
        email: user.email,
        user_type: user.user_type,
        tenant_id: user.tenant_id || 'ryze',
        is_superuser: Boolean(user.is_superuser),
      });
    }
  }, [user]);


  async function fetchUser(token, shouldRedirect = false) {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);

      if (shouldRedirect) {
        window.location.href = getRedirectPath(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.trim(),
        password: password.trim()
      });

      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(userData);
      window.location.href = getRedirectPath(userData);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail[0]?.msg || 'Invalid input'
        : typeof detail === 'string'
          ? detail
          : 'Login failed';
      return { success: false, error: message };
    }
  }

  async function register(email, password, fullName, userType) {
    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        full_name: fullName,
        user_type: userType.toUpperCase()
      });

      return await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail[0]?.msg || 'Invalid input'
        : typeof detail === 'string'
          ? detail
          : 'Registration failed';
      return { success: false, error: message };
    }
  }

  async function signupFirm(payload) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup-firm`, payload);

      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(userData);
      posthog.capture(
        'signup_completed',
        { tenant_id: userData.tenant_id },
        { send_instantly: true }
      );
      window.location.href = '/admin';

      return { success: true };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        detail: error.response?.data?.detail,
      };
    }
  }

  function logout() {
    posthog.reset();
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, login, register, signupFirm, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}