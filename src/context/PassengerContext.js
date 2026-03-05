import React, { createContext, useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import { PASSENGER_STATUS } from '../utils/constants';

export const PassengerContext = createContext();

export const PassengerProvider = ({ children }) => {
  const [passengers, setPassengers] = useState([]);

  const loadPassengers = useCallback(async () => {
    try {
      const data = await apiService.get('/api/passengers');
      setPassengers(data);
    } catch (err) {
      // Not authenticated yet
    }
  }, []);

  useEffect(() => {
    loadPassengers();
  }, [loadPassengers]);

  // Get all passengers
  const getAllPassengers = useCallback(() => {
    return passengers;
  }, [passengers]);

  // Get passengers by flight
  const getPassengersByFlight = useCallback((flightId) => {
    return passengers.filter(p => p.flightId === flightId);
  }, [passengers]);

  // Get passenger by ID
  const getPassengerById = useCallback((passengerId) => {
    return passengers.find(p => p.id === passengerId);
  }, [passengers]);

  // Get passenger by ticket number
  const getPassengerByTicket = useCallback((ticketNumber) => {
    return passengers.find(p => p.ticketNumber === ticketNumber);
  }, [passengers]);

  // Add passenger
  const addPassenger = useCallback(async (passengerData) => {
    const newPassenger = await apiService.post('/api/passengers', passengerData);
    setPassengers(prev => [...prev, newPassenger]);
    return newPassenger;
  }, []);

  // Remove passenger
  const removePassenger = useCallback(async (passengerId) => {
    await apiService.delete(`/api/passengers/${passengerId}`);
    setPassengers(prev => prev.filter(p => p.id !== passengerId));
  }, []);

  // Check in passenger
  const checkInPassenger = useCallback(async (passengerId) => {
    const updated = await apiService.put(`/api/passengers/${passengerId}/checkin`, {});
    setPassengers(prev => prev.map(p => p.id === passengerId ? updated : p));
    return updated;
  }, []);

  // Board passenger
  const boardPassenger = useCallback(async (passengerId) => {
    const updated = await apiService.put(`/api/passengers/${passengerId}/board`, {});
    setPassengers(prev => prev.map(p => p.id === passengerId ? updated : p));
    return updated;
  }, []);

  // Refresh passengers
  const refreshPassengers = useCallback(async () => {
    await loadPassengers();
  }, [loadPassengers]);

  const value = {
    passengers,
    getAllPassengers,
    getPassengersByFlight,
    getPassengerById,
    getPassengerByTicket,
    addPassenger,
    removePassenger,
    checkInPassenger,
    boardPassenger,
    refreshPassengers
  };

  return <PassengerContext.Provider value={value}>{children}</PassengerContext.Provider>;
};
