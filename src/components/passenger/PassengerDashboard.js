import React from 'react';
import Navbar from '../common/Navbar';
import useAuth from '../../hooks/useAuth';
import usePassengers from '../../hooks/usePassengers';
import useFlights from '../../hooks/useFlights';
import useBags from '../../hooks/useBags';
import BagTracker from './BagTracker';
import { getPassengerStatusDisplayName, formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const PassengerDashboard = () => {
  const { currentUser } = useAuth();
  const { getPassengerById } = usePassengers();
  const { getFlightById } = useFlights();
  const { getBagsByPassenger } = useBags();

  const passenger = getPassengerById(currentUser.passengerId);
  const flight = passenger ? getFlightById(passenger.flightId) : null;
  const bags = passenger ? getBagsByPassenger(passenger.id) : [];

  if (!passenger || !flight) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-main">
          <div className="error-message">Passenger information not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-main">
        <h1 className="section-title">Passenger Dashboard</h1>

        <div className="card mb-lg">
          <h2 className="mb-md">Flight Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div>
              <strong>Flight Number:</strong> {flight.flightNumber}
            </div>
            {passenger.status !== 'not-checked-in' && (
              <div>
                <strong>Gate:</strong> {flight.gate}
              </div>
            )}
            {flight.destination && (
              <div>
                <strong>Destination:</strong> {flight.destination}
              </div>
            )}
            {flight.departureTime && (
              <div>
                <strong>Departure:</strong> {formatDate(flight.departureTime)}
              </div>
            )}
            <div>
              <strong>Flight Status:</strong>{' '}
              <span className={`status-badge status-${flight.status}`}>
                {flight.status}
              </span>
            </div>
          </div>
        </div>

        <div className="card mb-lg">
          <h2 className="mb-md">Your Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div>
              <strong>Check-In Status:</strong>{' '}
              <span className={`status-badge status-${passenger.status}`}>
                {getPassengerStatusDisplayName(passenger.status)}
              </span>
            </div>
            <div>
              <strong>Total Bags:</strong> {bags.length}
            </div>
            {passenger.checkedInAt && (
              <div>
                <strong>Checked In At:</strong> {formatDate(passenger.checkedInAt)}
              </div>
            )}
            {passenger.boardedAt && (
              <div>
                <strong>Boarded At:</strong> {formatDate(passenger.boardedAt)}
              </div>
            )}
          </div>

          {passenger.status === 'not-checked-in' && (
            <div className="error-message mt-md">
              Please check in at the airline counter before your flight.
            </div>
          )}
          {passenger.status === 'checked-in' && (
            <div className="success-message mt-md">
              You are checked in! Please proceed to gate {flight.gate} for boarding.
            </div>
          )}
          {passenger.status === 'boarded' && (
            <div className="success-message mt-md">
              You are boarded. Have a pleasant flight!
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-md">Baggage Tracking</h2>
          {bags.length === 0 ? (
            <p className="text-muted">No bags registered for this flight</p>
          ) : (
            <BagTracker bags={bags} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;
