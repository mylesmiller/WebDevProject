import React, { createContext, useState, useCallback } from 'react';
import StorageService from '../services/storageService';
import { STORAGE_KEYS, FLIGHT_STATUS } from '../utils/constants';
import { generateFlightId } from '../utils/generators';

export const FlightContext = createContext();

export const FlightProvider = ({ children }) => {
  const [flights, setFlights] = useState(() => {
    return StorageService.get(STORAGE_KEYS.FLIGHTS) || {};
  });

  // Refresh flights from storage
  const refreshFlights = useCallback(() => {
    const flightsData = StorageService.get(STORAGE_KEYS.FLIGHTS) || {};
    setFlights(flightsData);
  }, []);

  // Get all flights
  const getAllFlights = useCallback(() => {
    return Object.values(flights);
  }, [flights]);

  // Get flights by airline
  const getFlightsByAirline = useCallback((airline) => {
    return Object.values(flights).filter(f => f.airline === airline);
  }, [flights]);

  // Get flight by ID
  const getFlightById = useCallback((flightId) => {
    return flights[flightId];
  }, [flights]);

  // Add flight
  const addFlight = useCallback((flightData) => {
    const flightsData = StorageService.get(STORAGE_KEYS.FLIGHTS) || {};

    // Check if flight number already exists
    const exists = Object.values(flightsData).some(
      f => f.flightNumber === flightData.flightNumber && f.status !== FLIGHT_STATUS.DEPARTED
    );

    if (exists) {
      throw new Error('Flight number already exists');
    }

    // Create new flight
    const newFlight = {
      id: generateFlightId(flightData.airline, flightData.flightNumber),
      airline: flightData.airline,
      flightNumber: flightData.flightNumber,
      gate: flightData.gate,
      destination: flightData.destination,
      departureTime: flightData.departureTime,
      status: FLIGHT_STATUS.SCHEDULED,
      passengerIds: []
    };

    // Save to storage
    flightsData[newFlight.id] = newFlight;
    StorageService.set(STORAGE_KEYS.FLIGHTS, flightsData);
    setFlights(flightsData);

    return newFlight;
  }, []);

  // Update flight
  const updateFlight = useCallback((flightId, updates) => {
    const flightsData = StorageService.get(STORAGE_KEYS.FLIGHTS) || {};

    if (!flightsData[flightId]) {
      throw new Error('Flight not found');
    }

    flightsData[flightId] = {
      ...flightsData[flightId],
      ...updates
    };

    StorageService.set(STORAGE_KEYS.FLIGHTS, flightsData);
    setFlights(flightsData);

    return flightsData[flightId];
  }, []);

  // Remove flight
  const removeFlight = useCallback((flightId) => {
    const flightsData = StorageService.get(STORAGE_KEYS.FLIGHTS) || {};
    const passengers = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};

    // Check if flight has passengers
    const hasPassengers = Object.values(passengers).some(p => p.flightId === flightId);

    if (hasPassengers) {
      throw new Error('Cannot remove flight with passengers. Remove passengers first.');
    }

    delete flightsData[flightId];
    StorageService.set(STORAGE_KEYS.FLIGHTS, flightsData);
    setFlights(flightsData);
  }, []);

  // Add passenger to flight
  const addPassengerToFlight = useCallback((flightId, passengerId) => {
    const flightsData = StorageService.get(STORAGE_KEYS.FLIGHTS) || {};

    if (!flightsData[flightId]) {
      throw new Error('Flight not found');
    }

    if (!flightsData[flightId].passengerIds.includes(passengerId)) {
      flightsData[flightId].passengerIds.push(passengerId);
      StorageService.set(STORAGE_KEYS.FLIGHTS, flightsData);
      setFlights(flightsData);
    }
  }, []);

  // Remove passenger from flight
  const removePassengerFromFlight = useCallback((flightId, passengerId) => {
    const flightsData = StorageService.get(STORAGE_KEYS.FLIGHTS) || {};

    if (!flightsData[flightId]) {
      throw new Error('Flight not found');
    }

    flightsData[flightId].passengerIds = flightsData[flightId].passengerIds.filter(
      id => id !== passengerId
    );

    StorageService.set(STORAGE_KEYS.FLIGHTS, flightsData);
    setFlights(flightsData);
  }, []);

  // Change gate (validates no conflict and returns old gate for notification)
  const changeGate = useCallback((flightId, newGate) => {
    const flightsData = StorageService.get(STORAGE_KEYS.FLIGHTS) || {};

    if (!flightsData[flightId]) {
      throw new Error('Flight not found');
    }

    // Check if new gate is already in use by another active flight
    const gateInUse = Object.values(flightsData).some(
      f => f.id !== flightId &&
           f.gate === newGate &&
           f.status !== FLIGHT_STATUS.DEPARTED &&
           f.status !== FLIGHT_STATUS.CANCELLED
    );

    if (gateInUse) {
      throw new Error(`Gate ${newGate} is already in use by another flight`);
    }

    const oldGate = flightsData[flightId].gate;

    flightsData[flightId].gate = newGate;
    StorageService.set(STORAGE_KEYS.FLIGHTS, flightsData);
    setFlights(flightsData);

    return { oldGate, newGate, flight: flightsData[flightId] };
  }, []);

  const value = {
    flights,
    getAllFlights,
    getFlightsByAirline,
    getFlightById,
    addFlight,
    updateFlight,
    removeFlight,
    addPassengerToFlight,
    removePassengerFromFlight,
    changeGate,
    refreshFlights
  };

  return <FlightContext.Provider value={value}>{children}</FlightContext.Provider>;
};
