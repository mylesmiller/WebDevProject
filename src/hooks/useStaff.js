import { useContext } from 'react';
import { StaffContext } from '../context/StaffContext';

export const useStaff = () => {
  const context = useContext(StaffContext);

  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }

  return context;
};

export default useStaff;
