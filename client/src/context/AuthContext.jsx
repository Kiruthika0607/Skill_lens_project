import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Ensure base URL points to backend API
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('skilllens_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attach token if present
  useEffect(() => {
    const token = localStorage.getItem('skilllens_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // Check auth session
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('skilllens_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          setStudentDetails(res.data.student || null);
          localStorage.setItem('skilllens_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session verification failed, continuing with cached session or logout', err?.message);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    if (token) {
      localStorage.setItem('skilllens_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (userData) {
      localStorage.setItem('skilllens_user', JSON.stringify(userData));
      setUser(userData);
    }
    return userData;
  };

  const register = async (userData) => {
    const res = await axios.post('/auth/register', userData);
    const { token, user: createdUser } = res.data;
    if (token) {
      localStorage.setItem('skilllens_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (createdUser) {
      localStorage.setItem('skilllens_user', JSON.stringify(createdUser));
      setUser(createdUser);
    }
    return createdUser;
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('skilllens_token');
    localStorage.removeItem('skilllens_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setStudentDetails(null);
  };

  const demoLogin = async (role = 'student') => {
    if (role === 'admin') {
      return login('admin@skilllens.edu', 'Admin@SkillLens2026');
    } else {
      return login('priya.sharma@annauniv.edu', 'Priya@1234');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      studentDetails,
      loading,
      login,
      register,
      logout,
      demoLogin,
      isAdmin: user?.role === 'admin',
      isStudent: user?.role === 'student' || (!user?.role && user !== null)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
