import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { StaffProvider } from './context/StaffContext';
import { FlightProvider } from './context/FlightContext';
import { PassengerProvider } from './context/PassengerContext';
import { BagProvider } from './context/BagContext';
import { MessageProvider } from './context/MessageContext';

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <StaffProvider>
        <FlightProvider>
          <PassengerProvider>
            <BagProvider>
              <MessageProvider>
                {children}
              </MessageProvider>
            </BagProvider>
          </PassengerProvider>
        </FlightProvider>
      </StaffProvider>
    </AuthProvider>
  );
};

export default AppProviders;
