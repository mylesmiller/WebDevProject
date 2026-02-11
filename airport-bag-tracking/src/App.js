import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Pages
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

// Dashboards
import { AdminDashboard } from './components/admin';
import { AirlineStaffDashboard } from './components/airlineStaff';
import { GateStaffDashboard } from './components/gateStaff';
import { GroundStaffDashboard } from './components/groundStaff';
import { PassengerDashboard } from './components/passenger';

import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, allowedTypes }) => {
  const { currentUser, userType } = useApp();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  const { currentUser, userType } = useApp();

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to={`/${userType === 'airlineStaff' ? 'airline-staff' : userType === 'gateStaff' ? 'gate-staff' : userType === 'groundStaff' ? 'ground-staff' : userType}`} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Change password route */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute allowedTypes={['airlineStaff', 'gateStaff', 'groundStaff']}>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedTypes={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Airline Staff routes */}
      <Route
        path="/airline-staff"
        element={
          <ProtectedRoute allowedTypes={['airlineStaff']}>
            <AirlineStaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* Gate Staff routes */}
      <Route
        path="/gate-staff"
        element={
          <ProtectedRoute allowedTypes={['gateStaff']}>
            <GateStaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* Ground Staff routes */}
      <Route
        path="/ground-staff"
        element={
          <ProtectedRoute allowedTypes={['groundStaff']}>
            <GroundStaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* Passenger routes (Bonus) */}
      <Route
        path="/passenger"
        element={
          <ProtectedRoute allowedTypes={['passenger']}>
            <PassengerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
