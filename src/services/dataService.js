import StorageService from './storageService';
import seedData from './seedData';
import { STORAGE_KEYS } from '../utils/constants';

// Initialize app data
export const initializeData = () => {
  // Check if data already exists
  const existingUsers = StorageService.get(STORAGE_KEYS.USERS);

  // If no data exists, seed initial data
  if (!existingUsers) {
    StorageService.set(STORAGE_KEYS.USERS, seedData.users);
    StorageService.set(STORAGE_KEYS.FLIGHTS, seedData.flights);
    StorageService.set(STORAGE_KEYS.PASSENGERS, seedData.passengers);
    StorageService.set(STORAGE_KEYS.BAGS, seedData.bags);
    StorageService.set(STORAGE_KEYS.MESSAGES, seedData.messages);
    console.log('Initial data seeded successfully');
  }
};

// Reset data to seed state
export const resetData = () => {
  StorageService.set(STORAGE_KEYS.USERS, seedData.users);
  StorageService.set(STORAGE_KEYS.FLIGHTS, seedData.flights);
  StorageService.set(STORAGE_KEYS.PASSENGERS, seedData.passengers);
  StorageService.set(STORAGE_KEYS.BAGS, seedData.bags);
  StorageService.set(STORAGE_KEYS.MESSAGES, seedData.messages);
  console.log('Data reset to seed state');
};

// Clear all data
export const clearAllData = () => {
  StorageService.clear();
  console.log('All data cleared');
};

export default {
  initializeData,
  resetData,
  clearAllData
};
