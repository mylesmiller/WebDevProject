import React, { createContext, useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import { FLIGHT_STATUS } from '../utils/constants';

export const FlightContext = createContext();

export const FlightProvider = ({ children }) => {
  const [flights, setFlights] = useState([]);

  const loadFlights = useCallback(async () => {
    try {
      const data = await apiService.get('/api/flights');
      setFlights(data);
    } catch (err) {
      // Not authenticated yet - will load when ready
    }
  }, []);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  // Get all flights
  const getAllFlights = useCallback(() => {
    return flights;
  }, [flights]);

  // Get flights by airline
  const getFlightsByAirline = useCallback((airline) => {
    return flights.filter(f => f.airline === airline);
  }, [flights]);

  // Get flight by ID
  const getFlightById = useCallback((flightId) => {
    return flights.find(f => f.id === flightId);
  }, [flights]);

  // Add flight
  const addFlight = useCallback(async (flightData) => {
    const newFlight = await apiService.post('/api/flights', flightData);
    setFlights(prev => [...prev, newFlight]);
    return newFlight;
  }, []);

  // Update flight
  const updateFlight = useCallback(async (flightId, updates) => {
    const updated = await apiService.put(`/api/flights/${flightId}`, updates);
    setFlights(prev => prev.map(f => f.id === flightId ? updated : f));
    return updated;
  }, []);

  // Remove flight
  const removeFlight = useCallback(async (flightId) => {
    await apiService.delete(`/api/flights/${flightId}`);
    setFlights(prev => prev.filter(f => f.id !== flightId));
  }, []);

  // Change gate
  const changeGate = useCallback(async (flightId, newGate) => {
    const flight = flights.find(f => f.id === flightId);
    const oldGate = flight?.gate;
    const updated = await apiService.put(`/api/flights/${flightId}`, { gate: newGate });
    setFlights(prev => prev.map(f => f.id === flightId ? updated : f));
    return { oldGate, newGate, flight: updated };
  }, [flights]);

  // Refresh flights
  const refreshFlights = useCallback(async () => {
    await loadFlights();
  }, [loadFlights]);

  const value = {
    flights,
    getAllFlights,
    getFlightsByAirline,
    getFlightById,
    addFlight,
    updateFlight,
    removeFlight,
    changeGate,
    refreshFlights
  };

  return <FlightContext.Provider value={value}>{children}</FlightContext.Provider>;
};
