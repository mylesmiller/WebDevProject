import { useContext } from 'react';
import { BagContext } from '../context/BagContext';

export const useBags = () => {
  const context = useContext(BagContext);

  if (!context) {
    throw new Error('useBags must be used within a BagProvider');
  }

  return context;
};

export default useBags;
