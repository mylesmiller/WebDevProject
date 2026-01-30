import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppProviders from './AppProviders';
import LoginForm from './components/auth/LoginForm';
import PassengerLogin from './components/auth/PassengerLogin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import AirlineStaffDashboard from './components/airline/AirlineStaffDashboard';
import GateStaffDashboard from './components/gate/GateStaffDashboard';
import GroundStaffDashboard from './components/ground/GroundStaffDashboard';
import PassengerDashboard from './components/passenger/PassengerDashboard';
import { ROLES } from './utils/constants';
import './App.css';

function App() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/passenger-login" element={<PassengerLogin />} />

          {/* Protected routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/airline/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.AIRLINE_STAFF]}>
                <AirlineStaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gate/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.GATE_STAFF]}>
                <GateStaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ground/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.GROUND_STAFF]}>
                <GroundStaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passenger/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PASSENGER]}>
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}

export default App;
