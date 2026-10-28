import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('skilllens_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('skilllens_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('skilllens_access_token');
      if (storedToken) {
        try {
          // Token is present, verify/fetch latest profile or summary
          const storedUser = localStorage.getItem('skilllens_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user: userData } = response.data;

    localStorage.setItem('skilllens_access_token', accessToken);
    localStorage.setItem('skilllens_refresh_token', refreshToken);
    localStorage.setItem('skilllens_user', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (registerData) => {
    const response = await api.post('/auth/register', registerData);
    const { accessToken, refreshToken, user: userData } = response.data;

    localStorage.setItem('skilllens_access_token', accessToken);
    localStorage.setItem('skilllens_refresh_token', refreshToken);
    localStorage.setItem('skilllens_user', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('skilllens_refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.warn('Logout API error:', e.message);
    } finally {
      localStorage.removeItem('skilllens_access_token');
      localStorage.removeItem('skilllens_refresh_token');
      localStorage.removeItem('skilllens_user');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('skilllens_user', JSON.stringify(updated));
      return updated;
    });
  };

  const role = user?.role || null;
  const isStudent = role === 'STUDENT';
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isStudent,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
