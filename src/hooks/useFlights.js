import { useContext } from 'react';
import { FlightContext } from '../context/FlightContext';

export const useFlights = () => {
  const context = useContext(FlightContext);

  if (!context) {
    throw new Error('useFlights must be used within a FlightProvider');
  }

  return context;
};

export default useFlights;
