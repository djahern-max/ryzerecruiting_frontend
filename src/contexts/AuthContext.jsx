// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Determines where to send a user after login based on their type.
 * user_type === 'admin' takes priority — admins go directly to the admin dashboard.
 * is_superuser is kept as a belt-and-suspenders check for the AdminRoute guard in App.jsx.
 */
function getRedirectPath(user) {
  if (user.user_type === 'admin') return '/admin';
  if (user.user_type === 'employer') return '/employer/dashboard';
  return '/candidate/dashboard';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

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
        email,
        password
      });

      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(userData);
      window.location.href = getRedirectPath(userData);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  }

  async function register(email, password, fullName, userType) {
    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        full_name: fullName,
        user_type: userType
      });

      return await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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
