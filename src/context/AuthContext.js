import React, { createContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { ROLES } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    apiService.get('/api/auth/me')
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Staff/Admin login
  const login = async (username, password) => {
    const sessionUser = await apiService.post('/api/auth/login', { username, password });
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  // Passenger login
  const loginPassenger = async (passengerId, ticketNumber) => {
    const sessionUser = await apiService.post('/api/auth/login-passenger', { passengerId, ticketNumber });
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  // Logout
  const logout = async () => {
    await apiService.post('/api/auth/logout', {});
    setCurrentUser(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(currentUser?.role);
  };

  // Update current user session (e.g., after password change)
  const updateCurrentUser = (updates) => {
    if (!currentUser) return;
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const value = {
    currentUser,
    login,
    loginPassenger,
    logout,
    hasRole,
    hasAnyRole,
    updateCurrentUser,
    loading,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
