import React, { createContext, useState, useCallback } from 'react';
import StorageService from '../services/storageService';
import { STORAGE_KEYS, PASSENGER_STATUS } from '../utils/constants';

export const PassengerContext = createContext();

export const PassengerProvider = ({ children }) => {
  const [passengers, setPassengers] = useState(() => {
    return StorageService.get(STORAGE_KEYS.PASSENGERS) || {};
  });

  // Refresh passengers from storage
  const refreshPassengers = useCallback(() => {
    const passengersData = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};
    setPassengers(passengersData);
  }, []);

  // Get all passengers
  const getAllPassengers = useCallback(() => {
    return Object.values(passengers);
  }, [passengers]);

  // Get passengers by flight
  const getPassengersByFlight = useCallback((flightId) => {
    return Object.values(passengers).filter(p => p.flightId === flightId);
  }, [passengers]);

  // Get passenger by ID
  const getPassengerById = useCallback((passengerId) => {
    return passengers[passengerId];
  }, [passengers]);

  // Get passenger by ticket number
  const getPassengerByTicket = useCallback((ticketNumber) => {
    return Object.values(passengers).find(p => p.ticketNumber === ticketNumber);
  }, [passengers]);

  // Add passenger
  const addPassenger = useCallback((passengerData) => {
    const passengersData = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};
    const flights = StorageService.get(STORAGE_KEYS.FLIGHTS) || {};

    // Check if passenger ID already exists
    if (passengersData[passengerData.passengerId]) {
      throw new Error('Passenger ID already exists');
    }

    // Check if ticket number already exists
    const ticketExists = Object.values(passengersData).some(
      p => p.ticketNumber === passengerData.ticketNumber
    );

    if (ticketExists) {
      throw new Error('Ticket number already exists. One ticket per passenger.');
    }

    // Verify flight exists
    if (!flights[passengerData.flightId]) {
      throw new Error('Flight does not exist');
    }

    // Create new passenger
    const newPassenger = {
      id: passengerData.passengerId,
      name: passengerData.name,
      ticketNumber: passengerData.ticketNumber,
      flightId: passengerData.flightId,
      status: PASSENGER_STATUS.NOT_CHECKED_IN,
      email: passengerData.email || '',
      phone: passengerData.phone || '',
      bagIds: [],
      checkedInAt: null,
      checkedInBy: null,
      boardedAt: null,
      boardedBy: null
    };

    // Save to storage
    passengersData[newPassenger.id] = newPassenger;
    StorageService.set(STORAGE_KEYS.PASSENGERS, passengersData);
    setPassengers(passengersData);

    // Update flight passenger list
    flights[passengerData.flightId].passengerIds.push(newPassenger.id);
    StorageService.set(STORAGE_KEYS.FLIGHTS, flights);

    return newPassenger;
  }, []);

  // Remove passenger
  const removePassenger = useCallback((passengerId) => {
    const passengersData = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};
    const flights = StorageService.get(STORAGE_KEYS.FLIGHTS) || {};
    const bags = StorageService.get(STORAGE_KEYS.BAGS) || {};

    const passenger = passengersData[passengerId];
    if (!passenger) {
      throw new Error('Passenger not found');
    }

    // Remove associated bags
    passenger.bagIds.forEach(bagId => {
      delete bags[bagId];
    });
    StorageService.set(STORAGE_KEYS.BAGS, bags);

    // Remove from flight
    const flight = flights[passenger.flightId];
    if (flight) {
      flight.passengerIds = flight.passengerIds.filter(id => id !== passengerId);
      StorageService.set(STORAGE_KEYS.FLIGHTS, flights);
    }

    // Remove passenger
    delete passengersData[passengerId];
    StorageService.set(STORAGE_KEYS.PASSENGERS, passengersData);
    setPassengers(passengersData);
  }, []);

  // Check in passenger
  const checkInPassenger = useCallback((passengerId, staffId) => {
    const passengersData = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};

    if (!passengersData[passengerId]) {
      throw new Error('Passenger not found');
    }

    if (passengersData[passengerId].status !== PASSENGER_STATUS.NOT_CHECKED_IN) {
      throw new Error('Passenger is already checked in');
    }

    passengersData[passengerId].status = PASSENGER_STATUS.CHECKED_IN;
    passengersData[passengerId].checkedInAt = new Date().toISOString();
    passengersData[passengerId].checkedInBy = staffId;

    StorageService.set(STORAGE_KEYS.PASSENGERS, passengersData);
    setPassengers(passengersData);

    return passengersData[passengerId];
  }, []);

  // Board passenger
  const boardPassenger = useCallback((passengerId, staffId) => {
    const passengersData = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};

    if (!passengersData[passengerId]) {
      throw new Error('Passenger not found');
    }

    if (passengersData[passengerId].status === PASSENGER_STATUS.NOT_CHECKED_IN) {
      throw new Error('Passenger must be checked in before boarding');
    }

    if (passengersData[passengerId].status === PASSENGER_STATUS.BOARDED) {
      throw new Error('Passenger is already boarded');
    }

    passengersData[passengerId].status = PASSENGER_STATUS.BOARDED;
    passengersData[passengerId].boardedAt = new Date().toISOString();
    passengersData[passengerId].boardedBy = staffId;

    StorageService.set(STORAGE_KEYS.PASSENGERS, passengersData);
    setPassengers(passengersData);

    return passengersData[passengerId];
  }, []);

  // Add bag to passenger
  const addBagToPassenger = useCallback((passengerId, bagId) => {
    const passengersData = StorageService.get(STORAGE_KEYS.PASSENGERS) || {};

    if (!passengersData[passengerId]) {
      throw new Error('Passenger not found');
    }

    if (!passengersData[passengerId].bagIds.includes(bagId)) {
      passengersData[passengerId].bagIds.push(bagId);
      StorageService.set(STORAGE_KEYS.PASSENGERS, passengersData);
      setPassengers(passengersData);
    }
  }, []);

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
    addBagToPassenger,
    refreshPassengers
  };

  return <PassengerContext.Provider value={value}>{children}</PassengerContext.Provider>;
};
