import React, { createContext, useState, useCallback } from 'react';
import StorageService from '../services/storageService';
import { STORAGE_KEYS, BAG_LOCATIONS, PASSENGER_STATUS } from '../utils/constants';

export const BagContext = createContext();

export const BagProvider = ({ children }) => {
  const [bags, setBags] = useState(() => {
    return StorageService.get(STORAGE_KEYS.BAGS) || {};
  });

  // Refresh bags from storage
  const refreshBags = useCallback(() => {
    const bagsData = StorageService.get(STORAGE_KEYS.BAGS) || {};
    setBags(bagsData);
  }, []);

  // Get all bags
  const getAllBags = useCallback(() => {
    return Object.values(bags);
  }, [bags]);

  // Get bags by flight
  const getBagsByFlight = useCallback((flightId) => {
    return Object.values(bags).filter(b => b.flightId === flightId);
  }, [bags]);

  // Get bags by passenger
  const getBagsByPassenger = useCallback((passengerId) => {
    return Object.values(bags).filter(b => b.passengerId === passengerId);
  }, [bags]);

  // Get bag by ID
  const getBagById = useCallback((bagId) => {
    return bags[bagId];
  }, [bags]);

  // Get bags by location
  const getBagsByLocation = useCallback((location) => {
    return Object.values(bags).filter(b => b.location === location);
  }, [bags]);

  // Add bag
  const addBag = useCallback((bagData, staffId) => {
    const bagsData = StorageService.get(STORAGE_KEYS.BAGS) || {};
    const passengers = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};

    // Check if bag ID already exists
    if (bagsData[bagData.bagId]) {
      throw new Error('Bag ID already exists');
    }

    // Find passenger by ticket number
    const passenger = Object.values(passengers).find(
      p => p.ticketNumber === bagData.ticketNumber
    );

    if (!passenger) {
      throw new Error('Passenger not found with this ticket number');
    }

    // Create new bag
    const newBag = {
      id: bagData.bagId,
      ticketNumber: bagData.ticketNumber,
      passengerId: passenger.id,
      flightId: passenger.flightId,
      location: BAG_LOCATIONS.CHECK_IN,
      timeline: [
        {
          location: BAG_LOCATIONS.CHECK_IN,
          timestamp: new Date().toISOString(),
          handledBy: staffId
        }
      ]
    };

    // Save to storage
    bagsData[newBag.id] = newBag;
    StorageService.set(STORAGE_KEYS.BAGS, bagsData);
    setBags(bagsData);

    // Update passenger bag list
    passenger.bagIds.push(newBag.id);
    passengers[passenger.id] = passenger;
    StorageService.set(STORAGE_KEYS.PASSENGERS, passengers);

    return newBag;
  }, []);

  // Update bag location
  const updateBagLocation = useCallback((bagId, location, staffId) => {
    const bagsData = StorageService.get(STORAGE_KEYS.BAGS) || {};
    const passengers = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};

    if (!bagsData[bagId]) {
      throw new Error('Bag not found');
    }

    const bag = bagsData[bagId];

    // If loading bag, verify passenger is boarded
    if (location === BAG_LOCATIONS.LOADED) {
      const passenger = passengers[bag.passengerId];
      if (!passenger || passenger.status !== PASSENGER_STATUS.BOARDED) {
        throw new Error('Passenger must be boarded before loading bags');
      }
    }

    // Update location and add to timeline
    bag.location = location;
    bag.timeline.push({
      location,
      timestamp: new Date().toISOString(),
      handledBy: staffId
    });

    bagsData[bagId] = bag;
    StorageService.set(STORAGE_KEYS.BAGS, bagsData);
    setBags(bagsData);

    return bag;
  }, []);

  // Check if all bags for a flight are loaded
  const areAllBagsLoaded = useCallback((flightId) => {
    const flightBags = Object.values(bags).filter(b => b.flightId === flightId);

    if (flightBags.length === 0) {
      return true; // No bags, consider as loaded
    }

    return flightBags.every(b => b.location === BAG_LOCATIONS.LOADED);
  }, [bags]);

  // Get bags not loaded for a flight
  const getUnloadedBags = useCallback((flightId) => {
    return Object.values(bags).filter(
      b => b.flightId === flightId && b.location !== BAG_LOCATIONS.LOADED
    );
  }, [bags]);

  const value = {
    bags,
    getAllBags,
    getBagsByFlight,
    getBagsByPassenger,
    getBagById,
    getBagsByLocation,
    addBag,
    updateBagLocation,
    areAllBagsLoaded,
    getUnloadedBags,
    refreshBags
  };

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
};
