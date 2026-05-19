import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      if (data && data.role === 'admin') {
        setUser(data);
        setIsAuthenticated(true);
      } else {
        // If not admin, do not allow access
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Session recovery failed:', err);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.user?.role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout request failed', e);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};