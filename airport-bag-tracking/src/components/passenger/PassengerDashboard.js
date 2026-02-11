import React from 'react';
import { useApp } from '../../context/AppContext';
import { Layout, DataTable } from '../shared';
import './PassengerDashboard.css';

const PassengerDashboard = () => {
  const { currentUser, flights, bags } = useApp();

  // Get passenger's flight info
  const passengerFlight = flights.find(f => f.airlines === currentUser.flight);
  const passengerBags = bags.filter(b => b.ticketNumber === currentUser.ticketNumber);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Not-checked-in': return 'status-not-checked-in';
      case 'Checked-in': return 'status-checked-in';
      case 'Boarded': return 'status-boarded';
      default: return '';
    }
  };

  const getLocationDisplay = (location) => {
    switch (location.type) {
      case 'Check-in':
        return { text: 'At Check-in Counter', icon: '📦', class: 'location-checkin' };
      case 'Security':
        return { text: 'At Security Check', icon: '🔍', class: 'location-security' };
      case 'Gate':
        return { text: `At Gate ${location.terminal}${location.number}`, icon: '🚪', class: 'location-gate' };
      case 'Loaded':
        return { text: 'Loaded on Aircraft', icon: '✈️', class: 'location-loaded' };
      default:
        return { text: 'Unknown', icon: '❓', class: '' };
    }
  };

  const bagColumns = [
    { header: 'Bag ID', accessor: 'bagId' },
    {
      header: 'Current Location',
      render: (row) => {
        const loc = getLocationDisplay(row.location);
        return (
          <span className={`location-badge ${loc.class}`}>
            <span className="location-icon">{loc.icon}</span>
            {loc.text}
          </span>
        );
      }
    },
    {
      header: 'Status',
      render: (row) => {
        const loc = getLocationDisplay(row.location);
        if (loc.class === 'location-loaded') {
          return <span className="progress-complete">Complete</span>;
        }
        return <span className="progress-in-transit">In Transit</span>;
      }
    }
  ];

  return (
    <Layout title="Passenger Portal">
      <div className="passenger-dashboard">
        {/* Passenger Info Card */}
        <div className="card passenger-info-card">
          <h2>Welcome, {currentUser.firstName} {currentUser.lastName}</h2>
          <div className="passenger-details">
            <div className="detail-item">
              <span className="detail-label">Ticket Number:</span>
              <span className="detail-value">{currentUser.ticketNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`status-badge ${getStatusClass(currentUser.status)}`}>
                {currentUser.status}
              </span>
            </div>
          </div>
        </div>

        {/* Flight Info Card */}
        <div className="card flight-info-card">
          <h2>Flight Information</h2>
          {passengerFlight ? (
            <div className="flight-details">
              <div className="flight-main">
                <span className="flight-number">{currentUser.flight}</span>
                <span className="flight-airline">{passengerFlight.airlineName || 'Unknown Airline'}</span>
                <span className="flight-destination">To: {passengerFlight.destination || 'Unknown'}</span>
              </div>
              <div className="flight-gate">
                <span className="gate-label">Gate</span>
                <span className="gate-value">{passengerFlight.gate}</span>
              </div>
              <div className="flight-terminal">
                <span className="terminal-label">Terminal</span>
                <span className="terminal-value">{passengerFlight.gate[0]}</span>
              </div>
            </div>
          ) : (
            <p className="no-data">Flight information not available</p>
          )}
        </div>

        {/* Bag Tracking Card */}
        <div className="card bag-tracking-card">
          <h2>Track Your Bags</h2>
          {passengerBags.length > 0 ? (
            <>
              <div className="bag-progress">
                <div className="progress-step completed">
                  <span className="step-icon">1</span>
                  <span className="step-label">Check-in</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${passengerBags.every(b => b.location.type !== 'Check-in') ? 'completed' : ''}`}>
                  <span className="step-icon">2</span>
                  <span className="step-label">Security</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${passengerBags.every(b => b.location.type === 'Gate' || b.location.type === 'Loaded') ? 'completed' : ''}`}>
                  <span className="step-icon">3</span>
                  <span className="step-label">Gate</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${passengerBags.every(b => b.location.type === 'Loaded') ? 'completed' : ''}`}>
                  <span className="step-icon">4</span>
                  <span className="step-label">Loaded</span>
                </div>
              </div>
              <DataTable
                columns={bagColumns}
                data={passengerBags}
                emptyMessage="No bags checked in"
              />
            </>
          ) : (
            <div className="no-bags">
              <p>You have no bags checked in.</p>
              <p className="hint">Bags will appear here after check-in.</p>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="card quick-info-card">
          <h3>Quick Info</h3>
          <ul className="quick-info-list">
            <li>
              <strong>Total Bags:</strong> {passengerBags.length}
            </li>
            <li>
              <strong>Bags Loaded:</strong> {passengerBags.filter(b => b.location.type === 'Loaded').length}
            </li>
            <li>
              <strong>Bags in Transit:</strong> {passengerBags.filter(b => b.location.type !== 'Loaded').length}
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default PassengerDashboard;
