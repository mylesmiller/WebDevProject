import React, { createContext, useState, useCallback } from 'react';
import StorageService from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';
import { generateUsername, generatePassword, generateUserId } from '../utils/generators';
import { hashPassword } from '../utils/encryption';

export const StaffContext = createContext();

export const StaffProvider = ({ children }) => {
  const [staff, setStaff] = useState(() => {
    return StorageService.get(STORAGE_KEYS.USERS) || {};
  });

  // Refresh staff from storage
  const refreshStaff = useCallback(() => {
    const users = StorageService.get(STORAGE_KEYS.USERS) || {};
    setStaff(users);
  }, []);

  // Get all staff members
  const getAllStaff = useCallback(() => {
    return Object.values(staff);
  }, [staff]);

  // Get staff by role
  const getStaffByRole = useCallback((role) => {
    return Object.values(staff).filter(s => s.role === role);
  }, [staff]);

  // Get staff by airline
  const getStaffByAirline = useCallback((airline) => {
    return Object.values(staff).filter(s => s.airline === airline);
  }, [staff]);

  // Add staff member with auto-generated credentials
  const addStaff = useCallback((staffData) => {
    const users = StorageService.get(STORAGE_KEYS.USERS) || {};

    // Generate username and password
    const username = generateUsername(staffData.name, staffData.role);
    const plainPassword = generatePassword();
    const hashedPassword = hashPassword(plainPassword);

    // Create new staff member
    const newStaff = {
      id: generateUserId(users),
      username,
      password: hashedPassword,
      role: staffData.role,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      airline: staffData.airline || null
    };

    // Save to storage
    users[newStaff.id] = newStaff;
    StorageService.set(STORAGE_KEYS.USERS, users);
    setStaff(users);

    // Return credentials (password in plain text, only shown once)
    return {
      ...newStaff,
      plainPassword
    };
  }, []);

  // Remove staff member
  const removeStaff = useCallback((staffId) => {
    const users = StorageService.get(STORAGE_KEYS.USERS) || {};

    // Don't allow removing admin
    if (users[staffId]?.role === 'admin') {
      throw new Error('Cannot remove admin user');
    }

    delete users[staffId];
    StorageService.set(STORAGE_KEYS.USERS, users);
    setStaff(users);
  }, []);

  // Get staff by ID
  const getStaffById = useCallback((staffId) => {
    return staff[staffId];
  }, [staff]);

  const value = {
    staff,
    getAllStaff,
    getStaffByRole,
    getStaffByAirline,
    addStaff,
    removeStaff,
    getStaffById,
    refreshStaff
  };

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};
