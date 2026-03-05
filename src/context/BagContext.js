import React, { createContext, useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import { BAG_LOCATIONS } from '../utils/constants';

export const BagContext = createContext();

export const BagProvider = ({ children }) => {
  const [bags, setBags] = useState([]);

  const loadBags = useCallback(async () => {
    try {
      const data = await apiService.get('/api/bags');
      setBags(data);
    } catch (err) {
      // Not authenticated yet
    }
  }, []);

  useEffect(() => {
    loadBags();
  }, [loadBags]);

  // Get all bags
  const getAllBags = useCallback(() => {
    return bags;
  }, [bags]);

  // Get bags by flight
  const getBagsByFlight = useCallback((flightId) => {
    return bags.filter(b => b.flightId === flightId);
  }, [bags]);

  // Get bags by passenger
  const getBagsByPassenger = useCallback((passengerId) => {
    return bags.filter(b => b.passengerId === passengerId);
  }, [bags]);

  // Get bag by ID
  const getBagById = useCallback((bagId) => {
    return bags.find(b => b.id === bagId);
  }, [bags]);

  // Get bags by location
  const getBagsByLocation = useCallback((location) => {
    return bags.filter(b => b.location === location);
  }, [bags]);

  // Add bag
  const addBag = useCallback(async (bagData) => {
    const newBag = await apiService.post('/api/bags', bagData);
    setBags(prev => [...prev, newBag]);
    return newBag;
  }, []);

  // Update bag location
  const updateBagLocation = useCallback(async (bagId, location) => {
    const updated = await apiService.put(`/api/bags/${bagId}/location`, { location });
    setBags(prev => prev.map(b => b.id === bagId ? updated : b));
    return updated;
  }, []);

  // Remove bag
  const removeBag = useCallback(async (bagId) => {
    await apiService.delete(`/api/bags/${bagId}`);
    setBags(prev => prev.filter(b => b.id !== bagId));
  }, []);

  // Check if all bags for a flight are loaded
  const areAllBagsLoaded = useCallback((flightId) => {
    const flightBags = bags.filter(b => b.flightId === flightId);
    if (flightBags.length === 0) return true;
    return flightBags.every(b => b.location === BAG_LOCATIONS.LOADED);
  }, [bags]);

  // Get bags not loaded for a flight
  const getUnloadedBags = useCallback((flightId) => {
    return bags.filter(
      b => b.flightId === flightId && b.location !== BAG_LOCATIONS.LOADED
    );
  }, [bags]);

  // Check if all passenger bags at gate
  const arePassengerBagsAtGate = useCallback((passengerId) => {
    const passengerBags = bags.filter(b => b.passengerId === passengerId);
    if (passengerBags.length === 0) return true;
    return passengerBags.every(b =>
      b.location === BAG_LOCATIONS.GATE || b.location === BAG_LOCATIONS.LOADED
    );
  }, [bags]);

  // Check security violation
  const hasPassengerSecurityViolation = useCallback((passengerId) => {
    return bags.filter(b => b.passengerId === passengerId)
      .some(b => b.location === BAG_LOCATIONS.SECURITY_VIOLATION);
  }, [bags]);

  // Get bags not at gate
  const getPassengerBagsNotAtGate = useCallback((passengerId) => {
    return bags.filter(
      b => b.passengerId === passengerId &&
        b.location !== BAG_LOCATIONS.GATE &&
        b.location !== BAG_LOCATIONS.LOADED
    );
  }, [bags]);

  // Refresh bags
  const refreshBags = useCallback(async () => {
    await loadBags();
  }, [loadBags]);

  const value = {
    bags,
    getAllBags,
    getBagsByFlight,
    getBagsByPassenger,
    getBagById,
    getBagsByLocation,
    addBag,
    removeBag,
    updateBagLocation,
    areAllBagsLoaded,
    getUnloadedBags,
    arePassengerBagsAtGate,
    hasPassengerSecurityViolation,
    getPassengerBagsNotAtGate,
    refreshBags
  };

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
};
