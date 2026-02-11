import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layout, DataTable, FormInput, MessageBoard } from '../shared';
import { validateGate } from '../../utils/validation';
import './GateStaffDashboard.css';

const GateStaffDashboard = () => {
  const {
    currentUser,
    passengers,
    flights,
    bags,
    boardPassenger,
    notifyFlightReady,
    updateGate,
    addNotification
  } = useApp();

  // Gate selection state
  const [selectedGate, setSelectedGate] = useState(null);
  const [activeTab, setActiveTab] = useState('passengers');
  const [gateChangeData, setGateChangeData] = useState({ newGate: '' });
  const [errors, setErrors] = useState({});

  // Filter flights by airline
  const airlineFlights = flights.filter(f => f.airlines.startsWith(currentUser.airlines));

  // Get selected flight
  const selectedFlight = selectedGate ? flights.find(f => f.gate === selectedGate) : null;

  // Get passengers for selected flight
  const flightPassengers = selectedFlight
    ? passengers.filter(p => p.flight === selectedFlight.airlines)
    : [];

  // Get bags for flight passengers
  const getPassengerBags = (ticketNumber) => bags.filter(b => b.ticketNumber === ticketNumber);

  const handleSelectGate = (gate) => {
    setSelectedGate(gate);
    setActiveTab('passengers');
    addNotification(`Now working at Gate ${gate}`, 'info');
  };

  const handleChangeGate = () => {
    setSelectedGate(null);
  };

  const handleGateChangeInput = (e) => {
    const { name, value } = e.target;
    setGateChangeData(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
    setErrors({});
  };

  const handleGateChangeSubmit = (e) => {
    e.preventDefault();

    if (!validateGate(gateChangeData.newGate)) {
      setErrors({ newGate: 'Gate must be terminal letter + number (e.g., A12)' });
      return;
    }

    // Check if gate is already occupied
    const gateOccupied = flights.find(f => f.gate === gateChangeData.newGate);
    if (gateOccupied) {
      setErrors({ newGate: 'This gate is already occupied by another flight' });
      return;
    }

    updateGate(selectedFlight.airlines, gateChangeData.newGate);
    setSelectedGate(gateChangeData.newGate);
    setGateChangeData({ newGate: '' });
  };

  const handleBoardPassenger = (ticketNumber) => {
    const result = boardPassenger(ticketNumber);
    if (!result.success) {
      addNotification(result.message, 'error');
    }
  };

  const handleNotifyReady = () => {
    const result = notifyFlightReady(selectedFlight.airlines);
    if (!result.success) {
      addNotification(result.message, 'error');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Not-checked-in': return 'status-not-checked-in';
      case 'Checked-in': return 'status-checked-in';
      case 'Boarded': return 'status-boarded';
      default: return '';
    }
  };

  const getFlightStatus = () => {
    if (!selectedFlight) return null;

    const passengerTickets = flightPassengers.map(p => p.ticketNumber);
    const flightBags = bags.filter(b => passengerTickets.includes(b.ticketNumber));

    const totalPassengers = flightPassengers.length;
    const boardedPassengers = flightPassengers.filter(p => p.status === 'Boarded').length;
    const totalBags = flightBags.length;
    const loadedBags = flightBags.filter(b => b.location.type === 'Loaded').length;

    const allBoarded = totalPassengers > 0 && boardedPassengers === totalPassengers;
    const allLoaded = totalBags === 0 || loadedBags === totalBags;
    const isReady = allBoarded && allLoaded && totalPassengers > 0;

    return {
      totalPassengers,
      boardedPassengers,
      totalBags,
      loadedBags,
      allBoarded,
      allLoaded,
      isReady
    };
  };

  // GATE SELECTION SCREEN
  if (!selectedGate) {
    return (
      <Layout title={`Gate Staff - ${currentUser.airlines}`}>
        <div className="gate-selection-screen">
          <div className="card">
            <h2>Select Your Gate</h2>
            <p className="info-text">
              Please select which gate you will be working at. You can only work at one gate at a time.
            </p>

            {airlineFlights.length === 0 ? (
              <div className="no-flights-message">
                <p>No flights available for your airline ({currentUser.airlines}) at this time.</p>
              </div>
            ) : (
              <div className="gate-options">
                {airlineFlights.map(flight => {
                  const flightPax = passengers.filter(p => p.flight === flight.airlines);
                  const boardedCount = flightPax.filter(p => p.status === 'Boarded').length;
                  const paxTickets = flightPax.map(p => p.ticketNumber);
                  const flightBagsList = bags.filter(b => paxTickets.includes(b.ticketNumber));
                  const loadedCount = flightBagsList.filter(b => b.location.type === 'Loaded').length;

                  return (
                    <div
                      key={flight.gate}
                      className="gate-option-card"
                      onClick={() => handleSelectGate(flight.gate)}
                    >
                      <div className="gate-header">
                        <span className="gate-number">Gate {flight.gate}</span>
                        <span className="flight-number">{flight.airlines}</span>
                      </div>
                      <div className="gate-destination">
                        To: {flight.destination || 'Unknown'}
                      </div>
                      <div className="gate-stats">
                        <div className="stat-item">
                          <span className="stat-label">Passengers</span>
                          <span className="stat-value">{boardedCount}/{flightPax.length}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Bags</span>
                          <span className="stat-value">{loadedCount}/{flightBagsList.length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // GATE WORKING VIEW
  const flightStatus = getFlightStatus();
  const tabs = [
    { id: 'passengers', label: `Passengers (${flightPassengers.length})` },
    { id: 'gateChange', label: 'Change Gate' },
    { id: 'messages', label: 'Message Board' }
  ];

  const passengerColumns = [
    { header: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { header: 'Ticket', accessor: 'ticketNumber' },
    { header: 'ID', accessor: 'identification' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`status-badge ${getStatusClass(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Bags at Gate',
      render: (row) => {
        const pBags = getPassengerBags(row.ticketNumber);
        const atGate = pBags.filter(b => b.location.type === 'Gate').length;
        const loaded = pBags.filter(b => b.location.type === 'Loaded').length;
        return `${atGate + loaded}/${pBags.length}`;
      }
    }
  ];

  return (
    <Layout title={`Gate Staff - Gate ${selectedGate}`}>
      <div className="work-location-header">
        <div className="current-location">
          <span className="location-badge location-gate">Gate {selectedGate}</span>
          <button className="btn btn-secondary btn-small" onClick={handleChangeGate}>
            Change Gate
          </button>
        </div>
      </div>

      {/* Flight Info Card */}
      {selectedFlight && (
        <div className="flight-info-card">
          <div className="flight-info-header">
            <h2>Flight {selectedFlight.airlines}</h2>
            <div className="flight-meta">
              <span className="airline-name">{selectedFlight.airlineName || ''}</span>
              <span className="destination">To: {selectedFlight.destination || 'Unknown'}</span>
            </div>
          </div>
          <div className="flight-info-details">
            <div className="info-item">
              <span className="info-label">Gate</span>
              <span className="info-value">{selectedFlight.gate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Passengers</span>
              <span className="info-value">
                {flightStatus.boardedPassengers}/{flightStatus.totalPassengers} boarded
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Bags</span>
              <span className="info-value">
                {flightStatus.loadedBags}/{flightStatus.totalBags} loaded
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className={`info-value ${flightStatus.isReady ? 'ready' : ''}`}>
                {flightStatus.isReady ? 'Ready for Departure' :
                  flightStatus.allBoarded ? 'All Boarded, Loading Bags' : 'Boarding'}
              </span>
            </div>
          </div>
          {flightStatus.isReady && (
            <div className="flight-ready-action">
              <button className="btn btn-success" onClick={handleNotifyReady}>
                Notify Admin - Flight Ready for Departure
              </button>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {activeTab === 'passengers' && (
          <div className="card">
            <h2>Passengers on Flight {selectedFlight?.airlines}</h2>
            <DataTable
              columns={passengerColumns}
              data={flightPassengers}
              emptyMessage="No passengers on this flight"
              actions={(row) => {
                if (row.status === 'Boarded') {
                  return <span className="status-badge status-boarded">Boarded</span>;
                }
                if (row.status !== 'Checked-in') {
                  return <span className="status-badge status-not-checked-in">Not Checked-in</span>;
                }
                const pBags = getPassengerBags(row.ticketNumber);
                const allBagsReady = pBags.every(b => b.location.type === 'Gate');
                return (
                  <button
                    className="btn btn-success btn-small"
                    onClick={() => handleBoardPassenger(row.ticketNumber)}
                    disabled={!allBagsReady && pBags.length > 0}
                    title={!allBagsReady && pBags.length > 0 ? 'Not all bags at gate' : 'Board passenger'}
                  >
                    {!allBagsReady && pBags.length > 0 ? 'Waiting for Bags' : 'Board'}
                  </button>
                );
              }}
            />
          </div>
        )}

        {activeTab === 'gateChange' && (
          <div className="card">
            <h2>Change Gate Assignment</h2>
            <p className="info-text">
              Change the gate for flight {selectedFlight?.airlines}. Ground staff will be notified via message board.
            </p>
            <form onSubmit={handleGateChangeSubmit}>
              <FormInput
                label="New Gate"
                name="newGate"
                value={gateChangeData.newGate}
                onChange={handleGateChangeInput}
                error={errors.newGate}
                placeholder="e.g., B15"
                required
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Update Gate
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'messages' && (
          <MessageBoard
            boardType="gateStaff"
            title="Gate Staff Message Board"
          />
        )}
      </div>
    </Layout>
  );
};

export default GateStaffDashboard;
