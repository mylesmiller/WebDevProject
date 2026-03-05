import React, { createContext, useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';

export const StaffContext = createContext();

export const StaffProvider = ({ children }) => {
  const [staff, setStaff] = useState([]);

  const loadStaff = useCallback(async () => {
    try {
      const data = await apiService.get('/api/staff');
      setStaff(data);
    } catch (err) {
      // Not authenticated yet
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Get all staff members
  const getAllStaff = useCallback(() => {
    return staff;
  }, [staff]);

  // Get staff by role
  const getStaffByRole = useCallback((role) => {
    return staff.filter(s => s.role === role);
  }, [staff]);

  // Get staff by airline
  const getStaffByAirline = useCallback((airline) => {
    return staff.filter(s => s.airline === airline);
  }, [staff]);

  // Get staff by ID
  const getStaffById = useCallback((staffId) => {
    return staff.find(s => s.id === staffId);
  }, [staff]);

  // Add staff member
  const addStaff = useCallback(async (staffData) => {
    const result = await apiService.post('/api/staff', staffData);
    setStaff(prev => [...prev, result]);
    return result;
  }, []);

  // Remove staff member
  const removeStaff = useCallback(async (staffId) => {
    await apiService.delete(`/api/staff/${staffId}`);
    setStaff(prev => prev.filter(s => s.id !== staffId));
  }, []);

  // Change password
  const changePassword = useCallback(async (staffId, newPassword) => {
    await apiService.put('/api/auth/change-password', { newPassword });
  }, []);

  // Refresh staff
  const refreshStaff = useCallback(async () => {
    await loadStaff();
  }, [loadStaff]);

  const value = {
    staff,
    getAllStaff,
    getStaffByRole,
    getStaffByAirline,
    addStaff,
    removeStaff,
    getStaffById,
    changePassword,
    refreshStaff
  };

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};
