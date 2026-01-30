import React, { createContext, useState, useEffect } from 'react';
import StorageService from '../services/storageService';
import { STORAGE_KEYS, ROLES } from '../utils/constants';
import { verifyPassword } from '../utils/encryption';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user from localStorage on mount
  useEffect(() => {
    const savedUser = StorageService.get(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setLoading(false);
  }, []);

  // Staff/Admin login
  const login = (username, password) => {
    const users = StorageService.get(STORAGE_KEYS.USERS) || {};

    // Find user by username
    const user = Object.values(users).find(u => u.username === username);

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      throw new Error('Invalid username or password');
    }

    // Don't allow passenger role to login via staff login
    if (user.role === ROLES.PASSENGER) {
      throw new Error('Passengers must use passenger login');
    }

    // Create session user object (without password)
    const sessionUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      airline: user.airline
    };

    setCurrentUser(sessionUser);
    StorageService.set(STORAGE_KEYS.CURRENT_USER, sessionUser);

    return sessionUser;
  };

  // Passenger login
  const loginPassenger = (passengerId, ticketNumber) => {
    const passengers = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};

    // Find passenger by ID and ticket number
    const passenger = passengers[passengerId];

    if (!passenger || passenger.ticketNumber !== ticketNumber) {
      throw new Error('Invalid passenger ID or ticket number');
    }

    // Create session user object
    const sessionUser = {
      id: passenger.id,
      role: ROLES.PASSENGER,
      name: passenger.name,
      ticketNumber: passenger.ticketNumber,
      flightId: passenger.flightId,
      passengerId: passenger.id
    };

    setCurrentUser(sessionUser);
    StorageService.set(STORAGE_KEYS.CURRENT_USER, sessionUser);

    return sessionUser;
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    StorageService.remove(STORAGE_KEYS.CURRENT_USER);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(currentUser?.role);
  };

  const value = {
    currentUser,
    login,
    loginPassenger,
    logout,
    hasRole,
    hasAnyRole,
    loading,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
