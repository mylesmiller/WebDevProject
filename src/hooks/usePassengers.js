import { useContext } from 'react';
import { PassengerContext } from '../context/PassengerContext';

export const usePassengers = () => {
  const context = useContext(PassengerContext);

  if (!context) {
    throw new Error('usePassengers must be used within a PassengerProvider');
  }

  return context;
};

export default usePassengers;
